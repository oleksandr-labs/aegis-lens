/**
 * Task — Transcript fetch + STT fallback (where transcripts disabled).
 *
 * Two-stage transcript acquisition for a YouTube video:
 *   1. Caption track fetch (manual > ASR) via the timedtext endpoint / Data API.
 *   2. STT fallback when no caption track exists or captions are disabled — the
 *      audio is handed to a pluggable speech-to-text provider (Whisper, Google
 *      STT, …) through the `SttProvider` interface.
 *
 * The Data API only LISTS caption tracks (and downloading the body needs OAuth as
 * the channel owner). For public videos the practical path is the public
 * `timedtext` endpoint, which returns the SRV3/XML transcript without OAuth. This
 * module parses that into structured lines and exposes the STT handoff contract.
 */

import type { YTTranscriptLine } from "./types";
import type { YouTubeApiClient } from "./client";

const TIMEDTEXT_ENDPOINT = "https://www.youtube.com/api/timedtext";

export type TranscriptSource = "manual_caption" | "asr_caption" | "stt_fallback" | "none";

export interface TranscriptResult {
  videoId: string;
  source: TranscriptSource;
  lang?: string;
  lines: YTTranscriptLine[];
  /** Concatenated plain text (lines joined) — convenience for NLP. */
  text: string;
}

/**
 * Pluggable speech-to-text provider. The host wires Whisper / Google STT / a
 * self-hosted model. The integration never bundles a model — it only defines the
 * handoff contract so transcripts degrade gracefully.
 */
export interface SttProvider {
  /** Transcribe audio fetched for `videoId`. May return null if it cannot. */
  transcribe(input: {
    videoId: string;
    /** Preferred output language hint (BCP-47). */
    lang?: string;
  }): Promise<{ lang: string; lines: YTTranscriptLine[] } | null>;
}

/** Parse YouTube SRV3/timedtext XML into structured transcript lines. */
export function parseTimedTextXml(xml: string): YTTranscriptLine[] {
  const lines: YTTranscriptLine[] = [];
  // <text start="12.34" dur="3.2">caption text</text>
  const re = /<text[^>]*\bstart="([\d.]+)"[^>]*?(?:\bdur="([\d.]+)")?[^>]*>([\s\S]*?)<\/text>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const text = decodeXmlEntities(m[3]).replace(/\s+/g, " ").trim();
    if (!text) continue;
    lines.push({
      start: Number(m[1]),
      duration: m[2] ? Number(m[2]) : 0,
      text,
    });
  }
  return lines;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)));
}

export interface FetchTranscriptOptions {
  /** Preferred caption language (BCP-47); falls back to en then any. */
  lang?: string;
  /** STT provider used when no usable caption track exists. */
  stt?: SttProvider;
  /** Injectable fetch for testing. */
  fetchImpl?: typeof fetch;
}

/**
 * Fetch a transcript for a public video.
 *
 * Strategy: try the public timedtext endpoint in the preferred language, then
 * en, then ASR; if all fail and an STT provider is supplied, hand off to STT.
 */
export async function fetchTranscript(
  videoId: string,
  opts: FetchTranscriptOptions = {},
): Promise<TranscriptResult> {
  const doFetch = opts.fetchImpl ?? fetch;
  const langCandidates = dedupe([opts.lang, "uk", "en"].filter(Boolean) as string[]);

  // 1. manual / language captions
  for (const lang of langCandidates) {
    const lines = await tryTimedText(doFetch, videoId, { lang });
    if (lines.length) {
      return { videoId, source: "manual_caption", lang, lines, text: joinLines(lines) };
    }
  }

  // 2. auto-generated (ASR) captions — kind=asr
  for (const lang of langCandidates) {
    const lines = await tryTimedText(doFetch, videoId, { lang, asr: true });
    if (lines.length) {
      return { videoId, source: "asr_caption", lang, lines, text: joinLines(lines) };
    }
  }

  // 3. STT fallback
  if (opts.stt) {
    const stt = await opts.stt.transcribe({ videoId, lang: opts.lang });
    if (stt && stt.lines.length) {
      return {
        videoId,
        source: "stt_fallback",
        lang: stt.lang,
        lines: stt.lines,
        text: joinLines(stt.lines),
      };
    }
  }

  return { videoId, source: "none", lines: [], text: "" };
}

async function tryTimedText(
  doFetch: typeof fetch,
  videoId: string,
  opts: { lang: string; asr?: boolean },
): Promise<YTTranscriptLine[]> {
  try {
    const url = new URL(TIMEDTEXT_ENDPOINT);
    url.searchParams.set("v", videoId);
    url.searchParams.set("lang", opts.lang);
    url.searchParams.set("fmt", "srv3");
    if (opts.asr) url.searchParams.set("kind", "asr");
    const res = await doFetch(url.toString(), { headers: { "User-Agent": "AegisLens/1.0" } });
    if (!res.ok) return [];
    const xml = await res.text();
    return parseTimedTextXml(xml);
  } catch {
    return [];
  }
}

/**
 * Convenience: list a video's caption tracks via the Data API to decide whether
 * captions exist at all before spending an STT call. Returns the track id list.
 */
export async function listCaptionTracks(
  client: YouTubeApiClient,
  videoId: string,
  lang = "uk",
): Promise<string> {
  return client.getCaptionTrack(videoId, lang);
}

function joinLines(lines: YTTranscriptLine[]): string {
  return lines.map((l) => l.text).join(" ").replace(/\s+/g, " ").trim();
}

function dedupe(arr: string[]): string[] {
  return [...new Set(arr)];
}
