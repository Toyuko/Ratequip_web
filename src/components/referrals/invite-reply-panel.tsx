"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { replyToReferralInviter } from "@/lib/actions/referrals";
import { INVITE_QUICK_REPLIES } from "@/lib/referrals/invitation-reasons";

export function InviteReplyPanel({
  inviteCode,
  orgLabel,
  canReply,
}: {
  inviteCode: string;
  orgLabel: string;
  canReply: boolean;
}) {
  const [message, setMessage] = useState("");
  const [replyFromName, setReplyFromName] = useState("");
  const [replyFromEmail, setReplyFromEmail] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!canReply) {
    return (
      <div className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-3 text-sm text-[var(--rq-slate)]">
        Have a question for {orgLabel}? Accept the invitation to connect on
        RateQuip, or email them directly if you already have their contact.
      </div>
    );
  }

  function send(text: string) {
    startTransition(async () => {
      const result = await replyToReferralInviter({
        code: inviteCode,
        message: text,
        replyFromName: replyFromName.trim() || undefined,
        replyFromEmail: replyFromEmail.trim() || undefined,
      });
      setStatus(result.message);
      if (result.ok) setMessage("");
    });
  }

  return (
    <div
      id="ask-inviter"
      className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] p-4 space-y-3"
    >
      <div>
        <h2 className="text-base font-semibold text-[var(--rq-ink)]">
          Have a question for {orgLabel}?
        </h2>
        <p className="mt-1 text-sm text-[var(--rq-slate)]">
          Send a quick reply before you join. They’ll get an email notification
          and can continue the conversation with you.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {INVITE_QUICK_REPLIES.map((quick) => (
          <button
            key={quick}
            type="button"
            disabled={pending}
            onClick={() => send(quick)}
            className="rounded-md border border-[var(--rq-border)] bg-white px-3 py-1.5 text-left text-xs font-medium text-[var(--rq-ink)] hover:border-orange-400 hover:bg-orange-50"
          >
            {quick}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="reply-name">Your name</Label>
          <Input
            id="reply-name"
            className="mt-1"
            value={replyFromName}
            onChange={(e) => setReplyFromName(e.target.value)}
            placeholder="Optional"
          />
        </div>
        <div>
          <Label htmlFor="reply-email">Email for their reply</Label>
          <Input
            id="reply-email"
            type="email"
            className="mt-1"
            value={replyFromEmail}
            onChange={(e) => setReplyFromEmail(e.target.value)}
            placeholder="Optional — so they can reply"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="reply-message">Or write your own message</Label>
        <Textarea
          id="reply-message"
          className="mt-1 min-h-20"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Ask ${orgLabel} about the opportunity…`}
        />
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={pending || message.trim().length < 2}
        onClick={() => send(message)}
      >
        {pending ? "Sending…" : `Send reply to ${orgLabel}`}
      </Button>

      {status ? (
        <p className="text-sm text-emerald-800">{status}</p>
      ) : null}
    </div>
  );
}
