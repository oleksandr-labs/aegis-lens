# TODO — Third-Party Integrations

## Goal
Wire up all external services for ingest, AI, comms, billing, and ops.

## Progress
- 27 / 27 done

Many integrations were built in Sprints 2.57–2.60; Sprint 2.63 audited, cited, and closed the remaining gaps (MapTiler/OSM fallback, What3words, Planet Labs, BlackSky/Capella, HuggingFace, DeepL/Lingvanex, Resend/Postmark, PostHog, RSS aggregator, OSINT community feeds, Plausible).

## Tasks

### Maps & geo
- [x] Mapbox (base tiles, styles) — `integrations/mapbox/` (Sprint 2.60)
- [x] MapTiler / OSM (fallback / cost hedge) — `integrations/maptiler/src/client.ts` (Sprint 2.63)
- [x] Nominatim self-hosted geocoder — `services/geo/src/geocoder.ts` (Sprint 1.x)
- [x] What3words (optional) — `integrations/what3words/src/client.ts` (Sprint 2.63)

### Satellite & EO
- [x] Sentinel Hub / Copernicus — `integrations/sentinel-hub/` (Sprint 2.57)
- [x] NASA FIRMS (fire) — `integrations/nasa-firms/` (Sprint 2.57)
- [x] Planet Labs (commercial, Phase 2) — `integrations/planet-labs/src/client.ts` (Sprint 2.63)
- [x] BlackSky / Capella (commercial, Phase 3) — `integrations/blacksky-capella/src/client.ts` (Sprint 2.63)

### Aviation / maritime
- [x] ADS-B Exchange — `integrations/adsb/` (Sprint 2.57)
- [x] OpenSky Network — `integrations/adsb/` (co-located with ADS-B Exchange, Sprint 2.57)
- [x] AISStream / MarineTraffic (commercial) — `integrations/ais/` (Sprint 2.57)

### Social / OSINT
- [x] Telegram (read-only via bot/userbot tier) — `integrations/telegram/` (Sprint 2.58)
- [x] X/Twitter API (where viable) — `integrations/twitter/` (Sprint 2.59)
- [x] Reddit API — `integrations/reddit/` (Sprint 2.59)
- [x] YouTube Data API — `integrations/youtube/` (Sprint 2.59)
- [x] RSS aggregator — `integrations/rss/src/client.ts` (Sprint 2.63)
- [x] OSINT community feeds (curated) — `integrations/osint-feeds/src/registry.ts` + `aggregator.ts` (Sprint 2.63)

### AI providers
- [x] Anthropic Claude (primary LLM) ✓ Sprint 1.3 (lib/llm.ts + /api/copilot, fake-mode fallback)
- [x] OpenAI (secondary) — `integrations/llm-providers/` (Sprint 2.60)
- [x] HuggingFace inference / self-hosted (vision, OCR) — `integrations/huggingface/src/client.ts` (Sprint 2.63)
- [x] DeepL / Lingvanex (translation) — `integrations/translation/src/deepl.ts` + `lingvanex.ts` (Sprint 2.63)

### Comms
- [x] Email: Resend / Postmark — `integrations/email-provider/src/index.ts` (Sprint 2.63)
- [x] Slack app — `integrations/slack/` (Sprint 2.58)
- [x] Telegram bot — `integrations/ova-telegram/` (Sprint 2.59)

### Billing & analytics
- [x] Stripe (+ Stripe Tax) — `integrations/stripe/` (Sprint 2.60)
- [x] PostHog (product analytics) — `integrations/posthog/src/client.ts` (Sprint 2.63)
- [x] Plausible (web analytics, GDPR-friendly) — `services/tracking/plausible.ts` (Sprint 2.63)

## i18n
- Translation provider integration is critical — see [../i18n/TODO_i18n.md](../i18n/TODO_i18n.md).

### Примітки
Track ToS compliance per source — some are scrape-hostile. COMPLIANCE.md files are co-located in each integration package.
