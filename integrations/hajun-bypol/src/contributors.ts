/**
 * Vetted-contributor registry + trust scoring for the Belarusian-opposition
 * OSINT community feeding Hajun / BYPOL.
 *
 * ───────────────────────────────────────────────────────────────────────────
 *  SOURCE PROTECTION IS THE WHOLE POINT OF THIS MODULE.
 * ───────────────────────────────────────────────────────────────────────────
 * Belarusian contributors report under an authoritarian regime; deanonymisation
 * can mean imprisonment. Therefore this registry, BY DESIGN:
 *
 *   - stores ONLY an opaque pseudonymous id (a salted hash handle) + aggregate
 *     trust metadata. It has NO field for real name, phone, email, device id,
 *     home/precise location, or any raw identifier;
 *   - exposes a `PublicContributorView` that the API/UI may surface, which
 *     carries the pseudonym + a coarse trust BAND only (never the raw score,
 *     never report-by-report geography);
 *   - provides `assertNoPii()` as a guard so callers can fail-closed if anyone
 *     ever tries to attach identifying data.
 *
 * Trust score is an evidence-based reliability signal (track record of reports
 * later corroborated by SAR / second sources), NOT an identity dossier.
 */

import type { HajunOrg } from "./types";

// ── Trust model ───────────────────────────────────────────────────────────────

export type TrustBand = "provisional" | "trusted" | "core";

export const TRUST_BANDS: Record<
  TrustBand,
  { min: number; labelEn: string; labelUk: string; labelBe: string }
> = {
  provisional: { min: 0.0, labelEn: "Provisional", labelUk: "Попередній",   labelBe: "Папярэдні" },
  trusted:     { min: 0.55, labelEn: "Trusted",     labelUk: "Надійний",     labelBe: "Надзейны" },
  core:        { min: 0.8, labelEn: "Core",         labelUk: "Основний",     labelBe: "Асноўны" },
};

export function trustBand(score: number): TrustBand {
  if (score >= TRUST_BANDS.core.min) return "core";
  if (score >= TRUST_BANDS.trusted.min) return "trusted";
  return "provisional";
}

/**
 * Internal registry record. Deliberately contains NO personally identifying
 * information — only an opaque pseudonym + reliability statistics.
 */
export interface ContributorRecord {
  /**
   * Opaque, non-reversible pseudonym (e.g. a salted hash of an internal handle).
   * This is the ONLY identifier we keep. It cannot be mapped back to a person.
   */
  pseudonym: string;
  /** Which initiative(s) vetted this contributor. */
  vettedBy: HajunOrg[];
  /** UTC date the contributor was admitted to the vetted pool. */
  admittedAt: string;
  // ── Reliability statistics (drive the trust score) ──────────────────────────
  /** Total public reports attributed to this pseudonym. */
  reportsTotal: number;
  /** Reports later corroborated by an independent source (SAR / 2nd reporter). */
  reportsCorroborated: number;
  /** Reports shown to be false/retracted. */
  reportsRetracted: number;
  /** Whether a manual reviewer has flagged the record for re-vetting. */
  flaggedForReview: boolean;
}

/**
 * The ONLY shape that may leave this module toward the API/UI. Carries the
 * pseudonym + a coarse trust band — never the raw score, never PII.
 */
export interface PublicContributorView {
  pseudonym: string;
  trustBand: TrustBand;
  trustLabel: { en: string; uk: string; be: string };
  reportsTotal: number;
}

// ── Trust scoring ─────────────────────────────────────────────────────────────

/**
 * Evidence-based trust score 0–1. Corroboration raises it, retractions sink it,
 * volume gives a mild confidence boost (Wilson-style shrinkage toward 0.5 for
 * thin track records so a single lucky report can't reach "core").
 */
export function computeTrustScore(r: ContributorRecord): number {
  if (r.flaggedForReview) return 0;
  const n = r.reportsTotal;
  if (n === 0) return 0;
  const corroborationRate = r.reportsCorroborated / n;
  const retractionPenalty = (r.reportsRetracted / n) * 0.6;
  // Shrink toward 0.5 when the sample is small.
  const shrink = n / (n + 8);
  const base = 0.5 + (corroborationRate - 0.5) * shrink;
  return clamp01(base - retractionPenalty);
}

/** Convenience: score + band in one call. */
export function rateContributor(r: ContributorRecord): { score: number; band: TrustBand } {
  const score = computeTrustScore(r);
  return { score, band: trustBand(score) };
}

/** Project an internal record to the privacy-safe public view. */
export function toPublicView(r: ContributorRecord): PublicContributorView {
  const band = trustBand(computeTrustScore(r));
  const meta = TRUST_BANDS[band];
  return {
    pseudonym: r.pseudonym,
    trustBand: band,
    trustLabel: { en: meta.labelEn, uk: meta.labelUk, be: meta.labelBe },
    reportsTotal: r.reportsTotal,
  };
}

// ── PII guard (fail-closed) ───────────────────────────────────────────────────

const PII_KEYS = [
  "name", "fullname", "realname", "firstname", "lastname",
  "phone", "tel", "email", "mail", "passport", "address", "home",
  "lat", "lon", "latitude", "longitude", "geo", "ip", "device", "imei", "deviceid",
];

/**
 * Throws if an object carries anything resembling identifying data. Use before
 * persisting/emitting a contributor record so deanonymising fields can NEVER
 * silently slip into the store or the API.
 */
export function assertNoPii(obj: Record<string, unknown>): void {
  for (const key of Object.keys(obj)) {
    if (PII_KEYS.includes(key.toLowerCase())) {
      throw new Error(
        `Contributor record rejected: field "${key}" could deanonymise a vetted source. ` +
          `This registry stores pseudonyms + trust metadata only.`,
      );
    }
  }
}

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * In-memory vetted-contributor registry. A production deployment would back
 * this with an access-controlled store; the contract here is the privacy-safe
 * surface area. Records are keyed by opaque pseudonym.
 */
export class ContributorRegistry {
  private records = new Map<string, ContributorRecord>();

  /** Admit / upsert a vetted contributor. PII is rejected fail-closed. */
  upsert(record: ContributorRecord): void {
    assertNoPii(record as unknown as Record<string, unknown>);
    this.records.set(record.pseudonym, record);
  }

  /** Internal lookup (reliability stats) by pseudonym. */
  get(pseudonym: string): ContributorRecord | undefined {
    return this.records.get(pseudonym);
  }

  /** Trust score for a pseudonym (0 if unknown). */
  trustOf(pseudonym: string): number {
    const r = this.records.get(pseudonym);
    return r ? computeTrustScore(r) : 0;
  }

  /** Privacy-safe public views (pseudonym + band only). */
  publicRoster(): PublicContributorView[] {
    return [...this.records.values()].map(toPublicView);
  }

  size(): number {
    return this.records.size;
  }
}

// ── DEMO roster (synthetic pseudonyms only — NO real contributor data) ─────────

export const DEMO_CONTRIBUTORS: ContributorRecord[] = [
  {
    pseudonym: "by-rail-watcher-7f3a",
    vettedBy: ["hajun"],
    admittedAt: "2025-09-01T00:00:00Z",
    reportsTotal: 142,
    reportsCorroborated: 121,
    reportsRetracted: 2,
    flaggedForReview: false,
  },
  {
    pseudonym: "brest-node-2c9d",
    vettedBy: ["hajun", "bypol"],
    admittedAt: "2025-06-15T00:00:00Z",
    reportsTotal: 58,
    reportsCorroborated: 51,
    reportsRetracted: 0,
    flaggedForReview: false,
  },
  {
    pseudonym: "new-observer-a14e",
    vettedBy: ["community"],
    admittedAt: "2026-05-20T00:00:00Z",
    reportsTotal: 5,
    reportsCorroborated: 3,
    reportsRetracted: 0,
    flaggedForReview: false,
  },
];

/** Build a demo registry pre-loaded with the synthetic roster. */
export function demoRegistry(): ContributorRegistry {
  const reg = new ContributorRegistry();
  for (const c of DEMO_CONTRIBUTORS) reg.upsert(c);
  return reg;
}

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, Math.round(n * 100) / 100));
}
