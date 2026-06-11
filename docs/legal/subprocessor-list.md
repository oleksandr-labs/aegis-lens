# Aegis Lens — Subprocessor List

Last updated: 2026-05-30
Next review: 2026-08-30

Customers are notified 30 days before new subprocessors are added via email to the DPA contact.

## Current Subprocessors

| Subprocessor | Purpose | Data processed | Location | DPA / SCCs |
|---|---|---|---|---|
| Amazon Web Services (AWS) | Cloud infrastructure, storage, compute | All platform data | EU (eu-central-1), US (us-east-1) | AWS DPA + SCCs |
| Anthropic | AI copilot inference (Claude API) | User prompts, event context | US | Anthropic DPA |
| Vercel | Web application hosting (Next.js) | Web traffic, authentication tokens | Global edge (no PII stored) | Vercel DPA |
| Cloudflare | CDN, DDoS protection, Workers | Web traffic | Global | Cloudflare DPA + SCCs |
| Stripe | Payment processing, billing | Payment card data, billing info | US, EU | Stripe DPA + SCCs |
| PostgreSQL (RDS) | Database | All event and user data | EU (eu-central-1) | via AWS DPA |
| Plausible Analytics | Product analytics (privacy-first) | Anonymous page-view data | EU (Germany) | Plausible DPA |
| PostHog | Session recording (consent-gated) | User interactions (opted-in only) | EU | PostHog DPA |
| Kafka (MSK) | Event streaming | Event data (no PII in flight) | EU (eu-central-1) | via AWS DPA |
| Qdrant | Vector search | Event embeddings | EU (self-hosted on AWS) | via AWS DPA |
| PagerDuty | On-call alerting | Incident data, on-call schedules | US | PagerDuty DPA |
| GitHub | Source code, CI/CD | Code, developer identities | US | GitHub DPA + SCCs |

## Data Categories Processed

| Category | Sensitivity | Subprocessors with access |
|---|---|---|
| Event data (conflict intelligence) | Internal / Public | AWS, Vercel, Cloudflare, Kafka, Postgres, Qdrant |
| User account data (email, name) | Confidential | AWS, Postgres, Stripe |
| Payment data | PCI-DSS | Stripe only |
| User prompts (Copilot) | Confidential | Anthropic, AWS |
| Analytics (anonymous) | Minimal | Plausible |

## Subprocessor Due Diligence

Each subprocessor is assessed **at onboarding and annually** against:
- SOC 2 Type II or ISO 27001 certification
- Data residency commitments (EU data stays in EU)
- Subprocessor's own subprocessor transparency
- Incident notification SLA (< 48 hours)

## Annual Subprocessor Security Review

Owner: Security + Legal. Cadence: annually (the **Next review** date at the top
of this file), and ad hoc on any subprocessor breach or material change.

Each review:
1. Re-collect each subprocessor's current SOC 2 Type II / ISO 27001 report (or
   equivalent) and confirm scope still covers our processing.
2. Re-verify data-residency commitments and the subprocessor's own subprocessor
   list (onward-transfer transparency).
3. Confirm the DPA/SCCs (and UK IDTA / Swiss adaptation) are still in force and
   current.
4. Review any incidents the subprocessor reported in the period and their
   < 48h notification compliance.
5. Record outcome per subprocessor: **retain / remediate / replace.** A failed
   review triggers the change process below (with the 30-day customer notice and
   [right-to-object workflow](dpa.md#4-customer-right-to-object-workflow)).

Results are logged in the change log and summarized on the Trust Center.

## Customer Right to Object

New or replacement subprocessors are announced with **30 days' notice**.
Customers may object on reasonable data-protection grounds within that window;
the resolution path (good-faith discussion → safeguards/alternative → scoped
termination as sole remedy) is defined in
[`dpa.md` §4](dpa.md#4-customer-right-to-object-workflow).

## Change Log

| Date | Change | Notice sent |
|---|---|---|
| 2026-05-30 | Initial list published | N/A (inception) |
