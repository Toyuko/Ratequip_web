import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  getOrCreateShareLink,
  listReferralInvites,
} from "@/lib/actions/referrals";
import { REFERRAL_KINDS, type ReferralKind } from "@/lib/referrals/types";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const listed = await listReferralInvites();
  const kindParam = req.nextUrl.searchParams.get("kind");
  const kind = (
    kindParam && (REFERRAL_KINDS as readonly string[]).includes(kindParam)
      ? kindParam
      : "join_platform"
  ) as ReferralKind;

  const share = await getOrCreateShareLink({ kind });
  return apiResponse(
    req,
    ok({
      invites: listed.invites,
      share: share.ok ? share.share : null,
      invite: share.ok ? share.invite : null,
    }),
  );
}
