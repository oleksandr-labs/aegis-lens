/**
 * Types for @ua-map/ualosses — verified casualty tracking.
 *
 * ETHICAL FRAMING (read first):
 * This is the most ethically sensitive feed in the platform. The product NEVER
 * publishes per-person casualty records publicly. Everything user-facing is an
 * AGGREGATE statistic (counts by region / period / source). Per-person fields
 * exist in these types ONLY so the aggregate pipeline can recognise and BLOCK
 * them fail-closed (see `aggregate.ts` and `ethics-gate.ts`). They must never be
 * serialised into a public response.
 *
 * Dignity over engagement. Honor the fallen; do not exploit grief.
 */

/** BCP-47-keyed respectful text (en + uk required for user-facing strings). */
export interface LocalizedText {
  en: string;
  uk: string;
}

/** Which dataset a figure originated from. Attribution is ALWAYS required. */
export type CasualtySource = "ualosses" | "killed_in_ukraine" | "mediazona";

/** Which side a casualty figure pertains to. */
export type CasualtySide = "ua_military" | "ua_civilian" | "ru_military";

/**
 * A PUBLIC-SAFE aggregate row. This is the ONLY casualty shape the product may
 * emit publicly. It carries counts — never identities.
 */
export interface CasualtyAggregate {
  /** Stable id derived from source + side + region + period (no person data). */
  id: string;
  source: CasualtySource;
  side: CasualtySide;
  /** ISO 3166-2 region code (e.g. "UA-14") or a labelled bucket, never a person. */
  regionCode?: string;
  regionName?: LocalizedText;
  /** Reporting period, e.g. "2026-Q1" or "2026-03" or "2022-02..2026-03". */
  period: string;
  /** Verified count for this region+period+source. */
  count: number;
  /** Verification posture of the upstream dataset. */
  verification: "community_verified" | "source_verified" | "estimate";
  /** Last time the source updated this figure. */
  asOf: string; // ISO-8601
}

/**
 * A PER-PERSON record as it MAY appear in a raw upstream payload.
 *
 * !!! NEVER EMIT THIS PUBLICLY !!!
 * Present only so the aggregate pipeline can detect and refuse it. Every field
 * here is treated as forbidden personal data by `ethics-gate.ts`. The clients in
 * this package deliberately do NOT fetch these; the demo fixtures contain none.
 */
export interface ForbiddenPersonRecord {
  fullName?: string;
  callSign?: string;
  dateOfBirth?: string;
  dateOfDeath?: string;
  photoUrl?: string;
  unit?: string;
  burialPlace?: string;
  homeTown?: string;
  exactCoords?: { lat: number; lon: number };
  [k: string]: unknown;
}

/** Source attribution descriptor (license + how to credit). */
export interface SourceAttribution {
  source: CasualtySource;
  publisher: LocalizedText;
  /** Public memorial / dataset landing URL (no per-person deep links). */
  url: string;
  /** License / terms label. */
  license: string;
  /** Required credit line, per locale. */
  credit: LocalizedText;
  /** True when the dataset is community-maintained (caveat in framing). */
  community: boolean;
}

/** A take-down request from a family member or authorised party. */
export interface TakedownRequest {
  /** Opaque request id. */
  id: string;
  /** What is being requested removed/suppressed. */
  scope: "aggregate_region" | "memorial_link" | "all_references";
  /** Region/period the request concerns, when scope is aggregate_region. */
  regionCode?: string;
  period?: string;
  /** The memorial URL the request concerns, when scope is memorial_link. */
  memorialUrl?: string;
  /** Relationship attested by requester (free text, NOT published). */
  relationship: string;
  /** Contact channel for the requester (NOT published). */
  contact: string;
  /** When the request was received. */
  receivedAt: string; // ISO-8601
  /** Locale the requester wrote in. */
  locale: "uk" | "en";
}

/** A processed take-down outcome. */
export interface TakedownDecision {
  requestId: string;
  /** Always honored by default — dignity over engagement. */
  status: "accepted" | "needs_review";
  /** Suppression keys the rest of the pipeline must respect. */
  suppress: TakedownSuppression;
  acknowledgement: LocalizedText;
  decidedAt: string;
}

/** Suppression directives produced by the take-down handler. */
export interface TakedownSuppression {
  suppressedMemorialUrls: string[];
  suppressedRegionPeriods: Array<{ regionCode?: string; period?: string }>;
  suppressAllReferences: boolean;
}
