/**
 * Task 6 — Auto-translate OVA posts to EN + RU, PRESERVING the UA original.
 *
 * OVA posts are authoritative Ukrainian text. We surface EN (for international
 * users) and RU (for Russian-speaking civilians inside UA), but the UA original
 * is ALWAYS retained verbatim as the canonical record — translations are clearly
 * marked derived and must never overwrite the source.
 *
 * This module is a TRANSLATION SEAM: a `Translator` interface plus a default
 * pass-through implementation so the pipeline runs offline/without a paid MT key.
 * A real provider (DeepL / Google / on-prem) is injected via `setTranslator`.
 * Provider keys are read from env by the concrete provider, never here.
 */

import type { Locale, OvaPost, OvaTranslatedPost } from "./types";

export interface Translator {
  /** Identifier recorded on each translated post for provenance. */
  readonly id: string;
  /** Translate `text` from `from` into `to`. May return text unchanged. */
  translate(text: string, from: Locale, to: Locale): Promise<string>;
}

/**
 * Default seam: returns the UA text unchanged but tagged, so the shape is valid
 * and the UA original is always preserved. Swap for a real MT provider in prod.
 */
export const passthroughTranslator: Translator = {
  id: "demo-passthrough",
  async translate(text, _from, to) {
    if (to === "uk") return text;
    // Mark clearly as untranslated so the UI never presents it as real EN/RU.
    return `[${to.toUpperCase()} translation pending] ${text}`;
  },
};

let active: Translator = passthroughTranslator;

/** Inject a real translator (e.g. a DeepL-backed implementation). */
export function setTranslator(t: Translator): void {
  active = t;
}

export function getTranslator(): Translator {
  return active;
}

/**
 * Translate one post into EN + RU while keeping the UA original intact.
 * Failures per-language are swallowed: we never drop the authoritative UA text.
 */
export async function translatePost(
  post: OvaPost,
  translator: Translator = active,
): Promise<OvaTranslatedPost> {
  const uk = post.textUk; // canonical, never altered
  let en: string | undefined;
  let ru: string | undefined;

  try {
    en = await translator.translate(uk, "uk", "en");
  } catch {
    en = undefined;
  }
  try {
    ru = await translator.translate(uk, "uk", "ru");
  } catch {
    ru = undefined;
  }

  return {
    ...post,
    translations: { uk, en, ru },
    translationProvider: translator.id,
  };
}

/** Batch helper. */
export async function translatePosts(
  posts: OvaPost[],
  translator: Translator = active,
): Promise<OvaTranslatedPost[]> {
  return Promise.all(posts.map((p) => translatePost(p, translator)));
}
