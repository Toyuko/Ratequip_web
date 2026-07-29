"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { closeOrAwardRequest } from "@/lib/actions/marketplace";

export function RequestStatusActions({
  requestId,
  status,
  canManage,
}: {
  requestId: string;
  status: string;
  /** Server-resolved: signed-in buyer/admin (or authenticated demo session). */
  canManage: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "open" || !canManage) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await closeOrAwardRequest({
              requestId,
              status: "closed",
            });
            if (!result.ok) {
              setError(result.message);
              return;
            }
            router.refresh();
          })
        }
      >
        Close RFQ
      </Button>
      <Button
        size="sm"
        variant="secondary"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await closeOrAwardRequest({
              requestId,
              status: "awarded",
            });
            if (!result.ok) {
              setError(result.message);
              return;
            }
            router.refresh();
          })
        }
      >
        Mark awarded
      </Button>
      {error ? <p className="w-full text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
