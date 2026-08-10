/**
 * Collaborate Phase 0 + Phase 1 smoke.
 * Exercises Party → Session + Job → fund → deliver → accept → pay → reputation + event chain.
 */
import {
  addCapability,
  addContributor,
  addMilestone,
  addRequirement,
  createEngagement,
  createParty,
  createSessionOffering,
  discloseFee,
  getEventChain,
  getReputation,
  resetCollaborateRuntime,
  setVerificationTier,
  snapshot,
  submitMilestoneEvidence,
  transitionEngagement,
} from "@/lib/collaborate";
import { verifyEventChain } from "@/lib/collaborate/events";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(msg);
}

async function main() {
  resetCollaborateRuntime();

  const expert = createParty({
    kind: "INDIVIDUAL",
    legalName: "Sam Controls",
    jurisdiction: "AU",
    contactEmail: "sam@example.com",
    timezone: "Australia/Brisbane",
  });
  setVerificationTier(expert.partyId, "T2");
  addCapability({
    partyId: expert.partyId,
    kind: "SKILL",
    taxonomyIdOrLabel: "skill.support.remote_diagnostic",
    level: 4,
  });

  const buyer = createParty({
    kind: "ORGANISATION",
    legalName: "Northline Foods",
    jurisdiction: "AU",
    contactEmail: "ops@northline.example",
    timezone: "Australia/Brisbane",
  });

  const offering = createSessionOffering({
    expertPartyId: expert.partyId,
    type: "CONSULT_60",
    title: "Remote PLC diagnostic",
    description: "Live support for S7 faults",
    priceMinor: 25000,
    currency: "AUD",
    durationMinutes: 60,
    supportedMachineBrands: ["Siemens"],
    deliverableDefinition:
      "Structured session record with findings, recommendations and next steps",
  });

  const buyerCtx = {
    userId: "smoke",
    actingAsPartyId: buyer.partyId,
    idempotencyKey: "session-1",
  };

  let session = createEngagement({
    mode: "SESSION",
    title: offering.title,
    buyerPartyId: buyer.partyId,
    offeringId: offering.offeringId,
    ctx: buyerCtx,
  });
  assert(session.state === "OFFERED", "session should start OFFERED");
  const fee = discloseFee(session.engagementId);
  assert(fee.grossMinor === 25000, "gross mismatch");
  assert(fee.platformFeeMinor > 0, "platform fee required");
  assert(
    fee.netToContributorMinor ===
      fee.grossMinor - fee.platformFeeMinor - fee.providerFeeMinor,
    "net mismatch",
  );

  session = await transitionEngagement({
    engagementId: session.engagementId,
    toState: "BOOKED",
    ctx: { ...buyerCtx, idempotencyKey: "session-book" },
  });
  assert(
    session.milestones[0]?.state === "FUNDED",
    "milestone must be funded on book",
  );

  session = await transitionEngagement({
    engagementId: session.engagementId,
    toState: "AUTHORISED",
    ctx: { ...buyerCtx, idempotencyKey: "session-auth" },
  });
  session = await transitionEngagement({
    engagementId: session.engagementId,
    toState: "IN_SESSION",
    ctx: { ...buyerCtx, idempotencyKey: "session-in" },
  });
  session = await transitionEngagement({
    engagementId: session.engagementId,
    toState: "DELIVERABLE_SUBMITTED",
    ctx: {
      userId: "smoke",
      actingAsPartyId: expert.partyId,
      idempotencyKey: "session-deliv",
    },
    payload: {
      findings: "Intermittent encoder fault on axis 3",
      recommendations: "Replace encoder cable; check shield grounding",
      nextSteps: "Order spare; schedule follow-up FAT",
    },
  });
  assert(session.sessionRecord, "session record required");

  session = await transitionEngagement({
    engagementId: session.engagementId,
    toState: "ACCEPTED",
    ctx: { ...buyerCtx, idempotencyKey: "session-accept" },
  });
  assert(
    session.state === "PAID" || session.state === "ACCEPTED",
    `expected paid/accepted, got ${session.state}`,
  );
  assert(
    session.milestones[0]?.state === "PAID",
    "milestone should be PAID after accept",
  );

  const rep = getReputation(expert.partyId);
  assert(rep.events.length >= 1, "reputation event required");
  assert(
    rep.events.every((e) => !!e.transactionRef),
    "reputation must link to transaction",
  );

  const chain = getEventChain(session.engagementId);
  assert(chain.verification.ok, chain.verification.error ?? "chain broken");
  assert(chain.events.length >= 3, "expected event chain");

  // ── Job path (Phase 0 exit criterion) ──
  const contributor = createParty({
    kind: "INDIVIDUAL",
    legalName: "Jordan Automation",
    jurisdiction: "AU",
    contactEmail: "jordan@example.com",
    timezone: "Australia/Brisbane",
  });
  addCapability({
    partyId: contributor.partyId,
    kind: "SKILL",
    taxonomyIdOrLabel: "skill.automation.plc.siemens_tia",
    level: 5,
  });

  const jobCtx = {
    userId: "smoke",
    actingAsPartyId: buyer.partyId,
    idempotencyKey: "job-1",
  };
  let job = createEngagement({
    mode: "JOB",
    title: "Sauce line PLC extension",
    buyerPartyId: buyer.partyId,
    ctx: jobCtx,
  });
  addRequirement({
    engagementId: job.engagementId,
    kind: "SKILL",
    taxonomyIdOrLabel: "skill.automation.plc.siemens_tia",
    necessity: "MANDATORY",
    rationale: "Existing S7-1500 must be extended",
    ctx: jobCtx,
  });
  const actor = addContributor({
    engagementId: job.engagementId,
    partyId: contributor.partyId,
    ctx: jobCtx,
  });
  addMilestone({
    engagementId: job.engagementId,
    title: "Program + FAT",
    acceptanceCriteria: ["FAT signed", "Backup archived"],
    amountMinor: 1800000,
    contributorActorId: actor.actorId,
    ctx: jobCtx,
  });

  for (const to of [
    "PUBLISHED",
    "QUOTING",
    "AWARDED",
    "CONTRACTED",
    "FUNDED",
    "IN_PROGRESS",
  ] as const) {
    job = await transitionEngagement({
      engagementId: job.engagementId,
      toState: to,
      ctx: { ...jobCtx, idempotencyKey: `job-${to}` },
    });
  }
  assert(job.milestones[0]?.state === "IN_PROGRESS", "job milestone in progress");
  assert(job.agreements.length >= 1, "contract agreement required");

  submitMilestoneEvidence({
    engagementId: job.engagementId,
    milestoneId: job.milestones[0]!.milestoneId,
    type: "DOCUMENT",
    fileName: "fat.pdf",
    ctx: {
      userId: "smoke",
      actingAsPartyId: contributor.partyId,
    },
  });

  job = await transitionEngagement({
    engagementId: job.engagementId,
    toState: "SUBMITTED",
    ctx: { ...jobCtx, idempotencyKey: "job-submitted" },
  });
  job = await transitionEngagement({
    engagementId: job.engagementId,
    toState: "ACCEPTED",
    ctx: { ...jobCtx, idempotencyKey: "job-accepted" },
  });
  assert(job.milestones[0]?.state === "PAID", "job milestone paid");

  const jobChain = getEventChain(job.engagementId);
  assert(verifyEventChain(jobChain.events).ok, "job chain broken");

  const snap = snapshot();
  console.log(
    JSON.stringify(
      {
        ok: true,
        snapshot: snap,
        sessionId: session.engagementId,
        jobId: job.engagementId,
        sessionEvents: chain.events.length,
        jobEvents: jobChain.events.length,
        expertReputationEvents: rep.events.length,
        feeDisclosure: {
          gross: fee.grossMinor,
          platformFee: fee.platformFeeMinor,
          net: fee.netToContributorMinor,
        },
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
