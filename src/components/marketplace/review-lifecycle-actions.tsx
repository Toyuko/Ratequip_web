"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { appealReview, respondToReview } from "@/lib/actions/marketplace";

export function ReviewLifecycleActions({
  reviewId,
  canRespond,
  canAppeal,
  existingResponse,
}: {
  reviewId: string;
  canRespond: boolean;
  canAppeal: boolean;
  existingResponse?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [response, setResponse] = useState("");
  const [appeal, setAppeal] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  if (!canRespond && !canAppeal) return null;

  return (
    <div className="mt-3 space-y-3 border-t border-[var(--rq-border)] pt-3">
      {existingResponse ? (
        <p className="text-sm text-[var(--rq-slate)]">
          <span className="font-medium text-[var(--rq-ink)]">Supplier response:</span>{" "}
          {existingResponse}
        </p>
      ) : null}

      {canRespond && !existingResponse ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Supplier response (public)"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={3}
          />
          <Button
            size="sm"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await respondToReview({
                  reviewId,
                  body: response,
                });
                setError(!result.ok);
                setMessage(result.message);
                if (result.ok) {
                  setResponse("");
                  router.refresh();
                }
              })
            }
          >
            Publish response
          </Button>
        </div>
      ) : null}

      {canAppeal ? (
        <div className="space-y-2">
          <Textarea
            placeholder="Appeal reason (re-queues for moderation)"
            value={appeal}
            onChange={(e) => setAppeal(e.target.value)}
            rows={2}
          />
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await appealReview({
                  reviewId,
                  reason: appeal,
                });
                setError(!result.ok);
                setMessage(result.message);
                if (result.ok) {
                  setAppeal("");
                  router.refresh();
                }
              })
            }
          >
            Submit appeal
          </Button>
        </div>
      ) : null}

      {message ? (
        <p className={`text-xs ${error ? "text-red-600" : "text-emerald-700"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
