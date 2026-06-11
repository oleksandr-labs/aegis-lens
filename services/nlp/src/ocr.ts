/**
 * OCR (Optical Character Recognition) — codeable contract.
 *
 * Aegis Lens ingests text baked into imagery: Telegram screenshots, leaked
 * documents/PDFs, and video frames (TV chyrons, on-screen captions). This module
 * defines the typed interface + confidence schema for three OCR surfaces and ships
 * REST-backed engines with a deterministic offline `StubOcrEngine` fallback so the
 * pipeline is usable without a running model server.
 *
 * Engines (production):
 *   - Tesseract  (`tessdata` ukr+rus+eng) — good on clean print, Latin + Cyrillic.
 *   - PaddleOCR  — stronger on Cyrillic and low-quality / rotated scans.
 * We expose both behind a single `OcrEngine` interface; the `EnsembleOcrEngine`
 * runs them in parallel and keeps the higher-confidence result per region.
 *
 * NO model weights are bundled. The REST engines call a self-hosted inference
 * server whose URL comes from `process.env` (documented in COMPLIANCE.md). When no
 * endpoint is configured the stub returns an empty, low-confidence result rather
 * than throwing, so OCR is always an optional enrichment stage — never a hard
 * dependency.
 */

import type { SupportedLocale } from "./types";

// ── Result schema ───────────────────────────────────────────────────────────

/** A single recognised text region with its own confidence + bounding box. */
export interface OcrRegion {
  text: string;
  /** 0-1 recognition confidence for this region. */
  confidence: number;
  /** Pixel bounding box [x, y, width, height], if the engine reports it. */
  bbox?: [number, number, number, number];
  /** Detected script, useful for downstream language routing. */
  script?: "Cyrillic" | "Latin" | "Mixed" | "Other";
}

export interface OcrResult {
  /** Concatenated text across all regions (reading order, top-to-bottom). */
  text: string;
  regions: OcrRegion[];
  /** Mean region confidence (0-1). */
  confidence: number;
  /** Best-guess language of the recognised text. */
  language: SupportedLocale;
  /** Engine identifier, e.g. "tesseract/5.3 ukr+rus+eng" or "stub". */
  engine: string;
  processingMs: number;
}

/** A single sampled video frame ready for OCR. */
export interface VideoFrameRef {
  /** Frame timestamp in seconds from the start of the clip. */
  timestampSec: number;
  /** URL or data-URI of the extracted still frame. */
  imageRef: string;
}

export interface VideoOcrResult {
  frame: VideoFrameRef;
  ocr: OcrResult;
}

export interface DocumentOcrPage {
  pageNumber: number;
  ocr: OcrResult;
}

export interface DocumentOcrResult {
  pages: DocumentOcrPage[];
  /** Full document text, page-break joined. */
  text: string;
  /** Mean page confidence. */
  confidence: number;
  engine: string;
}

// ── Engine interface ──────────────────────────────────────────────────────────

export interface OcrEngine {
  /**
   * Recognise text in a single image.
   * @param imageRef URL, file path, or base64 data-URI.
   * @param langHint comma list of tessdata langs, e.g. "ukr+rus+eng".
   */
  recognize(imageRef: string, langHint?: string): Promise<OcrResult>;
}

/** Map an OCR/tesseract language code to our internal locale. */
function ocrLangToLocale(code: string): SupportedLocale {
  const head = code.split("+")[0]?.toLowerCase() ?? "";
  if (head.startsWith("ukr") || head === "uk") return "uk";
  if (head.startsWith("rus") || head === "ru") return "ru";
  if (head.startsWith("eng") || head === "en") return "en";
  return head || "uk";
}

function scriptOf(text: string): OcrRegion["script"] {
  const cyr = /[Ѐ-ӿ]/.test(text);
  const lat = /[A-Za-z]/.test(text);
  if (cyr && lat) return "Mixed";
  if (cyr) return "Cyrillic";
  if (lat) return "Latin";
  return "Other";
}

function meanConfidence(regions: OcrRegion[]): number {
  if (regions.length === 0) return 0;
  return parseFloat(
    (regions.reduce((s, r) => s + r.confidence, 0) / regions.length).toFixed(3),
  );
}

// ── Tesseract / PaddleOCR REST engine ──────────────────────────────────────────

interface RestOcrRegion {
  text: string;
  confidence: number;
  bbox?: [number, number, number, number];
}

/**
 * REST-backed engine for a self-hosted Tesseract or PaddleOCR server.
 * The two engines share an identical request/response contract, distinguished
 * only by `engineName` for provenance. Falls back to an empty result on error.
 */
export class RestOcrEngine implements OcrEngine {
  constructor(
    private readonly endpoint: string,
    private readonly engineName: "tesseract" | "paddleocr" = "tesseract",
  ) {}

  async recognize(imageRef: string, langHint = "ukr+rus+eng"): Promise<OcrResult> {
    const startedAt = Date.now();
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageRef, lang: langHint, engine: this.engineName }),
      });
      if (!res.ok) return this.empty(langHint, startedAt);

      const data = (await res.json()) as { regions: RestOcrRegion[]; language?: string };
      const regions: OcrRegion[] = (data.regions ?? []).map((r) => ({
        text: r.text,
        confidence: r.confidence,
        bbox: r.bbox,
        script: scriptOf(r.text),
      }));

      const text = regions.map((r) => r.text).join("\n").trim();
      return {
        text,
        regions,
        confidence: meanConfidence(regions),
        language: ocrLangToLocale(data.language ?? langHint),
        engine: `${this.engineName} (rest)`,
        processingMs: Date.now() - startedAt,
      };
    } catch {
      return this.empty(langHint, startedAt);
    }
  }

  private empty(langHint: string, startedAt: number): OcrResult {
    return {
      text: "",
      regions: [],
      confidence: 0,
      language: ocrLangToLocale(langHint),
      engine: `${this.engineName} (unavailable)`,
      processingMs: Date.now() - startedAt,
    };
  }
}

/**
 * Offline stub — never calls the network. Returns an empty, zero-confidence
 * result so OCR can be wired into the pipeline in CI / dev without a model server.
 */
export class StubOcrEngine implements OcrEngine {
  async recognize(_imageRef: string, langHint = "ukr+rus+eng"): Promise<OcrResult> {
    return {
      text: "",
      regions: [],
      confidence: 0,
      language: ocrLangToLocale(langHint),
      engine: "stub",
      processingMs: 0,
    };
  }
}

/**
 * Ensemble: run Tesseract + PaddleOCR (or any two engines) in parallel and keep,
 * per non-overlapping region, the higher-confidence reading. PaddleOCR usually
 * wins on Cyrillic; Tesseract on clean Latin print.
 */
export class EnsembleOcrEngine implements OcrEngine {
  constructor(private readonly engines: OcrEngine[]) {}

  async recognize(imageRef: string, langHint = "ukr+rus+eng"): Promise<OcrResult> {
    const startedAt = Date.now();
    const settled = await Promise.allSettled(
      this.engines.map((e) => e.recognize(imageRef, langHint)),
    );
    const results = settled
      .filter((s): s is PromiseFulfilledResult<OcrResult> => s.status === "fulfilled")
      .map((s) => s.value);

    // Keep all regions, dropping a lower-confidence region that overlaps a kept one
    // by text equality (engines disagree mainly on confidence, not span).
    const merged: OcrRegion[] = [];
    const byText = new Map<string, OcrRegion>();
    for (const r of results) {
      for (const region of r.regions) {
        const key = region.text.trim().toLowerCase();
        const existing = byText.get(key);
        if (!existing || region.confidence > existing.confidence) byText.set(key, region);
      }
    }
    merged.push(...byText.values());

    const text = merged.map((r) => r.text).join("\n").trim();
    return {
      text,
      regions: merged,
      confidence: meanConfidence(merged),
      language: ocrLangToLocale(langHint),
      engine: `ensemble(${this.engines.length})`,
      processingMs: Date.now() - startedAt,
    };
  }
}

// ── Video frame OCR ─────────────────────────────────────────────────────────

export interface VideoOcrOptions {
  /** Seconds between sampled frames (default 2s). */
  sampleIntervalSec?: number;
  /** Drop frames whose mean OCR confidence is below this (default 0.3). */
  minConfidence?: number;
  /** Skip a frame whose text duplicates the previous kept frame (chyron persistence). */
  dedupeConsecutive?: boolean;
}

/**
 * OCR over a set of pre-extracted video frames. Frame extraction itself
 * (ffmpeg `-vf fps=...`) is done upstream by the ingest worker; this module
 * takes the resulting `VideoFrameRef[]` and OCRs each, then dedupes persistent
 * on-screen text so a 10-second chyron is reported once, not five times.
 */
export class VideoFrameOcr {
  constructor(private readonly engine: OcrEngine) {}

  async recognizeFrames(
    frames: VideoFrameRef[],
    langHint = "ukr+rus+eng",
    opts: VideoOcrOptions = {},
  ): Promise<VideoOcrResult[]> {
    const minConfidence = opts.minConfidence ?? 0.3;
    const dedupe = opts.dedupeConsecutive ?? true;

    const out: VideoOcrResult[] = [];
    let lastText = "";
    for (const frame of frames) {
      const ocr = await this.engine.recognize(frame.imageRef, langHint);
      if (ocr.confidence < minConfidence || ocr.text.length === 0) continue;
      if (dedupe && ocr.text.trim() === lastText) continue;
      lastText = ocr.text.trim();
      out.push({ frame, ocr });
    }
    return out;
  }

  /**
   * Compute the frame timestamps (seconds) to sample for a clip of `durationSec`.
   * The ingest worker feeds these to ffmpeg. Kept here so sampling cadence is
   * defined alongside the OCR contract.
   */
  static sampleTimestamps(durationSec: number, intervalSec = 2): number[] {
    const stamps: number[] = [];
    for (let t = 0; t < durationSec; t += intervalSec) stamps.push(t);
    return stamps;
  }
}

// ── Document OCR (PDF / multi-page) ───────────────────────────────────────────

export interface DocumentPageImage {
  pageNumber: number;
  imageRef: string;
}

/**
 * Multi-page document OCR. PDF → page raster conversion happens upstream
 * (e.g. `pdftoppm`); this OCRs each rendered page image and assembles a
 * page-ordered document. Used for press releases and leaked PDFs.
 */
export class DocumentOcr {
  constructor(private readonly engine: OcrEngine) {}

  async recognizeDocument(
    pages: DocumentPageImage[],
    langHint = "ukr+rus+eng",
  ): Promise<DocumentOcrResult> {
    const ordered = [...pages].sort((a, b) => a.pageNumber - b.pageNumber);
    const results: DocumentOcrPage[] = [];
    for (const p of ordered) {
      const ocr = await this.engine.recognize(p.imageRef, langHint);
      results.push({ pageNumber: p.pageNumber, ocr });
    }
    const text = results.map((r) => r.ocr.text).join("\n\n").trim();
    const confidence =
      results.length > 0
        ? parseFloat(
            (results.reduce((s, r) => s + r.ocr.confidence, 0) / results.length).toFixed(3),
          )
        : 0;
    return {
      pages: results,
      text,
      confidence,
      engine: this.engine instanceof EnsembleOcrEngine ? "ensemble" : "single",
    };
  }
}
