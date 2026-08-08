import { Resend } from "resend";

export type SendEmailResult =
  | { ok: true; id: string; demo: boolean }
  | { ok: false; error: string; demo: boolean };

export function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export function opsEmail() {
  return process.env.OPS_EMAIL?.trim() || "ops@ratequip.com";
}

export function looksLikeEmail(value: string | null | undefined): value is string {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}): Promise<SendEmailResult> {
  const to = opts.to.trim();
  if (!looksLikeEmail(to)) {
    const error = `Invalid recipient: ${opts.to}`;
    console.warn("[email]", error);
    return { ok: false, error, demo: !isEmailConfigured() };
  }

  if (!isEmailConfigured()) {
    console.info("[demo-email]", to, opts.subject);
    return { ok: true, id: "demo-email", demo: true };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "RateQuip <noreply@ratequip.com>";

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
      tags: opts.tags,
    });

    if (error) {
      console.error("[email] Resend error", { to, subject: opts.subject, error });
      return { ok: false, error: error.message, demo: false };
    }

    return { ok: true, id: data?.id ?? "unknown", demo: false };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown email send failure";
    console.error("[email] Resend network failure", { to, subject: opts.subject, message });
    return { ok: false, error: message, demo: false };
  }
}
