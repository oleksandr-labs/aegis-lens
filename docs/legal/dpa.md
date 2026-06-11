# Data Processing Agreement (DPA)

> **Canonical standalone DPA.** This is the instrument we offer customers; the
> MSA's [DPA addendum](msa/dpa-addendum.md) references this document. Counsel +
> engineering must review together before first use — **the DPA must match what
> we actually do.**
>
> Available in EN (canonical) + DE + FR (commonly requested by EU procurement).

This DPA forms part of the Master Services Agreement ("**Agreement**") between
`[AEGIS_ENTITY_NAME]` ("**Processor**" / "Aegis Lens") and `[CUSTOMER_NAME]`
("**Controller**" / "Customer").

## 1. Definitions & roles

Terms "personal data", "processing", "controller", "processor", "data subject",
and "supervisory authority" have the meanings in **GDPR** (Regulation (EU)
2016/679). For Customer/data-subject groups in scope, the parties also comply
with the **UK GDPR / UK Data Protection Act 2018** and the **Swiss Federal Act on
Data Protection (FADP)** as applicable (§7). Customer is controller; Aegis Lens
is processor (or independent controller for its own product analytics, limited
to that processing). Subject matter, duration, nature, purpose, data types, and
data-subject categories: **Annex I**.

## 2. Processor obligations

Aegis Lens will: (a) process personal data only on Controller's documented
instructions (the Agreement + this DPA), and notify Controller if an instruction
infringes data-protection law; (b) ensure persons authorized to process are bound
by confidentiality; (c) implement the technical & organizational measures in
**Annex II**; (d) assist Controller with data-subject requests and with DPIAs /
prior consultations, taking account of the nature of processing; (e) notify
Controller without undue delay and within **72 hours** of becoming aware of a
personal-data breach; (f) at Controller's choice, delete or return personal data
at end of services (subject to legal-retention); and (g) make available
information to demonstrate compliance and allow audits (§6).

## 3. Subprocessors

Controller gives **general authorization** for Aegis Lens to engage the
subprocessors listed at [`subprocessor-list.md`](subprocessor-list.md). Aegis
Lens gives **at least 30 days' notice** of additions/replacements via the list +
notice to the DPA contact, imposes data-protection terms on each subprocessor no
less protective than this DPA, and remains liable for their performance.
Controller's **right to object** to a new subprocessor is handled per §4.

## 4. Customer right-to-object workflow

When Aegis Lens proposes a new or replacement subprocessor:

1. **Notice** is sent to the Controller's registered DPA contact at least 30 days
   before the subprocessor begins processing (email + Trust Center update).
2. **Objection window:** Controller may object in writing within the 30-day
   notice period on **reasonable data-protection grounds**, stating the specific
   concern.
3. **Good-faith resolution:** the parties discuss in good faith. Aegis Lens may
   (a) address the concern (e.g., additional safeguards, alternative region), or
   (b) offer a commercially reasonable alternative.
4. **If unresolved:** Controller may, as its **sole remedy**, terminate the
   affected Order Form(s) for the portion of Services that cannot be provided
   without the objected-to subprocessor, on written notice, with a pro-rata
   refund of prepaid unused fees for that portion.
5. **No objection** within the window = deemed acceptance. All objections,
   resolutions, and outcomes are logged in the DPA register.

## 5. International transfers

For transfers of personal data outside the EEA/UK/Switzerland to a country
without an adequacy decision, the parties incorporate, in order of applicability:

- **EU Standard Contractual Clauses** (Commission Decision (EU) 2021/914) —
  Module Two (controller-to-processor) and Module Three (processor-to-
  subprocessor / onward), with Annex details from **Annex III**;
- the **UK International Data Transfer Addendum** to the EU SCCs for UK data; and
- for Swiss data, the SCCs as adapted by the Swiss **FDPIC** (references to GDPR
  read as the FADP; the FDPIC and Swiss courts as competent authority/forum;
  protection extended to legal entities while the FADP so provides).

Aegis Lens conducts and documents transfer impact assessments where required.

## 6. Audits

Aegis Lens makes available its current third-party security reports (SOC 2 Type
II / ISO 27001 where held). Controller may, **once per year** (or after a
personal-data breach), request additional information or audit on reasonable
notice, during business hours, under confidentiality, without unreasonably
disrupting operations. Customer bears its own audit costs.

## 7. Multi-regime compliance summary

| Regime | Applies when | Key deltas handled |
| --- | --- | --- |
| **GDPR** | EEA data subjects / EU establishment | Baseline of this DPA |
| **UK GDPR + DPA 2018** | UK data subjects | UK IDTA for transfers; ICO as supervisory authority |
| **Swiss FADP** | Swiss data subjects | FDPIC-adapted SCCs; legal-entity data covered; FDPIC forum |

## 8. Source-data sensitivity (Aegis-specific)

Where the Services process data that could identify human sources, witnesses, or
vulnerable individuals in a conflict context, Aegis Lens applies enhanced
minimization and PII-redaction controls (Annex II). Controller agrees not to
upload such data except where lawful and necessary, and acknowledges Aegis Lens
may redact or refuse to process data creating undue risk to identifiable
individuals.

## 9. Liability & precedence

Liability under this DPA is subject to the **MSA's limitation of liability**. On
data-protection matters, this DPA controls over the MSA.

---

### Annex I — Processing details
- **Data subjects:** `[Customer's authorized users; incidental individuals in OSINT material]`
- **Personal data:** `[names, contact data, usage logs; special-category only where lawful]`
- **Nature & purpose:** provision of the Aegis Lens platform + related analytics.
- **Duration:** Subscription Term + deletion period.

### Annex II — Technical & organizational measures
Encryption in transit and at rest; least-privilege access controls; network
segmentation; logging & monitoring; **PII-redaction pipeline**; vulnerability
management; tested incident response (see [security-incident runbook](../security/security-incident-runbook.md));
vendor due diligence. Full description in the security documentation set.

### Annex III — Transfer mechanism details
SCC module(s) selected, docked clauses, competent supervisory authority, and
UK IDTA / Swiss-adaptation fields — completed per deal.
