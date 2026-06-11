# Takedown & Content Licensing

> How we handle source-takedown requests, copyright, and content licensing.
> **Document every takedown — the patterns expose adversarial actors** (e.g.,
> coordinated attempts to scrub evidence of an event).

> **Disclaimer.** Operational policy + workflow, not legal advice. Counsel owns
> contested takedowns, counter-notices, and any litigation.

## Guiding principles

- **Preserve before you remove.** For a conflict-intelligence platform, content
  can be evidence. Default to preserving an archived copy (access-restricted)
  even when removing public display, unless law requires deletion.
- **Document everything.** Every request, decision, and pattern is logged in the
  takedown register — abuse patterns are a signal.
- **Protect sources and the vulnerable** over convenience.
- **Be transparent** about volume (publish aggregate takedown stats in a
  transparency report).

## 1. Takedown request workflow (DMCA + EU equivalents)

Intake via the published abuse/legal contact and `/.well-known` where applicable.

1. **Receive & log** — assign a ticket ID; record requester, claimed basis
   (copyright / privacy / safety / legal order), and the specific content.
2. **Validate** — for **DMCA** (US): confirm the notice has the required elements
   (identification of the work + infringing material, good-faith statement,
   accuracy/penalty-of-perjury statement, signature, contact). For **EU (DSA /
   national law)**: validate it's a sufficiently substantiated notice of illegal
   content. Reject facially invalid notices with a reason.
3. **Triage by class** — copyright, privacy/PII, safety/source-risk, court
   order/government request, or trademark. Route to the right reviewer; involve
   counsel for legal orders and contested claims.
4. **Decide & act** — remove/disable public display if warranted; **preserve an
   access-restricted archived copy** (unless deletion is legally required).
   Record the rationale.
5. **Notify** — acknowledge the requester; where appropriate and lawful, notify
   the affected uploader/source of the action and their counter-notice rights.
6. **Log to register** — feed the [transparency report](#8-annual-licensing--takedown-audit)
   and pattern analysis.

Target acknowledgement: `[2 business days]`; action on valid requests:
`[per legal deadline / promptly]`.

## 2. Counter-notice handling

- A user whose content was removed under DMCA may submit a **counter-notice**
  (required elements: identification, good-faith statement that removal was
  mistaken, consent to jurisdiction, signature).
- On a valid counter-notice, we may **restore** the content after the statutory
  waiting period (`[10–14 business days]`) unless the original claimant files
  suit and notifies us.
- Counsel reviews counter-notices; all are logged. EU equivalents handled per
  applicable redress mechanisms.

## 3. Embargo / pre-publication request handling

- Sources, partners, or authorities may request an **embargo** (hold) or
  **pre-publication** review of specific material (e.g., operational-security
  sensitivity, ongoing rescue, source safety).
- Workflow: log the request → editorial + (if needed) counsel assess against the
  public interest and source-safety → grant a time-boxed embargo, redact, or
  decline with reasons.
- **Editorial independence is preserved:** an embargo request does not obligate
  suppression of independently, lawfully obtained public information; we weigh
  genuine safety/legal risk, not reputational convenience.

## 4. Source consent / opt-out registry

- Maintain a **registry** of source consent status and opt-out / do-not-contact /
  do-not-identify requests.
- The ingest + publication pipeline checks the registry so opted-out individuals
  are not re-identified or re-contacted, and flagged material is handled per its
  restriction.
- Honor right-to-erasure where it applies (coordinated with the [DPA](dpa.md)),
  balanced against legal-preservation and public-interest journalism exemptions —
  counsel decides edge cases. Registry changes are audit-logged.

## 5. Content licensing

| Content | Default license | Notes |
| --- | --- | --- |
| **Public outputs** (selected maps, aggregate stats, public event summaries) | **CC BY 4.0** (with required attribution) | Drives reach + credibility; ties to the [embed-attribution agreement](partners/embed-attribution.md). |
| **Enterprise / API data & feeds** | **Custom commercial license** (via [MSA](msa/README.md)) | No CC; governed by the order form + usage terms. |
| **Proprietary methodology, models, code** | All rights reserved | Not licensed except under explicit agreement (e.g., [OEM](partners/white-label-oem.md)). |

CC-BY public outputs carry a machine-readable license tag and the required
attribution string. Enterprise data may **not** be redistributed under CC.

## 6. Photo / video usage license tracking

- Every third-party photo/video used (in product, marketing, or reports) is
  tracked in an **asset-license register**: source, license type (stock /
  CC / press / commissioned), permitted use, attribution required, and expiry.
- No asset ships without a recorded, compatible license. Press/agency imagery is
  used strictly within its license scope.
- UGC / source-submitted media: track consent + usage rights via the source
  registry (§4) before any public use.

## 7. Music licensing for marketing video

- Marketing video uses only **properly licensed music** (licensed library,
  royalty-free with proof, or commissioned). Track the license, term, and
  permitted platforms in the asset-license register.
- No "found" or platform-default tracks without confirmed rights (a frequent
  source of takedowns/strikes on social platforms).

## 8. Trademark & fair-use review for competitor pages

- Comparison / competitor pages may reference competitor names/marks under
  **nominative fair use** — factual, non-confusing, no implication of endorsement.
- A **trademark + fair-use review** (legal/brand) signs off before publishing any
  page that names a competitor or uses their marks; keep claims factual and
  substantiated to avoid disparagement/IP risk.

## 9. Annual licensing & takedown audit

- **Once a year**, audit: the asset-license register (expiring/expired licenses,
  unlicensed assets), CC-attribution compliance on public outputs, the source
  consent/opt-out registry, and the **takedown register for patterns** (repeat
  claimants, coordinated scrubbing attempts, abuse of the process).
- Output: remediation list (relicense/remove expired assets), a refreshed
  transparency report, and any adversarial patterns escalated to security/editorial.

## i18n
Takedown request forms and counter-notice forms available in **EN + UK + DE**.
