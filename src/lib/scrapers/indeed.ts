import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

export class IndeedScraper extends BaseScraper {
  source = JobSource.INDEED;

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
          `https://de.indeed.com/jobs?q=${query}&l=Deutschland&sort=date`,
          { waitUntil: "domcontentloaded", timeout: 30000 }
        );

        for (let p = 0; p < maxPages; p++) {
          const jobCards = await page.$$("[data-jk]");

          for (const card of jobCards.slice(0, 10)) {
            try {
              const title = await card.$eval(
                "h2.jobTitle span",
                (el) => el.textContent?.trim() ?? ""
              );
              const company = await card
                .$eval(
                  "[data-testid='company-name']",
                  (el) => el.textContent?.trim() ?? ""
                )
                .catch(() => "");
              const location = await card
                .$eval(
                  "[data-testid='text-location']",
                  (el) => el.textContent?.trim()
                )
                .catch(() => undefined);

              const jobId = await card.getAttribute("data-jk");
              const url = `https://de.indeed.com/viewjob?jk=${jobId}`;

              // Load job details
              const detailPage = await this.browser!.newPage();
              await detailPage.goto(url, { timeout: 20000 });
              const description = await detailPage
                .$eval("#jobDescriptionText", (el) => el.textContent ?? "")
                .catch(() => "");
              await detailPage.close();

              if (title && company) {
                jobs.push({
                  externalId: `indeed_${jobId}`,
                  title,
                  company,
                  location,
                  description,
                  url,
                  source: this.source,
                  phone: this.extractPhone(description),
                  email: this.extractEmail(description),
                });
              }
              await this.delay(1500);
            } catch (e) {
              console.error("Error parsing job card:", e);
            }
          }

          // Next page
          const nextBtn = await page.$('a[aria-label="Weiter"]');
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
