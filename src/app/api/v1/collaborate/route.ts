import { NextResponse } from "next/server";
import {
  createEngagement,
  createParty,
  createSessionOffering,
  discloseFee,
  getEngagement,
  getEventChain,
  getReputation,
  listEngagements,
  listOfferings,
  listParties,
  snapshot,
  transitionEngagement,
  addCapability,
  addContributor,
  addMilestone,
  addRequirement,
  submitMilestoneEvidence,
  escalateSessionToJob,
  postWorkspaceMessage,
} from "@/lib/collaborate/engine";
import { getCollaborateStore } from "@/lib/collaborate/store";
import { matchRequirement } from "@/lib/collaborate/matching";
import { formatMoney } from "@/lib/collaborate/money";

export const runtime = "nodejs";

type Action =
  | "snapshot"
  | "create_party"
  | "list_parties"
  | "add_capability"
  | "create_offering"
  | "list_offerings"
  | "create_engagement"
  | "list_engagements"
  | "get_engagement"
  | "add_requirement"
  | "add_contributor"
  | "add_milestone"
  | "disclose_fee"
  | "transition"
  | "submit_evidence"
  | "event_chain"
  | "reputation"
  | "match"
  | "escalate_session"
  | "workspace_message";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const action = (url.searchParams.get("action") ?? "snapshot") as Action;

  try {
    switch (action) {
      case "snapshot":
        return NextResponse.json({ ok: true, ...snapshot() });
      case "list_parties":
        return NextResponse.json({ ok: true, parties: listParties() });
      case "list_offerings":
        return NextResponse.json({ ok: true, offerings: listOfferings() });
      case "list_engagements": {
        const mode = url.searchParams.get("mode") as
          | "JOB"
          | "POD"
          | "SESSION"
          | "VENTURE"
          | null;
        const partyId = url.searchParams.get("partyId") ?? undefined;
        return NextResponse.json({
          ok: true,
          engagements: listEngagements({
            mode: mode ?? undefined,
            partyId,
          }),
        });
      }
      case "get_engagement": {
        const id = url.searchParams.get("engagementId");
        if (!id) return bad("engagementId required");
        const eng = getEngagement(id);
        if (!eng) return bad("not found", 404);
        const fee = eng.feeQuoteId
          ? discloseFee(eng.engagementId)
          : null;
        return NextResponse.json({
          ok: true,
          engagement: eng,
          feeDisclosure: fee
            ? {
                gross: formatMoney(fee.disclosure.gross),
                platformFee: formatMoney(fee.disclosure.platformFee),
                providerFee: formatMoney(fee.disclosure.providerFee),
                netToContributor: formatMoney(fee.disclosure.netToContributor),
                feeBps: fee.feeBps,
                scheduleVersion: fee.scheduleVersion,
              }
            : null,
          workspace: getCollaborateStore().workspaces.find(
            (w) => w.workspaceId === eng.workspaceId,
          ),
        });
      }
      case "event_chain": {
        const id = url.searchParams.get("engagementId");
        if (!id) return bad("engagementId required");
        return NextResponse.json({ ok: true, ...getEventChain(id) });
      }
      case "reputation": {
        const partyId = url.searchParams.get("partyId");
        if (!partyId) return bad("partyId required");
        return NextResponse.json({ ok: true, ...getReputation(partyId) });
      }
      case "match": {
        const engagementId = url.searchParams.get("engagementId");
        const requirementId = url.searchParams.get("requirementId");
        if (!engagementId || !requirementId) {
          return bad("engagementId and requirementId required");
        }
        const eng = getEngagement(engagementId);
        const reqt = eng?.requirements.find(
          (r) => r.requirementId === requirementId,
        );
        if (!reqt) return bad("requirement not found", 404);
        return NextResponse.json({
          ok: true,
          candidates: matchRequirement(reqt),
        });
      }
      default:
        return bad(`Unknown action ${action}`);
    }
  } catch (e) {
    return bad(e instanceof Error ? e.message : "error", 400);
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;
    const action = body.action as Action;
    const idempotencyKey =
      req.headers.get("Idempotency-Key") ??
      (typeof body.idempotencyKey === "string" ? body.idempotencyKey : undefined);

    const actingAsPartyId = String(body.actingAsPartyId ?? "");
    const userId = String(body.userId ?? "api");
    const ctx = { userId, actingAsPartyId, idempotencyKey };

    switch (action) {
      case "create_party":
        return NextResponse.json({
          ok: true,
          party: createParty({
            kind: body.kind as "INDIVIDUAL" | "ORGANISATION",
            legalName: String(body.legalName),
            jurisdiction: String(body.jurisdiction ?? "AU"),
            contactEmail: String(body.contactEmail),
            timezone: String(body.timezone ?? "Australia/Brisbane"),
            userId: body.userId ? String(body.userId) : undefined,
          }),
        });

      case "add_capability":
        return NextResponse.json({
          ok: true,
          capability: addCapability({
            partyId: String(body.partyId),
            kind: body.kind as "SKILL" | "CREDENTIAL" | "ASSET" | "CAPACITY",
            taxonomyIdOrLabel: String(body.taxonomyIdOrLabel),
            level: body.level ? Number(body.level) : undefined,
          }),
        });

      case "create_offering":
        return NextResponse.json({
          ok: true,
          offering: createSessionOffering({
            expertPartyId: String(body.expertPartyId),
            type: body.type as
              | "DIAGNOSTIC_15"
              | "CONSULT_60"
              | "LIVE_TROUBLESHOOT"
              | "DOCUMENT_REVIEW"
              | "REVIEW_PLC"
              | "SPEC_ADVICE",
            title: String(body.title),
            description: String(body.description ?? ""),
            priceMinor: Number(body.priceMinor),
            currency: String(body.currency ?? "AUD"),
            durationMinutes: Number(body.durationMinutes ?? 60),
            languages: Array.isArray(body.languages)
              ? (body.languages as string[])
              : undefined,
            supportedMachineBrands: Array.isArray(body.supportedMachineBrands)
              ? (body.supportedMachineBrands as string[])
              : undefined,
            prerequisites: Array.isArray(body.prerequisites)
              ? (body.prerequisites as string[])
              : undefined,
            deliverableDefinition: String(
              body.deliverableDefinition ??
                "Structured session record with findings, recommendations and next steps",
            ),
            requiresCredentialVerification: !!body.requiresCredentialVerification,
          }),
        });

      case "create_engagement":
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        return NextResponse.json({
          ok: true,
          engagement: createEngagement({
            mode: body.mode as "JOB" | "POD" | "SESSION" | "VENTURE",
            title: String(body.title),
            summary: body.summary ? String(body.summary) : undefined,
            buyerPartyId: String(body.buyerPartyId ?? actingAsPartyId),
            currency: body.currency ? String(body.currency) : undefined,
            jurisdiction: body.jurisdiction
              ? String(body.jurisdiction)
              : undefined,
            offeringId: body.offeringId ? String(body.offeringId) : undefined,
            scheduledAt: body.scheduledAt
              ? String(body.scheduledAt)
              : undefined,
            ctx,
          }),
        });

      case "add_requirement":
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        return NextResponse.json({
          ok: true,
          requirement: addRequirement({
            engagementId: String(body.engagementId),
            kind: body.kind as "SKILL" | "CREDENTIAL" | "ASSET" | "CAPACITY",
            taxonomyIdOrLabel: String(body.taxonomyIdOrLabel),
            necessity: body.necessity as
              | "MANDATORY"
              | "PREFERRED"
              | "OPTIONAL",
            onSiteRequired: !!body.onSiteRequired,
            rationale: body.rationale ? String(body.rationale) : undefined,
            ctx,
          }),
        });

      case "add_contributor":
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        return NextResponse.json({
          ok: true,
          actor: addContributor({
            engagementId: String(body.engagementId),
            partyId: String(body.partyId),
            ctx,
          }),
        });

      case "add_milestone":
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        return NextResponse.json({
          ok: true,
          milestone: addMilestone({
            engagementId: String(body.engagementId),
            title: String(body.title),
            acceptanceCriteria: Array.isArray(body.acceptanceCriteria)
              ? (body.acceptanceCriteria as string[])
              : ["Deliverable accepted"],
            amountMinor: Number(body.amountMinor),
            contributorActorId: String(body.contributorActorId),
            dueDate: body.dueDate ? String(body.dueDate) : undefined,
            ctx,
          }),
        });

      case "disclose_fee":
        return NextResponse.json({
          ok: true,
          fee: discloseFee(String(body.engagementId)),
        });

      case "transition": {
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        // Money-moving transitions require Idempotency-Key
        const moneyStates = ["FUNDED", "AUTHORISED", "BOOKED", "PAID", "ACCEPTED"];
        if (
          moneyStates.includes(String(body.toState)) &&
          !idempotencyKey
        ) {
          return bad("Idempotency-Key required for money-moving transitions");
        }
        const engagement = await transitionEngagement({
          engagementId: String(body.engagementId),
          toState: String(body.toState),
          ctx,
          payload: (body.payload as Record<string, unknown>) ?? undefined,
        });
        return NextResponse.json({ ok: true, engagement });
      }

      case "submit_evidence":
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        return NextResponse.json({
          ok: true,
          evidence: submitMilestoneEvidence({
            engagementId: String(body.engagementId),
            milestoneId: String(body.milestoneId),
            type: body.type as
              | "PHOTO"
              | "DOCUMENT"
              | "INSPECTION_REPORT"
              | "SESSION_RECORD"
              | "VIDEO"
              | "OTHER",
            fileUrl: body.fileUrl ? String(body.fileUrl) : undefined,
            fileName: body.fileName ? String(body.fileName) : undefined,
            criterionIndex:
              body.criterionIndex != null
                ? Number(body.criterionIndex)
                : undefined,
            ctx,
          }),
        });

      case "escalate_session":
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        return NextResponse.json({
          ok: true,
          engagement: escalateSessionToJob({
            sessionEngagementId: String(body.sessionEngagementId),
            title: String(body.title),
            ctx,
          }),
        });

      case "workspace_message": {
        if (!actingAsPartyId) return bad("actingAsPartyId required");
        const eng = getEngagement(String(body.engagementId));
        if (!eng?.workspaceId) return bad("engagement/workspace not found");
        return NextResponse.json({
          ok: true,
          message: postWorkspaceMessage({
            workspaceId: eng.workspaceId,
            authorPartyId: actingAsPartyId,
            body: String(body.body),
            engagementState: eng.state,
          }),
        });
      }

      default:
        return bad(`Unknown action ${action}`);
    }
  } catch (e) {
    return bad(e instanceof Error ? e.message : "error", 400);
  }
}

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
