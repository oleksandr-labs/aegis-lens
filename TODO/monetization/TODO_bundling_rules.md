# TODO — Bundling Rules

## Goal
How tiers, add-ons, packs, services and credits combine, and when discounts auto-apply.

## Progress
- 8 / 8 done

## Rules
- [x] **3+ add-ons** stacked → 15% bundle discount — apps/web/src/lib/pricing/bundling.ts
- [x] **5+ add-ons** → 25% bundle discount — apps/web/src/lib/pricing/bundling.ts
- [x] **Vertical pack** auto-bundles its relevant add-ons → priced at sum-of-parts minus 20% — apps/web/src/lib/pricing/bundling.ts
- [x] **Annual billing** → 20% off any plan (industry-standard) — apps/web/src/lib/pricing/bundling.ts
- [x] **2-year commit** → 30% off + price lock — apps/web/src/lib/pricing/bundling.ts
- [x] **Seat tiers** — 5–9 seats: list; 10–24: 10% off; 25–49: 20% off; 50+: contract — apps/web/src/lib/pricing/bundling.ts
- [x] **API + SaaS bundle** — API add-on free up to Pro quota if on Team+ — apps/web/src/lib/pricing/bundling.ts
- [x] **Reports + SaaS bundle** — monthly report sub free on Business+ — apps/web/src/lib/pricing/bundling.ts

## Mechanics
- [ ] Bundle pricing computed at checkout, transparent line items
- [ ] No discount stacking beyond defined rules (no "edu + annual + bundle = 70% off")
- [ ] Promo codes are tracked separately (campaign attribution)
- [ ] Internal sales discount cap: 25% without VP approval

## Linked files
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md)
- [TODO_addons_modules.md](TODO_addons_modules.md)
- [TODO_vertical_packages.md](TODO_vertical_packages.md)
- [TODO_credits_wallet.md](TODO_credits_wallet.md)

### Примітки
Bundling — це pricing-page complexity. Не вводити правила, які не вміщаються в один заголовок.
