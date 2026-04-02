import { prisma } from "@/lib/prisma";
import { ScrapedJob } from "./base";
import { IndeedScraper } from "./indeed";
import { BundesagenturScraper } from "./bundesagentur";
import { JobSource } from "@prisma/client";

export const JOB_KEYWORDS = [
  "Change Manager",
  "Organizational Change Management",
  "Transformation Manager",
  "Change Agent",
  "Head of Transformation",
  "Organisationsentwicklung Change Management",
  "HR Transformation",
  "People Culture Manager",
  "Prozessmanager",
  "Business Process Engineer",
  "Lean Manager",
  "Business Architect",
  "Enterprise Architect",
  "Digital Transformation Consultant",
  "Post-Merger Integration",
  "Restructuring Specialist",
];

export const INDUSTRY_KEYWORDS = [
  "Healthcare",
  "Gesundheit",
  "Energy",
  "Energie",
  "Public Sector",
  "öffentlich",
  "Einzelhandel",
  "Retail",
  "Manufacturing",
  "Industrie",
];

export async function runAllScrapers(
  keywords: string[] = JOB_KEYWORDS,
  maxPages = 2
) {
  const run = await prisma.scraperRun.create({
    data: {
      source: JobSource.OTHER,
      status: "running",
    },
  });

  const scrapers = [
    new BundesagenturScraper(),
    new IndeedScraper(),
    // Additional scrapers would be added here
  ];

  let totalNew = 0;
  let totalFound = 0;

  for (const scraper of scrapers) {
    try {
      const jobs = await scraper.scrape(keywords, INDUSTRY_KEYWORDS, maxPages);
      totalFound += jobs.length;

      for (const job of jobs) {
        const saved = await upsertJob(job);
        if (saved.isNew) totalNew++;
      }

      await prisma.scraperRun.create({
        data: {
          source: scraper.source,
          jobsFound: jobs.length,
          jobsNew: totalNew,
          status: "success",
          finishedAt: new Date(),
        },
      });
    } catch (e: any) {
      console.error(`Scraper error for ${scraper.source}:`, e);
      await prisma.scraperRun.create({
        data: {
          source: scraper.source,
          status: "error",
          errorMsg: e.message,
          finishedAt: new Date(),
        },
      });
    }
  }

  await prisma.scraperRun.update({
    where: { id: run.id },
    data: {
      status: "success",
      jobsFound: totalFound,
      jobsNew: totalNew,
      finishedAt: new Date(),
    },
  });

  return { totalFound, totalNew };
}

async function upsertJob(job: ScrapedJob): Promise<{ isNew: boolean }> {
  if (job.externalId) {
    const existing = await prisma.job.findUnique({
      where: { externalId: job.externalId },
    });
    if (existing) return { isNew: false };
  }

  await prisma.job.create({
    data: {
      externalId: job.externalId,
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      url: job.url,
      source: job.source,
      phone: job.phone,
      email: job.email,
      postedAt: job.postedAt,
    },
  });

  return { isNew: true };
}
