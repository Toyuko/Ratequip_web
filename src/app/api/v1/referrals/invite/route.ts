import { NextRequest } from "next/server";
import { sendReferralInvite } from "@/lib/actions/referrals";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  isInvitationReason,
  type InvitationReason,
} from "@/lib/referrals/invitation-reasons";
import { REFERRAL_KINDS, type ReferralKind } from "@/lib/referrals/types";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function POST(req: NextRequest) {
  let body: {
    kind?: string;
    email?: string;
    recipientName?: string;
    companyName?: string;
    personalNote?: string;
    opportunitySummary?: string;
    invitationReason?: string;
    inviterName?: string;
    inviterEmail?: string;
  };
  try {
    body = await req.json();
  } catch {
    return apiResponse(req, err("Invalid JSON body"));
  }

  if (!body.kind || !(REFERRAL_KINDS as readonly string[]).includes(body.kind)) {
    return apiResponse(req, err("Invalid invite kind"));
  }
  if (!body.email?.trim()) {
    return apiResponse(req, err("Email is required"));
  }

  let invitationReason: InvitationReason | undefined;
  if (body.invitationReason) {
    if (!isInvitationReason(body.invitationReason)) {
      return apiResponse(req, err("Invalid invitation reason"));
    }
    invitationReason = body.invitationReason;
  }

  const result = await sendReferralInvite({
    kind: body.kind as ReferralKind,
    email: body.email,
    recipientName: body.recipientName,
    companyName: body.companyName,
    personalNote: body.personalNote,
    opportunitySummary: body.opportunitySummary,
    invitationReason,
    inviterName: body.inviterName,
    inviterEmail: body.inviterEmail,
  });

  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }

  return apiResponse(
    req,
    ok({
      invite: result.invite,
      share: result.share,
      message: result.message,
    }),
  );
}
