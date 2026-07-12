const base = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";

const paths = [
  "/",
  "/suppliers",
  "/suppliers/nordicfill-systems",
  "/requests",
  "/pricing",
  "/search?q=filler",
  "/dashboard/buyer",
  "/dashboard/supplier",
  "/dashboard/admin",
  "/modules/intelligence",
  "/api/v1?resource=companies",
];

async function main() {
  let failed = 0;
  for (const path of paths) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url);
      const ok = res.status >= 200 && res.status < 400;
      console.log(`${ok ? "OK" : "FAIL"} ${res.status} ${path}`);
      if (!ok) failed += 1;
    } catch (error) {
      console.log(`FAIL 000 ${path} (${error instanceof Error ? error.message : "error"})`);
      failed += 1;
    }
  }
  if (failed > 0) {
    console.error(`Smoke failed: ${failed} routes`);
    process.exit(1);
  }
  console.log("Smoke passed.");
}

main();
