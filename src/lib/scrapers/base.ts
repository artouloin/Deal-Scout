import { Browser, chromium } from "playwright";
import { JobSource } from "@prisma/client";

export interface ScrapedJob {
  externalId?: string;
  title: string;
  company: string;
  location?: string;
  description: string;
  url: string;
  source: JobSource;
  phone?: string;
  email?: string;
  postedAt?: Date;
  expiresAt?: Date;
}

export abstract class BaseScraper {
  protected browser: Browser | null = null;
  abstract source: JobSource;

  async init() {
    this.browser = await chromium.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      ],
    });
  }

  async close() {
    await this.browser?.close();
  }

  abstract scrape(
    keywords: string[],
    industries: string[],
    maxPages?: number
  ): Promise<ScrapedJob[]>;

  protected extractPhone(text: string): string | undefined {
    const match = text.match(/(\+49|0)[0-9\s\-\/]{7,20}/);
    return match?.[0]?.replace(/\s/g, "").trim();
  }

  protected extractEmail(text: string): string | undefined {
    const match = text.match(
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    );
    return match?.[0];
  }

  protected async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
