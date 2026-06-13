/**
 * Hub — Energy Security
 * Pillar: /energy-security  |  Subs: grid · pipelines · nuclear · renewables
 */

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const ENERGY_SECURITY_HUB_URLS = {
  pillar: "/energy-security",
  subs: {
    grid: "/energy-security/grid",
    pipelines: "/energy-security/pipelines",
    nuclear: "/energy-security/nuclear",
    renewables: "/energy-security/renewables",
  },
} as const;

// ---------------------------------------------------------------------------
// Pillar narrative (EN + UK)
// ---------------------------------------------------------------------------

export const energySecurityPillarNarrative = {
  en: `Ukraine's energy infrastructure has been a primary target of Russian missile and drone strikes since October 2022. Thermal power plants, hydroelectric dams, high-voltage substations, and gas-transmission hubs have all sustained damage, forcing Ukrenergo to implement rolling blackouts across all oblasts. Aegis Lens tracks grid-attack incidents in real time, cross-references OSINT satellite imagery, and maps per-region outage statistics to give analysts, journalists, and humanitarian planners a single authoritative picture of the energy-security situation.`,
  uk: `Енергетична інфраструктура України є основною ціллю російських ракетних та дронових ударів з жовтня 2022 року. Теплові електростанції, гідроелектростанції, високовольтні підстанції та газотранспортні вузли отримали значних пошкоджень, що змусило НЕК «Укренерго» запровадити ротаційні відключення електроенергії в усіх областях. Aegis Lens відстежує атаки на енергомережу в реальному часі, зіставляє дані OSINT-супутникових знімків та формує статистику відключень по регіонах, надаючи аналітикам, журналістам і гуманітарним планувальникам єдину авторитетну картину стану енергетичної безпеки.`,
} as const;

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export interface GridAttackTimelineEntry {
  date: string;                       // ISO 8601 — "YYYY-MM-DD"
  target: string;                     // human-readable name of the attacked object
  oblastCode: string;                 // ISO 3166-2:UA code, e.g. "UA-30"
  severity: "low" | "medium" | "high" | "critical";
  outageHours?: number;               // estimated duration of outage caused
}

export interface RegionOutageStats {
  oblastCode: string;                 // ISO 3166-2:UA code
  totalOutages: number;               // cumulative count since tracking began
  avgDuration: number;                // average outage duration in hours
  peakDate: string;                   // ISO 8601 date of the worst single-day outage
}

// ---------------------------------------------------------------------------
// Feed configuration
// ---------------------------------------------------------------------------

export const UKRENERGO_FEED_CONFIG = {
  feedUrl: "https://ua.energy/category/news/feed/",
  updateIntervalSeconds: 900,         // 15 minutes
  format: "rss2" as const,
  proxyPath: "/api/feeds/ukrenergo",
  maxItemsToDisplay: 10,
} as const;

// ---------------------------------------------------------------------------
// Civilian energy-safety guidance
// ---------------------------------------------------------------------------

export const CIVILIAN_ENERGY_SAFETY_GUIDANCE = {
  powerBank: {
    en: "Keep at least one power bank (20 000 mAh+) fully charged at all times. Charge devices and banks immediately when power is restored — the next outage may arrive within hours.",
    uk: "Завжди тримайте принаймні один зовнішній акумулятор (20 000 мАг+) зарядженим. Заряджайте пристрої та банки одразу після відновлення електропостачання — наступне відключення може статися за кілька годин.",
  },
  heatingBackup: {
    en: "Prepare a non-electric backup heat source (gas heater, catalytic heater, or thermal sleeping bag rated to –10 °C). Ensure adequate ventilation whenever using combustion heaters indoors to prevent carbon-monoxide build-up.",
    uk: "Підготуйте резервне джерело тепла без електрики (газовий обігрівач, каталітичний обігрівач або термоспальний мішок на –10 °C). Забезпечте достатню вентиляцію при використанні газових обігрівачів у приміщенні, щоб уникнути накопичення чадного газу.",
  },
  waterStorage: {
    en: "Store a minimum of 10 litres of drinking water per person. Water-pumping stations depend on electricity; outages longer than 6 hours can interrupt municipal water pressure.",
    uk: "Зберігайте мінімум 10 літрів питної води на особу. Насосні станції водопостачання залежать від електроенергії; відключення понад 6 годин може призвести до падіння тиску у водогоні.",
  },
  lightingEmergency: {
    en: "Maintain a torch or LED lantern with fresh batteries in every room. Candles are a fire risk — prefer battery or USB-charged lights.",
    uk: "Тримайте ліхтар або LED-лампу зі свіжими батарейками в кожній кімнаті. Свічки є джерелом пожежної небезпеки — надавайте перевагу батарейковим або USB-зарядним ліхтарям.",
  },
  informationChannels: {
    en: "Follow Ukrenergo's official Telegram channel for scheduled and emergency blackout announcements. Local oblast emergency services also publish outage schedules.",
    uk: "Слідкуйте за офіційним Telegram-каналом НЕК «Укренерго» для отримання оголошень про планові та аварійні відключення. Місцеві обласні служби надзвичайних ситуацій також публікують графіки відключень.",
  },
} as const;

// ---------------------------------------------------------------------------
// FAQ (10 Q&As — 3 open + 7 collapsed)
// ---------------------------------------------------------------------------

export interface FaqItem {
  id: string;
  question: { en: string; uk: string };
  answer: { en: string; uk: string };
  /** First 3 items render open (accordion open by default). */
  defaultOpen: boolean;
}

export const ENERGY_FAQ: FaqItem[] = [
  {
    id: "energy-faq-1",
    defaultOpen: true,
    question: {
      en: "How does Aegis Lens track energy-infrastructure attacks?",
      uk: "Як Aegis Lens відстежує атаки на енергетичну інфраструктуру?",
    },
    answer: {
      en: "We ingest official Ukrainian government notifications (Ukrenergo, DTEK press releases), cross-reference open-source satellite imagery (Sentinel-2, Planet), and validate incidents against social media geolocation signals. Each event is manually reviewed before appearing on the timeline.",
      uk: "Ми збираємо офіційні повідомлення українського уряду (НЕК «Укренерго», прес-релізи ДТЕК), зіставляємо їх з відкритими супутниковими знімками (Sentinel-2, Planet) та верифікуємо інциденти за геолокаційними сигналами в соцмережах. Кожна подія проходить ручну перевірку перед публікацією в хронології.",
    },
  },
  {
    id: "energy-faq-2",
    defaultOpen: true,
    question: {
      en: "Which oblasts have suffered the most energy outages?",
      uk: "Які області зазнали найбільших відключень електроенергії?",
    },
    answer: {
      en: "Kharkivska, Zaporizka, Khersonska, and Mykolaivska oblasts — located close to the front line — have historically experienced the highest cumulative outage hours. Kyivska and Odeska oblasts face elevated risk due to their large population and strategic substation density.",
      uk: "Харківська, Запорізька, Херсонська та Миколаївська області — розташовані поблизу лінії фронту — мали найбільшу сукупну тривалість відключень. Київська та Одеська області піддаються підвищеному ризику через велику чисельність населення та стратегічну щільність підстанцій.",
    },
  },
  {
    id: "energy-faq-3",
    defaultOpen: true,
    question: {
      en: "Is nuclear energy a target in the conflict?",
      uk: "Чи є атомна енергетика метою в конфлікті?",
    },
    answer: {
      en: "The Zaporizhzhia Nuclear Power Plant (ZNPP), Europe's largest, has been under Russian occupation since March 2022. IAEA monitoring teams are present on site and publish regular safety reports. The plant's six reactors remain in cold shutdown. Aegis Lens publishes IAEA updates and cross-links them to the nuclear sub-hub.",
      uk: "Запорізька АЕС — найбільша в Європі — перебуває під російською окупацією з березня 2022 року. Моніторингові групи МАГАТЕ присутні на об'єкті й публікують регулярні звіти про безпеку. Шість реакторів станції перебувають у холодному зупинці. Aegis Lens публікує оновлення МАГАТЕ та пов'язує їх із субхабом з ядерної тематики.",
    },
  },
  {
    id: "energy-faq-4",
    defaultOpen: false,
    question: {
      en: "What is a severity rating and how is it assigned?",
      uk: "Що таке рейтинг серйозності та як він присвоюється?",
    },
    answer: {
      en: "Severity is rated on a four-level scale: low (minor damage, no outage), medium (localised outage <12 h), high (widespread outage >12 h or major equipment destroyed), critical (national grid destabilisation or nuclear safety concern). Ratings are assigned by Aegis Lens analysts at incident creation and may be revised as new information emerges.",
      uk: "Серйозність оцінюється за чотирирівневою шкалою: низька (незначні пошкодження, без відключення), середня (локальне відключення <12 год), висока (масштабне відключення >12 год або знищення важливого обладнання), критична (дестабілізація національної енергосистеми або загроза ядерній безпеці). Рейтинги присвоюються аналітиками Aegis Lens при створенні інциденту та можуть переглядатися у міру надходження нових даних.",
    },
  },
  {
    id: "energy-faq-5",
    defaultOpen: false,
    question: {
      en: "How can NGOs or utility operators access the raw outage data?",
      uk: "Як НУО або оператори комунальних служб можуть отримати доступ до вихідних даних про відключення?",
    },
    answer: {
      en: "Aegis Lens offers a REST API with a dedicated /v1/energy/outages endpoint for verified organizational accounts. The response follows GeoJSON-FeatureCollection format with severity and duration fields. Contact our partnerships team to request API credentials.",
      uk: "Aegis Lens надає REST API із спеціалізованим ендпоінтом /v1/energy/outages для верифікованих організаційних акаунтів. Відповідь відповідає форматі GeoJSON-FeatureCollection з полями severity та duration. Зверніться до нашої команди з питань партнерства для отримання облікових даних API.",
    },
  },
  {
    id: "energy-faq-6",
    defaultOpen: false,
    question: {
      en: "What is Ukraine's current electricity generation capacity?",
      uk: "Яка зараз встановлена потужність електрогенерації України?",
    },
    answer: {
      en: "Ukraine's pre-war installed capacity was approximately 55 GW. As of mid-2024 Ukrenergo estimated that sustained strikes had destroyed or damaged the equivalent of roughly 9 GW of thermal and hydro generating capacity. The deficit is partially offset by imports from the European ENTSO-E grid (synchronised in March 2022) and emergency energy-sharing agreements with neighbouring states.",
      uk: "До початку повномасштабного вторгнення встановлена потужність України становила близько 55 ГВт. Станом на середину 2024 року НЕК «Укренерго» оцінювала, що систематичні удари знищили або пошкодили потужності, еквівалентні приблизно 9 ГВт теплової та гідрогенерації. Дефіцит частково компенсується імпортом з європейської мережі ENTSO-E (синхронізація — березень 2022 р.) та угодами про аварійний енергообмін з сусідніми державами.",
    },
  },
  {
    id: "energy-faq-7",
    defaultOpen: false,
    question: {
      en: "Are renewable energy installations targeted?",
      uk: "Чи є об'єкти відновлюваної енергетики цілями ударів?",
    },
    answer: {
      en: "Yes. Large wind farms in Zaporizka and Mykolaivska oblasts as well as solar parks in the south have been shelled or occupy occupied territory. Distributed small-scale renewables (rooftop solar, small wind) are more resilient to targeted strikes but are still vulnerable to blast damage from nearby impacts.",
      uk: "Так. Великі вітрові електростанції в Запорізькій та Миколаївській областях, а також сонячні парки на півдні країни зазнали обстрілів або перебувають на окупованій території. Розосереджена мала відновлювана генерація (дахові сонячні панелі, малі вітрові установки) є більш стійкою до точкових ударів, але все одно вразлива до вибухових пошкоджень від близьких влучань.",
    },
  },
  {
    id: "energy-faq-8",
    defaultOpen: false,
    question: {
      en: "How does pipeline damage affect civilian heating?",
      uk: "Як пошкодження трубопроводів впливає на опалення житла?",
    },
    answer: {
      en: "Ukraine's district-heating (centralized opaliuvannia) systems are fed by a mix of gas, coal, and biomass boilers. Damage to high-pressure gas transmission pipelines or compressor stations can cut supply to entire cities. Municipal heating operators typically switch to backup fuel when gas pressure falls, but reserves are finite — sustained outages lasting more than a few days can force emergency evacuations in winter.",
      uk: "Системи централізованого опалення в Україні живляться від суміші газових, вугільних та біомасових котлів. Пошкодження газотранспортних трубопроводів високого тиску або компресорних станцій може припинити постачання в цілих містах. Муніципальні теплопостачальні підприємства зазвичай переходять на резервне паливо при падінні тиску газу, однак запаси обмежені — тривалі відключення понад кілька діб взимку можуть призвести до примусової евакуації.",
    },
  },
  {
    id: "energy-faq-9",
    defaultOpen: false,
    question: {
      en: "What is Ukrenergo and why does Aegis Lens follow it?",
      uk: "Що таке «Укренерго» і чому Aegis Lens відстежує його?",
    },
    answer: {
      en: "Ukrenergo (NPC Ukrenergo) is the state-owned transmission system operator responsible for Ukraine's high-voltage grid and cross-border interconnections. It is the primary authoritative source for grid-status updates, scheduled and emergency outage announcements, and damage assessments. Aegis Lens ingests its RSS feed and Telegram channel as primary signals for energy-security events.",
      uk: "НЕК «Укренерго» — державне підприємство, що є оператором системи передачі електроенергії та відповідає за високовольтну мережу України та міждержавні з'єднання. Це основне авторитетне джерело інформації про стан мережі, планові та аварійні відключення і оцінку збитків. Aegis Lens збирає дані з RSS-стрічки та Telegram-каналу «Укренерго» як первинні сигнали для моніторингу подій у сфері енергетичної безпеки.",
    },
  },
  {
    id: "energy-faq-10",
    defaultOpen: false,
    question: {
      en: "How can I embed the energy-outage map on my organisation's website?",
      uk: "Як вставити карту відключень електроенергії на сайт моєї організації?",
    },
    answer: {
      en: "Aegis Lens provides an embeddable iframe widget for the energy-outage heatmap. Navigate to /energy-security/grid, click 'Embed this map', and copy the generated snippet. The embed updates every 15 minutes and requires no authentication for the public view tier.",
      uk: "Aegis Lens надає вбудовуваний iframe-віджет для теплової карти відключень електроенергії. Перейдіть на /energy-security/grid, натисніть «Вставити цю карту» та скопіюйте згенерований фрагмент коду. Вбудований елемент оновлюється кожні 15 хвилин і не потребує автентифікації для публічного рівня доступу.",
    },
  },
];
