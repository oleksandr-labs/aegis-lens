/**
 * AI Copilot demo sequence for the landing page feature showcase.
 * Looped animation of 5 realistic prompt–response pairs.
 *
 * Демо-послідовність AI-копілота для секції Feature Showcase на головній.
 * Циклічна анімація з 5 реалістичних пар запит–відповідь.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CopilotDemoStep {
  stepId: string;
  prompt: string;
  promptUk: string;
  responsePreview: string;
  responsePreviewUk: string;
  highlightedKeywords: string[];
  /** Display duration for this step in milliseconds */
  durationMs: number;
}

export interface CopilotDemoLoopConfig {
  sequence: CopilotDemoStep[];
  loop: boolean;
  totalDurationMs: number;
}

// ---------------------------------------------------------------------------
// Demo sequence
// ---------------------------------------------------------------------------

export const COPILOT_DEMO_SEQUENCE: CopilotDemoStep[] = [
  {
    stepId: "location-summary",
    prompt: "What is happening in Kharkiv right now?",
    promptUk: "Що зараз відбувається у Харкові?",
    responsePreview:
      "In the last 6 hours, 12 verified events were recorded in Kharkiv Oblast: 4 air-raid alerts (all-clear issued), 2 artillery incidents near Vovchansk, and 6 civilian-impact reports. Confidence: 0.84.",
    responsePreviewUk:
      "За останні 6 годин у Харківській області зафіксовано 12 верифікованих подій: 4 повітряні тривоги (відбій), 2 артилерійські інциденти поблизу Вовчанська та 6 повідомлень про вплив на цивільних. Достовірність: 0,84.",
    highlightedKeywords: ["Kharkiv", "12 verified events", "Confidence: 0.84"],
    durationMs: 3_000,
  },
  {
    stepId: "event-count",
    prompt: "How many drone incidents were reported in Ukraine this week?",
    promptUk: "Скільки дронових інцидентів зафіксовано в Україні цього тижня?",
    responsePreview:
      "This week (Mon–Sun UTC): 87 drone-related events across 14 oblasts. Peak activity: Tuesday 02:00–05:00 UTC. Most-affected: Kyiv, Dnipropetrovsk, Odesa oblasts.",
    responsePreviewUk:
      "Цього тижня (пн–нд UTC): 87 подій, пов'язаних з дронами, у 14 областях. Пік активності: вівторок 02:00–05:00 UTC. Найбільше постраждали: Київська, Дніпропетровська, Одеська області.",
    highlightedKeywords: ["87 drone-related events", "14 oblasts", "Peak activity"],
    durationMs: 3_000,
  },
  {
    stepId: "risk-assessment",
    prompt: "Assess the risk level for Zaporizhzhia nuclear plant for the next 48 hours.",
    promptUk: "Оцініть рівень ризику для Запорізької АЕС на наступні 48 годин.",
    responsePreview:
      "Risk level: ELEVATED (3/5). Basis: 3 artillery events within 25 km in the past 24 h; no direct ZNPP incidents confirmed. IAEA monitoring active. Recommend daily refresh.",
    responsePreviewUk:
      "Рівень ризику: ПІДВИЩЕНИЙ (3/5). Підстава: 3 артилерійські події у радіусі 25 км за останні 24 год; прямих інцидентів на ЗАЕС не підтверджено. Моніторинг МАГАТЕ активний. Рекомендовано щоденне оновлення.",
    highlightedKeywords: ["ELEVATED", "3 artillery events", "IAEA monitoring"],
    durationMs: 3_000,
  },
  {
    stepId: "entity-search",
    prompt: "Find all events mentioning the 'Shahed-136' drone.",
    promptUk: "Знайти всі події, де згадується дрон Shahed-136.",
    responsePreview:
      "Found 342 events mentioning Shahed-136 (2022-09 – present). Earliest confirmed use: 13 Sep 2022, Kharkiv. Top source: Telegram channels (68%), official statements (22%), satellite imagery (10%).",
    responsePreviewUk:
      "Знайдено 342 події зі згадкою Shahed-136 (09.2022 – сьогодні). Перше підтверджене використання: 13 вер. 2022, Харків. Топ-джерела: Telegram-канали (68%), офіційні заяви (22%), супутникові знімки (10%).",
    highlightedKeywords: ["342 events", "Shahed-136", "13 Sep 2022"],
    durationMs: 3_000,
  },
  {
    stepId: "weekly-digest",
    prompt: "Generate a weekly digest for my watchlist regions.",
    promptUk: "Сформуй тижневий дайджест для моїх регіонів спостереження.",
    responsePreview:
      "Weekly digest ready (5 regions, 7 days): 214 new events, 18 high-severity incidents, 3 infrastructure damage sites. Full report saved to your library.",
    responsePreviewUk:
      "Тижневий дайджест готовий (5 регіонів, 7 днів): 214 нових подій, 18 інцидентів з високою серйозністю, 3 об'єкти пошкодженої інфраструктури. Повний звіт збережено у вашій бібліотеці.",
    highlightedKeywords: ["214 new events", "18 high-severity", "saved to your library"],
    durationMs: 3_000,
  },
];

// ---------------------------------------------------------------------------
// Total duration & loop builder
// ---------------------------------------------------------------------------

export const DEMO_TOTAL_DURATION_MS = 15_000;

export function buildDemoLoopConfig(): CopilotDemoLoopConfig {
  return {
    sequence: COPILOT_DEMO_SEQUENCE,
    loop: true,
    totalDurationMs: DEMO_TOTAL_DURATION_MS,
  };
}

// ---------------------------------------------------------------------------
// Notes
// ---------------------------------------------------------------------------

export const DEMO_NOTES_EN: string[] = [
  "interactive-on-hover: when the user hovers over the demo widget, pause the loop and allow manual step navigation via arrow keys or step dots.",
  "looped-video-fallback: if JavaScript is disabled or the animation fails to mount, show a pre-recorded MP4 screencapture of the demo loop as a fallback <video autoplay muted loop>.",
];

export const DEMO_NOTES_UK: string[] = [
  "interactive-on-hover: коли користувач наводить курсор на демо-віджет, зупинити цикл і дозволити ручну навігацію між кроками стрілками або крапками-кроками.",
  "looped-video-fallback: якщо JavaScript вимкнено або анімація не ініціалізується, показати попередньо записаний MP4-скрінкаст демо-циклу як замінник <video autoplay muted loop>.",
];
