import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { hasClerk, isDemoMode } from "@/lib/config";
import { getProfileByClerkId } from "@/lib/db/phase2";

export type ApiRole = "buyer" | "supplier" | "contractor" | "admin";

export type ApiUser = {
  id: string;
  clerkUserId: string | null;
  email: string;
  fullName: string;
  role: ApiRole;
  orgName: string | null;
  onboardingComplete: boolean;
  isDemo: boolean;
};

const VALID_ROLES: ApiRole[] = ["buyer", "supplier", "contractor", "admin"];
const PRODUCT_ROLES: ApiRole[] = ["buyer", "supplier", "contractor"];

function parseRole(value: string | null | undefined): ApiRole | null {
  if (!value) return null;
  return VALID_ROLES.includes(value as ApiRole) ? (value as ApiRole) : null;
}

/** Client cookies may switch product dashboards, never elevate to platform admin. */
function parseProductRole(value: string | null | undefined): ApiRole | null {
  if (!value) return null;
  return PRODUCT_ROLES.includes(value as ApiRole) ? (value as ApiRole) : null;
}

/**
 * Optional lockdown: comma-separated emails that may hold platform admin.
 * When set, Clerk/DB admin is ignored unless the account email is listed.
 * Existing admins should be listed here; new signups are never listed by default.
 */
function adminAllowlist(): Set<string> | null {
  const raw = process.env.PLATFORM_ADMIN_EMAILS?.trim();
  if (!raw) return null;
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

function isAllowedPlatformAdmin(email: string, trustedRole: ApiRole | null) {
  if (trustedRole !== "admin") return false;
  const allowlist = adminAllowlist();
  if (!allowlist) return true;
  return allowlist.has(email.trim().toLowerCase());
}

/**
 * Resolve platform role for authenticated (Clerk) users.
 * Admin is only granted from Clerk publicMetadata or DB primary_role —
 * never from the client-writable rq_role cookie.
 */
function resolveTrustedRole(input: {
  clerkRole: ApiRole | null;
  dbRole: ApiRole | null;
  cookieRole: ApiRole | null;
  email: string;
}): ApiRole {
  const trusted = input.clerkRole ?? input.dbRole;
  if (isAllowedPlatformAdmin(input.email, trusted)) {
    return "admin";
  }
  // Strip admin if allowlist rejected it, then fall through to product roles.
  const trustedProduct =
    trusted && trusted !== "admin" ? trusted : null;
  return trustedProduct ?? input.cookieRole ?? "buyer";
}

async function demoUserFromRequest(req: NextRequest): Promise<ApiUser> {
  const headerRole = parseRole(req.headers.get("x-demo-role"));
  const jar = await cookies();
  const cookieRole = parseRole(jar.get("rq_role")?.value);
  const role = headerRole ?? cookieRole ?? "buyer";
  const orgName =
    req.headers.get("x-demo-org") ?? jar.get("rq_org")?.value ?? "Demo Org";
  const onboarded =
    jar.get("rq_onboarded")?.value === "1" || Boolean(headerRole);

  return {
    id: `demo-${role}`,
    clerkUserId: null,
    email: jar.get("rq_email")?.value ?? `${role}@demo.ratequip.com`,
    fullName: jar.get("rq_contact_name")?.value ?? `Demo ${role}`,
    role,
    orgName,
    onboardingComplete: onboarded,
    isDemo: true,
  };
}

async function demoUserFromCookies(): Promise<ApiUser> {
  const jar = await cookies();
  const role = parseRole(jar.get("rq_role")?.value) ?? "buyer";
  return {
    id: `demo-${role}`,
    clerkUserId: null,
    email: jar.get("rq_email")?.value ?? `${role}@demo.ratequip.com`,
    fullName: jar.get("rq_contact_name")?.value ?? `Demo ${role}`,
    role,
    orgName: jar.get("rq_org")?.value ?? "Demo Org",
    onboardingComplete: jar.get("rq_onboarded")?.value === "1",
    isDemo: true,
  };
}

export async function resolveSessionUser(): Promise<{
  user: ApiUser | null;
  error?: string;
}> {
  if (isDemoMode() || !hasClerk()) {
    return { user: await demoUserFromCookies() };
  }

  try {
    const session = await auth();
    if (!session.userId) {
      if (isDemoMode()) {
        return { user: await demoUserFromCookies() };
      }
      return { user: null };
    }

    const user = await currentUser();
    const jar = await cookies();
    const profile = await getProfileByClerkId(session.userId);
    const email =
      user?.primaryEmailAddress?.emailAddress ??
      jar.get("rq_email")?.value ??
      profile?.email ??
      "";
    const role = resolveTrustedRole({
      clerkRole: parseRole(
        (user?.publicMetadata?.role as string | undefined) ?? undefined,
      ),
      dbRole: parseRole(profile?.role),
      cookieRole: parseProductRole(jar.get("rq_role")?.value),
      email,
    });

    return {
      user: {
        id: session.userId,
        clerkUserId: session.userId,
        email,
        fullName:
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          jar.get("rq_contact_name")?.value ||
          profile?.fullName ||
          "RateQuip User",
        role,
        orgName: jar.get("rq_org")?.value ?? profile?.orgName ?? null,
        onboardingComplete:
          jar.get("rq_onboarded")?.value === "1" ||
          Boolean(profile?.onboardingComplete),
        isDemo: false,
      },
    };
  } catch {
    if (isDemoMode()) {
      return { user: await demoUserFromCookies() };
    }
    return { user: null, error: "Unable to resolve session" };
  }
}

export async function resolveApiUser(
  req: NextRequest,
): Promise<{ user: ApiUser | null; error?: string }> {
  if (isDemoMode() || !hasClerk()) {
    const demoHeader = req.headers.get("x-demo-role");
    if (demoHeader || isDemoMode()) {
      return { user: await demoUserFromRequest(req) };
    }
  }

  if (!hasClerk()) {
    return { user: await demoUserFromRequest(req) };
  }

  try {
    const session = await auth();
    if (!session.userId) {
      if (isDemoMode() && req.headers.get("x-demo-role")) {
        return { user: await demoUserFromRequest(req) };
      }
      return { user: null };
    }

    const user = await currentUser();
    const jar = await cookies();
    const profile = await getProfileByClerkId(session.userId);
    const email =
      user?.primaryEmailAddress?.emailAddress ??
      jar.get("rq_email")?.value ??
      profile?.email ??
      "";
    const role = resolveTrustedRole({
      clerkRole: parseRole(
        (user?.publicMetadata?.role as string | undefined) ?? undefined,
      ),
      dbRole: parseRole(profile?.role),
      cookieRole: parseProductRole(jar.get("rq_role")?.value),
      email,
    });

    return {
      user: {
        id: session.userId,
        clerkUserId: session.userId,
        email,
        fullName:
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          jar.get("rq_contact_name")?.value ||
          profile?.fullName ||
          "RateQuip User",
        role,
        orgName: jar.get("rq_org")?.value ?? profile?.orgName ?? null,
        onboardingComplete:
          jar.get("rq_onboarded")?.value === "1" ||
          Boolean(profile?.onboardingComplete),
        isDemo: false,
      },
    };
  } catch {
    if (isDemoMode()) {
      return { user: await demoUserFromRequest(req) };
    }
    return { user: null, error: "Unable to resolve session" };
  }
}

export async function requireApiUser(req: NextRequest) {
  const { user, error } = await resolveApiUser(req);
  if (!user) {
    return {
      user: null as ApiUser | null,
      error: error ?? "Authentication required",
      status: 401 as const,
    };
  }
  return { user, error: null, status: 200 as const };
}

export async function requireAdmin(req: NextRequest) {
  const result = await requireApiUser(req);
  if (!result.user) return result;
  if (result.user.role !== "admin") {
    return {
      user: null as ApiUser | null,
      error: "Admin role required",
      status: 403 as const,
    };
  }
  return result;
}

/** Server Components / server actions: require platform admin. */
export async function requireServerAdmin(): Promise<{
  user: ApiUser | null;
  error: string | null;
}> {
  const { user, error } = await resolveSessionUser();
  if (!user) {
    return { user: null, error: error ?? "Authentication required" };
  }
  if (user.role !== "admin") {
    return { user: null, error: "Admin role required" };
  }
  return { user, error: null };
}
