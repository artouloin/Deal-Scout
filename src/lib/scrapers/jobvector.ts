import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

export class JobVectorScraper extends BaseScraper {
  source = JobSource.JOBVECTOR;

  async scrape(keywords: string[]): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const keyword of keywords.slice(0, 3)) {
      try {
        const response = await fetch(
          `https://www.jobvector.de/api/search/jobs?q=${encodeURIComponent(keyword)}&location=Deutschland&limit=25`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );

        if (!response.ok) continue;
        const data = (await response.json()) as any;

        for (const item of data.results ?? []) {
          jobs.push({
            externalId: `jobvector_${item.id}`,
            title: item.title,
            company: item.company,
            location: item.location,
            description: item.description ?? "",
            url: item.url,
            source: this.source,
            postedAt: item.posted_at
              ? new Date(item.posted_at)
              : undefined,
          });
        }

        await this.delay(500);
      } catch (e) {
        console.error("JobVector scraper error:", e);
      }
    }

    return jobs;
  }
}
