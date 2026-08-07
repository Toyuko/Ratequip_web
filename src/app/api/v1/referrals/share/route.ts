import { NextRequest } from "next/server";
import { z } from "zod";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  getOrCreateShareLink,
  trackReferralShare,
} from "@/lib/actions/referrals";
import {
  REFERRAL_CHANNELS,
  REFERRAL_KINDS,
  type ReferralChannel,
  type ReferralKind,
} from "@/lib/referrals/types";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

const schema = z.object({
  kind: z.enum(REFERRAL_KINDS),
  companyName: z.string().optional(),
  channel: z.enum(REFERRAL_CHANNELS).optional(),
  trackCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiResponse(req, err("Invalid share payload"));
  }

  if (parsed.data.trackCode && parsed.data.channel) {
    await trackReferralShare({
      code: parsed.data.trackCode,
      channel: parsed.data.channel as ReferralChannel,
    });
  }

  const result = await getOrCreateShareLink({
    kind: parsed.data.kind as ReferralKind,
    companyName: parsed.data.companyName,
    channel: parsed.data.channel as ReferralChannel | undefined,
  });
  if (!result.ok) {
    return apiResponse(req, err(result.message));
  }

  return apiResponse(
    req,
    ok({
      invite: result.invite,
      share: result.share,
    }),
  );
}
