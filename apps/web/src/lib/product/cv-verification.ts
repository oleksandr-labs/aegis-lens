/**
 * Computer-Vision Verification — image and video verification pipeline.
 *
 * Three verification tasks: object detection (weapons/vehicles/damage),
 * recycled-media detection (reverse-image search), and geolocation cross-check
 * (shadow/landmark correlation).
 *
 * Три задачі верифікації: детекція об'єктів, виявлення переробленого медіа,
 * геолокаційна перехресна перевірка.
 */

'use server';

// ── Tasks ─────────────────────────────────────────────────────────────────────

export type CvVerificationTask =
  | 'object-detection'
  | 'recycled-media'
  | 'geolocation-cross-check';

export const CV_VERIFICATION_TASKS: CvVerificationTask[] = [
  'object-detection',
  'recycled-media',
  'geolocation-cross-check',
];

// ── Models ────────────────────────────────────────────────────────────────────

/**
 * Model identifiers per CV task. Override via env in production.
 *
 * Ідентифікатори моделей по задачах. Переваизначаються через env у prod.
 */
export const CV_MODELS: Record<CvVerificationTask, string> = {
  'object-detection':        'aegis/yolov8-conflict-v1',
  'recycled-media':          'google/reverse-image-search-api',
  'geolocation-cross-check': 'aegis/geo-xcheck-shadow-v1',
};

// ── Task configs ──────────────────────────────────────────────────────────────

export interface CvTaskConfig {
  task: CvVerificationTask;
  model: string;
  /** Confidence threshold to flag — Поріг довіри для позначення */
  confidenceThreshold: number;
  /** Max processing time budget in ms — Макс. час обробки (мс) */
  budgetMs: number;
  /** Object classes to detect (for object-detection task only) — Класи об'єктів */
  detectClasses?: string[];
}

export const CV_TASK_CONFIGS: Record<CvVerificationTask, CvTaskConfig> = {
  'object-detection': {
    task: 'object-detection',
    model: CV_MODELS['object-detection'],
    confidenceThreshold: 0.65,
    budgetMs: 2_000,
    detectClasses: ['tank', 'armored-vehicle', 'aircraft', 'missile', 'explosion', 'building-damage'],
  },
  'recycled-media': {
    task: 'recycled-media',
    model: CV_MODELS['recycled-media'],
    confidenceThreshold: 0.80,
    budgetMs: 3_000,
  },
  'geolocation-cross-check': {
    task: 'geolocation-cross-check',
    model: CV_MODELS['geolocation-cross-check'],
    confidenceThreshold: 0.70,
    budgetMs: 5_000,
  },
};

// ── Verification result ───────────────────────────────────────────────────────

export interface CvVerificationResult {
  task: CvVerificationTask;
  passed: boolean;
  confidence: number;
  /** Flags raised — Позначки */
  flags: string[];
  /** Impact on event confidence delta (-1 to +1) — Вплив на confidence події */
  confidenceDelta: number;
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export const CvVerificationNote_EN =
  'CV verification runs asynchronously after ingestion. Results update the event ' +
  'confidence score and add a verification badge to the event card.';

export const CvVerificationNote_UK =
  'Верифікація CV запускається асинхронно після інгесту. Результати оновлюють ' +
  'показник довіри події та додають значок верифікації до картки події.';
