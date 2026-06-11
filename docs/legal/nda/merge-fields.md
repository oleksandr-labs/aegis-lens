# NDA Merge Fields & E-Signature Automation

Canonical token list for wiring NDA templates into **Dropbox Sign** (primary)
or **DocuSign** (enterprise counterparties who require it). Every `[BRACKETED_FIELD]`
in the templates maps to a merge field below.

## Field map

| Token | Type | Source | Notes |
| --- | --- | --- | --- |
| `[EFFECTIVE_DATE]` | date | auto (signing date) | Default to date of last signature. |
| `[AEGIS_ENTITY_NAME]` | static | config | Our legal entity name. |
| `[AEGIS_ENTITY_TYPE]` | static | config | e.g., "Delaware corporation." |
| `[AEGIS_ADDRESS]` | static | config | Registered address. |
| `[COUNTERPARTY_NAME]` | text | deal record | |
| `[COUNTERPARTY_TYPE]` | text | deal record | |
| `[COUNTERPARTY_ADDRESS]` | text | deal record | |
| `[PURPOSE]` | text | deal record | One sentence describing the deal. |
| `[TERM]` / `[SURVIVAL]` | text | template default | Leave default unless negotiated. |
| `[GOVERNING_LAW]` / `[VENUE]` | dropdown | playbook | DE (default), England & Wales, Germany. |
| `[SIG_*]` / `[NAME_*]` / `[TITLE_*]` / `[DATE_*]` | signature block | signer | Bound to signer roles. |
| `[START_DATE]` (employee) | date | HR | Must be on/before first day. |
| `[LIST_OR_"NONE"]` (Schedule A) | text | candidate | Defaults to "NONE." |

## Signing order

1. **Counterparty signs first.** This avoids us countersigning a document the
   other side later edits.
2. **Aegis Lens countersigns.** Authorized signers only (see signing-authority
   matrix). NDAs up to standard terms: any of `[AUTHORIZED_NDA_SIGNERS]`.
   Non-standard terms: require counsel sign-off recorded in the deal record
   before countersignature.

## Post-execution

- Completed PDF auto-files to `/legal/executed/nda/YYYY-MM-DD_<counterparty>_<type>.pdf`.
- A row is appended to the **contracts register** (owner: Ops/Legal):
  counterparty, type, effective date, term, governing law, signer, deal link.
- Set a renewal/expiry reminder at `term − 30 days` for agreements tied to an
  active relationship.

## Tooling notes

- Build one reusable template per NDA type in the e-sign tool; do not re-upload
  the markdown each time. Convert markdown → PDF via the legal-doc pipeline
  (see [`../msa/pdf-pipeline.md`](../msa/pdf-pipeline.md)) so formatting is
  consistent across NDA and MSA output.
- Keep the **Redline notes** sections OUT of the generated PDF — they are
  internal. The pipeline strips any `> **Redline notes` block and any
  `(internal` heading before rendering.
