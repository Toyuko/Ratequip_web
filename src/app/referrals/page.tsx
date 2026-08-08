import Link from "next/link";
import { ShareInvitePanel } from "@/components/referrals/share-invite-panel";
import { Badge } from "@/components/ui/badge";
import { getInviteRewardSettings } from "@/lib/referrals/invite-rewards";
import { rewardLadderSummaryLines } from "@/lib/referrals/reward-ladder";

export const metadata = {
  title: "Network invites & growth",
  description:
    "Invite suppliers, customers and partners into your RateQuip industry network. Unlimited invites; credits unlock on verified actions.",
};

export default function ReferralsPage() {
  const settings = getInviteRewardSettings();
  const ladderLines = rewardLadderSummaryLines(settings.ladder);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Growth engine</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Invite partners into your industry network
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Unlimited invitations. Credits release only on verified value — email
        verify, claim, complete profile, list, enquire, or become a paying
        customer. Both invitee and inviter can earn. Use invitation reasons so
        not every connection is labelled a “referral.”
      </p>

      <div className="mt-6 rounded-lg border border-[var(--rq-border)] bg-[var(--rq-card)] px-4 py-4">
        <p className="text-sm font-semibold text-[var(--rq-ink)]">
          Progressive unlock ladder
        </p>
        <ul className="mt-2 space-y-1 text-sm text-[var(--rq-slate)]">
          {ladderLines.map((line) => (
            <li key={line}>✓ {line}</li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[var(--rq-muted)]">
          Quick replies land in{" "}
          <Link href="/messages" className="underline">
            RateQuip Messenger
          </Link>{" "}
          and notify the inviter by email.
        </p>
      </div>

      <div className="mt-8">
        <ShareInvitePanel />
      </div>
    </div>
  );
}
