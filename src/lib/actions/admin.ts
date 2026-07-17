"use server";

import { cookies } from "next/headers";
import { persistModeration } from "@/lib/db/phase2";
import { sendTransactionalEmail } from "@/lib/email";

export async function moderateEntity(input: {
  entityType: "review" | "claim";
  entityId: string;
  decision: "approved" | "rejected";
}) {
  const jar = await cookies();
  const actor = jar.get("rq_email")?.value ?? "admin@ratequip.com";

  const result = await persistModeration({
    ...input,
    actor,
  });

  if (result.ok) {
    await sendTransactionalEmail({
      to: "ops@ratequip.com",
      subject: `Moderation ${input.decision}: ${input.entityType}`,
      html: `<p>${input.entityType} ${input.entityId} was ${input.decision}.</p>`,
    });
  }

  return result;
}
