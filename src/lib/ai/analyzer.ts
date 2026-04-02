import { anthropic } from "@/lib/claude";
import { Job } from "@prisma/client";

export interface MatchResult {
  score: number;
  breakdown: {
    titleMatch: number;
    industryMatch: number;
    contractType: number;
    keywordMatch: number;
  };
  contractType: "PERMANENT" | "TEMPORARY" | "FREELANCE" | "CONSULTING" | "UNKNOWN";
  isTemporary: boolean;
  hasPermanentPotential: boolean;
  industry: string | null;
  extractedPhone: string | null;
  summary: string;
}

const GCG_PROFILE = `
GCG ist eine Unternehmensberatung spezialisiert auf:
- Transformationsberatung & Change Management
- Projekt- und Programmmanagement
- Prozessdigitalisierung & -automatisierung
- Business Engineering
- Fördermittel- & Ausschreibungsberatung
- Merger & Acquisition / Post-Merger-Integration

Kernbranchen: Public Sector, Energy, Healthcare, Retail, Manufacturing
Besonderheit: GCG sucht KEINE Festanstellungen, sondern Beratermandate (extern)
oder zeitlich befristete Projekteinsätze.
`;

export async function analyzeJob(job: Partial<Job>): Promise<MatchResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [
      {
        role: "user",
        content: `Du analysierst eine Stellenanzeige für GCG Unternehmensberatung.

GCG-Profil:
${GCG_PROFILE}

Stellenanzeige:
Titel: ${job.title}
Unternehmen: ${job.company}
Beschreibung: ${job.description?.slice(0, 3000) || ""}

Antworte NUR mit valides JSON (kein Markdown, keine Erklärungen):
{
  "score": <Gesamtscore 0-100>,
  "breakdown": {
    "titleMatch": <0-30>,
    "industryMatch": <0-30>,
    "contractType": <0-20>,
    "keywordMatch": <0-20>
  },
  "contractType": "<PERMANENT|TEMPORARY|FREELANCE|CONSULTING|UNKNOWN>",
  "isTemporary": <true|false>,
  "hasPermanentPotential": <true|false>,
  "industry": "<Healthcare|Energy|Public Sector|Retail|Manufacturing|Finance|IT_TECH|Other|null>",
  "extractedPhone": "<Telefonnummer oder null>",
  "summary": "<2-Satz-Zusammenfassung>"
}`,
      },
    ],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const clean = text.replace(/```json|```/g, "").trim();

  try {
    const result = JSON.parse(clean) as MatchResult;
    return result;
  } catch (e) {
    console.error("Failed to parse Claude response:", clean);
    return {
      score: 0,
      breakdown: { titleMatch: 0, industryMatch: 0, contractType: 0, keywordMatch: 0 },
      contractType: "UNKNOWN",
      isTemporary: false,
      hasPermanentPotential: false,
      industry: null,
      extractedPhone: null,
      summary: "Analyse fehlgeschlagen",
    };
  }
}

export async function generateCoverLetter(
  job: Partial<Job>,
  matchResult: MatchResult,
  additionalContext?: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `Du bist Senior Consultant bei GCG Unternehmensberatung und schreibst ein professionelles Anschreiben an einen potenziellen Auftraggeber.

GCG-Profil:
${GCG_PROFILE}

Zielstelle:
Titel: ${job.title}
Unternehmen: ${job.company}
Standort: ${job.location || "Nicht angegeben"}
Beschreibung: ${job.description?.slice(0, 2000) || ""}

Matching-Score: ${matchResult.score}/100
Relevante Branche: ${matchResult.industry}

${additionalContext ? `Zusätzlicher Kontext: ${additionalContext}` : ""}

Schreibe ein professionelles Geschäftsanschreiben auf Deutsch:
- Ton: Professionell, direkt, beratend, auf Augenhöhe
- Struktur: Betreff → Einleitung → Kompetenzmatch → Referenzen → CTA
- Länge: 300-400 Wörter
- KONKRET auf die Anforderungen eingehen
- Unterschrift: GCG Unternehmensberatung | +49 721 9454991-0 | info@gcg-consulting.de`,
      },
    ],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}
