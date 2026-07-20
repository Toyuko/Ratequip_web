"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  v12ConfirmUsagePreview,
  v12CreateCatalogImport,
  v12ListCatalogFactory,
  v12PreviewCatalogImport,
  v12ProcessCatalogImport,
  v12PublishCatalogJob,
  v12ReviewCatalogDraft,
} from "@/lib/actions/v12";

const SAMPLE = `Automatic Packaging Systems — Product Catalogue

Model: AutoBag-1200 bagging machine
Capacity: 20-60 bags/min, PE/PP film

Model: SealGuard-V vertical sealer
Capacity: up to 40 packs/min

Model: InspectEye vision inspection system
Checks: foil presence, seal integrity

Model: PalletPro-X palletising system
Payload: 50 kg per cycle
`;

export default function CatalogueFactoryPage() {
  const [jobs, setJobs] = useState<
    Array<{
      id: string;
      title: string;
      status: string;
      estimatedCredits?: number;
    }>
  >([]);
  const [drafts, setDrafts] = useState<
    Array<{
      id: string;
      jobId: string;
      title: string;
      status: string;
      page: number;
      publishable: boolean;
    }>
  >([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = () =>
    startTransition(async () => {
      const data = await v12ListCatalogFactory();
      setJobs(data.jobs);
      setDrafts(data.drafts);
      setRemaining(data.entitlementRemaining);
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Catalogue helper</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Turn my catalogue into product drafts
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Paste supplier catalogue text. RateQuip estimates the credit cost, then
        builds draft products for you to accept or reject. Nothing goes public
        until you publish accepted drafts.{" "}
        <Link href="/v12" className="text-orange-700 underline">
          Back to guide
        </Link>
      </p>

      {remaining != null ? (
        <p className="mt-3 text-sm text-[var(--rq-muted)]">
          Credits left: <strong>{remaining}</strong>
        </p>
      ) : null}

      <form
        className="mt-8 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const created = await v12CreateCatalogImport({
              title: String(fd.get("title")),
              sourceText: String(fd.get("body")),
              createdBy: "supplier@demo.ratequip.com",
              rightsAttested: fd.get("rights") === "on",
            });
            if (!created.ok) {
              setMessage(created.message);
              return;
            }
            const previewRes = await v12PreviewCatalogImport(created.job.id);
            if (!previewRes.ok) {
              setMessage(previewRes.message);
              return;
            }
            await v12ConfirmUsagePreview({
              previewId: previewRes.preview.id,
              confirmedBy: "supplier@demo.ratequip.com",
            });
            const processed = await v12ProcessCatalogImport({
              jobId: created.job.id,
              previewId: previewRes.preview.id,
              confirmUsage: true,
              usePackagingFixture: true,
            });
            if (!processed.ok) {
              setMessage(processed.message);
              return;
            }
            setActiveJobId(created.job.id);
            setMessage(
              `Created ${processed.drafts.length} drafts · estimated ${created.job.estimatedCredits} credits · remaining ${processed.entitlementRemaining}`,
            );
            e.currentTarget.reset();
            reload();
          });
        }}
      >
        <div>
          <Label htmlFor="title">Catalogue title</Label>
          <Input
            id="title"
            name="title"
            defaultValue="Packaging line brochure"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="body">Catalogue text</Label>
          <Textarea
            id="body"
            name="body"
            rows={10}
            className="mt-1 font-mono text-sm"
            defaultValue={SAMPLE}
            required
          />
        </div>
        <label className="flex items-start gap-2 text-sm text-[var(--rq-slate)]">
          <input type="checkbox" name="rights" className="mt-1" required />
          I confirm my company has the right to upload and process this
          catalogue on RateQuip.
        </label>
        <Button type="submit" disabled={pending}>
          Estimate cost &amp; create drafts
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Import jobs
      </h2>
      <ul className="mt-3 space-y-2">
        {jobs.length === 0 ? (
          <li className="text-sm text-[var(--rq-muted)]">No imports yet.</li>
        ) : (
          jobs.map((j) => (
            <li
              key={j.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-3 text-sm"
            >
              <span className="font-medium text-[var(--rq-ink)]">{j.title}</span>
              <Badge variant="muted">{j.status}</Badge>
            </li>
          ))
        )}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Draft products (accept or reject)
      </h2>
      <ul className="mt-3 space-y-3">
        {drafts
          .filter((d) => !activeJobId || d.jobId === activeJobId)
          .map((d) => (
            <li
              key={d.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-[var(--rq-ink)]">{d.title}</span>
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
              <p className="mt-1 text-xs text-[var(--rq-muted)]">
                Page {d.page}
                {d.publishable ? " · ready to publish" : ""}
              </p>
              {d.status === "draft" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await v12ReviewCatalogDraft({
                          draftId: d.id,
                          decision: "accepted",
                          reviewerId: "supplier@demo.ratequip.com",
                        });
                        reload();
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
                        await v12ReviewCatalogDraft({
                          draftId: d.id,
                          decision: "rejected",
                          reviewerId: "supplier@demo.ratequip.com",
                        });
                        reload();
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
          className="mt-6"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const res = await v12PublishCatalogJob({
                jobId: activeJobId,
                publisherId: "supplier@demo.ratequip.com",
              });
              setMessage(
                res.ok
                  ? `Published ${res.publishedCount} products (${res.heldCount} held back)`
                  : res.message,
              );
              reload();
            })
          }
        >
          Publish accepted drafts
        </Button>
      ) : null}
    </div>
  );
}
