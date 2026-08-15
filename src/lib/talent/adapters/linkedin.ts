import { createHmac, timingSafeEqual } from "crypto";
import { isDemoMode, publicAppUrl } from "@/lib/config";
import { linkedInMappingFor, TAXONOMY_VERSION } from "@/lib/talent/taxonomy";
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

export const LINKEDIN_ADAPTER_BOARD = "linkedin" as const;

function accessToken() {
  return process.env.LINKEDIN_ACCESS_TOKEN?.trim() || "";
}

function orgUrn() {
  return process.env.LINKEDIN_ORG_URN?.trim() || "";
}

function companyPageUrl() {
  return (
    process.env.LINKEDIN_COMPANY_PAGE_URL?.trim() ||
    "https://www.linkedin.com/company/ratequip"
  );
}

function webhookSecret() {
  return process.env.LINKEDIN_WEBHOOK_SECRET?.trim() || "";
}

export function linkedInConfigured() {
  return Boolean(accessToken() && (orgUrn() || companyPageUrl()));
}

/** HMAC-SHA256 over raw body when LINKEDIN_WEBHOOK_SECRET is set. */
export function verifyLinkedInSignature(
  rawBody: string,
  header: string | null,
) {
  const secret = webhookSecret();
  if (!secret) {
    if (process.env.VERCEL_ENV === "production" && !isDemoMode()) {
      return false;
    }
    return true;
  }
  if (!header) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = header.replace(/^sha256=/i, "").trim();
  const a = Buffer.from(digest);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function signLinkedInBody(rawBody: string, secret = webhookSecret()) {
  return createHmac("sha256", secret).update(rawBody).digest("hex");
}

export function linkedInScreenerQuestions(gig: CanonicalGig) {
  return {
    additionalQuestions: {
      customQuestionSets: [
        {
          partnerQuestionIdentifier: "rq-operator-tickets",
          questions: [
            {
              partnerQuestionIdentifier: "licence_classes",
              questionDetails: {
                type: "TEXT",
                text: {
                  preferredLocale: { country: "AU", language: "en" },
                  text: "Which current high-risk work licences or tickets do you hold?",
                },
              },
              required: true,
            },
            {
              partnerQuestionIdentifier: "ticket_numbers",
              questionDetails: {
                type: "TEXT",
                text: {
                  preferredLocale: { country: "AU", language: "en" },
                  text: "Licence / ticket numbers (and issuing state).",
                },
              },
              required: true,
            },
            {
              partnerQuestionIdentifier: "white_card",
              questionDetails: {
                type: "MULTIPLE_CHOICE",
                text: {
                  preferredLocale: { country: "AU", language: "en" },
                  text: "Do you hold a current White Card / construction induction?",
                },
                options: [
                  {
                    partnerQuestionIdentifier: "yes",
                    text: {
                      preferredLocale: { country: "AU", language: "en" },
                      text: "Yes",
                    },
                  },
                  {
                    partnerQuestionIdentifier: "no",
                    text: {
                      preferredLocale: { country: "AU", language: "en" },
                      text: "No",
                    },
                  },
                ],
              },
              required: true,
            },
            {
              partnerQuestionIdentifier: "pool_consent",
              questionDetails: {
                type: "MULTIPLE_CHOICE",
                text: {
                  preferredLocale: { country: "AU", language: "en" },
                  text: "RateQuip will retain your application in an operator talent pool and may share it with rental customers for placement. Do you consent?",
                },
                options: [
                  {
                    partnerQuestionIdentifier: "yes",
                    text: {
                      preferredLocale: { country: "AU", language: "en" },
                      text: "Yes",
                    },
                  },
                  {
                    partnerQuestionIdentifier: "no",
                    text: {
                      preferredLocale: { country: "AU", language: "en" },
                      text: "No",
                    },
                  },
                ],
              },
              required: true,
            },
            {
              partnerQuestionIdentifier: "availability",
              questionDetails: {
                type: "MULTIPLE_CHOICE",
                text: {
                  preferredLocale: { country: "AU", language: "en" },
                  text: `Are you available ${new Date(gig.startsAt).toISOString().slice(0, 10)} to ${new Date(gig.endsAt).toISOString().slice(0, 10)}?`,
                },
                options: [
                  {
                    partnerQuestionIdentifier: "yes",
                    text: {
                      preferredLocale: { country: "AU", language: "en" },
                      text: "Yes",
                    },
                  },
                  {
                    partnerQuestionIdentifier: "no",
                    text: {
                      preferredLocale: { country: "AU", language: "en" },
                      text: "No",
                    },
                  },
                ],
              },
              required: true,
            },
          ],
        },
      ],
    },
  };
}

function buildSimpleJobPosting(
  gig: CanonicalGig,
  operation: "CREATE" | "UPDATE" | "CLOSE" | "RENEW",
) {
  const origin = publicAppUrl();
  const mapping = linkedInMappingFor(gig.equipmentClass);
  if (!mapping) {
    throw new Error(`No LinkedIn taxonomy mapping for ${gig.equipmentClass}`);
  }
  const element: Record<string, unknown> = {
    externalJobPostingId: gig.id,
    title: gig.title,
    description: gig.description || gig.title,
    listedAt: Date.parse(gig.createdAt) || Date.now(),
    jobPostingOperationType: operation,
    location: gig.siteLabel ?? "Australia",
    availability: "PUBLIC",
    companyApplyUrl: `${origin}/operators/gigs/${gig.id}`,
    posterEmail:
      process.env.LINKEDIN_POSTER_EMAIL?.trim() || "talent@ratequip.com",
    onsiteApplyConfiguration: {
      jobApplicationWebhookUrl: `${origin}/api/webhooks/linkedin`,
      questions: linkedInScreenerQuestions(gig),
    },
  };
  if (orgUrn()) {
    element.integrationContext = orgUrn();
  } else {
    element.companyPageURL = companyPageUrl();
  }
  return element;
}

async function linkedInApi(
  path: string,
  init: RequestInit & { method?: string },
) {
  const token = accessToken();
  if (!token) {
    throw new Error("LINKEDIN_ACCESS_TOKEN not configured");
  }
  const res = await fetch(`https://api.linkedin.com${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let json: Record<string, unknown> = {};
  try {
    json = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    json = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`LinkedIn API ${res.status}: ${text.slice(0, 400)}`);
  }
  return json;
}

export async function pollLinkedInTask(taskUrn: string) {
  const encoded = encodeURIComponent(taskUrn);
  return linkedInApi(`/v2/simpleJobPostingTasks/${encoded}`, {
    method: "GET",
  });
}

function answersFromLinkedIn(raw: Record<string, unknown>) {
  const answers: Record<string, string> = {};
  const questionResponses = raw.questionResponses ?? raw.answers;
  if (Array.isArray(questionResponses)) {
    for (const item of questionResponses) {
      if (!item || typeof item !== "object") continue;
      const row = item as {
        partnerQuestionIdentifier?: string;
        questionIdentifier?: string;
        answer?: unknown;
        value?: unknown;
      };
      const id =
        row.partnerQuestionIdentifier ?? row.questionIdentifier ?? "";
      if (!id) continue;
      const value = row.answer ?? row.value;
      answers[id] =
        typeof value === "string" ? value : JSON.stringify(value ?? "");
    }
  }
  return answers;
}

export function parseLinkedInApplication(
  raw: Record<string, unknown>,
): CanonicalApplication {
  const applicant = (raw.applicant ?? raw.candidate ?? {}) as Record<
    string,
    unknown
  >;
  const contact = (applicant.contactInfo ?? applicant) as Record<
    string,
    unknown
  >;
  const applyId = String(
    raw.id ??
      raw.jobApplicationId ??
      raw.externalJobApplicationId ??
      raw.applyId ??
      "",
  );
  const given =
    typeof applicant.firstName === "string"
      ? applicant.firstName
      : typeof contact.firstName === "string"
        ? contact.firstName
        : undefined;
  const family =
    typeof applicant.lastName === "string"
      ? applicant.lastName
      : typeof contact.lastName === "string"
        ? contact.lastName
        : undefined;
  const email =
    typeof contact.email === "string"
      ? contact.email
      : typeof applicant.email === "string"
        ? applicant.email
        : undefined;
  const phone =
    typeof contact.phoneNumber === "string"
      ? contact.phoneNumber
      : typeof applicant.phoneNumber === "string"
        ? applicant.phoneNumber
        : undefined;

  return {
    id: `app_linkedin_${applyId || "unknown"}`,
    board: "linkedin",
    externalApplicationId: applyId,
    receivedAt: new Date().toISOString(),
    givenName: given,
    familyName: family,
    email,
    phone,
    answers: answersFromLinkedIn(raw),
    pipelineState: "APPLIED",
  };
}

export const linkedInAdapter: JobBoardAdapter = {
  board: LINKEDIN_ADAPTER_BOARD,
  capabilities(): BoardCapabilities {
    return {
      screeningQuestions: true,
      attachments: true,
      dispositionSync: false,
      renewPosting: true,
      asyncPublish: true,
      requiresHirerRelationship: true,
      applicationRetentionDays: null,
    };
  },
  async publishGig(
    _ctx: HirerContext,
    gig: CanonicalGig,
  ): Promise<PublishResult> {
    if (!linkedInMappingFor(gig.equipmentClass)) {
      return {
        ok: false,
        state: "REJECTED",
        message: `No LinkedIn taxonomy mapping for ${gig.equipmentClass}`,
      };
    }
    if (!linkedInConfigured()) {
      if (isDemoMode() || process.env.VERCEL_ENV !== "production") {
        return {
          ok: true,
          externalPostingId: gig.id,
          externalTaskId: `urn:li:simpleJobPostingTask:demo-${gig.id}`,
          state: "PENDING",
          message:
            "LinkedIn credentials not set — demo async publish recorded. Enable Apply Connect partner access to go live.",
        };
      }
      return {
        ok: false,
        state: "REJECTED",
        message:
          "LinkedIn Apply Connect not configured (LINKEDIN_ACCESS_TOKEN + org URN).",
      };
    }
    try {
      const body = {
        elements: [buildSimpleJobPosting(gig, "CREATE")],
      };
      const json = await linkedInApi("/v2/simpleJobPostings", {
        method: "POST",
        headers: { "x-restli-method": "batch_create" },
        body: JSON.stringify(body),
      });
      const elements = Array.isArray(json.elements)
        ? (json.elements as Record<string, unknown>[])
        : [];
      const taskUrn = String(
        elements[0]?.id ?? elements[0]?.simpleJobPostingTask ?? "",
      );
      return {
        ok: true,
        externalPostingId: gig.id,
        externalTaskId: taskUrn || undefined,
        state: "PENDING",
        message: "LinkedIn async task created — poll task status",
      };
    } catch (error) {
      return {
        ok: false,
        state: "REJECTED",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  },
  async updateGig(ctx, pub, gig) {
    if (!linkedInConfigured()) {
      return this.publishGig(ctx, gig);
    }
    try {
      await linkedInApi("/v2/simpleJobPostings", {
        method: "POST",
        headers: { "x-restli-method": "batch_create" },
        body: JSON.stringify({
          elements: [buildSimpleJobPosting(gig, "UPDATE")],
        }),
      });
      return {
        ok: true,
        externalPostingId: pub.externalPostingId ?? gig.id,
        state: "PENDING",
      };
    } catch (error) {
      return {
        ok: false,
        state: "REJECTED",
        message: error instanceof Error ? error.message : String(error),
      };
    }
  },
  async closeGig(_ctx, pub) {
    if (!linkedInConfigured() || !pub.externalPostingId) return;
    await linkedInApi("/v2/simpleJobPostings", {
      method: "POST",
      headers: { "x-restli-method": "batch_create" },
      body: JSON.stringify({
        elements: [
          {
            externalJobPostingId: pub.externalPostingId,
            jobPostingOperationType: "CLOSE",
            availability: "PUBLIC",
          },
        ],
      }),
    });
  },
  async verifyInbound(req: RawInboundRequest): Promise<InboundEnvelope> {
    const header =
      req.headers["x-linkedin-signature"] ??
      req.headers["X-LinkedIn-Signature"] ??
      req.headers["x-li-signature"];
    if (!verifyLinkedInSignature(req.rawBody, header)) {
      throw new Error("INVALID_SIGNATURE");
    }
    const raw = JSON.parse(req.rawBody) as Record<string, unknown>;
    const applyId = String(
      raw.id ??
        raw.jobApplicationId ??
        raw.externalJobApplicationId ??
        raw.applyId ??
        "",
    );
    if (!applyId) throw new Error("MISSING_APPLY_ID");
    return { board: "linkedin", externalEventId: applyId, raw };
  },
  async fetchApplication(env: InboundEnvelope): Promise<CanonicalApplication> {
    return parseLinkedInApplication(env.raw);
  },
  async sendDisposition(
    _ref: { externalApplicationId: string },
    _status: DispositionStatus,
    _changedAt: string,
  ) {
    // LinkedIn disposition sync is via RSC / Middleware — out of scope until partner tier.
    return;
  },
};

export function defaultLinkedInHirerContext(): HirerContext {
  return {
    hirerId: "hirer_ratequip",
    boardAccountRef: orgUrn() || companyPageUrl(),
    credentialsRef: "LINKEDIN_ACCESS_TOKEN",
  };
}

export { TAXONOMY_VERSION };
