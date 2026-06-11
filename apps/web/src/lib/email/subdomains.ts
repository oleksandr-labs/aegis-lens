/**
 * Per-traffic-type email subdomain configuration.
 *
 * Subdomain isolation prevents reputation cross-contamination:
 *   - A marketing campaign bounce storm won't affect transactional delivery.
 *   - Alerts always land because they share no IP pool with bulk mail.
 *
 * DNS subdomains required (add A/MX/SPF per subdomain as needed):
 *   mail.aegislens.com     — transactional (receipts, password resets, alerts)
 *   news.aegislens.com     — marketing (campaigns, newsletters, digests)
 *   alerts.aegislens.com   — critical system alerts (air raid, status page)
 *   no-reply.aegislens.com — automated system messages (cron reports)
 *
 * Ізоляція субдоменів: кожен тип трафіку — окремий субдомен і пул IP.
 */

// ── Enum ──────────────────────────────────────────────────────────────────────

export enum EmailSubdomain {
  TRANSACTIONAL = "mail",
  MARKETING = "news",
  ALERTS = "alerts",
  SYSTEM = "no-reply",
}

// ── Subdomain config ──────────────────────────────────────────────────────────

export interface SubdomainConfig {
  /** The from-address for this subdomain. */
  from: string;
  /** Default reply-to address. */
  replyTo: string;
  /** Human-readable description of what this subdomain handles. */
  purpose: string;
  /**
   * Estimated send volume class — used to size IP pools and warm-up schedules.
   * high: > 10k/day  medium: 1k–10k/day  low: < 1k/day
   */
  volumeClass: "high" | "medium" | "low";
}

export const SUBDOMAIN_CONFIG: Record<EmailSubdomain, SubdomainConfig> = {
  [EmailSubdomain.TRANSACTIONAL]: {
    from: "noreply@mail.aegislens.com",
    replyTo: "support@aegislens.com",
    purpose:
      "Transactional mail: account verification, password resets, payment receipts, " +
      "report-ready notifications. High deliverability priority.",
    volumeClass: "medium",
  },
  [EmailSubdomain.MARKETING]: {
    from: "hello@news.aegislens.com",
    replyTo: "hello@news.aegislens.com",
    purpose:
      "Marketing mail: product announcements, newsletters, weekly intelligence digests. " +
      "Subject to engagement-based throttling and unsubscribe headers.",
    volumeClass: "high",
  },
  [EmailSubdomain.ALERTS]: {
    from: "alerts@alerts.aegislens.com",
    replyTo: "noreply@alerts.aegislens.com",
    purpose:
      "Critical alerts: air-raid notifications, high-priority AOI triggers, " +
      "system status changes. Must always land — dedicated isolated IP pool.",
    volumeClass: "low",
  },
  [EmailSubdomain.SYSTEM]: {
    from: "system@no-reply.aegislens.com",
    replyTo: "support@aegislens.com",
    purpose:
      "Automated system mail: cron reports, audit log summaries, " +
      "internal monitoring digests. Low volume, no reply expected.",
    volumeClass: "low",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Builds a RFC 5322 sender address string.
 *
 * @param subdomain - The EmailSubdomain enum value.
 * @param name - Optional display name (e.g. "Aegis Lens Alerts").
 * @returns A formatted address like `"Aegis Lens <mail@aegislens.com>"`.
 *
 * Повертає рядок відправника у форматі «Ім'я <адреса>».
 */
export function getSenderAddress(
  subdomain: EmailSubdomain,
  name?: string,
): string {
  const { from } = SUBDOMAIN_CONFIG[subdomain];
  if (name) {
    // Wrap display name in quotes if it contains special characters
    const safeName = /[,;<>@"]/.test(name) ? `"${name}"` : name;
    return `${safeName} <${from}>`;
  }
  return from;
}

/**
 * Returns the appropriate subdomain for a given traffic type string.
 *
 * @param type - One of: 'transactional' | 'marketing' | 'alert' | 'system'
 * @returns The corresponding EmailSubdomain enum value.
 *
 * Повертає субдомен для відповідного типу трафіку.
 */
export function getSubdomainForTrafficType(
  type: "transactional" | "marketing" | "alert" | "system",
): EmailSubdomain {
  const map: Record<string, EmailSubdomain> = {
    transactional: EmailSubdomain.TRANSACTIONAL,
    marketing: EmailSubdomain.MARKETING,
    alert: EmailSubdomain.ALERTS,
    system: EmailSubdomain.SYSTEM,
  };
  return map[type] ?? EmailSubdomain.TRANSACTIONAL;
}
