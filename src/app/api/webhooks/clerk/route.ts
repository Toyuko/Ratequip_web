import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { upsertClerkUser } from "@/lib/db/phase2";

type ClerkWebhookEvent = {
  type: string;
  data: {
    id: string;
    email_addresses?: { email_address: string }[];
    first_name?: string | null;
    last_name?: string | null;
    image_url?: string;
    deleted?: boolean;
  };
};

export async function POST(req: NextRequest) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({
      ok: true,
      demo: true,
      message: "Clerk webhook accepted in demo mode.",
    });
  }

  const payload = await req.text();
  const svixId = req.headers.get("svix-id");
  const svixTimestamp = req.headers.get("svix-timestamp");
  const svixSignature = req.headers.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const wh = new Webhook(secret);
  let event: ClerkWebhookEvent;
  try {
    event = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as ClerkWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const email =
      event.data.email_addresses?.[0]?.email_address ??
      `${event.data.id}@users.clerk`;
    const fullName = [event.data.first_name, event.data.last_name]
      .filter(Boolean)
      .join(" ");
    await upsertClerkUser({
      clerkUserId: event.data.id,
      email,
      fullName: fullName || undefined,
      avatarUrl: event.data.image_url,
    });
  }

  return NextResponse.json({ received: true, type: event.type });
}
