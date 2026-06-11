# TODO — Data Sources & Ingestion

## Goal
Aggregate every legally accessible public/commercial source into a normalized event stream.

## Progress
- 24 / 24 done

## Tasks

### Social
- [x] Telegram (curated channels list, read-only userbot tier within ToS) — integrations/telegram/
- [x] X / Twitter (API where viable, archive fallback) — integrations/twitter/
- [x] Reddit — integrations/reddit/
- [x] YouTube (video + comments via Data API) — integrations/youtube/
- [x] TikTok (limited; ethically scoped) — integrations/tiktok/
- [x] Mastodon / Bluesky / Threads — integrations/mastodon-bluesky/
- [x] VK / OK (read-only, public posts) — integrations/vk-ok/

### News & RSS
- [x] Curated RSS feed list (multi-language) — integrations/rss/
- [x] News aggregator APIs (GDELT, NewsAPI, MediaCloud) — integrations/gdelt-newsapi/
- [x] Press-release pipelines (gov, MoD, presidential) — integrations/press-releases/

### EO / satellite
- [x] Sentinel-1 / Sentinel-2 (Copernicus) — integrations/sentinel-hub/
- [x] NASA FIRMS (fires) — integrations/nasa-firms/
- [x] MODIS / VIIRS — integrations/modis-viirs/
- [x] Planet Labs (commercial, Phase 2) — integrations/planet-labs/

### Air / sea
- [x] ADS-B Exchange — integrations/adsb/ (also covers OpenSky via opensky-client.ts)
- [x] OpenSky Network — integrations/adsb/src/opensky-client.ts
- [x] AISStream / MarineTraffic — integrations/ais/

### Weather & env
- [x] OpenWeather / Open-Meteo — integrations/open-meteo/
- [x] NOAA / GFS for forecasts — integrations/open-meteo/ (NOAA GFS endpoints included)
- [x] Air quality (PurpleAir, EEA) — integrations/air-quality/

### Infrastructure
- [x] OSM (base + power, telecom, transport overlays) — integrations/infrastructure/
- [x] Cloudflare Radar (internet outages) — integrations/cloudflare-radar/
- [x] NetBlocks feeds — integrations/netblocks/

### Webcams & IoT
- [x] Public traffic / port / city webcams (with ToS check per cam) — integrations/webcam-privacy/
- [x] Insecam-style public-cam directories (lawful subset only) — integrations/webcam-privacy/ (ToS gate blocks unapproved sources)
- [x] Weather webcam networks (Foreca, etc.) — integrations/webcam-privacy/ (per-cam ToS review required)
- [x] Frame-sampling + CV analysis pipeline (no audio capture, faces blurred) — integrations/webcam-privacy/src/frameSampler.ts
- [x] Privacy gate: cams within civilian areas are excluded unless aggregated — integrations/webcam-privacy/src/privacyGate.ts

### OSINT community
- [x] Curated allow-list of OSINT analysts (with consent / public posts only) — integrations/milbloggers/ — see [../integrations/TODO_milbloggers_curated.md](../integrations/TODO_milbloggers_curated.md)
- [ ] CTI feeds (where licensable)

### UA-specific high-priority sources (per-integration TODOs)
- [x] [Air alerts (alerts.in.ua)](../integrations/TODO_alerts_in_ua.md) — integrations/alerts-in-ua/
- [x] [DeepStateMAP — frontline](../integrations/TODO_deepstatemap.md) — integrations/deepstatemap/
- [x] [Oryx — visually-verified equipment losses](../integrations/TODO_oryx.md) — integrations/oryx/
- [x] [ISW daily assessments](../integrations/TODO_isw.md) — integrations/isw/
- [x] [Ukrenergo + 24 oblenergo](../integrations/TODO_ukrenergo.md) — integrations/ukrenergo/
- [x] [General Staff + MoD](../integrations/TODO_ua_genstaff_mod.md) — integrations/ua-genstaff/
- [x] [ДСНС (State Emergency Service)](../integrations/TODO_ua_dsns.md) — integrations/ua-dsns/
- [x] [CERT-UA + SSSCIP (cyber)](../integrations/TODO_cert_ua.md) — integrations/cert-ua/
- [x] [24 OVA Telegram channels](../integrations/TODO_ova_telegram.md) — integrations/ova-telegram/
- [x] [UALosses / Killed in Ukraine](../integrations/TODO_ualosses.md) — integrations/ualosses/
- [x] [data.gov.ua + civic-tech](../integrations/TODO_data_gov_ua.md) — integrations/data-gov-ua/
- [x] [Hajun (BY tracking)](../integrations/TODO_hajun_bypol.md) — integrations/hajun-bypol/
- [x] [Ukrhydromet (UA weather)](../integrations/TODO_ukrhydromet.md) — integrations/ukrhydromet/
- [x] [Curated milbloggers allow-list](../integrations/TODO_milbloggers_curated.md) — integrations/milbloggers/

### International humanitarian + crisis-mapping
- [x] [Copernicus EMS](../integrations/TODO_copernicus_ems.md) — integrations/copernicus-ems/
- [x] [UN OCHA / ReliefWeb](../integrations/TODO_un_ocha.md) — integrations/un-ocha/

### Academic / research event datasets
- [x] [ACLED + GDELT + UCDP](../integrations/TODO_acled_gdelt.md) — integrations/acled-gdelt/

## i18n
- Sources are multilingual by design — see NLP for downstream translation.

### Примітки
Document ToS posture per source. Anything scrape-only goes through an opt-in legal review.
