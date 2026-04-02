import { anthropic } from "@/lib/claude";
import { Job } from "@prisma/client";

// Fallback scoring when Claude API is unavailable
function fallbackAnalyzeJob(job: Partial<Job>): MatchResult {
  const keywords = [
    "change",
    "transformation",
    "project",
    "management",
    "digital",
    "process",
    "manager",
    "consultant",
  ];

  const titleMatch = keywords.some((k) =>
    job.title?.toLowerCase().includes(k)
  )
    ? 20
    : 10;

  const gcgIndustries = [
    "healthcare",
    "energy",
    "public sector",
    "retail",
    "manufacturing",
  ];
  const industryMatch = gcgIndustries.some((i) =>
    job.description?.toLowerCase().includes(i)
  )
    ? 25
    : 10;

  const isTemporaryMatch = job.description?.toLowerCase().includes("befristet")
    ? 15
    : job.description?.toLowerCase().includes("projekt")
      ? 15
      : 5;

  const keywordScore = Math.min(20, keywords.filter((k) =>
    job.description?.toLowerCase().includes(k)
  ).length * 4);

  const total = Math.min(100, titleMatch + industryMatch + isTemporaryMatch + keywordScore);

  return {
    score: total,
    breakdown: {
      titleMatch,
      industryMatch,
      contractType: isTemporaryMatch,
      keywordMatch: keywordScore,
    },
    contractType: job.description?.toLowerCase().includes("befristet")
      ? "TEMPORARY"
      : "PERMANENT",
    isTemporary:
      job.description?.toLowerCase().includes("befristet") ?? false,
    hasPermanentPotential: true,
    industry: job.description?.toLowerCase().includes("health")
      ? "HEALTHCARE"
      : job.description?.toLowerCase().includes("energy")
        ? "ENERGY"
        : null,
    extractedPhone: job.phone ?? null,
    summary: `Job basierend auf Schlüsselworten bewertet (${total}% Match)`,
  };
}

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
  // Use fallback if Claude API key is not configured
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "sk-ant-...") {
    console.log("[FALLBACK] Using keyword-based analysis (no Claude API key)");
    return fallbackAnalyzeJob(job);
  }

  try {
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
      console.error("Failed to parse Claude response, falling back:", clean);
      return fallbackAnalyzeJob(job);
    }
  } catch (error) {
    console.warn("Claude API error, using fallback:", error);
    return fallbackAnalyzeJob(job);
  }
}

export async function generateCoverLetter(
  job: Partial<Job>,
  matchResult: MatchResult,
  additionalContext?: string
): Promise<string> {
  // Fallback template if Claude API is not configured
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === "sk-ant-...") {
    console.log("[FALLBACK] Using template-based cover letter (no Claude API key)");
    return `Betreff: Beratungsanfrage: ${job.title}

Sehr geehrte Damen und Herren,

vielen Dank für Ihre ausgeschriebene Position "${job.title}" bei ${job.company}. Wir von GCG Unternehmensberatung sehen eine ausgezeichnete Übereinstimmung zwischen Ihren Anforderungen und unserem Leistungsportfolio (Match-Score: ${matchResult.score}%).

GCG ist spezialisiert auf Transformationsberatung, Change Management und Business Engineering. Wir verfügen über umfangreiche Erfahrung in den Branchen ${matchResult.industry || "diverser Industrien"} und haben zahlreiche erfolgreiche Projekte abgeschlossen.

Wir möchten Sie einladen, ein unverbindliches Gespräch zu führen, um die Möglichkeiten einer Zusammenarbeit zu erörtern. Gerne unterstützen wir Sie mit einem externen Beratermandat oder zeitlich befristeten Projektteam.

Weitere Informationen zu unseren Leistungen und Referenzen finden Sie gerne in unserem beigelegten Profil.

Wir freuen uns auf Ihre Rückmeldung und stehen Ihnen für Fragen zur Verfügung.

Mit freundlichen Grüßen,

GCG Unternehmensberatung
Telefon: +49 721 9454991-0
E-Mail: info@gcg-consulting.de
www.gcg-consulting.de`;
  }

  try {
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
  } catch (error) {
    console.warn("Claude API error for cover letter, using template fallback:", error);
    return generateCoverLetter(job, matchResult, additionalContext); // Recursively use fallback
  }
}
