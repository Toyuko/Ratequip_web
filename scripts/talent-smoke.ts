/**
 * Talent pool Phase 1 / Indeed 2a smoke.
 * Operator → credential → gig → XML feed → signed Apply ingest → match → placement block.
 */
import { createHmac } from "crypto";
import { resetCollaborateRuntime } from "@/lib/collaborate";
import {
  addOperatorCredential,
  createGig,
  ingestInbound,
  indeedXml,
  matchGig,
  placeOperator,
  processOutbox,
  resetTalentRuntime,
  setOperatorAvailability,
  upsertOperator,
} from "@/lib/talent";
import { signIndeedBody } from "@/lib/talent/adapters/indeed";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  resetCollaborateRuntime();
  resetTalentRuntime();

  const first = await upsertOperator({
    legalName: "Alex Crane",
    email: "alex.crane+seek@gmail.com",
    phone: "0412 000 111",
    poolConsent: true,
    rightToWork: true,
    jurisdiction: "AU",
  });
  assert(first.operator.primaryEmailNorm === "alexcrane@gmail.com", "gmail normalize");
  assert(first.operator.primaryPhoneE164 === "+61412000111", "AU mobile E.164");

  const merged = await upsertOperator({
    legalName: "A Crane",
    email: "alexcrane@gmail.com",
    phone: "0412 000 111",
    familyName: "Crane",
    poolConsent: true,
    rightToWork: true,
  });
  assert(merged.merged, "second apply should merge on email");
  assert(merged.operator.partyId === first.operator.partyId, "same party");

  await addOperatorCredential({
    partyId: first.operator.partyId,
    credentialType: "WHITE_CARD",
    identifier: "WC-NSW-1",
    issuingJurisdiction: "AU-NSW",
    expiresAt: new Date(Date.now() + 400 * 86400000).toISOString(),
    verifiedBy: "smoke",
  });
  await addOperatorCredential({
    partyId: first.operator.partyId,
    credentialType: "HRW_LF",
    identifier: "LF-1",
    issuingJurisdiction: "AU-NSW",
    expiresAt: new Date(Date.now() + 400 * 86400000).toISOString(),
    verifiedBy: "smoke",
  });

  await setOperatorAvailability({
    partyId: first.operator.partyId,
    windowStart: new Date().toISOString(),
    windowEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
    radiusKm: 80,
    baseLat: -37.98,
    baseLng: 145.21,
  });

  const gig = await createGig({
    title: "Forklift Operator (LF) - Dandenong",
    equipmentClass: "FORKLIFT",
    siteLabel: "Dandenong, VIC",
    siteLat: -38.0,
    siteLng: 145.2,
    startsAt: new Date(Date.now() + 86400000).toISOString(),
    endsAt: new Date(Date.now() + 3 * 86400000).toISOString(),
    rateCents: 6800,
    currency: "AUD",
  });
  await processOutbox();

  const xml = await indeedXml();
  assert(xml.includes(gig.id), "XML feed should list the gig");
  assert(xml.includes("indeed-apply-data"), "Indeed Apply metadata present");

  const payload = JSON.stringify({
    id: "apply-smoke-1",
    job: { jobId: gig.id, jobTitle: gig.title },
    applicant: {
      fullName: "Alex Crane",
      email: "a.l.e.x.crane@gmail.com",
      phoneNumber: "0412000111",
    },
    screenerQuestionsAndAnswers: [
      { question: { id: "white_card" }, answer: "Yes" },
      { question: { id: "pool_consent" }, answer: "Yes" },
      { question: { id: "ticket_numbers" }, answer: "LF-1" },
    ],
  });
  process.env.INDEED_APPLY_SECRET = "smoke-secret";
  const signature = signIndeedBody(payload, "smoke-secret");
  assert(
    signature === createHmac("sha1", "smoke-secret").update(payload).digest("base64"),
    "HMAC-SHA1 signature helper",
  );

  const ingest = await ingestInbound({
    headers: { "x-indeed-signature": signature },
    rawBody: payload,
  });
  assert(ingest.ok, "ingest should succeed");
  const dup = await ingestInbound({
    headers: { "x-indeed-signature": signature },
    rawBody: payload,
  });
  assert(dup.ok && "duplicate" in dup && dup.duplicate, "duplicate apply id is idempotent");

  const forged = await ingestInbound({
    headers: { "x-indeed-signature": "nope" },
    rawBody: payload,
  });
  assert(!forged.ok && forged.status === 401, "invalid signature rejected");

  const matches = await matchGig(gig.id);
  const hit = matches.find((m) => m.partyId === first.operator.partyId);
  assert(hit, "operator should be a match candidate");
  assert(hit!.blocked.length === 0, `should pass hard filters, got ${hit!.blocked}`);

  const placed = await placeOperator(gig.id, first.operator.partyId);
  assert(placed.ok, "placement should succeed with current tickets");

  await addOperatorCredential({
    partyId: first.operator.partyId,
    credentialType: "WHITE_CARD",
    identifier: "WC-OLD",
    issuingJurisdiction: "AU-QLD",
    expiresAt: new Date(Date.now() - 86400000).toISOString(),
    verifiedBy: "smoke",
  });

  console.log("talent smoke ok", {
    partyId: first.operator.partyId,
    gigId: gig.id,
    xmlBytes: xml.length,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
