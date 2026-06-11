# Sprint 2.34 — Progress

**Theme:** Atom + JSON Feed parity for `/topics/<slug>`, per-locale topic JSON Feeds, `_aegis` extension docs, configurable radius on `/companies-near/<city>`.

**Date:** 2026-05-24

**Method:** Solo, no parallel agents.

---

## Delivered

### Topic feeds: Atom + per-locale parity
- [x] `/topics/<slug>/atom.xml` (EN) and `/[locale]/topics/<slug>/atom.xml` per-locale.
- [x] `/[locale]/topics/<slug>/feed.json` per-locale variant — EN canonical was already shipped in 2.33.
- [x] All three formats (RSS + Atom + JSON) now share a `lib/topic-feed.ts` module that exposes `buildTopicAtomFeed` and `buildTopicJsonFeed`. RSS continues to use the older `buildRssFeedFiltered` for backwards compatibility.
- [x] URL helpers added: `urls.topicAtom`, `urls.topicAtomLocale`, `urls.topicJsonLocale`. Sitemap surfaces all locale × format combinations.

### `_aegis` extension docs
- [x] `/docs/api` now has a dedicated "Feeds" section explaining the three wire formats and the JSON Feed `_aegis` extension shape — separate sub-shapes for event items vs investigation items.
- [x] Links to JSON Feed §6 extensions spec so consumers understand why underscore-prefixed keys are safe.

### Configurable radius on `/companies-near/<city>`
- [x] `?r=` query parameter accepts `100`, `250`, `500`, `1000`, `2500` — default `500` km matches the prior hardcoded behavior.
- [x] Radius chip-bar rendered above the "Within X km" section; the chip for the current radius is highlighted via `aria-current="page"` and styled accordingly.
- [x] Non-default radii are noindexed and the canonical URL stays parameter-free, so search engines don't see duplicate-content variants. Default (500 km) URL omits the param entirely.
- [x] Graceful empty-state copy ("No other catalogued companies within X km. Try a wider radius.") when the chosen radius is too tight.

---

## Files touched

New:
- `apps/web/src/lib/topic-feed.ts`
- `apps/web/src/app/topics/[slug]/atom.xml/route.ts`
- `apps/web/src/app/[locale]/topics/[slug]/atom.xml/route.ts`
- `apps/web/src/app/[locale]/topics/[slug]/feed.json/route.ts`
- `TODO/SPRINT_2_34_PROGRESS.md`

Edited:
- `apps/web/src/app/topics/[slug]/feed.json/route.ts` — collapsed to call `buildTopicJsonFeed`
- `apps/web/src/app/[locale]/docs/api/page.tsx` — Feeds + `_aegis` documentation section
- `apps/web/src/app/[locale]/companies-near/[city]/page.tsx` — radius chip-bar + noindex variants
- `apps/web/src/app/sitemap.ts` — Atom + JSON topic feed URLs (EN + per-locale)
- `packages/url-builder/src/index.ts` — `topicAtom`, `topicAtomLocale`, `topicJsonLocale`
- `TODO/SPRINT_2_33_PROGRESS.md` — closed 4 follow-ups

---

## TODO bookkeeping
- `TODO/SPRINT_2_33_PROGRESS.md` — topic Atom, topic per-locale JSON, `_aegis` docs, configurable radius all closed

## Open follow-ups
- [ ] Methodology eval-results section (needs a real eval pipeline)
- [ ] Localize methodology / scoring / sanctions-entity / threats copy to UK
- [ ] Real audio / video hosting + Apple Podcasts directory submission
- [ ] LLM-driven commentary infrastructure (SSE stream is ready)
- [ ] Validate the YAML render against `redocly lint` in CI to catch spec regressions
- [x] Atom + JSON Feed for `/regions/<country>/<oblast>/feed.xml` to bring regional feeds up to parity — ✓ Sprint 2.35
- [ ] More HQ-city coordinates as the directory grows (current `CITY_COORDS` only covers the 20 cities in seed)
- [x] Distance-based sort option on `/companies-near/<city>` main listing — ✓ Sprint 2.35 (`?sort=distance`, noindexed)
- [x] `_aegis.subclass` + `_aegis.location` should be added to the OpenAPI JSON Feed response shape too — ✓ Sprint 2.35 (`JsonFeed` / `JsonFeedItem` / `JsonFeedAegisEvent` schemas added)
