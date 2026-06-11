# TODO — Master Services Agreement (MSA) Template

## Goal
Enterprise-ready MSA that closes sales without month-long redlines.

## Progress
- 8 / 8 done

## Tasks
- [x] Base MSA (counsel-drafted) → [docs/legal/msa/base-msa.md](../../docs/legal/msa/base-msa.md) *(template drafted; counsel review still required before first use)*
- [x] DPA addendum → [docs/legal/msa/dpa-addendum.md](../../docs/legal/msa/dpa-addendum.md) (GDPR/UK GDPR, SCCs, Annexes I–III, source-data carve-out)
- [x] SLA addendum (per tier) → [docs/legal/msa/sla-addendum.md](../../docs/legal/msa/sla-addendum.md) (Standard/Pro/Enterprise uptime + credits)
- [x] BAA template (where applicable) → [docs/legal/msa/baa.md](../../docs/legal/msa/baa.md) (HIPAA; flagged as rarely needed)
- [x] Order form template → [docs/legal/msa/order-form.md](../../docs/legal/msa/order-form.md)
- [x] Common-redline playbook (which clauses are negotiable) → [docs/legal/msa/redline-playbook.md](../../docs/legal/msa/redline-playbook.md) (traffic-light + hard-never list)
- [x] Per-jurisdiction variants (US, EU, UK) → [docs/legal/msa/jurisdiction-variants.md](../../docs/legal/msa/jurisdiction-variants.md)
- [x] Markdown/PDF generation pipeline → [docs/legal/msa/pdf-pipeline.md](../../docs/legal/msa/pdf-pipeline.md) (token merge → strip-internal → branded PDF → e-sign)

## i18n
- EN canonical; UK + DE + FR translations available.

### Примітки
Don't paste customer paper without counsel. One bad indemnity ruins us.

### Done notes (2026-05-30)
Full modular bundle under `docs/legal/msa/` with an index README showing how the
pieces fit (Order Form → MSA → DPA/SLA/BAA addenda). MSA carries a 12-month
liability cap, IP indemnity, "outputs are assessments not guarantees" warranty,
and rejection of customer PO terms. Redline playbook + jurisdiction variants let
the deal team self-serve on standard concessions. **Base MSA + DPA + BAA need
counsel sign-off before execution** — these are negotiation-ready drafts.
