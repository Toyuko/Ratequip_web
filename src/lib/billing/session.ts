import { cookies } from "next/headers";
import { auth, currentUser } from "@clerk/nextjs/server";
import { hasClerk, isDemoMode } from "@/lib/config";
import { getProfileByClerkId } from "@/lib/db/phase2";

export type BillingAudienceRole = "buyer" | "supplier" | "contractor" | "admin";

export type BillingSession = {
  ok: true;
  orgId?: string;
  email?: string;
  role: BillingAudienceRole;
};

export type BillingSessionDenied = {
  ok: false;
  message: string;
};

/**
 * Resolve signed-in billing context: org from DB (Clerk) with cookie fallback,
 * plus email for Stripe Checkout customer_email.
 */
export async function resolveBillingSession(): Promise<
  BillingSession | BillingSessionDenied
> {
  const jar = await cookies();
  const cookieOrgId = jar.get("rq_org_id")?.value || undefined;
  const cookieEmail = jar.get("rq_email")?.value || undefined;
  const cookieRole = parseAudienceRole(jar.get("rq_role")?.value);

  if (hasClerk()) {
    try {
      const session = await auth();
      if (!session.userId) {
        if (isDemoMode() && (jar.get("rq_onboarded")?.value === "1" || cookieEmail)) {
          return {
            ok: true,
            orgId: cookieOrgId,
            email: cookieEmail,
            role: cookieRole ?? "buyer",
          };
        }
        return { ok: false, message: "Sign in required." };
      }

      const [user, profile] = await Promise.all([
        currentUser(),
        getProfileByClerkId(session.userId),
      ]);
      const email =
        user?.primaryEmailAddress?.emailAddress ??
        cookieEmail ??
        profile?.email ??
        undefined;
      const role =
        parseAudienceRole(profile?.role) ??
        parseAudienceRole(
          (user?.publicMetadata?.role as string | undefined) ?? undefined,
        ) ??
        cookieRole ??
        "buyer";

      return {
        ok: true,
        orgId: profile?.organisationId ?? cookieOrgId,
        email,
        role,
      };
    } catch {
      if (isDemoMode() && (jar.get("rq_onboarded")?.value === "1" || cookieEmail)) {
        return {
          ok: true,
          orgId: cookieOrgId,
          email: cookieEmail,
          role: cookieRole ?? "buyer",
        };
      }
      return { ok: false, message: "Sign in required." };
    }
  }

  if (!isDemoMode()) {
    return { ok: false, message: "Sign in required." };
  }
  if (jar.get("rq_onboarded")?.value !== "1" && !cookieEmail) {
    return {
      ok: false,
      message: "Sign in or complete demo onboarding first.",
    };
  }

  return {
    ok: true,
    orgId: cookieOrgId,
    email: cookieEmail,
    role: cookieRole ?? "buyer",
  };
}

function parseAudienceRole(
  value: string | null | undefined,
): BillingAudienceRole | null {
  if (
    value === "buyer" ||
    value === "supplier" ||
    value === "contractor" ||
    value === "admin"
  ) {
    return value;
  }
  return null;
}
