/**
 * Free-tier AI Gateway model for RFQ assistants.
 * Gemini Flash is allowed without paid credits; keep requests lean (no heavy retries).
 * Override with RFQ_AI_MODEL if needed later.
 */
export const RFQ_AI_MODEL =
  process.env.RFQ_AI_MODEL?.trim() || "google/gemini-2.5-flash";

/** Avoid burning free-tier quota on automatic retries. */
export const RFQ_AI_MAX_RETRIES = 0;

export function aiFallbackMessage(error: unknown, kind: "draft" | "project") {
  const raw =
    error instanceof Error
      ? `${error.message} ${String((error as { lastError?: { message?: string } }).lastError?.message ?? "")}`
      : String(error ?? "");
  const rateLimited = /rate.?limit|rate_limit|429/i.test(raw);

  if (kind === "draft") {
    return rateLimited
      ? "Free-tier AI is briefly rate-limited — used a local starter draft. Try again in a minute, or edit manually."
      : "Used a local starter draft from your text. Review carefully before posting.";
  }

  return rateLimited
    ? "Free-tier AI is briefly rate-limited — used the rules-based project map. Try again shortly for a richer AI breakdown."
    : "Starter project map from your RFQ/URS — review add-ons and compare indicative prices.";
}
