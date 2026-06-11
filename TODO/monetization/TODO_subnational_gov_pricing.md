# TODO — Sub-national / Municipal / Oblast Pricing

## Goal
Sell to oblasts, regions, cities, provincial governments, emergency services — not just national governments. Smaller deal sizes, but many more buyers; aligns with civic-safety mission (sirens, evacuation, hazard maps).

## Progress
- 7 / 7 done

## Buyer types
- [x] Oblast / regional administration (UA + analogs) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_BUYER_PERSONAS['oblast-regional-admin'])
- [x] City emergency-operations centers — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_BUYER_PERSONAS['city-emergency-operations'])
- [x] National guard / civil defense units — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_BUYER_PERSONAS['national-guard-civil-defense'])
- [x] Hospitals / critical-infra operators — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_BUYER_PERSONAS['hospitals-critical-infra'])
- [x] Education ministries (school safety) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_BUYER_PERSONAS['education-ministry'])
- [x] Border services — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_BUYER_PERSONAS['border-services'])
- [x] Embassies / consulates of allied countries — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_BUYER_PERSONAS['embassy-allied-country'])

## Pricing models
- [x] Per-population-served tier ($X / 100k residents / yr) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_CONTRACTS['per-population'])
- [x] Flat regional contract ($25k–250k / yr) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_CONTRACTS['flat-regional'])
- [x] Public-safety grant pricing (heavily discounted, public funding tap) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_CONTRACTS['public-safety-grant'])
- [x] Pilot programs (free 6 months → contract) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_CONTRACTS['pilot-free'])

## Inclusions
- [x] Custom sirens / alerts integration with regional infra — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_INCLUSIONS)
- [x] Region-restricted data scope (mostly their region + buffer) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_INCLUSIONS)
- [x] Local-language UI + bots — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_INCLUSIONS)
- [x] Training for staff — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_INCLUSIONS)
- [x] Annual review with regional authorities — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_INCLUSIONS)

## Constraints
- [x] Distinct from national-gov procurement — much shorter sales cycles — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_CONSTRAINTS)
- [x] No defense / offensive-use data access for civilian agencies — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_CONSTRAINTS)
- [x] Public transparency on contract value (where local law requires) — apps/web/src/lib/pricing/subnational.ts (SUBNATIONAL_CONSTRAINTS)

## Linked files
- [TODO_tiers_matrix.md](TODO_tiers_matrix.md) (Gov tier reference)
- [TODO_geo_packages.md](TODO_geo_packages.md)
- [../audiences/TODO_governments_defense.md](../audiences/TODO_governments_defense.md)

### Примітки
Sub-national — найшвидші угоди в гос-сегменті. Багато sub-100k контрактів складають значний MRR.
