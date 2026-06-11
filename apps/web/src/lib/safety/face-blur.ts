/**
 * Face Blur — automatic face detection and blur for non-public individuals.
 *
 * Queues images for face detection; private individuals' faces are blurred
 * before content is published. Public figures may be exempt per policy.
 *
 * Черга на розмиття облич для приватних осіб перед публікацією контенту.
 */

import type { PersonType } from "./ner-classifier";

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Whether face blurring is enabled for private individuals.
 * Must remain true in production — disable only in isolated test environments.
 *
 * Увімкнення авто-розмиття облич для приватних осіб. У продакшені завжди true.
 */
export const FACE_BLUR_ENABLED_FOR_PRIVATE = true;

/**
 * Blur radius in pixels applied to detected faces.
 *
 * Радіус розмиття в пікселях для виявлених облич.
 */
export const BLUR_RADIUS_PX = 20;

// ── Request / Result types ────────────────────────────────────────────────────

export interface FaceBlurRequest {
  /** Stable reference (URL, object-store key, or internal ID) to the image */
  imageRef: string;
  /** Uploader's user ID for audit purposes */
  uploadedBy: string;
  /** PersonType inferred from context (e.g. caption NER) */
  inferredPersonType: PersonType | null;
}

export interface FaceBlurResult {
  imageRef: string;
  /** Number of faces detected in the image */
  facesDetected: number;
  /** Number of faces that were blurred */
  facesBlurred: number;
  /** True if any blur was applied */
  blurApplied: boolean;
  /** Output image reference after blurring (may be same as input if no blur) */
  outputRef: string;
  processedAt: string;
}

// ── shouldBlurFace ────────────────────────────────────────────────────────────

/**
 * Determine whether a face should be blurred based on the person's classification.
 * Public figures and organizations are exempt; private individuals and unknowns are blurred.
 *
 * Визначає чи потрібно розмивати обличчя залежно від типу особи.
 */
export function shouldBlurFace(personType: PersonType | null): boolean {
  if (!FACE_BLUR_ENABLED_FOR_PRIVATE) return false;
  if (personType === "public-figure" || personType === "organization") {
    return false;
  }
  // private-individual, location (unlikely), null (unknown) → blur
  return true;
}

// ── FaceBlurQueue ─────────────────────────────────────────────────────────────

/**
 * In-memory stub queue for face blur jobs.
 * In production, replace with a durable job queue (e.g. Temporal, SQS + Lambda).
 *
 * Черга розмиття облич. У продакшені — дурабл-черга (Temporal / SQS).
 */
export class FaceBlurQueue {
  private readonly queue: FaceBlurRequest[] = [];

  /**
   * Enqueue an image for face blur processing.
   *
   * Додати зображення до черги розмиття.
   */
  enqueue(request: FaceBlurRequest): void {
    if (!shouldBlurFace(request.inferredPersonType)) return;
    this.queue.push(request);
  }

  /**
   * Peek at pending items (read-only).
   *
   * Повернути список очікуючих елементів (тільки читання).
   */
  pending(): readonly FaceBlurRequest[] {
    return this.queue;
  }

  /**
   * Dequeue the oldest item for processing.
   *
   * Вийняти найстарший елемент для обробки.
   */
  dequeue(): FaceBlurRequest | undefined {
    return this.queue.shift();
  }

  size(): number {
    return this.queue.length;
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global face blur queue instance. */
export const faceBlurQueue = new FaceBlurQueue();
