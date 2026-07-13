import { createHash, createHmac, randomBytes } from "crypto";

const DEMO_HMAC_SECRET =
  process.env.OG_EMAIL_HMAC_SECRET ?? "ratequip-demo-og-hmac-v10.1";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function maskEmail(email: string) {
  const normalized = normalizeEmail(email);
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return "***";
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***@${domain}`;
}

export function emailNormalizedHash(email: string) {
  return createHmac("sha256", DEMO_HMAC_SECRET)
    .update(normalizeEmail(email))
    .digest("hex");
}

/** Demo envelope — production must use KMS. Never log plaintext. */
export function encryptEmailDemo(email: string) {
  const payload = Buffer.from(normalizeEmail(email), "utf8").toString("base64");
  return `enc:v1:${payload}`;
}

export function decryptEmailDemo(ciphertext: string) {
  if (!ciphertext.startsWith("enc:v1:")) return null;
  try {
    return Buffer.from(ciphertext.slice(7), "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function registrableDomainFromUrl(url?: string) {
  if (!url?.trim()) return undefined;
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    const host = new URL(withProtocol).hostname.toLowerCase().replace(/^www\./, "");
    return host || undefined;
  } catch {
    return undefined;
  }
}

export function domainFromEmail(email: string) {
  const normalized = normalizeEmail(email);
  const at = normalized.lastIndexOf("@");
  return at >= 0 ? normalized.slice(at + 1) : "";
}

const CONSUMER_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
]);

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "10minutemail.com",
  "yopmail.com",
]);

export function classifyEmailDomain(email: string, companyDomain?: string) {
  const domain = domainFromEmail(email);
  if (!domain) return "unknown" as const;
  if (DISPOSABLE_DOMAINS.has(domain)) return "unrelated_domain" as const;
  if (companyDomain && (domain === companyDomain || domain.endsWith(`.${companyDomain}`))) {
    return "company_domain" as const;
  }
  if (CONSUMER_DOMAINS.has(domain)) return "consumer_domain" as const;
  return "generic_business_domain" as const;
}

export function isDisposableEmail(email: string) {
  return DISPOSABLE_DOMAINS.has(domainFromEmail(email));
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email));
}

export function createClaimToken() {
  const raw = randomBytes(24).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { token: raw, tokenHash: hash, tokenPrefix: raw.slice(0, 8) };
}

export function hashClaimToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
