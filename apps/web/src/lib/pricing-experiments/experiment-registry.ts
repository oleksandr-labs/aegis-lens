/**
 * Pricing Experiments Registry — all 22 planned experiments.
 *
 * Реєстр усіх цінових експериментів (22 шт.).
 * Кожен тест покриває рівно одну вісь. Платники захищені правилом grandfather.
 */

import type { PricingExperiment } from "./types";

// ── Helpers ────────────────────────────────────────────────────────────────────

function arm(
  id: string,
  label_en: string,
  label_uk: string,
  value: unknown,
  isControl = false,
): PricingExperiment["arms"][number] {
  return { id, label_en, label_uk, value, isControl };
}

// ── 1. Tier-shape: 3-tier vs 4-tier vs 6-tier ─────────────────────────────────

const tierShape: PricingExperiment = {
  id: "tier-shape-3v4v6",
  axis: "tier-shape",
  description_en:
    "Test whether offering 3, 4, or 6 distinct tiers maximises conversion and ARPU.",
  description_uk:
    "Тест: 3, 4 або 6 рівнів тарифів — що максимізує конверсію та ARPU.",
  arms: [
    arm("3-tier", "3 tiers (Free / Pro / Team)", "3 рівні (Free / Pro / Team)", { tiers: ["free", "pro", "team"] }, true),
    arm("4-tier", "4 tiers (Free / Observer / Pro / Team)", "4 рівні (Free / Observer / Pro / Team)", { tiers: ["free", "observer", "pro", "team"] }),
    arm("6-tier", "6 tiers (Free / Observer / Pro / Pro+ / Team / Business)", "6 рівнів (Free / Observer / Pro / Pro+ / Team / Business)", { tiers: ["free", "observer", "pro", "pro_plus", "team", "business"] }),
  ],
  status: "planned",
  rationale: "Determine optimal tier count to avoid choice paralysis while capturing willingness-to-pay variance.",
  grandfatherExistingCustomers: true,
};

// ── 2. Pro price: $29 / $39 / $49 / $59 ──────────────────────────────────────

const proPriceTest: PricingExperiment = {
  id: "tier-price-pro",
  axis: "tier-price",
  description_en: "Test Pro tier monthly price points: $29, $39, $49, $59.",
  description_uk: "Тест місячної ціни Pro: $29, $39, $49, $59.",
  arms: [
    arm("pro-29", "$29 / month", "$29 / місяць", { tier: "pro", priceUsd: 29 }, true),
    arm("pro-39", "$39 / month", "$39 / місяць", { tier: "pro", priceUsd: 39 }),
    arm("pro-49", "$49 / month", "$49 / місяць", { tier: "pro", priceUsd: 49 }),
    arm("pro-59", "$59 / month", "$59 / місяць", { tier: "pro", priceUsd: 59 }),
  ],
  status: "planned",
  rationale: "Identify elasticity of demand for the Pro tier among OSINT analysts.",
  grandfatherExistingCustomers: true,
};

// ── 3. Observer price: $9 / $14 / $19 ────────────────────────────────────────

const observerPriceTest: PricingExperiment = {
  id: "tier-price-observer",
  axis: "tier-price",
  description_en: "Test Observer tier monthly price points: $9, $14, $19.",
  description_uk: "Тест місячної ціни Observer: $9, $14, $19.",
  arms: [
    arm("observer-9", "$9 / month", "$9 / місяць", { tier: "observer", priceUsd: 9 }, true),
    arm("observer-14", "$14 / month", "$14 / місяць", { tier: "observer", priceUsd: 14 }),
    arm("observer-19", "$19 / month", "$19 / місяць", { tier: "observer", priceUsd: 19 }),
  ],
  status: "planned",
  rationale: "Observer is the first paid step; price sensitivity here affects funnel width.",
  grandfatherExistingCustomers: true,
};

// ── 4. Pro+ price: $99 / $129 / $149 ─────────────────────────────────────────

const proPlusPriceTest: PricingExperiment = {
  id: "tier-price-pro-plus",
  axis: "tier-price",
  description_en: "Test Pro+ tier monthly price points: $99, $129, $149.",
  description_uk: "Тест місячної ціни Pro+: $99, $129, $149.",
  arms: [
    arm("pro-plus-99", "$99 / month", "$99 / місяць", { tier: "pro_plus", priceUsd: 99 }, true),
    arm("pro-plus-129", "$129 / month", "$129 / місяць", { tier: "pro_plus", priceUsd: 129 }),
    arm("pro-plus-149", "$149 / month", "$149 / місяць", { tier: "pro_plus", priceUsd: 149 }),
  ],
  status: "planned",
  rationale: "Pro+ targets power analysts; higher price may signal premium positioning.",
  grandfatherExistingCustomers: true,
};

// ── 5. Team price: $299 / $499 / $799 (5 seats) ──────────────────────────────

const teamPriceTest: PricingExperiment = {
  id: "tier-price-team",
  axis: "tier-price",
  description_en: "Test Team tier price (5 seats): $299, $499, $799.",
  description_uk: "Тест ціни Team (5 місць): $299, $499, $799.",
  arms: [
    arm("team-299", "$299 / month (5 seats)", "$299 / місяць (5 місць)", { tier: "team", priceUsd: 299, seats: 5 }, true),
    arm("team-499", "$499 / month (5 seats)", "$499 / місяць (5 місць)", { tier: "team", priceUsd: 499, seats: 5 }),
    arm("team-799", "$799 / month (5 seats)", "$799 / місяць (5 місць)", { tier: "team", priceUsd: 799, seats: 5 }),
  ],
  status: "planned",
  rationale: "Map enterprise / newsroom willingness-to-pay for collaborative access.",
  grandfatherExistingCustomers: true,
};

// ── 6. Annual discount: 15 / 20 / 25 / 30% ───────────────────────────────────

const annualDiscountTest: PricingExperiment = {
  id: "annual-discount-pct",
  axis: "annual-discount",
  description_en: "Test annual subscription discount: 15%, 20%, 25%, 30%.",
  description_uk: "Тест знижки на річну підписку: 15%, 20%, 25%, 30%.",
  arms: [
    arm("annual-15", "15% annual discount", "15% знижка на рік", { discountPct: 15 }, true),
    arm("annual-20", "20% annual discount", "20% знижка на рік", { discountPct: 20 }),
    arm("annual-25", "25% annual discount", "25% знижка на рік", { discountPct: 25 }),
    arm("annual-30", "30% annual discount", "30% знижка на рік", { discountPct: 30 }),
  ],
  status: "planned",
  rationale: "Higher discount locks in LTV; lower discount preserves margin. Find breakeven.",
  grandfatherExistingCustomers: true,
};

// ── 7. 2-year commit: 30 / 40% ────────────────────────────────────────────────

const biannualDiscountTest: PricingExperiment = {
  id: "biannual-discount-pct",
  axis: "annual-discount",
  description_en: "Test 2-year commitment discount: 30%, 40%.",
  description_uk: "Тест знижки на 2-річний контракт: 30%, 40%.",
  arms: [
    arm("2yr-30", "30% 2-year discount", "30% знижка на 2 роки", { discountPct: 30, commitYears: 2 }, true),
    arm("2yr-40", "40% 2-year discount", "40% знижка на 2 роки", { discountPct: 40, commitYears: 2 }),
  ],
  status: "planned",
  rationale: "Multi-year commits improve cash flow; test if 40% materially increases uptake.",
  grandfatherExistingCustomers: true,
};

// ── 8. Trial duration: 7 / 14 / 30 days ──────────────────────────────────────

const trialDurationTest: PricingExperiment = {
  id: "trial-duration-days",
  axis: "trial-design",
  description_en: "Test free trial length: 7, 14, or 30 days.",
  description_uk: "Тест тривалості безкоштовного пробного періоду: 7, 14 або 30 днів.",
  arms: [
    arm("trial-7d", "7-day trial", "7-денний пробний", { trialDays: 7 }, true),
    arm("trial-14d", "14-day trial", "14-денний пробний", { trialDays: 14 }),
    arm("trial-30d", "30-day trial", "30-денний пробний", { trialDays: 30 }),
  ],
  status: "planned",
  rationale: "Longer trials improve activation but may delay conversion; find optimal balance.",
  grandfatherExistingCustomers: true,
};

// ── 9. Trial card-required vs not ────────────────────────────────────────────

const trialCardTest: PricingExperiment = {
  id: "trial-card-required",
  axis: "trial-design",
  description_en: "Test whether requiring a card at trial signup changes conversion vs quality.",
  description_uk: "Тест: картка при реєстрації на пробний — вплив на конверсію та якість ліда.",
  arms: [
    arm("card-required", "Card required at signup", "Картка при реєстрації", { requireCard: true }),
    arm("card-optional", "No card required", "Без картки", { requireCard: false }, true),
  ],
  status: "planned",
  rationale: "Card-required raises commitment but shrinks top-of-funnel; measure net effect on paid conversions.",
  grandfatherExistingCustomers: true,
};

// ── 10. Trial auto-convert vs re-confirm ──────────────────────────────────────

const trialAutoConvertTest: PricingExperiment = {
  id: "trial-auto-convert",
  axis: "trial-design",
  description_en: "Test auto-convert at trial end (with warning email) vs explicit re-confirm CTA.",
  description_uk: "Тест: автоматична конверсія після пробного (з попередженням) проти явного підтвердження.",
  arms: [
    arm("auto-convert", "Auto-convert with 3-day warning", "Автоконверсія з попередженням за 3 дні", { autoConvert: true, warningDays: 3 }),
    arm("reconfirm", "Requires explicit re-confirm", "Явне підтвердження", { autoConvert: false }, true),
  ],
  status: "planned",
  rationale: "Auto-convert increases paid rate but may cause involuntary churn / chargebacks.",
  grandfatherExistingCustomers: true,
};

// ── 11. Trial of Pro+ vs Pro ──────────────────────────────────────────────────

const trialTierTest: PricingExperiment = {
  id: "trial-tier-pro-vs-proplus",
  axis: "trial-design",
  description_en: "Test offering a Pro trial vs Pro+ trial to new signups.",
  description_uk: "Тест: пробний доступ до Pro проти Pro+ для нових користувачів.",
  arms: [
    arm("trial-pro", "Trial of Pro", "Пробний Pro", { trialTier: "pro" }, true),
    arm("trial-pro-plus", "Trial of Pro+", "Пробний Pro+", { trialTier: "pro_plus" }),
  ],
  status: "planned",
  rationale: "Pro+ trial exposes more value but risks anchoring expectations above Pro price.",
  grandfatherExistingCustomers: true,
};

// ── 12. Free history depth: 3d / 7d / 14d ────────────────────────────────────

const gateHistoryDepthTest: PricingExperiment = {
  id: "gate-history-depth",
  axis: "gate-freemium",
  description_en: "Test free tier history lookback depth: 3, 7, or 14 days.",
  description_uk: "Тест глибини архіву на вільному рівні: 3, 7 або 14 днів.",
  arms: [
    arm("history-3d", "3-day history", "3 дні архіву", { historyDays: 3 }),
    arm("history-7d", "7-day history (current)", "7 днів архіву (поточне)", { historyDays: 7 }, true),
    arm("history-14d", "14-day history", "14 днів архіву", { historyDays: 14 }),
  ],
  status: "planned",
  rationale: "More history reduces upgrade urgency; less history may frustrate and churn free users.",
  grandfatherExistingCustomers: true,
};

// ── 13. Free AOI count: 0 / 1 / 3 ────────────────────────────────────────────

const gateAoiCountTest: PricingExperiment = {
  id: "gate-aoi-count",
  axis: "gate-freemium",
  description_en: "Test free tier AOI (Area of Interest) quota: 0, 1, or 3.",
  description_uk: "Тест квоти AOI на вільному рівні: 0, 1 або 3.",
  arms: [
    arm("aoi-0", "0 AOIs (subscribe to watch)", "0 AOI (підписка для моніторингу)", { freeAoiCount: 0 }),
    arm("aoi-1", "1 AOI (current)", "1 AOI (поточне)", { freeAoiCount: 1 }, true),
    arm("aoi-3", "3 AOIs free", "3 AOI безкоштовно", { freeAoiCount: 3 }),
  ],
  status: "planned",
  rationale: "AOI is a high-value feature; giving 3 may accelerate habit formation and upgrade trigger.",
  grandfatherExistingCustomers: true,
};

// ── 14. Free AI Copilot daily quota: 0 / 5 / 20 ──────────────────────────────

const gateCopilotQuotaTest: PricingExperiment = {
  id: "gate-copilot-quota",
  axis: "gate-freemium",
  description_en: "Test free tier AI Copilot daily message quota: 0, 5, or 20.",
  description_uk: "Тест денної квоти AI-копілота на вільному рівні: 0, 5 або 20 повідомлень.",
  arms: [
    arm("copilot-0", "0 messages / day (hard gate)", "0 повідомлень / день (жорсткий шлагбаум)", { copilotDailyQuota: 0 }),
    arm("copilot-5", "5 messages / day (current)", "5 повідомлень / день (поточне)", { copilotDailyQuota: 5 }, true),
    arm("copilot-20", "20 messages / day", "20 повідомлень / день", { copilotDailyQuota: 20 }),
  ],
  status: "planned",
  rationale: "Copilot demos core AI value; higher quota may drive more upgrades via aha-moment.",
  grandfatherExistingCustomers: true,
};

// ── 15. Free freshness delay: 5m / 15m / 30m ─────────────────────────────────

const gateFreshnessDelayTest: PricingExperiment = {
  id: "gate-freshness-delay",
  axis: "gate-freemium",
  description_en: "Test free tier data freshness delay: 5 min, 15 min, or 30 min.",
  description_uk: "Тест затримки свіжості даних на вільному рівні: 5 хв, 15 хв або 30 хв.",
  arms: [
    arm("delay-5m", "5-minute delay", "5-хвилинна затримка", { freshnessDelayMin: 5 }),
    arm("delay-15m", "15-minute delay (current)", "15-хвилинна затримка (поточне)", { freshnessDelayMin: 15 }, true),
    arm("delay-30m", "30-minute delay", "30-хвилинна затримка", { freshnessDelayMin: 30 }),
  ],
  status: "planned",
  rationale: "Longer delay creates clear upgrade urgency for time-critical users; shorter reduces friction for casual ones.",
  grandfatherExistingCustomers: true,
};

// ── 16. Soft-gate teaser style: blurred / labeled / hidden ────────────────────

const softGateTeaserTest: PricingExperiment = {
  id: "gate-teaser-style",
  axis: "gate-freemium",
  description_en: "Test soft-gate teaser visual style: blurred content, labeled lock, or hidden entirely.",
  description_uk: "Тест стилю тизера м'якого шлагбауму: розмито, замок-позначка або повністю приховано.",
  arms: [
    arm("teaser-blurred", "Blurred content + upgrade CTA", "Розмитий контент + CTA на апгрейд", { teaserStyle: "blurred" }, true),
    arm("teaser-labeled", "Labeled lock icon + tooltip", "Замок-позначка + підказка", { teaserStyle: "labeled" }),
    arm("teaser-hidden", "Hidden / replaced with placeholder", "Приховано / замінено заглушкою", { teaserStyle: "hidden" }),
  ],
  status: "planned",
  rationale: "Blurred creates curiosity; labeled is honest; hidden reduces cognitive load. Measure click-to-upgrade rate.",
  grandfatherExistingCustomers: true,
};

// ── 17. Upgrade prompt style: modal / inline / banner ─────────────────────────

const upgradePromptStyleTest: PricingExperiment = {
  id: "gate-upgrade-prompt-style",
  axis: "gate-freemium",
  description_en: "Test upgrade prompt UI: modal dialog, inline CTA, or persistent banner.",
  description_uk: "Тест UI підказки до апгрейду: модальне вікно, вбудований CTA або банер.",
  arms: [
    arm("prompt-modal", "Modal dialog", "Модальне вікно", { promptStyle: "modal" }, true),
    arm("prompt-inline", "Inline CTA", "Вбудований CTA", { promptStyle: "inline" }),
    arm("prompt-banner", "Persistent top banner", "Постійний верхній банер", { promptStyle: "banner" }),
  ],
  status: "planned",
  rationale: "Modal is disruptive but high-conversion; inline is low friction; banner builds ambient awareness.",
  grandfatherExistingCustomers: true,
};

// ── 18. Vertical pack discount: 10 / 20 / 30% ────────────────────────────────

const verticalPackDiscountTest: PricingExperiment = {
  id: "addon-vertical-pack-discount",
  axis: "add-on-packaging",
  description_en: "Test discount offered on vertical add-on packs: 10%, 20%, 30%.",
  description_uk: "Тест знижки на вертикальні додаткові пакети: 10%, 20%, 30%.",
  arms: [
    arm("vpack-10", "10% vertical pack discount", "10% знижка на вертикальний пакет", { discountPct: 10 }, true),
    arm("vpack-20", "20% vertical pack discount", "20% знижка на вертикальний пакет", { discountPct: 20 }),
    arm("vpack-30", "30% vertical pack discount", "30% знижка на вертикальний пакет", { discountPct: 30 }),
  ],
  status: "planned",
  rationale: "Steeper bundle discount may grow add-on attach rate faster than it erodes margin.",
  grandfatherExistingCustomers: true,
};

// ── 19. Add-on bundle threshold: 3+ / 4+ / 5+ ────────────────────────────────

const addonBundleThresholdTest: PricingExperiment = {
  id: "addon-bundle-threshold",
  axis: "add-on-packaging",
  description_en: "Test minimum add-on count required to unlock bundle discount: 3, 4, or 5.",
  description_uk: "Тест мінімальної кількості додатків для отримання бандл-знижки: 3, 4 або 5.",
  arms: [
    arm("bundle-3", "Discount at 3+ add-ons", "Знижка від 3 додатків", { bundleThreshold: 3 }),
    arm("bundle-4", "Discount at 4+ add-ons (current)", "Знижка від 4 додатків (поточне)", { bundleThreshold: 4 }, true),
    arm("bundle-5", "Discount at 5+ add-ons", "Знижка від 5 додатків", { bundleThreshold: 5 }),
  ],
  status: "planned",
  rationale: "Lower threshold accelerates bundle adoption; higher threshold protects margin.",
  grandfatherExistingCustomers: true,
};

// ── 20. Geo pack vs global Pro ────────────────────────────────────────────────

const geoPackVsGlobalTest: PricingExperiment = {
  id: "addon-geo-pack-vs-global",
  axis: "add-on-packaging",
  description_en:
    "Test geo-specific regional add-on pack vs upgrading to global Pro for full coverage.",
  description_uk:
    "Тест: регіональний гео-пакет проти глобального Pro для повного покриття.",
  arms: [
    arm("geo-pack", "Geo pack add-on (region-specific)", "Гео-пакет (конкретний регіон)", { model: "geo-pack" }, true),
    arm("global-pro", "Upgrade to global Pro", "Апгрейд до глобального Pro", { model: "global-pro" }),
  ],
  status: "planned",
  rationale:
    "Geo packs lower entry cost; global Pro maximises ARPU. Measure which path converts better for focused regional users.",
  grandfatherExistingCustomers: true,
};

// ── 21. Reports bundled into Business vs separate ─────────────────────────────

const reportsBundlingTest: PricingExperiment = {
  id: "addon-reports-bundling",
  axis: "add-on-packaging",
  description_en:
    "Test bundling reports subscription into Business tier vs keeping it a separate add-on.",
  description_uk:
    "Тест: підписка на звіти включена в Business чи окремий додаток.",
  arms: [
    arm("reports-separate", "Reports as separate add-on", "Звіти окремим додатком", { bundled: false }, true),
    arm("reports-bundled", "Reports bundled into Business", "Звіти включено в Business", { bundled: true }),
  ],
  status: "planned",
  rationale:
    "Bundling simplifies purchase decision for enterprise but may reduce add-on ARPU uplift visibility.",
  grandfatherExistingCustomers: true,
};

// ── 22. Day Pass: $5 / $9 / $14 ──────────────────────────────────────────────

const dayPassTest: PricingExperiment = {
  id: "pay-shape-day-pass",
  axis: "pay-shape",
  description_en: "Test Day Pass one-time price: $5, $9, $14.",
  description_uk: "Тест ціни одноразового добового пропуску: $5, $9, $14.",
  arms: [
    arm("daypass-5", "$5 Day Pass", "$5 добовий пропуск", { priceUsd: 5 }, true),
    arm("daypass-9", "$9 Day Pass", "$9 добовий пропуск", { priceUsd: 9 }),
    arm("daypass-14", "$14 Day Pass", "$14 добовий пропуск", { priceUsd: 14 }),
  ],
  status: "planned",
  rationale:
    "Day Pass targets situational buyers (journalists, researchers); find price that maximises volume × margin.",
  grandfatherExistingCustomers: true,
};

// ── 23. Event Pass: $19 / $39 / $59 ──────────────────────────────────────────

const eventPassTest: PricingExperiment = {
  id: "pay-shape-event-pass",
  axis: "pay-shape",
  description_en: "Test Event Pass price: $19, $39, $59.",
  description_uk: "Тест ціни Event Pass: $19, $39, $59.",
  arms: [
    arm("eventpass-19", "$19 Event Pass", "$19 Event Pass", { priceUsd: 19 }, true),
    arm("eventpass-39", "$39 Event Pass", "$39 Event Pass", { priceUsd: 39 }),
    arm("eventpass-59", "$59 Event Pass", "$59 Event Pass", { priceUsd: 59 }),
  ],
  status: "planned",
  rationale:
    "Event Pass unlocks enhanced coverage during major incidents; price signal affects perceived premium.",
  grandfatherExistingCustomers: true,
};

// ── 24. PPP-adjusted pricing ──────────────────────────────────────────────────

const pppPricingTest: PricingExperiment = {
  id: "pay-shape-ppp-adjusted",
  axis: "pay-shape",
  description_en:
    "Test per-region PPP-adjusted pricing (UA / RO / PL / MD / GE) vs single global USD price.",
  description_uk:
    "Тест цін, скоригованих за ПКС (UA / RO / PL / MD / GE), проти єдиної глобальної ціни в USD.",
  arms: [
    arm("global-usd", "Single global USD price", "Єдина глобальна ціна USD", { pppAdjusted: false }, true),
    arm("ppp-adjusted", "PPP-adjusted by region (UA/RO/PL/MD/GE)", "ПКС-скоригована за регіоном", { pppAdjusted: true, regions: ["UA", "RO", "PL", "MD", "GE"] }),
  ],
  status: "planned",
  rationale:
    "PPP pricing boosts access in lower-income markets and may increase total paid user count without cannibalising USD markets.",
  grandfatherExistingCustomers: true,
};

// ── 25. Flat Pro API vs metered API ──────────────────────────────────────────

const flatVsMeteredApiTest: PricingExperiment = {
  id: "usage-flat-vs-metered-api",
  axis: "usage-based",
  description_en: "Test flat-rate Pro API access vs metered pay-per-call API.",
  description_uk: "Тест фіксованого API-доступу у Pro проти оплати за запит.",
  arms: [
    arm("flat-api", "Flat Pro API (included in Pro)", "Фіксований API у Pro", { model: "flat" }, true),
    arm("metered-api", "Metered pay-per-call API", "Оплата за API-запит", { model: "metered" }),
  ],
  status: "planned",
  rationale:
    "Metered API aligns cost with value for heavy users; flat is simpler to sell. Measure ARPU and developer satisfaction.",
  grandfatherExistingCustomers: true,
};

// ── 26. Credits wallet vs subscription overage ───────────────────────────────

const creditsVsOverageTest: PricingExperiment = {
  id: "usage-credits-vs-overage",
  axis: "usage-based",
  description_en: "Test pre-paid credits wallet vs automatic subscription overage charges.",
  description_uk: "Тест наперед оплачених кредитів проти автоматичного овераджу підписки.",
  arms: [
    arm("overage", "Subscription overage (auto-charge)", "Автоматичний оверадж підписки", { model: "overage" }, true),
    arm("credits-wallet", "Pre-paid credits wallet", "Гаманець з наперед оплаченими кредитами", { model: "credits" }),
  ],
  status: "planned",
  rationale:
    "Credits give users budget control and reduce involuntary overage surprise; overage is frictionless for heavy users.",
  grandfatherExistingCustomers: true,
};

// ── 27. Cohort retention tracking ────────────────────────────────────────────

const cohortRetentionProcess: PricingExperiment = {
  id: "post-test-cohort-retention",
  axis: "tier-price", // proxy axis — this is a process / measurement experiment
  description_en: "Post-test process: track day-7, day-30, day-90 retention per experiment arm cohort.",
  description_uk: "Після-тестовий процес: відстеження утримання за кожним arm-когортом на 7/30/90 день.",
  arms: [
    arm("cohort-tracking-enabled", "Cohort retention tracking enabled", "Відстеження когорт увімкнено", { enabled: true }, true),
  ],
  status: "planned",
  rationale: "Retention data disambiguates conversion spikes from genuine LTV improvements.",
  grandfatherExistingCustomers: true,
};

// ── 28. Honor locked-in price for paying customers ───────────────────────────

const grandfatherPriceProcess: PricingExperiment = {
  id: "post-test-grandfather-rule",
  axis: "tier-price",
  description_en:
    "Process safeguard: no price test is ever applied to an existing paying customer without honoring their locked-in price.",
  description_uk:
    "Процесний захист: жоден тест цін ніколи не застосовується до платного клієнта без збереження заблокованої ціни.",
  arms: [
    arm("grandfather-enforced", "Grandfather rule enforced (always)", "Правило grandfather завжди діє", { enforced: true }, true),
  ],
  status: "running",
  rationale:
    "Legal and trust safeguard. Violating locked-in pricing destroys trust and may breach contract terms.",
  grandfatherExistingCustomers: true,
};

// ── 29. Document winner + rationale in decision records ──────────────────────

const decisionRecordProcess: PricingExperiment = {
  id: "post-test-decision-record",
  axis: "tier-price",
  description_en:
    "Post-test process: document winning arm, rationale, and learnings in internal decision records.",
  description_uk:
    "Після-тестовий процес: фіксувати переможний arm, обґрунтування та висновки у внутрішніх записах рішень.",
  arms: [
    arm("decision-record-required", "Decision record required for all concluded tests", "Запис рішення обов'язковий для всіх завершених тестів", { required: true }, true),
  ],
  status: "planned",
  rationale:
    "Institutional memory prevents re-running the same tests and accelerates future pricing decisions.",
  grandfatherExistingCustomers: true,
};

// ── Export ─────────────────────────────────────────────────────────────────────

export const PRICING_EXPERIMENTS: PricingExperiment[] = [
  // Tier-shape tests (5)
  tierShape,
  proPriceTest,
  observerPriceTest,
  proPlusPriceTest,
  teamPriceTest,
  // Annual discount tests (2)
  annualDiscountTest,
  biannualDiscountTest,
  // Trial design tests (4)
  trialDurationTest,
  trialCardTest,
  trialAutoConvertTest,
  trialTierTest,
  // Gate / freemium tests (6)
  gateHistoryDepthTest,
  gateAoiCountTest,
  gateCopilotQuotaTest,
  gateFreshnessDelayTest,
  softGateTeaserTest,
  upgradePromptStyleTest,
  // Add-on / packaging tests (4)
  verticalPackDiscountTest,
  addonBundleThresholdTest,
  geoPackVsGlobalTest,
  reportsBundlingTest,
  // Pay-shape tests (3)
  dayPassTest,
  eventPassTest,
  pppPricingTest,
  // Usage-based tests (2)
  flatVsMeteredApiTest,
  creditsVsOverageTest,
  // Post-test processes (3)
  cohortRetentionProcess,
  grandfatherPriceProcess,
  decisionRecordProcess,
];

/**
 * Look up a single experiment by id.
 * Пошук експерименту за ідентифікатором.
 */
export function getExperiment(id: string): PricingExperiment | undefined {
  return PRICING_EXPERIMENTS.find((e) => e.id === id);
}
