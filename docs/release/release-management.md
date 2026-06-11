# Release Management

> **Status:** v1.0 — engineering operations. Review semi-annually.
> **Covers:** Release process, Release notes, Customer-impacting change management.

---

## Part 1 — Release Process

> "Boring deploys = scaled team. Engineer toward boring."

### 1.1 Release Cadence per Service Area

| Service area | Target cadence | Deployment method | Notes |
|---|---|---|---|
| **Frontend (apps/web)** | Multiple per day | Continuous deployment via Vercel / GitHub Actions | Feature-flagged; no big-bang deploys |
| **API gateway** | Daily (business hours) | Rolling deploy on Kubernetes | Zero-downtime rolling update |
| **NLP / AI pipeline** | Weekly | Blue-green (model upgrades) or rolling (infra) | Model changes require eval gate |
| **Ingest service** | Daily | Rolling | Source adapters may require coordinated deploy |
| **Data schema migrations** | As needed (avoid Fridays) | Blue-green + dual-write window | Never breaking without dual-write period |
| **Mobile / PWA** | Weekly | Vercel deploy | iOS/Android store submission: 2–4 week cycle |
| **Database (Postgres schema)** | Gated — not routine | Manual with DBA review | Requires migration plan + rollback |

**Rule:** No production deploys after 16:00 UTC on Fridays. No production deploys during major conflict events (elevated traffic; no window for on-call distraction).

### 1.2 Per-PR Release Notes (Automated Draft)

Every merged pull request generates an automated draft release note:
- Source: PR description's `## Release note` section (mandatory for any user-visible change)
- Automation: GitHub Actions workflow parses PR descriptions and appends to the weekly changelog draft
- Categories auto-detected from PR labels: `type: feature`, `type: fix`, `type: security`, `type: breaking`, `type: deprecated`
- Draft published to internal Notion changelog; human review before external publish

**PR description template (mandatory for user-visible changes):**
```markdown
## Release note
**Category:** Added | Changed | Fixed | Deprecated | Security
**User-visible:** Yes | No
**Summary (one sentence for users):** ___
**Details (optional, for internal changelog):** ___
```

If no `## Release note` section: PR is assumed internal-only and excluded from the customer changelog.

### 1.3 Weekly Aggregate Changelog Publish

Every Monday at 09:00 UTC:
1. Automated draft compiled from PRs merged Mon–Sun previous week
2. Engineering lead reviews + edits for tone (user-facing language, not jargon)
3. Published to `/changelog` (public) + Slack `#releases` (internal) + RSS feed
4. Major features: additionally posted to Twitter/X, LinkedIn, and the newsletter

**Changelog format:**
```markdown
## Week of YYYY-MM-DD

### Added
- [Map] Regions now show a "Top sources" section with reliability scores
- [API] `/events` endpoint now supports `?confidence_min=` filter

### Fixed
- [Map] Fixed a bug where the event detail panel would not close on mobile
- [Copilot] Improved citation accuracy for events older than 7 days

### Security
- Updated dependency X to remediate CVE-YYYY-NNNN (low severity)
```

### 1.4 Per-Release Pre-Flight Checklist

Before any production deploy:

| Check | Automated | Manual |
|---|---|---|
| Unit tests pass | ✓ CI | |
| Integration tests pass | ✓ CI | |
| TypeScript strict mode passes | ✓ CI | |
| ESLint + Prettier | ✓ CI | |
| a11y tests (axe-core) | ✓ CI | |
| Security scan (Snyk / trivy) | ✓ CI | |
| Schema compatibility check (Drizzle migrations reviewed) | | ✓ DBA on schema changes |
| Load test (for backend changes affecting event pipeline) | | ✓ Monthly or on major changes |
| Feature flag enabled for target cohort | | ✓ Engineer |
| On-call engineer acknowledged + available | | ✓ On-call |

**Hard gates:** CI must be green. Security scan must show no critical/high CVEs unresolved. On-call must acknowledge the deploy.

### 1.5 Per-Release Post-Flight (Smoke Tests + On-Call Ack)

Immediately after any production deploy:

1. **Automated smoke tests** (< 2 min): Core API endpoints return 200. Map loads. Authentication works. TEVI metric is not degraded (last 5-min median within 2× of 30-day baseline).
2. **On-call monitoring window:** On-call engineer actively monitors Grafana + Sentry for 15 minutes post-deploy.
3. **Automatic rollback trigger:** If error rate spikes > 10× baseline within 5 minutes of deploy, automated rollback initiated (Kubernetes rollout undo + Vercel revert to previous deployment).
4. **Post-deploy Slack message:** Engineer posts in `#releases`: "Deploy of [service] @ [version] complete. Smoke tests: ✓. Monitoring 15 min."

### 1.6 Canary Deploy Default for Risk Areas

For any backend or API change classified as "risk area" (authentication, billing, data pipeline, schema migration):
- Canary: 5% of traffic routed to new version
- Monitor for 30 minutes: error rate, latency, TEVI metric
- If canary is healthy: promote to 50% → 100%
- If canary shows regression: automatic rollback to stable version

**Risk areas:**
- Authentication + session management
- Billing / Stripe webhook handling
- Data pipeline (ingest, dedup, classification)
- Schema migrations
- Any change touching > 500 lines across > 10 files

### 1.7 Blue-Green for Risky Migrations

For database schema migrations and major service replacements:
- **Blue-green:** Two identical environments; traffic switches atomically from Blue (current) to Green (new)
- **Dual-write window:** During schema migration, both old and new schema supported simultaneously; validated for minimum 24 hours before old schema dropped
- **Zero-downtime migration pattern:** Add column → backfill → make NOT NULL → remove old column (never skip steps)

**Tools:** Drizzle ORM migrations + a custom migration orchestrator that enforces the dual-write window.

### 1.8 Roll-Forward Preferred over Roll-Back

**Policy:** For most production issues, roll forward (ship a fix) rather than roll back. Roll-back is reserved for:
- Data corruption risk
- Security vulnerability exposed by the deploy
- Complete service outage with no quick fix available

**Why:** Roll-back can re-introduce bugs that were fixed in the intermediate commits; roll-forward is safer when the change is well-understood.

**Exception:** Database migration can always be rolled back if the dual-write window is still active. Once the old schema is dropped: roll-forward only.

### 1.9 Per-Release Feature-Flag Governance

All new features shipped behind a feature flag unless trivially safe:
- Flag created in LaunchDarkly (or our own `packages/feature-flags/` implementation)
- Default: off for all users
- Rollout: internal team → beta users → 10% → 50% → 100% (each step with monitoring window)
- Flag retirement: once a feature reaches 100% for 30 days with no issues, the flag is removed in the following sprint

**Flag registry:** All active flags documented in Notion with: created date, owner, rollout %, retirement date (planned), associated PR.

**No flag sprawl:** Flags open > 90 days without a plan get automatically flagged for review.

### 1.10 Per-Release Internal Comms (Slack #releases)

Every production deploy (of any service) posts to `#releases`:
```
🚀 [service] v[version] deployed to production
Deployed by: [engineer]
PRs included: [link to changelog draft]
Risk level: Low | Medium | High
Canary: Yes/No
Monitoring window: Active until [time]
On-call: @[engineer]
```

All engineers are subscribed to `#releases`. Non-engineers can opt in. PagerDuty alerts also surface to `#releases`.

### 1.11 Per-Release Customer Comms (Where Applicable)

Customer communication thresholds:
- **Low:** no external notification; changelog only (published weekly)
- **Medium (API change, new feature, UI change):** in-app "What's new" notification + weekly changelog
- **High (breaking change, pricing change, ToS change):** dedicated email + in-app banner + 30–60 day notice (see Part 3)
- **Critical (security incident, data issue):** immediate status page + direct email to affected accounts (see `docs/security/security-incident-runbook.md`)

---

## Part 2 — Release Notes

> "Notes that tell a story drive engagement. Bullet lists do not."

### 2.1 Weekly Aggregated Notes

Published every Monday at 09:00 UTC at `/changelog`. See Part 1 §1.3 for the format.

### 2.2 Tag by Area + Persona

Each release note entry is tagged with:
- **Area:** Map, API, Copilot, Alerts, Reports, Admin, Data, Performance, Security
- **Persona:** Analyst, Journalist, NGO, Enterprise, Developer, All

Tags are searchable on the changelog page. Users can filter by persona ("show me only changes relevant to API developers") or area ("show me only map changes").

### 2.3 Screenshots / GIFs for Visual Changes

Any changelog entry for a user-visible UI change must include:
- A screenshot (still) OR
- A GIF or short video (< 10 seconds) showing the interaction

**Production:** Design or engineering records via Loom / Kap (Mac GIF tool). Stored in the DAM; embedded in the changelog page.

Entries without visual media for UI changes are flagged in the editorial review step.

### 2.4 In-App "What's New" Panel (Last 30 Days)

Accessible via the bell icon + "What's new" link in the nav:
- Shows last 30 days of changelog entries, filtered by the user's plan (only features available to their tier)
- New entries appear with a dot indicator on the bell icon (dismissed after reading)
- Implemented as a side drawer: loads changelog data from the `/api/changelog` endpoint (static JSON, edge-cached)
- Dismissal tracked per-user in account settings (so it doesn't re-appear on every visit)

### 2.5 Email Digest (Monthly) to Engaged Users

Sent on the first Monday of each month to users who:
- Logged in at least once in the past 30 days (engaged cohort)
- Have not unsubscribed from product updates

**Format:**
- Subject: "Aegis Lens: What changed in [Month]"
- Body: top 3–5 features from the past month; visual for each; CTA to changelog
- Personal CTA: one feature highlighted based on the user's segment (e.g., API changes for API users; map features for map-heavy users)

**Unsubscribe:** One-click in every email. Preference in `/account/settings/notifications`.

### 2.6 Published as RSS + Atom + JSON

The changelog is available as:
- **RSS 2.0:** `/changelog/feed.xml`
- **Atom 1.0:** `/changelog/feed.atom`
- **JSON Feed 1.1:** `/changelog/feed.json`
- **API:** `/api/changelog?since=YYYY-MM-DD` (returns JSON array of entries)

All feeds: force-static, edge-cached, `Cache-Control: public, max-age=3600`.

Linked in the changelog page header via `<link rel="alternate">` meta tags.

---

## Part 3 — Customer-Impacting Change Management

> "Surprise changes destroy trust. Even when right, communicate early."

### 3.1 Per-Change Classification

Every change that could impact customer experience is classified before deployment:

| Impact level | Examples | Notice required |
|---|---|---|
| **Low** | Bug fix, performance improvement, internal refactor, new optional feature (behind flag) | None — changelog only |
| **Medium** | New feature changes existing UX, API response format addition (backwards-compatible), new required field | 7 days — in-app + next newsletter |
| **High** | Breaking API change, feature removal, pricing change, plan limit change, ToS material change | 30–60 days — email + in-app + docs |
| **Critical** | Immediate security patch that requires user action (password reset, API key rotation) | Immediate — email + in-app + status page |

**Classification is done by:** Engineer who owns the change + product lead. Legal reviews all High and Critical.

### 3.2 Per-Tier Notice Lead-Time

| Change type | Free | Pro/Team | Enterprise/Gov |
|---|---|---|---|
| Price change | 30 days | 60 days | 90 days (or per contract SLA) |
| Plan feature reduction | 30 days | 60 days | 90 days |
| ToS material change | 30 days | 30 days | 30 days |
| API breaking change | 60 days | 60 days | 90 days (or per contract) |
| Feature deprecation | 90 days | 90 days | 180 days |
| Data format change | 30 days | 60 days | 90 days |

**Enterprise/Gov contracts:** Specific notice periods may be in the contract SLA — always check before any change.

### 3.3 Multi-Channel Comms (In-App + Email + Status Page + Docs)

For every High or Critical change:

| Channel | When | Content |
|---|---|---|
| **Docs updated** | 48h before announcement | New behavior documented; migration guide live |
| **In-app banner** | Day 1 of notice period | "Upcoming change: [brief description]" with a "Learn more" link |
| **Email (direct)** | Day 1 of notice period | Subject: "Action required: [change]" or "Upcoming change: [change]" |
| **Status page** | Day of change | Posted as planned maintenance; updated to "complete" after |
| **Changelog** | Day of change | Full change entry with before/after explanation |
| **Support macros** | 7 days before change | Support team briefed; macros ready for incoming questions |

### 3.4 Per-Change FAQ + Support Macros

For every High change, the support team prepares:
- Top 5 anticipated questions with draft answers
- Escalation path for questions outside the FAQ
- Macros loaded into the support tool (Intercom / Linear) before the first customer question arrives

FAQ is also published in the help center as a dedicated article for major changes.

### 3.5 Migration Help Articles

For breaking API changes or removed features:
- Migration guide published at `/docs/migration/[change-slug]`
- Format: "Old behavior → New behavior → Step-by-step migration guide → Code examples → FAQ"
- Linked from the in-app banner, email, and changelog entry
- In-context API docs updated: old endpoint/parameter marked `DEPRECATED` with a link to the migration guide

**Time to publish:** Migration guide must be live at least 7 days before the notice period begins.

### 3.6 Rollback Policy + Grace Period

When a High or Critical change is deployed:
- **7-day grace period:** Old behavior kept available (behind a flag or compatibility layer) for 7 days post-deployment, even if deprecated. Allows customers who didn't read the notice to catch up.
- **Enterprise grace period:** 30 days if contractually specified
- **Rollback eligibility:** If > 5% of enterprise customers report a blocking issue within 48h of a High change, we roll forward (fix) or temporarily restore old behavior while investigating

**Grace period exceptions:** Security patches (no grace period — immediate enforcement required).

### 3.7 Per-Change Retrospective

30 days after every High or Critical change:
- How many customers were impacted?
- How many support tickets generated?
- Was the communication effective? (response rate to emails, help article views)
- Any customers churned or expressed frustration that could have been prevented?
- What would we do differently next time?

Output: brief retro document (1 page) filed in `docs/release/change-retrospectives/`. Significant lessons incorporated into this playbook.

### 3.8 Customer Comms Approval Gate (Legal + Leadership)

Before any High or Critical change is communicated externally:

| Approver | Signs off on |
|---|---|
| **Legal** | ToS compliance, accurate disclosure, no misleading claims |
| **CEO or VP Product** | Messaging, timing, completeness |
| **Head of CS** | Customer impact assessed; major accounts alerted personally |

Approval documented in writing (email or Notion comment) before communication goes out. No High change communicated without all three approvals.
