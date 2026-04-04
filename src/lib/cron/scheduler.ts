import cron from "node-cron";
import { runAllScrapers } from "@/lib/scrapers/orchestrator";
import { sendNewJobsNotification } from "@/lib/email/notifications";
import { prisma } from "@/lib/prisma";

interface CronJobRow {
  title: string;
  company: string;
  matchScore: number | null;
  url: string;
  industry: string | null;
}

export function startCronJobs() {
  console.log("[CRON] Initializing scheduler...");

  // Daily at 7:00 AM — scan all job portals
  cron.schedule("0 7 * * *", async () => {
    console.log("[CRON] Starting daily job scan...");
    try {
      const { totalNew } = await runAllScrapers();

      if (totalNew > 0) {
        const newJobs: CronJobRow[] = await prisma.job.findMany({
          where: { createdAt: { gte: new Date(Date.now() - 86400000) } },
          orderBy: { matchScore: "desc" },
          take: 20,
          select: {
            title: true,
            company: true,
            matchScore: true,
            url: true,
            industry: true,
          },
        });

        await sendNewJobsNotification(
          newJobs.map((j: CronJobRow) => ({
            title: j.title,
            company: j.company,
            score: j.matchScore ?? 0,
            url: j.url,
            industry: j.industry ?? undefined,
          }))
        );
      }
    } catch (error) {
      console.error("[CRON] Daily scan error:", error);
    }
  });

  // Monday at 8:00 AM — weekly report
  cron.schedule("0 8 * * 1", async () => {
    console.log("[CRON] Starting weekly report...");
    // Weekly statistics
  });

  // Daily at 9:00 AM — remind pending calls
  cron.schedule("0 9 * * *", async () => {
    const pendingCalls = await prisma.job.findMany({
      where: { status: "CALL_PENDING" },
      take: 10,
    });
    if (pendingCalls.length > 0) {
      console.log(`[CRON] ${pendingCalls.length} pending calls to remind`);
    }
  });

  console.log("[CRON] Scheduler started successfully");
}

// Only start cron in production with explicit flag
if (process.env.ENABLE_CRON === "true") {
  startCronJobs();
}
