/**
 * Company web enrichment smoke.
 * Run: npx tsx scripts/company-web-enrich-smoke.ts
 */
import {
  discoverCompaniesFromWeb,
  enrichCompanyFromWeb,
  enrichmentToListingFields,
} from "../src/lib/ai/company-web-enrich";
import { resolveAbrEntity } from "../src/lib/ai/abr-lookup";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const abr = await resolveAbrEntity({ query: "InkJetPrint" });
  assert(abr.entity, "ABN Lookup should resolve InkJetPrint");
  assert(
    abr.entity.abn === "70604909711",
    `unexpected ABN ${abr.entity?.abn}`,
  );
  assert(
    abr.entity.entityName.toUpperCase().includes("INKJETPRINT"),
    `unexpected registry name ${abr.entity.entityName}`,
  );
  console.log("abr tier-1:", {
    name: abr.entity.entityName,
    abn: abr.entity.abnFormatted,
    status: abr.entity.status,
    transport: abr.entity.transport,
    sourcesChecked: abr.sourcesChecked,
  });

  const direct = await enrichCompanyFromWeb({
    query: "InkjetPrint",
    websiteUrl: "https://inkjetprint.com.au/",
    country: "Australia",
  });
  assert(direct.ok, "direct enrich should succeed");
  assert(direct.enrichment.websiteUrl, "website should be set");
  assert(
    direct.enrichment.abnOrRegistry?.replace(/\s/g, "") === "70604909711",
    `expected Tier-1 ABN, got ${direct.enrichment.abnOrRegistry}`,
  );
  assert(
    direct.enrichment.registryMeta?.provider === "abn_lookup",
    "registryMeta should mark abn_lookup",
  );
  assert(
    (direct.enrichment.legalName || "")
      .toUpperCase()
      .includes("INKJETPRINT") ||
      direct.enrichment.companyName.toLowerCase().includes("inkjet"),
    `unexpected name ${direct.enrichment.companyName} / ${direct.enrichment.legalName}`,
  );

  const fields = enrichmentToListingFields(direct.enrichment);
  assert(fields.companyName, "listing fields name");
  console.log("direct enrich:", {
    name: fields.companyName,
    legalName: direct.enrichment.legalName,
    website: fields.websiteUrl,
    locality: fields.locality,
    region: fields.region,
    postalCode: fields.postalCode,
    phone: fields.phoneDisplay,
    abn: fields.abnOrRegistry,
    registry: direct.enrichment.registryMeta,
    usedAi: direct.enrichment.usedAi,
    source: direct.enrichment.source,
    confidence: direct.enrichment.confidence,
  });

  const discovery = await discoverCompaniesFromWeb({
    query: "inkjetprint.com.au",
    country: "Australia",
    limit: 2,
  });
  assert(discovery.enrichments.length >= 1, "discovery should return candidates");
  console.log("discovery:", {
    count: discovery.enrichments.length,
    message: discovery.message,
    first: discovery.enrichments[0]?.companyName,
    firstAbn: discovery.enrichments[0]?.abnOrRegistry,
  });

  console.log("company-web-enrich-smoke: OK");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
