import { createHmac, timingSafeEqual } from "crypto";

export type ClaimInvitePayload = {
  v: 1;
  invitationId: string;
  submissionId: string;
  companyName: string;
  companySlug?: string;
  locality?: string;
  countryCode?: string;
  domain?: string;
  emailMasked: string;
  inviterDisplay: string;
  invitationState: string;
  exp: number;
};

function hmacSecret() {
  const configured =
    process.env.OG_EMAIL_HMAC_SECRET?.trim() ||
    process.env.REFERRAL_HMAC_SECRET?.trim();
  if (configured) return configured;
  // Stable demo fallback so claim invite links work across serverless instances
  // when a dedicated secret is not configured yet.
  return "ratequip-demo-og-hmac-v10.1";
}

/** Signed, self-contained claim invitation token for /claim/[token]. */
export function mintClaimInviteToken(
  input: Omit<ClaimInvitePayload, "v" | "exp">,
  ttlMs = 30 * 24 * 60 * 60 * 1000,
): string {
  const payload: ClaimInvitePayload = {
    v: 1,
    ...input,
    exp: Date.now() + ttlMs,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const sig = createHmac("sha256", hmacSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyClaimInviteToken(token: string): ClaimInvitePayload | null {
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = trimmed.slice(0, dot);
  const sig = trimmed.slice(dot + 1);
  if (!body || !sig) return null;

  const expected = createHmac("sha256", hmacSecret())
    .update(body)
    .digest("base64url");

  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const raw = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as ClaimInvitePayload;
    if (raw.v !== 1 || !raw.companyName || !raw.invitationId) return null;
    if (typeof raw.exp !== "number" || raw.exp < Date.now()) return null;
    return raw;
  } catch {
    return null;
  }
}

export function looksLikeClaimInviteToken(token: string) {
  return token.includes(".") && token.length > 40;
}
