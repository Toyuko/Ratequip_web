"use server";

import { sendTransactionalEmail } from "@/lib/email";

export async function moderateEntity(input: {
  entityType: "review" | "claim";
  entityId: string;
  decision: "approved" | "rejected";
}) {
  await sendTransactionalEmail({
    to: "ops@ratequip.com",
    subject: `Moderation ${input.decision}: ${input.entityType}`,
    html: `<p>${input.entityType} ${input.entityId} was ${input.decision}.</p>`,
  });

  return {
    ok: true,
    message: `${input.entityType} ${input.entityId} marked ${input.decision}. Audit event recorded (demo).`,
  };
}
