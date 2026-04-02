import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

export class XingScraper extends BaseScraper {
  source = JobSource.XING;

  async scrape(
    keywords: string[],
    _industries: string[],
    maxPages = 2
  ): Promise<ScrapedJob[]> {
    await this.init();
    const jobs: ScrapedJob[] = [];

    for (const keyword of keywords.slice(0, 2)) {
      const page = await this.browser!.newPage();
      try {
        const query = encodeURIComponent(keyword);
        await page.goto(
          `https://www.xing.com/jobs/search?keywords=${query}&location=Deutschland`,
          { waitUntil: "domcontentloaded", timeout: 30000 }
        );

        for (let p = 0; p < maxPages; p++) {
          const jobCards = await page.$$("[data-id^='job_']");

          for (const card of jobCards.slice(0, 10)) {
            try {
              const title = await card
                .$eval("h2, h3", (el) => el.textContent?.trim() ?? "")
                .catch(() => "");
              const company = await card
                .$eval(".company", (el) => el.textContent?.trim() ?? "")
                .catch(() => "");
              const location = await card
                .$eval(".location", (el) => el.textContent?.trim())
                .catch(() => undefined);
              const jobUrl = await card
                .$eval("a", (el) => el.getAttribute("href") ?? "")
                .catch(() => "");

              if (title && company) {
                jobs.push({
                  externalId: `xing_${title}_${company}`.slice(0, 50),
                  title,
                  company,
                  location,
                  description: "",
                  url: jobUrl.startsWith("http") ? jobUrl : `https://xing.com${jobUrl}`,
                  source: this.source,
                });
              }
              await this.delay(1000);
            } catch (e) {
              console.error("XING card parse error:", e);
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
