/**
 * Coverage query-expansion smoke (no network / AI).
 * Run: npx tsx scripts/coverage-query-smoke.ts
 */
import {
  buildCoverageQueries,
  looksLikeRosterHit,
} from "../src/lib/ai/coverage/query-expansion";
import { heuristicRosterExtract } from "../src/lib/ai/coverage/roster";
import { resolveEntityAgainstDirectory } from "../src/lib/ai/coverage/entity-resolution";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function run() {
  const company = buildCoverageQueries({
    query: "InkjetPrint",
    country: "Australia",
  });
  assert(company.primary.includes("InkjetPrint"), "primary keeps company name");
  assert(
    company.roster.some((q) => /distributor/i.test(q)),
    "company searches still probe distributors",
  );
  assert(
    company.regional.length === 0,
    "company-name searches should not blast regional category queries",
  );

  const category = buildCoverageQueries({
    query: "aseptic filling machines",
    country: "Germany",
  });
  assert(
    category.roster.some((q) => /exhibitor|brands we represent|member/i.test(q)),
    "category searches should probe roster sources",
  );
  assert(
    category.regional.some((q) => /Verpackung|Hersteller|VDMA|Interpack/i.test(q)),
    "Germany category searches should include German terms",
  );
  assert(category.all.length >= 6, "coverage query set should be rich");

  assert(
    looksLikeRosterHit({
      title: "Interpack 2023 exhibitors",
      url: "https://example.com/exhibitors",
      snippet: "Browse the exhibitor list",
    }),
    "exhibitor pages should classify as roster",
  );
  assert(
    !looksLikeRosterHit({
      title: "Acme Packaging — Home",
      url: "https://acmepackaging.example/",
      snippet: "We build filling lines",
    }),
    "single-company homes should not classify as roster",
  );

  const roster = heuristicRosterExtract({
    sourceUrl: "https://fair.example/exhibitors",
    text: "Welcome. Acme Filling GmbH · Beta Pack S.r.l. · Gamma Pty Ltd",
    html: `<a href="https://acme.example">Acme Filling GmbH</a>
           <a href="/members/beta">Beta Pack S.r.l.</a>`,
  });
  assert(roster.length >= 2, "heuristic roster should extract names");
  assert(
    roster.some((c) => /Acme Filling/i.test(c.rawName)),
    "should keep verbatim company names",
  );

  const same = resolveEntityAgainstDirectory({
    candidate: {
      rawName: "Acme Filling GmbH",
      website: "https://www.acmefilling.com",
      countryHint: "Germany",
    },
    existing: [
      {
        companyId: "c1",
        companySlug: "acme-filling",
        name: "Acme Filling GmbH",
        website: "https://acmefilling.com",
        city: "Hamburg",
        country: "Germany",
        claimed: false,
        verified: false,
        matchLevel: "exact",
        matchScore: 0.99,
        matchReasons: ["same domain", "similar name"],
      },
    ],
  });
  assert(same.decision === "same", "same name+domain should resolve same");
  assert(same.confidence >= 0.85, "same should be high confidence");

  const domainOnly = resolveEntityAgainstDirectory({
    candidate: {
      rawName: "Acme Filling Italia",
      website: "https://www.acmefilling.com",
      countryHint: "Italy",
    },
    existing: [
      {
        companyId: "c1",
        companySlug: "acme-filling",
        name: "Acme Filling GmbH",
        website: "https://acmefilling.com",
        city: "Hamburg",
        country: "Germany",
        claimed: false,
        verified: false,
        matchLevel: "exact",
        matchScore: 0.99,
        matchReasons: ["same domain"],
      },
    ],
  });
  assert(
    domainOnly.decision === "uncertain" ||
      domainOnly.decision === "subsidiary_of" ||
      domainOnly.decision === "different",
    "domain-only with different names must not auto-merge",
  );

  console.log("coverage-query-smoke: ok", {
    companyQueries: company.all.length,
    categoryQueries: category.all.length,
    rosterExtracted: roster.length,
    sameDecision: same.decision,
    domainOnlyDecision: domainOnly.decision,
  });
}

run();
