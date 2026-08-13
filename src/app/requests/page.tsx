import { RequestsPageClient } from "@/components/marketplace/requests-page-client";
import { listRequests } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "RFQ marketplace",
  description: "Open procurement requests from industrial buyers. Quote, compare and award on RateQuip.",
};

export default async function RequestsPage() {
  const requests = await listRequests();
  return <RequestsPageClient requests={requests} />;
}
