/**
 * Vertical Packages — pre-bundled industry SKUs.
 *
 * Each package = base tier + add-on stack + dashboard presets + landing page.
 * Priced at a discount vs buying all add-ons à la carte (15–25% off).
 *
 * Вертикальні пакети — готові SKU для конкретних галузей.
 * Кожен = базовий рівень + стек надбудов + пресети + посадкова сторінка.
 */

import type { VerticalPackage, VerticalId } from "./types";
import { ADDONS } from "./addons";

// ── Canonical vertical package registry ───────────────────────────────────────

export const VERTICAL_PACKAGES: VerticalPackage[] = [
  {
    id: "insurance",
    name_en: "Insurance & Reinsurance",
    name_uk: "Страхування та перестрахування",
    description_en:
      "Infrastructure-damage analytics, parametric trigger monitoring, war-risk underwriting tools, and $ -impact estimation for energy, marine cargo, and property portfolios.",
    description_uk:
      "Аналітика пошкодження інфраструктури, моніторинг параметричних тригерів, інструменти андеррайтингу воєнних ризиків та оцінка фінансового впливу на енергетичні, морські та майнові портфелі.",
    includedAddOnIds: [
      "commercial-satellite",
      "sentinel-hub-paid",
      "weather-pro",
      "historical-archive",
      "custom-aoi-tasking",
      "thermal-hi-res",
      "power-grid-telemetry",
    ],
    baseTierId: "business",
    priceMoUsdMin: 3000,
    priceMoUsdMax: 10000,
    pricingNote_en:
      "Annual contract; seat-based for underwriting teams. Custom pricing for Lloyd's / reinsurance syndicates.",
    useCases_en: [
      "War-risk underwriting and portfolio exposure mapping",
      "Marine cargo and energy asset parametric triggers",
      "Post-event rapid damage assessment for claims teams",
      "Accumulation management and PML estimation",
    ],
    isSalesLed: true,
    landingSlug: "/industries/insurance",
  },

  {
    id: "maritime",
    name_en: "Maritime",
    name_uk: "Морська галузь",
    description_en:
      "Full AIS coverage, cargo manifests, port disruption alerts, GPS-spoofing detection, and trade-route monitoring for the Black Sea, Red Sea, and South China Sea.",
    description_uk:
      "Повне покриття AIS, вантажні маніфести, сповіщення про збої в портах, детекція GPS-спуфінгу та моніторинг торгових маршрутів Чорного, Червоного морів та Південно-Китайського моря.",
    includedAddOnIds: [
      "ais-pro",
      "maritime-cargo",
      "commercial-satellite",
      "weather-pro",
      "custom-aoi-tasking",
      "ai-rule-builder-pro",
    ],
    baseTierId: "business",
    priceMoUsdMin: 2000,
    priceMoUsdMax: 5000,
    pricingNote_en:
      "Annual or monthly. Seat licences for ops centres; API access for shipping platforms. Black Sea add-on available.",
    useCases_en: [
      "Vessel tracking and dark-ship gap analysis",
      "Sanctions compliance for shipping operators",
      "P&I club risk assessment and naval OSINT",
      "Port disruption monitoring and trade-route risk",
    ],
    isSalesLed: true,
    landingSlug: "/industries/maritime",
  },

  {
    id: "aviation",
    name_en: "Aviation",
    name_uk: "Авіаційна галузь",
    description_en:
      "Full ADS-B with military Mode-S, airspace-closure monitoring, NOTAM correlation, and mil-air-traffic dashboards for conflict-zone airspace management.",
    description_uk:
      "Повний ADS-B з військовим Mode-S, моніторинг закриття повітряного простору, кореляція NOTAM і дашборди військової авіації для управління повітряним простором зон конфліктів.",
    includedAddOnIds: [
      "adsb-pro",
      "commercial-satellite",
      "weather-pro",
      "ai-rule-builder-pro",
      "custom-aoi-tasking",
    ],
    baseTierId: "business",
    priceMoUsdMin: 2000,
    priceMoUsdMax: 5000,
    pricingNote_en:
      "Annual contract; per-seat for ops and analysis teams. NOTAM feed integration available.",
    useCases_en: [
      "Conflict-zone airspace closure monitoring and NOTAM analysis",
      "Military air activity tracking and pattern-of-life analysis",
      "Aviation insurance and war-risk underwriting support",
      "Airline ops safety assessment and route deconfliction",
    ],
    isSalesLed: true,
    landingSlug: "/industries/aviation",
  },

  {
    id: "finance",
    name_en: "Finance & Commodities",
    name_uk: "Фінанси та сировинні ринки",
    description_en:
      "Commodity-flow disruption detection, energy-infrastructure strike alerts, market-moving event feed, narrative cluster detection, and low-latency webhook delivery for trading desks.",
    description_uk:
      "Детекція збоїв у потоках сировини, сповіщення про удари по енергоінфраструктурі, стрічка ринкових подій, кластеризація наративів і вебхуки з низькою затримкою для торгових операцій.",
    includedAddOnIds: [
      "social-firehose",
      "power-grid-telemetry",
      "ais-pro",
      "weather-pro",
      "ai-rule-builder-pro",
      "ai-copilot-pro",
      "kg-graph-pro",
    ],
    baseTierId: "business",
    priceMoUsdMin: 3000,
    priceMoUsdMax: 10000,
    pricingNote_en:
      "Annual contract; dedicated low-latency webhook lane available. Custom SLA for hedge funds.",
    useCases_en: [
      "Commodity supply disruption early-warning for traders",
      "Geopolitical risk signals for equity research desks",
      "Energy infrastructure damage and production-impact modelling",
      "Narrative sentiment monitoring for macro strategy",
    ],
    isSalesLed: true,
    landingSlug: "/industries/finance",
  },

  {
    id: "energy",
    name_en: "Energy & Utilities",
    name_uk: "Енергетика та комунальні послуги",
    description_en:
      "Power-grid telemetry, outage maps, substation and pipeline AOI monitoring, thermal hi-res anomaly detection, and refinery/LNG activity dashboards.",
    description_uk:
      "Телеметрія електромереж, карти відключень, моніторинг підстанцій і трубопроводів, теплові аномалії та дашборди НПЗ/СПГ.",
    includedAddOnIds: [
      "power-grid-telemetry",
      "thermal-hi-res",
      "custom-aoi-tasking",
      "commercial-satellite",
      "weather-pro",
      "sentinel-hub-paid",
    ],
    baseTierId: "business",
    priceMoUsdMin: 2000,
    priceMoUsdMax: 8000,
    pricingNote_en:
      "Annual contract; regional pricing available. Grid telemetry coverage varies by country.",
    useCases_en: [
      "Critical energy infrastructure damage assessment",
      "Power grid outage and restoration tracking",
      "Pipeline and substation security monitoring",
      "LNG and refinery activity analysis",
    ],
    isSalesLed: true,
    landingSlug: "/industries/energy",
  },

  {
    id: "agriculture",
    name_en: "Agriculture & Supply Chain",
    name_uk: "Сільське господарство та ланцюги постачання",
    description_en:
      "Harvest disruption detection via thermal, fire, and weather data. Port and rail correlated alerts, crop stress monitoring, and supply-chain route risk assessment.",
    description_uk:
      "Детекція збоїв урожаю через теплові, пожежні та погодні дані. Кореляційні сповіщення для портів і залізниць, моніторинг стресу культур та оцінка ризиків маршрутів постачання.",
    includedAddOnIds: [
      "thermal-hi-res",
      "weather-pro",
      "sentinel-hub-paid",
      "ais-pro",
      "custom-aoi-tasking",
    ],
    baseTierId: "team",
    priceMoUsdMin: 1000,
    priceMoUsdMax: 4000,
    pricingNote_en:
      "Annual or monthly. Agri-specific AOI templates included. Grain export corridor monitoring available.",
    useCases_en: [
      "Crop damage and harvest disruption early warning",
      "Grain export corridor and Black Sea port monitoring",
      "Supply-chain route risk and logistics disruption alerts",
      "Commodity traders and food security researchers",
    ],
    isSalesLed: false,
    landingSlug: "/industries/agriculture",
  },

  {
    id: "ngo-humanitarian",
    name_en: "NGO & Humanitarian",
    name_uk: "НГО та гуманітарна допомога",
    description_en:
      "IDP tracking, casualty datasets, shelter index, evacuation routing, and anonymized data exports for partner reports. Grant pricing available for eligible organisations.",
    description_uk:
      "Відстеження ВПО, набори даних про жертв, індекс притулків, маршрути евакуації та анонімізований експорт для партнерських звітів. Грантові ціни для організацій, що відповідають критеріям.",
    includedAddOnIds: [
      "verification-queue-priority",
      "historical-archive",
      "ai-copilot-pro",
      "weather-pro",
    ],
    baseTierId: "ngo-journalist",
    priceMoUsdMin: 0,
    priceMoUsdMax: 500,
    pricingNote_en:
      "Grant pricing for verified NGOs (apply via grant programme). Self-serve $500/mo for commercial humanitarian orgs.",
    useCases_en: [
      "IDP and refugee movement monitoring",
      "Humanitarian corridor and shelter capacity tracking",
      "Casualty and incident reporting for field teams",
      "Partner data sharing and anonymized reporting",
    ],
    isSalesLed: false,
    landingSlug: "/industries/ngo-humanitarian",
  },

  {
    id: "newsroom",
    name_en: "Newsroom",
    name_uk: "Редакція",
    description_en:
      "Verification queue priority, embeddable maps, archive bulk access, journalist-friendly licensing, group seats, and takedown-licensing helper for editorial teams.",
    description_uk:
      "Пріоритет верифікації, вбудовувані карти, архівний доступ, ліцензування для журналістів, групові місця та помічник ліцензування для редакційних команд.",
    includedAddOnIds: [
      "verification-queue-priority",
      "embeds-pro",
      "historical-archive",
      "browser-extension-pro",
      "ai-copilot-pro",
    ],
    baseTierId: "team",
    priceMoUsdMin: 500,
    priceMoUsdMax: 3000,
    pricingNote_en:
      "Per-seat or newsroom-wide licence. Apply for journalist grant pricing if eligible.",
    useCases_en: [
      "Real-time conflict reporting and fact-checking",
      "Embeddable map widgets for digital journalism",
      "Archive research and retrospective investigations",
      "Team collaboration for breaking news desks",
    ],
    isSalesLed: false,
    landingSlug: "/industries/newsroom",
  },

  {
    id: "defense",
    name_en: "Defense Contractor / Prime",
    name_uk: "Оборонний підрядник / Прайм",
    description_en:
      "Full Business tier + on-prem / edge deployment options, ITAR/EAR compliance review, dedicated data streams, custom layer integration, and priority support with dedicated CSM.",
    description_uk:
      "Повний рівень Business + варіанти on-prem/edge розгортання, огляд відповідності ITAR/EAR, виділені потоки даних, інтеграція кастомних шарів і пріоритетна підтримка з CSM.",
    includedAddOnIds: [
      "commercial-satellite",
      "adsb-pro",
      "ais-pro",
      "dark-channels",
      "kg-graph-pro",
      "ai-copilot-pro",
      "ai-rule-builder-pro",
      "custom-aoi-tasking",
      "historical-archive",
      "power-grid-telemetry",
    ],
    baseTierId: "gov-defense",
    priceMoUsdMin: 25000,
    priceMoUsdMax: 100000,
    pricingNote_en:
      "Annual contract only. Custom pricing based on scope, seats, and deployment model. Contact sales.",
    useCases_en: [
      "Defense prime intelligence and targeting support",
      "ITAR/EAR compliant geospatial intelligence workflows",
      "On-prem or air-gapped deployment for sensitive operations",
      "Multi-domain operational picture for command staff",
    ],
    isSalesLed: true,
    landingSlug: "/industries/defense",
  },

  {
    id: "travel-security",
    name_en: "Travel & Security",
    name_uk: "Туристична безпека",
    description_en:
      "Per-employee travel risk briefs, itinerary-aware mobile alerts, real-time incident push, post-incident reports, and corporate security dashboards for field teams.",
    description_uk:
      "Брифи туристичних ризиків на співробітника, мобільні сповіщення за маршрутом, push у реальному часі, звіти після інцидентів і дашборди корпоративної безпеки.",
    includedAddOnIds: [
      "travel-risk-module",
      "weather-pro",
      "ai-copilot-pro",
      "bots-pro",
    ],
    baseTierId: "team",
    priceMoUsdMin: 500,
    priceMoUsdMax: 2000,
    pricingNote_en:
      "Per-employee-seat pricing; volume discounts for large corporate travel programmes.",
    useCases_en: [
      "Corporate security and duty-of-care for travelling employees",
      "NGO field-staff safety monitoring",
      "Executive protection and high-value-person itinerary risk",
      "Incident response coordination for travel security teams",
    ],
    isSalesLed: false,
    landingSlug: "/industries/travel-security",
  },
];

// ── Helper functions ──────────────────────────────────────────────────────────

/**
 * Look up a vertical package by its ID.
 *
 * Пошук вертикального пакету за ідентифікатором.
 */
export function getVerticalById(id: VerticalId): VerticalPackage | undefined {
  return VERTICAL_PACKAGES.find((v) => v.id === id);
}

/**
 * Compute the discount fraction for a vertical package vs buying
 * all included add-ons à la carte at their flat-monthly prices.
 *
 * Returns a fraction in [0, 1] where 0 = no discount, 0.25 = 25% off.
 * Falls back to 0.20 if included add-ons have no flat-monthly prices.
 *
 * Обчислює знижку вертикального пакету відносно суми окремих надбудов.
 */
export function computeVerticalDiscount(pkg: VerticalPackage): number {
  const addonPrices = pkg.includedAddOnIds
    .map((id) => ADDONS.find((a) => a.id === id))
    .filter(
      (a): a is (typeof ADDONS)[number] =>
        a !== undefined && a.pricingModel === "flat-monthly" && typeof a.priceUsd === "number"
    )
    .map((a) => a.priceUsd as number);

  if (addonPrices.length === 0) {
    // No flat-monthly add-ons; return nominal 20% discount
    return 0.2;
  }

  const sumOfParts = addonPrices.reduce((sum, p) => sum + p, 0);
  const midPrice = (pkg.priceMoUsdMin + pkg.priceMoUsdMax) / 2;

  if (sumOfParts === 0) return 0.2;

  // Clamp to [0.15, 0.25] to stay within stated range
  const raw = 1 - midPrice / sumOfParts;
  return Math.max(0.15, Math.min(0.25, raw));
}

/**
 * Filter vertical packages by their sales model (sales-led vs self-serve).
 *
 * Фільтрація вертикальних пакетів за моделлю продажу.
 */
export function getVerticalsBySalesModel(salesLed: boolean): VerticalPackage[] {
  return VERTICAL_PACKAGES.filter((v) => v.isSalesLed === salesLed);
}
