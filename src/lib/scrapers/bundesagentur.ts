import { BaseScraper, ScrapedJob } from "./base";
import { JobSource } from "@prisma/client";

/**
 * Bundesagentur für Arbeit — Offizielle REST-API
 * Docs: https://jobsuche.api.bund.dev/
 */
export class BundesagenturScraper extends BaseScraper {
  source = JobSource.BUNDESAGENTUR;

  async scrape(keywords: string[]): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];

    for (const keyword of keywords.slice(0, 5)) {
      try {
        const response = await fetch(
          `https://rest.arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?` +
            new URLSearchParams({
              was: keyword,
              wo: "Deutschland",
              umkreis: "200",
              angebotsart: "1",
              veroeffentlichtseit: "7",
              size: "25",
            }).toString(),
          {
            headers: {
              "X-API-Key": "jobboerse-jobsuche",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          console.error(`Bundesagentur API error: ${response.status}`);
          continue;
        }

        const data = (await response.json()) as any;

        for (const item of data.stellenangebote ?? []) {
          jobs.push({
            externalId: `bundesagentur_${item.refnr}`,
            title: item.titel,
            company: item.arbeitgeber ?? "Unbekannt",
            location: item.arbeitsort?.ort,
            description: item.stellenbeschreibung ?? "",
            url: `https://www.arbeitsagentur.de/jobsuche/jobdetail/${item.refnr}`,
            source: this.source,
            postedAt: item.eintrittsdatum
              ? new Date(item.eintrittsdatum)
              : undefined,
          });
        }

        await this.delay(500); // Be respectful to the API
      } catch (e) {
        console.error("Bundesagentur scraper error:", e);
      }
    }

    return jobs;
  }
}
