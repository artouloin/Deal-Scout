import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

export class StepStoneScraper extends BaseScraper {
  source = JobSource.STEPSTONE;

  async scrape(
    keywords: string[],
    _industries: string[],
    maxPages = 2
  ): Promise<ScrapedJob[]> {
    await this.init();
    const jobs: ScrapedJob[] = [];

    for (const keyword of keywords.slice(0, 3)) {
      const page = await this.browser!.newPage();
      try {
        const query = encodeURIComponent(keyword);
        await page.goto(
          `https://www.stepstone.de/jobs?q=${query}&l=Deutschland`,
          { waitUntil: "domcontentloaded", timeout: 30000 }
        );

        for (let p = 0; p < maxPages; p++) {
          const jobCards = await page.$$("div[data-job-id]");

          for (const card of jobCards.slice(0, 10)) {
            try {
              const title = await card
                .$eval("h2, h3", (el) => el.textContent?.trim() ?? "")
                .catch(() => "");
              const company = await card
                .$eval("[data-company]", (el) => el.textContent?.trim() ?? "")
                .catch(() => "");
              const location = await card
                .$eval(
                  "[data-location], .location",
                  (el) => el.textContent?.trim()
                )
                .catch(() => undefined);
              const jobUrl = await card
                .$eval("a", (el) => el.getAttribute("href") ?? "")
                .catch(() => "");
              const url = jobUrl.startsWith("http")
                ? jobUrl
                : `https://www.stepstone.de${jobUrl}`;

              const jobId = await card.getAttribute("data-job-id");

              if (title && company) {
                jobs.push({
                  externalId: `stepstone_${jobId}`,
                  title,
                  company,
                  location,
                  description: "",
                  url,
                  source: this.source,
                });
              }
              await this.delay(1000);
            } catch (e) {
              console.error("StepStone card parse error:", e);
            }
          }

          const nextBtn = await page.$("a[rel='next']");
          if (!nextBtn) break;
          await nextBtn.click();
          await page.waitForLoadState("domcontentloaded");
          await this.delay(2000);
        }
      } finally {
        await page.close();
      }
    }

    await this.close();
    return jobs;
  }
}
