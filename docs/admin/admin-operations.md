# Admin Operations Guide — Aegis Lens

Internal reference for staff operating the Aegis Lens back-office panel.
All admin actions are logged in the audit log. High-risk actions require 2-person authorization.

---

## 1. Auth Provider — WorkOS Integration

### Overview
Admin auth uses WorkOS Admin Portal (`apps/web/src/lib/enterprise/sso-config.ts`).
All admin accounts require SSO + MFA; no password-only access.

### Setup Steps
1. Log in to WorkOS Dashboard → Organizations → Create `aegis-lens-internal`.
2. Set up SSO connection (e.g. Google Workspace or Okta) for `@aegislens.io` domain.
3. Set `WORKOS_API_KEY`, `WORKOS_CLIENT_ID`, `WORKOS_REDIRECT_URI` in Doppler → prd config.
4. In `apps/web/src/lib/enterprise/sso-config.ts`, add the internal org connection:
   ```ts
   { orgId: 'WORKOS_INTERNAL_ORG_ID', domain: 'aegislens.io', connection: 'okta' }
   ```
5. Protect `/admin/*` routes with the admin-gate (`apps/web/src/lib/admin-gate.ts`):
   - Validate WorkOS session token from httpOnly cookie.
   - Check user has `staff` or `superadmin` role in WorkOS.
6. MFA requirement: all staff must have TOTP enrolled via WorkOS MFA — enforced at login.

### Libraries
```
pnpm add @workos-inc/node  # server SDK
pnpm add @workos-inc/authkit-nextjs  # Next.js middleware helper
```

### Key Routes
| Route | Handler |
|---|---|
| `GET /admin/auth/callback` | WorkOS OIDC callback → set `aegis_admin_session` cookie |
| `POST /admin/auth/logout` | Clear cookie + revoke WorkOS session |
| `GET /admin/auth/refresh` | Rotate admin session token |

---

## 2. Org Management (Create, Suspend, Merge, Delete)

### Create Org
1. Admin Panel → Organizations → New Organization.
2. Required fields: `name`, `slug`, `plan` (free/pro/enterprise), `billingEmail`.
3. System creates: org record, default `owner` seat for billing contact, Stripe customer.
4. Send welcome email with SSO setup link (if enterprise).
5. Audit log entry: `org.create` with staff `actorId`.

### Suspend Org
1. Organizations → [Org] → Actions → Suspend.
2. Effect: all org members get 401 on API calls; org data retained.
3. Stripe subscription paused (not cancelled — billing resumes on reactivation).
4. Users see `org_suspended` error on login.
5. Audit: `org.suspend`, reason required.
6. Auto-notification: email to org owner + billing contact.

### Merge Orgs
1. Organizations → [Source Org] → Actions → Merge Into → [Target Org].
2. Pre-merge checklist:
   - Export both org's data snapshots.
   - Resolve duplicate users (email match = merge accounts; manual if ambiguous).
   - Confirm Stripe subscription migration path.
3. Process:
   - Reassign all users, cases, alerts, API keys from source to target org.
   - Mark source org as `merged` (soft-delete; data retained 90 days then deleted).
   - Update billing: cancel source subscription, adjust target seats.
4. Requires dual-approval (two staff sign off in audit log).
5. Audit: `org.merge`, source/target IDs, approver IDs.

### Delete Org
1. Organizations → [Org] → Actions → Delete.
2. Prerequisites: org must be suspended and have $0 balance.
3. Process:
   - Schedule retention deletion jobs per `data-retention.ts` policy.
   - Cancel Stripe subscription immediately.
   - Send deletion confirmation to org owner.
4. Soft-delete: 30-day recovery window before data wipe begins.
5. Requires dual-approval.
6. Audit: `org.delete`, approver IDs, scheduled wipe date.

---

## 3. Role Management Matrix

| Role | Events | Alerts | Cases | Reports | API Keys | Billing | Admin Panel |
|---|---|---|---|---|---|---|---|
| **owner** | Full | Full | Full | Full | Create/revoke | Full | No |
| **admin** | Full | Full | Full | Full | Create/revoke | Read | No |
| **analyst** | Read/Write | Read/Write | Read/Write | Read | Read | No | No |
| **viewer** | Read | Read | Read | Read | No | No | No |
| **guest** | Read (shared only) | No | No | No | No | No | No |
| **billing-admin** | No | No | No | No | No | Full | No |
| **auditor** | Read | Read | Read | Read | Read | Read | No |
| **staff** (internal) | Full | Full | Full | Full | Full | Read | Yes (limited) |
| **superadmin** (internal) | Full | Full | Full | Full | Full | Full | Yes (full) |

### Changing a User's Role
1. Admin Panel → Organizations → [Org] → Members → [User] → Edit Role.
2. Role changes take effect on next request (JWT re-issued at next refresh).
3. Downgrade (e.g. admin → viewer): revoke all existing API keys scoped above new role.
4. Audit: `user.role_change`, before/after roles, reason.

---

## 4. Manual MFA Reset — 2-Person Verification Workflow

Used when a user loses access to their MFA device and cannot use backup codes.

### Steps
1. **User contacts support**: submits ticket with account email + identity proof.
2. **First reviewer (L1 Support)**:
   - Verify identity: match against account email, billing name, last login IP (approximate), or previous support interactions.
   - If confidence HIGH: escalate to L2 with recommendation.
   - If confidence LOW: request additional proof (government ID — handle via secure upload only).
   - Log in audit: `mfa.reset_requested`, L1 reviewer ID.
3. **Second reviewer (L2 / Security Team)**:
   - Independently verify identity evidence.
   - Must not be the same person as L1.
   - Approves or denies the reset.
   - Log: `mfa.reset_approved` or `mfa.reset_denied`, L2 reviewer ID.
4. **Execution** (only after both approvals):
   - Admin Panel → Users → [User] → Security → Reset MFA.
   - System: revokes all enrolled MFA factors via WorkOS API.
   - User receives email: "Your MFA has been reset. If this wasn't you, contact security@aegislens.io immediately."
   - User must re-enroll MFA on next login (enforced by tier policy).
5. **Enterprise users**: additionally notify the org's admin (they may have MDM-controlled devices).
6. Audit chain: all 5 events above must be in the immutable audit log.

### Prohibited
- Self-service MFA reset (no bypass flow for users to skip MFA without staff approval).
- Single-person MFA reset (always requires 2-person approval).

---

## 5. Public-Share Moderation Queue

Public shares include: presets, dashboard links, case file excerpts, and investigation summaries
made accessible via a public URL.

### Queue Location
Admin Panel → Moderation → Public Shares

### Triggers for Queue Entry
- Automated classifier flags content (hate speech, potential PII, CSAM keywords, etc.)
- User report via "Report this share" button
- Trusted flagger submission (DSA Art. 22)

### Review Workflow
1. Reviewer opens item in moderation queue.
2. Previews the shared content in sandboxed iframe (no JavaScript execution).
3. Classifies:
   - **Clear** — no action; classifier false positive; mark resolved.
   - **Warning** — add content warning banner to shared URL.
   - **Restrict** — set share to org-only (remove public access).
   - **Remove** — delete shared URL; notify owner with reason.
   - **Escalate** — refer to legal team (DSA notice-and-action, law enforcement).
4. Decision recorded in audit log: `share.moderation_decision`, item ID, reviewer ID, action.
5. Owner notification: automated email for Restrict/Remove/Escalate decisions.

### Turnaround SLA
| Priority | SLA |
|---|---|
| CSAM / terrorism flags | Immediate → escalate to legal in < 1 hour |
| Trusted flagger reports | 24 hours |
| User reports | 72 hours |
| Automated classifier | 72 hours |

---

## 6. Takedown Workflow

Formal takedown requests (DSA Art. 16 notices, DMCA, court orders).

### Step-by-Step
1. **Receive**: notice arrives at dsa@aegislens.io or via in-app report form.
   - Create `TakedownNotice` record (see `apps/web/src/lib/compliance/dsa.ts`).
   - Log: `takedown.received`.
2. **Legal review**:
   - Legal team reviews within SLA (see `TAKEDOWN_SLA_HOURS` in `dsa.ts`).
   - Determine: is the content actually illegal under the claimed law? Is the notice properly formed?
   - If TERREG / CSAM: immediate escalation, no standard review window.
3. **Execute**:
   - If removing: use Admin Panel → Content → [ID] → Remove. Stores `removedAt`, `removedBy`.
   - Generate Statement of Reasons (Art. 17 DSA) — stored against `TakedownNotice.statementOfReasons`.
4. **Notify**:
   - Notifier: decision + reasons within SLA.
   - Content owner: "Your content was removed" + reason + appeal instructions.
5. **Appeal** (Art. 20 DSA):
   - Content owner has 6 months to appeal.
   - Appeal reviewed by different staff member.
   - Outcome: restore content, uphold removal, or escalate to external mediator (Art. 21).
6. **Log**: full chain in immutable audit log.

---

## 7. Source Reputation Manual Adjust + Audit Trail

Sources have an automated reputation score (0–100) computed by the ingest pipeline.
Staff can apply a manual override with justification.

### Adjust via Admin Panel
1. Admin Panel → Sources → [Source ID] → Reputation → Manual Override.
2. Fields:
   - `override_score`: integer 0–100 (or null to remove override).
   - `reason`: required free text (minimum 50 chars).
   - `expires_at`: optional date — if set, override reverts automatically.
3. Effect: source's effective score = `override_score` (if set) or `computed_score`.
4. Audit log: `source.reputation_override`, sourceId, before/after scores, reason, staff ID.

### Viewing the Audit Trail
Admin Panel → Sources → [Source ID] → Reputation → History tab.
Shows all historical overrides with timestamps and staff IDs.

### When to Override
- Source published fabricated content (lower score or flag as unreliable).
- Source is a primary government/official source that automated scoring underweights.
- Temporary boost for a time-limited special event source.
- Partner source with contractual SLA for priority ingestion.

---

## 8. Per-Source Rate Limits + Retry Config

Each ingest source can have custom rate limit and retry settings to avoid hammering slow APIs
or overloading the pipeline.

### Config Schema
```ts
interface SourceRateLimitConfig {
  sourceId: string;
  /** Maximum requests per minute to the source's API / scrape endpoint */
  requestsPerMinute: number;
  /** Maximum concurrent requests */
  maxConcurrency: number;
  /** Retry policy */
  retry: {
    maxAttempts: number;
    initialDelayMs: number;
    backoffMultiplier: number;
    maxDelayMs: number;
    /** HTTP status codes that trigger a retry */
    retryOnStatus: number[];
  };
  /** Circuit breaker: pause ingestion if error rate exceeds threshold */
  circuitBreaker: {
    errorRateThreshold: number;   // 0.0–1.0 (e.g. 0.5 = 50%)
    windowSeconds: number;
    cooldownSeconds: number;
  };
  /** Ingest schedule (cron expression or interval in seconds) */
  schedule: string | { intervalSeconds: number };
}
```

### Defaults
```json
{
  "requestsPerMinute": 60,
  "maxConcurrency": 5,
  "retry": {
    "maxAttempts": 3,
    "initialDelayMs": 1000,
    "backoffMultiplier": 2,
    "maxDelayMs": 30000,
    "retryOnStatus": [429, 502, 503, 504]
  },
  "circuitBreaker": {
    "errorRateThreshold": 0.5,
    "windowSeconds": 60,
    "cooldownSeconds": 300
  }
}
```

### Updating Config
Admin Panel → Sources → [Source ID] → Ingest Settings → Rate Limits.
Changes take effect on the next ingest cycle (no restart required).
Audit log: `source.rate_limit_updated`.

---

## 9. Billing Tools

### Refund via Stripe API
1. Admin Panel → Billing → [Org] → Transactions → [Invoice] → Refund.
2. Enter: refund amount (partial or full), reason (internal note).
3. System calls:
   ```
   POST /api/admin/billing/refund
   body: { invoiceId, amountCents, reason, staffId }
   ```
   Which calls Stripe API: `stripe.refunds.create({ charge: chargeId, amount })`.
4. Audit log: `billing.refund`, invoiceId, amount, staff ID.
5. Customer notification: Stripe sends automated refund email.
6. Approval threshold: refunds > $500 require second approver.

### Comp Credits
1. Admin Panel → Billing → [Org] → Credits → Add Credits.
2. Enter: amount (USD cents), expires_at (optional), reason.
3. System adds to `org.credit_balance`; applied to next invoice automatically.
4. Stripe: uses `stripe.customers.createBalanceTransaction` (negative = credit).
5. Audit log: `billing.comp_credits`, orgId, amount, expires_at, reason, staff ID.

### Force Plan Change
1. Admin Panel → Billing → [Org] → Subscription → Change Plan.
2. Enter: new plan (free/pro/enterprise), effective_date, reason.
3. Options:
   - **Immediate**: switch now; prorate current billing period.
   - **Next cycle**: switch at end of current billing period.
4. System calls Stripe: `stripe.subscriptions.update({ items: [{ price: newPriceId }], proration_behavior })`.
5. If downgrading to free: revoke features that exceed free limits immediately (API key count, etc.).
6. Audit log: `billing.plan_change`, oldPlan, newPlan, effectiveDate, staff ID.
7. Customer notification: automated email from billing system.

### Viewing Billing History
Admin Panel → Billing → [Org] → Invoices — shows Stripe-synced invoice list.
Links open Stripe Dashboard in new tab (staff must have Stripe restricted key access).

---

*Last updated: Sprint 2.73 (2026-06-13). Maintained by: Security + Ops teams.*
