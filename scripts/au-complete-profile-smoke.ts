import {
  enrichCompanyFromWeb,
  enrichmentToListingFields,
} from "../src/lib/ai/company-web-enrich";
import {
  startListingSubmission,
  updateListingSubmission,
  publishListingSubmission,
} from "../src/lib/actions/organic-growth";
import { getCompanyBySlugAsync } from "../src/lib/db/phase2";

async function main() {
  const query = "Bega Group";
  const websiteUrl = "https://www.begagroup.com.au/";
  console.log("Enriching", query, websiteUrl);

  const enriched = await enrichCompanyFromWeb({
    query,
    websiteUrl,
    country: "Australia",
  });
  if (!enriched.ok) {
    console.error("Enrich failed", enriched);
    process.exit(1);
  }

  const e = enriched.enrichment;
  const fields = enrichmentToListingFields(e);
  console.log(
    "ENRICHMENT",
    JSON.stringify(
      {
        name: e.companyName,
        website: e.websiteUrl,
        phones: e.phones,
        phoneDisplay: e.phoneDisplay,
        emails: e.emails,
        addressLine: e.addressLine,
        locality: e.locality,
        region: e.region,
        postalCode: e.postalCode,
        country: e.countryCode,
        abn: e.abnOrRegistry,
        types: e.companyTypes,
        profiles: e.publicProfiles?.slice(0, 4),
        usedAi: e.usedAi,
        confidence: e.confidence,
      },
      null,
      2,
    ),
  );

  const started = await startListingSubmission({
    searchQuery: query,
    enrichment: {
      companyName: fields.companyName || "Bega Group",
      websiteUrl: fields.websiteUrl || websiteUrl,
      companyTypes:
        fields.companyTypes.length > 0
          ? fields.companyTypes
          : ["manufacturer"],
      countryCode: fields.countryCode || "Australia",
      locality: fields.locality || "Bega",
      region: fields.region || "NSW",
      addressLine: fields.addressLine,
      postalCode: fields.postalCode,
      phoneDisplay: fields.phoneDisplay,
      phoneNumbers: fields.phoneNumbers,
      emailCandidates: fields.emailCandidates,
      abnOrRegistry: fields.abnOrRegistry,
      publicSourceUrl: fields.publicSourceUrl || websiteUrl,
      privateNotes:
        fields.privateNotes ||
        e.description ||
        "Australian dairy and food company. Profile auto-built from begagroup.com.au.",
      categories: ["packaging-machinery"],
    },
  });
  if (!started.ok) {
    console.error(started);
    process.exit(1);
  }

  const draft = {
    ...started.submission,
    companyName: started.submission.companyName || "Bega Group",
    companyTypes:
      started.submission.companyTypes.length > 0
        ? started.submission.companyTypes
        : (["manufacturer"] as const),
    countryCode: started.submission.countryCode || "Australia",
    locality: started.submission.locality || "Bega",
    region: started.submission.region || "NSW",
    categories:
      started.submission.categories.length > 0
        ? started.submission.categories
        : ["packaging-machinery"],
    declarationsAccepted: true,
    disclosurePreference: "anonymous_ratequip_user" as const,
    skipContacts: true,
  };
  await updateListingSubmission(draft);
  const published = await publishListingSubmission({
    id: draft.id,
    declarationsAccepted: true,
    disclosurePreference: "anonymous_ratequip_user",
    draft,
  });
  if (!published.ok) {
    console.error(published);
    process.exit(1);
  }

  const company = await getCompanyBySlugAsync(published.companySlug!);
  console.log(
    "PUBLISHED_PROFILE",
    JSON.stringify(
      {
        slug: company?.slug ?? published.companySlug,
        name: company?.name,
        website: company?.website,
        phone: company?.phone,
        phones: company?.phones,
        emails: company?.emails,
        addressLine: company?.addressLine,
        city: company?.city,
        region: company?.region,
        postalCode: company?.postalCode,
        country: company?.country,
        abn: company?.abn,
        profileUrl: `http://localhost:3000/companies/${company?.slug ?? published.companySlug}`,
        note:
          "In-process publish succeeds; Next.js needs the same store or demo-data seed to render this slug.",
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
