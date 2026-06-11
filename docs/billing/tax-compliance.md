# Tax & VAT Compliance

> Charge the right tax in the right jurisdiction. Avoid retroactive liabilities.
> **A tax-counsel review beats DIY here. Don't be clever.**

## 1. Stripe Tax across all relevant jurisdictions

- **Stripe Tax** is the primary automated tax calculation layer for B2C and
  non-VAT-registered B2B customers.
- Enabled on all Stripe products/prices; configured to auto-detect the customer's
  tax jurisdiction from billing address and IP.
- Stripe Tax calculates, collects, and reports to Stripe's tax dashboard —
  providing the data needed for filings, but **not filing on our behalf** (see §7).
- Review the Stripe Tax configuration after entering any new jurisdiction or
  adding a new product type (tax treatment can differ).

## 2. VAT registration — where required

| Regime | Trigger threshold | Action |
| --- | --- | --- |
| **EU OSS** (One-Stop Shop) | > €10,000 B2C revenue from EU customers in a calendar year | Register for EU OSS VAT; file quarterly returns |
| **UK VAT** | > £90,000 taxable turnover in a 12-month rolling window | Register with HMRC; file quarterly returns |
| **Norway VAT (VOEC)** | Any B2C digital sales to Norwegian customers | Register under VOEC; file quarterly |
| **Switzerland VAT** | > CHF 100,000 global revenue + any CH customers | Register with ESTV; file quarterly |
| **Australia GST** | > AUD 75,000 from AU customers | Register with ATO; file quarterly |

- Finance monitors thresholds monthly via Stripe Tax reports.
- Counsel per jurisdiction advises on registration timing and scope.
- Tax registrations and their IDs are recorded in the finance register.

## 3. Reverse-charge for B2B EU customers

- For **B2B transactions** where the customer is VAT-registered in an EU member
  state (and we are established outside that state):
  - Invoice excludes VAT (zero-rated with reverse-charge notation).
  - Customer's VAT ID is collected and verified (EU VIES) before applying
    reverse-charge.
  - Invoice note: *"VAT reverse-charge applies — the recipient is liable for
    the VAT under Article 196 of Directive 2006/112/EC."*
- Stripe handles this automatically when the customer's VAT ID is stored and
  verified in their profile ([invoicing.md §3](invoicing.md#3-custom-invoice-fields-per-customer)).
- Keep VIES verification records for each reverse-charge invoice (audit evidence).

## 4. US sales-tax nexus monitoring (TaxJar / Avalara)

- US sales tax is state-level and complex. We use **TaxJar** (or Avalara as an
  alternative) as a nexus-monitoring and filing layer alongside Stripe Tax.
- Nexus can be triggered by: economic nexus (revenue > state threshold, typically
  $100k/200 transactions), physical presence (employees, servers in a state), or
  a marketplace transaction.
- TaxJar monitors state-by-state revenue and flags approaching thresholds.
- **Finance reviews the nexus report monthly** and engages tax counsel to
  register and file before nexus is triggered (not after).
- SaaS treatment varies by state — counsel confirms taxability of our specific
  product in each jurisdiction before registration.

## 5. Tax-inclusive vs. exclusive pricing per region

| Region | Display convention | Stripe configuration |
| --- | --- | --- |
| US | Exclusive (tax added at checkout) | Prices exclusive; Stripe Tax adds on top |
| EU (B2C) | Inclusive (VAT already in the price) | Prices inclusive; Stripe Tax extracts |
| EU (B2B) | Exclusive + reverse-charge note | As §3 |
| UK | Inclusive (B2C) / Exclusive + note (B2B) | Per customer type |
| Ukraine | Exclusive (VAT shown separately) | Exclusive |

The pricing page must accurately reflect the display convention per region
(front-end locale detection) so customers see the price they'll be charged.

## 6. Invoice tax fields per jurisdiction

Each invoice must include (where required by local law):
- Our VAT / tax registration number for the relevant jurisdiction
- Customer's VAT / tax ID (for B2B)
- Tax amount and rate, itemized per line
- Tax jurisdiction
- Reverse-charge / zero-rate notation where applicable

These fields are rendered automatically from Stripe Tax data. The branded PDF
invoice template ([invoicing.md §2](invoicing.md#2-po-number-support-enterprise--government))
uses locale-correct tax terminology ("МwSt", "TVA", "VAT", "ПДВ").

## 7. Annual filings calendar

Finance owns a **tax-filings calendar** for every jurisdiction where we are
registered:

| Jurisdiction | Filing period | Filing due |
| --- | --- | --- |
| EU OSS | Quarterly | Last day of month following quarter-end |
| UK VAT | Quarterly | 1 month + 7 days after quarter-end |
| Norway VOEC | Quarterly | 20th of month following quarter-end |
| US state(s) | Varies (monthly/quarterly/annual by state) | Per state schedule |
| Switzerland | Quarterly | 60 days after quarter-end |

Finance uses TaxJar / Stripe Tax reports to prepare returns; counsel or a local
tax agent reviews and files for each jurisdiction. Filing deadlines are tracked in
the Finance calendar with `[14-day]` reminders.

## 8. Counsel on retainer per major jurisdiction

- **EU** (German tax counsel covers DE; French counsel for FR filings): retained
  for OSS review, registration advice, and audit representation.
- **UK**: UK VAT specialist on retainer (HMRC audits are possible if VAT
  registration is large).
- **US**: US tax counsel on retainer for nexus determinations and state filing
  review (multi-state is complex enough that DIY = liability).

Counsel rates the "do not be clever" standard — anytime a tax treatment is
ambiguous (e.g., is our AI-enriched data feed a "digital service" or a "data
product" in this jurisdiction?), counsel advises before we invoice.
