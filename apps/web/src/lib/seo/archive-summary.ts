import type { AegisEvent, EventClass } from "@aegis/types";
import type { Locale } from "@aegis/i18n-config";
import { SITE } from "@/lib/site";

/**
 * Auto-generated archive summary — a grounded, citation-bearing recap of an
 * archive period (month / week / region) for the date-archive pages.
 *
 * Loose-coupled to any AI provider: a `Summarizer` function is injected. When
 * none is supplied (build time, no key, network unavailable) we fall back to a
 * deterministic, fully-grounded extractive summary built only from the event
 * data already on the page — so the page is never blank and never asserts
 * anything the events don't support. Every summary carries explicit
 * `citations` (event permalinks) and a `caveat` about provenance/uncertainty.
 */

const CLASS_LABEL: Record<EventClass, { en: string; uk: string }> = {
  military_action: { en: "military action", uk: "військові дії" },
  infrastructure: { en: "infrastructure", uk: "інфраструктура" },
  civilian_alert: { en: "civilian alerts", uk: "сповіщення для цивільних" },
  humanitarian: { en: "humanitarian", uk: "гуманітарні" },
  cyber: { en: "cyber", uk: "кібер" },
  maritime: { en: "maritime", uk: "морські" },
  aviation: { en: "aviation", uk: "авіаційні" },
  environmental: { en: "environmental", uk: "екологічні" },
  political: { en: "political", uk: "політичні" },
  economic: { en: "economic", uk: "економічні" },
};

const CAVEAT: Record<Locale | "en", string> = {
  en: "Auto-generated from verified Aegis Lens events for this period. Figures reflect ingested data only and may be revised as sources are corroborated or retracted. Not an exhaustive account.",
  uk: "Згенеровано автоматично з перевірених подій Aegis Lens за цей період. Дані відображають лише зібрану інформацію та можуть бути уточнені в міру підтвердження або спростування джерел. Не є вичерпним описом.",
} as Record<Locale | "en", string>;

export type Citation = { eventId: string; url: string; title: string };

export type ArchiveSummary = {
  /** The grounded prose summary in the requested locale. */
  text: string;
  /** Event permalinks the summary is grounded in. */
  citations: Citation[];
  /** Provenance / uncertainty disclaimer. */
  caveat: string;
  /** True when produced by the deterministic fallback (no AI). */
  grounded: boolean;
};

/** Injectable model call. Must return grounded prose or throw. */
export type Summarizer = (input: {
  locale: Locale;
  events: AegisEvent[];
  periodLabel: string;
}) => Promise<string>;

function localized(map: { en: string; uk: string }, locale: Locale): string {
  return (map as Record<string, string>)[locale] ?? map.en;
}

function caveatFor(locale: Locale): string {
  return CAVEAT[locale] ?? CAVEAT.en;
}

/** Top-N events by danger × confidence — the period's most salient items. */
export function rankSalient(events: AegisEvent[], n = 5): AegisEvent[] {
  return [...events]
    .sort(
      (a, b) =>
        b.dangerScore * (b.confidence || 0.5) -
        a.dangerScore * (a.confidence || 0.5),
    )
    .slice(0, n);
}

function citationsFor(events: AegisEvent[], locale: Locale): Citation[] {
  return events.map((e) => ({
    eventId: e.eventId,
    url: `${SITE.url}/events/${e.eventId}`,
    title: e.summary[locale] ?? e.summary.en,
  }));
}

/**
 * Deterministic, fully-grounded extractive summary. No external calls; built
 * purely from event counts + the most salient items. Used as the fallback and
 * as a unit-testable baseline.
 */
export function extractiveSummary(
  events: AegisEvent[],
  periodLabel: string,
  locale: Locale,
): ArchiveSummary {
  const salient = rankSalient(events, 5);
  const byClass = new Map<EventClass, number>();
  for (const e of events) byClass.set(e.class, (byClass.get(e.class) ?? 0) + 1);
  const topClasses = [...byClass.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cls, n]) => `${localized(CLASS_LABEL[cls], locale)} (${n})`);

  const lead =
    locale === "uk"
      ? `За період ${periodLabel} зафіксовано ${events.length} перевірених подій.`
      : `${events.length} verified events were recorded in ${periodLabel}.`;
  const classLine = topClasses.length
    ? locale === "uk"
      ? ` Найчастіші категорії: ${topClasses.join(", ")}.`
      : ` Most frequent categories: ${topClasses.join(", ")}.`
    : "";
  const salientLine = salient.length
    ? locale === "uk"
      ? ` Найвагоміші події: ${salient
          .map((e) => e.summary[locale] ?? e.summary.en)
          .join("; ")}.`
      : ` Most significant: ${salient
          .map((e) => e.summary[locale] ?? e.summary.en)
          .join("; ")}.`
    : "";

  return {
    text: `${lead}${classLine}${salientLine}`.trim(),
    citations: citationsFor(salient, locale),
    caveat: caveatFor(locale),
    grounded: true,
  };
}

/**
 * Build an archive summary. Attempts the injected `summarizer` (AI), but
 * fails soft to the deterministic extractive summary on any error or when no
 * summarizer is provided. Citations + caveat are always attached from the
 * grounding events — even on the AI path — so the page never cites something
 * outside the period's event set.
 */
export async function buildArchiveSummary(args: {
  events: AegisEvent[];
  periodLabel: string;
  locale: Locale;
  summarizer?: Summarizer;
}): Promise<ArchiveSummary> {
  const { events, periodLabel, locale, summarizer } = args;
  if (events.length === 0) {
    return {
      text:
        locale === "uk"
          ? `За період ${periodLabel} перевірених подій не зафіксовано.`
          : `No verified events were recorded in ${periodLabel}.`,
      citations: [],
      caveat: caveatFor(locale),
      grounded: true,
    };
  }
  if (!summarizer) {
    return extractiveSummary(events, periodLabel, locale);
  }
  try {
    const text = await summarizer({ locale, events, periodLabel });
    const trimmed = (text ?? "").trim();
    if (!trimmed) return extractiveSummary(events, periodLabel, locale);
    return {
      text: trimmed,
      citations: citationsFor(rankSalient(events, 5), locale),
      caveat: caveatFor(locale),
      grounded: false,
    };
  } catch {
    // Fail soft — never let a model error break an archive page.
    return extractiveSummary(events, periodLabel, locale);
  }
}
