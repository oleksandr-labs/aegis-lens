import {
  VisionJob,
  VisionJobStatus,
  VisionTaskType,
  VisionResult,
  MediaType,
} from "./types";

/** In-memory job store — replace with BullMQ or pg-boss in production. */
const jobs = new Map<string, VisionJob>();
const results = new Map<string, VisionResult>();

let jobCounter = 0;

export function createJob(params: {
  mediaId: string;
  mediaType: MediaType;
  mediaUrl?: string;
  tasks: VisionTaskType[];
  priority?: VisionJob["priority"];
  orgId?: string;
}): VisionJob {
  const jobId = `vision-${++jobCounter}-${Date.now()}`;
  const job: VisionJob = {
    jobId,
    mediaId: params.mediaId,
    mediaType: params.mediaType,
    mediaUrl: params.mediaUrl,
    tasks: params.tasks,
    status: "pending",
    priority: params.priority ?? "normal",
    orgId: params.orgId,
    queuedAt: new Date().toISOString(),
  };
  jobs.set(jobId, job);
  return job;
}

export function getJob(jobId: string): VisionJob | undefined {
  return jobs.get(jobId);
}

export function getResult(jobId: string): VisionResult | undefined {
  return results.get(jobId);
}

export function listJobs(orgId?: string, status?: VisionJobStatus): VisionJob[] {
  return [...jobs.values()].filter((j) => {
    if (orgId && j.orgId !== orgId) return false;
    if (status && j.status !== status) return false;
    return true;
  });
}

/** Mark job as processing. Called by the worker when it picks it up. */
export function markProcessing(jobId: string): void {
  const job = jobs.get(jobId);
  if (job) jobs.set(jobId, { ...job, status: "processing", startedAt: new Date().toISOString() });
}

/** Complete a job with its results. */
export function completeJob(jobId: string, result: VisionResult): void {
  const job = jobs.get(jobId);
  if (job) {
    jobs.set(jobId, { ...job, status: "done", finishedAt: new Date().toISOString() });
    results.set(jobId, result);
  }
}

/** Fail a job with an error message. */
export function failJob(jobId: string, error: string): void {
  const job = jobs.get(jobId);
  if (job) jobs.set(jobId, { ...job, status: "failed", finishedAt: new Date().toISOString(), error });
}

/** Return pending jobs ordered by priority (high first), then queue time. */
export function dequeuePendingJobs(limit = 10): VisionJob[] {
  const priority: Record<string, number> = { high: 0, normal: 1, low: 2 };
  return [...jobs.values()]
    .filter((j) => j.status === "pending")
    .sort((a, b) => {
      const pd = priority[a.priority] - priority[b.priority];
      if (pd !== 0) return pd;
      return new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime();
    })
    .slice(0, limit);
}

/** Cost estimate: number of GPU-seconds for a job (rough heuristic). */
export function estimateGpuSeconds(tasks: VisionTaskType[], mediaType: MediaType): number {
  const taskCosts: Record<VisionTaskType, number> = {
    object_detection: mediaType === "video" ? 30 : 2,
    ocr: 1,
    reverse_image_search: 5,
    deepfake_detection: 8,
    exif_extraction: 0.1,
    sun_angle_analysis: 3,
    burn_scar_detection: 10,
    change_detection: 15,
  };
  return tasks.reduce((sum, t) => sum + (taskCosts[t] ?? 2), 0);
}
