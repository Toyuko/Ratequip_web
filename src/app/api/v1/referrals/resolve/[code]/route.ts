import { NextRequest } from "next/server";
import { resolveReferralCode } from "@/lib/actions/referrals";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import { buildShareBundle } from "@/lib/referrals/share";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ code: string }> },
) {
  const { code } = await ctx.params;
  const result = await resolveReferralCode(code);
  if (!result.ok) {
    return apiResponse(req, err(result.message, 404));
  }

  const invite = result.invite;
  const share = buildShareBundle({
    code: invite.code,
    token: invite.token,
    kind: invite.kind,
    inviterName: invite.inviterName,
    inviterOrg: invite.inviterOrg,
    companyName: invite.companyName,
    personalNote: invite.personalNote,
    invitationReason: invite.invitationReason,
  });

  return apiResponse(req, ok({ invite, share }));
}
