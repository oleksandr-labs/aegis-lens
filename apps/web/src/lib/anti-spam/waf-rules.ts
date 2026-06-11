/**
 * Typed specification for Cloudflare WAF configuration.
 *
 * This module exports constants and interfaces that describe the desired
 * WAF posture — it is NOT a runtime config file and makes no HTTP calls.
 * The actual Cloudflare ruleset is managed via Terraform / the CF dashboard;
 * this file serves as the source of truth for code-review and documentation.
 */

// ── Interfaces ────────────────────────────────────────────────────────────────

/** A single Cloudflare custom firewall rule. */
export interface WafRule {
  /** Human-readable name shown in the CF dashboard. */
  name: string;
  /**
   * Cloudflare Firewall Rules expression language.
   * https://developers.cloudflare.com/ruleset-engine/rules-language/
   */
  expression: string;
  /** What CF does when the expression matches. */
  action: "block" | "managed_challenge" | "js_challenge" | "log";
}

/** Top-level Cloudflare WAF configuration spec for Aegis Lens. */
export interface CloudflareWafRules {
  /** Managed rule-set IDs to enable (Cloudflare-maintained). */
  managedRuleSets: string[];
  /** Custom rules authored for this project. */
  customRules: WafRule[];
  /** Whether Cloudflare Bot Fight Mode is enabled. */
  botFightMode: boolean;
  /** Whether Cloudflare Turnstile is wired to the origin. */
  turnstileEnabled: boolean;
}

// ── Custom rules ──────────────────────────────────────────────────────────────

const CUSTOM_RULES: WafRule[] = [
  {
    name: "Block empty UA on API",
    expression: `(http.request.uri.path matches "^/api/" and http.user_agent eq "")`,
    action: "block",
  },
  {
    name: "Challenge known bad ASNs on write endpoints",
    expression: `(ip.geoip.asnum in {174 14061 16276 24940 63949 20473} and http.request.method in {"POST" "PUT" "PATCH" "DELETE"})`,
    action: "managed_challenge",
  },
  {
    name: "Rate-limit signup endpoint",
    expression: `(http.request.uri.path eq "/api/auth/register")`,
    action: "managed_challenge",
  },
  {
    name: "Rate-limit review submission",
    expression: `(http.request.uri.path matches "^/api/reviews")`,
    action: "managed_challenge",
  },
  {
    name: "Block common vuln scanners",
    expression: `(http.user_agent contains "sqlmap" or http.user_agent contains "Nikto" or http.user_agent contains "Nessus" or http.user_agent contains "zgrab")`,
    action: "block",
  },
  {
    name: "Block path traversal attempts",
    expression: `(http.request.uri.path contains "../" or http.request.uri.path contains "..\\")`,
    action: "block",
  },
  {
    name: "Challenge Tor exit nodes on auth",
    expression: `(cf.tls_client_auth.cert_verified eq false and ip.src in $cf.anonymizer_proxies and http.request.uri.path matches "^/api/auth/")`,
    action: "managed_challenge",
  },
  {
    name: "JS challenge on headless-browser signals",
    expression: `(cf.bot_management.score lt 10)`,
    action: "js_challenge",
  },
  {
    name: "Log high-volume bulk exports",
    expression: `(http.request.uri.path matches "^/api/export" and http.request.method eq "GET")`,
    action: "log",
  },
  {
    name: "Block XML/XXE injection attempts",
    expression: `(http.request.headers["content-type"] contains "text/xml" and http.request.uri.path matches "^/api/")`,
    action: "block",
  },
];

// ── Baseline config spec ──────────────────────────────────────────────────────

/**
 * Baseline Cloudflare WAF configuration for the Aegis Lens platform.
 *
 * Managed rule-set IDs:
 *  - efb7b8c949ac4650a09736fc376e9aee  Cloudflare Managed Ruleset
 *  - c2e184081120413c86c3ab7e14069605  Cloudflare OWASP Core Ruleset
 */
export const WAF_CONFIG_SPEC: CloudflareWafRules = {
  managedRuleSets: [
    "efb7b8c949ac4650a09736fc376e9aee", // Cloudflare Managed Ruleset
    "c2e184081120413c86c3ab7e14069605", // Cloudflare OWASP Core Ruleset
  ],
  customRules: CUSTOM_RULES,
  botFightMode: true,
  turnstileEnabled: true,
};

// ── Turnstile-protected actions ───────────────────────────────────────────────

/**
 * Form action names that must include a valid Cloudflare Turnstile token.
 * Pass one of these strings as the `action` parameter when rendering
 * the Turnstile widget so tokens are scoped to the correct form.
 */
export const TURNSTILE_ACTIONS = [
  "register",
  "login",
  "submit-review",
  "submit-report",
  "contact-form",
  "export-request",
  "password-reset",
  "claim-venue",
] as const;

export type TurnstileAction = (typeof TURNSTILE_ACTIONS)[number];
