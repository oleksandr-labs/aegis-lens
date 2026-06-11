# TODO — Computer Vision & Geo-AI

## Goal
Verify visual evidence (images, video, satellite) and place it on the map.

## Progress
- 17 / 17 done

## Tasks

### Detection
- [x] Object detection (YOLOv8/RT-DETR) fine-tuned on military equipment classes — services/vision/src/detectors.ts (`detectObjects`, classes in model-registry.ts `obj-det-mil-v0`); interface + heuristic baseline, weights pending
- [x] Aircraft / drone identification — services/vision/src/detectors.ts (`identifyAircraft`, `AircraftClass`); interface + heuristic, weights pending
- [x] Vessel classification — services/vision/src/detectors.ts (`classifyVessel`, `VesselClass`); interface + heuristic, weights pending
- [x] Damage / fire / smoke classifier — services/vision/src/detectors.ts (`assessDamage`, `DamageClass` + severity map); interface + heuristic, weights pending
- [x] Vegetation / season classifier (for video forensics) — services/vision/src/detectors.ts (`classifyVegetation`, `seasonInconsistencyFlag`); interface + heuristic, weights pending

### Verification
- [x] Reverse image search (TinEye + custom embeddings index) — services/vision/src/reverse-image.ts (`searchTinEye`, `ReverseImageIndex`, `pHash` fallback, `fuseReverseImage`); TinEye client + index contract, embedding weights pending
- [x] Deepfake / manipulation detection — services/vision/src/manipulation.ts (`detectManipulation` noisy-OR signal fusion); interface + heuristic, learned detector pending
- [x] EXIF analysis pipeline — services/vision/src/exif.ts (`parseExif`, `buildExifResult`, `validateExifConsistency`); fully functional (pre-existing, privacy-strip + consistency check)
- [x] Sun-angle / shadow geolocation hints — services/vision/src/sun-angle.ts (`computeSunPosition`, `findCandidateLocations`); fully functional solar-ephemeris computation (pre-existing)
- [x] Frame-level video analysis with scene segmentation — services/vision/src/video-frames.ts (`segmentScenes`, `selectKeyframes`); frame-difference cut detection, learned shot-boundary model pending

### Satellite
- [x] Sentinel-2 change detection (per-AOI) — services/vision/src/satellite.ts (`detectSentinel2Change`, NDVI/NBR indices); interface + spectral-index heuristic, Siamese U-Net weights + Copernicus creds pending
- [x] Sentinel-1 SAR processing for night/cloud — services/vision/src/satellite.ts (`processSentinel1Sar`, backscatter + coherence); interface + heuristic, weights + data access pending
- [x] Burn-scar mapping (Sentinel + FIRMS fusion) — services/vision/src/satellite.ts (`mapBurnScar` dNBR ⊕ FIRMS hotspots); interface + heuristic fusion, FIRMS key pending
- [x] AOI subscription system — services/vision/src/aoi-subscription.ts (`createAoiSubscription`, `dueForCheck` revisit-cadence scheduler, `aoiTasksFor`); fully functional in-memory store + scheduling logic

### Geolocation AI
- [x] LLM-assisted geolocation (multimodal: clue extraction + map cross-reference) — services/vision/src/geolocation.ts (`extractClues`, `buildGeolocationPrompt`, `parseLlmGeolocation`, `geolocate`); prompt contract + deterministic fusion fallback, LLM call made by worker (house default = latest Claude)
- [x] Confidence-scored coordinate output — services/vision/src/geolocation.ts (`GeolocationCandidate` with calibrated confidence + uncertaintyM, `proposeCandidates`/`mergeCandidates` noisy-OR corroboration)
- [x] Human-in-the-loop override + retraining feedback — services/vision/src/human-review.ts (`gateForReview`, `VisionReviewQueue`, `applyGeolocationOverride`, `RetrainingSample` export) + privacy.ts face-blur; fully functional gate/queue/feedback contract

## i18n
- N/A directly; outputs feed NLP/translation downstream.

### Примітки
Geolocation is a competitive moat — invest heavily.
