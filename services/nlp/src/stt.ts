/**
 * Speech-to-Text (STT) — codeable contract.
 *
 * Audio sources for Aegis Lens: Telegram voice notes, intercepted radio, TV/stream
 * audio, field reports. This module defines the typed interface + confidence schema
 * for transcription, speaker diarization, and per-language decoding calibration,
 * with a REST-backed Whisper engine and an offline `StubTranscriber` fallback.
 *
 * Production engine: Whisper-large-v3 (self-hosted, e.g. faster-whisper / whisper.cpp
 * server). NO weights are bundled — the endpoint URL comes from `process.env`
 * (documented in COMPLIANCE.md). UK / RU / EN are tier-1 decode languages and get
 * dedicated calibration profiles (initial prompt, temperature, beam size); other
 * languages fall back to a default profile.
 *
 * Diarization ("who spoke when") is a separate model (e.g. pyannote). We expose it
 * behind a `Diarizer` interface and merge its speaker turns onto the transcript
 * segments by time-overlap, so a transcript can be attributed per speaker without
 * coupling the two models.
 */

import type { SupportedLocale } from "./types";

// ── Result schema ───────────────────────────────────────────────────────────

/** One time-aligned transcript segment. */
export interface TranscriptSegment {
  /** Segment start / end in seconds. */
  start: number;
  end: number;
  text: string;
  /** 0-1 confidence derived from avg token logprob (mapped to 0-1). */
  confidence: number;
  /** Speaker label assigned by diarization (e.g. "SPEAKER_00"), if available. */
  speaker?: string;
}

export interface TranscriptionResult {
  /** Full transcript (segments joined). */
  text: string;
  segments: TranscriptSegment[];
  /** Detected (or forced) decode language. */
  language: SupportedLocale;
  /** Mean segment confidence. */
  confidence: number;
  /** Engine id, e.g. "whisper-large-v3" or "stub". */
  engine: string;
  /** Audio duration in seconds, if reported. */
  durationSec?: number;
  processingMs: number;
}

/** A diarization speaker turn. */
export interface SpeakerTurn {
  speaker: string;
  start: number;
  end: number;
}

export interface DiarizationResult {
  turns: SpeakerTurn[];
  /** Number of distinct speakers detected. */
  speakerCount: number;
  engine: string;
}

// ── Per-language calibration profiles ──────────────────────────────────────────

export interface DecodeProfile {
  /** Whisper decode language code. */
  language: SupportedLocale;
  /** Sampling temperature (0 = greedy, deterministic). */
  temperature: number;
  /** Beam width for beam search. */
  beamSize: number;
  /**
   * Domain initial prompt biasing the decoder toward in-vocabulary terms
   * (place names, equipment) so transliterations are spelled consistently.
   */
  initialPrompt: string;
  /** Drop a segment whose confidence is below this. */
  minSegmentConfidence: number;
}

/**
 * Tier-1 calibration for UK / RU / EN. The initial prompts seed the decoder with
 * domain vocabulary so e.g. "Shahed" / "Шахед" / "Калібр" come out spelled the way
 * the NER patterns expect, improving downstream entity-extraction recall.
 */
export const DECODE_PROFILES: Record<string, DecodeProfile> = {
  uk: {
    language: "uk",
    temperature: 0,
    beamSize: 5,
    initialPrompt:
      "Зведення про обстріли, дрони Шахед, ракети Калібр та Кинджал, ППО, ЗСУ, області України.",
    minSegmentConfidence: 0.35,
  },
  ru: {
    language: "ru",
    temperature: 0,
    beamSize: 5,
    initialPrompt:
      "Сводка о обстрелах, беспилотниках Шахед, ракетах Калибр и Кинжал, ПВО, военные подразделения.",
    minSegmentConfidence: 0.35,
  },
  en: {
    language: "en",
    temperature: 0,
    beamSize: 5,
    initialPrompt:
      "OSINT report on shelling, Shahed drones, Kalibr and Kinzhal missiles, air defense, Ukrainian oblasts.",
    minSegmentConfidence: 0.4,
  },
};

const DEFAULT_PROFILE: DecodeProfile = {
  language: "uk",
  temperature: 0.2,
  beamSize: 1,
  initialPrompt: "",
  minSegmentConfidence: 0.3,
};

/** Resolve the decode profile for a (possibly unknown) language. */
export function resolveDecodeProfile(language?: string): DecodeProfile {
  if (!language) return DEFAULT_PROFILE;
  return DECODE_PROFILES[language] ?? { ...DEFAULT_PROFILE, language };
}

// ── Transcriber interface ──────────────────────────────────────────────────────

export interface TranscribeOptions {
  /** Force a decode language; if omitted, the engine auto-detects. */
  language?: SupportedLocale;
  /** Override the calibration profile (otherwise resolved from language). */
  profile?: DecodeProfile;
}

export interface Transcriber {
  transcribe(audioRef: string, opts?: TranscribeOptions): Promise<TranscriptionResult>;
}

export interface Diarizer {
  diarize(audioRef: string): Promise<DiarizationResult>;
}

function meanSegmentConfidence(segments: TranscriptSegment[]): number {
  if (segments.length === 0) return 0;
  return parseFloat(
    (segments.reduce((s, x) => s + x.confidence, 0) / segments.length).toFixed(3),
  );
}

// ── Whisper REST transcriber ────────────────────────────────────────────────

interface WhisperSegment {
  start: number;
  end: number;
  text: string;
  /** avg log-prob; we map to 0-1. */
  avg_logprob?: number;
}

/** Map Whisper's avg token logprob (typically -1..0) to a 0-1 confidence. */
function logprobToConfidence(avgLogprob?: number): number {
  if (avgLogprob === undefined) return 0.7;
  // exp(avg_logprob) is the geometric-mean token probability.
  return parseFloat(Math.min(1, Math.max(0, Math.exp(avgLogprob))).toFixed(3));
}

/**
 * REST-backed Whisper-large-v3 engine. Applies the resolved calibration profile
 * (language, temperature, beam size, initial prompt). Falls back to the stub on
 * any error so transcription is an optional enrichment, never a hard failure.
 */
export class WhisperTranscriber implements Transcriber {
  constructor(
    private readonly endpoint: string,
    private readonly model = "whisper-large-v3",
  ) {}

  async transcribe(audioRef: string, opts: TranscribeOptions = {}): Promise<TranscriptionResult> {
    const startedAt = Date.now();
    const profile = opts.profile ?? resolveDecodeProfile(opts.language);
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audio: audioRef,
          model: this.model,
          language: opts.language ?? profile.language,
          temperature: profile.temperature,
          beam_size: profile.beamSize,
          initial_prompt: profile.initialPrompt,
        }),
      });
      if (!res.ok) return new StubTranscriber().transcribe(audioRef, opts);

      const data = (await res.json()) as {
        segments: WhisperSegment[];
        language?: string;
        duration?: number;
      };

      const segments: TranscriptSegment[] = (data.segments ?? [])
        .map((s) => ({
          start: s.start,
          end: s.end,
          text: s.text.trim(),
          confidence: logprobToConfidence(s.avg_logprob),
        }))
        .filter((s) => s.confidence >= profile.minSegmentConfidence && s.text.length > 0);

      const text = segments.map((s) => s.text).join(" ").trim();
      return {
        text,
        segments,
        language: (data.language as SupportedLocale) ?? profile.language,
        confidence: meanSegmentConfidence(segments),
        engine: this.model,
        durationSec: data.duration,
        processingMs: Date.now() - startedAt,
      };
    } catch {
      return new StubTranscriber().transcribe(audioRef, opts);
    }
  }
}

/** Offline stub — empty transcript, used in CI / dev without a Whisper server. */
export class StubTranscriber implements Transcriber {
  async transcribe(_audioRef: string, opts: TranscribeOptions = {}): Promise<TranscriptionResult> {
    const profile = opts.profile ?? resolveDecodeProfile(opts.language);
    return {
      text: "",
      segments: [],
      language: profile.language,
      confidence: 0,
      engine: "stub",
      processingMs: 0,
    };
  }
}

// ── Diarization ───────────────────────────────────────────────────────────────

/** REST-backed diarizer (e.g. pyannote server). Returns no turns on failure. */
export class RestDiarizer implements Diarizer {
  constructor(private readonly endpoint: string, private readonly engine = "pyannote") {}

  async diarize(audioRef: string): Promise<DiarizationResult> {
    try {
      const res = await fetch(this.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: audioRef }),
      });
      if (!res.ok) return { turns: [], speakerCount: 0, engine: `${this.engine} (unavailable)` };
      const data = (await res.json()) as { turns: SpeakerTurn[] };
      const turns = data.turns ?? [];
      return {
        turns,
        speakerCount: new Set(turns.map((t) => t.speaker)).size,
        engine: this.engine,
      };
    } catch {
      return { turns: [], speakerCount: 0, engine: `${this.engine} (unavailable)` };
    }
  }
}

/**
 * Merge diarization speaker turns onto transcript segments by max time-overlap.
 * Each segment is assigned the speaker whose turn overlaps it most.
 */
export function attachSpeakers(
  transcription: TranscriptionResult,
  diarization: DiarizationResult,
): TranscriptionResult {
  if (diarization.turns.length === 0) return transcription;

  const segments = transcription.segments.map((seg) => {
    let bestSpeaker: string | undefined;
    let bestOverlap = 0;
    for (const turn of diarization.turns) {
      const overlap = Math.min(seg.end, turn.end) - Math.max(seg.start, turn.start);
      if (overlap > bestOverlap) {
        bestOverlap = overlap;
        bestSpeaker = turn.speaker;
      }
    }
    return bestOverlap > 0 ? { ...seg, speaker: bestSpeaker } : seg;
  });

  return { ...transcription, segments };
}

/**
 * Convenience: transcribe + diarize + attach speakers in one call.
 * Both stages run in parallel; diarization failure degrades gracefully to an
 * un-attributed transcript.
 */
export async function transcribeWithSpeakers(
  transcriber: Transcriber,
  diarizer: Diarizer,
  audioRef: string,
  opts?: TranscribeOptions,
): Promise<TranscriptionResult> {
  const [t, d] = await Promise.all([
    transcriber.transcribe(audioRef, opts),
    diarizer.diarize(audioRef).catch(() => ({ turns: [], speakerCount: 0, engine: "none" })),
  ]);
  return attachSpeakers(t, d);
}
