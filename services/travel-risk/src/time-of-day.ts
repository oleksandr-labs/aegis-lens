/**
 * Time-of-day risk modulation for travel risk scores.
 *
 * Adjusts a base risk score by a multiplier that reflects the increased
 * danger during night hours and curfew periods.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN operational notes */
export const TIME_OF_DAY_NOTES_EN = [
  "curfew-hours-override: if a city has an active curfew, override the hourly multiplier to 2.0 for curfew hours regardless of this profile",
  "user-local-time-preferred: use the traveler's local time zone when computing hourUtc → local hour; fall back to UTC only if timezone is unknown",
] as const;

/** UA операційні примітки */
export const TIME_OF_DAY_NOTES_UK = [
  "curfew-hours-override: якщо в місті діє комендантська година, перевизначте погодинний множник до 2.0 під час комендантської години незалежно від цього профілю",
  "user-local-time-preferred: використовуйте місцевий часовий пояс мандрівника при перетворенні hourUtc → місцева година; якщо часовий пояс невідомий — використовуйте UTC",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Risk profile for one UTC hour (0-23) */
export interface TimeOfDayRisk {
  /** UTC hour 0-23 */
  hourUtc: number;
  /** Multiplier applied to the base risk score (0.5 = safer, 2.0 = more dangerous) */
  riskMultiplier: number;
  label: string;
  labelUk: string;
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

/**
 * Default 24-hour risk multiplier profile.
 *
 * Night (00-04): 1.4×  — darkness, reduced visibility, curfew window
 * Dawn  (05-06): 1.2×  — low light, sparse traffic, irregular patrols
 * Day   (07-18): 1.0×  — normal travel hours, baseline risk
 * Dusk  (19-21): 1.1×  — reduced light, start of curfew transition
 * Night (22-23): 1.4×  — return to high-risk night window
 */
export const TIME_OF_DAY_RISK_PROFILE: TimeOfDayRisk[] = [
  // Night — 00-04
  { hourUtc: 0,  riskMultiplier: 1.4, label: "Night",       labelUk: "Ніч" },
  { hourUtc: 1,  riskMultiplier: 1.4, label: "Night",       labelUk: "Ніч" },
  { hourUtc: 2,  riskMultiplier: 1.4, label: "Night",       labelUk: "Ніч" },
  { hourUtc: 3,  riskMultiplier: 1.4, label: "Night",       labelUk: "Ніч" },
  { hourUtc: 4,  riskMultiplier: 1.4, label: "Night",       labelUk: "Ніч" },
  // Dawn — 05-06
  { hourUtc: 5,  riskMultiplier: 1.2, label: "Dawn",        labelUk: "Світанок" },
  { hourUtc: 6,  riskMultiplier: 1.2, label: "Dawn",        labelUk: "Світанок" },
  // Day — 07-18
  { hourUtc: 7,  riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 8,  riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 9,  riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 10, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 11, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 12, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 13, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 14, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 15, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 16, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 17, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  { hourUtc: 18, riskMultiplier: 1.0, label: "Day",         labelUk: "День" },
  // Dusk — 19-21
  { hourUtc: 19, riskMultiplier: 1.1, label: "Dusk",        labelUk: "Сутінки" },
  { hourUtc: 20, riskMultiplier: 1.1, label: "Dusk",        labelUk: "Сутінки" },
  { hourUtc: 21, riskMultiplier: 1.1, label: "Dusk",        labelUk: "Сутінки" },
  // Night — 22-23
  { hourUtc: 22, riskMultiplier: 1.4, label: "Night",       labelUk: "Ніч" },
  { hourUtc: 23, riskMultiplier: 1.4, label: "Night",       labelUk: "Ніч" },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Apply time-of-day modulation to a base risk score.
 *
 * @param baseScore — 0-100 composite risk score
 * @param hourUtc  — current UTC hour (0-23)
 * @returns modulated score clamped to [0, 100]
 */
export function modulateRiskByTimeOfDay(baseScore: number, hourUtc: number): number {
  const hour = Math.max(0, Math.min(23, Math.floor(hourUtc)));
  const profile = TIME_OF_DAY_RISK_PROFILE[hour];
  const multiplier = profile?.riskMultiplier ?? 1.0;
  return Math.min(100, Math.round(baseScore * multiplier));
}
