/**
 * Per-account ingest with content classification.
 *
 * Pulls public posts from a curated account and classifies each into a coarse
 * content class. The account's `side` (+ opposition label for RU) is stamped
 * onto every produced post and asserted via the side-label invariant — it is
 * NEVER inferred per-post and NEVER dropped.
 *
 * This module is platform-agnostic: a real deployment wires `fetchPosts` to the
 * Telegram Bot API client (`integrations/telegram/src/bot-api-client.ts`) or the
 * X client. A small DEMO fetcher is provided so the pipeline runs without
 * secrets. Public surfaces only — no user-account scraping.
 */

import type {
  MilbloggerAccount,
  RawPost,
  ClassifiedPost,
  ContentClass,
} from "./types";
import { assertSideLabel } from "./side-label";

export type PostFetcher = (account: MilbloggerAccount) => Promise<RawPost[]>;

/** Keyword heuristics → content class. Conservative; defaults to unclassified. */
const CLASS_HINTS: { cls: ContentClass; weight: number; terms: RegExp }[] = [
  { cls: "geolocation", weight: 0.9, terms: /\b(geoloc|coordinates|\d{2}\.\d+[,\s]+\d{2}\.\d+|geoconfirmed)\b/i },
  { cls: "strike_claim", weight: 0.8, terms: /\b(strike|hit|destroyed|удар|ураж|уничтож)\b/i },
  { cls: "equipment_loss", weight: 0.8, terms: /\b(tank|btr|bmp|howitzer|loss|танк|втрат|техн)\b/i },
  { cls: "official_statement", weight: 0.85, terms: /\b(general staff|ministry|генштаб|міноборони|минобороны)\b/i },
  { cls: "humanitarian", weight: 0.7, terms: /\b(civilian|evacuat|shelter|цивіл|евакуа|мирн)\b/i },
  { cls: "propaganda", weight: 0.6, terms: /\b(nazi|denazif|special operation|спецоперац)\b/i },
  { cls: "frontline_report", weight: 0.6, terms: /\b(front|advance|defen|фронт|наступ|оборон)\b/i },
  { cls: "analysis", weight: 0.5, terms: /\b(assess|analysis|likely|оцін|аналіз|вероятн)\b/i },
];

export function classifyContent(text: string): { contentClass: ContentClass; confidence: number } {
  let best: { contentClass: ContentClass; confidence: number } = {
    contentClass: "unclassified",
    confidence: 0.2,
  };
  for (const hint of CLASS_HINTS) {
    if (hint.weight > 0 && hint.terms.test(text)) {
      if (hint.weight > best.confidence) {
        best = { contentClass: hint.cls, confidence: hint.weight };
      }
    }
  }
  return best;
}

/** Ingest one account's posts → classified, side-labelled posts. */
export async function ingestAccount(
  account: MilbloggerAccount,
  fetcher: PostFetcher,
  sourceReputation?: number,
): Promise<ClassifiedPost[]> {
  const raw = await fetcher(account);
  return raw.map((post) => {
    const { contentClass, confidence } = classifyContent(post.text);
    const classified: ClassifiedPost = {
      ...post,
      // Side + opposition label are STAMPED from the account, never inferred.
      side: account.side,
      oppositionLabel: account.oppositionLabel,
      contentClass,
      classConfidence: confidence,
      tags: account.tags,
      sourceReputation: sourceReputation ?? account.reputation,
    };
    // Fail loudly if the invariant is ever violated.
    return assertSideLabel(classified) as ClassifiedPost;
  });
}

/** Demo fetcher — deterministic fixture so the pipeline runs without secrets. */
export const demoFetcher: PostFetcher = async (account) => {
  const now = "2026-06-06T08:00:00Z";
  const base = account.side === "ru"
    ? "Сводка: ПВО отразила удар, продвижение на фронте."
    : "Report: strike confirmed, equipment loss documented; geolocation pending.";
  return [
    {
      accountId: account.id,
      postId: `${account.id}:demo-1`,
      url: `https://example.invalid/${account.handle}/1`,
      text: base,
      language: account.language,
      publishedAt: now,
      mediaUrls: [],
    },
  ];
};
