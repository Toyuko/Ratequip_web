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

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const authResult = await requireApiUser(req);
  if (!authResult.user) {
    return apiResponse(req, err(authResult.error!, authResult.status));
  }

  const role = authResult.user.role;
  const requests = listRequests();
  const companies = listCompanies().slice(0, 5);
  const pendingReviews = listPendingReviews();
  const pendingClaims = listPendingClaims();

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
          { label: "Projects", value: listProjects().length },
          { label: "Saved suppliers", value: companies.length },
        ],
        recentRequests: requests.slice(0, 5),
        featuredSuppliers: companies,
      }),
    );
  }

  if (role === "supplier") {
    return apiResponse(
      req,
      ok({
        ...base,
        tiles: [
          { label: "Open leads", value: requests.filter((r) => r.status === "open").length },
          { label: "Quotes submitted", value: demoQuotes.length },
          { label: "Pending reviews", value: pendingReviews.length },
          { label: "Profile views", value: 128 },
        ],
        leadInbox: requests
          .filter((r) => r.status === "open")
          .slice(0, 5)
          .map((r) => ({ ...r, quotes: getQuotesForRequest(r.id) })),
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
          { label: "Browse suppliers", value: listCompanies().length },
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
        { label: "Companies", value: listCompanies().length },
        { label: "Open RFQs", value: requests.filter((r) => r.status === "open").length },
      ],
      pendingReviews,
      pendingClaims,
    }),
  );
}
