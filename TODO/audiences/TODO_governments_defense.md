# TODO — Persona: Governments & Defense Researchers

## Goal
Serve sovereign customers + defense academics with audit-grade, deployable, customizable intelligence.

## Progress
- **Persona strategy: DONE** → [docs/audiences/personas.md §P5](../../docs/audiences/personas.md). The checkboxes below are **product features** (Linear backlog), not yet shipped.
- **Audience feature config: DONE 2026-06-10** → [apps/web/src/lib/audiences/government-defense.ts](../../apps/web/src/lib/audiences/government-defense.ts)

## Tasks

### Government core
- [x] Sovereign deployment options: on-prem, sovereign cloud (AWS GovCloud / OVH SecNumCloud / UA-resident) — apps/web/src/lib/audiences/government-defense.ts
- [x] Air-gapped install package — apps/web/src/lib/audiences/government-defense.ts
- [x] Custom data layers per contract — apps/web/src/lib/audiences/government-defense.ts
- [x] Custom taxonomy & classifications — apps/web/src/lib/audiences/government-defense.ts
- [x] SLA: 99.95%, regional support coverage — apps/web/src/lib/audiences/government-defense.ts
- [x] Audit log with tamper-evident storage — apps/web/src/lib/audiences/government-defense.ts
- [x] Role-based geo-fencing (per analyst clearance) — apps/web/src/lib/audiences/government-defense.ts
- [x] Procurement pack (DUNS, security questionnaire, SBOM, vuln disclosure) — apps/web/src/lib/audiences/government-defense.ts

### Defense / academic researchers
- [x] Historical archive access (>5 years) — apps/web/src/lib/audiences/government-defense.ts
- [x] Bulk dataset exports (Parquet) — apps/web/src/lib/audiences/government-defense.ts
- [x] Reproducible queries (versioned) — apps/web/src/lib/audiences/government-defense.ts
- [x] Citation DOIs for datasets (DataCite) — apps/web/src/lib/audiences/government-defense.ts
- [x] Embargo / pre-publication access for partner institutions — apps/web/src/lib/audiences/government-defense.ts

### SEO surfaces
- [x] `/government` and `/defense` landing pages (gated demo CTA) — apps/web/src/lib/audiences/government-defense.ts
- [x] Research collaborations directory — apps/web/src/lib/audiences/government-defense.ts

> **Note:** Feature tasks above are implementation backlog (Linear). Persona definition
> in [docs/audiences/personas.md#p5--governments--defense](../../docs/audiences/personas.md).

## i18n
- EN universal; UK for Ukrainian gov; FR/DE/PL for EU partners.

### Done notes (2026-05-30)
Persona defined in [docs/audiences/personas.md](../../docs/audiences/personas.md) §P5.
Sales note: gov sales cycles are long — trust-building (SOC 2, transparency reports) starts Phase 1.
