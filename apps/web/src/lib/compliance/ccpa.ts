/**
 * CCPA / US State Privacy compliance module for Aegis Lens.
 *
 * Covered laws:
 *   - California Consumer Privacy Act (CCPA) + CPRA amendments (effective 2023)
 *   - Virginia CDPA (effective 2023)
 *   - Colorado CPA (effective 2023)
 *   - Connecticut CTDPA (effective 2023)
 *   - Texas TDPSA (effective 2024)
 *   - Montana MCDPA (effective 2024)
 *   - Others added as they come into effect
 *
 * Applicability threshold (CCPA):
 *   - Annual gross revenue > $25 million; OR
 *   - Buys/sells/shares personal info of 100,000+ consumers/households; OR
 *   - Derives 50%+ revenue from selling personal information
 *
 * Sprint 2.73 — compliance implementation.
 */

// ── Rights ────────────────────────────────────────────────────────────────────

export type CcpaRightType =
  | "do_not_sell"           // opt out of sale of personal info
  | "do_not_share"          // opt out of sharing for cross-context behavioral advertising
  | "delete"                // deletion of personal info
  | "correct"               // correction of inaccurate personal info
  | "know_categories"       // know what categories of PI are collected
  | "know_specific"         // know specific pieces of PI collected
  | "portability"           // receive PI in portable format
  | "limit_sensitive_use"   // limit use/disclosure of sensitive PI (CPRA)
  | "non_discrimination";   // not be discriminated against for exercising rights

export interface CcpaRights {
  rightType: CcpaRightType;
  description: string;
  responseDeadlineDays: number;
  /** Whether Aegis Lens currently sells/shares this category (determines relevance) */
  applicable: boolean;
}

export const CCPA_RIGHTS_CATALOG: CcpaRights[] = [
  {
    rightType: "do_not_sell",
    description: "Opt out of the sale of your personal information to third parties.",
    responseDeadlineDays: 15,
    applicable: false,         // Aegis Lens does not sell personal data
  },
  {
    rightType: "do_not_share",
    description: "Opt out of sharing personal information for cross-context behavioral advertising.",
    responseDeadlineDays: 15,
    applicable: false,         // No behavioral ad sharing
  },
  {
    rightType: "delete",
    description: "Request deletion of your personal information.",
    responseDeadlineDays: 45,
    applicable: true,
  },
  {
    rightType: "correct",
    description: "Request correction of inaccurate personal information.",
    responseDeadlineDays: 45,
    applicable: true,
  },
  {
    rightType: "know_categories",
    description: "Know the categories of personal information collected about you.",
    responseDeadlineDays: 45,
    applicable: true,
  },
  {
    rightType: "know_specific",
    description: "Know the specific pieces of personal information collected about you.",
    responseDeadlineDays: 45,
    applicable: true,
  },
  {
    rightType: "portability",
    description: "Receive your personal information in a portable, machine-readable format.",
    responseDeadlineDays: 45,
    applicable: true,
  },
  {
    rightType: "limit_sensitive_use",
    description: "Limit use and disclosure of sensitive personal information.",
    responseDeadlineDays: 15,
    applicable: true,
  },
  {
    rightType: "non_discrimination",
    description: "Not be discriminated against for exercising CCPA rights.",
    responseDeadlineDays: 0,   // Continuous obligation — not a request type
    applicable: true,
  },
];

// ── State applicability ───────────────────────────────────────────────────────

export type UsState = string; // ISO 3166-2 US state code, e.g. "US-CA"

export interface StatePrivacyLaw {
  state: UsState;
  stateName: string;
  lawName: string;
  effectiveDate: string;
  /** Whether a business must honour rights from consumers in this state */
  applicableToAegisLens: boolean;
  extraRights: CcpaRightType[];
  notes: string;
}

export const US_STATE_PRIVACY_LAWS: StatePrivacyLaw[] = [
  {
    state: "US-CA",
    stateName: "California",
    lawName: "CCPA/CPRA",
    effectiveDate: "2020-01-01",
    applicableToAegisLens: true,
    extraRights: ["limit_sensitive_use"],
    notes: "CPRA amendments effective 2023-01-01. GPC signal must be honoured.",
  },
  {
    state: "US-VA",
    stateName: "Virginia",
    lawName: "CDPA",
    effectiveDate: "2023-01-01",
    applicableToAegisLens: true,
    extraRights: [],
    notes: "No private right of action; AG enforcement only.",
  },
  {
    state: "US-CO",
    stateName: "Colorado",
    lawName: "CPA",
    effectiveDate: "2023-07-01",
    applicableToAegisLens: true,
    extraRights: [],
    notes: "Universal opt-out mechanism (GPC) required from 2024-07-01.",
  },
  {
    state: "US-CT",
    stateName: "Connecticut",
    lawName: "CTDPA",
    effectiveDate: "2023-07-01",
    applicableToAegisLens: true,
    extraRights: [],
    notes: "Closely mirrors Virginia CDPA.",
  },
  {
    state: "US-TX",
    stateName: "Texas",
    lawName: "TDPSA",
    effectiveDate: "2024-07-01",
    applicableToAegisLens: true,
    extraRights: [],
    notes: "Broad applicability threshold — applies to most commercial entities.",
  },
  {
    state: "US-MT",
    stateName: "Montana",
    lawName: "MCDPA",
    effectiveDate: "2024-10-01",
    applicableToAegisLens: true,
    extraRights: [],
    notes: "",
  },
];

/**
 * Returns applicable state laws for a given consumer's state code.
 */
export function getApplicableLaws(stateCode: UsState): StatePrivacyLaw[] {
  return US_STATE_PRIVACY_LAWS.filter(
    (law) => law.state === stateCode && law.applicableToAegisLens,
  );
}

/**
 * Returns the longest response deadline across applicable laws for the given right.
 * Use this to set SLAs for DSAR handling.
 */
export function getResponseDeadline(rightType: CcpaRightType, stateCode?: UsState): number {
  const right = CCPA_RIGHTS_CATALOG.find((r) => r.rightType === rightType);
  if (!right) return 45;

  // CA requires 45-day initial + 45-day extension; other states vary
  // For simplicity: use CCPA's 45 days as the baseline
  void stateCode;
  return right.responseDeadlineDays || 45;
}

// ── Request handler interface ─────────────────────────────────────────────────

export interface CcpaRequest {
  id: string;
  requestType: CcpaRightType;
  consumerEmail: string;
  consumerState: UsState;
  submittedAt: Date;
  verifiedAt: Date | null;
  completedAt: Date | null;
  status: "pending" | "verifying" | "processing" | "completed" | "denied" | "expired";
  denialReason?: string;
  /** Internal note (not shared with consumer) */
  staffNote?: string;
}

export interface CcpaRequestHandler {
  /**
   * Receive a new CCPA request from the consumer-facing form or API.
   */
  receive(request: Omit<CcpaRequest, "id" | "status" | "verifiedAt" | "completedAt">): Promise<CcpaRequest>;

  /**
   * Verify the identity of the requester (email verification + optional ID check).
   */
  verifyIdentity(requestId: string, verificationCode: string): Promise<boolean>;

  /**
   * Process the verified request (collect data, execute deletion, etc.).
   */
  process(requestId: string): Promise<void>;

  /**
   * Return the current status of a request.
   */
  getStatus(requestId: string): Promise<CcpaRequest | null>;
}

/**
 * Global Privacy Control (GPC) signal detection.
 * If the Sec-GPC header is "1", treat as a do-not-sell/share signal.
 *
 * @see https://globalprivacycontrol.org/
 */
export function detectGpcSignal(headers: Headers): boolean {
  return headers.get("sec-gpc") === "1";
}
