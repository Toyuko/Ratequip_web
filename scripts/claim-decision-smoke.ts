/**
 * Automated claim decision-engine smoke checks.
 * Run: npx tsx scripts/claim-decision-smoke.ts
 */
import { decideClaimOutcome } from "../src/lib/claims/decision-engine";
import {
  assertCompanyWorkEmail,
  createClaimEmailOtp,
  verifyClaimEmailOtp,
} from "../src/lib/claims/email-otp";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function run() {
  const emailRep = decideClaimOutcome({
    relationship: "employee",
    verifiedSignals: ["company_domain_email", "registration_match"],
    selectedSupportingCount: 0,
    riskFlags: [],
    companyAlreadyClaimed: false,
    hasExistingAdmins: false,
    competingOpenClaims: 0,
  });
  assert(
    emailRep.outcome === "verified_representative",
    `email employee → representative, got ${emailRep.outcome}`,
  );

  const websiteCtrl = decideClaimOutcome({
    relationship: "owner_director",
    verifiedSignals: ["website_dns_control"],
    selectedSupportingCount: 0,
    riskFlags: [],
    companyAlreadyClaimed: false,
    hasExistingAdmins: false,
    competingOpenClaims: 0,
  });
  assert(
    websiteCtrl.outcome === "verified_controller",
    `website owner → controller, got ${websiteCtrl.outcome}`,
  );

  const supportingOnly = decideClaimOutcome({
    relationship: "other",
    verifiedSignals: [
      "supporting_public_source",
      "supporting_public_source",
      "supporting_public_source",
    ],
    selectedSupportingCount: 3,
    riskFlags: [],
    companyAlreadyClaimed: false,
    hasExistingAdmins: false,
    competingOpenClaims: 0,
  });
  assert(
    supportingOnly.outcome === "stronger_proof_required",
    `three supporting → stronger_proof, got ${supportingOnly.outcome}`,
  );

  const conflict = decideClaimOutcome({
    relationship: "employee",
    verifiedSignals: ["company_domain_email"],
    selectedSupportingCount: 0,
    riskFlags: [],
    companyAlreadyClaimed: true,
    hasExistingAdmins: true,
    competingOpenClaims: 1,
  });
  assert(
    conflict.outcome === "blocked_conflict",
    `claimed+admins → blocked_conflict, got ${conflict.outcome}`,
  );

  const domainOk = assertCompanyWorkEmail({
    email: "ops@inkjetprint.com.au",
    companyWebsite: "https://inkjetprint.com.au/",
  });
  assert(domainOk.ok, "inkjetprint work email should pass");

  const gmail = assertCompanyWorkEmail({
    email: "ops@gmail.com",
    companyWebsite: "https://inkjetprint.com.au/",
  });
  assert(!gmail.ok, "gmail should fail company-domain gate");

  const { code } = createClaimEmailOtp({
    companySlug: "inkjetprint",
    email: "ops@inkjetprint.com.au",
  });
  const verified = verifyClaimEmailOtp({
    companySlug: "inkjetprint",
    email: "ops@inkjetprint.com.au",
    code,
  });
  assert(verified.ok, "OTP should verify");

  console.log("claim-decision-smoke: OK");
}

run();
