# TODO — Integration: CERT-UA + SSSCIP

## Goal
Cyber-incident feed: state CERT advisories, attack indicators, sector warnings.

## Progress
- 11 / 11 done

## Tasks

### Sources
- [x] CERT-UA (cert.gov.ua) — RSS + advisories + Telegram — integrations/cert-ua/src/cert-client.ts (RSS parser + demo fixture; Telegram via @ua-map/telegram Bot API, noted in COMPLIANCE.md §4)
- [x] SSSCIP (cip.gov.ua) — strategic-comms cyber announcements — integrations/cert-ua/src/ssscip-client.ts (RSS + demo fixture)
- [x] StateWatch / MISP feeds (where lawfully accessible) — integrations/cert-ua/src/misp-client.ts (MISP event/attribute model + TLP gating; lawful-access note in COMPLIANCE.md §3)
- [x] Liaison with CERT-UA for partnership — integrations/cert-ua/COMPLIANCE.md §5 (partnership/liaison terms + default-deny gating until signed)

### Pipeline
- [x] Daily advisory ingest — integrations/cert-ua/src/advisory-ingest.ts (daily pipeline; INGEST_CRON="0 5 * * *", retrospective cadence)
- [x] IOCs (Indicators of Compromise) extraction (where published) — integrations/cert-ua/src/ioc-extractor.ts (re-fang + typed IP/domain/url/hash/email/CVE extraction)
- [x] CVE cross-reference — integrations/cert-ua/src/cve-xref.ts (CVE extraction + NVD/MITRE reference links + optional CVSS)
- [x] Per-sector tagging (energy, telecom, finance, gov, media) — integrations/cert-ua/src/sector-tagging.ts (UK+EN keyword classifier + region detection)

### Use in product
- [x] Cyber-layer on map (per-region intensity) — integrations/cert-ua/src/cyber-layer.ts + apps/web/src/app/api/integrations/cert-ua/route.ts (?view=layer); registry id "cyber_incidents" + paint spec proposed in c:\tmp\sprint258_shared_CERT.txt
- [x] CERT advisories feed widget — integrations/cert-ua/src/widget.ts + route ?view=widget (bilingual, with retrospective disclaimer)
- [x] Per-sector threat pages — integrations/cert-ua/src/sector-pages.ts + route ?view=sectors (per-sector stats, actors, IOC roll-up)

## i18n
- UK + EN.

### Примітки
Cyber events are often retrospective. Latency is days, not seconds. Set expectations accordingly.
