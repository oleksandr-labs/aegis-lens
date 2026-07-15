# Hub — Humanitarian

## URLs
- `/humanitarian` · `/humanitarian/<sub>` (displacement · aid-corridors · shelters · food-security · mine-action)

## Content
- [x] Pillar overview ✓ Sprint 0
- [x] OCHA + ReliefWeb integration — apps/web/src/lib/hubs/humanitarian.ts (`OCHA_RELIEF_WEB_FEED_CONFIG`)
- [x] Per-crisis subset — apps/web/src/lib/hubs/humanitarian.ts (`TRACKED_HUMANITARIAN_CRISES`)
- [x] NGO + UN persona surfaces — apps/web/src/lib/hubs/humanitarian.ts (`NGO_UN_PERSONA_SURFACES`)
- [x] Embed kit for partner orgs — apps/web/src/lib/hubs/humanitarian.ts (`HUMANITARIAN_EMBED_KIT`, `EmbedKitConfig`)

## Progress
5/5 tasks complete (Sprint 2.72)

## Gap flagged 2026-07-12 (round 5 content-gap pass)
- [ ] `/humanitarian/disability` sub-page — disability/accessibility of displaced and injured persons is currently unaddressed in real content: only a placeholder taxonomy leaf `humanitarian-disability` exists (`apps/web/src/lib/taxonomy/subcategories.ts`, `exampleSlugs: ["disabled-persons-evacuation-challenges", "care-home-attacks"]`) never wired to any actual page/FAQ/hub content. Wire it into this hub using the existing OCHA/ReliefWeb feed (disability-inclusion reporting is a standard OCHA cluster) rather than a separate hub — same pattern as this hub's other sub-pages.

## Gap flagged 2026-07-12 (round 6 content-gap pass — weak/dispersed, same treatment as prior rounds' in-place flags)
- [ ] Search-and-rescue / evacuation-logistics content is split across two disconnected systems: the `aid-corridors` sub-page (safe-passage/evacuation-corridor status) and `integrations/ua-dsns/src/event-extractor.ts` (SAR *incident* extraction feeding the emergencies map layer). No single tracker unifies them (e.g. no evacuation-train-schedule content specifically). Lower priority than the disability gap above — consider merging into a dedicated `/humanitarian/evacuation-logistics` sub-page once the two existing systems' data models are compared for a clean merge.
