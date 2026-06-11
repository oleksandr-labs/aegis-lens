# Data Governance

> Classification, PII handling, retention, deletion, and stewardship for all
> Aegis Lens data. **Less data = less risk. Default short; extend only with
> justification.**

---

## 1. Data Classification

Classification is what makes access control meaningful. Without it, RBAC is theater.

### Classification levels

| Level | Examples | Default handling |
| --- | --- | --- |
| **Public** | Verified events (published), source metadata, listings, public API responses | No restriction; served via CDN |
| **Internal** | Config, dashboards, product metrics, engineering logs | Staff-only; SSO required |
| **Confidential** | Customer account data, paid reports, AOI configs, API keys | Auth + ABAC; encrypted at rest |
| **Restricted** | PII (names, emails, IPs), payment data, security keys, incident-response details | Encrypted + audited; access logged; MFA required |
| **Top-secret** | Source identities, executive communications drafts, active-investigation materials | Leadership only; column-level encryption; dual-approval access |

### Per-class handling rules

| Rule | Public | Internal | Confidential | Restricted | Top-secret |
| --- | --- | --- | --- | --- | --- |
| **Encryption at rest** | Bucket/disk level | Disk level | AES-256 column or envelope | AES-256 column (CMK) | AES-256 column (CMK) + app-layer |
| **Encryption in transit** | TLS | TLS | TLS + mTLS (inter-service) | TLS + mTLS | TLS + mTLS |
| **Access control** | None | SSO | RBAC role | RBAC + ABAC + MFA | RBAC + ABAC + MFA + dual-approval |
| **Audit log** | Optional | On writes | On all access | On every read + write | On every access; immutable offsite |
| **Retention** | Indefinite | 1 year logs | Per-service policy | Per §3 (see below) | 5 years (legal hold default) |
| **Indexing (Elastic/Qdrant)** | Yes | Internal only | Anonymized | **Never** | **Never** |
| **LLM prompts** | Allowed | Redacted | Redacted | **Never without pre-redaction** | **Never** |

### Tagging at ingest

- **Auto-classification**: the ingest pipeline applies a classification tag to
  every event based on its content type and source. Public events default to
  `Public`; any event touching PII fields triggers `Restricted`.
- **Classification override**: data owners (§5) may override the auto-tag with a
  justified annotation. Overrides are audit-logged.
- **Annual classification review**: each data owner reviews all tables and stores
  in their domain annually. Misclassified data is corrected; stale
  `Restricted` data is either re-classified or scheduled for deletion.

### Classification training

All new employees with data access complete a 30-minute classification training
at onboarding (see [onboarding §5](../engineering/onboarding.md)). Annual
refresher for all staff.

---

## 2. PII Handling

PII discipline is a culture, not a tool. Lint + train + audit.

### What counts as PII (Aegis context)

Per GDPR Article 4 + CCPA + our source-protection obligations:
- Name, email, phone, IP address (precise), government ID.
- Location data precise enough to identify an individual.
- Source identities, field-worker identities, witness names.
- Biometric data (if ever collected).
- Any combination of non-PII fields that becomes identifying in context.

Note: IP addresses are PII under GDPR; under CCPA they may not be. We treat
**any IP that could identify a natural person as PII** regardless of jurisdiction.

### Detection at ingest

1. **Regex patterns**: email, phone, postcode, Ukrainian ID formats.
2. **NER (Named Entity Recognition)**: spaCy / custom model flags `PERSON`,
   `ORG`, `LOC` entities in free-text fields.
3. **ML classifier**: trained on internal examples of PII vs. non-PII payloads.
4. **Source field allowlist**: only pre-approved fields may contain PII in the
   events table. Any other field with a PII-detector hit is auto-redacted before
   storage.

### Per-field redaction policy

| Field | Action | Storage |
| --- | --- | --- |
| Source identity | Pseudonymize (hash + salt) + store original in encrypted source-identity table | Separated store |
| Event location (precise civilian) | Round to 100m grid before storage in main events table | Original in Restricted store |
| Reporter name / witness name | Redact from main events table | Encrypted Restricted store with access log |
| IP address (ingest logs) | Hash + truncate (last octet zeroed) before log storage | Hashed only |
| Payment data | Never stored; Stripe handles all PII; we store only Stripe customer ID | None |

### PII never in these systems

- **Elasticsearch / Qdrant**: no PII in indexed documents or vector payloads.
  Only pseudonymized IDs and non-identifying content.
- **LLM prompts** (Anthropic, OpenAI): a pre-redaction step replaces all PII
  detector hits with `[REDACTED]` before any prompt is constructed. This step
  is mandatory and logged.
- **Logs**: linter rule in CI (`no-pii-in-logs`) flags any log call whose
  argument contains a field matching the PII field allowlist (email, phone, name,
  source_id in plaintext). Logs carry only pseudonymized IDs.
- **Analytics** (Plausible, PostHog): analytics events are de-identified at the
  collection layer. No user identifiers, no IP.

### PII training data exclusion

We do not use customer PII or source data to train or fine-tune any model.
Training data is derived from public sources and synthetic data only, with a
formal exclusion review before any dataset is used for training.

### Per-employee PII access minimization

Employees access only the PII their role requires:
- **Support agents**: see anonymized account IDs; no email unless customer
  submits a support ticket (then only for that ticket's thread).
- **Engineers**: no production PII access by default; production debugging uses
  sanitized staging data; exceptions require Security Lead approval + audit log.
- **Data scientists**: de-identified datasets only for analytics; any exception
  requires a documented DPIA.

### DSAR support (Right of Access / Portability / Erasure)

See the [deletion policy §5 DSAR](#5-deletion-policy) for the end-to-end workflow.

---

## 3. Retention Policy

Default to short retention; extend only with justification and documented legal basis.

| Data class | Hot retention | Cold retention | Delete / archive |
| --- | --- | --- | --- |
| **Public events** (verified, published) | Indefinite | — | We are the archive; deletion on source-takedown only |
| **Raw source archives** (ingest payloads) | 6 months (S3 Standard) | 5 years (Glacier) | Delete at 5 years; may extend for historical research with data-owner approval |
| **User account data** | Until account deletion + 30-day grace | — | Hard delete after grace period; billing data exception (§7 year compliance) |
| **User content** (cases, notebooks, alerts) | Until deletion + 90-day grace | — | Hard delete; no backups after grace |
| **Application logs** | 90 days (Loki / OpenSearch) | 1 year (S3) | Auto-deleted at 1 year; security logs may be extended to 3 years |
| **AI inference logs** | 30 days | — | Auto-deleted; no cold retention (privacy) |
| **Billing / invoice records** | 7 years (S3 Standard → IA) | 7 years Glacier after year 3 | Legal minimum; auto-archived |
| **Session replays** (PostHog, opt-in) | 14 days | — | Auto-deleted |
| **Backups** (Postgres PITR) | 30 days WAL | 1 year snapshot | Auto-rotated; Glacier for annual snapshots (5 years) |
| **Security / audit logs** | 1 year (OpenSearch) | 2 years (S3) | Auto-purge at 3 years; legal-hold extension by Security Lead |
| **PII in encrypted Restricted store** | Per-customer agreement | None past account deletion | Hard delete + audit log entry on erasure |

**Legal hold:** if an active legal proceeding exists, data that would otherwise
be deleted is placed on legal hold (S3 Object Lock). Legal lead + Security Lead
own the hold list.

### Implementation

Retention policies are implemented as:
1. **S3 lifecycle rules** (in Terraform) for object-based stores.
2. **TimescaleDB retention policies** for time-series event data.
3. **Loki retention config** for logs.
4. **Scheduled Dagster job** `retention_cleanup_daily` for DB records (soft-delete
   → hard-delete after grace period).

Each policy is reviewed annually by the data steward for the relevant domain.

---

## 4. Deletion Policy

The hardest part: derived stores. Forget the cascade and you have a GDPR violation.

### Soft-delete vs. hard-delete

| Data class | Default | Notes |
| --- | --- | --- |
| User accounts | Soft-delete first, hard-delete after 30-day grace | Grace allows reactivation |
| User content | Soft-delete first, hard-delete after 90-day grace | Collaborative content needs grace |
| Public events | **Never deleted** unless source takedown | We are the archive |
| Source-identity records | Hard-delete on erasure request | No soft-delete — these are Restricted |
| Billing records | **Never deleted** (legal obligation) | De-identified after 7 years |
| Ingest raw archives | Hard-delete per retention schedule | No grace needed |

### Per-store deletion procedure

A complete erasure (e.g., DSAR right-to-erasure) runs the following steps in order:

```
1. Postgres: soft-delete rows with deleted_at timestamp; hard-delete after grace.
             Source-identity table: immediate hard-delete + tombstone record.
2. Elasticsearch: delete documents by org_id + user_id filter; verify with count query.
3. Qdrant: delete vectors by payload filter (org_id / user_id).
4. S3 / Parquet: tag affected objects for deletion; run deletion Lambda;
                  Parquet partitions re-written to exclude deleted rows.
5. Redis cache: flush keys matching the user/org pattern.
6. Backup exception: flag backup snapshots that contain the data under deletion.
                     Snapshots are NOT retroactively modified (impractical);
                     instead, restore from those snapshots is blocked per the
                     legal-hold / erasure flag.
7. Audit log: immutable tombstone record written to the audit log (what was
              deleted, when, under what authority, and which stores were cleared).
              The tombstone is retained even after all other data is gone.
```

### Cascade rules

Deleting a **user** cascades:
- User-owned cases, notebooks, alert configs, API keys → soft-delete.
- Audit log entries for that user's actions → anonymized (user_id replaced with
  `[DELETED]`), not deleted — the action record is preserved.
- Support tickets → anonymized (email replaced); ticket content retained for
  product analytics.
- Billing customer record → de-identified; financial amounts retained (legal).

Deleting an **organization** cascades to all users in the org, following the
same user-deletion rules for each.

### DSAR-driven deletion (Right to Erasure)

A formal DSAR erasure request triggers a **deletion workflow** (Temporal):
1. Legal team validates the request and logs it in the DSAR register.
2. Temporal workflow executes the per-store deletion procedure above.
3. Workflow emits a completion event with a per-store status (success / partial /
   error with reason).
4. Legal team confirms and sends the GDPR-required acknowledgement to the data
   subject within 30 days of receipt.

Full DSAR workflow detail: `TODO/data/TODO_dsar_workflow.md`.

### Source-takedown propagation

When a source (e.g., Telegram channel) is taken down or submits an opt-out:
1. Ingest pipeline is updated to reject new events from that source.
2. Existing events from the source are flagged in the events table.
3. Where legally required (copyright / right to be forgotten): the deletion
   procedure above is run for the affected events.
4. Public display is immediately blocked pending the deletion review.
5. Takedown register updated (see [takedown policy](../legal/takedown-licensing.md)).

### Per-deletion verification

After every deletion run:
- A verification query confirms zero remaining rows in Postgres.
- An Elasticsearch document count confirms zero remaining documents.
- Qdrant payload search confirms zero remaining vectors.
- Any orphan rows are an error condition: filed as a P1 data-integrity bug.

### Tombstone records

A tombstone record is written to the `deletion_log` table on every deletion:
```sql
-- deletion_log (immutable, append-only, RLS: security_lead role only)
id, deleted_at, deleted_by (role), subject_type, subject_id,
authority (DSAR / retention / takedown / admin), stores_cleared (jsonb),
tombstone_retained_until
```

Tombstones are retained for 5 years after the deletion event (legal-evidence
function) and are never cascaded when a user account is deleted.

---

## 5. Data Stewardship

Without stewardship, data swamps form. Default to ownership.

### Data owners (per domain)

| Domain | Data owner | Deputy |
| --- | --- | --- |
| **Events** (conflict data, sources) | Data Lead | Intelligence Lead |
| **Users / accounts** | Platform Lead | Legal/Compliance |
| **Billing / finance** | Finance Lead | Platform Lead |
| **Knowledge graph** | AI Lead | Data Lead |
| **Listings / directory** | Product Lead | Data Lead |
| **Security / audit logs** | Security Lead | Infra Lead |

Each owner is accountable for: quality SLOs, table documentation in the data
catalog, change approval within their domain, and the annual classification
review.

### Per-domain quality SLO ownership

Each data owner defines and owns the SLO for data freshness, completeness, and
accuracy in their domain. SLO breaches trigger the same postmortem process as
application SLO breaches (see [incident program](../security/incident-program.md)).

### Per-table documentation in data catalog

Every production table/dataset has an entry in the data catalog
(OpenMetadata / DataHub) with: description, owner, classification, retention
policy, schema (auto-synced from Dagster assets), and known data-quality issues.

**No orphan tables.** A table without a documented owner is a data-governance
violation: the infra team files a P2 bug and assigns it to the most likely owner
based on the CODEOWNERS file.

### New-table sponsorship requirement

A new production table requires:
1. A designated data owner.
2. A classification tag.
3. A retention policy.
4. A data catalog entry.
5. An entry in the Dagster asset graph (for lineage).

This is enforced in the DB-migration PR checklist.

### Stewardship monthly forum

Monthly 30-minute meeting: data owners + DPO + Security Lead. Agenda:
- New tables / datasets needing owners.
- SLO status per domain.
- DSAR requests in flight.
- Classification review findings.
- Cross-domain data-sharing requests.

Output: action items in Linear tagged `data-governance`.

### Cross-domain conflict resolution

When two domains disagree on classification, retention, or access for a shared
dataset: the stewardship forum is the first escalation. If unresolved, the DPO /
Legal Lead is the tie-breaker. Decisions are documented in an ADR.

### Annual stewardship audit

Once per year: every data owner reviews their domain end-to-end. Scope:
- All tables / stores classified correctly?
- All owners current (no leavers owning data)?
- Retention policies implemented (not just documented)?
- Deletion procedures tested (did the last quarterly DSAR drill pass)?
- Data catalog entries current?

Audit output feeds the quarterly hardening sprint (see [secops runbook §5](../security/secops-runbook.md)).
