import { auth, currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { hasClerk, isDemoMode } from "@/lib/config";

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

function parseRole(value: string | null | undefined): ApiRole | null {
  if (!value) return null;
  return VALID_ROLES.includes(value as ApiRole) ? (value as ApiRole) : null;
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
    const role =
      parseRole(jar.get("rq_role")?.value) ??
      parseRole(
        (user?.publicMetadata?.role as string | undefined) ?? undefined,
      ) ??
      "buyer";

    return {
      user: {
        id: session.userId,
        clerkUserId: session.userId,
        email:
          user?.primaryEmailAddress?.emailAddress ??
          jar.get("rq_email")?.value ??
          "",
        fullName:
          [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
          jar.get("rq_contact_name")?.value ||
          "RateQuip User",
        role,
        orgName: jar.get("rq_org")?.value ?? null,
        onboardingComplete: jar.get("rq_onboarded")?.value === "1",
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
