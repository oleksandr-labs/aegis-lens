/**
 * Team — current team structure, open roles, and advisor needs.
 *
 * Honest about the gaps. Investors fund people first.
 *
 * Структура команди, відкриті ролі та потрібні радники.
 */

// ── Team member ───────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  /** Short bio — Коротке біо */
  bio: string;
  /** Relevant credibility markers — Маркери довіри */
  credibilityMarkers: string[];
  /** Status — Статус */
  status: 'current' | 'needed' | 'advisor';
}

// ── Open roles ────────────────────────────────────────────────────────────────

/**
 * Critical hires the seed round will fund.
 *
 * Критичні найми на seed-раунд.
 */
export const TEAM_ROLES_NEEDED: string[] = [
  'CTO / Head of Engineering — distributed systems, real-time data pipelines (Kafka, PostGIS)',
  'Head of Intelligence — ex-military OSINT, journalism, or conflict monitoring background',
  'Sales / GTM Lead — experience selling SaaS to media, NGO, or government',
  'Senior ML Engineer — NLP, time-series anomaly detection, CV verification models',
];

// ── Advisor needs ─────────────────────────────────────────────────────────────

/**
 * Advisor profiles that would materially strengthen the deck.
 *
 * Профілі радників, які суттєво посилять презентацію.
 */
export const ADVISORS_NEEDED: string[] = [
  'OSINT Expert — Bellingcat / IntelligenceX / OCCRP calibre, lends investigative credibility',
  'Defence Industry — ex-NATO intelligence or signals officer, opens gov procurement channels',
  'Senior Journalist — conflict correspondent from AP/Reuters/BBC, validates journalist use-case',
];

// ── Placeholder current team ──────────────────────────────────────────────────

export const CURRENT_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'founder-ceo',
    name: '[Founder / CEO]',
    role: 'CEO & Product',
    bio: 'Full-stack builder with background in conflict data and OSINT tooling.',
    credibilityMarkers: [
      'Built Aegis Lens MVP from zero',
      'OSINT community contributor',
      'Ukraine conflict monitoring experience',
    ],
    status: 'current',
  },
];

// ── Notes ─────────────────────────────────────────────────────────────────────

export const TEAM_NOTE_EN =
  'We are a lean founding team. Seed capital is primarily for the 4 critical hires above. ' +
  'We are actively recruiting and have inbound interest from candidates with relevant backgrounds.';

export const TEAM_NOTE_UK =
  'Ми компактна команда засновників. Seed-капітал — переважно для 4 критичних найм. ' +
  'Активно рекрутуємо; є вхідний інтерес від кандидатів з відповідним досвідом.';
