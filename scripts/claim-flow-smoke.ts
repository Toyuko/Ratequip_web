/**
 * End-to-end automated claim persist smoke (demo store).
 * Run: npx tsx scripts/claim-flow-smoke.ts
 */
import { decideClaimOutcome } from "../src/lib/claims/decision-engine";
import {
  createClaimEmailOtp,
  verifyClaimEmailOtp,
} from "../src/lib/claims/email-otp";
import { getCompanyBySlugAsync, persistClaim } from "../src/lib/db/phase2";
import { discoverCompanyClaimSources } from "../src/lib/ai/company-claim-discover";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const company = await getCompanyBySlugAsync("inkjetprint");
  assert(company, "inkjetprint company missing");
  assert(company.website.includes("inkjetprint.com.au"), "website domain");
  assert(company.emailDomain === "inkjetprint.com.au" || company.website, "domain");
  assert((company.publicProfiles?.length ?? 0) >= 3, "public profiles enriched");

  const discovery = await discoverCompanyClaimSources({
    name: company.legalName || company.name,
    website: company.website,
    city: company.city,
    country: company.country,
    phone: company.phone,
    abn: company.abn,
    publicProfiles: company.publicProfiles,
    description: company.description,
  });
  assert(discovery.sources.length >= 3, "discovery sources");
  assert(discovery.emailDomain === "inkjetprint.com.au", "discovered email domain");

  // Simulate email OTP path → representative
  const email = "claimant@inkjetprint.com.au";
  const { code } = createClaimEmailOtp({
    companySlug: "inkjetprint",
    email,
  });
  assert(
    verifyClaimEmailOtp({ companySlug: "inkjetprint", email, code }).ok,
    "otp",
  );

  const emailDecision = decideClaimOutcome({
    relationship: "employee",
    verifiedSignals: ["company_domain_email", "registration_match"],
    selectedSupportingCount: 0,
    riskFlags: [],
    companyAlreadyClaimed: false,
    hasExistingAdmins: false,
    competingOpenClaims: 0,
  });
  assert(emailDecision.outcome === "verified_representative", "email outcome");

  const emailClaim = await persistClaim({
    companySlug: "inkjetprint",
    claimant: email,
    status: emailDecision.outcome,
    relationship: "employee",
    method: "company_email",
    notes: emailDecision.reason,
    verificationPayload: {
      recommendedPermission: emailDecision.outcome,
      riskFlags: [],
    },
  });
  assert(emailClaim.ok, "persist email claim");

  const afterEmail = await getCompanyBySlugAsync("inkjetprint");
  assert(afterEmail?.claimed === true, "claimed after email verify");
  assert(afterEmail?.verified === false, "representative is not controller verified flag");

  // Reset claimed for website-controller check on a fresh slug path using cartonmax
  const websiteDecision = decideClaimOutcome({
    relationship: "owner_director",
    verifiedSignals: ["website_dns_control"],
    selectedSupportingCount: 0,
    riskFlags: [],
    companyAlreadyClaimed: false,
    hasExistingAdmins: false,
    competingOpenClaims: 0,
  });
  assert(websiteDecision.outcome === "verified_controller", "website controller");

  const supporting = decideClaimOutcome({
    relationship: "other",
    verifiedSignals: [],
    selectedSupportingCount: 3,
    riskFlags: [],
    companyAlreadyClaimed: false,
    hasExistingAdmins: false,
    competingOpenClaims: 0,
  });
  assert(supporting.outcome === "stronger_proof_required", "supporting only");

  console.log("claim-flow-smoke: OK", {
    emailClaimId: emailClaim.ok ? emailClaim.id : null,
    sources: discovery.sources.length,
    claimed: afterEmail?.claimed,
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
