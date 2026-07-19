/**
 * V12 engines + commercial spine smoke (no HTTP server required).
 */
import { evaluateRule } from "../src/lib/v12/dqe/rule-engine";
import { resolveQuestions } from "../src/lib/v12/dqe/resolver";
import { scoreMatch, evaluateEligibility } from "../src/lib/v12/matching/scorer";
import { DEFAULT_MATCH_POLICY } from "../src/lib/v12/matching/types";
import { rankCandidates } from "../src/lib/v12/recommendations/ranker";
import { mayExecuteWithoutConfirmation } from "../src/lib/v12/ai/confirmation-policy";
import {
  createAIDraft,
  confirmAIDraft,
  createRequisition,
  approveRequisition,
  createRfqRevision,
  awardRfq,
  runExplainableMatch,
  resolveActivationPack,
} from "../src/lib/v12/services";
import { resetV12Store } from "../src/lib/v12/store";
import { questionsForPack } from "../src/lib/v12/seeds";

async function main() {
  resetV12Store();

  if (!evaluateRule({ const: true }, { roles: [], answers: {}, taxonomy: new Set(), permissions: new Set() })) {
    throw new Error("rule engine failed");
  }

  const pack = resolveActivationPack({ packId: "universal", roles: ["buyer"] });
  if (pack.questions.length < 1) throw new Error("DQE pack empty");

  const qs = questionsForPack("role.buyer");
  const resolved = resolveQuestions(
    qs.map((q, i) => ({ ...q, display_order: q.display_order ?? i, version: 1 })),
    { roles: ["buyer"], answers: {}, taxonomy: new Set(), permissions: new Set() },
  );
  if (resolved.length < 1) throw new Error("role.buyer unresolved");

  const eligibility = evaluateEligibility({
    hasRequiredCapability: true,
    inJurisdiction: true,
    serviceable: true,
    deadlineOk: true,
  });
  if (!eligibility.eligible) throw new Error("eligibility failed");

  const scored = scoreMatch(
    [
      { key: "capability", value: 0.9, weight: 0.22, reasonCode: "capability_coverage" },
      { key: "trust", value: 0.8, weight: 0.1, reasonCode: "trust_score" },
      { key: "geography", value: 0.7, weight: 0.12, reasonCode: "geo_serviceability" },
    ],
    DEFAULT_MATCH_POLICY,
  );
  if (scored.score < 40) throw new Error("score too low");

  const ranked = rankCandidates(
    [
      {
        id: "a",
        eligible: true,
        organicScore: 88,
        sponsored: false,
        category: "packaging",
        reasonCodes: scored.reasons,
      },
      {
        id: "b",
        eligible: true,
        organicScore: 70,
        sponsored: true,
        category: "packaging",
        reasonCodes: ["sponsored"],
      },
    ],
    5,
  );
  if (ranked[0]?.id !== "a") throw new Error("ranking order wrong");

  if (mayExecuteWithoutConfirmation({
    type: "publish_rfq",
    draftId: "x",
    companyId: "c",
    requestedBy: "u",
  })) {
    throw new Error("publish_rfq must require confirmation");
  }

  const match = await runExplainableMatch({
    requirementLabel: "filler",
    requiredCategory: "packaging-machinery",
  });
  if (!match.results.length) throw new Error("match empty");

  const draft = createAIDraft({
    type: "publish_rfq",
    title: "Smoke draft",
    body: "body",
    companyId: "c1",
    requestedBy: "u1",
  });
  const confirmed = confirmAIDraft({
    draftId: draft.id,
    confirmedBy: "u1",
  });
  if (!confirmed.ok || confirmed.draft?.status !== "confirmed") {
    throw new Error("AI confirm failed");
  }

  const reqn = createRequisition({
    title: "Smoke requisition",
    description: "desc",
    taxonomyKeys: ["tax:rq:industry.food_beverage"],
    budgetMax: 1,
  });
  const approved = approveRequisition(reqn.id);
  if (!approved.ok) throw new Error("requisition approve failed");

  const rev = createRfqRevision({
    rfqId: "req-1",
    payload: { note: "smoke" },
    createdBy: "u1",
  });
  if (rev.revision !== 1) throw new Error("revision numbering failed");

  const award = awardRfq({
    rfqId: "req-1",
    quoteId: "q-1",
    supplierSlug: "nordicfill-systems",
    amount: 100,
    currency: "USD",
    reasonCodes: ["commercial_fit"],
    awardedBy: "u1",
  });
  if (!award.id) throw new Error("award failed");

  console.log("V12 smoke passed.", {
    questions: pack.questions.length,
    matchCount: match.results.length,
    awardId: award.id,
    policy: scored.policyVersion,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
