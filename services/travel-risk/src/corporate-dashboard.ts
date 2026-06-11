/**
 * Corporate traveler-tracking dashboard.
 *
 * Aggregates live traveler profiles for a corporate client's security team.
 * Only travelers who have granted the 'corporate_dashboard' consent type
 * appear in this view.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN operational notes */
export const CORPORATE_DASHBOARD_NOTES_EN = [
  "opt-in-per-traveler: a traveler only appears in the corporate dashboard if they have explicitly granted the 'corporate_dashboard' consent type; filter consentGranted=false before display",
  "duty-of-care-note: this dashboard does not replace legal duty-of-care obligations; corporate clients must supplement with direct traveler communication and embassy registration",
] as const;

/** UA операційні примітки */
export const CORPORATE_DASHBOARD_NOTES_UK = [
  "opt-in-per-traveler: мандрівник з'являється на корпоративній панелі лише за умови явної згоди на тип 'corporate_dashboard'; фільтруйте consentGranted=false перед відображенням",
  "duty-of-care-note: ця панель не замінює юридичних зобов'язань duty-of-care; корпоративні клієнти повинні доповнювати прямим зв'язком з мандрівниками та реєстрацією в посольстві",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Live profile of a single tracked traveler */
export interface TravelerProfile {
  userId: string;
  displayName: string;
  orgId: string;
  /** Last known location, if consent granted and location available */
  currentLocation?: {
    lat: number;
    lng: number;
    /** ISO-8601 timestamp of the location update */
    updatedAt: string;
  };
  /** Latest composite risk score for the traveler's current location (0-100) */
  riskScore?: number;
  /** Active alert messages for this traveler */
  alerts?: string[];
  /** Whether the traveler has granted corporate_dashboard consent */
  consentGranted: boolean;
}

/** Aggregated dashboard for one corporate organisation */
export interface CorporateDashboard {
  orgId: string;
  travelers: TravelerProfile[];
  /** Number of travelers with riskScore >= 60 */
  highRiskCount: number;
  /** Number of travelers with no location update in the last 6 hours */
  unreachableCount: number;
  /** ISO-8601 timestamp of last dashboard refresh */
  lastUpdatedAt: string;
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

const UNREACHABLE_THRESHOLD_MS = 6 * 60 * 60 * 1000; // 6 hours
const HIGH_RISK_THRESHOLD = 60;

/**
 * Build a corporate dashboard snapshot.
 *
 * Only travelers with consentGranted = true are included in the output.
 * Callers must pre-filter the `travelers` array to only pass in users
 * belonging to `orgId`.
 */
export function buildCorporateDashboard(
  orgId: string,
  travelers: TravelerProfile[],
): CorporateDashboard {
  // Enforce consent filter
  const consentedTravelers = travelers.filter((t) => t.consentGranted);

  const now = Date.now();

  const highRiskCount = consentedTravelers.filter(
    (t) => (t.riskScore ?? 0) >= HIGH_RISK_THRESHOLD,
  ).length;

  const unreachableCount = consentedTravelers.filter((t) => {
    if (!t.currentLocation) return true;
    const ageMs = now - new Date(t.currentLocation.updatedAt).getTime();
    return ageMs > UNREACHABLE_THRESHOLD_MS;
  }).length;

  return {
    orgId,
    travelers: consentedTravelers,
    highRiskCount,
    unreachableCount,
    lastUpdatedAt: new Date().toISOString(),
  };
}
