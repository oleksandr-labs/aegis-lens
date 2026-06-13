/**
 * Hub — Satellite Intelligence
 * Pillar: /satellite  |  Subs: sentinel · commercial · sar · change-detection
 */

import type { FaqItem } from "./energy-security";

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const SATELLITE_HUB_URLS = {
  pillar: "/satellite",
  subs: {
    sentinel: "/satellite/sentinel",
    commercial: "/satellite/commercial",
    sar: "/satellite/sar",
    changeDetection: "/satellite/change-detection",
  },
} as const;

// ---------------------------------------------------------------------------
// Pillar narrative (EN + UK)
// ---------------------------------------------------------------------------

export const satellitePillarNarrative = {
  en: `Satellite imagery has become one of the most important open-source intelligence tools for documenting the war in Ukraine. Multi-spectral optical imagery from Sentinel-2 and commercial constellations, combined with Synthetic Aperture Radar (SAR) that penetrates cloud cover, enables near-daily change detection across the entire country. Aegis Lens integrates publicly available imagery, automated change-detection algorithms, and human-analyst review to produce verified, time-stamped damage assessments for military infrastructure, civilian structures, and energy facilities.`,
  uk: `Супутникові знімки стали одним із найважливіших інструментів розвідки на основі відкритих джерел для документування війни в Україні. Мультиспектральні оптичні знімки Sentinel-2 та комерційних сузір'їв у поєднанні з радаром із синтетичною апертурою (SAR), що долає хмарний покрив, уможливлюють майже щоденне виявлення змін на всій території країни. Aegis Lens інтегрує загальнодоступні знімки, алгоритми автоматичного виявлення змін та огляд людиною-аналітиком для отримання верифікованих, датованих оцінок пошкоджень військової інфраструктури, цивільних об'єктів та енергетичних споруд.`,
} as const;

// ---------------------------------------------------------------------------
// Methodology
// ---------------------------------------------------------------------------

export interface SatelliteMethodologyStep {
  order: number;
  stepName: string;
  description: { en: string; uk: string };
}

export interface SatelliteMethodology {
  steps: SatelliteMethodologyStep[];
  confidenceLevels: {
    level: "confirmed" | "likely" | "possible" | "unconfirmed";
    description: { en: string; uk: string };
  }[];
  caveats: { en: string[]; uk: string[] };
}

export const SATELLITE_METHODOLOGY: SatelliteMethodology = {
  steps: [
    {
      order: 1,
      stepName: "Acquisition",
      description: {
        en: "Imagery is sourced from ESA Copernicus (Sentinel-2 L2A), partner commercial providers (Planet, BlackSky, Capella), and public archives. Tasking priorities are set by the analyst team based on reported incidents.",
        uk: "Знімки отримуються з ESA Copernicus (Sentinel-2 L2A), партнерських комерційних постачальників (Planet, BlackSky, Capella) та публічних архівів. Пріоритети зйомки встановлюються аналітичною командою на підставі повідомлених інцидентів.",
      },
    },
    {
      order: 2,
      stepName: "Pre-processing",
      description: {
        en: "Radiometric calibration, atmospheric correction, and co-registration of before/after image pairs. SAR images undergo speckle filtering and geocoding. All outputs are projected to WGS-84 / EPSG:4326.",
        uk: "Радіометрична калібровка, атмосферна корекція та спільна реєстрація пар знімків «до/після». Знімки SAR проходять фільтрацію спеклів та геокодування. Усі результати проєктуються в WGS-84 / EPSG:4326.",
      },
    },
    {
      order: 3,
      stepName: "Change Detection",
      description: {
        en: "Automated change-detection algorithms (pixel-level differencing, NDVI change, SAR coherence loss) flag areas of significant ground disturbance. A confidence score is assigned based on image resolution, revisit gap, and atmospheric quality.",
        uk: "Алгоритми автоматичного виявлення змін (різниця на рівні пікселів, зміна NDVI, втрата когерентності SAR) позначають ділянки зі значним порушенням земної поверхні. Оцінка достовірності призначається на основі роздільної здатності знімків, інтервалу повторного відвідування та якості атмосферних умов.",
      },
    },
    {
      order: 4,
      stepName: "Human Review",
      description: {
        en: "Flagged change areas are inspected by a trained image analyst who classifies the change type (building destruction, cratering, fire scar, flooding, earthwork), assesses probable cause, and assigns a final confidence rating before the event is published.",
        uk: "Позначені ділянки змін перевіряються навченим аналітиком знімків, який класифікує тип зміни (руйнування будівлі, кратер, слід пожежі, затоплення, земляні роботи), оцінює вірогідну причину та присвоює кінцевий рейтинг достовірності перед публікацією події.",
      },
    },
  ],
  confidenceLevels: [
    {
      level: "confirmed",
      description: {
        en: "Two or more independent imagery sources, clear visible damage, corroborated by OSINT ground signals.",
        uk: "Два або більше незалежних джерел знімків, чітко видимі пошкодження, підтверджені наземними сигналами OSINT.",
      },
    },
    {
      level: "likely",
      description: {
        en: "Single high-resolution image with clear change signature; supported by one additional OSINT source.",
        uk: "Один високороздільний знімок із чіткою ознакою зміни; підтримується одним додатковим джерелом OSINT.",
      },
    },
    {
      level: "possible",
      description: {
        en: "Automated detection flag only; lower-resolution imagery or partial cloud cover; awaiting additional sources.",
        uk: "Лише позначення автоматичного виявлення; знімки нижчої роздільної здатності або часткова хмарність; очікуються додаткові джерела.",
      },
    },
    {
      level: "unconfirmed",
      description: {
        en: "Published for awareness; insufficient evidence to classify; may be retracted.",
        uk: "Опубліковано для ознайомлення; недостатньо доказів для класифікації; може бути відкликано.",
      },
    },
  ],
  caveats: {
    en: [
      "Cloud cover over Ukraine can obstruct optical imagery for several consecutive days, particularly in winter.",
      "Commercial imagery may have a 30–90 minute access latency from tasking to delivery.",
      "SAR coherence-loss change detection can produce false positives from vegetation growth or flooding unrelated to conflict.",
      "Damage assessments reflect the state at the time of imaging and may not reflect subsequent repair or further destruction.",
      "Aegis Lens does not publish precise coordinates of active military positions to avoid contributing to targeting.",
    ],
    uk: [
      "Хмарний покрив над Україною може перешкоджати оптичним знімкам кілька днів поспіль, особливо взимку.",
      "Доступ до комерційних знімків може мати затримку від 30 до 90 хвилин від замовлення до отримання.",
      "Виявлення змін за втратою когерентності SAR може давати хибно-позитивні результати через зростання рослинності або затоплення, не пов'язані з конфліктом.",
      "Оцінки пошкоджень відображають стан на момент зйомки та можуть не враховувати подальший ремонт або додаткові руйнування.",
      "Aegis Lens не публікує точні координати активних військових позицій, щоб уникнути сприяння наведенню.",
    ],
  },
};

// ---------------------------------------------------------------------------
// Provider profiles
// ---------------------------------------------------------------------------

export interface SatelliteProviderProfile {
  name: string;
  url: string;
  /** Ground sampling distance in metres. */
  resolution: number;
  /** Approximate revisit cadence in days. */
  revisitDays: number;
  openAccess: boolean;
  slug: string;
  description: { en: string; uk: string };
  spectralBands?: string[];
}

export const SATELLITE_PROVIDER_PROFILES: SatelliteProviderProfile[] = [
  {
    name: "Sentinel-2 (ESA Copernicus)",
    url: "https://sentinel.esa.int/web/sentinel/missions/sentinel-2",
    resolution: 10,
    revisitDays: 5,
    openAccess: true,
    slug: "sentinel-2",
    description: {
      en: "ESA's free-and-open multispectral satellite constellation. 10 m optical resolution at 5-day revisit makes it the backbone of open-source change detection. Level-2A products are atmospherically corrected and freely downloadable via Copernicus Open Access Hub or the Sentinel Hub API.",
      uk: "Безкоштовна та відкрита мультиспектральна супутникова група ESA. Оптична роздільна здатність 10 м при 5-денному повторному відвідуванні робить її основою виявлення змін з відкритих джерел. Продукти рівня 2A атмосферно відкориговані та безкоштовно завантажуються через Copernicus Open Access Hub або Sentinel Hub API.",
    },
    spectralBands: ["B02 (Blue)", "B03 (Green)", "B04 (Red)", "B08 (NIR)", "B11 (SWIR)"],
  },
  {
    name: "Planet Labs (PlanetScope / SkySat)",
    url: "https://www.planet.com",
    resolution: 3,
    revisitDays: 1,
    openAccess: false,
    slug: "planet",
    description: {
      en: "Planet operates the world's largest commercial constellation of Earth observation satellites. PlanetScope provides daily 3 m imagery of the entire Earth's land surface; SkySat offers 50 cm tasked imagery. Aegis Lens accesses Planet data under an education and research programme agreement.",
      uk: "Planet управляє найбільшою у світі комерційною сузір'ям супутників дистанційного зондування Землі. PlanetScope забезпечує щоденні знімки 3 м всієї поверхні суші Землі; SkySat пропонує замовлені знімки 50 см. Aegis Lens отримує доступ до даних Planet за угодою в рамках освітньої та дослідницької програми.",
    },
    spectralBands: ["Red", "Green", "Blue", "NIR"],
  },
  {
    name: "BlackSky Global",
    url: "https://www.blacksky.com",
    resolution: 1,
    revisitDays: 1,
    openAccess: false,
    slug: "blacksky",
    description: {
      en: "BlackSky operates a high-revisit commercial constellation providing 1 m resolution imagery with same-day or next-day delivery. Frequently used for time-critical tasking of conflict-affected areas. BlackSky's analytics platform offers automated object detection and change reporting.",
      uk: "BlackSky управляє комерційним сузір'ям з високою частотою повторного відвідування, що забезпечує знімки роздільної здатністю 1 м з доставкою в той же чи наступний день. Часто використовується для термінової зйомки зон конфлікту. Аналітична платформа BlackSky пропонує автоматичне виявлення об'єктів та звітність про зміни.",
    },
  },
  {
    name: "Capella Space (SAR)",
    url: "https://www.capellaspace.com",
    resolution: 0.5,
    revisitDays: 1,
    openAccess: false,
    slug: "capella-sar",
    description: {
      en: "Capella Space operates the highest-resolution commercial SAR constellation. X-band SAR at 50 cm resolution penetrates cloud cover and works day and night, making it invaluable for Ukraine where weather frequently blocks optical sensors. Capella has been used to document port activity, military vehicle concentrations, and bunker construction.",
      uk: "Capella Space управляє сузір'ям SAR з найвищою роздільною здатністю серед комерційних. X-діапазонний SAR роздільною здатністю 50 см долає хмарний покрив і працює вдень і вночі, що робить його незамінним для України, де погода часто блокує оптичні сенсори. Capella використовувалася для документування портової активності, концентрацій військової техніки та будівництва укриттів.",
    },
  },
];

// ---------------------------------------------------------------------------
// Demo gallery
// ---------------------------------------------------------------------------

export interface SatelliteDemoGalleryItem {
  id: string;
  location: string;
  beforeDate: string;       // ISO 8601
  afterDate: string;        // ISO 8601
  changeType: string;       // human-readable label
  thumbnailUrl: string;     // relative or absolute URL
  pageSlug: string;
}

export const SATELLITE_DEMO_GALLERY: SatelliteDemoGalleryItem[] = [
  {
    id: "demo-mariupol-steelworks",
    location: "Azovstal Iron & Steel Works, Mariupol",
    beforeDate: "2022-02-20",
    afterDate: "2022-05-15",
    changeType: "Industrial facility destruction",
    thumbnailUrl: "/images/satellite/demo/mariupol-azovstal-thumb.jpg",
    pageSlug: "/satellite/gallery/mariupol-azovstal",
  },
  {
    id: "demo-kakhovka-dam",
    location: "Kakhovka Hydroelectric Dam, Khersonska oblast",
    beforeDate: "2023-05-30",
    afterDate: "2023-06-07",
    changeType: "Dam breach and downstream flooding",
    thumbnailUrl: "/images/satellite/demo/kakhovka-dam-thumb.jpg",
    pageSlug: "/satellite/gallery/kakhovka-dam",
  },
  {
    id: "demo-znpp-earthworks",
    location: "Zaporizhzhia Nuclear Power Plant perimeter",
    beforeDate: "2022-08-01",
    afterDate: "2023-02-01",
    changeType: "Military earthworks / fortification",
    thumbnailUrl: "/images/satellite/demo/znpp-earthworks-thumb.jpg",
    pageSlug: "/satellite/gallery/znpp-fortification",
  },
  {
    id: "demo-energy-substation-kharkiv",
    location: "High-voltage substation, Kharkivska oblast",
    beforeDate: "2024-03-20",
    afterDate: "2024-03-26",
    changeType: "Power-infrastructure strike damage",
    thumbnailUrl: "/images/satellite/demo/kharkiv-substation-thumb.jpg",
    pageSlug: "/satellite/gallery/kharkiv-substation",
  },
  {
    id: "demo-crimea-belbek",
    location: "Belbek airbase, Crimea",
    beforeDate: "2024-04-10",
    afterDate: "2024-04-14",
    changeType: "Aircraft / hangar damage assessment",
    thumbnailUrl: "/images/satellite/demo/belbek-airbase-thumb.jpg",
    pageSlug: "/satellite/gallery/belbek-airbase",
  },
];

// ---------------------------------------------------------------------------
// Linked tools
// ---------------------------------------------------------------------------

export interface LinkedTool {
  name: string;
  url: string;
  description: { en: string; uk: string };
  licence: "free" | "freemium" | "commercial";
  tags: string[];
}

export const LINKED_TOOLS_SATELLITE: LinkedTool[] = [
  {
    name: "QGIS",
    url: "https://qgis.org",
    description: {
      en: "Free and open-source desktop GIS for loading, analysing, and styling satellite raster and vector data. Supports numerous satellite-imagery plugins and direct WMS/WMTS connections.",
      uk: "Безкоштовна ГІС з відкритим кодом для завантаження, аналізу та стилізації растрових і векторних супутникових даних. Підтримує численні плагіни для супутникових знімків та прямі підключення WMS/WMTS.",
    },
    licence: "free",
    tags: ["gis", "desktop", "analysis", "open-source"],
  },
  {
    name: "Google Earth Engine",
    url: "https://earthengine.google.com",
    description: {
      en: "Cloud-based planetary-scale geospatial analysis platform with a petabyte-scale archive of satellite imagery including Sentinel, Landsat, and commercial datasets. Free for non-commercial use.",
      uk: "Хмарна платформа геопросторового аналізу планетарного масштабу з архівом супутникових знімків петабайтного масштабу, включаючи Sentinel, Landsat та комерційні набори даних. Безкоштовно для некомерційного використання.",
    },
    licence: "freemium",
    tags: ["cloud", "analysis", "sentinel", "landsat", "python", "javascript"],
  },
  {
    name: "Sentinel Hub",
    url: "https://www.sentinel-hub.com",
    description: {
      en: "Sinergise's commercial API and browser for Copernicus Sentinel data, providing EO Browser for visual analysis and a REST API for programmatic access to time-series imagery and custom band composites.",
      uk: "Комерційний API та браузер Sinergise для даних Copernicus Sentinel, що надає EO Browser для візуального аналізу та REST API для програмного доступу до часових серій знімків і довільних бандових композитів.",
    },
    licence: "freemium",
    tags: ["api", "sentinel", "time-series", "browser"],
  },
  {
    name: "Copernicus Browser",
    url: "https://browser.dataspace.copernicus.eu",
    description: {
      en: "ESA's free browser for the Copernicus Data Space Ecosystem. Allows visual inspection, band combination, and direct download of Sentinel-1 and Sentinel-2 imagery with no account required for basic use.",
      uk: "Безкоштовний браузер ESA для екосистеми Copernicus Data Space. Дозволяє візуальний огляд, поєднання каналів та пряме завантаження знімків Sentinel-1 та Sentinel-2 без облікового запису для базового використання.",
    },
    licence: "free",
    tags: ["browser", "sentinel-1", "sentinel-2", "sar", "free"],
  },
  {
    name: "SNAP (Sentinel Application Platform)",
    url: "https://step.esa.int/main/toolboxes/snap/",
    description: {
      en: "ESA's official toolbox for processing Sentinel SAR (Sentinel-1) and optical (Sentinel-2) products. Includes InSAR coherence, backscatter analysis, and change-detection operators.",
      uk: "Офіційний набір інструментів ESA для обробки радарних (Sentinel-1) та оптичних (Sentinel-2) продуктів Sentinel. Включає когерентність InSAR, аналіз зворотного розсіювання та оператори виявлення змін.",
    },
    licence: "free",
    tags: ["sar", "insar", "sentinel-1", "processing", "desktop"],
  },
];

// ---------------------------------------------------------------------------
// Linked glossary term slugs
// ---------------------------------------------------------------------------

export const LINKED_GLOSSARY_SATELLITE: string[] = [
  "synthetic-aperture-radar",
  "multi-spectral-imagery",
  "change-detection",
  "ndvi",
  "sar-coherence",
  "ground-sampling-distance",
  "revisit-time",
  "insar",
  "false-colour-composite",
  "geolocation-accuracy",
  "atmospheric-correction",
  "open-access-imagery",
  "commercial-imagery",
  "satellite-tasking",
  "cloud-cover-mask",
];

// ---------------------------------------------------------------------------
// FAQ (10 Q&As — 3 open + 7 collapsed)
// ---------------------------------------------------------------------------

export const SATELLITE_FAQ: FaqItem[] = [
  {
    id: "satellite-faq-1",
    defaultOpen: true,
    question: {
      en: "What is satellite change detection and how does it work?",
      uk: "Що таке супутникове виявлення змін і як воно працює?",
    },
    answer: {
      en: "Change detection compares two or more satellite images of the same location taken at different times to identify significant differences. Algorithms measure pixel-level changes in reflectance (for optical imagery) or backscatter / coherence (for SAR). Large differences — such as a building that reflects light before but not after a strike — are flagged for human review.",
      uk: "Виявлення змін порівнює два або більше супутникових знімки одного місця, зроблених у різний час, для виявлення суттєвих відмінностей. Алгоритми вимірюють зміни відбитку на рівні пікселів (для оптичних знімків) або зворотного розсіювання/когерентності (для SAR). Великі відмінності — наприклад, будівля, яка відбиває світло до удару, але не після — позначаються для перевірки людиною.",
    },
  },
  {
    id: "satellite-faq-2",
    defaultOpen: true,
    question: {
      en: "Why is SAR imagery particularly useful for Ukraine?",
      uk: "Чому SAR-знімки особливо корисні для України?",
    },
    answer: {
      en: "Ukraine's climate — particularly in autumn and winter — produces persistent cloud cover that can block optical satellites for days or weeks. SAR (Synthetic Aperture Radar) uses microwave pulses that penetrate cloud and smoke, providing usable imagery regardless of weather. SAR is also effective at night, unlike optical sensors.",
      uk: "Клімат України — особливо восени та взимку — утворює стійкий хмарний покрив, який може блокувати оптичні супутники на дні або тижні. SAR (радар із синтетичною апертурою) використовує мікрохвильові імпульси, що долають хмари та дим, забезпечуючи придатні знімки незалежно від погоди. SAR також ефективний вночі, на відміну від оптичних сенсорів.",
    },
  },
  {
    id: "satellite-faq-3",
    defaultOpen: true,
    question: {
      en: "What is Sentinel-2 and is it free to use?",
      uk: "Що таке Sentinel-2 і чи він безкоштовний?",
    },
    answer: {
      en: "Sentinel-2 is a pair of ESA Earth-observation satellites providing 10 m optical imagery of the entire land surface every 5 days under the EU's Copernicus programme. All data is free and open — it can be downloaded via the Copernicus Data Space Ecosystem (dataspace.copernicus.eu) with no charge or licence fee.",
      uk: "Sentinel-2 — це пара супутників дистанційного зондування ESA, що забезпечують оптичні знімки 10 м всієї поверхні суші кожні 5 днів в рамках програми ЄС Copernicus. Усі дані є безкоштовними та відкритими — їх можна завантажити через Copernicus Data Space Ecosystem (dataspace.copernicus.eu) без жодних зборів або ліцензійних платежів.",
    },
  },
  {
    id: "satellite-faq-4",
    defaultOpen: false,
    question: {
      en: "How accurate are satellite damage assessments?",
      uk: "Наскільки точні супутникові оцінки пошкоджень?",
    },
    answer: {
      en: "Accuracy depends on image resolution, revisit timing, and analyst skill. At 10 m resolution (Sentinel-2) large structures (>20 m) can be reliably assessed; at 50 cm (commercial) individual vehicles and room-level damage can be detected. Our methodology assigns a confidence tier to each event — 'confirmed' events have two or more independent imagery sources.",
      uk: "Точність залежить від роздільної здатності знімків, часу повторного відвідування та кваліфікації аналітика. При роздільній здатності 10 м (Sentinel-2) великі споруди (>20 м) можна надійно оцінити; при 50 см (комерційні) можна виявити окремі транспортні засоби та пошкодження на рівні кімнат. Наша методологія присвоює рівень достовірності кожній події — «підтверджені» події мають два або більше незалежних джерел знімків.",
    },
  },
  {
    id: "satellite-faq-5",
    defaultOpen: false,
    question: {
      en: "Does Aegis Lens show real-time satellite imagery?",
      uk: "Чи показує Aegis Lens супутникові знімки в реальному часі?",
    },
    answer: {
      en: "No. We do not stream live or real-time satellite feeds. Our fastest refresh is same-day commercial imagery where coverage is available, but most of our change-detection events are published within 24–72 hours of the imagery acquisition date. We clearly label each event with the image acquisition date so users understand the temporal gap.",
      uk: "Ні. Ми не транслюємо живі або потокові супутникові дані в реальному часі. Наше найшвидше оновлення — комерційні знімки того ж дня там, де доступне покриття, але більшість наших подій виявлення змін публікуються протягом 24–72 годин після дати отримання знімку. Ми чітко позначаємо кожну подію датою отримання знімку, щоб користувачі розуміли часовий розрив.",
    },
  },
  {
    id: "satellite-faq-6",
    defaultOpen: false,
    question: {
      en: "What is InSAR and can it detect underground structures?",
      uk: "Що таке InSAR і чи може він виявляти підземні споруди?",
    },
    answer: {
      en: "Interferometric SAR (InSAR) measures millimetre-scale surface deformation by comparing the phase difference between two SAR images of the same area. It can detect ground subsidence from tunnelling or bunker construction, as well as landslide and flood-related ground movement. It cannot image underground spaces directly but can infer significant excavation from surface settlement patterns.",
      uk: "Інтерферометричний SAR (InSAR) вимірює деформацію поверхні в міліметровому масштабі шляхом порівняння різниці фаз між двома SAR-знімками однієї ділянки. Він може виявляти осідання ґрунту внаслідок тунелювання або будівництва бункерів, а також переміщення ґрунту внаслідок зсувів і повеней. Він не може безпосередньо зображати підземні простори, але може виявити значні розкопки за моделями осідання поверхні.",
    },
  },
  {
    id: "satellite-faq-7",
    defaultOpen: false,
    question: {
      en: "How can researchers access Aegis Lens satellite data?",
      uk: "Як дослідники можуть отримати доступ до супутникових даних Aegis Lens?",
    },
    answer: {
      en: "Academic researchers and verified journalists can apply for a Research API key at /api-access. The key grants access to our /v1/satellite/events endpoint (GeoJSON), which includes imagery dates, confidence levels, change-type classification, and bounding boxes. Raw imagery hosting is not available — we link to source providers.",
      uk: "Академічні дослідники та верифіковані журналісти можуть подати заявку на ключ API для досліджень на /api-access. Ключ надає доступ до ендпоінту /v1/satellite/events (GeoJSON), який включає дати знімків, рівні достовірності, класифікацію типу зміни та обмежувальні рамки. Хостинг вихідних знімків недоступний — ми посилаємося на постачальників джерел.",
    },
  },
  {
    id: "satellite-faq-8",
    defaultOpen: false,
    question: {
      en: "What is the difference between multispectral and panchromatic imagery?",
      uk: "У чому різниця між мультиспектральними та панхроматичними знімками?",
    },
    answer: {
      en: "Panchromatic imagery captures a single broad band across the visible spectrum at high spatial resolution (e.g., 30 cm). Multispectral imagery captures multiple distinct wavelength bands (visible, NIR, SWIR) at slightly lower resolution but enables vegetation health indices (NDVI), water detection, and fire/burn-scar mapping that panchromatic cannot provide.",
      uk: "Панхроматичні знімки охоплюють одну широку смугу у видимому спектрі з високою просторовою роздільною здатністю (наприклад, 30 см). Мультиспектральні знімки охоплюють кілька окремих діапазонів довжин хвиль (видимий, ближній ІЧ, SWIR) при дещо нижчій роздільній здатності, але дають змогу визначати індекси здоров'я рослинності (NDVI), виявляти воду та картографувати пожежі/горілі ділянки, що неможливо за допомогою панхроматичних знімків.",
    },
  },
  {
    id: "satellite-faq-9",
    defaultOpen: false,
    question: {
      en: "Are satellite images used as legal evidence?",
      uk: "Чи використовуються супутникові знімки як доказ у судочинстві?",
    },
    answer: {
      en: "Yes — satellite imagery has been submitted as evidence in war-crimes proceedings at the ICC and national courts. For evidence use, the chain of custody of the original data product and the analytical methodology must be rigorously documented. Aegis Lens retains provenance metadata for all events and can provide supporting documentation to legal teams upon request through our legal-process contact.",
      uk: "Так — супутникові знімки подавалися як докази у провадженнях щодо воєнних злочинів у МКС та національних судах. Для використання в якості доказів необхідно ретельно задокументувати ланцюг зберігання оригінального продукту даних та аналітичну методологію. Aegis Lens зберігає метадані про походження для всіх подій і може надавати підтверджувальну документацію юридичним командам за запитом через наш контакт для юридичних запитів.",
    },
  },
  {
    id: "satellite-faq-10",
    defaultOpen: false,
    question: {
      en: "What is the best free tool for beginners to explore satellite imagery of Ukraine?",
      uk: "Який найкращий безкоштовний інструмент для початківців для перегляду супутникових знімків України?",
    },
    answer: {
      en: "Copernicus Browser (browser.dataspace.copernicus.eu) is the easiest entry point — no account needed for basic viewing. Draw an area of interest, select a date range, and browse Sentinel-2 true-colour or false-colour composites. For time-lapse change detection, Google Earth Engine's Timelapse tool (earthengine.google.com/timelapse) visualises years of Landsat and Sentinel imagery in seconds.",
      uk: "Copernicus Browser (browser.dataspace.copernicus.eu) є найпростішою точкою входу — для базового перегляду акаунт не потрібен. Намалюйте область інтересу, виберіть діапазон дат і переглядайте природноколірні або хибноколірні композити Sentinel-2. Для виявлення змін у вигляді таймлапсу інструмент Google Earth Engine Timelapse (earthengine.google.com/timelapse) візуалізує роки знімків Landsat та Sentinel за секунди.",
    },
  },
];
