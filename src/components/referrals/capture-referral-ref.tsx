"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { captureReferralRef } from "@/lib/actions/referrals";

/**
 * Captures invite attribution into cookie so later verified events
 * can release progressive dual-sided credits.
 * Pass `code` for /join/[code]; otherwise reads ?ref=.
 */
export function CaptureReferralRef({ code }: { code?: string }) {
  const searchParams = useSearchParams();
  const ran = useRef<string | null>(null);

  useEffect(() => {
    const ref = (code || searchParams.get("ref") || "").trim();
    if (!ref || ran.current === ref) return;
    ran.current = ref;
    void captureReferralRef(ref);
  }, [code, searchParams]);

  return null;
}
