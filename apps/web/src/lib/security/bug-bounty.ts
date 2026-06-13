/**
 * Bug bounty program definition for Aegis Lens.
 *
 * Platform: HackerOne (https://hackerone.com/aegis-lens)
 * Status: Private → Public invite program → Full public (milestone-gated)
 *
 * This file is the single source of truth for:
 *   - In-scope assets
 *   - Out-of-scope rules
 *   - Severity → reward mapping
 *   - Disclosure policy
 *   - Safe Harbor statement
 *
 * Sprint 2.73 — auth security implementation.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type BountyScope = "in_scope" | "out_of_scope";
export type VulnSeverity = "critical" | "high" | "medium" | "low" | "informational";
export type BountyProgramStatus = "private" | "invite_only" | "public";

export interface BountyTarget {
  type: "web" | "api" | "android" | "ios" | "other";
  identifier: string;
  description: string;
  scope: BountyScope;
}

export interface BountyReward {
  severity: VulnSeverity;
  minUsd: number;
  maxUsd: number;
  /** Typical example CVSSv3 score range */
  cvssRange: [number, number];
}

export interface DisclosurePolicy {
  /** Days the program has to respond to the initial report */
  initialResponseDays: number;
  /** Days to triage and confirm the vulnerability */
  triageDays: number;
  /** Days to ship a patch before coordinated disclosure */
  remediationDays: number;
  /** Days after patch ship that researcher may publicly disclose */
  publicDisclosureAfterPatchDays: number;
  /** Whether Hall of Fame credit is offered */
  hallOfFame: boolean;
}

export interface BugBountyProgram {
  name: string;
  platform: "hackerone" | "bugcrowd" | "intigriti" | "self-hosted";
  programUrl: string;
  status: BountyProgramStatus;
  targets: BountyTarget[];
  rewards: BountyReward[];
  disclosurePolicy: DisclosurePolicy;
  outOfScopeVulnTypes: string[];
  eligibilityRules: string[];
}

// ── Program definition ────────────────────────────────────────────────────────

export const BUG_BOUNTY_PROGRAM: BugBountyProgram = {
  name: "Aegis Lens Bug Bounty",
  platform: "hackerone",
  programUrl: "https://hackerone.com/aegis-lens",
  status: "private",           // escalate to "invite_only" after SOC 2 Type I

  targets: [
    {
      type: "web",
      identifier: "https://aegislens.io",
      description: "Main web application (all authenticated + unauthenticated surfaces)",
      scope: "in_scope",
    },
    {
      type: "api",
      identifier: "https://aegislens.io/api/v1/*",
      description: "Public REST API v1",
      scope: "in_scope",
    },
    {
      type: "api",
      identifier: "https://aegislens.io/api/v1/admin/*",
      description: "Admin API (requires valid admin session)",
      scope: "in_scope",
    },
    {
      type: "web",
      identifier: "https://auth.aegislens.io",
      description: "Authentication service (WorkOS-backed)",
      scope: "in_scope",
    },
    {
      type: "other",
      identifier: "*.aegislens.io (subdomains)",
      description: "All subdomains — report subdomain takeover candidates",
      scope: "in_scope",
    },
    // Out of scope
    {
      type: "other",
      identifier: "Third-party services (WorkOS, Stripe, Mapbox, etc.)",
      description: "Report directly to the vendor — not in Aegis Lens scope",
      scope: "out_of_scope",
    },
    {
      type: "web",
      identifier: "Status page (status.aegislens.io)",
      description: "Read-only status page",
      scope: "out_of_scope",
    },
  ],

  rewards: [
    {
      severity: "critical",
      minUsd: 2_500,
      maxUsd: 10_000,
      cvssRange: [9.0, 10.0],
    },
    {
      severity: "high",
      minUsd: 1_000,
      maxUsd: 2_500,
      cvssRange: [7.0, 8.9],
    },
    {
      severity: "medium",
      minUsd: 250,
      maxUsd: 1_000,
      cvssRange: [4.0, 6.9],
    },
    {
      severity: "low",
      minUsd: 50,
      maxUsd: 250,
      cvssRange: [0.1, 3.9],
    },
    {
      severity: "informational",
      minUsd: 0,
      maxUsd: 50,               // discretionary; typically swag / recognition only
      cvssRange: [0, 0],
    },
  ],

  disclosurePolicy: {
    initialResponseDays: 2,
    triageDays: 7,
    remediationDays: 90,
    publicDisclosureAfterPatchDays: 30,
    hallOfFame: true,
  },

  outOfScopeVulnTypes: [
    "Self-XSS (requires attacker to run their own code in their own browser)",
    "Missing HTTP security headers on non-sensitive endpoints",
    "Clickjacking on pages without sensitive actions",
    "CSRF on logout",
    "Rate limiting on non-sensitive endpoints",
    "Automated scanner output without proof of exploitability",
    "Social engineering attacks",
    "Physical attacks",
    "Denial of service (DoS / DDoS)",
    "Content injection / text injection without security impact",
    "Missing SPF / DMARC / DKIM on non-primary domains",
    "Theoretical vulnerabilities without a working proof of concept",
  ],

  eligibilityRules: [
    "Do not access, modify, or delete data belonging to other users",
    "Do not perform DoS or DDoS attacks",
    "Do not use automated scanners against production without prior approval",
    "Test only against your own accounts or a provided sandbox environment",
    "Report must include a clear, reproducible proof of concept",
    "Do not disclose the vulnerability publicly until we have patched and given clearance",
    "Only the first reporter of a unique vulnerability is eligible for a reward",
  ],
};

// ── Safe Harbor ───────────────────────────────────────────────────────────────

export const SAFE_HARBOR_STATEMENT = `
Aegis Lens Security Safe Harbor

We consider security research conducted in accordance with this program's
guidelines to be:

  1. Authorized in accordance with the Computer Fraud and Abuse Act (CFAA).
  2. Exempt from the Digital Millennium Copyright Act (DMCA) for purposes of
     research under this program.
  3. Not in violation of any Aegis Lens Terms of Service that would otherwise
     prohibit security testing, for the limited purpose and scope of this program.

We will not pursue civil or criminal action against researchers who:
  — Follow this program's eligibility rules
  — Report vulnerabilities in good faith and in a timely manner
  — Do not exploit a vulnerability beyond a minimal proof of concept
  — Do not access or exfiltrate data beyond what is necessary to confirm the vulnerability
  — Do not publicly disclose before our remediation window has expired

We ask that you:
  — Give us reasonable time to fix the issue before any public disclosure
  — Act in good faith to avoid privacy violations and disruption to production

This Safe Harbor is not intended to authorize unauthorized access to systems
not listed in scope.

Contact: security@aegislens.io
PGP key: https://aegislens.io/.well-known/security.txt
`.trim();

// ── Security.txt content ──────────────────────────────────────────────────────

/**
 * Contents for /.well-known/security.txt
 * Serve via: apps/web/public/.well-known/security.txt
 *
 * @see https://securitytxt.org/
 */
export const SECURITY_TXT = `
Contact: mailto:security@aegislens.io
Contact: https://hackerone.com/aegis-lens
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)}
Encryption: https://aegislens.io/.well-known/pgp-key.txt
Preferred-Languages: en, uk
Policy: https://aegislens.io/security/bug-bounty
Hiring: https://aegislens.io/careers
`.trim();

// ── Helper ────────────────────────────────────────────────────────────────────

export function getRewardRange(severity: VulnSeverity): BountyReward | undefined {
  return BUG_BOUNTY_PROGRAM.rewards.find((r) => r.severity === severity);
}
