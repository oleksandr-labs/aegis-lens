/**
 * Public methodology (transparency requirement).
 *
 * Misinformation flagging is reputationally explosive, so the rules by which we
 * flag content MUST be public, plain-language, and appealable. This module is
 * the single source of truth for that page — the web app renders it directly
 * (EN/UK), so the published methodology can never silently drift from the code.
 *
 * Each detector documents: what it measures, what it does NOT claim, the
 * conservative threshold, and how to appeal. Tier-1 languages EN + UK are
 * provided here; PL/RO/BG/DE can be layered on by translation tooling.
 */

export interface MethodologySection {
  id: string;
  title: { en: string; uk: string };
  body: { en: string; uk: string };
}

export interface Methodology {
  version: string;
  updatedAt: string;
  principles: MethodologySection[];
  detectors: MethodologySection[];
  appeals: MethodologySection;
}

export const MISINFO_METHODOLOGY: Methodology = {
  version: "1.0.0",
  updatedAt: "2026-06-06",
  principles: [
    {
      id: "not-arbiter-of-truth",
      title: {
        en: "We are not an arbiter of truth",
        uk: "Ми не є арбітром істини",
      },
      body: {
        en: "We never declare a claim true or false. We surface evidence-based caveats (e.g. \"this media appeared earlier in another context\") so readers can judge for themselves. We never delete or hide content.",
        uk: "Ми ніколи не оголошуємо твердження правдивим чи хибним. Ми показуємо застереження на основі доказів (наприклад, «це медіа з’являлося раніше в іншому контексті»), щоб читачі могли судити самі. Ми ніколи не видаляємо й не приховуємо контент.",
      },
    },
    {
      id: "conservative-thresholds",
      title: {
        en: "Conservative thresholds",
        uk: "Консервативні пороги",
      },
      body: {
        en: "A badge is only shown when the aggregate suspicion score is meaningful (≥ 0.25). High-impact flags require human review before they carry a strong caveat. Confidence is never reported as 1.0 — automated signals are always probabilistic.",
        uk: "Позначка показується лише тоді, коли сукупний показник підозри є значущим (≥ 0,25). Позначки з високим впливом потребують перевірки людиною. Впевненість ніколи не дорівнює 1,0 — автоматичні сигнали завжди ймовірнісні.",
      },
    },
    {
      id: "human-in-the-loop",
      title: {
        en: "Human in the loop",
        uk: "Людина в контурі",
      },
      body: {
        en: "Anything above the human-review threshold enters a review queue and is marked \"pending\" until a reviewer clears or confirms it. Automated flags never become final determinations on their own.",
        uk: "Усе, що перевищує поріг перевірки людиною, потрапляє до черги розгляду й позначається як «очікує», доки рецензент не зніме або не підтвердить позначку. Автоматичні позначки самі по собі ніколи не стають остаточним рішенням.",
      },
    },
  ],
  detectors: [
    {
      id: "recycled-media",
      title: { en: "Recycled media", uk: "Перевикористане медіа" },
      body: {
        en: "We compare exact (SHA-256), perceptual (pHash), and visual-embedding fingerprints against an index of earlier-seen media. A match older than the claim is flagged. It does NOT prove misuse — old footage can be legitimately re-shared.",
        uk: "Ми порівнюємо точні (SHA-256), перцептивні (pHash) та візуальні (embedding) відбитки з індексом раніше баченого медіа. Збіг, старший за заяву, позначається. Це НЕ доводить зловживання — старі кадри можна законно поширювати повторно.",
      },
    },
    {
      id: "location-contradiction",
      title: { en: "Location contradiction", uk: "Суперечність місця" },
      body: {
        en: "Structured visual cues (signage, script, plates, landmarks, sun position) are checked against the claimed location. A large mismatch is flagged. We never assert the true location — only that claim and cues disagree.",
        uk: "Структуровані візуальні підказки (вивіски, шрифт, номерні знаки, орієнтири, положення сонця) звіряються із заявленим місцем. Велика розбіжність позначається. Ми ніколи не стверджуємо справжнє місце — лише те, що заява й підказки не збігаються.",
      },
    },
    {
      id: "temporal-contradiction",
      title: { en: "Temporal contradiction", uk: "Часова суперечність" },
      body: {
        en: "We compare claimed time against media metadata and approximate sun position (day/night). Metadata can be edited and lighting is indicative, so these are leads for verification, not conclusions.",
        uk: "Ми порівнюємо заявлений час із метаданими медіа та приблизним положенням сонця (день/ніч). Метадані можна редагувати, а освітлення є орієнтовним, тож це підстави для перевірки, а не висновки.",
      },
    },
    {
      id: "coordinated-behavior",
      title: { en: "Coordinated behavior", uk: "Координована поведінка" },
      body: {
        en: "Using only behavioural metadata (account age, posting cadence, text duplication, re-share structure), we estimate whether a claim is being amplified in concert. Coordination signals organized amplification, not falsehood.",
        uk: "Використовуючи лише поведінкові метадані (вік акаунтів, частота публікацій, дублювання тексту, структура репостів), ми оцінюємо, чи поширюється заява узгоджено. Координація вказує на організоване поширення, а не на хибність.",
      },
    },
    {
      id: "narrative-clusters",
      title: { en: "Narrative clusters", uk: "Наративні кластери" },
      body: {
        en: "Semantically similar claims are grouped to track which talking points are propagating and how fast. Rapid spread alone is shown as context, never as a verdict.",
        uk: "Семантично подібні заяви групуються, щоб відстежувати, які меседжі поширюються і як швидко. Швидке поширення саме по собі показується як контекст, а не як вирок.",
      },
    },
    {
      id: "source-reputation",
      title: { en: "Source reputation", uk: "Репутація джерела" },
      body: {
        en: "Each source has a transparent score derived from its verified/retracted/disputed history with a smoothing prior (no cold-start extremes). Scores are visible and appealable; a low score adds a caveat, it does not suppress content.",
        uk: "Кожне джерело має прозорий показник на основі історії підтверджених/відкликаних/спірних повідомлень зі згладжувальним пріором (без крайнощів холодного старту). Показники видимі й оскаржувані; низький показник додає застереження, а не приховує контент.",
      },
    },
  ],
  appeals: {
    id: "appeals",
    title: { en: "How to appeal", uk: "Як подати апеляцію" },
    body: {
      en: "Any flag, source score, or caveat can be appealed. An appeal routes the item to the human review queue with your supplied evidence. Outcomes are \"cleared\" or \"confirmed\"; the badge and its reasons are updated accordingly and the change is logged.",
      uk: "Будь-яку позначку, показник джерела чи застереження можна оскаржити. Апеляція спрямовує елемент до черги перевірки людиною разом із наданими вами доказами. Результати — «знято» або «підтверджено»; позначку та її причини відповідно оновлюють, а зміну фіксують у журналі.",
    },
  },
};

/** Render the methodology to Markdown in one language (for the public page). */
export function renderMethodologyMarkdown(lang: "en" | "uk" = "en"): string {
  const m = MISINFO_METHODOLOGY;
  const lines: string[] = [];
  const t =
    lang === "uk"
      ? { title: "Методологія виявлення дезінформації", principles: "Принципи", detectors: "Детектори", updated: "Оновлено", ver: "Версія" }
      : { title: "Misinformation Detection Methodology", principles: "Principles", detectors: "Detectors", updated: "Updated", ver: "Version" };

  lines.push(`# ${t.title}`, "", `_${t.ver} ${m.version} · ${t.updated} ${m.updatedAt}_`, "");
  lines.push(`## ${t.principles}`, "");
  for (const s of m.principles) lines.push(`### ${s.title[lang]}`, "", s.body[lang], "");
  lines.push(`## ${t.detectors}`, "");
  for (const s of m.detectors) lines.push(`### ${s.title[lang]}`, "", s.body[lang], "");
  lines.push(`## ${m.appeals.title[lang]}`, "", m.appeals.body[lang], "");
  return lines.join("\n");
}
