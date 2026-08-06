/**
 * Part 7 Business DNA smoke — requires ENTERPRISE_PART7_ENABLED=true
 */
import { resetV12Store } from "@/lib/v12/store";
import {
  confirmCompanySetup,
  listCompanySetup,
  part7ConfirmFact,
  part7IngestFact,
  part7ResumeSession,
  reviewCompanySetupSuggestions,
  saveCompanySetupSection,
  startCompanySetup,
} from "@/lib/v12/services";
import { isPart7Enabled } from "@/lib/v13/flags";
import { resetPart7Store } from "@/lib/v13/part7/store";
import { adjacentTaxonomyKeys, graphProximityScore } from "@/lib/v13/part7/graph";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

async function main() {
  process.env.ENTERPRISE_PART7_ENABLED = "true";
  process.env.ENTERPRISE_GRAPH_MATCH_ENABLED = "true";
  assert(isPart7Enabled(), "Part 7 flag should be on for this smoke");

  resetV12Store();
  resetPart7Store();

  const start = startCompanySetup({
    companyName: "Part7 Smoke Foods Pty Ltd",
    role: "buyer",
    industryPack: "pet_food",
  });
  assert(start.ok, "start failed");
  assert(start.dna?.enabled, "dna not enabled on start");
  assert((start.dna?.facts?.length ?? 0) > 0, "expected seed facts");
  const sessionId = start.session.id;

  const section = start.session.sections[0];
  assert(section, "missing first section");
  const answers: Record<string, string> = {};
  for (const q of section.questions) {
    answers[q.id] =
      q.options?.[0]?.value ?? (q.required ? "smoke-answer" : "unknown");
  }
  let save = saveCompanySetupSection({ sessionId, answers, advance: true });
  assert(save.ok, "save section failed");

  // Advance through remaining sections
  while (save.ok && save.session.status === "in_progress") {
    const cur = save.session.sections[save.session.sectionIndex];
    const nextAnswers: Record<string, string> = { ...save.session.answers };
    if (cur) {
      for (const q of cur.questions) {
        if (!nextAnswers[q.id]) {
          nextAnswers[q.id] =
            q.options?.[0]?.value ?? (q.required ? "smoke-answer" : "unknown");
        }
      }
    }
    save = saveCompanySetupSection({
      sessionId,
      answers: nextAnswers,
      advance: true,
    });
    assert(save.ok, "advance failed");
  }

  assert(save.ok && save.session.status === "review", "expected review status");

  const inferred = (save.dna?.facts ?? []).filter(
    (f) => f.confirmationStatus === "inferred",
  );
  if (inferred[0]) {
    const conf = part7ConfirmFact({
      sessionId,
      factId: inferred[0].id,
      status: "confirmed",
      actorId: "smoke-actor",
    });
    assert(conf.ok, "confirm fact failed");
    assert(
      conf.ok && conf.fact.confirmationStatus === "confirmed",
      "fact not confirmed",
    );
  }

  const ingest = part7IngestFact({
    sessionId,
    predicate: "facility.sites",
    value: 2,
    confidence: 0.7,
    createdBy: "smoke-actor",
    idempotencyKey: `${sessionId}:facility.sites`,
  });
  assert(ingest.ok, "ingest failed");
  const ingest2 = part7IngestFact({
    sessionId,
    predicate: "facility.sites",
    value: 2,
    confidence: 0.7,
    createdBy: "smoke-actor",
    idempotencyKey: `${sessionId}:facility.sites`,
  });
  assert(ingest2.ok && ingest.ok && ingest2.fact.id === ingest.fact.id, "idempotency broken");

  const resume = part7ResumeSession({ sessionId });
  assert(resume.ok, "resume failed");
  assert(resume.ok && (resume.dna.facts?.length ?? 0) > 0, "resume lost facts");

  for (const s of save.session.suggestions) {
    reviewCompanySetupSuggestions({
      sessionId,
      decisions: [{ id: s.id, status: "accepted" }],
    });
  }

  const confirmed = confirmCompanySetup({
    sessionId,
    confirmedBy: "smoke-actor",
  });
  assert(confirmed.ok, "confirm setup failed");
  assert(
    confirmed.ok && confirmed.dna?.profile?.profileStatus === "confirmed",
    "dna profile not confirmed",
  );

  const listed = listCompanySetup(sessionId);
  assert(listed.dna.enabled, "list dna disabled");

  const adj = adjacentTaxonomyKeys(["tax:rq:industry.food_beverage"], 1);
  assert(adj.length > 1, "graph adjacency empty");
  const prox = graphProximityScore({
    requirementKeys: ["tax:rq:industry.food_beverage"],
    candidateKeys: adj.slice(0, 3),
  });
  assert(prox.score > 0, "graph proximity expected with flag on");

  // Tenant isolation: wrong company cannot confirm
  resetPart7Store();
  resetV12Store();
  const a = startCompanySetup({
    companyName: "Tenant A Co",
    role: "buyer",
    industryPack: "pet_food",
  });
  const b = startCompanySetup({
    companyName: "Tenant B Co",
    role: "supplier",
    industryPack: "pharma_capping",
  });
  assert(a.ok && b.ok, "tenant setup failed");
  const foreignFact = a.dna?.facts?.[0];
  assert(foreignFact, "missing fact for isolation test");
  const blocked = part7ConfirmFact({
    sessionId: b.session.id,
    factId: foreignFact.id,
    status: "confirmed",
    actorId: "attacker",
  });
  assert(!blocked.ok, "tenant isolation failed — cross-company confirm allowed");

  console.log(
    JSON.stringify(
      {
        ok: true,
        factsSeeded: start.dna?.facts?.length ?? 0,
        adjacency: adj.length,
        graphScore: prox.score,
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
