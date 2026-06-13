/**
 * Export control and sanctions screening for Aegis Lens.
 *
 * Two distinct regimes:
 *
 * 1. EXPORT CONTROL (EAR / EU Dual-Use)
 *    - US Export Administration Regulations (EAR, 15 CFR 730-774)
 *    - EU Dual-Use Regulation (2021/821)
 *    - Determines whether OSINT data / platform capabilities require export licences
 *    - OSINT aggregation is generally EAR99 (no licence required)
 *    - Targeting-grade / satellite-derived data may need ECCNs
 *
 * 2. SANCTIONS SCREENING
 *    - OFAC SDN (Specially Designated Nationals) list
 *    - EU Consolidated Sanctions List
 *    - UK OFSI Consolidated List
 *    - Screen on signup and on each billing event
 *
 * Sprint 2.73 — compliance implementation.
 *
 * ⚠️  YMYL: This module is a policy stub. Production deployment requires
 *     review by a licensed export control attorney and OFAC-accredited
 *     sanctions screening provider (e.g. Dow Jones Risk & Compliance,
 *     LexisNexis WorldCompliance, ComplyAdvantage).
 */

// ── Export control classification ─────────────────────────────────────────────

export type ExportControlRegime = "EAR" | "EU-dual-use" | "UK-export-control";

/**
 * Export Control Classification Numbers (ECCNs) relevant to Aegis Lens.
 *
 * EAR99 — subject to the EAR but not listed on the CCL (no licence required
 *          except to embargoed countries / denied parties)
 * 0A919 — "commodity" catch-all for items used in military end-uses
 * 0A521 — items related to crime control / detection (requires scrutiny)
 */
export type Eccn = "EAR99" | "0A919" | "0A521" | "5D992" | "unlisted";

export interface ExportControlClassification {
  dataType: string;
  description: string;
  eccn: Eccn;
  euDualUse: boolean;
  /** Countries / blocs that require a licence regardless of ECCN */
  licenceRequiredFor: string[];
  rationale: string;
}

export const EXPORT_CONTROL_REVIEW: ExportControlClassification[] = [
  {
    dataType: "OSINT aggregation — open-source news + social media",
    description: "Publicly available information aggregated from open sources",
    eccn: "EAR99",
    euDualUse: false,
    licenceRequiredFor: ["CU", "IR", "KP", "SY", "RU", "BY"],  // Cuba, Iran, DPRK, Syria, Russia, Belarus
    rationale:
      "Publicly available information is excluded from EAR control under 15 CFR 734.3(b)(3). " +
      "However, re-export to embargoed countries still prohibited.",
  },
  {
    dataType: "Satellite imagery analysis (consumer-grade, < 0.5m resolution)",
    description: "AI-derived analysis of commercially available satellite imagery",
    eccn: "EAR99",
    euDualUse: false,
    licenceRequiredFor: ["KP", "CU", "IR", "SY"],
    rationale:
      "Analysis of publicly licensed imagery does not trigger ECCN unless it incorporates " +
      "controlled algorithms or is combined with targeting data.",
  },
  {
    dataType: "Targeting-grade geospatial data (< 0.25m, military-application derived)",
    description: "High-resolution geospatial data suitable for weapons targeting",
    eccn: "0A919",
    euDualUse: true,
    licenceRequiredFor: ["ALL"],  // licence required for all exports
    rationale:
      "Targeting-grade data with military end-use potential is subject to enhanced EAR scrutiny. " +
      "Require legal review before enabling for any customer.",
  },
  {
    dataType: "AI / ML models trained on classified datasets",
    description: "Models that incorporate non-public government or classified training data",
    eccn: "0A521",
    euDualUse: true,
    licenceRequiredFor: ["ALL"],
    rationale:
      "Models incorporating classified training data require commodity classification review. " +
      "Do not deploy without export control attorney sign-off.",
  },
  {
    dataType: "Encryption software (in-transit / at-rest)",
    description: "TLS, AES, RSA used within the platform",
    eccn: "5D992",
    euDualUse: false,
    licenceRequiredFor: [],       // Mass-market encryption exception (740.17)
    rationale:
      "Mass-market encryption products qualify for EAR licence exception ENC (740.17). " +
      "Annual self-classification report to BIS required.",
  },
];

export function getClassification(dataType: string): ExportControlClassification | undefined {
  return EXPORT_CONTROL_REVIEW.find((c) =>
    c.dataType.toLowerCase().includes(dataType.toLowerCase()),
  );
}

// ── Sanctions screening ───────────────────────────────────────────────────────

export type SanctionsList = "OFAC-SDN" | "EU-consolidated" | "UK-OFSI" | "UN";

export type SanctionsResult = {
  screened: boolean;
  clear: boolean;
  matches: SanctionsMatch[];
  screenedAt: Date;
  listsChecked: SanctionsList[];
  /** Provider that performed the check */
  provider: string;
  /** Raw provider response reference for audit */
  providerRef: string | null;
};

export interface SanctionsMatch {
  list: SanctionsList;
  matchType: "exact" | "fuzzy" | "alias";
  matchScore: number;  // 0.0 – 1.0
  entityName: string;
  entityId: string;
  sanctionType: string;
  notes: string;
}

/**
 * Stub: performs sanctions screening on a signup attempt.
 *
 * Production: replace with ComplyAdvantage, Dow Jones, or LexisNexis API call.
 *
 * IMPORTANT: This stub always returns clear=true. It MUST be replaced before
 * accepting payments or enterprise onboarding in production.
 *
 * Trigger on:
 *   - New user signup
 *   - New org creation
 *   - Payment method addition
 *   - High-value transaction ($10k+)
 */
export async function sanctionsCheck(
  email: string,
  orgName: string,
): Promise<SanctionsResult> {
  // TODO: replace with real API call
  // Example ComplyAdvantage:
  //   POST https://api.complyadvantage.com/searches
  //   body: { search_term: orgName, fuzziness: 0.6, filters: { types: ["sanction"] } }

  void email; void orgName;

  return {
    screened: false,             // STUB: always false until real provider integrated
    clear: true,
    matches: [],
    screenedAt: new Date(),
    listsChecked: [],
    provider: "stub",
    providerRef: null,
  };
}

/**
 * Country-level embargo check.
 * Returns true if the country code is on a restricted list for the given data type.
 */
export function isEmbargoedCountry(countryCode: string, eccn: Eccn = "EAR99"): boolean {
  const FULL_EMBARGO = ["CU", "IR", "KP", "SY"];       // OFAC comprehensive embargoes
  const RUSSIA_UKRAINE_SANCTIONS = ["RU", "BY"];        // EAR/EU Russia/Belarus restrictions

  if (FULL_EMBARGO.includes(countryCode)) return true;

  // EAR99 still restricted to Russia/Belarus for technology with dual-use potential
  if (RUSSIA_UKRAINE_SANCTIONS.includes(countryCode) && eccn !== "EAR99") return true;

  return false;
}

/**
 * Triggered on signup: combines sanctions + embargo check.
 * Returns false (block) if any check fails.
 */
export async function signupComplianceCheck(opts: {
  email: string;
  orgName: string;
  countryCode: string;
}): Promise<{ allowed: boolean; reason?: string }> {
  if (isEmbargoedCountry(opts.countryCode)) {
    return { allowed: false, reason: `Signups from ${opts.countryCode} are not permitted.` };
  }

  const sanctions = await sanctionsCheck(opts.email, opts.orgName);

  if (!sanctions.clear) {
    const topMatch = sanctions.matches[0];
    return {
      allowed: false,
      reason: `Sanctions match detected: ${topMatch?.entityName ?? "unknown"} on ${topMatch?.list ?? "unknown"}. Contact compliance@aegislens.io.`,
    };
  }

  return { allowed: true };
}
