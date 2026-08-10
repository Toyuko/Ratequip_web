import type { EngagementMode, JobState, SessionState } from "@/lib/collaborate/types";

type TransitionMap = Record<string, readonly string[]>;

const JOB_TRANSITIONS: TransitionMap = {
  DRAFT: ["PUBLISHED", "CANCELLED_BY_BUYER"],
  PUBLISHED: ["QUOTING", "CANCELLED_BY_BUYER"],
  QUOTING: ["AWARDED", "CANCELLED_BY_BUYER"],
  AWARDED: ["CONTRACTED", "WITHDRAWN"],
  CONTRACTED: ["FUNDED", "DISPUTED"],
  FUNDED: ["IN_PROGRESS", "DISPUTED", "ABANDONED"],
  IN_PROGRESS: ["SUBMITTED", "DISPUTED", "ABANDONED"],
  SUBMITTED: ["ACCEPTED", "REVISION_REQUESTED", "DISPUTED"],
  REVISION_REQUESTED: ["IN_PROGRESS", "DISPUTED"],
  ACCEPTED: ["PAID"],
  PAID: ["CLOSED"],
  DISPUTED: ["RESOLVED_RELEASE", "RESOLVED_REFUND", "RESOLVED_SPLIT"],
  RESOLVED_RELEASE: ["CLOSED"],
  RESOLVED_REFUND: ["CLOSED"],
  RESOLVED_SPLIT: ["CLOSED"],
  ABANDONED: ["DISPUTED"],
  CANCELLED_BY_BUYER: [],
  WITHDRAWN: [],
  CLOSED: [],
};

const SESSION_TRANSITIONS: TransitionMap = {
  OFFERED: ["BOOKED"],
  BOOKED: ["AUTHORISED", "CANCELLED_BY_BUYER", "CANCELLED_BY_EXPERT", "RESCHEDULED"],
  AUTHORISED: ["IN_SESSION", "CANCELLED_BY_BUYER", "CANCELLED_BY_EXPERT"],
  RESCHEDULED: ["BOOKED"],
  IN_SESSION: ["DELIVERABLE_SUBMITTED", "DISPUTED"],
  DELIVERABLE_SUBMITTED: ["ACCEPTED", "REVISION_REQUESTED", "DISPUTED"],
  REVISION_REQUESTED: ["DELIVERABLE_SUBMITTED", "DISPUTED"],
  ACCEPTED: ["PAID"],
  PAID: ["CLOSED"],
  DISPUTED: ["CLOSED"],
  CANCELLED_BY_BUYER: [],
  CANCELLED_BY_EXPERT: [],
  CLOSED: [],
};

const MILESTONE_TRANSITIONS: TransitionMap = {
  DRAFT: ["FUNDED", "CANCELLED"],
  FUNDED: ["IN_PROGRESS", "DISPUTED", "CANCELLED"],
  IN_PROGRESS: ["SUBMITTED", "DISPUTED", "CANCELLED"],
  SUBMITTED: ["ACCEPTED", "REVISION_REQUESTED", "DISPUTED"],
  REVISION_REQUESTED: ["IN_PROGRESS", "DISPUTED"],
  ACCEPTED: ["PAID"],
  PAID: [],
  DISPUTED: ["ACCEPTED", "CANCELLED"],
  CANCELLED: [],
};

export function canTransition(
  map: TransitionMap,
  from: string,
  to: string,
): boolean {
  return (map[from] ?? []).includes(to);
}

export function assertJobTransition(from: JobState, to: JobState) {
  if (!canTransition(JOB_TRANSITIONS, from, to)) {
    throw new Error(`Invalid JOB transition ${from} → ${to}`);
  }
}

export function assertSessionTransition(from: SessionState, to: SessionState) {
  if (!canTransition(SESSION_TRANSITIONS, from, to)) {
    throw new Error(`Invalid SESSION transition ${from} → ${to}`);
  }
}

export function assertMilestoneTransition(from: string, to: string) {
  if (!canTransition(MILESTONE_TRANSITIONS, from, to)) {
    throw new Error(`Invalid Milestone transition ${from} → ${to}`);
  }
}

export function stateMachineForMode(mode: EngagementMode): TransitionMap {
  switch (mode) {
    case "JOB":
      return JOB_TRANSITIONS;
    case "SESSION":
      return SESSION_TRANSITIONS;
    case "POD":
      // Pods reuse job machine with multi-actor overlays in Phase 3.
      return JOB_TRANSITIONS;
    case "VENTURE":
      return {
        CONCEPT: ["GAP_ANALYSED"],
        GAP_ANALYSED: ["PARTICIPANTS_INVITED"],
        PARTICIPANTS_INVITED: ["NDA_EXECUTED"],
        NDA_EXECUTED: ["CONTRIBUTIONS_REGISTERED"],
        CONTRIBUTIONS_REGISTERED: ["STRUCTURE_DECIDED"],
        STRUCTURE_DECIDED: [
          "EXECUTING_AS_ENGAGEMENTS",
          "ENTITY_FORMED",
          "EXITED",
        ],
        EXECUTING_AS_ENGAGEMENTS: ["DORMANT", "ARCHIVED"],
        ENTITY_FORMED: ["DORMANT", "ARCHIVED"],
        EXITED: ["ARCHIVED"],
        DORMANT: ["ARCHIVED", "CONCEPT"],
        ARCHIVED: [],
      };
    default:
      return {};
  }
}

export function assertModeTransition(
  mode: EngagementMode,
  from: string,
  to: string,
) {
  const map = stateMachineForMode(mode);
  if (!canTransition(map, from, to)) {
    throw new Error(`Invalid ${mode} transition ${from} → ${to}`);
  }
}

export { JOB_TRANSITIONS, SESSION_TRANSITIONS, MILESTONE_TRANSITIONS };
