/**
 * Pitch Deck — core narrative for the Aegis Lens investor presentation.
 *
 * Covers: cover/tagline, problem statement, why-now factors, solution pillars,
 * and demo story. Additional slides in sibling files (market-sizing, traction, etc.)
 *
 * Наратив інвесторської презентації: обкладинка, проблема, чому зараз, рішення.
 */

// ── Identity ──────────────────────────────────────────────────────────────────

export const PRODUCT_NAME = 'Aegis Lens' as const;

export const TAGLINE_EN = 'The intelligence layer for a world in conflict' as const;

export const TAGLINE_UK = 'Розвіддані для нестабільного світу' as const;

// ── Problem statement ─────────────────────────────────────────────────────────

/**
 * Visceral problem: intelligence fragmentation, OSINT noise, disinformation.
 *
 * Гостра проблема: фрагментація розвідки, шум OSINT, дезінформація.
 */
export const PROBLEM_STATEMENT_EN =
  'Intelligence analysts, journalists, and NGOs fighting in today\'s conflicts are ' +
  'drowning in fragmented OSINT: hundreds of Telegram channels, RSS feeds, satellite ' +
  'imagery archives, and social media streams — with no unified, verified, real-time picture. ' +
  'Meanwhile, adversarial disinformation campaigns poison the information space within minutes, ' +
  'and a single misattributed event can spark escalation or cost lives.';

export const PROBLEM_STATEMENT_UK =
  'Аналітики, журналісти та НГО, які працюють у зонах конфліктів, тонуть у ' +
  'фрагментованому OSINT: сотні каналів Telegram, RSS-стрічки, архіви супутникових знімків ' +
  'та потоки соцмереж — без єдиної верифікованої картини в реальному часі. ' +
  'Дезінформаційні кампанії отруюють інформаційний простір за хвилини, ' +
  'а одна неправильно атрибутована подія може призвести до ескалації або загибелі людей.';

// ── Why now ───────────────────────────────────────────────────────────────────

/**
 * Four macro forces creating the right window.
 *
 * Чотири макрочинники, що відкривають вікно можливостей.
 */
export const WHY_NOW_FACTORS: string[] = [
  'Geopolitical inflection: Ukraine, Gaza, and Taiwan have normalised open-source war ' +
    'coverage and created a professional OSINT analyst class for the first time in history.',
  'AI inflection point: large-language and vision models now make automated verification, ' +
    'translation, and summarisation commercially viable at the per-event level.',
  'OSINT mainstreaming: Bellingcat, Forensic Architecture, and BBC Verify have proven ' +
    'that open-source intelligence is credible evidence in courts, newsrooms, and parliaments.',
  'Journalist safety crisis: reporters in conflict zones need verified situational ' +
    'awareness instantly — the cost of being wrong has never been higher.',
];

// ── Solution ──────────────────────────────────────────────────────────────────

/**
 * Five pillars that define the Aegis Lens solution.
 *
 * П'ять стовпів рішення Aegis Lens.
 */
export const SOLUTION_PILLARS: string[] = [
  'Unified live map: every verified event on one Mapbox + deck.gl canvas, ' +
    'colour-coded by danger score, updated in under 60 seconds.',
  'Multi-source ingestion: Telegram, RSS, NASA FIRMS, ADS-B, and Sentinel-2 ' +
    'automatically normalised into a single PostGIS event schema.',
  'AI-powered verification: NLP translation, NER, event classification, ' +
    'and computer-vision recycled-media detection running on every event.',
  'Analyst workspace: timeline, AOI drawing, case files, and AI-generated ' +
    'intelligence reports delivered via email, Slack, or webhook.',
  'Confidence + danger scoring: every event carries an auditable ' +
    '0–1 confidence score and 0–100 danger index so analysts can triage instantly.',
];

export const DEMO_STORY_EN =
  'A journalist lands in the app. The map is live — red clusters near Kherson, ' +
  'a fresh ADS-B track over the Black Sea, a NASA FIRMS fire alert. She draws an AOI. ' +
  'The panel filters to her zone in 2 seconds. She clicks an event: 4 corroborating ' +
  'sources, AI summary in English, confidence 87%, danger 74/100. ' +
  'She hits "Generate brief" — a one-page PDF lands in her inbox in 45 seconds.';

export const DEMO_STORY_UK =
  'Журналістка заходить у застосунок. Карта жива — червоні кластери біля Херсона, ' +
  'свіжий ADS-B трек над Чорним морем, вогневий алерт NASA FIRMS. Вона малює AOI. ' +
  'Панель фільтрується до її зони за 2 секунди. Клікає на подію: 4 підтверджуючих джерела, ' +
  'AI-резюме англійською, достовірність 87%, небезпека 74/100. ' +
  'Натискає "Згенерувати бриф" — за 45 секунд PDF вже в її поштовій скриньці.';

// ── Deck config ───────────────────────────────────────────────────────────────

export interface PitchDeckConfig {
  productName: typeof PRODUCT_NAME;
  taglineEn: typeof TAGLINE_EN;
  taglineUk: typeof TAGLINE_UK;
  problemStatementEn: string;
  problemStatementUk: string;
  whyNowFactors: string[];
  solutionPillars: string[];
  demoStoryEn: string;
  demoStoryUk: string;
  /** Total slide count — Кількість слайдів */
  slideCount: number;
}

export const PITCH_DECK_CONFIG: PitchDeckConfig = {
  productName: PRODUCT_NAME,
  taglineEn: TAGLINE_EN,
  taglineUk: TAGLINE_UK,
  problemStatementEn: PROBLEM_STATEMENT_EN,
  problemStatementUk: PROBLEM_STATEMENT_UK,
  whyNowFactors: WHY_NOW_FACTORS,
  solutionPillars: SOLUTION_PILLARS,
  demoStoryEn: DEMO_STORY_EN,
  demoStoryUk: DEMO_STORY_UK,
  slideCount: 14,
};
