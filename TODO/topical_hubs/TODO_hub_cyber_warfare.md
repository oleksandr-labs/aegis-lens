# Hub — Cyber Warfare

## Progress
- 5 / 5 done

## URLs
- `/cyber-warfare` · `/cyber-warfare/<sub>` (state-actors · APTs · ICS-attacks · psychological-ops)

## Content
- [x] Pillar overview ✓ Sprint 0
- [x] Per-APT profile (KG entity) ✓ Sprint 2.72 — `AptProfile` interface + `TRACKED_APTS` (Sandworm, APT28, Gamaredon, UAC-0056, InvisiMole) + `CYBER_WARFARE_HUB_URLS` in `apps/web/src/lib/hubs/cyber-warfare.ts`
- [x] CERT-UA + MISP feeds ✓ Sprint 2.72 — `CERT_UA_MISP_CONFIG` const (CERT-UA feed URL, MISP API stubs, update intervals) in `apps/web/src/lib/hubs/cyber-warfare.ts`
- [x] Per-region incidents ✓ Sprint 2.72 — `CyberIncidentsByRegion` interface (oblastCode, oblastName EN+UK, incidentCount, latestDate, severity) in `apps/web/src/lib/hubs/cyber-warfare.ts`
- [x] Methodology + attribution caveats ✓ Sprint 2.72 — `ATTRIBUTION_METHODOLOGY` const (4 confidence tiers, 8 evidence types, EN+UK caveats, versioning policy) + `CYBER_WARFARE_FAQ` (10 Q&As) in `apps/web/src/lib/hubs/cyber-warfare.ts`

## Gap flagged 2026-07-12 (round 4 content-gap pass — weak/dispersed, not spec'd as new file)
- [ ] `/cyber-warfare/ics-attacks` URL is reserved but ICS/SCADA attacks (Industroyer/CrashOverride-style grid attacks) only exist today as a TTP tag inside `AptProfile` entries + one generic FAQ answer — no dedicated incident-level tracker (date, specific utility, outage duration, attribution) treating ICS/SCADA attacks as their own first-class event type. Lower-confidence gap than round 4's other findings, similar in shape to round 3's GPS-jamming note — repackage existing APT/FAQ content into a proper incident array when a `TODO/integrations/` source is lined up (e.g. Dragos/E-ISAC-style feed), rather than treating as an isolated content sprint.
