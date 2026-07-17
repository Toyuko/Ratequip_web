import { RequestsPageClient } from "@/components/marketplace/requests-page-client";
import { listRequests } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function RequestsPage() {
  const requests = await listRequests();
  return <RequestsPageClient requests={requests} />;
}
