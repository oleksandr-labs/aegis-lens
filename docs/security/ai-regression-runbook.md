# AI Regression Incident Runbook

> **Scope:** a model deploy makes outputs worse (classification, translation,
> summarization, geolocation, verification scoring).
> **Goal: roll back, root-cause, prevent recurrence.**
>
> **Key fact: model regressions hide in tail languages. Test all locales before
> promoting — a model that improves EN can quietly break UK or low-resource
> languages.**

| Field | Value |
| --- | --- |
| Owner | Geo / NLP / verify |
| Service area | Geo-NLP-verify |
| Typical severity | SEV-2 (SEV-1 if user-visible wrong outputs at scale) |
| Related | [IR overview](incident-response-runbook.md) · [Model registry](../ai/model-registry.md) · [Data incident](data-incident-runbook.md) · [Postmortem](postmortem-template.md) |

## 1. Detect

- **Eval-suite regression alert:** a promoted/candidate model drops below the
  baseline on the held-out eval set (overall **or per-locale** — a per-locale
  drop alone triggers this runbook).
- **User-report cluster:** a spike of "this is wrong" reports or analyst flags
  clustered around outputs from the new model version.
- Correlate the report window with the model-promotion timeline from the
  [model registry](../ai/model-registry.md).

## 2. One-click rollback

- Roll the affected model back to the last-known-good version via the **model
  registry / Argo CD** (pin the previous version; the registry keeps immutable
  versioned artifacts for exactly this).
- Confirm serving traffic is on the rolled-back version (check the served-version
  metric, not just the deploy status).
- Rollback is the first action — do not debug forward in production.

## 3. Halt new promotions

- Freeze the promotion pipeline for the affected model family until cleared.
  Prevents a second bad version landing while you investigate.
- Announce the freeze in the incident channel and the model-ops channel.

## 4. Re-grade affected outputs (HITL sweep)

- Identify outputs produced by the bad version (time window × model version) and
  run a **human-in-the-loop re-grade** sweep, prioritizing high-stakes /
  customer-visible outputs and affected locales.
- Correct or re-process the affected outputs through the good model; mark
  corrections in provenance (consistent with the data-incident retraction
  approach).

## 5. Customer comms (if user-visible)

- If wrong outputs reached customers, notify per support tier and localize.
- Be specific: what kind of output, which window/locales, and that affected
  outputs were re-graded/corrected.

## 6. Eval-set expansion to cover the missed case

- Add the specific failure case(s) to the eval set so this exact regression can
  never pass silently again — this is the durable fix.
- If a tail locale was affected, **expand per-locale eval coverage** for it.

## 7. Promotion-gate review (why did this pass eval?)

- Root-cause the *process*: why did the eval gate green-light a worse model?
  Gaps to check: eval set didn't cover the case; metric masked a per-locale
  regression behind an aggregate; threshold too loose; train/serve skew; data
  drift.
- Tighten the gate: require **per-locale** non-regression (not just aggregate),
  add the missed case, and consider a canary + shadow-eval before full promotion.

## 8. Postmortem

- Blameless postmortem ([template](postmortem-template.md)). Action items must
  include the eval-set expansion (§6) and the promotion-gate fix (§7), each with
  an owner — otherwise the same class of regression recurs.

## Verification (incident resolved when)

Serving on the good model; affected outputs re-graded/corrected; eval set
expanded to cover the case (incl. affected locales); promotion gate updated to
require per-locale non-regression; promotion freeze lifted only after the gate
fix lands.
