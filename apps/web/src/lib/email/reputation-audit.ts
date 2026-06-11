/**
 * Quarterly email reputation audit toolkit.
 *
 * Run this audit every 90 days to proactively catch deliverability risks
 * before they become inbox placement problems.
 *
 * The audit covers:
 *   - DNS authentication (DKIM, SPF, DMARC, BIMI)
 *   - Sending infrastructure (IP pools, warm-up status)
 *   - List hygiene (suppression list size, bounce rates)
 *   - Engagement health (open rates, complaint rates)
 *   - Compliance (unsubscribe links, RFC 8058, CAN-SPAM / GDPR)
 *
 * Щоквартальний аудит репутації: 20 перевірок для проактивного
 * виявлення ризиків доставки email.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ReputationAuditResult {
  domain: string;
  /** DKIM CNAME records resolve and signature validates. */
  dkimValid: boolean;
  /** SPF TXT record present and includes all sending providers. */
  spfValid: boolean;
  /** Current DMARC policy value (none | quarantine | reject). */
  dmarcPolicy: string;
  /** BIMI TXT record is present and SVG is accessible. */
  bimiConfigured: boolean;
  /** Total entries in the suppression list. */
  suppressionListSize: number;
  /** Fraction of sent messages that bounced in the last 30 days (0–1). */
  bounceRateLast30d: number;
  /** Fraction of sent messages reported as spam in the last 30 days (0–1). */
  complaintRateLast30d: number;
  /** Actionable recommendations from the audit. */
  recommendations: string[];
  /** ISO date when this audit was generated. */
  auditDate: string;
}

// ── Audit checklist ───────────────────────────────────────────────────────────

/**
 * 20-item quarterly audit checklist.
 * Use as a reminder / manual runbook during the audit session.
 *
 * 20 пунктів щоквартального аудиту репутації email.
 */
export const AUDIT_CHECKLIST: string[] = [
  // DNS & authentication
  "1.  Verify DKIM CNAME records resolve for all selectors (resend, pm, pm2).",
  "2.  Verify SPF TXT record includes all active sending providers.",
  "3.  Confirm DMARC policy is 'quarantine' or 'reject' (never 'none').",
  "4.  Check DMARC rua/ruf reports are arriving at dmarc@aegislens.com.",
  "5.  Validate BIMI SVG is accessible at HTTPS URL and passes SVG Tiny 1.2 lint.",

  // IP & pool health
  "6.  Confirm all four IP pools (transactional/marketing/alerts/system) are active.",
  "7.  Check dedicated IP warm-up status for any IPs added in the last 90 days.",
  "8.  Review Resend and Postmark pool bounce/complaint dashboards.",
  "9.  Verify IP pools are not listed on major DNSBLs (MXToolbox blacklist check).",

  // List hygiene
  "10. Audit suppression list: verify hard bounces and complaints are all present.",
  "11. Remove addresses that have been inactive (no opens) for > 12 months.",
  "12. Confirm re-opt-in flow works for previously suppressed addresses.",

  // Engagement & rates
  "13. Calculate 30-day bounce rate per pool — target < 2%.",
  "14. Calculate 30-day spam complaint rate — target < 0.1%.",
  "15. Review per-region deliverability stats (computeRegionalStats).",
  "16. Check Google Postmaster Tools domain + IP reputation is 'high'.",
  "17. Check Microsoft SNDS filter status is 'green' for all sending IPs.",

  // Compliance
  "18. Test one-click unsubscribe (RFC 8058) — POST to /api/email/unsubscribe.",
  "19. Verify all marketing emails include List-Unsubscribe + List-Unsubscribe-Post headers.",
  "20. Review consent records for GDPR / UK GDPR compliance (opt-in timestamps).",
];

// ── Report generator ──────────────────────────────────────────────────────────

/**
 * Generates a complete ReputationAuditResult, filling in defaults for
 * any fields not provided in `data`.
 *
 * Generates actionable recommendations based on the metrics supplied.
 *
 * @param data - Partial audit data gathered from live systems.
 * @returns Full ReputationAuditResult with recommendations.
 *
 * Генерує звіт аудиту репутації з рекомендаціями.
 */
export function generateAuditReport(
  data: Partial<ReputationAuditResult>,
): ReputationAuditResult {
  const recommendations: string[] = [...(data.recommendations ?? [])];

  const dkimValid = data.dkimValid ?? false;
  const spfValid = data.spfValid ?? false;
  const dmarcPolicy = data.dmarcPolicy ?? "none";
  const bimiConfigured = data.bimiConfigured ?? false;
  const suppressionListSize = data.suppressionListSize ?? 0;
  const bounceRateLast30d = data.bounceRateLast30d ?? 0;
  const complaintRateLast30d = data.complaintRateLast30d ?? 0;

  // Authentication recommendations
  if (!dkimValid) {
    recommendations.push(
      "CRITICAL: DKIM is not valid. Check CNAME records in DNS and provider configuration.",
    );
  }
  if (!spfValid) {
    recommendations.push(
      "CRITICAL: SPF record is missing or invalid. Add all sending provider includes.",
    );
  }
  if (dmarcPolicy === "none") {
    recommendations.push(
      "DMARC policy is 'none' (monitoring only). Upgrade to 'quarantine' immediately.",
    );
  } else if (dmarcPolicy === "quarantine") {
    recommendations.push(
      "DMARC policy is 'quarantine'. If bounce rates are < 2% and complaint rates < 0.1%, " +
        "upgrade to 'reject' for maximum anti-spoofing protection.",
    );
  }
  if (!bimiConfigured) {
    recommendations.push(
      "BIMI is not configured. Set up BIMI TXT record and upload SVG logo to improve " +
        "brand recognition in Apple Mail, Yahoo, and Gmail (with VMC).",
    );
  }

  // List health recommendations
  if (bounceRateLast30d > 0.05) {
    recommendations.push(
      `Bounce rate ${(bounceRateLast30d * 100).toFixed(1)}% is above 5% — run aggressive list cleaning.`,
    );
  }
  if (complaintRateLast30d > 0.001) {
    recommendations.push(
      `Complaint rate ${(complaintRateLast30d * 100).toFixed(3)}% exceeds 0.1% — review opt-in quality and unsubscribe prominence.`,
    );
  }
  if (suppressionListSize === 0) {
    recommendations.push(
      "Suppression list is empty. Verify bounce/complaint webhooks are processing correctly.",
    );
  }

  return {
    domain: data.domain ?? "aegislens.com",
    dkimValid,
    spfValid,
    dmarcPolicy,
    bimiConfigured,
    suppressionListSize,
    bounceRateLast30d,
    complaintRateLast30d,
    recommendations,
    auditDate: data.auditDate ?? new Date().toISOString(),
  };
}

// ── Markdown report template ──────────────────────────────────────────────────

/**
 * Markdown template for the quarterly audit report.
 * Fill in placeholders {{FIELD}} with actual values from ReputationAuditResult.
 *
 * Markdown-шаблон для щоквартального звіту аудиту.
 */
export const QUARTERLY_AUDIT_TEMPLATE: string = `# Email Reputation Audit — {{DOMAIN}}

**Audit Date:** {{AUDIT_DATE}}
**Audited by:** {{AUDITOR}}
**Next audit due:** {{NEXT_AUDIT_DATE}}

---

## Authentication

| Check | Status |
|-------|--------|
| DKIM valid | {{DKIM_VALID}} |
| SPF valid  | {{SPF_VALID}} |
| DMARC policy | {{DMARC_POLICY}} |
| BIMI configured | {{BIMI_CONFIGURED}} |

## Sending health (last 30 days)

| Metric | Value | Target |
|--------|-------|--------|
| Bounce rate | {{BOUNCE_RATE}}% | < 2% |
| Complaint rate | {{COMPLAINT_RATE}}% | < 0.1% |
| Suppression list size | {{SUPPRESSION_LIST_SIZE}} | — |

## Google Postmaster Tools

- Domain reputation: {{DOMAIN_REPUTATION}}
- IP reputation: {{IP_REPUTATION}}
- Spam rate (Gmail): {{SPAM_RATE}}%

## Microsoft SNDS

- Filter status: {{SNDS_FILTER_STATUS}}
- Spam trap hits: {{SPAM_TRAP_HITS}}

## Recommendations

{{RECOMMENDATIONS}}

## Checklist sign-off

{{CHECKLIST_SIGNOFF}}

---

_Generated by apps/web/src/lib/email/reputation-audit.ts_
`;
