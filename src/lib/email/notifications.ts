import { transporter } from "./transporter";

export interface NewJobNotification {
  title: string;
  company: string;
  score: number;
  url: string;
  industry?: string;
}

export async function sendNewJobsNotification(newJobs: NewJobNotification[]) {
  const recipients = process.env.NOTIFY_EMAILS?.split(",") ?? [];
  if (!recipients.length || !newJobs.length) return;

  const topJobs = newJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const jobsHtml = topJobs
    .map(
      (j) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px; text-align: left;">
        <strong style="color: #1a1a2e;">${j.title}</strong><br/>
        <span style="color: #6b7280; font-size: 14px;">${j.company}</span>
      </td>
      <td style="padding: 12px; text-align: center;">
        <span style="background: ${
          j.score >= 70
            ? "#dcfce7"
            : j.score >= 40
            ? "#fef3c7"
            : "#fee2e2"
        }; color: ${
        j.score >= 70
          ? "#166534"
          : j.score >= 40
          ? "#92400e"
          : "#991b1b"
      }; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
          ${j.score}%
        </span>
      </td>
      <td style="padding: 12px;">
        <a href="${j.url}" style="color: #2563eb; text-decoration: none;">Zur Stelle →</a>
      </td>
    </tr>`
    )
    .join("");

  const html = `
    <table style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <tr>
        <td style="padding: 20px 0;">
          <h2 style="color: #1a1a2e; margin: 0;">GCG Deal Scout</h2>
          <p style="color: #6b7280; margin: 8px 0 0 0;">${newJobs.length} neue Stellenangebote gefunden</p>
        </td>
      </tr>
      <tr>
        <td>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 12px; text-align: left; color: #1a1a2e;">Position</th>
                <th style="padding: 12px; color: #1a1a2e;">Match</th>
                <th style="padding: 12px; color: #1a1a2e;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${jobsHtml}
            </tbody>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs"
             style="display: inline-block; background: #2563eb; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold;">
            Im Dashboard öffnen
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding-top: 20px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px;">
          GCG Deal Scout · Automatische Benachrichtigung
        </td>
      </tr>
    </table>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: recipients.join(","),
    subject: `[GCG Deal Scout] ${newJobs.length} neue relevante Stellen`,
    html,
  });
}
