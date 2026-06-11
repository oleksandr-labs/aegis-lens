/**
 * Ads & Sponsored Revenue — policy constants.
 *
 * Defines which surfaces are allowed, which are forbidden, the full
 * editorial policy, and revenue-cap threshold.
 *
 * Рекламна політика: дозволені / заборонені поверхні, редакційні правила,
 * обмеження частки доходу.
 */

import type { AdSurface, ForbiddenAdSurface, AdPolicy } from "./types";

// ── Allowed surfaces ──────────────────────────────────────────────────────────

/**
 * Surfaces where sponsored placements are permitted.
 * Поверхні, де дозволені спонсорські розміщення.
 */
export const ALLOWED_AD_SURFACES: AdSurface[] = [
  "companies-directory",
  "tools-directory",
  "experts-directory",
  "programmatic-seo-pages",
  "newsletter",
  "academy-guides",
  "job-board",
];

// ── Forbidden surfaces ────────────────────────────────────────────────────────

/**
 * Surfaces where advertising is strictly prohibited.
 * Поверхні, де реклама суворо заборонена.
 */
export const FORBIDDEN_AD_SURFACES: ForbiddenAdSurface[] = [
  "map-workspace",
  "event-detail-pages",
  "alerts-notifications",
  "ai-copilot-output",
  "reports",
  "third-party-embeds",
];

// ── Revenue cap ───────────────────────────────────────────────────────────────

/**
 * Maximum fraction of total revenue that may come from advertising.
 * Keeps the platform from becoming ad-dependent.
 *
 * Максимальна частка доходу від реклами (<10% стійкого міксу).
 */
export const AD_REVENUE_CAP_PCT = 0.10;

// ── Structured policy ─────────────────────────────────────────────────────────

/**
 * Machine-readable advertising policy for the platform.
 * Машинно-зчитувана рекламна політика платформи.
 */
export const AD_POLICY: AdPolicy = {
  no_sanctioned_entities: true,
  no_weapons_broker_categories: true,
  no_ads_on_safety_critical_content: true,
  sponsored_label_required: true,
  sponsored_label_en: "Sponsored",
  sponsored_label_uk: "Спонсор",
  no_pii_retargeting: true,
  no_third_party_ad_networks: true,
  editorial_firewall: true,
  revenue_cap_pct: AD_REVENUE_CAP_PCT,
};

// ── Human-readable policy strings ─────────────────────────────────────────────

/**
 * Full advertising policy — English.
 */
export const AD_POLICY_EN = `
Aegis Lens Advertising & Sponsorship Policy

1. Allowed surfaces: companies directory, tools/services/experts directory,
   programmatic SEO pages, newsletter (single sponsor per issue),
   academy/guides (partner education), and job board (when launched).

2. Forbidden surfaces: map workspace, event detail pages, alerts/notifications/push,
   AI Copilot output, reports, and any embedded widgets on third-party sites.

3. No sponsored placements from entities on international sanctions lists or
   from weapons-broker / arms-dealer categories.

4. No advertising adjacent to safety-critical content (sirens, evacuation routes,
   casualty data).

5. All sponsored content must be visually distinct and clearly labelled
   "Sponsored" in every placement.

6. No retargeting of users based on personally identifiable information (PII)
   or intelligence-platform behaviour.

7. No third-party ad networks (e.g. Google AdSense, programmatic exchanges) —
   direct sales only.

8. Editorial firewall: the ads and sales team cannot influence, review, or
   modify the work of the analyst / intelligence team.

9. Advertising must remain below ${AD_REVENUE_CAP_PCT * 100}% of total
   sustainable revenue to prevent ad-dependency.
`.trim();

/**
 * Full advertising policy — Ukrainian.
 * Повна рекламна політика — українською мовою.
 */
export const AD_POLICY_UK = `
Рекламна та спонсорська політика Aegis Lens

1. Дозволені поверхні: каталог компаній, каталог інструментів / послуг / експертів,
   програмні SEO-сторінки, розсилка (один спонсор на випуск),
   академія / навчальні матеріали (партнерська освіта) і job board (після запуску).

2. Заборонені поверхні: робочий простір карти, сторінки подій, сповіщення / push,
   вихід AI Copilot, звіти та будь-які вбудовані віджети на сторонніх сайтах.

3. Жодних спонсорів з міжнародних санкційних списків або з категорій
   торговців зброєю / посередників.

4. Жодної реклами поруч із контентом, критично важливим для безпеки
   (сирени, маршрути евакуації, дані про втрати).

5. Весь спонсорський контент повинен бути візуально чітко відокремлений
   та позначений словом "Спонсор" у кожному розміщенні.

6. Заборонено ретаргетинг користувачів на основі персональних даних (PII)
   або поведінки на розвідувальній платформі.

7. Жодних сторонніх рекламних мереж (напр. Google AdSense, programmatic-біржі) —
   лише прямі продажі.

8. Редакційний фаєрвол: рекламна і sales-команда не може впливати, переглядати
   або змінювати роботу аналітичної / розвідувальної команди.

9. Реклама повинна залишатись менше ${AD_REVENUE_CAP_PCT * 100}% загального
   стійкого доходу, щоб уникнути залежності від реклами.
`.trim();
