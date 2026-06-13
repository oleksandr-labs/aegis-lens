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
