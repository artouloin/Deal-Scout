import { NextResponse } from "next/server";
import { runAllScrapers } from "@/lib/scrapers/orchestrator";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { sendNewJobsNotification } from "@/lib/email/notifications";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Run scraper in background
  runAllScrapers().then(async ({ totalNew, totalFound }) => {
    console.log(`Scraper completed: ${totalFound} found, ${totalNew} new`);

    if (totalNew > 0) {
      // Get newest jobs
      const newJobs = await prisma.job.findMany({
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
        newJobs.map((j) => ({
          title: j.title,
          company: j.company,
          score: j.matchScore ?? 0,
          url: j.url,
          industry: j.industry ?? undefined,
        }))
      );
    }
  });

  return NextResponse.json({
    message: "Scraper started",
    status: "running",
  });
}
