/**
 * Playback recording export — queue MP4 / GIF export jobs.
 * Експорт запису відтворення — черга завдань для експорту MP4 / GIF.
 *
 * Enterprise-only feature. Capture is performed server-side via
 * Remotion or headless Puppeteer + ffmpeg. Jobs are queued and polled.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type ExportFormat = 'mp4' | 'gif';
export type ExportResolution = '720p' | '1080p' | '4k';
export type ExportJobStatus = 'queued' | 'capturing' | 'encoding' | 'done' | 'failed';

export interface PlaybackExportConfig {
  /** ISO date string — start of playback range. */
  fromDate: string;
  /** ISO date string — end of playback range. */
  toDate: string;
  /** Optional region name to constrain viewport. */
  region?: string;
  format: ExportFormat;
  /** Frames per second for the output video/GIF. */
  fps: number;
  /** How many real seconds equal one second of playback time. */
  speedMultiplier: number;
  resolution: ExportResolution;
}

export interface PlaybackExportJob {
  jobId: string;
  config: PlaybackExportConfig;
  status: ExportJobStatus;
  /** 0–100 progress percentage; undefined until job starts. */
  progressPct?: number;
  /** Signed download URL; populated when status === 'done'. */
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Queue class ───────────────────────────────────────────────────────────────

class PlaybackExportQueue {
  private jobs = new Map<string, PlaybackExportJob>();
  private seq = 0;

  /** Enqueue a new export job and return the job record. */
  enqueue(config: PlaybackExportConfig): PlaybackExportJob {
    const jobId = `pex-${++this.seq}-${Date.now()}`;
    const now = new Date().toISOString();
    const job: PlaybackExportJob = {
      jobId,
      config,
      status: 'queued',
      createdAt: now,
      updatedAt: now,
    };
    this.jobs.set(jobId, job);
    return job;
  }

  /** Update job status and optional fields. */
  update(
    jobId: string,
    patch: Partial<Pick<PlaybackExportJob, 'status' | 'progressPct' | 'downloadUrl'>>,
  ): PlaybackExportJob | undefined {
    const job = this.jobs.get(jobId);
    if (!job) return undefined;
    Object.assign(job, patch, { updatedAt: new Date().toISOString() });
    return job;
  }

  /** Get a job by ID. */
  get(jobId: string): PlaybackExportJob | undefined {
    return this.jobs.get(jobId);
  }

  /** List all jobs, newest first. */
  list(): PlaybackExportJob[] {
    return [...this.jobs.values()].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}

/** Singleton export queue instance. */
export const playbackExportQueue = new PlaybackExportQueue();

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const PLAYBACK_EXPORT_NOTES_EN: Record<string, string> = {
  'Remotion-or-Puppeteer':
    'Two capture backends are supported: ' +
    '(1) Remotion (remotion.dev) — declarative React-based video rendering, best for smooth animations; ' +
    '(2) Headless Puppeteer + ffmpeg — captures live map frames at the requested fps.',
  'server-side-capture':
    'All capture runs server-side to avoid browser memory limits. ' +
    'Trigger capture via POST /api/v1/map/playback-export and poll the returned jobId.',
  'enterprise-only':
    'Playback export is an enterprise-tier feature. ' +
    'Gate access with the billing credits-wallet tier check before enqueuing.',
};

export const PLAYBACK_EXPORT_NOTES_UK: Record<string, string> = {
  'Remotion-or-Puppeteer':
    'Підтримуються два бекенди захоплення: ' +
    '(1) Remotion (remotion.dev) — декларативний рендеринг відео на основі React, найкраще для плавних анімацій; ' +
    '(2) Headless Puppeteer + ffmpeg — захоплює кадри живої карти з вказаним fps.',
  'server-side-capture':
    'Усі захоплення виконуються на стороні сервера, щоб уникнути обмежень пам\'яті браузера. ' +
    'Запустіть захоплення через POST /api/v1/map/playback-export та опитуйте повернений jobId.',
  'enterprise-only':
    'Експорт відтворення є функцією корпоративного рівня. ' +
    'Перевіряйте доступ через перевірку рівня credits-wallet перед постановкою в чергу.',
};
