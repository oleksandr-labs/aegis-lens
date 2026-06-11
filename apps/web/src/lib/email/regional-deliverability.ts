/**
 * Per-region email deliverability tracking.
 *
 * Different regions have different dominant ISPs, spam filter vendors,
 * and inbox behaviour. Track stats per region to catch regional
 * deliverability degradation before it affects global metrics.
 *
 * Regions and their dominant ISPs:
 *   eu  — Gmail, Outlook, ProtonMail, GMX, Web.de
 *   us  — Gmail, Outlook, Yahoo Mail, Comcast, AOL
 *   ua  — ukr.net, meta.ua, i.ua, Gmail, Outlook
 *   uk  — Gmail, Outlook, Sky, BT Internet
 *   other — everything else
 *
 * Відстеження доставки email за регіонами: різні ISP, різні фільтри,
 * різна поведінка папки "Вхідні".
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type Region = "eu" | "us" | "ua" | "uk" | "other";

export interface RegionalDeliverabilityStats {
  region: Region;
  /** Fraction of sent emails that were accepted by the receiving server (0–1). */
  deliveryRate: number;
  /** Fraction of delivered emails that were opened (0–1). */
  openRate: number;
  /** Fraction of sent emails that bounced (0–1). */
  bounceRate: number;
  /** Fraction of sent emails reported as spam (0–1). */
  spamRate: number;
  /** Top ISPs in this region (for breakdown charts). */
  topIsps: string[];
  /** ISO date range for this snapshot, e.g. "2026-06-01/2026-06-30". */
  period: string;
}

export interface EmailEvent {
  /** Recipient email address. */
  email: string;
  /** 2-letter ISO 3166-1 alpha-2 country code, e.g. "UA", "GB", "US". */
  countryCode: string;
  /** Receiving domain (e.g. "gmail.com", "ukr.net"). */
  domain: string;
  /** Event type. */
  type: "sent" | "delivered" | "opened" | "clicked" | "bounced" | "complained";
  /** ISO timestamp. */
  timestamp: string;
}

// ── Country → Region mapping ──────────────────────────────────────────────────

/** EU member states + EEA for the purposes of regional classification. */
const EU_COUNTRIES = new Set([
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "ES", "FI",
  "FR", "GR", "HR", "HU", "IE", "IT", "LT", "LU", "LV", "MT",
  "NL", "PL", "PT", "RO", "SE", "SI", "SK",
  // EEA
  "NO", "IS", "LI",
  // Adjacent / commonly grouped
  "CH", "AL", "BA", "ME", "MK", "RS", "MD", "GE", "AM", "AZ",
]);

/**
 * Maps a 2-letter country code to a Region.
 *
 * @param countryCode - ISO 3166-1 alpha-2 (e.g. "UA", "US", "GB").
 * @returns The region for this country.
 *
 * Визначає регіон за кодом країни.
 */
export function mapCountryToRegion(countryCode: string): Region {
  const code = countryCode.toUpperCase();
  if (code === "UA") return "ua";
  if (code === "GB") return "uk";
  if (code === "US" || code === "CA" || code === "MX") return "us";
  if (EU_COUNTRIES.has(code)) return "eu";
  return "other";
}

// ── Stats computation ─────────────────────────────────────────────────────────

/**
 * Computes deliverability statistics for a given region from a list of events.
 *
 * @param events - All email events (may span multiple regions).
 * @param region - The region to filter and aggregate.
 * @returns RegionalDeliverabilityStats for the given region.
 *
 * Обчислює статистику доставки для вказаного регіону.
 */
export function computeRegionalStats(
  events: EmailEvent[],
  region: Region,
): RegionalDeliverabilityStats {
  const regionEvents = events.filter(
    (e) => mapCountryToRegion(e.countryCode) === region,
  );

  const count = (type: EmailEvent["type"]) =>
    regionEvents.filter((e) => e.type === type).length;

  const sent = count("sent") || 1; // avoid division by zero
  const delivered = count("delivered");
  const opened = count("opened");
  const bounced = count("bounced");
  const complained = count("complained");

  // Compute top ISPs by receive domain
  const ispFreq = new Map<string, number>();
  for (const e of regionEvents) {
    if (e.domain) {
      ispFreq.set(e.domain, (ispFreq.get(e.domain) ?? 0) + 1);
    }
  }
  const topIsps = Array.from(ispFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([domain]) => domain);

  // Determine period from first/last event timestamps
  const timestamps = regionEvents.map((e) => e.timestamp).sort();
  const period =
    timestamps.length >= 2
      ? `${timestamps[0].slice(0, 10)}/${timestamps[timestamps.length - 1].slice(0, 10)}`
      : new Date().toISOString().slice(0, 10);

  return {
    region,
    deliveryRate: delivered / sent,
    openRate: delivered > 0 ? opened / delivered : 0,
    bounceRate: bounced / sent,
    spamRate: complained / sent,
    topIsps,
    period,
  };
}

// ── Recommendations ───────────────────────────────────────────────────────────

/**
 * Returns region-specific deliverability recommendations.
 *
 * @param stats - Current regional stats.
 * @returns Array of actionable recommendations.
 *
 * Повертає рекомендації щодо покращення доставки для конкретного регіону.
 */
export function getRegionalRecommendations(
  stats: RegionalDeliverabilityStats,
): string[] {
  const recs: string[] = [];
  const { region, bounceRate, spamRate, openRate, deliveryRate } = stats;

  if (bounceRate > 0.05) {
    recs.push(
      `${region.toUpperCase()}: Bounce rate ${(bounceRate * 100).toFixed(1)}% is high. ` +
        "Run list hygiene — remove addresses not seen in > 6 months.",
    );
  }

  if (spamRate > 0.001) {
    recs.push(
      `${region.toUpperCase()}: Spam rate ${(spamRate * 100).toFixed(3)}% exceeds 0.1% threshold. ` +
        "Pause marketing sends to this region and review opt-in quality.",
    );
  }

  if (deliveryRate < 0.95) {
    recs.push(
      `${region.toUpperCase()}: Delivery rate ${(deliveryRate * 100).toFixed(1)}% is below 95%. ` +
        "Check for regional IP blocks or MX misconfiguration.",
    );
  }

  if (openRate < 0.1) {
    recs.push(
      `${region.toUpperCase()}: Open rate ${(openRate * 100).toFixed(1)}% is low. ` +
        "Consider localising subject lines and send-time optimisation for this region.",
    );
  }

  // Region-specific guidance
  if (region === "ua") {
    recs.push(
      "UA: ukr.net and meta.ua use their own spam filters. " +
        "Register aegislens.com at https://www.ukr.net/senderid/ for better inbox rates. " +
        "Consider ukr.net SMTP relay for bulk UA-addressed mail.",
    );
  }

  if (region === "uk") {
    recs.push(
      "UK: Ensure GDPR / UK GDPR consent is in place for all UK recipients. " +
        "BT Internet and Sky use conservative spam filters — test with seed accounts.",
    );
  }

  if (region === "eu") {
    recs.push(
      "EU: GMX / Web.de (Germany) require senderid registration at " +
        "https://postmaster.gmx.net for best inbox rates.",
    );
  }

  if (region === "us") {
    recs.push(
      "US: Yahoo / AOL require FBL (feedback loop) registration at " +
        "https://senders.yahooinc.com for complaint visibility.",
    );
  }

  return recs;
}
