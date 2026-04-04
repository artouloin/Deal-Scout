import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT ?? "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection only when SMTP is configured
if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter.verify((error: Error | null, success?: true) => {
    if (error) {
      console.error("SMTP connection error:", error);
    } else if (success) {
      console.log("SMTP connection ready");
    }
  });
}
