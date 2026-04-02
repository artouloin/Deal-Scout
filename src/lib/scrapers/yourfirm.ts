import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

export class YourFirmScraper extends BaseScraper {
  source = JobSource.YOURFIRM;

  async scrape(keywords: string[]): Promise<ScrapedJob[]> {
    await this.init();
    const jobs: ScrapedJob[] = [];

    for (const keyword of keywords.slice(0, 2)) {
      const page = await this.browser!.newPage();
      try {
        const query = keyword.replace(/\s+/g, "-").toLowerCase();
        await page.goto(
          `https://www.yourfirm.de/stellenangebote/q-${query}/`,
          { waitUntil: "domcontentloaded", timeout: 30000 }
        );

        const jobCards = await page.$$(".job-item, [data-job]");

        for (const card of jobCards.slice(0, 15)) {
          try {
            const title = await card
              .$eval(".job-title, h2, h3", (el) =>
                el.textContent?.trim() ?? ""
              )
              .catch(() => "");
            const company = await card
              .$eval(".company-name, [data-company]", (el) =>
                el.textContent?.trim() ?? ""
              )
              .catch(() => "");
            const location = await card
              .$eval(".location", (el) => el.textContent?.trim())
              .catch(() => undefined);
            const jobUrl = await card
              .$eval("a", (el) => el.getAttribute("href") ?? "")
              .catch(() => "");

            if (title && company) {
              jobs.push({
                externalId: `yourfirm_${title}_${company}`.slice(0, 50),
                title,
                company,
                location,
                description: "",
                url: jobUrl.startsWith("http")
                  ? jobUrl
                  : `https://yourfirm.de${jobUrl}`,
                source: this.source,
              });
            }
            await this.delay(800);
          } catch (e) {
            console.error("Yourfirm card parse error:", e);
          }
        }
      } finally {
        await page.close();
      }
    }

    await this.close();
    return jobs;
  }
}
