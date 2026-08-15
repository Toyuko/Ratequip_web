import { createHmac, timingSafeEqual } from "crypto";
import { isDemoMode, publicAppUrl } from "@/lib/config";
import { indeedMappingFor, TAXONOMY_VERSION } from "@/lib/talent/taxonomy";
import type {
  BoardCapabilities,
  CanonicalApplication,
  CanonicalGig,
  DispositionStatus,
  GigPublication,
  HirerContext,
  InboundEnvelope,
  JobBoardAdapter,
  PublishResult,
  RawInboundRequest,
} from "@/lib/talent/types";

export const INDEED_ADAPTER_BOARD = "indeed" as const;

function applySecret() {
  return process.env.INDEED_APPLY_SECRET?.trim() || "";
}

function applyToken() {
  return process.env.INDEED_APPLY_API_TOKEN?.trim() || "";
}

export function verifyIndeedSignature(rawBody: string, header: string | null) {
  const secret = applySecret();
  if (!secret) {
    if (process.env.VERCEL_ENV === "production" && !isDemoMode()) {
      return false;
    }
    return true;
  }
  if (!header) return false;
  const digest = createHmac("sha1", secret).update(rawBody).digest("base64");
  const a = Buffer.from(digest);
  const b = Buffer.from(header);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function signIndeedBody(rawBody: string, secret = applySecret()) {
  return createHmac("sha1", secret).update(rawBody).digest("base64");
}

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function cdata(value: string) {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

export function indeedScreenerQuestions(gig: CanonicalGig) {
  return {
    schemaVersion: "1.1",
    screenerQuestions: {
      questions: [
        {
          id: "licence_classes",
          question:
            "Which current high-risk work licences or tickets do you hold?",
          required: true,
          format: "textarea",
        },
        {
          id: "ticket_numbers",
          question: "Licence / ticket numbers (and issuing state).",
          required: true,
          format: "textarea",
        },
        {
          id: "white_card",
          question: "Do you hold a current White Card / construction induction?",
          required: true,
          format: "select",
          options: ["Yes", "No"],
        },
        {
          id: "availability",
          question: `Are you available ${new Date(gig.startsAt).toISOString().slice(0, 10)} to ${new Date(gig.endsAt).toISOString().slice(0, 10)}?`,
          required: true,
          format: "select",
          options: ["Yes", "No"],
        },
        {
          id: "pool_consent",
          question:
            "RateQuip will keep your application in an operator talent pool and may share it with rental customers for placement. Do you consent?",
          required: true,
          format: "select",
          options: ["Yes", "No"],
        },
      ],
    },
  };
}

export function buildIndeedApplyMetadata(gig: CanonicalGig) {
  const origin = publicAppUrl();
  const params = new URLSearchParams({
    "indeed-apply-jobid": gig.id,
    "indeed-apply-jobTitle": gig.title,
    "indeed-apply-jobCompanyName":
      process.env.INDEED_EMPLOYER_NAME?.trim() || "RateQuip",
    "indeed-apply-jobLocation": gig.siteLabel ?? "Australia",
    "indeed-apply-jobUrl": `${origin}/operators/gigs/${gig.id}`,
    "indeed-apply-postUrl": `${origin}/api/webhooks/indeed`,
    "indeed-apply-questions": `${origin}/api/v1/talent/indeed/questions?gigId=${encodeURIComponent(gig.id)}`,
  });
  const token = applyToken();
  if (token) params.set("indeed-apply-apiToken", token);
  return params.toString();
}

export function renderIndeedXmlFeed(gigs: CanonicalGig[]) {
  const origin = publicAppUrl();
  const jobs = gigs
    .filter((g) => g.status === "OPEN" && indeedMappingFor(g.equipmentClass))
    .map((gig) => {
      const loc = (gig.siteLabel ?? "Australia").split(",");
      const city = loc[0]?.trim() ?? "Sydney";
      const state = loc[1]?.trim() ?? "NSW";
      const hourly = (gig.rateCents / 100).toFixed(2);
      return `  <job>
    <title>${cdata(gig.title)}</title>
    <date>${escapeXml(gig.createdAt)}</date>
    <referencenumber>${escapeXml(gig.id)}</referencenumber>
    <url>${escapeXml(`${origin}/operators/gigs/${gig.id}`)}</url>
    <company>${escapeXml(process.env.INDEED_EMPLOYER_NAME?.trim() || "RateQuip")}</company>
    <city>${escapeXml(city)}</city>
    <state>${escapeXml(state)}</state>
    <country>AU</country>
    <description>${cdata(gig.description || gig.title)}</description>
    <salary>${escapeXml(`${hourly} ${gig.currency} per hour`)}</salary>
    <indeed-apply-data>${escapeXml(buildIndeedApplyMetadata(gig))}</indeed-apply-data>
  </job>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher>RateQuip</publisher>
  <publisherurl>${escapeXml(origin)}</publisherurl>
${jobs}
</source>
`;
}

function answersFromPayload(raw: Record<string, unknown>) {
  const answers: Record<string, string> = {};
  const list = raw.screenerQuestionsAndAnswers;
  if (Array.isArray(list)) {
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      const row = item as { question?: { id?: string }; answer?: unknown };
      const id = row.question?.id;
      if (!id) continue;
      answers[id] = typeof row.answer === "string" ? row.answer : JSON.stringify(row.answer);
    }
  }
  return answers;
}

export function parseIndeedApplication(
  raw: Record<string, unknown>,
): CanonicalApplication {
  const applicant = (raw.applicant ?? {}) as Record<string, unknown>;
  const job = (raw.job ?? {}) as Record<string, unknown>;
  const resume = (applicant.resume ?? {}) as Record<string, unknown>;
  const file = (resume.file ?? {}) as Record<string, unknown>;
  const fullName = String(applicant.fullName ?? "");
  const parts = fullName.trim().split(/\s+/);
  const applyId = String(raw.id ?? raw.applyId ?? raw.appliedOnIndeedId ?? "");
  return {
    id: `app_indeed_${applyId || "unknown"}`,
    board: "indeed",
    externalApplicationId: applyId,
    receivedAt: new Date().toISOString(),
    givenName: parts.slice(0, -1).join(" ") || parts[0],
    familyName: parts.length > 1 ? parts.at(-1) : undefined,
    email: typeof applicant.email === "string" ? applicant.email : undefined,
    phone:
      typeof applicant.phoneNumber === "string"
        ? applicant.phoneNumber
        : undefined,
    resumeFileName:
      typeof file.fileName === "string" ? file.fileName : undefined,
    resumeBase64: typeof file.data === "string" ? file.data : undefined,
    answers: answersFromPayload(raw),
    pipelineState: "APPLIED",
    gigPublicationId: undefined,
  };
}

export const indeedAdapter: JobBoardAdapter = {
  board: INDEED_ADAPTER_BOARD,
  capabilities(): BoardCapabilities {
    return {
      screeningQuestions: true,
      attachments: true,
      dispositionSync: { required: true, minCadence: "daily" },
      renewPosting: false,
      asyncPublish: false,
      requiresHirerRelationship: false,
      applicationRetentionDays: null,
    };
  },
  async publishGig(_ctx: HirerContext, gig: CanonicalGig): Promise<PublishResult> {
    if (!indeedMappingFor(gig.equipmentClass)) {
      return {
        ok: false,
        state: "REJECTED",
        message: `No Indeed taxonomy mapping for ${gig.equipmentClass}`,
      };
    }
    return {
      ok: true,
      externalPostingId: gig.id,
      state: "LIVE",
      message: "Listed on Indeed XML feed",
    };
  },
  async updateGig(ctx, pub, gig) {
    return this.publishGig(ctx, gig);
  },
  async closeGig() {
    return;
  },
  async verifyInbound(req: RawInboundRequest): Promise<InboundEnvelope> {
    const header =
      req.headers["x-indeed-signature"] ?? req.headers["X-Indeed-Signature"];
    if (!verifyIndeedSignature(req.rawBody, header)) {
      throw new Error("INVALID_SIGNATURE");
    }
    const raw = JSON.parse(req.rawBody) as Record<string, unknown>;
    const applyId = String(raw.id ?? raw.applyId ?? "");
    if (!applyId) throw new Error("MISSING_APPLY_ID");
    return { board: "indeed", externalEventId: applyId, raw };
  },
  async fetchApplication(env: InboundEnvelope): Promise<CanonicalApplication> {
    return parseIndeedApplication(env.raw);
  },
  async sendDisposition(
    ref: { externalApplicationId: string },
    status: DispositionStatus,
    changedAt: string,
  ) {
    const endpoint = process.env.INDEED_DISPOSITION_URL?.trim();
    if (!endpoint) return;
    const token = applyToken();
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        dispositions: [
          {
            applyId: ref.externalApplicationId,
            status,
            statusChangeDateTime: changedAt,
          },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`Indeed disposition ${res.status}`);
    }
  },
};

export function defaultHirerContext(): HirerContext {
  return {
    hirerId: "hirer_ratequip",
    boardAccountRef: process.env.INDEED_EMPLOYER_ID?.trim() || "ratequip",
    credentialsRef: "INDEED_APPLY_SECRET",
  };
}

export { TAXONOMY_VERSION };
