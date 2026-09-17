import { logger } from "@/lib/logger";

/**
 * Minimal transactional email sender via Resend's HTTP API (no SMTP library
 * needed — nodemailer currently carries several unpatched high-severity
 * advisories, so a plain authenticated fetch to a provider is the safer
 * choice here). Falls back to a structured log line if RESEND_API_KEY isn't
 * configured, so the app works without it and this is opt-in.
 */
export async function sendEmail(params: { to: string; subject: string; text: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Prompt Library <no-reply@algoanalytics.com>";

  if (!apiKey) {
    logger.info({ to: params.to, subject: params.subject }, "email: RESEND_API_KEY not set, skipping send");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: params.to, subject: params.subject, text: params.text }),
    });

    if (!res.ok) {
      logger.error({ status: res.status, to: params.to }, "email: send failed");
    }
  } catch (err) {
    logger.error({ err, to: params.to }, "email: send threw");
  }
}
