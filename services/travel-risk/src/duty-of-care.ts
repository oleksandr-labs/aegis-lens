/**
 * Duty-of-care report generation for corporate compliance.
 *
 * Produces structured reports aligned with ISO 31030 (Travel Risk Management)
 * for corporate clients to demonstrate fulfilment of their duty-of-care
 * obligations to travelling employees.
 */

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

/** EN compliance notes */
export const DUTY_OF_CARE_NOTES_EN = [
  "ISO-31030-aligned: report structure follows ISO 31030:2021 Travel Risk Management guidance; include risk assessment, incident log, and mitigation evidence",
  "corporate-compliance: reports are suitable for submission to HR, legal, or insurance audit; store signed PDFs in the org's document archive",
] as const;

/** UA нотатки з відповідності */
export const DUTY_OF_CARE_NOTES_UK = [
  "ISO-31030-aligned: структура звіту відповідає настановам ISO 31030:2021 з управління ризиками подорожей; включайте оцінку ризиків, журнал інцидентів та докази заходів",
  "corporate-compliance: звіти придатні для подання HR, юридичному відділу або страховому аудиту; зберігайте підписані PDF у корпоративному архіві документів",
] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Per-traveler section of the duty-of-care report */
export interface DutyOfCareTravelerRecord {
  userId: string;
  /** List of incident descriptions or event IDs */
  incidents: string[];
  /** Composite risk score for the reporting period (0-100) */
  riskScore: number;
}

/** Full duty-of-care report for an organisation */
export interface DutyOfCareReport {
  reportId: string;
  orgId: string;
  /** ISO-8601 start of the reporting period */
  fromDate: string;
  /** ISO-8601 end of the reporting period */
  toDate: string;
  travelers: DutyOfCareTravelerRecord[];
  /** ISO-8601 timestamp when the report was generated */
  generatedAt: string;
}

/** Configuration for a duty-of-care export request */
export interface DutyOfCareExportConfig {
  orgId: string;
  fromDate: string;
  toDate: string;
  format: "pdf" | "csv";
}

// ---------------------------------------------------------------------------
// Builder
// ---------------------------------------------------------------------------

/**
 * Build a duty-of-care report for an organisation from raw event data.
 *
 * STUB — in production this should:
 *   1. Query the event store for all events matching traveler locations in [fromDate, toDate]
 *   2. Group by userId, compute per-traveler risk scores via computeCompositeRisk()
 *   3. Render the report to PDF/CSV using a templating library
 *
 * @param orgId  — the organisation ID
 * @param events — raw event-like objects expected to have userId, description, riskScore
 */
export function buildDutyOfCareReport(
  orgId: string,
  events: {
    userId?: string;
    description?: string;
    riskScore?: number;
    occurredAt?: string;
    fromDate?: string;
    toDate?: string;
  }[],
): DutyOfCareReport {
  // Group events by userId
  const byUser = new Map<string, { incidents: string[]; maxRisk: number }>();

  for (const event of events) {
    const uid = event.userId ?? "unknown";
    const existing = byUser.get(uid) ?? { incidents: [], maxRisk: 0 };
    if (event.description) existing.incidents.push(event.description);
    existing.maxRisk = Math.max(existing.maxRisk, event.riskScore ?? 0);
    byUser.set(uid, existing);
  }

  const travelers: DutyOfCareTravelerRecord[] = [...byUser.entries()].map(
    ([userId, data]) => ({
      userId,
      incidents: data.incidents,
      riskScore: Math.round(data.maxRisk),
    }),
  );

  // Infer date range from events if not provided explicitly
  const dates = events
    .map((e) => e.occurredAt ?? e.fromDate ?? e.toDate)
    .filter((d): d is string => d !== undefined)
    .sort();

  const fromDate = dates[0] ?? new Date().toISOString().slice(0, 10);
  const toDate = dates[dates.length - 1] ?? new Date().toISOString().slice(0, 10);

  return {
    reportId: `doc_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`,
    orgId,
    fromDate,
    toDate,
    travelers,
    generatedAt: new Date().toISOString(),
  };
}
