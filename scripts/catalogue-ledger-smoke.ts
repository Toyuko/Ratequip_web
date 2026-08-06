/**
 * Module 68 credit reservation + publishability smoke.
 */
import {
  estimateCredits,
  isFieldPublishable,
  productPublishability,
  reconcileCatalogueCredits,
  reserveCatalogueCredits,
} from "@/lib/v12/catalogue-factory/domain";
import { resetCatalogCreditLedger } from "@/lib/v12/catalogue-factory/credit-ledger";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

process.env.ENTERPRISE_CATALOGUE_LEDGER_ENABLED = "true";
resetCatalogCreditLedger();

const estimate = estimateCredits({
  pages: 10,
  scannedPages: 2,
  complexTables: 1,
  products: 3,
  variants: 1,
  images: 2,
});
assert(estimate > 0, "estimate should be positive");

const reserved = reserveCatalogueCredits("job-smoke-1", estimate);
assert(reserved.ledgerEnabled, "ledger should be enabled");
assert(reserved.reservation?.status === "RESERVED", "should reserve");
const again = reserveCatalogueCredits("job-smoke-1", estimate);
assert(
  again.reservation?.key === reserved.reservation?.key,
  "reservation must be idempotent",
);

const reconciled = reconcileCatalogueCredits("job-smoke-1", estimate * 0.5);
assert(reconciled.status === "RECONCILED", "should reconcile");
assert(reconciled.released > 0, "should release unused");

assert(
  !isFieldPublishable({
    name: "title",
    value: "x",
    classification: "AI_SUGGESTED",
    confidence: 0.99,
    evidence: [{ documentId: "d", versionId: "v", page: 1, sourceText: "x" }],
  }),
  "AI_SUGGESTED never publishable",
);

const gate = productPublishability([
  {
    name: "title",
    value: "Filler",
    classification: "SUPPLIER_CONFIRMED",
    confidence: 1,
    evidence: [],
  },
]);
assert(gate.publishable, "supplier confirmed should publish");

console.log(JSON.stringify({ ok: true, estimate, reconciled }, null, 2));
