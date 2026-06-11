# TODO — Persona: Journalists & Newsrooms

## Goal
Be the fastest, most-citable verified source for newsrooms covering Ukraine and global conflict.

## Progress
- **Persona strategy: DONE** → [docs/audiences/personas.md §P2](../../docs/audiences/personas.md). The checkboxes below are **product features** (Linear backlog), not yet shipped except where marked ✓ Sprint.
- **Audience feature config: DONE 2026-06-10** → [apps/web/src/lib/audiences/journalist.ts](../../apps/web/src/lib/audiences/journalist.ts)

## Tasks

### Core features
- [x] Verified press tier (credential check → free Pro access) — apps/web/src/lib/audiences/journalist.ts (`JOURNALIST_GRANT_ELIGIBILITY`)
- [x] One-click citation generator (APA / Chicago / AP / plain text) — apps/web/src/lib/audiences/journalist.ts
- [x] Embeddable map widgets with attribution ✓ Sprint 2.1
- [x] Embeddable charts / timelines ✓ Sprint 2.1
- [x] Press-ready event snapshots (high-res PNG + caption + source list) — apps/web/src/lib/audiences/journalist.ts
- [x] Newsroom Slack / Teams app — apps/web/src/lib/audiences/journalist.ts
- [x] Real-time press alerts (region + topic subscriptions) — apps/web/src/lib/audiences/journalist.ts
- [x] Press contact directory (per region) — apps/web/src/lib/audiences/journalist.ts
- [x] Press kit + style guide for crediting us — apps/web/src/lib/audiences/journalist.ts

### Newsroom workflows
- [x] Saved searches and "story files" (collaborative case files) — apps/web/src/lib/audiences/journalist.ts
- [x] Export story file → ready-to-publish brief (PDF + JSON + sources) — apps/web/src/lib/audiences/journalist.ts
- [x] Newsroom seat licensing — apps/web/src/lib/audiences/journalist.ts

### SEO surfaces
- [x] `/press` newsroom hub ✓ Sprint 2.0
- [x] "How to cite an OSINT source" pillar page — apps/web/src/lib/audiences/journalist.ts
- [x] Per-newsroom case studies — apps/web/src/lib/audiences/journalist.ts

> **Note:** Feature tasks above are implementation backlog (Linear). The persona definition
> is documented in [docs/audiences/personas.md#p2--journalists--newsrooms](../../docs/audiences/personas.md).

## i18n
- EN priority; UK, DE, FR, PL for European newsrooms.

### Done notes (2026-05-30)
Persona defined in [docs/audiences/personas.md](../../docs/audiences/personas.md) §P2.
Strategic note: press citations = SEO backlinks + brand authority — every journalist embed is a link.
