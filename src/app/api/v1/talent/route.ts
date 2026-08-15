import { NextRequest, NextResponse } from "next/server";
import { resolveApiUser } from "@/lib/api/auth";
import {
  addOperatorCredential,
  createGig,
  getOperator,
  indeedQuestions,
  listTalentGigs,
  matchGig,
  placeOperator,
  setOperatorAvailability,
  talentSnapshot,
  upsertOperator,
} from "@/lib/talent/operations";
import { PRIVACY_NOTICE_VERSION } from "@/lib/talent/types";
import { loadOperators } from "@/lib/talent/persist";

export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") ?? "snapshot";
  try {
    switch (action) {
      case "snapshot":
        return NextResponse.json({ ok: true, ...(await talentSnapshot()) });
      case "list_operators":
        return NextResponse.json({ ok: true, operators: await loadOperators() });
      case "get_operator": {
        const partyId = url.searchParams.get("partyId");
        if (!partyId) return bad("partyId required");
        const row = await getOperator(partyId);
        if (!row) return bad("not found", 404);
        return NextResponse.json({ ok: true, ...row });
      }
      case "list_gigs":
        return NextResponse.json({ ok: true, gigs: await listTalentGigs() });
      case "match": {
        const gigId = url.searchParams.get("gigId");
        if (!gigId) return bad("gigId required");
        return NextResponse.json({ ok: true, candidates: await matchGig(gigId) });
      }
      case "questions": {
        const gigId = url.searchParams.get("gigId") ?? "preview";
        return NextResponse.json(await indeedQuestions(gigId));
      }
      case "privacy_notice_version":
        return NextResponse.json({ ok: true, version: PRIVACY_NOTICE_VERSION });
      default:
        return bad(`Unknown action ${action}`);
    }
  } catch (e) {
    return bad(e instanceof Error ? e.message : "error");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = String(body.action ?? "");
    const { user } = await resolveApiUser(req);

    switch (action) {
      case "upsert_operator": {
        const result = await upsertOperator({
          legalName: String(body.legalName ?? user?.fullName ?? ""),
          email: String(body.email ?? user?.email ?? ""),
          phone: body.phone ? String(body.phone) : undefined,
          homeLat: body.homeLat != null ? Number(body.homeLat) : undefined,
          homeLng: body.homeLng != null ? Number(body.homeLng) : undefined,
          jurisdiction: String(body.jurisdiction ?? "AU"),
          userId: user?.clerkUserId ?? undefined,
          poolConsent: Boolean(body.poolConsent),
          rightToWork: Boolean(body.rightToWork),
        });
        return NextResponse.json({ ok: true, ...result });
      }
      case "add_credential":
        return NextResponse.json({
          ok: true,
          credential: await addOperatorCredential({
            partyId: String(body.partyId),
            credentialType: String(body.credentialType),
            identifier: body.identifier ? String(body.identifier) : undefined,
            issuingJurisdiction: body.issuingJurisdiction
              ? String(body.issuingJurisdiction)
              : undefined,
            expiresAt: body.expiresAt ? String(body.expiresAt) : undefined,
            documentBlobUrl: body.documentBlobUrl
              ? String(body.documentBlobUrl)
              : undefined,
            verifiedBy: user?.email ?? "self",
            verificationMethod: "DOCUMENT_CAPTURE",
          }),
        });
      case "set_availability":
        return NextResponse.json({
          ok: true,
          availability: await setOperatorAvailability({
            partyId: String(body.partyId),
            windowStart: String(body.windowStart),
            windowEnd: String(body.windowEnd),
            radiusKm: body.radiusKm ? Number(body.radiusKm) : undefined,
            baseLat: body.baseLat != null ? Number(body.baseLat) : undefined,
            baseLng: body.baseLng != null ? Number(body.baseLng) : undefined,
          }),
        });
      case "create_gig":
        return NextResponse.json({
          ok: true,
          gig: await createGig({
            title: String(body.title),
            description: body.description ? String(body.description) : undefined,
            equipmentClass: String(body.equipmentClass),
            requiredCredentials: Array.isArray(body.requiredCredentials)
              ? (body.requiredCredentials as string[])
              : undefined,
            siteLabel: body.siteLabel ? String(body.siteLabel) : undefined,
            startsAt: String(body.startsAt),
            endsAt: String(body.endsAt),
            rateCents: Number(body.rateCents ?? 6800),
            currency: String(body.currency ?? "AUD"),
            requestId: body.requestId ? String(body.requestId) : undefined,
          }),
        });
      case "place":
        return NextResponse.json(
          await placeOperator(String(body.gigId), String(body.partyId)),
        );
      default:
        return bad(`Unknown action ${action}`);
    }
  } catch (e) {
    return bad(e instanceof Error ? e.message : "error");
  }
}
