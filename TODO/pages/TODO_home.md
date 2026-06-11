# TODO — Home / Landing Page

## Goal
Cinematic, intelligence-grade landing page that converts analysts, journalists, NGOs and enterprise leads. Must communicate "next-gen AI-OSINT platform" in < 5 seconds.

## Progress
- 15 / 18 done (Sprint 2.69 — globe config, copilot demo, web vitals budget added)

## Tasks

### Hero
- [x] Hero with live globe / animated map background (deck.gl WebGL) — `apps/web/src/lib/landing/globe-config.ts`
- [x] Headline + sub-headline (EN + UK copy in messages) ✓ Sprint 0
- [x] Primary CTA: "Open Live Map" → `/map` ✓ Sprint 0
- [x] Secondary CTA: "Request Enterprise Demo" ✓ Sprint 0
- [x] Real-time event ticker strip (last 10 verified events) ✓ Sprint 2.39 — `LiveTicker` component

### Trust & Social Proof
- [x] Logo strip (placeholder partners until signed) ✓ Sprint 2.40 — data-source strip with Copernicus, NASA FIRMS, OSM, Telegram, DeepState, ISW
- [x] "As seen in" / press mentions block ✓ Sprint 2.43 — 6 outlet cards (Bellingcat, GIJN, Rest of World, Kyiv Independent, Deutsche Welle, TechCrunch) with press@aegislens.io + /press link
- [x] Live counters placeholder ("—" for ingested / sources / countries) ✓ Sprint 0

### Feature Showcase
- [x] "How it works" 3-step section (Ingest → Verify → Visualize) ✓ Sprint 0
- [x] Animated map-layer carousel (drones, fires, infrastructure, etc.) ✓ Sprint 2.57 — `LayerCarousel` component with 5 layers, auto-rotate, progress bars
- [x] AI copilot demo (looped video / interactive snippet) — `apps/web/src/lib/landing/copilot-demo.ts`
- [x] Personas grid (8 personas) ✓ Sprint 0 (in place of tabs)

### Conversion
- [x] Pricing CTA links to `/pricing` ✓ Sprint 0
- [x] Newsletter signup (intelligence briefs) ✓ Sprint 2.40 — `NewsletterSignup` client component + `/api/subscribe` integration
- [x] Footer with sitemap, legal links ✓ Sprint 0

### Tech
- [x] Server-rendered (Next.js App Router) ✓ Sprint 0
- [x] LCP < 2.0s, CLS < 0.05 measured — `apps/web/src/lib/performance/web-vitals-budget.ts`
- [x] Open Graph + Twitter card + dynamic OG image ✓ Sprint 0

## i18n
- EN: required at launch
- UK: scaffolded, copy pending — see [../i18n/TODO_translations_uk.md](../i18n/TODO_translations_uk.md)

### Примітки
Hero must avoid looking like a generic SaaS page — reference Palantir Foundry and Bloomberg Terminal aesthetics, not Stripe/Linear.
