# TODO — Invoicing

## Goal
Customer-grade invoices that pass procurement scrutiny.

## Progress
- 9 / 9 done

## Tasks
- [x] Stripe Invoicing for subscriptions + add-ons → [invoicing.md §1](../../docs/billing/invoicing.md)
- [x] PO number support (enterprise / gov) → §2 (PO in Stripe metadata + branded PDF template for gov)
- [x] Custom invoice fields per customer (entity name, VAT ID) → §3
- [x] Multi-currency invoice (USD, EUR, UAH, GBP) → §4 (UAH for UA gov/NGO customers)
- [x] PDF + email delivery → §5 (auto + CC addresses + re-send on request)
- [x] Invoice portal for customers → §6 (Stripe Customer Portal)
- [x] Past-due automation (dunning) → §7 (→ [dunning-refunds.md](../../docs/billing/dunning-refunds.md))
- [x] Receipts archived 7y (compliance) → §8 (Stripe immutable + S3 backup; annual completeness check)
- [x] Wire / ACH support for enterprise → §9 (bank transfer, SEPA DD; wire instructions on invoice)

## i18n
- Invoice templates localized; VAT terminology per jurisdiction.

### Примітки
Gov procurement will reject auto-Stripe invoices. Custom invoice flow required.

### Done notes (2026-05-30)
[docs/billing/invoicing.md](../../docs/billing/invoicing.md).
Key: branded PDF override for gov PO flow; UAH currency for Ukrainian customers.
