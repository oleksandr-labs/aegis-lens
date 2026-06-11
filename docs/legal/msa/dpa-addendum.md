# Data Processing Addendum (DPA)

> Attaches to the MSA when Aegis Lens processes personal data on the Customer's
> behalf. Governs GDPR / UK GDPR obligations. References the live subprocessor
> list and SCCs.
>
> **The canonical, fuller instrument is [`../dpa.md`](../dpa.md)** (adds Swiss
> FADP coverage, the subprocessor right-to-object workflow, and the multi-regime
> summary). Offer `../dpa.md` for EU/UK/Swiss procurement; this addendum is the
> embedded short form for the MSA bundle. Keep the two consistent.

---

**DATA PROCESSING ADDENDUM**

This DPA forms part of the Master Services Agreement between `[AEGIS_ENTITY_NAME]`
("**Processor**") and `[CUSTOMER_NAME]` ("**Controller**").

### 1. Roles and Scope

For personal data processed under the Services, Controller is the controller and
Aegis Lens is the processor (or, where Aegis Lens determines purposes for its own
analytics, an independent controller for that limited processing). The subject
matter, duration, nature, purpose, data types, and data-subject categories are
described in **Annex I**.

### 2. Processor Obligations

Aegis Lens will: (a) process personal data only on documented instructions from
Controller, including the MSA and this DPA; (b) ensure persons authorized to
process are bound by confidentiality; (c) implement the technical and
organizational measures in **Annex II**; (d) assist Controller, taking into
account the nature of processing, with data-subject requests and with DPIAs and
prior consultations; (e) notify Controller without undue delay (and in any event
within `[BREACH_NOTICE — default: 72 hours]`) on becoming aware of a personal-data
breach; (f) at Controller's choice, delete or return personal data at end of
provision of services, subject to legal-retention requirements; and (g) make
available information to demonstrate compliance and allow audits per §5.

### 3. Subprocessors

Controller provides general authorization for Aegis Lens to engage subprocessors
listed at [`../subprocessor-list.md`](../subprocessor-list.md). Aegis Lens will
give at least `[SUBPROC_NOTICE — default: 30 days]` notice of changes via the
list / notification mechanism and the Controller may object on reasonable
data-protection grounds. Aegis Lens imposes data-protection terms on
subprocessors no less protective than this DPA and remains liable for their
performance.

### 4. International Transfers

Where processing involves transfer of personal data outside the EEA/UK/Switzerland
to a country without an adequacy decision, the parties incorporate the EU
**Standard Contractual Clauses** (Module Two: controller-to-processor; Module
Three where onward transfer) and, for UK data, the **UK International Data
Transfer Addendum**, completed with the details in **Annex I/III**.

### 5. Audits

Aegis Lens makes available its most recent third-party security reports
(e.g., SOC 2 / ISO 27001 where applicable). Controller may, no more than once
per year (or after a breach), request additional information or an audit on
reasonable notice, during business hours, subject to confidentiality and not
unreasonably disrupting operations.

### 6. Source-Data Sensitivity (Aegis-specific)

Where the Services process data that could identify human sources, witnesses, or
vulnerable individuals in a conflict context, Aegis Lens applies enhanced
minimization and PII-redaction controls (Annex II). Controller agrees not to
upload such data except where lawful and necessary, and acknowledges Aegis Lens
may redact or refuse to process data that creates undue risk to identifiable
individuals.

### 7. Liability and Precedence

Liability under this DPA is subject to the MSA's limitation of liability. In case
of conflict on data-protection matters, this DPA controls over the MSA.

---

#### Annex I — Processing details
- **Categories of data subjects:** `[e.g., Customer's authorized users; incidental individuals appearing in OSINT material]`
- **Categories of personal data:** `[e.g., names, contact data, usage logs; special-category data only where lawful]`
- **Nature & purpose:** Provision of the Aegis Lens platform and related analytics.
- **Duration:** For the Subscription Term plus deletion period.

#### Annex II — Technical & organizational measures
Encryption in transit and at rest; access controls and least privilege; network
segmentation; logging and monitoring; PII-redaction pipeline; vulnerability
management; tested incident response; vendor due diligence. (Full description in
the security documentation set.)

#### Annex III — Transfer mechanism details
SCC module(s), competent supervisory authority, and UK IDTA fields — completed
per deal.
