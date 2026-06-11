# TODO — White-label & OEM

## Goal
License the platform under partner branding. Newsrooms, security consultancies, defense primes, government agencies embed our analytics under their own name. High-ACV, low-volume, sales-led.

## Progress
- 9 / 9 done

## Tasks
- [x] Define what is white-labelable: UI shell, color/logo, custom domain, custom email-from, custom report templates, embedded widgets — apps/web/src/lib/licensing/white-label.ts
- [x] What is **not** white-labelable: source attribution on individual events, retraction notices, ethical-use disclosures (must always credit primary sources) — apps/web/src/lib/licensing/white-label.ts
- [x] Theming: tokenized design system → see [../design/TODO_styles.md](../design/TODO_styles.md) — apps/web/src/lib/licensing/white-label.ts
- [x] Multi-tenant white-label routing (custom domain → org → theme) → [../platform/TODO_multitenancy.md](../platform/TODO_multitenancy.md) — apps/web/src/lib/licensing/white-label.ts
- [x] Pricing: $5k–50k / mo base + per-seat + per-end-user metering — apps/web/src/lib/licensing/white-label.ts
- [x] Revshare option (partner sells to their customers; we get %) — apps/web/src/lib/licensing/white-label.ts
- [x] White-label legal: MSA addendum, IP rights, brand-usage clauses → [../legal_docs/TODO_msa_template.md](../legal_docs/TODO_msa_template.md) — apps/web/src/lib/licensing/white-label.ts
- [x] Partner program tier (Silver / Gold / Platinum) tied to MRR commit — apps/web/src/lib/licensing/white-label.ts
- [x] Onboarding playbook: branded launch in ≤2 weeks — apps/web/src/lib/licensing/white-label.ts

## Linked files
- [TODO_partner_resell.md](TODO_partner_resell.md)
- [TODO_data_licensing.md](TODO_data_licensing.md)
- [../legal_docs/TODO_partner_reseller.md](../legal_docs/TODO_partner_reseller.md)

### Примітки
White-label != just CSS swap. Це окремий tenancy + governance + legal envelope.
