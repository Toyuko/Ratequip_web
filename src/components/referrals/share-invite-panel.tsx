"use client";

import { useEffect, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getOrCreateShareLink,
  listReferralInvites,
  sendReferralInvite,
  trackReferralShare,
} from "@/lib/actions/referrals";
import type {
  ReferralInvite,
  ReferralKind,
  ReferralShareBundle,
} from "@/lib/referrals/types";

const KINDS: Array<{ id: ReferralKind; title: string; body: string }> = [
  {
    id: "join_platform",
    title: "Invite to RateQuip",
    body: "Ask a colleague or partner to create an account.",
  },
  {
    id: "join_company",
    title: "Request to join your organisation",
    body: "Invite someone to join your company workspace.",
  },
  {
    id: "refer_company",
    title: "Refer a company",
    body: "Share so a supplier or buyer can claim their profile.",
  },
  {
    id: "refer_contractor",
    title: "Refer a contractor",
    body: "Invite installers, maintainers or service providers.",
  },
];

export function ShareInvitePanel({
  defaultKind = "join_platform",
  defaultCompanyName = "",
  compact = false,
  title = "Refer & share to join",
  description = "Invite companies and contractors by email, or share via LinkedIn and socials.",
}: {
  defaultKind?: ReferralKind;
  defaultCompanyName?: string;
  compact?: boolean;
  title?: string;
  description?: string;
}) {
  const [kind, setKind] = useState<ReferralKind>(defaultKind);
  const [email, setEmail] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [companyName, setCompanyName] = useState(defaultCompanyName);
  const [personalNote, setPersonalNote] = useState("");
  const [share, setShare] = useState<ReferralShareBundle | null>(null);
  const [invites, setInvites] = useState<ReferralInvite[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    );
  }, []);

  useEffect(() => {
    setCompanyName(defaultCompanyName);
  }, [defaultCompanyName]);

  useEffect(() => {
    startTransition(async () => {
      const [link, listed] = await Promise.all([
        getOrCreateShareLink({
          kind,
          companyName: companyName.trim() || undefined,
        }),
        listReferralInvites(),
      ]);
      if (link.ok) setShare(link.share);
      if (listed.ok) setInvites(listed.invites);
    });
    // Refresh share link when kind changes; company name edits use refresh button / send.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind]);

  function refreshShare() {
    startTransition(async () => {
      const link = await getOrCreateShareLink({
        kind,
        companyName: companyName.trim() || undefined,
      });
      if (!link.ok) {
        setMessage(link.message);
        return;
      }
      setShare(link.share);
      setMessage("Share link ready.");
    });
  }

  function sendEmail() {
    startTransition(async () => {
      const result = await sendReferralInvite({
        kind,
        email: email.trim(),
        recipientName: recipientName.trim() || undefined,
        companyName: companyName.trim() || undefined,
        personalNote: personalNote.trim() || undefined,
      });
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
      setShare(result.share);
      setMessage(result.message);
      setEmail("");
      const listed = await listReferralInvites();
      if (listed.ok) setInvites(listed.invites);
    });
  }

  async function openShare(channel: "linkedin" | "x" | "whatsapp" | "facebook" | "native_share" | "copy_link" | "email") {
    if (!share) return;

    if (channel === "copy_link") {
      try {
        await navigator.clipboard.writeText(share.joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setMessage("Invite link copied.");
      } catch {
        setMessage(share.joinUrl);
      }
      await trackReferralShare({ code: share.code, channel: "copy_link" });
      return;
    }

    if (channel === "native_share" && typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: share.title,
          text: share.text,
          url: share.joinUrl,
        });
        await trackReferralShare({ code: share.code, channel: "native_share" });
      } catch {
        /* user cancelled */
      }
      return;
    }

    const url =
      channel === "linkedin"
        ? share.linkedInUrl
        : channel === "x"
          ? share.xUrl
          : channel === "whatsapp"
            ? share.whatsAppUrl
            : channel === "facebook"
              ? share.facebookUrl
              : share.mailtoUrl;

    await trackReferralShare({
      code: share.code,
      channel: channel === "email" ? "email" : channel,
    });
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-5">
      {!compact ? (
        <div>
          <h2 className="text-xl font-semibold text-[var(--rq-ink)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--rq-slate)]">{description}</p>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setKind(k.id)}
            className={`rounded-md border p-3 text-left transition ${
              kind === k.id
                ? "border-orange-400 bg-orange-50"
                : "border-[var(--rq-border)] bg-[var(--rq-card)]"
            }`}
          >
            <div className="font-medium text-[var(--rq-ink)]">{k.title}</div>
            <div className="mt-0.5 text-xs text-[var(--rq-slate)]">{k.body}</div>
          </button>
        ))}
      </div>

      <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ref-email">Email</Label>
            <Input
              id="ref-email"
              type="email"
              className="mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="partner@company.com"
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="ref-name">Recipient name</Label>
            <Input
              id="ref-name"
              className="mt-1"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        {(kind === "refer_company" || kind === "join_company") && (
          <div>
            <Label htmlFor="ref-company">Company name</Label>
            <Input
              id="ref-company"
              className="mt-1"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Acme Packaging"
            />
          </div>
        )}
        <div>
          <Label htmlFor="ref-note">Personal note</Label>
          <Textarea
            id="ref-note"
            className="mt-1 min-h-20"
            value={personalNote}
            onChange={(e) => setPersonalNote(e.target.value)}
            placeholder="Optional message included in the invite"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={pending || !email.trim()}
            onClick={sendEmail}
          >
            {pending ? "Sending…" : "Send email invite"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={pending}
            onClick={refreshShare}
          >
            Refresh share link
          </Button>
        </div>
      </div>

      {share ? (
        <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-[var(--rq-ink)]">
              Share to join
            </p>
            <Badge variant="muted">code {share.code}</Badge>
          </div>
          <p className="break-all rounded-md bg-[var(--rq-hover)] px-3 py-2 text-xs text-[var(--rq-slate)]">
            {share.joinUrl}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => openShare("copy_link")}>
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => openShare("linkedin")}>
              LinkedIn
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => openShare("x")}>
              X / Twitter
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => openShare("whatsapp")}>
              WhatsApp
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => openShare("facebook")}>
              Facebook
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => openShare("email")}>
              Email app
            </Button>
            {canNativeShare ? (
              <Button type="button" size="sm" variant="outline" onClick={() => openShare("native_share")}>
                More…
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {message ? (
        <p className="text-sm text-emerald-800">{message}</p>
      ) : null}

      {!compact && invites.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-[var(--rq-ink)]">
            Recent invites
          </h3>
          <ul className="mt-2 space-y-2">
            {invites.slice(0, 8).map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--rq-border)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--rq-slate)]">
                  {inv.emailMasked ?? inv.code}
                  {inv.companyName ? ` · ${inv.companyName}` : ""}
                  {" · "}
                  {inv.kind.replace(/_/g, " ")}
                </span>
                <Badge variant={inv.status === "sent" ? "success" : "muted"}>
                  {inv.status} · {inv.channel}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
