"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  v12AnswerIntelQuestion,
  v12ConfirmRequirement,
  v12ConfirmUsagePreview,
  v12ListAnalysis,
  v12PreviewUrsUsage,
  v12RejectRequirement,
  v12UploadAnalyzeUrs,
} from "@/lib/actions/v12";

const SAMPLE_URS = `URS — Pharmaceutical capping line
The machine shall be a single head capper capable of 20-60 containers/min.
It must accept screw and press-on caps.
Infeed after counting/filling shall be provided.
Foil presence and cap-height inspection are required with reject tray.
Checkweigher outfeed and validation documentation (FAT/SAT) are mandatory.`;

type Req = {
  id: string;
  originalText: string;
  classification: string;
  confidence: number;
  reviewerStatus: string;
  evidence: Array<{ clause?: string; contentHash: string }>;
};

export default function RequirementLedgerPage() {
  const [packs, setPacks] = useState<string[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<Req[]>([]);
  const [gaps, setGaps] = useState<Array<{ id: string; title: string; severity: string }>>([]);
  const [questions, setQuestions] = useState<
    Array<{ id: string; questionText: string; answer?: string; blocksPublication: boolean }>
  >([]);
  const [recommendations, setRecommendations] = useState<
    Array<{ id: string; title: string; classification: string; buyerConfirmationStatus: string }>
  >([]);
  const [readiness, setReadiness] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const reload = (id?: string) =>
    startTransition(async () => {
      const data = await v12ListAnalysis(id);
      setPacks(data.packs);
      setRunId(data.run?.id ?? null);
      setRequirements(data.requirements);
      setGaps(data.gaps);
      setQuestions(data.questions);
      setRecommendations(data.recommendations);
      setReadiness(data.readiness);
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Specification helper</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Read my specification
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Paste a URS or RFQ. RateQuip lists what it thinks you asked for. You
        accept or reject each item, fill gaps, and answer follow-up questions.
        Nothing is treated as final until a person confirms. You will see the
        credit cost first.{" "}
        <Link href="/v12/release-control" className="text-orange-700 underline">
          Usage controls
        </Link>{" "}
        ·{" "}
        <Link href="/v12" className="text-orange-700 underline">
          Back to guide
        </Link>
      </p>

      <form
        className="mt-8 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            // Part 4 ADR-0041: preview → confirm → analyse
            const preview = await v12PreviewUrsUsage();
            await v12ConfirmUsagePreview({
              previewId: preview.id,
              confirmedBy: "buyer@demo.ratequip.com",
            });
            const res = await v12UploadAnalyzeUrs({
              title: String(fd.get("title")),
              sourceText: String(fd.get("body")),
              industryPack: String(fd.get("pack")),
              createdBy: "buyer@demo.ratequip.com",
              previewId: preview.id,
              confirmUsage: true,
            });
            if (!res.ok) {
              setMessage(res.message);
              return;
            }
            setMessage(
              `Analysis ${res.run.id} complete · ${res.counts.requirements} requirements · recall ${(res.explicitRecall * 100).toFixed(0)}% · readiness ${res.readiness} · remaining ${res.entitlementRemaining}`,
            );
            reload(res.run.id);
          });
        }}
      >
        <div>
          <Label htmlFor="title">Document title</Label>
          <Input
            id="title"
            name="title"
            defaultValue="Pharma capping URS"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="pack">Industry pack</Label>
          <select
            id="pack"
            name="pack"
            className="mt-1 w-full rounded-md border border-[var(--rq-border)] bg-white px-3 py-2 text-sm"
            defaultValue="pharma_capping"
          >
            {(packs.length ? packs : ["pharma_capping", "hand_sanitiser", "pet_food", "mining_assay"]).map(
              (p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ),
            )}
          </select>
        </div>
        <div>
          <Label htmlFor="body">URS / RFQ text</Label>
          <Textarea
            id="body"
            name="body"
            rows={8}
            className="mt-1 font-mono text-sm"
            defaultValue={SAMPLE_URS}
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          Read this specification
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      {runId ? (
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
          <Badge variant="muted">Run {runId}</Badge>
          <span className="text-[var(--rq-slate)]">
            Readiness score: <strong>{readiness}</strong>
          </span>
        </div>
      ) : null}

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        What we found (accept or reject)
      </h2>
      <ul className="mt-3 space-y-3">
        {requirements.length === 0 ? (
          <li className="text-sm text-[var(--rq-muted)]">
            No requirements yet — run an analysis above.
          </li>
        ) : (
          requirements.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium text-[var(--rq-ink)]">
                  {r.originalText.slice(0, 120)}
                </span>
                <Badge
                  variant={
                    r.reviewerStatus === "confirmed"
                      ? "success"
                      : r.reviewerStatus === "rejected"
                        ? "muted"
                        : "orange"
                  }
                >
                  {r.reviewerStatus}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-[var(--rq-muted)]">
                {r.classification} · confidence {(r.confidence * 100).toFixed(0)}%
                {r.evidence[0]
                  ? ` · evidence ${r.evidence[0].clause ?? ""} · hash ${r.evidence[0].contentHash}`
                  : ""}
              </p>
              {r.reviewerStatus === "pending" ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await v12ConfirmRequirement({
                          requirementId: r.id,
                          reviewerId: "buyer_engineer@demo.ratequip.com",
                        });
                        setMessage(
                          res.ok ? `Confirmed ${r.id}` : res.message,
                        );
                        reload(runId ?? undefined);
                      })
                    }
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await v12RejectRequirement({
                          requirementId: r.id,
                          reviewerId: "buyer_engineer@demo.ratequip.com",
                          note: "Not in scope",
                        });
                        setMessage(res.ok ? `Rejected ${r.id}` : res.message);
                        reload(runId ?? undefined);
                      })
                    }
                  >
                    Reject
                  </Button>
                </div>
              ) : null}
            </li>
          ))
        )}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Possible gaps
      </h2>
      <ul className="mt-3 space-y-2">
        {gaps.length === 0 ? (
          <li className="text-sm text-[var(--rq-muted)]">No open gaps.</li>
        ) : (
          gaps.map((g) => (
            <li
              key={g.id}
              className="rounded-md border border-[var(--rq-border)] px-3 py-2 text-sm"
            >
              <Badge variant="muted">{g.severity}</Badge>{" "}
              <span className="text-[var(--rq-ink)]">{g.title}</span>
            </li>
          ))
        )}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Questions for you
      </h2>
      <ul className="mt-3 space-y-3">
        {questions.map((q) => (
          <li
            key={q.id}
            className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
          >
            <p className="text-sm text-[var(--rq-ink)]">{q.questionText}</p>
            {q.answer ? (
              <p className="mt-2 text-xs text-emerald-700">Answered: {q.answer}</p>
            ) : (
              <form
                className="mt-3 flex flex-wrap gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  startTransition(async () => {
                    await v12AnswerIntelQuestion({
                      questionId: q.id,
                      answer: String(fd.get("answer")),
                      answeredBy: "buyer_engineer@demo.ratequip.com",
                    });
                    reload(runId ?? undefined);
                  });
                }}
              >
                <Input name="answer" placeholder="Answer…" className="max-w-md" required />
                <Button size="sm" type="submit" disabled={pending}>
                  Save answer
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-lg font-semibold text-[var(--rq-ink)]">
        Suggestions (not decided yet)
      </h2>
      <ul className="mt-3 space-y-2">
        {recommendations.map((r) => (
          <li
            key={r.id}
            className="rounded-md border border-[var(--rq-border)] px-3 py-2 text-sm text-[var(--rq-slate)]"
          >
            {r.title}{" "}
            <span className="text-xs text-[var(--rq-muted)]">
              ({r.classification} · {r.buyerConfirmationStatus})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
