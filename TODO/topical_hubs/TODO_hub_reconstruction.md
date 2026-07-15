# Hub — Reconstruction & Recovery

## Goal
Track post-strike/post-liberation reconstruction: damaged-vs-rebuilt infrastructure, funding pledges vs disbursed, by region. Distinct from the platform's own `TODO/monetization/` "grants" (this is *Ukraine's* recovery, not the platform's funding).

## Progress
- 0 / 6 done

## URLs
- `/reconstruction` (pillar) · `/reconstruction/<oblast-slug>` (per-region) · `/reconstruction/pledges` (donor pledge tracker)

## Tasks
- [ ] Pillar page: national damage estimate vs funds pledged/disbursed (cite World Bank/KSE/Ukraine Recovery Conference RDNA reports)
- [ ] Per-oblast reconstruction status page (cross-link `pages/TODO_regions.md`) — damaged infra count, rebuilt count, active projects
- [ ] Donor pledge tracker: pledging country/institution, amount, sector (energy/housing/roads/health), disbursed %
- [ ] Data model: `ReconstructionProjectSeed` + `DonorPledgeSeed` in `apps/web/src/lib/hubs/reconstruction.ts`
- [ ] Cross-link to `topical_hubs/TODO_hub_energy_security.md` (energy rebuild) and `layers/TODO_infrastructure.md`
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Complements the new `topical_hubs/TODO_hub_international_aid.md` (military/financial aid) — this hub is civilian-infrastructure-recovery specific.

## i18n
- EN + UK; high relevance for NGO/government audiences (see `audiences/TODO_ngos_humanitarian.md`, `audiences/TODO_governments_defense.md`).
