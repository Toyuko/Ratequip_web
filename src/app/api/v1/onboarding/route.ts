import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { completeOnboarding } from "@/lib/actions/onboarding";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  role: z.enum(["buyer", "supplier", "contractor"]),
  orgName: z.string().min(1),
  phone: z.string().optional().default(""),
  email: z.string().email(),
  address: z.string().optional().default(""),
  contactName: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid onboarding payload"));
  }

  const result = await completeOnboarding(parsed.data);
  if (result.redirectTo === "/onboarding") {
    return apiResponse(req, err(result.message));
  }

  return apiResponse(
    req,
    ok({
      message: result.message,
      role: parsed.data.role,
      orgName: parsed.data.orgName,
      redirectTo: result.redirectTo,
      user: {
        ...authResult.user,
        role: parsed.data.role,
        orgName: parsed.data.orgName,
        email: parsed.data.email,
        fullName: parsed.data.contactName,
        onboardingComplete: true,
      },
    }),
  );
}
