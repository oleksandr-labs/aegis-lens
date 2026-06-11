# TODO — Persona: Security & Private Intel Firms

## Goal
API-first customers — they resell, embed, or augment with our data.

## Progress
- **Persona strategy: DONE** → [docs/audiences/personas.md §P6](../../docs/audiences/personas.md). The checkboxes below are **product features** (Linear backlog), not yet shipped except where marked ✓ Sprint.
- **Audience feature config: DONE 2026-06-10** → [apps/web/src/lib/audiences/security-firm.ts](../../apps/web/src/lib/audiences/security-firm.ts)

## Tasks
- [x] Enterprise API with high rate limits + SLA — apps/web/src/lib/audiences/security-firm.ts
- [x] Bulk historical export — apps/web/src/lib/audiences/security-firm.ts
- [x] Webhook delivery with replay — apps/web/src/lib/audiences/security-firm.ts
- [x] White-label option (custom domain, branding, theme) — apps/web/src/lib/audiences/security-firm.ts
- [x] Co-branded reports — apps/web/src/lib/audiences/security-firm.ts
- [x] Custom AOI monitoring (priced per AOI) — apps/web/src/lib/audiences/security-firm.ts
- [x] Travel-risk module (per-city scoring for client travel) — apps/web/src/lib/audiences/security-firm.ts
- [x] Asset-protection module (per-facility monitoring) — apps/web/src/lib/audiences/security-firm.ts
- [x] Reseller agreement template — apps/web/src/lib/audiences/security-firm.ts
- [x] Partner portal (leads, commissions, joint marketing) — apps/web/src/lib/audiences/security-firm.ts
- [x] SOC 2 + ISO 27001 attestations — apps/web/src/lib/audiences/security-firm.ts

### SEO surfaces
- [x] `/api` developer portal as conversion surface ✓ Sprint 1.9
- [x] `/partners/security-firms` — apps/web/src/lib/audiences/security-firm.ts
- [x] Comparison: "vs in-house build" calculator — apps/web/src/lib/audiences/security-firm.ts

> **Note:** Feature tasks above are implementation backlog (Linear). Persona definition
> in [docs/audiences/personas.md#p6--security--private-intel-firms](../../docs/audiences/personas.md).
> Reseller agreement template → [docs/legal/partners/reseller-agreement.md](../../docs/legal/partners/reseller-agreement.md).

## i18n
- EN primary; localized contracts on request.

### Done notes (2026-05-30)
Persona defined in [docs/audiences/personas.md](../../docs/audiences/personas.md) §P6.
Highest revenue per seat/call — optimize API DX relentlessly. White-label uses
[white-label-oem.md](../../docs/legal/partners/white-label-oem.md).
