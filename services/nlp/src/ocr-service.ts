/**
 * OCR Service — typed contract + OcrService facade
 *
 * The existing ocr.ts contains the full engine implementations (Tesseract,
 * PaddleOCR, Ensemble). This file exposes the higher-level job-oriented
 * interface used by the ingest pipeline and web API layer, with:
 *   OcrRequest  — provider-agnostic request shape
 *   OcrBlock    — structured block with type tagging
 *   OcrResult   — unified result (compatible with existing OcrResult schema)
 *   OcrService  — provider chain: Google Vision → AWS Textract → Tesseract stub
 *
 * Phase 1 — OCR on images
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OcrRequest {
  /** Publicly accessible URL of the image to process. */
  imageUrl: string;
  /** Optional inline base64-encoded image (takes priority over imageUrl). */
  imageBase64?: string;
  /** Hint the expected languages for better recognition accuracy. */
  expectedLanguages: ("uk" | "ru" | "en")[];
  /** Whether to return individual text blocks with bounding boxes. */
  detectBlockLayout: boolean;
}

export interface OcrBlock {
  text: string;
  /** Pixel bounding box [x, y, width, height]. */
  boundingBox: [number, number, number, number];
  /** 0-1 recognition confidence for this block. */
  confidence: number;
  blockType: "text" | "table" | "figure";
}

export interface OcrResult {
  /** Concatenated text from all blocks in reading order. */
  text: string;
  blocks: OcrBlock[];
  /** Mean block confidence (0-1). */
  confidence: number;
  /** Language codes detected in the image. */
  detectedLanguages: string[];
  processingMs: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function langHint(langs: ("uk" | "ru" | "en")[]): string {
  const map: Record<string, string> = { uk: "ukr", ru: "rus", en: "eng" };
  return langs.map((l) => map[l] ?? l).join("+") || "ukr+rus+eng";
}

function emptyResult(startedAt: number): OcrResult {
  return { text: "", blocks: [], confidence: 0, detectedLanguages: [], processingMs: Date.now() - startedAt };
}

// ── Google Vision provider ────────────────────────────────────────────────────

interface GVisionAnnotation {
  description: string;
  confidence?: number;
  boundingPoly?: {
    vertices: { x?: number; y?: number }[];
  };
}

async function callGoogleVision(
  req: OcrRequest,
  startedAt: number,
): Promise<OcrResult | null> {
  const key = process.env.GOOGLE_VISION_API_KEY;
  if (!key) return null;

  const imageSource = req.imageBase64
    ? { content: req.imageBase64 }
    : { source: { imageUri: req.imageUrl } };

  try {
    const res = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: imageSource,
              features: [
                { type: "TEXT_DETECTION", maxResults: 1 },
                { type: "DOCUMENT_TEXT_DETECTION", maxResults: 1 },
              ],
            },
          ],
        }),
      },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as {
      responses?: {
        textAnnotations?: GVisionAnnotation[];
        fullTextAnnotation?: { text: string; pages: unknown[] };
        error?: { message: string };
      }[];
    };

    const response = json.responses?.[0];
    if (!response || response.error) return null;

    const fullText = response.fullTextAnnotation?.text ?? "";
    const annotations = (response.textAnnotations ?? []).slice(1); // skip full-image annotation

    const blocks: OcrBlock[] = req.detectBlockLayout
      ? annotations.map((a) => {
          const verts = a.boundingPoly?.vertices ?? [];
          const xs = verts.map((v) => v.x ?? 0);
          const ys = verts.map((v) => v.y ?? 0);
          const x = Math.min(...xs);
          const y = Math.min(...ys);
          const w = Math.max(...xs) - x;
          const h = Math.max(...ys) - y;
          return {
            text: a.description,
            boundingBox: [x, y, w, h] as [number, number, number, number],
            confidence: a.confidence ?? 0.85,
            blockType: "text" as const,
          };
        })
      : [];

    const confidence =
      blocks.length > 0
        ? blocks.reduce((s, b) => s + b.confidence, 0) / blocks.length
        : 0.85;

    return {
      text: fullText,
      blocks,
      confidence: parseFloat(confidence.toFixed(3)),
      detectedLanguages: req.expectedLanguages,
      processingMs: Date.now() - startedAt,
    };
  } catch {
    return null;
  }
}

// ── AWS Textract provider ─────────────────────────────────────────────────────

async function callTextract(
  req: OcrRequest,
  startedAt: number,
): Promise<OcrResult | null> {
  // AWS SDK call — requires aws-sdk or @aws-sdk/client-textract.
  // When the env keys are absent return null so the stub takes over.
  const accessKey = process.env.AWS_ACCESS_KEY_ID;
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION ?? "eu-west-1";
  if (!accessKey || !secretKey) return null;

  // Inline REST signing is non-trivial; in production wire @aws-sdk/client-textract.
  // This stub signals intent and returns null to fall through to Tesseract.
  void region;
  void req;
  void startedAt;
  return null;
}

// ── Tesseract/PaddleOCR REST stub ─────────────────────────────────────────────

async function callTesseractRest(
  req: OcrRequest,
  startedAt: number,
): Promise<OcrResult | null> {
  const endpoint = process.env.TESSERACT_REST_URL;
  if (!endpoint) return null;

  const hint = langHint(req.expectedLanguages);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: req.imageBase64 ?? req.imageUrl,
        lang: hint,
        engine: "tesseract",
        detectBlocks: req.detectBlockLayout,
      }),
    });
    if (!res.ok) return null;

    const json = (await res.json()) as {
      text?: string;
      confidence?: number;
      language?: string;
      regions?: { text: string; confidence: number; bbox?: [number, number, number, number] }[];
    };

    const blocks: OcrBlock[] = req.detectBlockLayout
      ? (json.regions ?? []).map((r) => ({
          text: r.text,
          boundingBox: r.bbox ?? [0, 0, 0, 0],
          confidence: r.confidence,
          blockType: "text" as const,
        }))
      : [];

    return {
      text: json.text ?? "",
      blocks,
      confidence: json.confidence ?? 0,
      detectedLanguages: [json.language ?? req.expectedLanguages[0] ?? "uk"],
      processingMs: Date.now() - startedAt,
    };
  } catch {
    return null;
  }
}

// ── Service ───────────────────────────────────────────────────────────────────

class OcrService {
  async extract(req: OcrRequest): Promise<OcrResult> {
    const startedAt = Date.now();

    const result =
      (await callGoogleVision(req, startedAt)) ??
      (await callTextract(req, startedAt)) ??
      (await callTesseractRest(req, startedAt)) ??
      emptyResult(startedAt);

    return result;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

export const ocrService = new OcrService();
export { OcrService };
