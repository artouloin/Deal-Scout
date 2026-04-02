import { transporter } from "./transporter";

interface SendCoverLetterOptions {
  to: string;
  subject: string;
  content: string;
  profileBuffer?: Buffer;
  profileFileName?: string;
}

export async function sendCoverLetter(options: SendCoverLetterOptions) {
  const attachments = options.profileBuffer
    ? [
        {
          filename: options.profileFileName ?? "GCG_Beraterprofil.pdf",
          content: options.profileBuffer,
          contentType: "application/pdf",
        },
      ]
    : [];

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.content,
    html: `<pre style="font-family: Arial, sans-serif; white-space: pre-wrap; line-height: 1.6;">${options.content}</pre>`,
    attachments,
  });
}
