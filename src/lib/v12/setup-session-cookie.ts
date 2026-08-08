import { cookies } from "next/headers";
import { buildCompanySetupSections } from "@/lib/v12/operating-profile/interview";
import type { CompanySetupSession } from "@/lib/v12/operating-profile/types";
import { getV12Store } from "@/lib/v12/store";

/** Survives serverless isolate restarts — in-memory V12 store alone does not. */
const COOKIE = "rq_v12_setup";
const MAX_BYTES = 3500;

type CompactSetupSession = Omit<CompanySetupSession, "sections">;

function expand(compact: CompactSetupSession): CompanySetupSession {
  return {
    ...compact,
    sections: buildCompanySetupSections({
      role: compact.role,
      industryPack: compact.industryPack,
    }),
  };
}

function compactOf(session: CompanySetupSession): CompactSetupSession {
  return {
    id: session.id,
    companyId: session.companyId,
    companyName: session.companyName,
    role: session.role,
    industryPack: session.industryPack,
    industryPackSource: session.industryPackSource,
    industryPackReason: session.industryPackReason,
    status: session.status,
    sectionIndex: session.sectionIndex,
    answers: session.answers,
    suggestions: session.suggestions,
    companySuggestions: session.companySuggestions,
    profileId: session.profileId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

function upsertIntoStore(session: CompanySetupSession) {
  const store = getV12Store();
  const idx = store.companySetupSessions.findIndex((s) => s.id === session.id);
  if (idx >= 0) store.companySetupSessions[idx] = session;
  else store.companySetupSessions.unshift(session);
  return session;
}

export async function persistSetupSession(session: CompanySetupSession) {
  const compact = compactOf(session);
  let value = JSON.stringify(compact);
  if (value.length > MAX_BYTES) {
    compact.companySuggestions = compact.companySuggestions.slice(0, 2);
    compact.suggestions = compact.suggestions.slice(0, 8);
    value = JSON.stringify(compact);
  }
  if (value.length > MAX_BYTES) {
    // Last resort: keep answers keys but truncate long values
    const trimmed: Record<string, string> = {};
    for (const [k, v] of Object.entries(compact.answers)) {
      trimmed[k] = v.length > 120 ? `${v.slice(0, 117)}...` : v;
    }
    compact.answers = trimmed;
    value = JSON.stringify(compact);
  }
  if (value.length > MAX_BYTES) return;

  const jar = await cookies();
  jar.set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearSetupSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/**
 * If the in-memory store lost the session (common on Vercel/serverless),
 * rehydrate from the httpOnly cookie and put it back in the store.
 */
export async function hydrateSetupSessionIntoStore(
  sessionId?: string,
): Promise<CompanySetupSession | null> {
  const store = getV12Store();
  if (sessionId) {
    const hit = store.companySetupSessions.find((s) => s.id === sessionId);
    if (hit) return hit;
  } else if (store.companySetupSessions[0]) {
    return store.companySetupSessions[0] ?? null;
  }

  const jar = await cookies();
  const raw = jar.get(COOKIE)?.value;
  if (!raw) return null;

  try {
    const compact = JSON.parse(raw) as CompactSetupSession;
    if (!compact?.id || !compact.companyName || !compact.role) return null;
    if (sessionId && compact.id !== sessionId) return null;
    return upsertIntoStore(expand(compact));
  } catch {
    return null;
  }
}
