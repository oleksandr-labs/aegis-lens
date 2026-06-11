/**
 * Simple announce helper — thin wrapper over the full a11y-announcer.
 * Uses the polite live region by default; pass "assertive" for critical alerts.
 */
export { announcePolite as announce, announceAssertive } from "@/lib/a11y-announcer";
