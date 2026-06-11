# TODO — Ads & Sponsored Placements

## Goal
Limited, ethically-bounded ad / sponsored revenue from the **directory** and **non-intelligence** surfaces. Never on map, event detail, alerts, reports — to protect trust.

## Progress
- 9 / 9 done

## Allowed surfaces
- [x] **Companies directory** — sponsored / featured listings → [../features/TODO_sponsored_listings.md](../features/TODO_sponsored_listings.md) — apps/web/src/lib/ads/policy.ts (ALLOWED_AD_SURFACES)
- [x] **Tools / services / experts directory** — sponsored entries (clearly labelled) — apps/web/src/lib/ads/policy.ts (ALLOWED_AD_SURFACES)
- [x] **Programmatic SEO pages** — relevant B2B sponsorship slots — apps/web/src/lib/ads/policy.ts (ALLOWED_AD_SURFACES)
- [x] **Newsletter** — single sponsor / issue, clearly labelled — apps/web/src/lib/ads/policy.ts (ALLOWED_AD_SURFACES)
- [x] **Academy / guides** — partner education sponsorships — apps/web/src/lib/ads/policy.ts (ALLOWED_AD_SURFACES)
- [x] **Job board** (if launched) — paid postings — apps/web/src/lib/ads/policy.ts (ALLOWED_AD_SURFACES)

## Forbidden surfaces
- [x] Map workspace — apps/web/src/lib/ads/policy.ts (FORBIDDEN_AD_SURFACES)
- [x] Event detail pages — apps/web/src/lib/ads/policy.ts (FORBIDDEN_AD_SURFACES)
- [x] Alerts / notifications / push — apps/web/src/lib/ads/policy.ts (FORBIDDEN_AD_SURFACES)
- [x] AI Copilot output — apps/web/src/lib/ads/policy.ts (FORBIDDEN_AD_SURFACES)
- [x] Reports — apps/web/src/lib/ads/policy.ts (FORBIDDEN_AD_SURFACES)
- [x] Embedded widgets on third-party sites — apps/web/src/lib/ads/policy.ts (FORBIDDEN_AD_SURFACES)

## Policy
- [x] No ads from sanctioned entities or weapons-broker categories — apps/web/src/lib/ads/policy.ts (AD_POLICY)
- [x] No ads on safety-critical content (sirens, evacuation, casualty data) — apps/web/src/lib/ads/policy.ts (AD_POLICY)
- [x] All sponsored content visually distinct + labelled "Sponsored" — apps/web/src/lib/ads/policy.ts (AD_POLICY)
- [x] No retargeting of users based on PII / intelligence behavior — apps/web/src/lib/ads/policy.ts (AD_POLICY)
- [x] No third-party ad networks (Google AdSense etc.) — direct only — apps/web/src/lib/ads/policy.ts (AD_POLICY)
- [x] Editorial firewall: ads team cannot influence analyst / intel team — apps/web/src/lib/ads/forbidden-check.ts (AD_EDITORIAL_FIREWALL_EN/UK)

## Mechanics
- [x] Self-serve sponsored-listing checkout — apps/web/src/lib/ads/mechanics.ts (buildSponsoredListingCheckout)
- [x] Sales-led for newsletter / hub sponsorships — apps/web/src/lib/ads/mechanics.ts (AD_MECHANICS)
- [x] CPM / flat-rate options — apps/web/src/lib/ads/mechanics.ts (SPONSORED_SLOT_TYPES)
- [x] Quarterly transparency report listing all sponsors — apps/web/src/lib/ads/mechanics.ts (buildQuarterlyTransparencyReport)

## Linked files
- [../features/TODO_ads_system.md](../features/TODO_ads_system.md)
- [../features/TODO_sponsored_listings.md](../features/TODO_sponsored_listings.md)
- [../directory/](../directory/)

### Примітки
Adv revenue має бути <10% sustainable mix. Mainstream-ads-model = смерть довіри в OSINT-домені.
