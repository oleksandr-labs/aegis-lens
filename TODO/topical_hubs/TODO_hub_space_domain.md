# Hub — Space Domain & Counter-Space Warfare

## Goal
Space as a contested military domain (anti-satellite weapons testing, satellite jamming/spoofing attacks, co-orbital threats, space-based ISR competition) — distinct from `apps/web/src/lib/hubs/satellite.ts`, which is entirely about satellite imagery as an *analysis tool* (SAR, cloud-free mosaics), never space as a domain of conflict. Zero existing scaffolding of any kind found repo-wide.

## Progress
- 0 / 5 done

## URLs
- `/space-domain` (pillar) · `/space-domain/<topic-slug>` (e.g. `/space-domain/anti-satellite-tests`, `/space-domain/satellite-jamming-incidents`)

## Tasks
- [ ] Pillar page: space as a contested domain — ASAT testing (direct-ascent/co-orbital), satellite jamming/spoofing attacks on military and civil assets, space-based ISR/targeting competition, relevant treaties (Outer Space Treaty, PPWT proposals)
- [ ] Per-topic page: documented ASAT tests by country/date, satellite-jamming incident log (distinct from the AIS/GPS-spoofing content already covered under maritime/drones — this is specifically about satellite assets themselves, not terrestrial navigation signals)
- [ ] Data model: `SpaceDomainEventSeed` (date, type: asat-test/jamming-incident/co-orbital-approach, actor, targetAsset?, sourceUrls[]) in `apps/web/src/lib/hubs/space-domain.ts`
- [ ] Cross-link to `layers/TODO_satellite_imagery.md` (imagery-as-tool) and `topical_hubs/TODO_hub_cyber_warfare.md` (space-cyber overlap, e.g. Viasat KA-SAT hack)
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Genuinely net-new — no existing hub, layer, or taxonomy leaf touches space-as-a-domain (only an unrelated Starlink-connectivity example slug exists elsewhere in the taxonomy, about internet access, not warfare).
- Growing topical relevance (Starlink battlefield use, Viasat hack, GPS-jamming-adjacent reporting) makes this a reasonable near-term addition despite starting from zero.

## i18n
- EN + UK.
