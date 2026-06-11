/**
 * Side-by-side narrative comparison (UA/INT framing vs RU framing of one event).
 *
 * This is the explicit "show both sides for analysis" surface — and the place
 * where NO FALSE EQUIVALENCE is enforced in the product:
 *
 *   - The two columns are NOT presented as equally credible. The RU column is
 *     always rendered with its opposition label and a disclaimer.
 *   - Per-side aggregate reputation is shown so the asymmetry is explicit.
 *   - This view never *merges* the claims into a single "truth"; it contrasts
 *     how each side frames the same underlying event.
 */

import type { ClassifiedPost, L10nText } from "./types";
import { SIDE_LABELS, assertSideLabel } from "./side-label";

export interface NarrativeColumn {
  /** "aligned" = UA + INT (same camp); "ru" = opposing. */
  camp: "aligned" | "ru";
  label: L10nText;
  posts: ClassifiedPost[];
  /** Mean source reputation in this column. */
  avgReputation: number;
  /** Present only for the RU column. */
  oppositionLabel?: L10nText;
}

export interface NarrativeComparison {
  /** Event signature the two columns describe. */
  eventKey: string;
  aligned: NarrativeColumn;
  ru: NarrativeColumn | null;
  /** Mandatory disclaimer rendered above the comparison. */
  disclaimer: L10nText;
}

const DISCLAIMER: L10nText = {
  en: "Both framings are shown for analysis. They are NOT equally credible: the Russian-side column is opposing-narrative material tracked for comparison only, not verified reporting.",
  uk: "Обидва трактування показані для аналізу. Вони НЕ є однаково достовірними: колонка російської сторони — це матеріали протилежного наративу, що відстежуються лише для порівняння, а не перевірена інформація.",
  ru: "Оба трактования показаны для анализа. Они НЕ равнодостоверны: колонка российской стороны — это материалы противоположного нарратива, отслеживаемые только для сравнения, а не проверенная информация.",
};

function avg(posts: ClassifiedPost[]): number {
  if (posts.length === 0) return 0;
  return posts.reduce((s, p) => s + p.sourceReputation, 0) / posts.length;
}

/**
 * Build a side-by-side comparison from the posts that share one event signature.
 * RU posts always go in their own labelled column; UA + INT share the "aligned" one.
 */
export function compareNarratives(
  eventKey: string,
  posts: ClassifiedPost[],
): NarrativeComparison {
  posts.forEach(assertSideLabel);

  const alignedPosts = posts.filter((p) => p.side !== "ru");
  const ruPosts = posts.filter((p) => p.side === "ru");

  const aligned: NarrativeColumn = {
    camp: "aligned",
    label: {
      en: `${SIDE_LABELS.ua.en} / ${SIDE_LABELS.int.en}`,
      uk: `${SIDE_LABELS.ua.uk} / ${SIDE_LABELS.int.uk}`,
      ru: `${SIDE_LABELS.ua.ru} / ${SIDE_LABELS.int.ru}`,
    },
    posts: alignedPosts,
    avgReputation: avg(alignedPosts),
  };

  const ru: NarrativeColumn | null = ruPosts.length
    ? {
        camp: "ru",
        label: SIDE_LABELS.ru,
        posts: ruPosts,
        avgReputation: avg(ruPosts),
        oppositionLabel: ruPosts[0].oppositionLabel,
      }
    : null;

  return { eventKey, aligned, ru, disclaimer: DISCLAIMER };
}
