"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { closeOrAwardRequest } from "@/lib/actions/marketplace";

export function RequestStatusActions({
  requestId,
  status,
}: {
  requestId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (status !== "open") return null;

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await closeOrAwardRequest({ requestId, status: "closed" });
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
            await closeOrAwardRequest({ requestId, status: "awarded" });
            router.refresh();
          })
        }
      >
        Mark awarded
      </Button>
    </div>
  );
}
