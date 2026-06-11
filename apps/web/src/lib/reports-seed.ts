import type { Locale } from "@aegis/i18n-config";

export type ReportKind = "regional" | "incident" | "weekly" | "trend" | "methodology";

type Localized = Partial<Record<Locale, string>> & { en: string };

export type ReportSeed = {
  slug: string;
  title: Localized;
  kind: ReportKind;
  publishedAt: string; // ISO
  author: string;
  summary: Localized;
  /** Markdown-like paragraphs. Render as <p> blocks. */
  body: Localized & { en: string }; // single string with "\n\n" between paragraphs
  /** Event IDs cited. Link to /events/<id>. */
  citations: string[];
};

export const REPORTS: ReportSeed[] = [
  {
    slug: "weekly-ua-2026-w21",
    title: {
      en: "Weekly Brief — Ukraine · Week 21 2026",
      uk: "Щотижневий огляд — Україна · Тиждень 21 2026",
    },
    kind: "weekly",
    publishedAt: "2026-05-23T08:00:00Z",
    author: "Aegis Lens Desk",
    summary: {
      en: "Week 21 saw sustained drone activity across northern and eastern oblasts, with a notable missile impact near Dnipro and continued cyber pressure on government portals. Civilian alerts spiked midweek; humanitarian crossings remained elevated at the western border.",
      uk: "21-й тиждень відзначився стабільною активністю БПЛА на півночі та сході, помітним влученням ракети поблизу Дніпра та триваючим кіберпресингом на урядові портали. Цивільні тривоги зросли всередині тижня; гуманітарні перетини залишалися високими на західному кордоні.",
    },
    body: {
      en: "[synthetic — methodology demo only]\n\nActivity this week clustered around three vectors: aerial drone reconnaissance and strikes along the Kharkiv–Sumy axis, kinetic impacts inland near Dnipro, and renewed DDoS pressure against Lviv-region municipal portals. Severity-weighted danger remained elevated through midweek before tapering on Friday.\n\nCivilian alert volume tracked closely with drone activity, with Kyiv oblast logging the highest count of air-raid declarations. Infrastructure incidents — including substation damage in Mykolaiv and water-supply disruption in Kherson — point to ongoing pressure on critical services.\n\nOutlook: expect continued aerial activity through Week 22, with elevated probability of secondary impacts in oblasts adjacent to active fronts. Confidence in this projection is moderate (synthetic seed data).",
      uk: "[синтетика — лише демонстрація методології]\n\nАктивність цього тижня концентрувалася навколо трьох векторів: повітряна розвідка та удари БПЛА по осі Харків–Суми, кінетичні влучення вглиб території поблизу Дніпра та відновлений DDoS-тиск на муніципальні портали Львівщини. Зважена за тяжкістю небезпека залишалася підвищеною до середини тижня.\n\nОбсяг цивільних тривог корелював з активністю БПЛА; Київська область зафіксувала найбільшу кількість оголошень повітряної тривоги. Інциденти з інфраструктурою — пошкодження підстанції на Миколаївщині та перебої водопостачання на Херсонщині — свідчать про триваючий тиск на критичні служби.\n\nПрогноз: очікується продовження повітряної активності протягом 22-го тижня з підвищеною ймовірністю вторинних впливів у прифронтових областях. Впевненість у прогнозі — середня (синтетичні дані).",
    },
    citations: ["01HXKHARKIVDRONE001", "01HXDNIPRO001", "01HXLVIVCYBER001"],
  },
  {
    slug: "incident-dnipro-strike-2026-05-22",
    title: {
      en: "Incident Dossier — Dnipro Missile Impact, 22 May 2026",
      uk: "Досьє інциденту — Влучення ракети у Дніпрі, 22 травня 2026",
    },
    kind: "incident",
    publishedAt: "2026-05-22T19:30:00Z",
    author: "L. Hrytsenko",
    summary: {
      en: "Single-event dossier reconstructing a reported missile impact in the Dnipro metropolitan area, with corroborated severity 4 and confidence band 0.80–0.90. Geolocation precision ~3 km; verification state corroborated pending forensic confirmation.",
      uk: "Досьє за однією подією, що реконструює повідомлене влучення ракети у Дніпровській агломерації, з підтвердженою тяжкістю 4 та смугою впевненості 0,80–0,90. Точність геолокації ~3 км; стан верифікації підтверджено в очікуванні криміналістики.",
    },
    body: {
      en: "[synthetic — methodology demo only]\n\nThe impact was reported at approximately T-3h before publication, with multiple regional channels converging on a consistent location and timeline within a 20-minute window. Initial danger score: 78/100, reflecting combined severity and population proximity.\n\nCorroboration came from two independent regional outlets and a municipal alert feed, lifting the verification state from `unverified` to `corroborated`. Sources cited synthetic example URLs for demonstration; production pipelines would archive originals.\n\nNext steps in production: ingest geolocated imagery (if available), cross-reference with seismic and acoustic open data, and downgrade or upgrade confidence based on forensic indicators.",
      uk: "[синтетика — лише демонстрація методології]\n\nВлучення повідомлено приблизно за 3 години до публікації; кілька регіональних каналів збіглися щодо локації та часу в межах 20-хвилинного вікна. Початковий показник небезпеки: 78/100, з урахуванням тяжкості та близькості населення.\n\nПідтвердження надійшло від двох незалежних регіональних видань та муніципальної стрічки тривог, що підвищило стан верифікації з `unverified` до `corroborated`. Джерела використовують синтетичні URL для демонстрації.\n\nНаступні кроки у продакшені: інтеграція геолокованих зображень, перехресна перевірка з сейсмічними та акустичними відкритими даними, коригування впевненості за криміналістичними індикаторами.",
    },
    citations: ["01HXDNIPRO001"],
  },
  {
    slug: "regional-eu-border-flows-2026-05",
    title: {
      en: "Regional Report — EU Border Flows, May 2026",
      uk: "Регіональний звіт — Перетини кордону ЄС, травень 2026",
    },
    kind: "regional",
    publishedAt: "2026-05-20T12:00:00Z",
    author: "M. Kovalenko",
    summary: {
      en: "Snapshot of humanitarian crossings and cyber activity along the Ukraine–Poland corridor. Medyka crossing volume verified high; phishing campaigns targeting PL government staff remain a persistent background threat.",
      uk: "Знімок гуманітарних перетинів та кіберактивності вздовж коридору Україна–Польща. Перетин у Медиці підтверджено як високий; фішинг проти польських держслужбовців залишається фоновою загрозою.",
    },
    body: {
      en: "[synthetic — methodology demo only]\n\nThe Medyka crossing recorded sustained elevated throughput across the reporting window, with verification state `verified` from a municipal source feed. No anomalous patterns observed in vehicular flow; pedestrian flow tracked seasonal averages adjusted for the current operational tempo.\n\nIn parallel, a phishing campaign targeting Polish government staff was logged in Warsaw, severity 1, confidence 0.61. The campaign is low-impact but persistent and is being tracked for attribution.\n\nRecommendation: continue monitoring corridor flow alongside cyber telemetry; the two have been weakly correlated in prior weeks via shared adversary tempo, though sample size remains small.",
      uk: "[синтетика — лише демонстрація методології]\n\nПерехід у Медиці зафіксував стабільно високу пропускну здатність протягом звітного періоду, стан верифікації `verified` з муніципального джерела. Аномалій у транспортному потоці не виявлено; пішохідний потік відповідає сезонним середнім значенням з поправкою на оперативний темп.\n\nПаралельно у Варшаві зафіксовано фішинг-кампанію проти польських держслужбовців, тяжкість 1, впевненість 0,61. Кампанія малопотужна, але стійка; ведеться відстеження для атрибуції.\n\nРекомендація: продовжити моніторинг коридору разом із кібертелеметрією; останні тижні демонструють слабку кореляцію між цими векторами.",
    },
    citations: ["01HXPLBORDERHUM001", "01HXWARSAWCYBER001"],
  },
  {
    slug: "trend-drone-activity-q2-2026",
    title: {
      en: "Trend Analysis — Drone Activity, Q2 2026",
      uk: "Аналіз трендів — Активність БПЛА, 2-й квартал 2026",
    },
    kind: "trend",
    publishedAt: "2026-05-18T09:15:00Z",
    author: "Aegis Lens Desk",
    summary: {
      en: "Q2 to-date shows a broadening geographic footprint of drone activity, with Kharkiv and Sumy axes accounting for the bulk of confirmed events. Mean severity is stable; mean confidence is rising as corroboration networks mature.",
      uk: "Від початку 2-го кварталу спостерігається розширення географії активності БПЛА; Харківський та Сумський напрямки забезпечують більшість підтверджених подій. Середня тяжкість стабільна; середня впевненість зростає.",
    },
    body: {
      en: "[synthetic — methodology demo only]\n\nAcross the synthetic seed sample, drone-class events cluster along the northern and northeastern borders. The Kharkiv–Sumy corridor concentrates the highest event density, with Sumy and Chernihiv contributing tail activity around restricted airspace declarations.\n\nMean severity per event has held at ~2.5 (5-point scale), while mean confidence has risen modestly as the corroboration graph grows denser. This is consistent with the platform's design assumption that confidence improves as more independent sources are ingested.\n\nMethodology note: trend assertions on synthetic seed data are illustrative only. Production trend charts will be built from the events database with proper time windowing, deduplication, and adversarial filtering.",
      uk: "[синтетика — лише демонстрація методології]\n\nНа синтетичній вибірці події класу БПЛА концентруються вздовж північного та північно-східного кордонів. Коридор Харків–Суми має найвищу щільність подій; Сумська та Чернігівська області доповнюють хвостову активність обмеженнями повітряного простору.\n\nСередня тяжкість на подію тримається на рівні ~2,5; середня впевненість помірно зростає в міру розширення графу підтверджень.\n\nПримітка методології: твердження про тренди на синтетичних даних — суто ілюстративні. Виробничі графіки будуватимуться з бази подій з належним часовим вікном, дедуплікацією та фільтрацією.",
    },
    citations: ["01HXKHARKIVDRONE001", "01HXSUMYDRONE001", "01HXCHERNIHIVAVI001"],
  },
  {
    slug: "methodology-confidence-scoring-v1",
    title: {
      en: "Methodology — Confidence Scoring v1",
      uk: "Методологія — Оцінка впевненості v1",
    },
    kind: "methodology",
    publishedAt: "2026-05-15T10:00:00Z",
    author: "Aegis Lens Engineering",
    summary: {
      en: "First public write-up of the Aegis Lens confidence-scoring model: how raw source signals are combined into a single 0–1 confidence value, and how that value interacts with the verification state machine.",
      uk: "Перший публічний опис моделі оцінки впевненості Aegis Lens: як сирі сигнали джерел об'єднуються в єдину величину 0–1 і як вона взаємодіє з машиною станів верифікації.",
    },
    body: {
      en: "[synthetic — methodology demo only]\n\nConfidence is computed as a weighted aggregate of three signal families: source-trust priors (per-publisher historical accuracy), corroboration depth (number and independence of agreeing sources within a time window), and content-signal heuristics (geolocation precision, named-entity consistency, image provenance).\n\nThe resulting scalar lives in [0, 1] and is surfaced alongside the discrete verification state (`unverified`, `corroborated`, `verified`, `retracted`). The two are intentionally orthogonal: a single high-trust source can yield `verified` at confidence 0.9, while three weak sources may yield `corroborated` at confidence 0.6.\n\nThis is v1. Known limitations include underweighting of vernacular-language sources and a hard floor on source-trust priors for new publishers. Both will be revisited in v2 alongside the move from in-memory seeds to the events database.",
      uk: "[синтетика — лише демонстрація методології]\n\nВпевненість обчислюється як зважена сума трьох сімейств сигналів: апріорна довіра до джерела, глибина підтвердження (кількість і незалежність джерел у часовому вікні) та евристики змісту (точність геолокації, узгодженість іменованих сутностей, походження зображень).\n\nРезультат — скаляр у [0, 1], що відображається поряд із дискретним станом верифікації (`unverified`, `corroborated`, `verified`, `retracted`). Вони навмисно ортогональні.\n\nЦе v1. Серед відомих обмежень — недооцінка джерел місцевими мовами та жорстка нижня межа довіри для нових видавців. Обидва будуть переглянуті у v2.",
    },
    citations: [],
  },
];

export function listReports(): ReportSeed[] {
  return [...REPORTS].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
}

export function getReport(slug: string): ReportSeed | null {
  return REPORTS.find((r) => r.slug === slug) ?? null;
}
