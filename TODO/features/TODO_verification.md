# TODO — Media Verification

## Goal
Every published event with media has a verifiable provenance chain. This is our trust moat.

## Progress
- 18 / 18 done (Sprint 2.69 — image + video verification pipeline)

## Tasks

### Image verification
- [x] Perceptual hash (pHash + dHash + custom embeddings) — `services/verify/src/perceptual-hash.ts`
- [x] Reverse image search across our index + TinEye + Google — `services/verify/src/reverse-image.ts`
- [x] EXIF analysis + GPS extraction — `services/verify/src/exif-analysis.ts`
- [x] Deepfake / manipulation detection — `services/verify/src/deepfake-detection.ts`
- [x] Object detection cross-check vs claim — `services/verify/src/object-detection.ts`
- [x] Sun-angle + shadow-direction sanity check — `services/verify/src/sun-angle.ts`
- [x] Vegetation / season sanity check — `services/verify/src/vegetation-season.ts`
- [x] OCR of any text in image (signs, license plates redacted) — `services/verify/src/ocr-analysis.ts`

### Video verification
- [x] Scene-cut detection + per-scene checks — `services/verify/src/video-analysis.ts`
- [x] Frame-sampling for OCR + object detection — `services/verify/src/video-analysis.ts`
- [x] Audio fingerprint check (recycled audio) — `services/verify/src/video-analysis.ts`
- [x] Speech-to-text + claim extraction — `services/verify/src/video-analysis.ts`
- [x] Synthetic-voice detection — `services/verify/src/synthetic-voice.ts`
- [x] Re-upload chain detection (which platform/account first?) — `services/verify/src/reupload-chain.ts`

### Provenance UI
- [x] Verification verdict chip on every event (Verified / Corroborated / Disputed / Unverified) ✓ Sprint 2.60 — EventVerificationBadge + VerificationChip components
- [x] "Why this verdict?" explainer modal with all checks listed ✓ Sprint 2.60 — VerificationExplainer modal (6 weighted steps)
- [x] Source chain (first seen → re-shares) with timestamps ✓ Sprint 2.60 — SourceChain component on event sources page
- [x] Archive.org snapshot links for every source ✓ Sprint 2.60 — archive links in SourceChain + sources page
- [x] Public verification methodology page ✓ Sprint 1.9

## i18n
- Verdict labels + explainers localized.

### Примітки
Never auto-publish "Verified". Verified requires human-in-the-loop sign-off OR ≥3 independent sources with quantitative agreement.
