/**
 * V12 overlay UI (`/v12/*`) — taxonomy, matching, procurement demos, AI setup, etc.
 * Disabled so signed-in users stay on core Phase 2 dashboards (RFQs, quotes, profile).
 * Flip to `true` to re-open the hub for internal demos.
 */
export const V12_UI_ENABLED = false;

/**
 * Part 5 / Release 5C AI company-setup interview (`/v12/activation`).
 * Requires `V12_UI_ENABLED`. Kept separate so the interview can stay off
 * even if the broader hub is reopened later.
 */
export const COMPANY_SETUP_INTERVIEW_ENABLED = false;
