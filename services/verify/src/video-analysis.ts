/**
 * Video verification pipeline — scene cuts, audio fingerprinting, speech-to-text,
 * synthetic-voice detection, and re-upload chain tracing.
 *
 * Each sub-analysis is independently typed so callers can opt in to only the
 * checks they need. All sub-analyses are stubs; replace with real service calls.
 *
 * NOTES:
 * 1. FFmpeg (EN): FFmpeg scene-cut detection via libx264 scene filter or PySceneDetect.
 *    FFmpeg (UK): Виявлення монтажних склейок через фільтр сцен libx264 або PySceneDetect.
 * 2. ACRCloud (EN): ACRCloud audio fingerprinting API — detects recycled audio tracks.
 *    ACRCloud (UK): API аудіо-відбитків ACRCloud — виявляє повторно використані аудіодоріжки.
 * 3. Whisper (EN): OpenAI Whisper for speech-to-text + language detection.
 *    Whisper (UK): OpenAI Whisper для розпізнавання мовлення + виявлення мови.
 * 4. NVIDIA NeMo (EN): NVIDIA NeMo TTS detection model for synthetic-voice classification.
 *    NVIDIA NeMo (UK): Модель виявлення TTS NVIDIA NeMo для класифікації синтетичного голосу.
 * 5. CrowdTangle (EN): CrowdTangle / Telegram API for re-upload chain tracing across platforms.
 *    CrowdTangle (UK): CrowdTangle / Telegram API для відстеження ланцюга повторних завантажень.
 */

// ── Sub-analysis types ────────────────────────────────────────────────────────

export interface SceneCut {
  timestampSec: number;
  /** URL of sampled thumbnail for this scene (optional) */
  thumbnailUrl?: string;
}

export interface AudioFingerprint {
  /** ID of the matched track in the fingerprint database, if any */
  matchedId?: string;
  /** True if the audio was found in a known recycled-audio corpus */
  recycled: boolean;
}

export interface SpeechToTextResult {
  text: string;
  /** BCP-47 language code */
  language: string;
  /** High-level claim sentences extracted from transcript */
  claims: string[];
}

export interface ReuploadEntry {
  platform: "telegram" | "twitter" | "facebook" | "youtube" | "tiktok" | "instagram" | "other";
  accountId?: string;
  /** ISO-8601 */
  uploadedAt: string;
  url: string;
  isFirst: boolean;
}

// ── Main result ───────────────────────────────────────────────────────────────

export interface VideoAnalysisResult {
  videoUrl: string;
  durationSec?: number;
  sceneCuts: SceneCut[];
  audioFingerprint?: AudioFingerprint;
  speechToText?: SpeechToTextResult;
  /** 0–1 confidence that the voice is synthetic */
  syntheticVoiceScore?: number;
  reuploadChain?: ReuploadEntry[];
  analyzedAt: string;
}

// ── Bilingual notes ───────────────────────────────────────────────────────────

export const VIDEO_ANALYSIS_NOTES_EN = [
  "FFmpeg: scene-cut detection via libx264 scene filter or PySceneDetect; each cut is sampled for per-frame checks.",
  "ACRCloud: audio fingerprinting API identifies recycled audio from news broadcasts or prior conflict videos.",
  "Whisper (OpenAI): multilingual speech-to-text with language detection; transcript used for claim extraction.",
  "NVIDIA NeMo TTS detection: classifies whether the audio track contains synthetic (TTS) speech.",
  "CrowdTangle / Telegram API: traces re-upload chain to identify first-seen platform and account.",
] as const;

export const VIDEO_ANALYSIS_NOTES_UK = [
  "FFmpeg: виявлення монтажних склейок через PySceneDetect або фільтр libx264; кожна склейка семплується для покадрових перевірок.",
  "ACRCloud: API аудіо-відбитків виявляє повторно використані аудіодоріжки з новин або попередніх конфліктних відео.",
  "Whisper (OpenAI): багатомовне розпізнавання мовлення з виявленням мови; транскрипт використовується для витягу заявок.",
  "NVIDIA NeMo TTS detection: класифікує, чи містить аудіодоріжка синтетичне (TTS) мовлення.",
  "CrowdTangle / Telegram API: відстежує ланцюг повторних завантажень для визначення першої платформи та акаунту.",
] as const;

// ── Stub analyzer ─────────────────────────────────────────────────────────────

class VideoAnalyzer {
  /** Stub: detect scene cuts via FFmpeg-style heuristics. */
  async analyzeSceneCuts(videoUrl: string): Promise<SceneCut[]> {
    void videoUrl;
    return [];
  }

  /** Stub: audio fingerprint via ACRCloud. */
  async analyzeAudio(videoUrl: string): Promise<AudioFingerprint> {
    void videoUrl;
    return { recycled: false };
  }

  /** Stub: speech-to-text via Whisper. */
  async analyzeSpeech(videoUrl: string): Promise<SpeechToTextResult> {
    void videoUrl;
    return { text: "", language: "und", claims: [] };
  }

  /** Stub: synthetic-voice score via NVIDIA NeMo. */
  async detectSyntheticVoice(videoUrl: string): Promise<number> {
    void videoUrl;
    return 0;
  }

  /** Stub: re-upload chain via CrowdTangle / Telegram API. */
  async traceReuploadChain(videoUrl: string): Promise<ReuploadEntry[]> {
    void videoUrl;
    return [];
  }

  /** Run all sub-analyses and return combined result. */
  async analyze(videoUrl: string): Promise<VideoAnalysisResult> {
    const [sceneCuts, audioFingerprint, speechToText, syntheticVoiceScore, reuploadChain] =
      await Promise.all([
        this.analyzeSceneCuts(videoUrl),
        this.analyzeAudio(videoUrl),
        this.analyzeSpeech(videoUrl),
        this.detectSyntheticVoice(videoUrl),
        this.traceReuploadChain(videoUrl),
      ]);
    return {
      videoUrl,
      sceneCuts,
      audioFingerprint,
      speechToText,
      syntheticVoiceScore,
      reuploadChain,
      analyzedAt: new Date().toISOString(),
    };
  }
}

export const videoAnalyzer = new VideoAnalyzer();
