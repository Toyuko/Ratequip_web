"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { hasClerk } from "@/lib/config";
import { persistOnboarding } from "@/lib/db/phase2";
import { slugify } from "@/lib/utils";

export async function completeOnboarding(input: {
  role: "buyer" | "supplier" | "contractor";
  orgName: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
}) {
  const orgName = input.orgName.trim();
  const email = input.email.trim();
  const contactName = input.contactName.trim();

  if (!orgName || !email || !contactName) {
    return {
      message: "Organisation name, contact name, and email are required.",
      redirectTo: "/onboarding",
    };
  }

  let clerkUserId: string | null = null;
  if (hasClerk()) {
    try {
      const session = await auth();
      clerkUserId = session.userId;
    } catch {
      clerkUserId = null;
    }
  }

  const result = await persistOnboarding({
    clerkUserId,
    role: input.role,
    orgName,
    email,
    contactName,
    phone: input.phone.trim(),
    address: input.address.trim(),
  });

  const jar = await cookies();
  jar.set("rq_role", input.role, { path: "/", httpOnly: false });
  jar.set("rq_org", orgName, { path: "/", httpOnly: false });
  jar.set("rq_org_slug", slugify(orgName), {
    path: "/",
    httpOnly: false,
  });
  jar.set("rq_phone", input.phone.trim(), { path: "/", httpOnly: false });
  jar.set("rq_email", email, { path: "/", httpOnly: false });
  jar.set("rq_address", input.address.trim(), { path: "/", httpOnly: false });
  jar.set("rq_contact_name", contactName, { path: "/", httpOnly: false });
  jar.set("rq_onboarded", "1", { path: "/", httpOnly: false });
  if (result.orgId) {
    jar.set("rq_org_id", result.orgId, { path: "/", httpOnly: false });
  }

  return {
    message: result.demo
      ? `Organisation “${orgName}” ready (runtime store + cookies).`
      : `Organisation “${orgName}” saved to database.`,
    redirectTo: `/dashboard/${input.role === "contractor" ? "contractor" : input.role}`,
  };
}
