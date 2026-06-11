# `@ua-map/vision` — Compliance, CV Ethics & Data Provenance

This service performs computer-vision analysis on conflict media (images, video,
satellite) for OSINT verification. CV on war imagery is ethically and legally
sensitive. This document is the binding contract; the code enforces the gates
described here.

---

## 1. CV ethics policy (binding)

### 1.1 No biometric identification of civilians
- The service **detects** faces / person regions **only to BLUR them**
  (`privacy.ts`). It performs **no face recognition** — no 1:1 verification, no
  1:N identity search, no face-embedding gallery of people. There is no identity
  output anywhere in the package.
- Detectors classify **equipment, aircraft, vessels, damage, terrain, season** —
  never people's identities.

### 1.2 Privacy / face-blur before publication
- Any media shown publicly or exported MUST pass through `planRedactions()`
  (`privacy.ts`) and have the returned regions blurred by the worker first.
- Faces, identity documents, and license plates are blurred by default
  (`DEFAULT_REDACTION_POLICY`). The policy is conservative: when in doubt, blur.
- Protects civilians, casualties, and **prisoners of war** (Geneva Convention III
  art. 13 — PoWs must be protected against public curiosity).

### 1.3 Human review for high-stakes outputs
- Every detector returns a `RiskTier` and a `requiresHumanReview` flag.
- **High-stakes outputs never auto-publish.** They are gated through
  `human-review.ts` (`gateForReview` / `VisionReviewQueue`):
  - **Geolocation AI** — `requiresHumanReview` is hard-coded `true` (it is
    targeting-adjacent; a coordinate is never published from AI alone).
  - **Aircraft / vessel (military) identification** — high-stakes.
  - **Damage assessment severity ≥ 3.**
  - **Manipulation / deepfake "manipulated" verdicts** — advisory only; a positive
    verdict can defame a real source, so it is reviewed and is never the sole basis
    for retracting an event.
- Outputs with **uncalibrated** confidence, or calibrated confidence below
  `REVIEW_CONFIDENCE_FLOOR` (0.5), are also routed to review.

### 1.4 Calibrated confidence (no false certainty)
- Raw model scores are **not** probabilities. Every detector returns a
  `CalibratedConfidence { raw, calibrated, isCalibrated }`. Until per-model
  calibrators are fitted (`confidence.ts`, target ECE < 0.05), `isCalibrated` is
  `false` and the number must be treated as a triage signal only — the review gate
  keys off this flag.

### 1.5 No targeting / no kill-chain
- Outputs are for **verification, situational awareness, and accountability**
  (war-crime documentation, debunking disinformation). The service must not be
  wired into any real-time fire-control / targeting loop. Geolocation precision is
  deliberately coupled to an honest uncertainty radius.

---

## 2. Model status — WEIGHTS PENDING

All learned models in this service are **stubs**; the shipped code is the *codeable
contract* (typed I/O + calibrated-confidence schema + heuristic baseline), matching
the repo convention (cf. `integrations/missiles/src/classifier.ts`). See
`model-registry.ts` — every entry is `status: "stub"` with `weightsUri: undefined`.

| Logical model        | Task                          | Target arch                  | Baseline that runs today                |
|----------------------|-------------------------------|------------------------------|-----------------------------------------|
| `obj-det-mil-v0`     | military object detection     | YOLOv8-m / RT-DETR-l         | text/OCR keyword cues → whole-frame dets |
| `aircraft-id-v0`     | aircraft / drone ID           | EfficientNetV2 + acoustic    | keyword patterns                         |
| `vessel-class-v0`    | vessel classification         | ConvNeXt-tiny                | keyword patterns                         |
| `damage-assess-v0`   | damage / fire / smoke         | SegFormer-b2                 | keyword patterns + severity map          |
| `veg-season-v0`      | vegetation / season           | ResNet-50                    | colour-fraction + keyword cues           |
| `manip-detect-v0`    | deepfake / manipulation       | EfficientNet + DCT/noise     | EXIF/software + ELA/noise signal fusion  |
| `img-embed-v0`       | image embedding (reverse img) | EVA-CLIP / DINOv2            | 64-bit perceptual hash (pHash) fallback  |
| `scene-seg-v0`       | video scene segmentation      | TransNetV2                   | frame-difference cut detection           |
| `sat-change-v0`      | Sentinel-2 change / burn scar | Siamese U-Net                | NDVI/NBR/dNBR spectral indices           |
| `sar-target-v0`      | Sentinel-1 SAR targets        | CFAR + CNN                   | backscatter / coherence thresholding     |

**Training-data licensing:** fine-tuning datasets for the military-equipment and
manipulation models must be **license-cleared before training** (no scraped
copyrighted corpora republished as weights; no datasets containing civilian face
identities). Provenance is recorded per model in `ModelEntry.trainingDataNote`.

When weights ship: upload artifact → set `weightsUri` + `status: "live"` →
register a fitted calibrator (`registerCalibrator`) → flip the detector body from
heuristic to inference. The interfaces and confidence contract do not change.

---

## 3. Third-party data sources, licenses & secrets

Secrets are **never hardcoded** — read from `process.env`, documented here.

| Source / API                | Env var(s)                                          | License / ToS notes |
|-----------------------------|-----------------------------------------------------|---------------------|
| **TinEye** reverse image    | `TINEYE_API_KEY`                                    | Commercial API; per-search billing. Respect rate limits + a descriptive User-Agent (`AegisLens/1.0`). Without the key, reverse web search is skipped (stub mode), index-only fallback runs. Attribute TinEye where match data is displayed. |
| **Copernicus / Sentinel Hub** | `COPERNICUS_CLIENT_ID`, `COPERNICUS_CLIENT_SECRET` | Sentinel-1/-2 data is **free & open** (Copernicus). **Attribution required:** "Contains modified Copernicus Sentinel data [year]". |
| **NASA FIRMS** (active fire) | `FIRMS_MAP_KEY`                                     | Free; cite NASA FIRMS / VIIRS-MODIS. Near-real-time hotspots are provisional. |

Catalog polling, raster I/O, video decode (ffmpeg) and the LLM provider call all
live in the **worker**, not this pure-TS package, so the package stays
dependency-free and unit-testable.

---

## 4. LLM-assisted geolocation

`geolocation.ts` ships a **prompt contract** (`buildGeolocationPrompt`) + a strict
JSON parser; the model call is made by the worker through the platform LLM provider
abstraction. **House default model: the latest Claude** (Opus 4.x for hard
reasoning, Sonnet 4.x for routine fusion) — the worker resolves the live model id;
**do not hardcode old model ids.** The prompt instructs the model never to fabricate
a precise coordinate from weak evidence and that its output is advisory and
human-reviewed. Output always carries `requiresHumanReview: true`.

---

## 5. Audit & retraining

Reviewer decisions are captured as `RetrainingSample`s (`human-review.ts`) — the
model's original output plus the human correction — feeding both model retraining
and calibrator refitting (ECE measured in `confidence.ts`). AI candidates are
retained alongside the human-verified location for the audit trail
(`applyGeolocationOverride`).
