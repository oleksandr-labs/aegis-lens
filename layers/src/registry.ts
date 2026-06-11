/**
 * Map layer catalog.
 * Each layer is defined here; the frontend reads this registry to render
 * the layer control panel, legends, and styling.
 *
 * Visual conventions:
 *  - AI predictions: dashed/hatched, labeled "AI prediction — not observation"
 *  - Confidence < 0.5: reduced opacity
 *  - Verified: full opacity
 */

export type LayerCategory =
  | "military"
  | "infrastructure"
  | "civilian"
  | "environment"
  | "motion"
  | "imagery"
  | "information";

export type LayerDataSource =
  | "internal_events"
  | "nasa_firms"
  | "sentinel_hub"
  | "adsb_exchange"
  | "opensky"
  | "ais"
  | "cloudflare_radar"
  | "netblocks"
  | "osm"
  | "telegram"
  | "ai_model";

export interface LayerLegendItem {
  color: string;
  label: Record<string, string>;
  /** Optional: pattern for hatched/dashed AI zones */
  pattern?: "solid" | "dashed" | "hatched" | "dots";
}

export interface LayerConfig {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  category: LayerCategory;
  sources: LayerDataSource[];
  /** Default visibility */
  default_visible: boolean;
  /** Minimum zoom level to show layer */
  min_zoom?: number;
  max_zoom?: number;
  legend: LayerLegendItem[];
  /** Tiers that have access to this layer */
  access_tier: "public" | "registered" | "pro" | "enterprise";
  /** Whether this layer contains AI predictions */
  is_prediction: boolean;
  /** Update cadence label for display */
  update_cadence_label: Record<string, string>;
}

export const LAYER_REGISTRY: LayerConfig[] = [
  // ── Military ────────────────────────────────────────────────────────────────
  {
    id: "military_strikes",
    name: { en: "Strikes & Engagements", uk: "Удари та зіткнення" },
    description: { en: "Confirmed airstrikes, artillery, drone, and missile impacts.", uk: "Підтверджені авіаудари, артилерійські обстріли, БПЛА та ракетні удари." },
    category: "military",
    sources: ["internal_events"],
    default_visible: true,
    legend: [
      { color: "#ff2222", label: { en: "Airstrike", uk: "Авіаудар" }, pattern: "solid" },
      { color: "#ff8800", label: { en: "Artillery", uk: "Артилерія" }, pattern: "solid" },
      { color: "#ffcc00", label: { en: "Drone", uk: "БПЛА" }, pattern: "solid" },
      { color: "#cc00ff", label: { en: "Missile", uk: "Ракета" }, pattern: "solid" },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Near real-time", uk: "Близько реального часу" },
  },
  {
    id: "troop_movement",
    name: { en: "Troop Movement", uk: "Переміщення військ" },
    description: { en: "Verified unit movement reports (where lawful and confirmed).", uk: "Підтверджені повідомлення про переміщення підрозділів." },
    category: "military",
    sources: ["internal_events"],
    default_visible: false,
    min_zoom: 8,
    legend: [
      { color: "#003399", label: { en: "Ukrainian forces", uk: "Сили України" }, pattern: "solid" },
      { color: "#cc0000", label: { en: "Russian forces", uk: "Сили Росії" }, pattern: "solid" },
    ],
    access_tier: "pro",
    is_prediction: false,
    update_cadence_label: { en: "Verified reports", uk: "Підтверджені звіти" },
  },
  {
    id: "air_defense",
    name: { en: "Air-Defense Engagements", uk: "Перехоплення ППО" },
    description: { en: "Air-defense intercepts and engagement reports.", uk: "Перехоплення та звіти про роботу ППО." },
    category: "military",
    sources: ["internal_events"],
    default_visible: false,
    legend: [
      { color: "#00cc44", label: { en: "Intercept", uk: "Перехоплення" }, pattern: "solid" },
    ],
    access_tier: "registered",
    is_prediction: false,
    update_cadence_label: { en: "Near real-time", uk: "Близько реального часу" },
  },
  {
    id: "missiles",
    name: { en: "Missiles & Ballistic / Cruise", uk: "Ракети (балістичні / крилаті)" },
    description: {
      en: "Missile launches, transit, intercepts, and confirmed impacts (ballistic, cruise, hypersonic, MLRS).",
      uk: "Ракетні пуски, політ, перехоплення та підтверджені удари (балістичні, крилаті, гіперзвукові, РСЗВ).",
    },
    category: "military",
    sources: ["internal_events", "nasa_firms", "sentinel_hub", "telegram"],
    default_visible: true,
    legend: [
      { color: "#dc2626", label: { en: "Ballistic", uk: "Балістична" }, pattern: "solid" },
      { color: "#ef4444", label: { en: "Cruise", uk: "Крилата" }, pattern: "solid" },
      { color: "#7c3aed", label: { en: "Hypersonic", uk: "Гіперзвукова" }, pattern: "solid" },
      { color: "#22c55e", label: { en: "Intercepted", uk: "Перехоплено" }, pattern: "solid" },
      { color: "#f87171", label: { en: "Trajectory cone", uk: "Конус траєкторії" }, pattern: "hatched" },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Near real-time", uk: "Близько реального часу" },
  },
  {
    id: "equipment_losses",
    name: { en: "Equipment Losses (Oryx)", uk: "Втрати техніки (Oryx)" },
    description: {
      en: "Visually-confirmed equipment losses aggregated by region and time, from the Oryx OSINT project (destroyed / damaged / abandoned / captured). Counts are a documented minimum, not a total.",
      uk: "Візуально підтверджені втрати техніки, агреговані за регіоном і часом, за даними OSINT-проєкту Oryx (знищено / пошкоджено / покинуто / захоплено). Підрахунки — задокументований мінімум, а не повне число.",
    },
    category: "military",
    sources: ["internal_events", "telegram"],
    default_visible: false,
    legend: [
      { color: "#b91c1c", label: { en: "Destroyed", uk: "Знищено" }, pattern: "solid" },
      { color: "#f59e0b", label: { en: "Damaged", uk: "Пошкоджено" }, pattern: "solid" },
      { color: "#6b7280", label: { en: "Abandoned", uk: "Покинуто" }, pattern: "dashed" },
      { color: "#2563eb", label: { en: "Captured", uk: "Захоплено" }, pattern: "solid" },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Daily (Oryx)", uk: "Щоденно (Oryx)" },
  },
  {
    id: "frontline_control",
    name: { en: "Frontline Control", uk: "Контроль на лінії фронту" },
    description: {
      en: "Area-control polygons (occupied / contested / liberated) along the Ukrainian frontline, with per-polygon confidence. Source: DeepStateMAP — not an official military source.",
      uk: "Полігони контролю території (окуповано / спірна зона / звільнено) уздовж лінії фронту України, з показником впевненості. Джерело: DeepStateMAP — не офіційне військове джерело.",
    },
    category: "military",
    sources: ["telegram"],
    default_visible: false,
    legend: [
      { color: "#cc0000", label: { en: "Occupied (per DeepStateMAP)", uk: "Окуповано (за DeepStateMAP)" }, pattern: "solid" },
      { color: "#f59e0b", label: { en: "Contested / active fighting", uk: "Спірна зона / бойові дії" }, pattern: "hatched" },
      { color: "#0057b7", label: { en: "Recently liberated", uk: "Нещодавно звільнено" }, pattern: "solid" },
      { color: "#9ca3af", label: { en: "Low confidence", uk: "Низька впевненість" }, pattern: "dashed" },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Daily", uk: "Щоденно" },
  },
  {
    id: "belarus_flank",
    name: { en: "Belarus Flank (Hajun / BYPOL)", uk: "Білоруський фланг (Гаюн / BYPOL)" },
    description: {
      en: "Russian military presence and movement through Belarus (the north flank): rail echelons, armor, SAM/missile systems, and aircraft sighted near rail nodes and airbases. Sourced from Hajun Project / BYPOL public reports; coordinates are low-precision (POI centroid). No contributor identities are exposed.",
      uk: "Російська військова присутність і переміщення через Білорусь (північний фланг): військові ешелони, бронетехніка, ЗРК/ракетні комплекси та авіація поблизу залізничних вузлів і авіабаз. Джерело — публічні звіти Hajun / BYPOL; координати низької точності (центроїд об'єкта). Особи джерел не розкриваються.",
    },
    category: "military",
    sources: ["telegram", "sentinel_hub", "internal_events"],
    default_visible: false,
    min_zoom: 4,
    legend: [
      { color: "#b45309", label: { en: "Rail echelon", uk: "Військовий ешелон" }, pattern: "solid" },
      { color: "#92400e", label: { en: "Armor", uk: "Бронетехніка" }, pattern: "solid" },
      { color: "#0e7490", label: { en: "SAM system", uk: "Зенітний комплекс" }, pattern: "solid" },
      { color: "#dc2626", label: { en: "Missile system", uk: "Ракетний комплекс" }, pattern: "solid" },
      { color: "#2563eb", label: { en: "Aircraft", uk: "Літаки" }, pattern: "solid" },
    ],
    access_tier: "registered",
    is_prediction: false,
    update_cadence_label: { en: "Daily (low-frequency OSINT feed)", uk: "Щодня (рідкісний OSINT-фід)" },
  },

  // ── Infrastructure ──────────────────────────────────────────────────────────
  {
    id: "infrastructure_damage",
    name: { en: "Infrastructure Damage", uk: "Пошкодження інфраструктури" },
    description: { en: "Damaged energy, transport, telecom, and water infrastructure.", uk: "Пошкоджена енергетична, транспортна, телекомунікаційна та водна інфраструктура." },
    category: "infrastructure",
    sources: ["internal_events", "osm"],
    default_visible: true,
    legend: [
      { color: "#ffaa00", label: { en: "Energy", uk: "Енергетика" } },
      { color: "#aa6600", label: { en: "Transport", uk: "Транспорт" } },
      { color: "#0066cc", label: { en: "Telecom", uk: "Телеком" } },
      { color: "#0099ff", label: { en: "Water", uk: "Вода" } },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Reported incidents", uk: "Повідомлені інциденти" },
  },
  {
    id: "power_outages",
    name: { en: "Power Outages", uk: "Відключення електроенергії" },
    description: { en: "Power outage areas from utility data, crowdsourced reports, and satellite night-lights.", uk: "Зони відключень за даними постачальника, звітами громадян та нічними супутниковими знімками." },
    category: "infrastructure",
    sources: ["internal_events", "sentinel_hub"],
    default_visible: false,
    legend: [
      { color: "#111133", label: { en: "Outage area", uk: "Зона відключення" }, pattern: "hatched" },
    ],
    access_tier: "registered",
    is_prediction: false,
    update_cadence_label: { en: "Daily", uk: "Щоденно" },
  },
  {
    id: "communication_outages",
    name: { en: "Communication Outages", uk: "Збої зв'язку" },
    description: { en: "Internet and cellular outages from Cloudflare Radar and NetBlocks.", uk: "Збої інтернету та мобільного зв'язку за даними Cloudflare Radar та NetBlocks." },
    category: "infrastructure",
    sources: ["cloudflare_radar", "netblocks"],
    default_visible: false,
    legend: [
      { color: "#660099", label: { en: "Outage", uk: "Збій" }, pattern: "dots" },
    ],
    access_tier: "registered",
    is_prediction: false,
    update_cadence_label: { en: "Near real-time", uk: "Близько реального часу" },
  },

  // ── Civilian ────────────────────────────────────────────────────────────────
  {
    id: "air_raid_alerts",
    name: { en: "Air-Raid Alerts", uk: "Повітряні тривоги" },
    description: { en: "Active air-raid alert status by oblast.", uk: "Активні повітряні тривоги по областях." },
    category: "civilian",
    sources: ["internal_events"],
    default_visible: true,
    legend: [
      { color: "#ff0000", label: { en: "Active alert", uk: "Активна тривога" }, pattern: "solid" },
      { color: "#00aa00", label: { en: "All clear", uk: "Відбій" }, pattern: "solid" },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Real-time", uk: "В реальному часі" },
  },
  {
    id: "shelters",
    name: { en: "Shelters & Humanitarian Points", uk: "Укриття та гуманітарні пункти" },
    description: { en: "Verified shelter locations and humanitarian aid distribution points.", uk: "Підтверджені укриття та пункти видачі гуманітарної допомоги." },
    category: "civilian",
    sources: ["internal_events", "osm"],
    default_visible: false,
    min_zoom: 10,
    legend: [
      { color: "#00aa44", label: { en: "Shelter", uk: "Укриття" } },
      { color: "#0066ff", label: { en: "Aid point", uk: "Гум. пункт" } },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Daily verified", uk: "Щоденна перевірка" },
  },
  {
    id: "emergencies",
    name: { en: "Emergencies (DSNS)", uk: "Надзвичайні ситуації (ДСНС)" },
    description: {
      en: "State Emergency Service (DSNS) events: fires, explosions, building collapses, rescues, demining, floods, hazmat, and evacuation orders.",
      uk: "Події ДСНС: пожежі, вибухи, обвалення будівель, рятувальні операції, розмінування, підтоплення, небезпечні речовини та евакуації.",
    },
    category: "civilian",
    sources: ["telegram", "internal_events", "nasa_firms"],
    default_visible: false,
    legend: [
      { color: "#ef4444", label: { en: "Fire", uk: "Пожежа" }, pattern: "solid" },
      { color: "#dc2626", label: { en: "Explosion", uk: "Вибух" }, pattern: "solid" },
      { color: "#a16207", label: { en: "Collapse", uk: "Обвалення" }, pattern: "solid" },
      { color: "#0ea5e9", label: { en: "Rescue", uk: "Порятунок" }, pattern: "solid" },
      { color: "#16a34a", label: { en: "Demining", uk: "Розмінування" }, pattern: "solid" },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Reported incidents (low-frequency feed)", uk: "Повідомлені інциденти (рідкісний фід)" },
  },
  {
    id: "humanitarian",
    name: { en: "Humanitarian & Displacement", uk: "Гуманітарна ситуація та переміщення" },
    description: {
      en: "Displacement intensity by oblast (IOM DTM) and humanitarian aid-corridor access status (UN OCHA). Aggregate figures only — no personal data.",
      uk: "Інтенсивність переміщення по областях (IOM DTM) та статус доступу гуманітарних коридорів (UN OCHA). Лише агреговані дані — без персональних даних.",
    },
    category: "civilian",
    sources: ["internal_events", "osm"],
    default_visible: false,
    legend: [
      { color: "#1d4ed8", label: { en: "Low displacement", uk: "Низьке переміщення" } },
      { color: "#f59e0b", label: { en: "Moderate displacement", uk: "Помірне переміщення" } },
      { color: "#b91c1c", label: { en: "High displacement", uk: "Високе переміщення" } },
      { color: "#22c55e", label: { en: "Corridor open", uk: "Коридор відкритий" }, pattern: "solid" },
      { color: "#f59e0b", label: { en: "Corridor constrained", uk: "Коридор обмежений" }, pattern: "dashed" },
      { color: "#dc2626", label: { en: "Corridor blocked", uk: "Коридор заблокований" }, pattern: "dashed" },
    ],
    access_tier: "registered",
    is_prediction: false,
    update_cadence_label: { en: "Daily / weekly reports", uk: "Щоденні / щотижневі звіти" },
  },

  // ── Environment ─────────────────────────────────────────────────────────────
  {
    id: "active_fires",
    name: { en: "Active Fires (FIRMS)", uk: "Активні пожежі (FIRMS)" },
    description: { en: "MODIS + VIIRS NRT fire detections. Data is ~3 hours delayed.", uk: "Виявлення MODIS + VIIRS NRT. Затримка даних ~3 год." },
    category: "environment",
    sources: ["nasa_firms"],
    default_visible: false,
    legend: [
      { color: "#ff4400", label: { en: "High confidence fire", uk: "Пожежа (висока впевненість)" } },
      { color: "#ff8800", label: { en: "Nominal confidence fire", uk: "Пожежа (середня впевненість)" } },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "~3h delay (NRT)", uk: "~3 год затримка (NRT)" },
  },
  {
    id: "weather",
    name: { en: "Weather", uk: "Погода" },
    description: { en: "Wind, precipitation, and visibility overlays.", uk: "Накладення вітру, опадів та видимості." },
    category: "environment",
    sources: ["internal_events"],
    default_visible: false,
    legend: [
      { color: "#aaddff", label: { en: "Wind", uk: "Вітер" } },
      { color: "#0044aa", label: { en: "Precipitation", uk: "Опади" } },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Hourly", uk: "Щогодини" },
  },
  {
    id: "crisis_mapping",
    name: { en: "Crisis Mapping (Copernicus EMS)", uk: "Кризове картографування (Copernicus EMS)" },
    description: {
      en: "Authoritative EU crisis maps from the Copernicus Emergency Management Service: flood extents, wildfire burn scars, and per-building damage grading published per activation. Public-domain Copernicus open data — attribution required.",
      uk: "Офіційні кризові карти Служби управління надзвичайними ситуаціями ЄС Copernicus: зони повеней, згарища лісових пожеж та оцінка руйнувань по будівлях, опубліковані за кожною активацією. Відкриті дані Copernicus (суспільне надбання) — потрібне зазначення джерела.",
    },
    category: "environment",
    sources: ["sentinel_hub"],
    default_visible: false,
    legend: [
      { color: "#2563eb", label: { en: "Flood extent", uk: "Зона повені" }, pattern: "solid" },
      { color: "#7c2d12", label: { en: "Burn scar", uk: "Згарище" }, pattern: "hatched" },
      { color: "#b91c1c", label: { en: "Destroyed (damage grading)", uk: "Знищено (оцінка)" }, pattern: "solid" },
      { color: "#f59e0b", label: { en: "Damaged", uk: "Пошкоджено" }, pattern: "solid" },
      { color: "#fde047", label: { en: "Possibly damaged", uk: "Ймовірно пошкоджено" }, pattern: "dots" },
      { color: "#9ca3af", label: { en: "Affected area", uk: "Зона ураження" }, pattern: "dashed" },
    ],
    access_tier: "public",
    is_prediction: false,
    update_cadence_label: { en: "Per activation", uk: "За активацією" },
  },
  {
    id: "thermal",
    name: { en: "Thermal Anomalies", uk: "Теплові аномалії" },
    description: {
      en: "Satellite thermal-IR anomalies (FIRMS, Sentinel-3 SLSTR, Landsat 8/9 TIRS). Coarse resolution — sub-pixel heat sources, not precise points.",
      uk: "Супутникові теплові аномалії в ІЧ-діапазоні (FIRMS, Sentinel-3 SLSTR, Landsat 8/9 TIRS). Груба роздільна здатність — субпіксельні джерела тепла, не точні точки.",
    },
    category: "environment",
    sources: ["nasa_firms", "sentinel_hub"],
    default_visible: false,
    min_zoom: 5,
    legend: [
      { color: "#1e3a8a", label: { en: "Low thermal", uk: "Низька температура" } },
      { color: "#f59e0b", label: { en: "Elevated", uk: "Підвищена" } },
      { color: "#dc2626", label: { en: "Hot anomaly", uk: "Гаряча аномалія" } },
    ],
    access_tier: "registered",
    is_prediction: false,
    update_cadence_label: { en: "6–12h (satellite passes)", uk: "6–12 год (супутникові прольоти)" },
  },

  // ── Motion ──────────────────────────────────────────────────────────────────
  {
    id: "aviation",
    name: { en: "Aviation Tracking", uk: "Авіаційний трекінг" },
    description: { en: "ADS-B + military aircraft estimates.", uk: "ADS-B та оцінки військових повітряних суден." },
    category: "motion",
    sources: ["adsb_exchange", "opensky"],
    default_visible: false,
    legend: [
      { color: "#00ccff", label: { en: "Civilian", uk: "Цивільне" } },
      { color: "#ff6600", label: { en: "Military (estimated)", uk: "Військове (оцінка)" }, pattern: "dashed" },
    ],
    access_tier: "pro",
    is_prediction: false,
    update_cadence_label: { en: "Near real-time", uk: "Близько реального часу" },
  },
  {
    id: "maritime",
    name: { en: "Maritime Tracking (AIS)", uk: "Морський трекінг (AIS)" },
    description: { en: "AIS vessel positions in Black Sea and Azov Sea.", uk: "Позиції суден AIS у Чорному та Азовському морях." },
    category: "motion",
    sources: ["ais"],
    default_visible: false,
    legend: [
      { color: "#0066cc", label: { en: "Cargo", uk: "Вантажне" } },
      { color: "#cc0000", label: { en: "Naval", uk: "Військово-морське" }, pattern: "solid" },
    ],
    access_tier: "pro",
    is_prediction: false,
    update_cadence_label: { en: "Near real-time", uk: "Близько реального часу" },
  },

  // ── Imagery ─────────────────────────────────────────────────────────────────
  {
    id: "sentinel_optical",
    name: { en: "Sentinel-2 Optical", uk: "Sentinel-2 Оптика" },
    description: { en: "Latest cloud-free Sentinel-2 mosaic.", uk: "Остання хмарно-вільна мозаїка Sentinel-2." },
    category: "imagery",
    sources: ["sentinel_hub"],
    default_visible: false,
    min_zoom: 9,
    legend: [],
    access_tier: "pro",
    is_prediction: false,
    update_cadence_label: { en: "Weekly (cloud-free)", uk: "Щотижнево (без хмар)" },
  },
  {
    id: "change_detection",
    name: { en: "Change Detection", uk: "Виявлення змін" },
    description: { en: "Pixel-level changes between recent and baseline imagery.", uk: "Зміни пікселів між поточними та базовими знімками." },
    category: "imagery",
    sources: ["sentinel_hub"],
    default_visible: false,
    min_zoom: 10,
    legend: [
      { color: "#ff0000", label: { en: "Destroyed / changed", uk: "Зруйновано / змінено" } },
    ],
    access_tier: "pro",
    is_prediction: false,
    update_cadence_label: { en: "Weekly", uk: "Щотижнево" },
  },
  {
    id: "sentinel_sar",
    name: { en: "Sentinel-1 SAR", uk: "Sentinel-1 РСА" },
    description: {
      en: "All-weather Sentinel-1 SAR backscatter overlay (sees through cloud and at night).",
      uk: "Всепогодний шар зворотного розсіювання РСА Sentinel-1 (бачить крізь хмари та вночі).",
    },
    category: "imagery",
    sources: ["sentinel_hub"],
    default_visible: false,
    min_zoom: 9,
    legend: [
      { color: "#1f2937", label: { en: "Low backscatter (water / smooth)", uk: "Низьке розсіювання (вода / гладке)" } },
      { color: "#e5e7eb", label: { en: "High backscatter (urban / metal)", uk: "Високе розсіювання (місто / метал)" } },
    ],
    access_tier: "pro",
    is_prediction: false,
    update_cadence_label: { en: "Every 6 days", uk: "Кожні 6 днів" },
  },

  // ── Information ─────────────────────────────────────────────────────────────
  {
    id: "social_media_heatmap",
    name: { en: "Social Media Activity", uk: "Активність соцмереж" },
    description: { en: "Heatmap of geotagged social media posts related to the conflict.", uk: "Теплова карта геотегованих публікацій у соцмережах щодо конфлікту." },
    category: "information",
    sources: ["telegram", "internal_events"],
    default_visible: false,
    legend: [
      { color: "#ff6600", label: { en: "High activity", uk: "Висока активність" } },
    ],
    access_tier: "pro",
    is_prediction: false,
    update_cadence_label: { en: "Hourly", uk: "Щогодини" },
  },
  {
    id: "ai_predicted_zones",
    name: { en: "AI Predicted Hot Zones", uk: "AI-прогнозовані зони активності" },
    description: {
      en: "AI-predicted areas of likely military activity. NOT an observation — model output only.",
      uk: "AI-прогнозовані зони можливої військової активності. НЕ спостереження — лише вихід моделі.",
    },
    category: "information",
    sources: ["ai_model"],
    default_visible: false,
    legend: [
      { color: "#ffcc00", label: { en: "Predicted zone (AI)", uk: "Прогнозована зона (AI)" }, pattern: "hatched" },
    ],
    access_tier: "pro",
    is_prediction: true,
    update_cadence_label: { en: "Daily model run", uk: "Щоденний запуск моделі" },
  },
  {
    id: "cyber_incidents",
    name: { en: "Cyber Incidents", uk: "Кіберінциденти" },
    description: {
      en: "Per-region cyber-incident intensity from CERT-UA / SSSCIP advisories, by sector (energy, telecom, finance, gov, media). Retrospective — advisories lag the underlying activity by days, not seconds.",
      uk: "Інтенсивність кіберінцидентів по областях за оповіщеннями CERT-UA / Держспецзв'язку, за секторами (енергетика, телеком, фінанси, держсектор, ЗМІ). Ретроспективно — оповіщення відстають від подій на дні, а не секунди.",
    },
    category: "information",
    sources: ["internal_events", "telegram"],
    default_visible: false,
    legend: [
      { color: "#dc2626", label: { en: "Energy", uk: "Енергетика" }, pattern: "solid" },
      { color: "#2563eb", label: { en: "Telecom", uk: "Телеком" }, pattern: "solid" },
      { color: "#16a34a", label: { en: "Finance", uk: "Фінанси" }, pattern: "solid" },
      { color: "#7c3aed", label: { en: "Government", uk: "Держсектор" }, pattern: "solid" },
      { color: "#f59e0b", label: { en: "Media", uk: "ЗМІ" }, pattern: "solid" },
      { color: "#94a3b8", label: { en: "Intensity (low → high)", uk: "Інтенсивність (низька → висока)" }, pattern: "hatched" },
    ],
    access_tier: "registered",
    is_prediction: false,
    update_cadence_label: { en: "Daily (retrospective — lags by days)", uk: "Щоденно (ретроспективно — відстає на дні)" },
  },
];

export class LayerRegistry {
  private readonly layers: Map<string, LayerConfig>;

  constructor(entries: LayerConfig[] = LAYER_REGISTRY) {
    this.layers = new Map(entries.map((l) => [l.id, l]));
  }

  get(id: string): LayerConfig | undefined {
    return this.layers.get(id);
  }

  byCategory(category: LayerCategory): LayerConfig[] {
    return [...this.layers.values()].filter((l) => l.category === category);
  }

  byTier(tier: LayerConfig["access_tier"]): LayerConfig[] {
    const tiers: LayerConfig["access_tier"][] = ["public", "registered", "pro", "enterprise"];
    const maxIndex = tiers.indexOf(tier);
    return [...this.layers.values()].filter((l) => tiers.indexOf(l.access_tier) <= maxIndex);
  }

  defaultVisible(): LayerConfig[] {
    return [...this.layers.values()].filter((l) => l.default_visible);
  }

  all(): LayerConfig[] {
    return [...this.layers.values()];
  }
}
