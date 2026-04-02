import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

export class LinkedInScraper extends BaseScraper {
  source = JobSource.LINKEDIN;

  async scrape(keywords: string[], _industries: string[]): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    // LinkedIn requires authentication and sophisticated anti-bot measures
    // Fallback: Use LinkedIn RSS or official API when available
    // For now, return empty to avoid blocking
    console.warn("[LinkedIn] Requires authentication - skipping for now");

    return jobs;
  }
}
