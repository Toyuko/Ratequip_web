import { NextRequest } from "next/server";
import { requireApiUser } from "@/lib/api/auth";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  listCompanies,
  listPendingClaims,
  listPendingReviews,
  listProjects,
  listRequests,
  getQuotesForRequest,
} from "@/lib/db/queries";
import { demoQuotes } from "@/lib/db/demo-data";
import { getWalletAsync } from "@/lib/db/phase2";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const role = authResult.user.role;
  const [requests, companies, pendingReviews, pendingClaims, projects, wallet] =
    await Promise.all([
      listRequests(),
      listCompanies(),
      listPendingReviews(),
      listPendingClaims(),
      listProjects(),
      getWalletAsync(),
    ]);
  const featured = companies.slice(0, 5);

  const base = {
    role,
    orgName: authResult.user.orgName,
    user: authResult.user,
  };

  if (role === "buyer") {
    return apiResponse(
      req,
      ok({
        ...base,
        tiles: [
          { label: "Open RFQs", value: requests.filter((r) => r.status === "open").length },
          { label: "Quotes received", value: demoQuotes.length },
          { label: "Credits", value: wallet.balance },
          { label: "Projects", value: projects.length },
        ],
        recentRequests: requests.slice(0, 5),
        featuredSuppliers: featured,
        credits: wallet.balance,
      }),
    );
  }

  if (role === "supplier") {
    const leadInbox = await Promise.all(
      requests
        .filter((r) => r.status === "open")
        .slice(0, 5)
        .map(async (r) => ({ ...r, quotes: await getQuotesForRequest(r.id) })),
    );
    return apiResponse(
      req,
      ok({
        ...base,
        tiles: [
          { label: "Open leads", value: requests.filter((r) => r.status === "open").length },
          { label: "Quotes submitted", value: demoQuotes.length },
          { label: "Credits", value: wallet.balance },
          { label: "Pending reviews", value: pendingReviews.length },
        ],
        leadInbox,
        credits: wallet.balance,
      }),
    );
  }

  if (role === "contractor") {
    return apiResponse(
      req,
      ok({
        ...base,
        tiles: [
          { label: "Open RFQs", value: requests.filter((r) => r.status === "open").length },
          { label: "Browse suppliers", value: companies.length },
          { label: "Compliance", value: "Phase 3" },
        ],
        recentRequests: requests.slice(0, 5),
      }),
    );
  }

  // admin
  return apiResponse(
    req,
    ok({
      ...base,
      tiles: [
        { label: "Pending reviews", value: pendingReviews.length },
        { label: "Pending claims", value: pendingClaims.length },
        { label: "Companies", value: companies.length },
        { label: "Open RFQs", value: requests.filter((r) => r.status === "open").length },
      ],
      pendingReviews,
      pendingClaims,
    }),
  );
}
