import { enrichCompanyFromWeb } from "../src/lib/ai/company-web-enrich";

async function main() {
  const result = await enrichCompanyFromWeb({
    query: "InkjetPrint",
    websiteUrl: "https://inkjetprint.com.au/",
    country: "Australia",
  });
  if (!result.ok) {
    console.error(result);
    process.exit(1);
  }
  const e = result.enrichment;
  console.log(
    JSON.stringify(
      {
        name: e.companyName,
        phones: e.phones,
        phoneDisplay: e.phoneDisplay,
        emails: e.emails,
        addressLine: e.addressLine,
        locality: e.locality,
        region: e.region,
        postalCode: e.postalCode,
        country: e.countryCode,
        abn: e.abnOrRegistry,
        usedAi: e.usedAi,
        reasons: e.matchReasons,
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
