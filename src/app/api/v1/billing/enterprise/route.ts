import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  creditEnterprisePool,
  ensureEnterpriseAccount,
  getEnterpriseAsync,
} from "@/lib/billing/operations";
import { getWalletAsync } from "@/lib/db/phase2";
import { slugify } from "@/lib/utils";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }
  const enterprise = await getEnterpriseAsync();
  return apiResponse(req, ok({ enterprise }));
}

/** Create / attach an enterprise pool for the current org (admin/demo helper). */
export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  if (
    authResult.user.role !== "admin" &&
    authResult.user.role !== "buyer" &&
    !authResult.user.isDemo
  ) {
    return apiResponse(req, err("Forbidden", 403));
  }

  const body = (await req.json().catch(() => ({}))) as {
    name?: string;
    pooledCredits?: number;
    commissionBps?: number;
    topUp?: number;
  };

  const wallet = await getWalletAsync();
  const name = body.name ?? `${authResult.user.orgName ?? "Demo"} Enterprise`;
  const created = await ensureEnterpriseAccount({
    name,
    slug: slugify(name) || `enterprise-${Date.now().toString(36)}`,
    pooledCredits: body.pooledCredits ?? 1000,
    commissionBps: body.commissionBps,
    memberOrgId: wallet.organisationId ?? undefined,
  });

  if (
    created.ok &&
    created.id &&
    typeof body.topUp === "number" &&
    body.topUp > 0
  ) {
    await creditEnterprisePool({
      enterpriseId: created.id,
      credits: body.topUp,
      reason: "Enterprise pool top-up",
      organisationId: wallet.organisationId ?? undefined,
    });
  }

  const enterprise = await getEnterpriseAsync(
    wallet.organisationId ?? undefined,
  );
  return apiResponse(req, ok({ enterprise, created }));
}
