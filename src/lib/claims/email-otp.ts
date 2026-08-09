import { createHash, randomInt } from "crypto";
import {
  classifyEmailDomain,
  domainFromEmail,
  isDisposableEmail,
  isValidEmail,
  normalizeEmail,
  registrableDomainFromUrl,
} from "@/lib/organic-growth/privacy";

type OtpRecord = {
  emailHash: string;
  companySlug: string;
  codeHash: string;
  expiresAt: number;
  attempts: number;
};

const globalStore = globalThis as typeof globalThis & {
  __rqClaimOtpStore?: Map<string, OtpRecord>;
};

function otpStore() {
  if (!globalStore.__rqClaimOtpStore) {
    globalStore.__rqClaimOtpStore = new Map();
  }
  return globalStore.__rqClaimOtpStore;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function otpKey(companySlug: string, email: string) {
  return `${companySlug}:${hashValue(normalizeEmail(email))}`;
}

export function companyEmailDomainFromWebsite(website?: string) {
  return registrableDomainFromUrl(website);
}

export function assertCompanyWorkEmail(input: {
  email: string;
  companyWebsite?: string;
}):
  | { ok: true; email: string; domain: string }
  | { ok: false; message: string; riskFlag?: string } {
  if (!isValidEmail(input.email)) {
    return { ok: false, message: "Enter a valid work email address." };
  }
  const email = normalizeEmail(input.email);
  if (isDisposableEmail(email)) {
    return {
      ok: false,
      message: "Disposable email addresses cannot verify a company claim.",
      riskFlag: "disposable_email",
    };
  }
  const companyDomain = companyEmailDomainFromWebsite(input.companyWebsite);
  if (!companyDomain) {
    return {
      ok: false,
      message:
        "This company profile has no website domain on file, so work-email verification is unavailable. Try website or phone verification.",
    };
  }
  const classification = classifyEmailDomain(email, companyDomain);
  if (classification !== "company_domain") {
    return {
      ok: false,
      message: `Use an email ending in @${companyDomain}. Personal inboxes cannot verify company control.`,
      riskFlag:
        classification === "consumer_domain" ? "domain_mismatch" : undefined,
    };
  }
  return { ok: true, email, domain: domainFromEmail(email) };
}

export function createClaimEmailOtp(input: {
  companySlug: string;
  email: string;
  ttlMs?: number;
}) {
  const code = String(randomInt(100000, 999999));
  const key = otpKey(input.companySlug, input.email);
  otpStore().set(key, {
    emailHash: hashValue(normalizeEmail(input.email)),
    companySlug: input.companySlug,
    codeHash: hashValue(code),
    expiresAt: Date.now() + (input.ttlMs ?? 10 * 60 * 1000),
    attempts: 0,
  });
  return { code, expiresInSec: Math.floor((input.ttlMs ?? 600_000) / 1000) };
}

export function verifyClaimEmailOtp(input: {
  companySlug: string;
  email: string;
  code: string;
}): { ok: true } | { ok: false; message: string } {
  const key = otpKey(input.companySlug, input.email);
  const record = otpStore().get(key);
  if (!record) {
    return { ok: false, message: "No verification code found. Send a new code." };
  }
  if (record.expiresAt < Date.now()) {
    otpStore().delete(key);
    return { ok: false, message: "That code has expired. Send a new code." };
  }
  if (record.attempts >= 5) {
    otpStore().delete(key);
    return {
      ok: false,
      message: "Too many attempts. Send a new verification code.",
    };
  }
  record.attempts += 1;
  const match = record.codeHash === hashValue(input.code.trim());
  if (!match) {
    return { ok: false, message: "Incorrect verification code." };
  }
  otpStore().delete(key);
  return { ok: true };
}
