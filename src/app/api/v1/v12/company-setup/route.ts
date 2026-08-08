import { NextRequest } from "next/server";
import { gateApiUser } from "@/lib/api/guards";
import { ok, err } from "@/lib/api/envelope";
import { apiResponse, handleOptions } from "@/lib/api/respond";
import {
  confirmCompanySetup,
  listCompanySetup,
  part7ConfirmFact,
  part7IngestFact,
  part7ResumeSession,
  reviewCompanySetupSuggestions,
  reviewProfileCompanySuggestion,
  refreshCompanySuggestionsForProfile,
  saveCompanySetupSection,
  startCompanySetup,
} from "@/lib/v12/services";
import {
  hydrateSetupSessionIntoStore,
  persistSetupSession,
} from "@/lib/v12/setup-session-cookie";

export function OPTIONS(req: NextRequest) {
  return handleOptions(req);
}

export async function GET(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  const sessionId = req.nextUrl.searchParams.get("sessionId") ?? undefined;
  await hydrateSetupSessionIntoStore(sessionId);
  return apiResponse(req, ok(listCompanySetup(sessionId)));
}

export async function POST(req: NextRequest) {
  const gate = await gateApiUser(req);
  if (gate.errorResponse) return gate.errorResponse;

  const body = (await req.json().catch(() => null)) as
    | Record<string, unknown>
    | null;
  const action = typeof body?.action === "string" ? body.action : "";

  if (action === "start") {
    const companyName =
      typeof body?.companyName === "string" ? body.companyName : "";
    const role = body?.role;
    const industryPack =
      typeof body?.industryPack === "string" ? body.industryPack : undefined;
    if (
      !companyName ||
      (role !== "buyer" && role !== "supplier" && role !== "contractor")
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
    await persistSetupSession(res.session);
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
    await hydrateSetupSessionIntoStore(sessionId);
    const res = saveCompanySetupSection({
      sessionId,
      answers,
      advance: body?.advance !== false,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    await persistSetupSession(res.session);
    return apiResponse(req, ok(res));
  }

  if (action === "review") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    const decisions = Array.isArray(body?.decisions) ? body.decisions : null;
    if (!sessionId || !decisions) {
      return apiResponse(req, err("Invalid review payload"));
    }
    await hydrateSetupSessionIntoStore(sessionId);
    const res = reviewCompanySetupSuggestions({
      sessionId,
      decisions: decisions as Array<{
        id: string;
        status: "accepted" | "rejected";
      }>,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    await persistSetupSession(res.session);
    return apiResponse(req, ok(res));
  }

  if (action === "confirm") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    if (!sessionId) {
      return apiResponse(req, err("Invalid confirm payload"));
    }
    const confirmedBy =
      (typeof body?.confirmedBy === "string" && body.confirmedBy.trim()) ||
      gate.user.email ||
      gate.user.id;
    await hydrateSetupSessionIntoStore(sessionId);
    const res = confirmCompanySetup({ sessionId, confirmedBy });
    if (!res.ok) {
      return apiResponse(
        req,
        err(res.message, 409, "code" in res ? res.code : undefined),
      );
    }
    await persistSetupSession(res.session);
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

  if (action === "ingest_fact") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    const predicate =
      typeof body?.predicate === "string" ? body.predicate : "";
    if (!sessionId || !predicate || body?.value === undefined) {
      return apiResponse(req, err("Invalid ingest_fact payload"));
    }
    await hydrateSetupSessionIntoStore(sessionId);
    const res = part7IngestFact({
      sessionId,
      predicate,
      value: body.value,
      confidence:
        typeof body.confidence === "number" ? body.confidence : undefined,
      sourceType:
        typeof body.sourceType === "string" ? body.sourceType : undefined,
      createdBy: gate.user?.id ?? "api",
      idempotencyKey:
        typeof body.idempotencyKey === "string"
          ? body.idempotencyKey
          : req.headers.get("idempotency-key") ?? undefined,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  if (action === "confirm_fact") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    const factId = typeof body?.factId === "string" ? body.factId : "";
    const status = body?.status;
    if (
      !sessionId ||
      !factId ||
      (status !== "confirmed" && status !== "rejected")
    ) {
      return apiResponse(req, err("Invalid confirm_fact payload"));
    }
    await hydrateSetupSessionIntoStore(sessionId);
    const res = part7ConfirmFact({
      sessionId,
      factId,
      status,
      actorId: gate.user?.id ?? "api",
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  if (action === "resume_session") {
    const sessionId =
      typeof body?.sessionId === "string" ? body.sessionId : "";
    if (!sessionId) {
      return apiResponse(req, err("Invalid resume_session payload"));
    }
    await hydrateSetupSessionIntoStore(sessionId);
    const res = part7ResumeSession({
      sessionId,
      companyId:
        typeof body?.companyId === "string" ? body.companyId : undefined,
    });
    if (!res.ok) return apiResponse(req, err(res.message, 400));
    return apiResponse(req, ok(res));
  }

  return apiResponse(req, err("Unknown action", 400));
}
