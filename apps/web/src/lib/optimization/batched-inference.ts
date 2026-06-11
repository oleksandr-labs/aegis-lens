/**
 * Batched inference for OCR and computer vision models.
 *
 * GPU inference engines (ONNX Runtime, TensorRT, etc.) achieve highest
 * throughput when processing images in batches rather than one-at-a-time.
 *
 * BatchProcessor accumulates items and flushes them either when the batch
 * reaches maxBatchSize or when the timeoutMs deadline fires, whichever
 * comes first.
 *
 * Usage:
 *   const ocr = createOcrBatcher(myOnnxOcrFn);
 *   const text = await ocr.add(imageBuffer);
 */

export interface InferenceBatch<T, R> {
  items: T[];
  maxBatchSize: number;
  timeoutMs: number;
  processFn: (batch: T[]) => Promise<R[]>;
}

interface PendingItem<T, R> {
  item: T;
  resolve: (result: R) => void;
  reject: (err: unknown) => void;
}

/**
 * Timer-based batch processor.
 *
 * Thread-safety note: Node.js is single-threaded so the pending queue
 * mutation is race-free. Do not use this class in multi-threaded runtimes
 * without additional synchronisation.
 */
export class BatchProcessor<T, R> {
  private pending: PendingItem<T, R>[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly maxBatchSize: number,
    private readonly timeoutMs: number,
    private readonly processFn: (batch: T[]) => Promise<R[]>
  ) {}

  /**
   * Add one item to the current batch.
   * Returns a Promise that resolves with the inference result for this item.
   */
  add(item: T): Promise<R> {
    return new Promise<R>((resolve, reject) => {
      this.pending.push({ item, resolve, reject });

      if (this.pending.length >= this.maxBatchSize) {
        this.flushNow();
      } else if (!this.timer) {
        this.timer = setTimeout(() => this.flushNow(), this.timeoutMs);
      }
    });
  }

  /** Force immediate processing of all pending items. */
  async flush(): Promise<void> {
    this.flushNow();
  }

  private flushNow(): void {
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.pending.length === 0) return;

    const batch = this.pending.splice(0, this.maxBatchSize);

    this.processFn(batch.map((p) => p.item))
      .then((results) => {
        if (results.length !== batch.length) {
          const err = new Error(
            `BatchProcessor: processFn returned ${results.length} results for ${batch.length} items`
          );
          for (const p of batch) p.reject(err);
          return;
        }
        for (let i = 0; i < batch.length; i++) {
          batch[i].resolve(results[i]);
        }
      })
      .catch((err) => {
        for (const p of batch) p.reject(err);
      });
  }
}

/**
 * Create a pre-configured OCR batcher.
 *
 * Batch size 8 — typical GPU memory allows 8× A4 pages at 300 DPI simultaneously.
 * Timeout 100ms — balances latency vs. throughput for interactive use.
 *
 * @param processFn - Function that accepts a batch of image Buffers and returns OCR strings.
 */
export function createOcrBatcher(
  processFn: (imgs: Buffer[]) => Promise<string[]>
): BatchProcessor<Buffer, string> {
  return new BatchProcessor<Buffer, string>(8, 100, processFn);
}

/**
 * Create a pre-configured computer vision batcher.
 *
 * Batch size 4 — CV models (YOLOv8, CLIP, etc.) are heavier than OCR;
 *   smaller batches avoid GPU OOM on mid-range hardware.
 * Timeout 50ms — lower latency target for real-time video/image triage.
 *
 * @param processFn - Function that accepts a batch of image Buffers and returns typed results.
 */
export function createCvBatcher<R>(
  processFn: (imgs: Buffer[]) => Promise<R[]>
): BatchProcessor<Buffer, R> {
  return new BatchProcessor<Buffer, R>(4, 50, processFn);
}
