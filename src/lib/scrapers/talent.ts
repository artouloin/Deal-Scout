import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

export class TalentComScraper extends BaseScraper {
  source = JobSource.TALENT_COM;

  async scrape(keywords: string[]): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const keyword of keywords.slice(0, 2)) {
      try {
        const response = await fetch(
          `https://www.talent.com/api/v1/search?keywords=${encodeURIComponent(keyword)}&location=Germany&limit=25`,
          { headers: { "User-Agent": "Mozilla/5.0" } }
        );

        if (!response.ok) continue;
        const data = (await response.json()) as any;

        for (const item of data.data ?? []) {
          jobs.push({
            externalId: `talent_${item.id}`,
            title: item.job_title,
            company: item.company_name,
            location: item.location,
            description: item.description ?? "",
            url: item.job_url,
            source: this.source,
          });
        }

        await this.delay(500);
      } catch (e) {
        console.error("Talent.com scraper error:", e);
      }
    }

    return jobs;
  }
}
