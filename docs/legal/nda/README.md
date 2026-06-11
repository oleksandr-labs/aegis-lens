# NDA Templates

Ready-to-send non-disclosure agreement templates for Aegis Lens.

> **Disclaimer.** These are commodity, known-good starting templates intended to
> speed up routine deals. They are **not** a substitute for counsel review on
> material transactions. Do **not** redline our own template defensively — the
> point of a commodity NDA is speed. Escalate to counsel only when the
> counterparty insists on non-standard terms (see the redline notes in each
> file).

## Index

| Template | When to use | File |
| --- | --- | --- |
| Mutual NDA | Both sides exchange confidential information (commercial discussions, partnerships, integrations). **Default for most deals.** | [`mutual-nda.md`](mutual-nda.md) |
| One-way NDA (inbound) | We receive confidential info and disclose little/none (vendor demos, candidate data, leaked-material handling). | [`one-way-nda.md`](one-way-nda.md) |
| Employee NDA + IP assignment | New employees; bundles confidentiality with present-assignment of work-product IP. | [`employee-nda.md`](employee-nda.md) |
| Advisor NDA | Advisors, fractional experts, contractors with light engagement. | [`advisor-nda.md`](advisor-nda.md) |
| Investor NDA | Rarely used — most investors decline, which is normal and not a red flag. Kept for completeness. | [`investor-nda.md`](investor-nda.md) |

## Per-jurisdiction notes

EN is canonical. UK + DE translations available on request (do not auto-generate
legal translations — use a sworn translator for executed copies).

- **US (default governing law: Delaware).** Templates assume Delaware law,
  exclusive jurisdiction in Delaware courts. Trade-secret carve-outs reference
  the DTSA 18 U.S.C. § 1833(b) immunity notice (included in employee NDA — it is
  **required** to preserve exemplary damages and fees against employees).
- **EU / Germany.** German law disfavors overly broad post-term restrictions;
  cap the confidentiality tail at the durations stated (3 years post-term,
  trade secrets for as long as they remain secret). GDPR personal-data exchange
  is governed by a DPA, **not** the NDA — see [`../msa/dpa-addendum.md`](../msa/dpa-addendum.md).
- **UK.** Mirror of US template with `[GOVERNING_LAW] = England and Wales`,
  `[VENUE] = the courts of England and Wales`. UK GDPR same caveat as EU.

## E-signature automation

Send via **Dropbox Sign** (primary) or **DocuSign** (enterprise counterparties
who require it).

- Templates are tokenized with `[BRACKETED_FIELDS]`. Map each to a signature-tool
  merge field. See [`merge-fields.md`](merge-fields.md) for the canonical field
  list and the recommended signing order (counterparty signs first, we
  countersign).
- Store executed copies in the contracts vault (`/legal/executed/nda/`), named
  `YYYY-MM-DD_<counterparty>_<type>.pdf`.
- Log every executed NDA in the contracts register (owner: Ops/Legal).
