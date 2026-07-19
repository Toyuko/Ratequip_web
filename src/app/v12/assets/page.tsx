"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { v12IssuePassport, v12ListAssets } from "@/lib/actions/v12";

type Asset = {
  id: string;
  name: string;
  status: string;
  supplierSlug: string;
  awardId?: string;
  rfqId?: string;
  passportId?: string;
  createdAt: string;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const reload = () =>
    startTransition(async () => {
      const rows = await v12ListAssets();
      setAssets(rows);
    });

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Release 2B</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Asset register
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        V12 Domains 18–20 — awards create commissioning assets and draft digital
        passports. Issue the passport to move the asset into service.
      </p>

      {message ? <p className="mt-4 text-sm text-emerald-700">{message}</p> : null}

      {assets.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--rq-muted)]">
          No assets yet. Award an RFQ on the RFQ page to create one.
        </p>
      ) : (
        <ul className="mt-8 space-y-3">
          {assets.map((a) => (
            <li
              key={a.id}
              className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold text-[var(--rq-ink)]">{a.name}</h2>
                <Badge variant={a.status === "in_service" ? "success" : "muted"}>
                  {a.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-[var(--rq-muted)]">
                Supplier {a.supplierSlug}
                {a.awardId ? ` · award ${a.awardId}` : ""}
                {a.passportId ? ` · passport ${a.passportId}` : ""}
              </p>
              {a.passportId && a.status !== "in_service" ? (
                <Button
                  className="mt-3"
                  size="sm"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await v12IssuePassport(a.passportId!);
                      if (res.ok) {
                        setMessage(`Passport issued for ${a.name}`);
                        reload();
                      } else {
                        setMessage(res.message);
                      }
                    })
                  }
                >
                  Issue digital passport
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
