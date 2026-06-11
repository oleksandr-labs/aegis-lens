# TODO — Tax & VAT Compliance

## Goal
Charge the right tax in the right jurisdiction. Avoid retroactive liabilities.

## Progress
- 8 / 8 done

## Tasks
- [x] Stripe Tax across all relevant jurisdictions → [tax-compliance.md §1](../../docs/billing/tax-compliance.md)
- [x] VAT registration where thresholds hit (EU OSS, UK, Norway, etc.) → §2 (threshold table: EU OSS €10k, UK £90k, NO VOEC, CH CHF100k, AU AUD75k)
- [x] Reverse-charge handling for B2B EU → §3 (VIES verification; invoice note; Article 196 Directive)
- [x] US sales-tax nexus monitoring (TaxJar / Avalara) → §4 (monthly nexus report; counsel before registration)
- [x] Tax-inclusive vs exclusive pricing per region → §5 (US exclusive; EU B2C inclusive; UA exclusive)
- [x] Invoice tax fields per jurisdiction → §6 (VAT reg no., customer VAT ID, itemized rate, jurisdiction, reverse-charge note)
- [x] Annual filings calendar → §7 (EU OSS, UK, NO, US states, CH — deadlines table)
- [x] Counsel on retainer per major jurisdiction → §8 (EU DE, UK, US counsel — "don't be clever" standard)

## i18n
- Tax terminology localized.

### Примітки
A tax-counsel review beats DIY here. Don't be clever.

### Done notes (2026-05-30)
[docs/billing/tax-compliance.md](../../docs/billing/tax-compliance.md).
US nexus monitoring is a monthly Finance gate (register before nexus, not after).
SaaS taxability varies by US state — counsel confirms before invoicing.
