/**
 * Verify Resend transactional email is configured and can send.
 *
 * Usage:
 *   npm run email:test
 *   npm run email:test -- you@example.com
 *
 * Without a verified domain, Resend only delivers to the account owner's
 * email when using onboarding@resend.dev as the from address.
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { Resend } from "resend";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const apiKey = process.env.RESEND_API_KEY?.trim();
const from =
  process.env.RESEND_FROM_EMAIL?.trim() ||
  "RateQuip <onboarding@resend.dev>";
const to =
  process.argv[2]?.trim() ||
  process.env.OPS_EMAIL?.trim() ||
  process.env.EMAIL_TEST_TO?.trim();

async function main() {
  console.log("RateQuip email setup check");
  console.log("--------------------------");
  console.log(`RESEND_API_KEY: ${apiKey ? "set" : "MISSING"}`);
  console.log(`RESEND_FROM_EMAIL: ${from}`);
  console.log(`OPS_EMAIL: ${process.env.OPS_EMAIL?.trim() || "(default ops@ratequip.com)"}`);
  console.log(`NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL ?? "(unset)"}`);

  if (!apiKey) {
    console.error("\nFAIL: RESEND_API_KEY is not set in .env.local / environment.");
    console.error("1) Create a key at https://resend.com/api-keys");
    console.error("2) Add RESEND_API_KEY=re_... to .env.local");
    console.error("3) Also add it to Vercel (Production + Preview + Development)");
    process.exit(1);
  }

  if (!to) {
    console.error("\nFAIL: Pass a recipient email, e.g. npm run email:test -- you@example.com");
    process.exit(1);
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "RateQuip email test",
    html: `
      <div style="font-family:Montserrat,Arial,sans-serif;color:#0f172a;line-height:1.5">
        <p>This is a RateQuip transactional email test.</p>
        <p>If you received this, Resend is configured correctly.</p>
        <p style="color:#64748b;font-size:12px">Sent at ${new Date().toISOString()}</p>
      </div>
    `.trim(),
    tags: [{ name: "category", value: "email_test" }],
  });

  if (error) {
    console.error("\nFAIL: Resend rejected the send.");
    console.error(error);
    console.error("\nCommon fixes:");
    console.error("- Verify your domain at https://resend.com/domains");
    console.error("- Use a from address on that verified domain");
    console.error("- For first tests, set RESEND_FROM_EMAIL='RateQuip <onboarding@resend.dev>' and send only to your Resend account email");
    process.exit(1);
  }

  console.log(`\nOK: email queued. id=${data?.id}`);
  console.log(`To: ${to}`);
  console.log("Check the inbox (and spam), plus https://resend.com/emails");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
