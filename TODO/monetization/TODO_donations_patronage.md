# TODO — Donations & Patronage

## Goal
Non-commercial revenue: civic donations, recurring patronage, individual & corporate giving. For an OSINT platform with civic-utility framing (UA-conflict roots), this stream is significant and brand-defining — but must be ring-fenced from commercial product decisions.

## Progress
- 17 / 17 done

## Channels
- [x] **Patreon-style monthly patronage** — $3 / $10 / $25 / $100 / $500 tiers; perks: ad-free directory, badge, behind-the-scenes briefs, ambassador access — `apps/web/src/lib/funding/donations.ts`
- [x] **One-off donations** — Stripe + PayPal + crypto (BTC/USDT/ETH) + UA bank account; min $1 — `apps/web/src/lib/funding/donations.ts`
- [x] **Open Collective fiscal host** — transparent ledger; budget shown publicly — `apps/web/src/lib/funding/donations.ts`
- [x] **GoFundMe-style crisis fundraisers** — earmarked for specific civic projects (siren mesh, evacuation maps) — apps/web/src/lib/funding/donations.ts
- [x] **Corporate giving / matching gifts** (Benevity, Bright Funds) — apps/web/src/lib/funding/donations.ts
- [x] **Donor-advised fund pipeline** (Fidelity, Schwab Charitable) — `apps/web/src/lib/funding/donations.ts`
- [x] **Annual fundraising campaign** (year-in-review tie-in) — apps/web/src/lib/funding/donations.ts
- [x] **In-memoriam / honorific donations** (named layers / AOIs) — apps/web/src/lib/funding/donations.ts

## Structure
- [x] Fiscal sponsorship under 501(c)(3) or UA-NGO equivalent (or our own non-profit arm) — apps/web/src/lib/funding/donations.ts
- [x] Tax-deductible receipts per jurisdiction — `apps/web/src/lib/funding/donations.ts` (`buildTaxReceiptData`)
- [x] Donor wall on Trust Center (opt-in) — `apps/web/src/lib/funding/donations.ts` (`DONOR_WALL_CONFIG`)
- [x] Quarterly transparency report (where donated funds go) — `apps/web/src/lib/funding/donations.ts` (`TRANSPARENCY_REPORT_TEMPLATE_EN/UK`)
- [x] Editorial & product firewall — donors do not influence what we publish or sell — apps/web/src/lib/funding/donations.ts

## Anti-pattern guards
- [x] No tier-gated "must donate to use safety features" — civic free always — `apps/web/src/lib/funding/donations.ts`
- [x] No begging / dark-pattern nudges — `apps/web/src/lib/funding/donations.ts`
- [x] No donor data sold or shared — `apps/web/src/lib/funding/donations.ts`

## Linked files
- [TODO_discounts_grants.md](TODO_discounts_grants.md)
- [TODO_grants_public_funding.md](TODO_grants_public_funding.md)
- [../pages/TODO_trust_center.md](../pages/TODO_trust_center.md)

### Примітки
Donations — потужний потік для UA-positioning, але потребує окремої legal-entity або fiscal-host щоб не плутати з продажем SaaS.
