import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { completeAutomatedClaim } from "@/lib/actions/claims";
import { CLAIM_METHODS, CLAIM_RELATIONSHIPS } from "@/lib/claims/types";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  companySlug: z.string().min(1),
  relationship: z.enum(CLAIM_RELATIONSHIPS),
  method: z.enum(CLAIM_METHODS),
  workEmail: z.string().email().optional(),
  emailCode: z.string().optional(),
  selectedSourceIds: z.array(z.string()).optional(),
  stubVerifiedSignals: z
    .array(
      z.enum([
        "company_domain_email",
        "website_dns_control",
        "published_phone",
        "director_registry",
        "admin_approval",
        "business_profile_match",
        "registration_match",
        "supporting_public_source",
      ]),
    )
    .optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid claim payload"));
  }

  const result = await completeAutomatedClaim(parsed.data);
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }
  return apiResponse(req, ok(result));
}
