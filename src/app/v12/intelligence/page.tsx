"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { v12ConfirmDraft, v12CreateDraft } from "@/lib/actions/v12";

type Draft = {
  id: string;
  type: string;
  title: string;
  body: string;
  status: string;
  groundingRefs: string[];
};

export default function IntelligencePage() {
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-bold text-[var(--rq-ink)]">
        RateQuip Intelligence AI
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 13 / ADR-0007 — AI can draft RFQs and shortlists, but
        consequential actions stay drafts until an authorised user confirms.
      </p>

      <form
        className="mt-8 space-y-4 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const created = await v12CreateDraft({
              type: "publish_rfq",
              title: String(fd.get("title")),
              body: String(fd.get("body")),
              companyId: "org-demo-buyer",
              requestedBy: "buyer@demo.ratequip.com",
              groundingRefs: ["taxonomy:equipment.auger_filler", "match:latest"],
            });
            setDraft(created);
            setMessage("Draft created — confirmation required before publish_rfq.");
          });
        }}
      >
        <div>
          <Label htmlFor="title">Draft title</Label>
          <Input
            id="title"
            name="title"
            defaultValue="RFQ draft: snack-line auger filler"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="body">Draft body</Label>
          <Textarea
            id="body"
            name="body"
            className="mt-1"
            defaultValue="Need hygienic auger filler for snack powders, 40–60 ppm, CIP ready, FAT in OEM plant, delivery ASEAN."
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Generating…" : "Create AI draft"}
        </Button>
      </form>

      {draft ? (
        <div className="mt-8 rounded-lg border border-orange-300 bg-orange-50 p-5">
          <div className="flex items-center gap-2">
            <Badge variant="warning">{draft.status}</Badge>
            <span className="text-sm text-[var(--rq-muted)]">{draft.type}</span>
          </div>
          <h2 className="mt-3 font-semibold text-[var(--rq-ink)]">
            {draft.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--rq-slate)]">{draft.body}</p>
          <p className="mt-3 text-xs text-[var(--rq-muted)]">
            Grounding: {draft.groundingRefs.join(", ")}
          </p>
          {draft.status === "draft" ? (
            <Button
              className="mt-4"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const res = await v12ConfirmDraft({
                    draftId: draft.id,
                    confirmedBy: "buyer@demo.ratequip.com",
                    executeType: "publish_rfq",
                  });
                  if (res.ok && res.draft) {
                    setDraft(res.draft);
                    setMessage("Draft confirmed by authorised user. Action may proceed.");
                  } else {
                    setMessage(res.message ?? "Confirmation failed");
                  }
                })
              }
            >
              Confirm & release
            </Button>
          ) : null}
        </div>
      ) : null}
      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}
    </div>
  );
}
