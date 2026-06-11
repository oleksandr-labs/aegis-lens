/**
 * Web Worker pool factory for heavy client-side parsing tasks.
 *
 * Actual worker implementations live in `apps/web/src/workers/`.
 * This module exports typed pool factories used by map and data components.
 *
 * Worker files follow the `*.worker.ts` convention and are bundled
 * separately by the Next.js webpack config via the `worker-loader` pattern.
 */

/** Tasks that are offloaded to Web Workers. */
export type WorkerTask =
  | "parse_geojson"
  | "decode_mvt"
  | "cluster_events"
  | "compute_heatmap";

export interface WorkerTaskConfig {
  /** Path to the worker script, relative to the public/workers/ bundle output. */
  workerPath: string;
  /** Whether to use Transferable objects (ArrayBuffer) to avoid data copies. */
  transferable: boolean;
  /** Maximum number of concurrent worker instances for this task. */
  maxConcurrent: number;
}

export type WorkerConfig = Record<WorkerTask, WorkerTaskConfig>;

export const WORKER_CONFIGS: WorkerConfig = {
  parse_geojson: {
    workerPath: "/workers/parse-geojson.worker.js",
    transferable: false,
    maxConcurrent: 2,
  },
  decode_mvt: {
    workerPath: "/workers/decode-mvt.worker.js",
    transferable: true,
    maxConcurrent: 4,
  },
  cluster_events: {
    workerPath: "/workers/cluster-events.worker.js",
    transferable: true,
    maxConcurrent: 2,
  },
  compute_heatmap: {
    workerPath: "/workers/compute-heatmap.worker.js",
    transferable: true,
    maxConcurrent: 2,
  },
};

/** Typed worker pool interface returned by createWorkerPool. */
export interface WorkerPool {
  /**
   * Post a message to the worker pool and receive a typed response.
   * Automatically picks an idle worker from the pool.
   */
  postMessage<T, R>(data: T): Promise<R>;
  /** Terminate all workers in the pool immediately. */
  terminate(): void;
}

/**
 * Creates a typed worker pool for the given task.
 *
 * In a browser environment this spawns up to `maxConcurrent` Web Worker
 * instances and round-robins messages across idle workers.
 *
 * Falls back to a no-op pool (synchronous fn call via structuredClone)
 * in SSR / test environments where `Worker` is not available.
 *
 * @param task - The worker task type to create a pool for.
 */
export function createWorkerPool(task: WorkerTask): WorkerPool {
  const config = WORKER_CONFIGS[task];
  const workers: Worker[] = [];
  let nextWorker = 0;

  function ensureWorkers() {
    if (typeof Worker === "undefined") return;
    while (workers.length < config.maxConcurrent) {
      workers.push(new Worker(config.workerPath));
    }
  }

  return {
    postMessage<T, R>(data: T): Promise<R> {
      return new Promise<R>((resolve, reject) => {
        if (typeof Worker === "undefined") {
          // SSR/test: fall back to synchronous JSON round-trip
          try {
            resolve(structuredClone(data) as unknown as R);
          } catch (err) {
            reject(err);
          }
          return;
        }

        ensureWorkers();
        const worker = workers[nextWorker % workers.length];
        nextWorker = (nextWorker + 1) % workers.length;

        const id = crypto.randomUUID();

        const handler = (e: MessageEvent) => {
          if (e.data?.id !== id) return;
          worker.removeEventListener("message", handler);
          worker.removeEventListener("error", errorHandler);
          if (e.data.error) {
            reject(new Error(e.data.error));
          } else {
            resolve(e.data.result as R);
          }
        };

        const errorHandler = (e: ErrorEvent) => {
          worker.removeEventListener("message", handler);
          worker.removeEventListener("error", errorHandler);
          reject(new Error(e.message));
        };

        worker.addEventListener("message", handler);
        worker.addEventListener("error", errorHandler);

        const transferables: Transferable[] =
          config.transferable && data instanceof ArrayBuffer ? [data] : [];

        worker.postMessage({ id, ...(data as object) }, transferables);
      });
    },

    terminate() {
      for (const w of workers) {
        w.terminate();
      }
      workers.length = 0;
    },
  };
}
