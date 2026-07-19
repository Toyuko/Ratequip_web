"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  v12ApproveDocumentVersion,
  v12CreateDocument,
  v12ListDocuments,
} from "@/lib/actions/v12";

type Doc = {
  id: string;
  title: string;
  docType: string;
  status: string;
  currentVersion: number;
  createdBy: string;
  linkedType?: string;
  linkedId?: string;
};

type Version = {
  id: string;
  documentId: string;
  version: number;
  contentHash: string;
  status: string;
  label: string;
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [versions, setVersions] = useState<Version[]>([]);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const reload = () =>
    startTransition(async () => {
      const data = await v12ListDocuments();
      setDocuments(data.documents);
      setVersions(data.versions);
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Release 3A</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Document vault
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domain 38 — industrial evidence with content hashes. Approved
        versions are immutable; self-approval is blocked.
      </p>

      <form
        className="mt-8 space-y-3 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const res = await v12CreateDocument({
              title: String(fd.get("title")),
              docType: String(fd.get("docType")),
              body: String(fd.get("body")),
              createdBy: "buyer@demo.ratequip.com",
              linkedType: String(fd.get("linkedType") || "") || undefined,
              linkedId: String(fd.get("linkedId") || "") || undefined,
            });
            setMessage(
              `Document ${res.document.id} v${res.version.version} · hash ${res.version.contentHash}`,
            );
            e.currentTarget.reset();
            reload();
          });
        }}
      >
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="docType">Type</Label>
          <Input
            id="docType"
            name="docType"
            defaultValue="certificate"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="body">Body / evidence text</Label>
          <Textarea id="body" name="body" required className="mt-1" rows={4} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="linkedType">Link type (optional)</Label>
            <Input
              id="linkedType"
              name="linkedType"
              placeholder="asset"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="linkedId">Link id (optional)</Label>
            <Input id="linkedId" name="linkedId" className="mt-1" />
          </div>
        </div>
        <Button type="submit" disabled={pending}>
          Create document
        </Button>
      </form>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      <ul className="mt-8 space-y-3">
        {documents.map((d) => {
          const ver = versions.find(
            (v) => v.documentId === d.id && v.version === d.currentVersion,
          );
          return (
            <li
              key={d.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-[var(--rq-ink)]">{d.title}</h2>
                <Badge variant={d.status === "approved" ? "success" : "muted"}>
                  {d.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-[var(--rq-muted)]">
                {d.docType} · v{d.currentVersion}
                {ver ? ` · hash ${ver.contentHash}` : ""} · by {d.createdBy}
              </p>
              {ver && ver.status !== "approved" ? (
                <Button
                  className="mt-3"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await v12ApproveDocumentVersion({
                        documentId: d.id,
                        version: d.currentVersion,
                        approvedBy: "qa@demo.ratequip.com",
                      });
                      setMessage(
                        res.ok
                          ? `Approved ${d.title} v${d.currentVersion}`
                          : res.message,
                      );
                      reload();
                    })
                  }
                >
                  Approve version (as QA)
                </Button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
