"use server";

import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { hasClerk } from "@/lib/config";
import { persistOnboarding } from "@/lib/db/phase2";
import { releaseReferralReward } from "@/lib/actions/referrals";
import { slugify } from "@/lib/utils";

const LOCAL_NAME_LOCALES = ["th", "zh"] as const;

export async function completeOnboarding(input: {
  role: "buyer" | "supplier" | "contractor";
  orgName: string;
  /** Optional organisation name in another language/script. */
  orgNameLocal?: string;
  /** Locale for `orgNameLocal` (th | zh). */
  orgNameLocalLocale?: string;
  phone: string;
  email: string;
  address: string;
  contactName: string;
}) {
  // Platform admin is never assignable via onboarding — ops elevates existing accounts only.
  if (input.role !== "buyer" && input.role !== "supplier" && input.role !== "contractor") {
    return {
      message: "Invalid account type.",
      redirectTo: "/onboarding",
    };
  }

  const orgName = input.orgName.trim();
  const email = input.email.trim();
  const contactName = input.contactName.trim();
  const orgNameLocal = input.orgNameLocal?.trim() || "";
  const orgNameLocalLocale = LOCAL_NAME_LOCALES.includes(
    input.orgNameLocalLocale as (typeof LOCAL_NAME_LOCALES)[number],
  )
    ? (input.orgNameLocalLocale as (typeof LOCAL_NAME_LOCALES)[number])
    : undefined;

  if (!orgName || !email || !contactName) {
    return {
      message: "Organisation name, contact name, and email are required.",
      redirectTo: "/onboarding",
    };
  }

  if (orgNameLocal && !orgNameLocalLocale) {
    return {
      message: "Choose a language for the alternate organisation name.",
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
    orgNameLocal: orgNameLocal || undefined,
    orgNameLocalLocale: orgNameLocal ? orgNameLocalLocale : undefined,
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
  if (orgNameLocal && orgNameLocalLocale) {
    jar.set("rq_org_local", orgNameLocal, { path: "/", httpOnly: false });
    jar.set("rq_org_local_locale", orgNameLocalLocale, {
      path: "/",
      httpOnly: false,
    });
  } else {
    jar.delete("rq_org_local");
    jar.delete("rq_org_local_locale");
  }
  jar.set("rq_phone", input.phone.trim(), { path: "/", httpOnly: false });
  jar.set("rq_email", email, { path: "/", httpOnly: false });
  jar.set("rq_address", input.address.trim(), { path: "/", httpOnly: false });
  jar.set("rq_contact_name", contactName, { path: "/", httpOnly: false });
  jar.set("rq_onboarded", "1", { path: "/", httpOnly: false });
  if (result.orgId) {
    jar.set("rq_org_id", result.orgId, { path: "/", httpOnly: false });
  }

  // Progressive referral: email verified / account joined unlocks the first tier.
  let rewardNote = "";
  try {
    const reward = await releaseReferralReward({
      event: "email_verified",
      organisationId: result.orgId,
      allowDemoFallback: true,
    });
    if (reward.ok && (reward.inviteeGranted > 0 || reward.inviterGranted > 0)) {
      rewardNote = ` ${reward.message}`;
    }
  } catch (error) {
    console.warn("[onboarding] referral reward release failed", error);
  }

  return {
    message: result.demo
      ? `Organisation “${orgName}” ready (runtime store + cookies).${rewardNote}`
      : `Organisation “${orgName}” saved to database.${rewardNote}`,
    redirectTo: `/v12/activation?company=${encodeURIComponent(orgName)}&role=${input.role}&from=onboarding`,
  };
}
