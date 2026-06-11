# TODO — Competitive Pricing & Anchoring

## Goal
Pricing relative to competitors: where we anchor cheap, where we anchor premium, where we are deliberately middle. Drives positioning and sales counter-narratives.

## Progress
- 8 / 8 done

## Comp landscape (positioning)

| Competitor | Their price | Their tier | Our anchor strategy |
|---|---|---|---|
| **LiveUAmap Pro** | ~$25 / mo | mid | We compete head-on at Observer/Pro; emphasize verification + AI |
| **Janes** | $$$ enterprise | top | We undercut on price by ≥40% at Enterprise; emphasize freshness |
| **Recorded Future** | $$$ enterprise ($100k+) | top | We undercut at Business; emphasize transparent confidence scoring |
| **Palantir Foundry** | enterprise only | top | We bring SaaS speed + price; don't compete on RFP-heavy contracts |
| **Bellingcat (open)** | free / donation | n/a | We honor mission; differentiate via real-time + tooling, not vs them |
| **ACLED** | data-license $$$ | data only | We compete via richer realtime + UI |
| **Maxar / Planet** | per-scene | data only | We resell + add analytics layer |
| **Flashpoint / SocialNet** | $$$ enterprise | top | We compete on Pro/Team self-serve |
| **OSINT Combine, Echosec, etc** | various | mid | Self-serve match + AI differentiation |

## Anchoring tactics
- [x] **Pro anchored at "less than 1 hour of analyst time / mo"** ($49/mo ≈ $50/h) — apps/web/src/lib/pricing/competitive.ts
- [x] **Team anchored at "less than 1 day of analyst time / mo"** (~$500) — apps/web/src/lib/pricing/competitive.ts
- [x] **Business anchored at "less than 1 week of senior analyst / mo"** (~$3k) — apps/web/src/lib/pricing/competitive.ts
- [x] **Enterprise anchored at "10% of comparable RFP contract from incumbent"** — apps/web/src/lib/pricing/competitive.ts
- [x] **Always show a higher-priced option** next to recommended (decoy effect) — apps/web/src/lib/pricing/competitive.ts
- [x] **Annual price displayed as monthly equivalent** + savings call-out — apps/web/src/lib/pricing/bundling.ts

## Counter-narrative arsenal (for sales)
- [x] "Real-time + verification" vs "speed without verification" (LiveUAmap) — apps/web/src/lib/pricing/competitive.ts
- [x] "Transparent confidence" vs "black-box score" (RF) — apps/web/src/lib/pricing/competitive.ts
- [x] "Self-serve start" vs "12-month procurement" (Palantir/Janes) — apps/web/src/lib/pricing/competitive.ts
- [x] "AI-native UX" vs "legacy console" — apps/web/src/lib/pricing/competitive.ts
- [x] "Civic-mission backbone" vs "purely commercial intel" — credibility moat — apps/web/src/lib/pricing/competitive.ts

## Updates
- [ ] Quarterly competitive-pricing refresh — track public price changes
- [ ] Annual win/loss analysis → adjust anchor

## Linked files
- [TODO_pricing_principles.md](TODO_pricing_principles.md)
- [../product/TODO_competitors.md](../product/TODO_competitors.md)
- [../pages/TODO_comparisons.md](../pages/TODO_comparisons.md)

### Примітки
Ціна — частина позиціювання, не самостійне рішення. Кожен tier має «proxy» в розмов: «дешевше за година аналітика», «10% від RFP-конкурента».
