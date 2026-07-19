"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { RfqDraft } from "@/lib/rfq/draft";

export function RfqAiAssistant({
  onApply,
}: {
  onApply: (draft: RfqDraft) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  return (
    <div className="rounded-lg border border-orange-200 bg-orange-50/60 p-5 dark:border-orange-900/50 dark:bg-orange-950/20">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--rq-ink)]">
            AI RFQ assistant
          </h2>
          <p className="mt-1 text-xs text-[var(--rq-muted)]">
            Paste a URS excerpt or describe the equipment need. We draft title,
            line items, compliance, and must-have requirements for you to edit.
          </p>
        </div>
      </div>
      <div className="mt-3">
        <Label htmlFor="ai-prompt">Brief or pasted URS text</Label>
        <Textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="mt-1 min-h-28"
          placeholder="e.g. Two 800mm single deck sieves identical to Lao Soung LS800-1S, SS304 contact parts, GMP, deliver to Minto NSW in 10 weeks, 12 month warranty…"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button
          type="button"
          disabled={pending || prompt.trim().length < 20}
          onClick={() => {
            startTransition(async () => {
              setMessage(null);
              setError(false);
              try {
                const res = await fetch("/api/rfq/assist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ prompt }),
                });
                const data = (await res.json()) as {
                  ok: boolean;
                  message?: string;
                  draft?: RfqDraft;
                  source?: string;
                };
                if (!data.ok || !data.draft) {
                  setError(true);
                  setMessage(data.message ?? "Unable to draft RFQ.");
                  return;
                }
                onApply(data.draft);
                setMessage(
                  data.source === "ai"
                    ? (data.message ?? "Draft applied.")
                    : (data.message ?? "Starter draft applied."),
                );
              } catch {
                setError(true);
                setMessage("Assistant request failed. Try again.");
              }
            });
          }}
        >
          {pending ? "Drafting…" : "Draft with AI"}
        </Button>
        {message ? (
          <p
            className={`text-sm ${error ? "text-red-600" : "text-emerald-700"}`}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}
