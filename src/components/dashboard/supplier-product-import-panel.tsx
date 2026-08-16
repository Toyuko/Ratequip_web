"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  importMarketplaceCatalogue,
  publishMarketplaceImport,
  reviewMarketplaceDraft,
} from "@/lib/actions/catalogue-import";

type DraftRow = {
  id: string;
  jobId: string;
  title: string;
  status: string;
  publishable: boolean;
  summary?: string;
  page: number;
};

export function SupplierProductImportPanel({
  companySlug,
  autoFocusUrl = false,
}: {
  companySlug: string;
  autoFocusUrl?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [sourceUrl, setSourceUrl] = useState("");

  return (
    <div
      className={`space-y-4 rounded-lg border bg-[var(--rq-card)] p-5 ${
        autoFocusUrl
          ? "border-orange-400 ring-2 ring-orange-200"
          : "border-[var(--rq-border)]"
      }`}
    >
      <div>
        <Badge variant="orange">Marketplace import</Badge>
        <h2 className="mt-2 text-lg font-semibold text-[var(--rq-ink)]">
          Paste a Machines4u URL
        </h2>
        <p className="mt-1 text-sm text-[var(--rq-slate)]">
          Import dealer stock from Machines4u or a similar public listing page.
          Review each draft, then publish to your RateQuip catalogue.
        </p>
      </div>

      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const url = String(fd.get("sourceUrl") || "").trim();
          const rights = fd.get("rights") === "on";
          setError(null);
          setMessage(null);
          startTransition(async () => {
            const res = await importMarketplaceCatalogue({
              sourceUrl: url,
              rightsAttested: rights,
              companySlug,
            });
            if (!res.ok) {
              setError(res.message);
              return;
            }
            setActiveJobId(res.job.id);
            setDrafts(
              res.drafts.map((d) => ({
                id: d.id,
                jobId: d.jobId,
                title: d.title,
                status: d.status,
                publishable: d.publishable,
                summary: d.summary,
                page: d.page,
              })),
            );
            setSourceUrl(res.sourceUrl ?? url);
            setMessage(res.message);
          });
        }}
      >
        <div>
          <Label htmlFor="sourceUrl">Dealer or listing URL</Label>
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            inputMode="url"
            placeholder="https://www.machines4u.com.au/…"
            className="mt-1"
            required
            defaultValue={sourceUrl}
            autoFocus={autoFocusUrl}
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-[var(--rq-slate)]">
          <input type="checkbox" name="rights" className="mt-1" required />
          I confirm my company has the right to import and publish these
          listings on RateQuip.
        </label>
        <Button type="submit" disabled={pending}>
          {pending ? "Fetching listings…" : "Fetch & create drafts"}
        </Button>
      </form>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      {drafts.length > 0 ? (
        <div className="space-y-3 border-t border-[var(--rq-border)] pt-4">
          <h3 className="text-sm font-semibold text-[var(--rq-ink)]">
            Draft products
          </h3>
          <ul className="space-y-3">
            {drafts.map((d) => (
              <li
                key={d.id}
                className="rounded-md border border-[var(--rq-border)] bg-[var(--rq-bg)] p-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-[var(--rq-ink)]">{d.title}</p>
                    {d.summary ? (
                      <p className="mt-1 text-xs text-[var(--rq-muted)]">
                        {d.summary}
                      </p>
                    ) : null}
                  </div>
                  <Badge
                    variant={
                      d.status === "accepted"
                        ? "success"
                        : d.status === "rejected"
                          ? "muted"
                          : "orange"
                    }
                  >
                    {d.status}
                  </Badge>
                </div>
                {d.status === "draft" ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await reviewMarketplaceDraft({
                            draftId: d.id,
                            decision: "accepted",
                          });
                          if (!res.ok) {
                            setError(res.message);
                            return;
                          }
                          setDrafts((prev) =>
                            prev.map((row) =>
                              row.id === d.id
                                ? {
                                    ...row,
                                    status: "accepted",
                                    publishable: true,
                                  }
                                : row,
                            ),
                          );
                        })
                      }
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await reviewMarketplaceDraft({
                            draftId: d.id,
                            decision: "rejected",
                          });
                          if (!res.ok) {
                            setError(res.message);
                            return;
                          }
                          setDrafts((prev) =>
                            prev.map((row) =>
                              row.id === d.id
                                ? {
                                    ...row,
                                    status: "rejected",
                                    publishable: false,
                                  }
                                : row,
                            ),
                          );
                        })
                      }
                    >
                      Reject
                    </Button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>

          {activeJobId ? (
            <Button
              disabled={
                pending ||
                !drafts.some((d) => d.status === "accepted" && d.publishable)
              }
              onClick={() =>
                startTransition(async () => {
                  const res = await publishMarketplaceImport({
                    jobId: activeJobId,
                    companySlug,
                  });
                  if (!res.ok) {
                    setError(res.message);
                    return;
                  }
                  setMessage(res.message);
                  setDrafts([]);
                  setActiveJobId(null);
                  router.refresh();
                })
              }
            >
              Publish accepted to catalogue
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
