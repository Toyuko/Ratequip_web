import { Resend } from "resend";

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.info("[demo-email]", opts.to, opts.subject);
    return { id: "demo-email", demo: true as const };
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.RESEND_FROM_EMAIL ?? "RateQuip <noreply@ratequip.com>";
  const result = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
  return { ...result, demo: false as const };
}
