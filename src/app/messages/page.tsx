import Link from "next/link";
import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listMessengerThreadsForEmail } from "@/lib/referrals/messenger";

export const metadata = {
  title: "RateQuip Messenger",
  description: "Invite replies and early on-platform conversations.",
};

export default async function MessengerPage() {
  const jar = await cookies();
  const email = jar.get("rq_email")?.value?.trim();
  const threads = listMessengerThreadsForEmail(email);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Messenger</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        RateQuip Messenger
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Invite quick-replies land here and also notify by email — so the first
        conversation starts on RateQuip, not only in inboxes.
      </p>

      {threads.length === 0 ? (
        <div className="mt-8 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-6">
          <p className="text-sm text-[var(--rq-slate)]">
            No invite conversations yet.
            {email
              ? ` Signed in as ${email}.`
              : " Set your account email via onboarding to filter your threads."}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/referrals">Invite a partner</Link>
          </Button>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {threads.map((thread) => {
            const latest = thread.messages[thread.messages.length - 1];
            return (
              <li
                key={thread.id}
                className="rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-[var(--rq-ink)]">
                    {thread.subject}
                  </h2>
                  <Badge variant="muted">
                    {thread.messages.length} message
                    {thread.messages.length === 1 ? "" : "s"}
                  </Badge>
                </div>
                {latest ? (
                  <p className="mt-2 text-sm text-[var(--rq-slate)]">
                    <span className="font-medium text-[var(--rq-ink)]">
                      {latest.fromLabel}:
                    </span>{" "}
                    {latest.body}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/join/${encodeURIComponent(thread.inviteCode)}`}
                    >
                      Open invitation
                    </Link>
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
