# Aegis Lens — Brand Governance v1.0

**Status:** v1.0 — Sprint 2.39 (2026-05-24). Owner: Brand lead + Legal.
**Pair with:** `BRAND_BOOK.md`, `pre_dev_setup/TODO_trademark.md`, `partnerships_specs/`.

---

## 1. Goal

Catch off-brand work before it ships. Defend the mark legally. Keep partner usage consistent. Detect impersonation early.

---

## 2. Roles + RACI

| Activity | Responsible | Accountable | Consulted | Informed |
| --- | --- | --- | --- | --- |
| Brand book updates | Brand lead | CEO | Design, Legal, Comms | All staff |
| Logo / asset approval | Brand lead | Brand lead | — | Requester |
| Co-brand approval | Brand lead | Brand lead | Legal (if novel), BD owner | Partner contact |
| Trademark registration | Legal | CFO | Brand lead | All staff |
| Impersonation takedowns | Legal | Legal | Brand lead, Security | Affected channel |
| Brand audit (quarterly) | Brand lead | Brand lead | Marketing, Product | Leadership |
| Press / journalist asset requests | Comms | Comms | Brand lead | Legal (if novel use) |

---

## 3. Brand review gate

Any of the following requires brand-lead sign-off **before** publication:

1. Marketing launch (landing page, campaign, paid spend).
2. Partner announcement (press release, joint blog, joint webinar).
3. New use of the lockup in a context not covered by the brand book.
4. New marketing surface (new platform, new ad format).
5. New illustration or photography style trial.
6. Any external use of staff portraits or quotes.

**SLA:** 2 business days for standard requests, 4 hours for crisis-comms requests.

**Decision log.** Every review records: requester, surface, decision (approve / reject / approve-with-changes), rationale. Kept in the brand-ops repo.

---

## 4. Self-serve brand asset library

The DAM (`DAM_PLAN.md`) is the only sanctioned source for brand assets.

- Internal staff: full access.
- Approved partners: tier-gated access with usage rights metadata.
- Press / journalists: public `/press-kit` page exporting a pre-approved subset.
- Open public: a small, watermark-free PNG lockup + a written usage notice. Anything beyond requires a request.

If an asset isn't in the DAM, it isn't approved. Period.

---

## 5. Logo + asset misuse monitoring

**Tooling.**
- Image-similarity monitoring on the wordmark + monogram (TinEye API or equivalent). Weekly sweep.
- Trademark watch service (Markify / Compumark) for new filings on `aegis` + variants in TM classes 9, 35, 38, 41, 42, 45.
- Domain monitoring on permutations of `aegislens` + common typo-squat patterns (DNSTwist daily).
- Social-handle monitoring on X, LinkedIn, Bluesky, Mastodon, Telegram, YouTube, Instagram, TikTok (sweep monthly).

**Response.**
1. Suspected misuse logged with screenshot + URL + timestamp.
2. Triaged by Brand lead: harmless / requires takedown / legal escalation.
3. Cease-and-desist template available; Legal signs off before send.
4. Platform takedown filed via standard process if no response in 7 days.

---

## 6. Trademark registrations

**Day-1 filings (jurisdictions × marks).**

| Jurisdiction | Classes | Marks | Owner |
| --- | --- | --- | --- |
| EU (EUIPO) | 9, 35, 38, 41, 42, 45 | `Aegis Lens` wordmark + logo | Legal |
| US (USPTO) | 9, 35, 38, 41, 42, 45 | `Aegis Lens` wordmark + logo | Legal |
| UK (IPO) | 9, 35, 38, 41, 42, 45 | `Aegis Lens` wordmark + logo | Legal |
| UA (Укрпатент) | 9, 35, 38, 41, 42, 45 | `Aegis Lens` wordmark + logo + UK transliteration | Legal |

**Phase-2 (after Series A or material traction in market):** CA, AU, JP, IL, PL, DE, FR.

**Renewals.** Calendared at filing time. 6-month and 60-day reminders. Renewal budget line in finance.

**Watch service** runs in all filed jurisdictions to catch confusingly similar new filings.

---

## 7. Anti-impersonation playbook

| Surface | Detection | Response |
| --- | --- | --- |
| Spoof domain | DNSTwist daily scan | Document → cease-and-desist → registrar takedown → UDRP if needed |
| Fake social account | Monthly platform sweep + user reports | Document → platform impersonation report → public clarification only if account has traction |
| Fake email impersonating staff | DMARC report monitoring, reports from staff | SPF/DKIM/DMARC tightening, BEC playbook (`crisis_comms/TODO_misinfo_about_us.md`) |
| Fake "verified by Aegis Lens" badge on a third-party site | Image-similarity sweep | Cease-and-desist, public denylist if persistent |
| AI-generated content claiming to be us | News monitor + reports | Public correction on social, link to authentic source |

---

## 8. Co-brand approval workflow

See `BRAND_BOOK.md` § 9 for the visual rules. Process:

1. **Partner submits** proposed surface (mockup, file).
2. **BD owner** routes to Brand lead with context (partner tier, use case, distribution).
3. **Brand lead reviews** against BRAND_BOOK.md § 9.
4. **Decision** within 2 business days.
5. **On approval:** versioned co-brand asset added to DAM with explicit expiration date (default 12 months) and named partner.
6. **On expiration:** partner is notified 60 days ahead. Renewal requires a fresh review.
7. **Revocation:** Brand lead may revoke approval at any time; partner has 30 days to remove the asset.

---

## 9. Quarterly brand audit

Each quarter, Brand lead spot-audits:

- 25 random recent web pages — voice + visual consistency.
- 25 random recent social posts — voice + asset template consistency.
- 5 most-recent partner deployments — co-brand compliance.
- All sales / collateral material currently in the field — see `sales/TODO_collateral_library.md`.
- A drift report (what's slipping, what's holding), shared with leadership.
- Action items assigned with owners + due dates.

---

## 10. Brand crisis runbook

Brand-specific incidents (mark misuse going viral, leaked draft, off-color partner copy) are handled by `crisis_comms/TODO_brand_crisis.md`. Brand lead is the on-call owner; Legal is consulted on takedowns; Comms owns external messaging.

**Decision rights in a brand crisis** sit with Brand lead — they may pause campaigns, recall partner assets, and issue corrections without escalation, then debrief leadership within 24h.

---

## 11. Off-boarding

When a staff member or contractor with brand-asset access leaves:

- DAM access revoked within 4 hours.
- Any in-flight co-brand lockups signed off by them re-reviewed within 30 days.
- If a vendor relationship ends, DAM access revoked + all delivered assets confirmed in the DAM + all uncommitted drafts archived.

---

## 12. Annual review

Brand lead schedules an annual review of:

- This document.
- BRAND_BOOK.md (bump version if substantive changes).
- Trademark portfolio (file new jurisdictions if business has expanded).
- Asset library health (orphaned assets, unused variants, missing rights metadata).

Outcomes shared at the annual all-hands.
