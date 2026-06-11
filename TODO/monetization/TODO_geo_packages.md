# TODO — Geographic Packages

## Goal
Sell country / region-focused subscriptions at lower price than global tier. Captures buyers who only care about one region.

## Progress
- 7 / 7 done

## Packages
- [x] **Ukraine pack** — UA + 200km buffer; default starter; price-anchored — `apps/web/src/lib/monetization/geo-packages.ts`
- [x] **EU-East pack** (PL, RO, MD, SK, HU, BY, UA) — `apps/web/src/lib/monetization/geo-packages.ts`
- [x] **Black Sea pack** (UA, TR, RO, BG, GE, RU coastal) — `apps/web/src/lib/monetization/geo-packages.ts`
- [x] **MENA pack** (Levant, Gulf, Red Sea) — `apps/web/src/lib/monetization/geo-packages.ts`
- [x] **South China Sea / Indo-Pacific pack** — `apps/web/src/lib/monetization/geo-packages.ts`
- [x] **Sahel pack** (humanitarian-focused) — `apps/web/src/lib/monetization/geo-packages.ts`
- [x] **Global pack** (default for Business+) — `apps/web/src/lib/monetization/geo-packages.ts`

## Mechanics
- [x] Regional pack = Pro features, restricted to AOIs / events inside region — `apps/web/src/lib/monetization/geo-packages.ts` (baseTierId, countries)
- [x] Priced ~60% of global Pro — `apps/web/src/lib/monetization/geo-packages.ts` (globalProDiscountPct: 0.40)
- [x] Upgrade-to-global one-click pro-rated — `apps/web/src/lib/monetization/geo-packages.ts` (getUpgradeToGlobalPrompt)
- [x] Region pack auto-includes vertical add-ons that make sense (maritime auto-includes Black Sea pack discount) — `apps/web/src/lib/monetization/geo-packages.ts` (autoIncludesVerticals: ['maritime'] on black-sea and indo-pacific; ['ngo-humanitarian'] on sahel)

## Linked files
- [TODO_vertical_packages.md](TODO_vertical_packages.md)
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)
- [../i18n/TODO_i18n.md](../i18n/TODO_i18n.md)

### Примітки
Не дробити надто дрібно — кожен pack = окремий SKU + сторінка + L10n. Старт з UA + 2 інших.
