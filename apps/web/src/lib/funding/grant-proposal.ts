/**
 * Grant proposal building blocks — reusable sections and outline generator.
 *
 * Шаблонні секції грантових пропозицій та генератор структури.
 */

import { GRANT_REGISTRY } from "./grants-registry";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ProposalSection {
  id: string;
  title_en: string;
  content_en: string;
  content_uk: string;
  /** Suggested word limit for this section */
  wordLimitGuide: number;
}

// ── Reusable Sections ─────────────────────────────────────────────────────────

/**
 * Library of reusable proposal sections.
 * Each section contains a placeholder-style template with [BRACKET] tokens.
 *
 * Бібліотека повторно використовуваних секцій пропозиції.
 */
export const STOCK_PROPOSAL_SECTIONS: ProposalSection[] = [
  {
    id: "impact",
    title_en: "Impact Statement — Civic Safety & Conflict Monitoring Mission",
    content_en:
      "Aegis Lens is an AI-assisted open-source intelligence (OSINT) platform " +
      "purpose-built to serve civil society, journalists, and humanitarian " +
      "organisations operating in and around active conflict zones. " +
      "Since Russia's full-scale invasion of Ukraine in February 2022, the " +
      "information environment around the conflict has become critically contested. " +
      "Civilian communities, displaced persons, independent media, and " +
      "humanitarian responders urgently need verified, real-time situational " +
      "awareness to make life-safety decisions.\n\n" +
      "Our platform aggregates, verifies, and contextualises open-source data " +
      "from satellite imagery, social media, news feeds, and governmental sources " +
      "into a unified conflict-intelligence layer. Civilian users — from " +
      "journalists at [ORGANISATION] to NGO field workers — can monitor areas " +
      "of interest, receive configurable alerts, and access AI-assisted analysis " +
      "without requiring specialised intelligence training.\n\n" +
      "Expected impact: (1) Reduced civilian harm through timely evacuation " +
      "and shelter-in-place guidance; (2) Strengthened independent journalism " +
      "through verified open-source evidence; (3) Improved humanitarian resource " +
      "allocation through conflict-trend analysis; (4) Public accountability for " +
      "incidents of violence through documented, time-stamped records.",
    content_uk:
      "Aegis Lens — це платформа розвідки на основі відкритих джерел (OSINT) " +
      "з підтримкою штучного інтелекту, створена для обслуговування " +
      "громадянського суспільства, журналістів та гуманітарних організацій, " +
      "що працюють у зонах активних конфліктів та навколо них. " +
      "З початку повномасштабного вторгнення Росії в Україну у лютому 2022 року " +
      "інформаційне середовище навколо конфлікту стало критично суперечливим. " +
      "Цивільні громади, переміщені особи, незалежні медіа та гуманітарні " +
      "служби терміново потребують підтвердженої ситуаційної обізнаності " +
      "в реальному часі для прийняття рішень щодо безпеки.\n\n" +
      "Очікуваний вплив: (1) Зменшення шкоди для цивільних через своєчасну " +
      "евакуацію та укриття; (2) Зміцнення незалежної журналістики; " +
      "(3) Покращення розподілу гуманітарних ресурсів; " +
      "(4) Суспільна підзвітність через задокументовані записи.",
    wordLimitGuide: 500,
  },
  {
    id: "methodology",
    title_en: "Methodology — OSINT Verification & AI Pipeline",
    content_en:
      "Our data ingestion pipeline processes [N] open-source data streams " +
      "in near-real-time. Each event passes through a multi-stage verification " +
      "framework:\n\n" +
      "1. **Source credibility scoring** — each source is assigned a " +
      "reliability score (0–100) based on historical accuracy, editorial " +
      "independence, and cross-verification rates.\n" +
      "2. **Geolocation verification** — satellite imagery, street-level " +
      "imagery, and shadow-analysis algorithms confirm or dispute claimed event " +
      "coordinates to within 50 metres.\n" +
      "3. **Temporal verification** — EXIF metadata, reverse image search, " +
      "and blockchain-timestamped records establish first-publication time.\n" +
      "4. **AI-assisted contextualisation** — a fine-tuned large language model " +
      "generates structured event summaries with confidence levels, suggested " +
      "related events, and escalation risk indicators.\n" +
      "5. **Analyst review gate** — events above a risk threshold require " +
      "human review before publication to public layers.\n\n" +
      "The pipeline is designed for transparency: all verification steps are " +
      "logged, auditable, and exportable in standard formats (GeoJSON, CSV) " +
      "for independent verification by grant monitors.",
    content_uk:
      "Наш конвеєр обробки даних обробляє [N] потоків відкритих джерел " +
      "у режимі близькому до реального часу. Кожна подія проходить через " +
      "багатоетапну структуру верифікації:\n\n" +
      "1. Оцінка достовірності джерела;\n" +
      "2. Верифікація геолокації;\n" +
      "3. Тимчасова верифікація;\n" +
      "4. AI-контекстуалізація;\n" +
      "5. Шлюз перегляду аналітиком.",
    wordLimitGuide: 600,
  },
  {
    id: "team",
    title_en: "Team — Founder Background & Core Staff",
    content_en:
      "[FOUNDER NAME], Founder & CEO — [BACKGROUND: OSINT/journalism/tech]. " +
      "Previously [ROLE] at [ORGANISATION]. Led development of [PREVIOUS PROJECT] " +
      "with [N] users in [REGIONS].\n\n" +
      "[CTO NAME], Co-Founder & CTO — [BACKGROUND]. [N] years experience in " +
      "geospatial technology / satellite imagery / machine learning.\n\n" +
      "Advisory Board: [ADVISOR 1] (conflict studies, [UNIVERSITY]); " +
      "[ADVISOR 2] (humanitarian operations, [ORGANISATION]); " +
      "[ADVISOR 3] (journalism safety, [ORGANISATION]).\n\n" +
      "Combined team experience spans conflict-zone reporting, geospatial " +
      "analysis, and open-source tech development. Team members have worked " +
      "in or reported from [CONFLICT ZONES / REGIONS].",
    content_uk:
      "[ІМЯ ЗАСНОВНИКА], Засновник і генеральний директор — [БЕКГРАУНД]. " +
      "Раніше [РОЛЬ] в [ОРГАНІЗАЦІЇ].\n\n" +
      "[ІМЯ CTO], Співзасновник і CTO — [БЕКГРАУНД].\n\n" +
      "Дорадча рада: [РАДНИК 1]; [РАДНИК 2]; [РАДНИК 3].",
    wordLimitGuide: 300,
  },
  {
    id: "budget",
    title_en: "Budget — Cost Breakdown Template",
    content_en:
      "Total request: $[AMOUNT] over [DURATION] months.\n\n" +
      "| Category | Amount (USD) | % of Total | Justification |\n" +
      "|---|---|---|---|\n" +
      "| Personnel (2 FTE analysts, 1 FTE dev) | $[X] | [X]% | " +
      "Core team delivering project milestones |\n" +
      "| Infrastructure (cloud compute, data APIs) | $[X] | [X]% | " +
      "Satellite imagery APIs, compute for AI pipeline |\n" +
      "| Data & Licensing | $[X] | [X]% | " +
      "Licensed news feeds, geospatial data subscriptions |\n" +
      "| Outreach & Dissemination | $[X] | [X]% | " +
      "Journalism training workshops, NGO partnership events |\n" +
      "| Monitoring & Evaluation | $[X] | [X]% | " +
      "Third-party impact assessment |\n" +
      "| Contingency (10%) | $[X] | 10% | — |\n\n" +
      "Indirect / overhead rate: [X]% (per funder policy).\n" +
      "Co-funding: [DESCRIBE ANY MATCHING FUNDS OR IN-KIND].",
    content_uk:
      "Загальний запит: $[СУМА] на [ТРИВАЛІСТЬ] місяців.\n\n" +
      "Категорії: персонал, інфраструктура, дані та ліцензування, " +
      "поширення, моніторинг та оцінка, резерв (10%).",
    wordLimitGuide: 400,
  },
  {
    id: "sustainability",
    title_en: "Sustainability — SaaS Revenue Model",
    content_en:
      "Aegis Lens operates on a dual-revenue model that ensures long-term " +
      "financial sustainability without mission compromise:\n\n" +
      "**Commercial SaaS revenue (primary):** Paid subscriptions for " +
      "professional analysts, security vendors, financial intelligence firms, " +
      "and government-adjacent entities. Tiers range from $12/mo (Observer) " +
      "to enterprise contracts. This commercial base cross-subsidises free and " +
      "discounted access for civil society.\n\n" +
      "**Grant & institutional revenue (secondary):** Grants from public " +
      "funders including [THIS GRANT] fund specific civic-utility features and " +
      "research deliverables that would not be funded by commercial subscriptions " +
      "alone.\n\n" +
      "**Civil society access model:** Journalists, NGOs, and Ukrainian residents " +
      "receive 70–90% discounted or free access under our permanent grant programme. " +
      "This access is structurally ring-fenced and does not depend on continued " +
      "grant funding — it is supported by commercial margins.\n\n" +
      "After grant period: [DESCRIBE PATHWAY TO CONTINUED OPERATION WITHOUT GRANT].",
    content_uk:
      "Aegis Lens використовує подвійну модель доходів: комерційний SaaS " +
      "(основний) та грантові/інституційні доходи (вторинні). " +
      "Доступ для громадянського суспільства структурно захищений і " +
      "не залежить від продовження гранту.",
    wordLimitGuide: 400,
  },
  {
    id: "open-source-commitment",
    title_en: "Open Source Commitment",
    content_en:
      "Where required by grant terms, Aegis Lens commits to releasing " +
      "grant-funded code components under an approved open-source licence " +
      "(Apache 2.0 or MIT). Specifically:\n\n" +
      "- The OSINT event ingestion pipeline (data-collection layer)\n" +
      "- The geolocation verification algorithm\n" +
      "- The public-facing map rendering components\n\n" +
      "Proprietary elements that will NOT be open-sourced (for security reasons): " +
      "the source-credibility scoring model, analyst-review queue internals, " +
      "and the customer billing layer.\n\n" +
      "Open-source deliverables will be published to a public GitHub repository " +
      "at [URL] within [X] days of each milestone completion. " +
      "Documentation will be provided in English and Ukrainian.",
    content_uk:
      "Там, де вимагають умови гранту, Aegis Lens зобовʼязується " +
      "публікувати фінансовані грантом компоненти коду під затвердженою " +
      "відкритою ліцензією (Apache 2.0 або MIT).",
    wordLimitGuide: 300,
  },
];

// ── Proposal Outline Builder ──────────────────────────────────────────────────

/**
 * Build a Markdown proposal outline tailored to a specific grant's requirements.
 *
 * Генерує структуру пропозиції у форматі Markdown для конкретного гранту.
 */
export function buildProposalOutline(grantId: string): string {
  const grant = GRANT_REGISTRY.find((g) => g.id === grantId);
  if (!grant) {
    return `# Grant Proposal Outline\n\n> Error: Grant ID "${grantId}" not found in registry.\n`;
  }

  const lines: string[] = [
    `# Grant Proposal Outline — ${grant.programName}`,
    ``,
    `> **Funder:** ${grant.funderName}`,
    `> **Type:** ${grant.type}`,
    `> **Est. Amount:** $${grant.estimatedAmountUsd.toLocaleString()}`,
    `> **Alignment Score:** ${grant.alignmentScore}/10`,
    `> **Deadline:** ${grant.deadline ?? "TBD — check funder calendar"}`,
    ``,
    `---`,
    ``,
    `## Sections`,
    ``,
  ];

  // Always include impact, methodology, team, budget, sustainability
  const baseSections = ["impact", "methodology", "team", "budget", "sustainability"];

  // Add open-source section if required
  const requiredSections = grant.requiresOpenSource
    ? [...baseSections, "open-source-commitment"]
    : baseSections;

  for (const sectionId of requiredSections) {
    const section = STOCK_PROPOSAL_SECTIONS.find((s) => s.id === sectionId);
    if (!section) continue;
    lines.push(`### ${section.title_en}`);
    lines.push(`*Word limit guide: ${section.wordLimitGuide} words*`);
    lines.push(``);
    lines.push(section.content_en);
    lines.push(``);
    lines.push(`---`);
    lines.push(``);
  }

  // Add funder-specific notes
  lines.push(`## Funder-specific Notes`);
  lines.push(``);
  lines.push(grant.notes_en);
  lines.push(``);

  if (grant.requiresNonProfit) {
    lines.push(`> **Non-profit status required.** Ensure legal entity is established before submission.`);
  }
  if (grant.requiresEuEntity) {
    lines.push(`> **EU entity required.** Confirm subsidiary or consortium partner before submission.`);
  }
  if (grant.applicationUrl) {
    lines.push(`> **Application portal:** ${grant.applicationUrl}`);
  }

  return lines.join("\n");
}

// ── Grant Constraints ─────────────────────────────────────────────────────────

/**
 * Non-negotiable constraints governing all grant applications.
 * Source: TODO/monetization/TODO_grants_public_funding.md — Constraints section.
 *
 * Незмінні обмеження, що регулюють усі грантові заявки.
 */
export const GRANT_CONSTRAINTS: { rule: string; en: string; uk: string }[] = [
  {
    rule: "no-authoritarian-funders",
    en:
      "No grant from sanctioned or authoritarian-aligned funders. " +
      "All funder relationships must pass a geopolitical alignment check before application.",
    uk:
      "Жодного гранту від санкціонованих або авторитарно-орієнтованих фандерів. " +
      "Усі відносини з фандерами мають пройти геополітичну перевірку перед заявкою.",
  },
  {
    rule: "disclose-all-funders",
    en:
      "Disclose all funder relationships on the Trust Center. " +
      "Annual public disclosure of all grants received, amounts, and deliverables.",
    uk:
      "Розкривати всі відносини з фандерами в Центрі довіри. " +
      "Щорічне публічне розкриття всіх отриманих грантів, сум та результатів.",
  },
  {
    rule: "mission-alignment",
    en:
      "Grant work must align with public mission — do not shape the product " +
      "roadmap to chase grant money. Grant deliverables must be a natural " +
      "subset of the intended product direction.",
    uk:
      "Грантова робота має відповідати публічній місії — не формувати " +
      "дорожню карту продукту в гонитві за грантовими грошима. " +
      "Грантові результати мають бути природним підмножиною запланованого " +
      "напряму розвитку продукту.",
  },
  {
    rule: "open-source-as-required",
    en:
      "Open-source any code or data deliverables required by grant terms. " +
      "Track open-source obligations per grant in the grant tracker. " +
      "Do not accept grants that require open-sourcing security-critical components.",
    uk:
      "Відкривати код або дані, якщо цього вимагають умови гранту. " +
      "Відслідковувати зобовʼязання щодо відкритого коду в трекері грантів. " +
      "Не приймати гранти, що вимагають відкриття критично важливих для " +
      "безпеки компонентів.",
  },
];
