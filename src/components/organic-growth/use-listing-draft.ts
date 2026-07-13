"use client";

import { useEffect, useState } from "react";
import type { ListingSubmissionDraft } from "@/lib/organic-growth/types";

const STORAGE_KEY = "rq-og-listing-draft-v10.1";

export function readLocalDraft(): ListingSubmissionDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ListingSubmissionDraft) : null;
  } catch {
    return null;
  }
}

export function writeLocalDraft(draft: ListingSubmissionDraft) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
}

export function clearLocalDraft() {
  window.sessionStorage.removeItem(STORAGE_KEY);
}

export function useListingDraft() {
  const [draft, setDraft] = useState<ListingSubmissionDraft | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDraft(readLocalDraft());
    setReady(true);
  }, []);

  function save(next: ListingSubmissionDraft) {
    writeLocalDraft(next);
    setDraft(next);
  }

  return { draft, ready, save, clear: clearLocalDraft };
}
