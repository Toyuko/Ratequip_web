import { randomUUID } from "crypto";
import type { BoardId, OperatorProfile } from "@/lib/talent/types";

export function newId(prefix: string) {
  return `${prefix}_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

/** Lowercase; strip Gmail dots and +suffixes. */
export function normalizeEmail(email: string): string {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at < 0) return trimmed;
  let local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split("+")[0] ?? local;
    local = local.replace(/\./g, "");
    return `${local}@gmail.com`;
  }
  return `${local.split("+")[0] ?? local}@${domain}`;
}

/** AU mobiles 04xx → +614xx; otherwise keep digits with leading +. */
export function normalizePhoneE164(phone: string): string | undefined {
  const digits = phone.replace(/[^\d+]/g, "");
  if (!digits) return undefined;
  if (digits.startsWith("+")) return `+${digits.replace(/\D/g, "")}`;
  const only = digits.replace(/\D/g, "");
  if (only.startsWith("04") && only.length === 10) {
    return `+61${only.slice(1)}`;
  }
  if (only.startsWith("61") && only.length >= 11) {
    return `+${only}`;
  }
  if (only.length >= 8) return `+${only}`;
  return undefined;
}

export function splitName(fullName: string): {
  givenName: string;
  familyName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return { givenName: parts[0] ?? "", familyName: "" };
  return {
    givenName: parts.slice(0, -1).join(" "),
    familyName: parts.at(-1) ?? "",
  };
}

export type MergeDecision =
  | { action: "auto-merge"; survivingPartyId: string; rule: string }
  | { action: "create" }
  | { action: "review"; reason: string }
  | { action: "block"; reason: string };

export function resolveOperatorIdentity(input: {
  email?: string;
  phone?: string;
  familyName?: string;
  postcode?: string;
  licenceNumbers?: string[];
  existing: OperatorProfile[];
  licenceOwners?: Map<string, { partyId: string; familyName?: string }>;
}): MergeDecision {
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhoneE164(input.phone) : undefined;

  if (email) {
    const byEmail = input.existing.find((o) => o.primaryEmailNorm === email);
    if (byEmail) {
      return {
        action: "auto-merge",
        survivingPartyId: byEmail.partyId,
        rule: "email_exact",
      };
    }
  }

  for (const licence of input.licenceNumbers ?? []) {
    const owner = input.licenceOwners?.get(licence.trim().toUpperCase());
    if (owner) {
      return {
        action: "auto-merge",
        survivingPartyId: owner.partyId,
        rule: "licence_number",
      };
    }
  }

  if (phone) {
    const byPhone = input.existing.filter((o) => o.primaryPhoneE164 === phone);
    if (byPhone.length === 1) {
      const match = byPhone[0]!;
      const surnameOk =
        input.familyName &&
        match.familyName &&
        match.familyName.toLowerCase() === input.familyName.toLowerCase();
      if (surnameOk) {
        return {
          action: "auto-merge",
          survivingPartyId: match.partyId,
          rule: "phone_plus_surname",
        };
      }
    }
    if (byPhone.length > 1) {
      return { action: "review", reason: "shared_household_contact" };
    }
  }

  if (email && phone) {
    const emailParty = input.existing.find((o) => o.primaryEmailNorm === email);
    const phoneParty = input.existing.find((o) => o.primaryPhoneE164 === phone);
    if (
      emailParty &&
      phoneParty &&
      emailParty.partyId !== phoneParty.partyId
    ) {
      return { action: "block", reason: "shared_contact_different_people" };
    }
  }

  return { action: "create" };
}

export function linkId(board: BoardId, externalId: string) {
  return `lnk_${board}_${externalId}`.slice(0, 64);
}
