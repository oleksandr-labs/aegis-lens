/**
 * Email DNS record specifications for aegislens.com.
 *
 * Covers SPF, DKIM, DMARC, BIMI anchor, and MX for inbound replies.
 * Apply these records in your DNS provider (Cloudflare / ukraine.com.ua).
 *
 * Налаштування DNS-записів для email-доставки aegislens.com.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmailDnsRecord {
  /** DNS record type. */
  type: "TXT" | "CNAME" | "MX";
  /** Host / name (relative to the domain). Use "@" for the apex. */
  host: string;
  /** Record value. */
  value: string;
  /** Time-to-live in seconds. */
  ttl: number;
  /** Human-readable description of what this record does. */
  purpose: string;
}

// ── DMARC policy ──────────────────────────────────────────────────────────────

/**
 * DMARC_POLICY progression:
 *   1. Start with 'quarantine' (spam folder, not reject) on day 0.
 *   2. Monitor rua/ruf reports for 30 days — confirm DKIM/SPF pass rates > 98%.
 *   3. Promote to 'reject' after confidence is established.
 *
 * Never jump straight to 'reject' — you risk losing legitimate mail.
 */
export type DmarcPolicyValue = "none" | "quarantine" | "reject";

export const DMARC_POLICY: DmarcPolicyValue = "quarantine";

// ── DNS record catalogue ──────────────────────────────────────────────────────

export const REQUIRED_DNS_RECORDS: EmailDnsRecord[] = [
  // ── SPF ────────────────────────────────────────────────────────────────────
  {
    type: "TXT",
    host: "@",
    value: "v=spf1 include:spf.resend.com include:spf.postmarkapp.com ~all",
    ttl: 300,
    purpose:
      "SPF — authorises Resend and Postmark to send on behalf of aegislens.com. " +
      "~all = softfail (log but don't reject). Upgrade to -all after warm-up.",
  },

  // ── DKIM — Resend selectors ─────────────────────────────────────────────────
  {
    type: "CNAME",
    host: "resend._domainkey",
    value: "resend._domainkey.resend.com",
    ttl: 3600,
    purpose: "DKIM CNAME for Resend. Resend manages key rotation automatically.",
  },

  // ── DKIM — Postmark selectors ───────────────────────────────────────────────
  {
    type: "CNAME",
    host: "pm._domainkey",
    value: "pm._domainkey.postmarkapp.com",
    ttl: 3600,
    purpose: "DKIM CNAME for Postmark (transactional pool fallback).",
  },
  {
    type: "CNAME",
    host: "pm2._domainkey",
    value: "pm2._domainkey.postmarkapp.com",
    ttl: 3600,
    purpose: "DKIM CNAME for Postmark selector 2 (key rotation slot).",
  },

  // ── DMARC ──────────────────────────────────────────────────────────────────
  {
    type: "TXT",
    host: "_dmarc",
    value:
      "v=DMARC1; p=quarantine; " +
      "rua=mailto:dmarc@aegislens.com; " +
      "ruf=mailto:dmarc@aegislens.com; " +
      "fo=1; " +
      "pct=100; " +
      "adkim=s; " +
      "aspf=s",
    ttl: 300,
    purpose:
      "DMARC policy. p=quarantine: failing mail goes to spam. " +
      "fo=1: generate forensic reports on any failure. " +
      "adkim/aspf=s: strict DKIM + SPF alignment. " +
      "After 30 days clean, update to p=reject.",
  },

  // ── MX — inbound reply handling ────────────────────────────────────────────
  {
    type: "MX",
    host: "@",
    value: "10 inbound.postmarkapp.com",
    ttl: 300,
    purpose:
      "MX for receiving replies to aegislens.com. " +
      "Postmark inbound webhook processes bounces and auto-replies.",
  },

  // ── MX — mail subdomain ────────────────────────────────────────────────────
  {
    type: "MX",
    host: "mail",
    value: "10 inbound.postmarkapp.com",
    ttl: 300,
    purpose: "MX for mail.aegislens.com (transactional subdomain inbound).",
  },

  // ── BIMI anchor (see bimi.ts for full config) ───────────────────────────────
  {
    type: "TXT",
    host: "default._bimi",
    value:
      "v=BIMI1; " +
      "l=https://aegislens.com/brand/logo-bimi.svg; " +
      "a=https://aegislens.com/brand/vmc.pem",
    ttl: 3600,
    purpose:
      "BIMI record — displays brand logo in supporting inboxes (Apple Mail, Gmail with VMC). " +
      "Requires DMARC p=quarantine or p=reject.",
  },
];

// ── Validation helper ─────────────────────────────────────────────────────────

export interface DnsCheckResult {
  record: EmailDnsRecord;
  /** Actual DNS lookup is environment-specific; status starts as 'unknown'. */
  status: "unknown" | "valid" | "invalid" | "missing";
}

/**
 * Returns a checklist of all DNS records with their current (unknown) status.
 * Wire up actual DNS resolution in a cron or admin health-check endpoint.
 *
 * Повертає список усіх DNS-записів зі статусом 'unknown' — для перевірки в адмін-панелі.
 */
export function validateDnsSetup(): DnsCheckResult[] {
  return REQUIRED_DNS_RECORDS.map((record) => ({
    record,
    status: "unknown" as const,
  }));
}

/**
 * Returns only the TXT records subset (for quick SPF/DMARC review).
 */
export function getTxtRecords(): EmailDnsRecord[] {
  return REQUIRED_DNS_RECORDS.filter((r) => r.type === "TXT");
}
