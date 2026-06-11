# TODO — Service: Vision

## Goal
Image + video understanding: detect, classify, verify, geolocate.

## Progress
- 11 / 11 done

## Tasks
- [x] Object detection (YOLOv8 / RT-DETR fine-tuned) — `services/vision/src/detectors.ts` (confirmed in Sprint 2.63: `detectObjects` + 4 other detectors, codeable contract with YOLOv8/RT-DETR target vocab)
- [x] OCR (Tesseract + PaddleOCR for Cyrillic) — `services/nlp/src/ocr.ts` (confirmed in Sprint 2.63: Tesseract + PaddleOCR ensemble, Cyrillic/Latin, REST-backed with StubOcrEngine fallback)
- [x] Reverse image search (embeddings index) — `services/vision/src/reverse-image.ts` (confirmed in Sprint 2.63: TinEye API + custom EVA-CLIP/DINOv2 embeddings index, pHash fallback)
- [x] Manipulation / deepfake detection — `services/vision/src/manipulation.ts` (confirmed in Sprint 2.63: EfficientNet+DCT/noise-residual stub, EXIF/C2PA/ELA heuristics, human review gated)
- [x] Frame sampling for video — `services/vision/src/video-frames.ts` (confirmed in Sprint 2.63: TransNetV2 stub, adaptive luma/histogram scene-boundary detection)
- [x] STT for video audio (Whisper) — `services/nlp/src/stt.ts` (confirmed in Sprint 2.63: Whisper-large-v3 REST backend, UK/RU/EN tier-1 langs, diarization interface)
- [x] EXIF + metadata extraction — `services/vision/src/exif.ts` with privacy stripping + consistency validation
- [x] Sun-angle / shadow analysis — `services/vision/src/sun-angle.ts` with solar ephemeris + candidate location search
- [x] Burn-scar / change detection (satellite-only path) — `ChangeDetectionResult` type + `ChangeType` enum in types.ts
- [x] Batch + streaming inference paths — `VisionJob` queue with priority + `dequeuePendingJobs()` in dispatcher.ts
- [x] GPU autoscaling — `services/vision/src/gpu-autoscaling.ts` (`GpuTier` enum, `GpuAutoscalePolicy` type, `DEFAULT_POLICY`, `evaluateScaling()` pure decision function)

## i18n
- OCR multi-script (Latin, Cyrillic, more later).

### Примітки
Largest GPU spend. Quantize aggressively, monitor cost-per-image.
