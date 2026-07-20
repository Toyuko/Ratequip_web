import { NextRequest } from "next/server";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  confirmCompanySetup,
  listCompanySetup,
  reviewCompanySetupSuggestions,
  reviewProfileCompanySuggestion,
  refreshCompanySuggestionsForProfile,
  saveCompanySetupSection,
  startCompanySetup,
} from "@/lib/v12/services";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId") ?? undefined;
  return apiResponse(req, ok(listCompanySetup(sessionId)));
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const action = typeof body?.action === "string" ? body.action : "";

  if (action === "start") {
    const companyName =
      typeof body?.companyName === "string" ? body.companyName : "";
    const role = body?.role;
    const industryPack =
      typeof body?.industryPack === "string" ? body.industryPack : "";
    if (
      !companyName ||
      (role !== "buyer" && role !== "supplier" && role !== "contractor") ||
      !industryPack
    ) {
      return apiResponse(req, err("Invalid start payload"));
    }
    const res = startCompanySetup({
      companyName,
      role,
      industryPack,
      companyId:
        typeof body?.companyId === "string" ? body.companyId : undefined,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  if (action === "save_section") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    const answers =
      body?.answers && typeof body.answers === "object"
        ? (body.answers as Record<string, string>)
        : null;
    if (!sessionId || !answers) {
      return apiResponse(req, err("Invalid section payload"));
    }
    const res = saveCompanySetupSection({
      sessionId,
      answers,
      advance: body?.advance !== false,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  if (action === "review") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    const decisions = Array.isArray(body?.decisions) ? body.decisions : null;
    if (!sessionId || !decisions) {
      return apiResponse(req, err("Invalid review payload"));
    }
    const res = reviewCompanySetupSuggestions({
      sessionId,
      decisions: decisions as Array<{
        id: string;
        status: "accepted" | "rejected";
      }>,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  if (action === "confirm") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    const confirmedBy =
      typeof body?.confirmedBy === "string" ? body.confirmedBy : "";
    if (!sessionId || !confirmedBy) {
      return apiResponse(req, err("Invalid confirm payload"));
    }
    const res = confirmCompanySetup({ sessionId, confirmedBy });
    if (!res.ok) {
      return apiResponse(
        req,
        err(res.message, 409, "code" in res ? res.code : undefined),
      );
    }
    return apiResponse(req, ok(res));
  }

  if (action === "company_review") {
    const profileId =
      typeof body?.profileId === "string" ? body.profileId : "";
    const suggestionId =
      typeof body?.suggestionId === "string" ? body.suggestionId : "";
    const status = body?.status;
    if (
      !profileId ||
      !suggestionId ||
      (status !== "saved" && status !== "dismissed")
    ) {
      return apiResponse(req, err("Invalid company review payload"));
    }
    const res = reviewProfileCompanySuggestion({
      profileId,
      suggestionId,
      status,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  if (action === "company_refresh") {
    const profileId =
      typeof body?.profileId === "string" ? body.profileId : "";
    if (!profileId) {
      return apiResponse(req, err("Invalid refresh payload"));
    }
    const res = refreshCompanySuggestionsForProfile(profileId);
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  return apiResponse(req, err("Unknown action", 400));
}
