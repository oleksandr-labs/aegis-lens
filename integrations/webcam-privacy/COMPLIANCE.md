# Webcam Privacy Gate + Frame Sampling — Compliance

## Hard privacy constraints (non-negotiable)

| Constraint | Value | Enforcement |
|---|---|---|
| `civilian_areas_excluded` | `true` | privacyGate.ts — blocks area_type: civilian_street, residential, school, hospital |
| `faces_blurred` | `true` | frameSampler.ts — face detection triggers blur flag; raw face data never stored |
| `audio_capture` | `false` | frameSampler.ts — hard-coded; audio URLs rejected |
| `min_tos_review` | `true` | privacyGate.ts — requires tos_review: 'approved' + reviewer + date |

## Privacy gate logic
- Camera eligibility is AND logic — all constraints must pass
- `checkWebcamEligibility()` is called both at registration time and at frame capture time (defence-in-depth)
- Camera area types `civilian_street`, `residential`, `school`, `hospital` are permanently blocked
- Area type `mixed` is blocked unless `in_conflict_zone: true` is explicitly set
- Missing lat/lon blocks the camera

## ToS per-camera review
- Each camera requires individual ToS review: `tos_review: 'approved'`, `tos_reviewer`, `tos_review_date`
- Cameras from Insecam-style directories are not automatically approved — each requires separate review
- Weather webcam networks (Foreca, etc.) require ToS review per network

## Face handling
- Face detection is a placeholder (conservative: always flags)
- Production: integrate with @ua-map/cv-pipeline for actual detection + blur
- Face crops, embeddings, and identifiers are NEVER stored
- Blur is applied by downstream CV pipeline before any display or permanent storage
- The `faces_blurred: true` field on WebcamFrame is a promise/contract, not evidence of actual blur — verify CV pipeline before production use

## Audio
- This integration handles only image/jpeg and image/png endpoints
- MJPEG streams: only the first JPEG frame is extracted; no audio bytes are read
- Any URL returning audio content-type is rejected with `invalid_content` error

## Data classification
- Frame images: `PUBLIC_INFRASTRUCTURE_VISUAL`
- Camera registry: `PUBLIC_LOCATION`
- No PII stored; faces flagged for blur before storage

## Retention policy
- Frames: 24 hours rolling; no long-term frame storage
- Camera registry: maintained by operators; reviewed quarterly

## Legal review status
- PENDING: Per-camera ToS review required; no camera is approved by default
- Framework is approved; individual camera approval gates are in place

## Compliance changelog
- 2026-06-10 — Initial record: PRIVACY_CONSTRAINTS hard constraints, civilian exclusion, per-cam ToS gate, face detection placeholder.
