import { ShareInvitePanel } from "@/components/referrals/share-invite-panel";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Referrals & invites",
  description:
    "Invite colleagues, refer companies and contractors, and share join links via email, LinkedIn and socials.",
};

export default function ReferralsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Badge variant="orange">Growth</Badge>
      <h1 className="mt-3 text-3xl font-bold text-[var(--rq-ink)]">
        Company & contractor referrals
      </h1>
      <p className="mt-2 text-[var(--rq-slate)]">
        Request or share an invite to join RateQuip. Send by email, or post to
        LinkedIn, WhatsApp, X and Facebook. Claim and join rewards stay pending
        until a qualifying verified event.
      </p>

      <div className="mt-8">
        <ShareInvitePanel />
      </div>
    </div>
  );
}
