// Drones Hub — Aegis Lens
// Covers: /drones and /drones/<sub>
// Subs: uav · counter-uav · swarms · loitering-munitions · fpv · maritime-drones

// ---------------------------------------------------------------------------
// URL map
// ---------------------------------------------------------------------------

export const DRONES_HUB_URLS = {
  pillar: "/drones",
  subs: {
    uav: "/drones/uav",
    counterUav: "/drones/counter-uav",
    swarms: "/drones/swarms",
    loiteringMunitions: "/drones/loitering-munitions",
    fpv: "/drones/fpv",
    maritimeDrones: "/drones/maritime-drones",
  },
} as const;

// ---------------------------------------------------------------------------
// Sub-category type
// ---------------------------------------------------------------------------

export type DroneSubCategory =
  | "uav"
  | "counter-uav"
  | "swarms"
  | "loitering-munitions"
  | "fpv"
  | "maritime-drones";

// ---------------------------------------------------------------------------
// Pillar narrative
// ---------------------------------------------------------------------------

export const dronesPillarNarrative = {
  en: {
    headline: "Drone & UAS Intelligence",
    subheadline:
      "UAV operations, counter-UAS systems, swarms, loitering munitions, FPV, and maritime drones — tracked and classified.",
    body: "Ukraine is the world's first large-scale laboratory for autonomous and semi-autonomous aerial systems in peer-on-peer warfare. Both sides field tens of thousands of FPV drones weekly, launch strategic Shahed swarms against infrastructure, and experiment with maritime USVs that have reshaped Black Sea access. Aegis Lens tracks drone activity by type, operator, target category, and effectiveness — providing the most structured open-source drone order-of-battle available.",
    cta: "View drone activity map",
  },
  uk: {
    headline: "Розвідка дронів та БпЛА",
    subheadline:
      "Операції БпЛА, системи протидії, рої, барражуючі боєприпаси, FPV та морські дрони — відстеження та класифікація.",
    body: "Україна є першою у світі широкомасштабною лабораторією автономних і напівавтономних авіаційних систем у рівноважній війні. Обидві сторони щотижня задіюють десятки тисяч FPV-дронів, запускають стратегічні рої «Шахедів» проти інфраструктури та експериментують з морськими БЕК, що змінили доступ до Чорного моря. Aegis Lens відстежує активність дронів за типом, оператором, категорією цілі та ефективністю.",
    cta: "Переглянути карту активності дронів",
  },
} as const;

// ---------------------------------------------------------------------------
// Per-model equipment pages
// ---------------------------------------------------------------------------

export type DroneEquipmentPage = {
  slug: string;
  model: string;
  operator: "UA" | "RU" | "both" | "unknown";
  subCategory: DroneSubCategory;
  description: string;
  descriptionUk: string;
  url: string;
  rangeKm: number | null;
  payloadKg: number | null;
  firstDocumentedUseDate: string | null;
};

export const DRONE_EQUIPMENT_PAGES: DroneEquipmentPage[] = [
  {
    slug: "shahed-136",
    model: "Shahed-136 / Geran-2",
    operator: "RU",
    subCategory: "loitering-munitions",
    description:
      "Iranian-designed one-way attack UAV used by Russia in mass strike packages against Ukrainian energy and infrastructure. Identified by distinctive engine sound and delta-wing profile. Range ~2,500 km; warhead ~50 kg.",
    descriptionUk:
      "Розроблений в Ірані одноразовий ударний БпЛА, що використовується Росією в масованих ударах по українській енергетиці та інфраструктурі. Дальність ~2 500 км; бойова частина ~50 кг.",
    url: "/equipment/shahed-136",
    rangeKm: 2500,
    payloadKg: 50,
    firstDocumentedUseDate: "2022-09-13",
  },
  {
    slug: "bayraktar-tb2",
    model: "Bayraktar TB2",
    operator: "UA",
    subCategory: "uav",
    description:
      "Turkish medium-altitude long-endurance UCAV. Dominant in early stages of the war for armour kills; increasingly challenged by Russian air defence improvements. Armed with MAM-L and MAM-C munitions.",
    descriptionUk:
      "Турецький БПЛА середньої висоти та великої тривалості польоту. Домінував на початкових етапах війни для знищення бронетехніки; дедалі більше вразливий через вдосконалення російської ППО.",
    url: "/equipment/bayraktar-tb2",
    rangeKm: 150,
    payloadKg: 55,
    firstDocumentedUseDate: "2022-02-27",
  },
  {
    slug: "lancet-3",
    model: "Lancet-3 (ZALA)",
    operator: "RU",
    subCategory: "loitering-munitions",
    description:
      "Russian loitering munition from ZALA Aero (Kalashnikov Group). Used extensively against Ukrainian artillery, air-defence radar, and armoured vehicles. Features optical and laser terminal guidance.",
    descriptionUk:
      "Російський барражуючий боєприпас від ZALA Aero (Група Калашнікова). Широко використовується проти української артилерії, РЛС ППО та бронетехніки. Оптичне та лазерне кінцеве наведення.",
    url: "/equipment/lancet-3",
    rangeKm: 40,
    payloadKg: 3,
    firstDocumentedUseDate: "2022-07-01",
  },
  {
    slug: "fpv-generic-ua",
    model: "Ukrainian FPV Strike Drone (generic)",
    operator: "UA",
    subCategory: "fpv",
    description:
      "First-person-view racing-drone airframes converted for one-way attack missions. Typically carry RPG-7 warheads or 40 mm grenades. Manufactured in the hundreds of thousands via distributed civilian networks. Unit cost ~$500.",
    descriptionUk:
      "Рамки гоночних дронів від першої особи (FPV), перетворені на одноразові ударні місії. Зазвичай несуть гранатомети РПГ-7 або гранати 40 мм. Виробляються сотнями тисяч через розподілені цивільні мережі.",
    url: "/equipment/fpv-generic-ua",
    rangeKm: 10,
    payloadKg: 0.5,
    firstDocumentedUseDate: "2023-01-01",
  },
  {
    slug: "sea-baby",
    model: "Sea Baby USV",
    operator: "UA",
    subCategory: "maritime-drones",
    description:
      "Ukrainian naval surface drone (unmanned surface vehicle) developed by SBU. Carries ~450 kg explosive payload. Used in attacks on Kerch Strait infrastructure, Russian Navy vessels, and Crimean Bridge. Cruise speed ~80 km/h.",
    descriptionUk:
      "Український морський дрон (безпілотний надводний апарат), розроблений СБУ. Несе ~450 кг вибухівки. Застосовувався в атаках на Керченську переправу, кораблі ЧФ Росії та Кримський міст.",
    url: "/equipment/sea-baby",
    rangeKm: 800,
    payloadKg: 450,
    firstDocumentedUseDate: "2022-10-29",
  },
  {
    slug: "uran-9",
    model: "Uran-9 UGV",
    operator: "RU",
    subCategory: "uav",
    description:
      "Russian unmanned ground combat vehicle trialled in Ukraine. Armed with 30 mm cannon and Ataka anti-tank missiles. Limited operational use; significant reliability failures documented in Syria and Ukraine field reports.",
    descriptionUk:
      "Російський безпілотний бойовий наземний апарат, що випробовувався в Україні. Озброєний гарматою 30 мм та протитанковими ракетами «Атака». Обмежене оперативне застосування.",
    url: "/equipment/uran-9",
    rangeKm: 3,
    payloadKg: null,
    firstDocumentedUseDate: "2023-06-01",
  },
];

// ---------------------------------------------------------------------------
// Drone threat trends
// ---------------------------------------------------------------------------

export type DroneThreatSeverity = "low" | "medium" | "high" | "critical";

export type DroneThreatTrend = {
  id: string;
  month: string;
  subCategory: DroneSubCategory;
  region: string;
  title: string;
  titleUk: string;
  description: string;
  descriptionUk: string;
  severity: DroneThreatSeverity;
  documentedEvents: number | null;
};

export const DRONE_THREAT_TRENDS: DroneThreatTrend[] = [
  {
    id: "trend-shahed-saturation-2024",
    month: "2024-01",
    subCategory: "loitering-munitions",
    region: "Ukraine (nationwide)",
    title: "Shahed saturation strikes against energy grid",
    titleUk: "Масовані удари «Шахед» по енергетичній мережі",
    description:
      "Monthly Shahed launches exceeding 400 units targeted thermal power plants and substations. Ukrainian air-defence shoot-down rate estimated at 60–75% per OSINT tracking.",
    descriptionUk:
      "Щомісячні пуски «Шахед», що перевищують 400 одиниць, були спрямовані на теплові електростанції та підстанції. Оцінений показник збиття ППО 60–75%.",
    severity: "critical",
    documentedEvents: 420,
  },
  {
    id: "trend-fpv-frontline-2024",
    month: "2024-03",
    subCategory: "fpv",
    region: "Donetsk, Zaporizhzhia, Kherson",
    title: "FPV drones dominate frontline attrition",
    titleUk: "FPV-дрони домінують у фронтовому знищенні",
    description:
      "FPV attack drones account for an estimated 50–60% of confirmed vehicle kills on both sides across the contact line. Both sides deploy 20,000–30,000 FPV units per month.",
    descriptionUk:
      "FPV-дрони забезпечують приблизно 50–60% підтверджених знищень техніки обох сторін по лінії зіткнення.",
    severity: "high",
    documentedEvents: null,
  },
  {
    id: "trend-maritime-2023-crimea",
    month: "2023-08",
    subCategory: "maritime-drones",
    region: "Black Sea, Crimea",
    title: "USV campaign forces Russian fleet repositioning",
    titleUk: "Кампанія БЕК вимушує ЧФ Росії до переміщення",
    description:
      "Ukrainian naval drones struck Novorossiysk harbour and multiple Russian ships. Russian Black Sea Fleet repositioned significant surface assets to Novorossiysk from Sevastopol.",
    descriptionUk:
      "Українські морські дрони вразили порт Новоросійська та кілька російських кораблів. ЧФ Росії перемістив значні надводні активи до Новоросійська.",
    severity: "high",
    documentedEvents: 12,
  },
  {
    id: "trend-deep-strike-drones-2024",
    month: "2024-05",
    subCategory: "uav",
    region: "Russian Federation (border oblasts + Moscow region)",
    title: "Ukrainian long-range drone strikes on Russian oil refineries",
    titleUk: "Українські далекобійні дрони вражають російські НПЗ",
    description:
      "Ukrainian ATACMS-class long-range drones conducted documented strikes on oil refineries in Saratov, Ryazan, and Nizhny Novgorod oblasts, disrupting an estimated 12–15% of Russian refinery capacity.",
    descriptionUk:
      "Українські далекобійні дрони завдали задокументованих ударів по НПЗ у Саратовській, Рязанській та Нижегородській областях.",
    severity: "high",
    documentedEvents: 18,
  },
];

// ---------------------------------------------------------------------------
// Counter-UAV ecosystem
// ---------------------------------------------------------------------------

export type CounterUavSystem = {
  slug: string;
  name: string;
  nameUk: string;
  operator: "UA" | "RU" | "both" | "Western";
  method: "kinetic" | "electronic-warfare" | "laser" | "combined";
  description: string;
  descriptionUk: string;
  effectiveAgainst: DroneSubCategory[];
  deployedInUkraine: boolean;
};

export const COUNTER_UAV_ECOSYSTEM: CounterUavSystem[] = [
  {
    slug: "gepard-c-uav",
    name: "Gepard SPAAG (C-UAV role)",
    nameUk: "Gepard SPAAG (роль C-UAV)",
    operator: "UA",
    method: "kinetic",
    description:
      "German-supplied self-propelled twin 35mm anti-aircraft gun repurposed as primary counter-drone platform. Highly effective against Shahed at low altitude. Significant munitions requirement.",
    descriptionUk:
      "Германська самохідна зенітна установка (двоствольна 35 мм), перепрофільована як основна платформа протидрону. Високоефективна проти «Шахед» на малій висоті.",
    effectiveAgainst: ["loitering-munitions", "uav"],
    deployedInUkraine: true,
  },
  {
    slug: "bukovel-ad",
    name: "Bukovel-AD EW System",
    nameUk: "РЕБ «Буковель-АД»",
    operator: "UA",
    method: "electronic-warfare",
    description:
      "Ukrainian-developed mobile electronic warfare system for counter-UAV. Jams drone control frequencies and GPS navigation. Operational range classified; effective against commercial-grade FPV at moderate distances.",
    descriptionUk:
      "Розроблена в Україні мобільна система РЕБ для протидії БпЛА. Глушить частоти управління дронами та GPS-навігацію.",
    effectiveAgainst: ["fpv", "uav"],
    deployedInUkraine: true,
  },
  {
    slug: "iris-t-slm",
    name: "IRIS-T SLM",
    nameUk: "IRIS-T SLM",
    operator: "UA",
    method: "kinetic",
    description:
      "German ground-launched surface-to-air missile system. Primarily used against cruise missiles and aircraft but carries a C-UAS role against high-value UAV assets.",
    descriptionUk:
      "Германська зенітна ракетна система наземного базування. Переважно застосовується проти крилатих ракет та літаків, але виконує роль C-UAS проти коштовних БпЛА.",
    effectiveAgainst: ["loitering-munitions", "uav"],
    deployedInUkraine: true,
  },
  {
    slug: "palyanitsya",
    name: "Palyanytsia (UA drone interceptor)",
    nameUk: "Паляниця",
    operator: "UA",
    method: "kinetic",
    description:
      "Ukrainian-developed drone interceptor using a small UAV as a kinetic kill vehicle to ram incoming loitering munitions. Cost-effective counter to low-cost threats. Announced publicly 2024.",
    descriptionUk:
      "Розроблений в Україні дрон-перехоплювач, що використовує малий БпЛА як кінетичний вражаючий засіб для таранення барражуючих боєприпасів. Публічно оголошений у 2024 році.",
    effectiveAgainst: ["loitering-munitions", "fpv"],
    deployedInUkraine: true,
  },
  {
    slug: "tor-m2",
    name: "Tor-M2 (C-UAS deployment)",
    nameUk: "Тор-М2 (застосування C-UAS)",
    operator: "RU",
    method: "kinetic",
    description:
      "Russian short-range SAM system documented engaging Ukrainian FPV drones and UAVs on the Russian side of the contact line. High cost-per-kill ratio questioned for counter-FPV use.",
    descriptionUk:
      "Російська SAM малої дальності, задокументована для ураження українських FPV-дронів та БпЛА на російській стороні лінії зіткнення.",
    effectiveAgainst: ["fpv", "uav"],
    deployedInUkraine: true,
  },
];

// ---------------------------------------------------------------------------
// Civilian safety guidance
// ---------------------------------------------------------------------------

export const CIVILIAN_SAFETY_GUIDANCE = {
  en: {
    headline: "What to do during a drone alert",
    summary:
      "Aegis Lens provides the following civilian safety guidance based on Ukrainian government recommendations and civil-protection practice during drone and missile attacks.",
    shelterInPlaceSteps: [
      "Immediately move to the lowest floor of your building or an underground shelter when a drone/missile alert sounds.",
      "Avoid windows and external walls — blast fragmentation is a primary cause of civilian injury.",
      "If no basement is available, shelter in an interior stairwell or bathroom — these offer structural protection.",
      "Do not go outside to observe drones. FPV and loitering munitions can change course without warning.",
      "Turn off gas appliances before sheltering to reduce fire risk from a nearby impact.",
      "Keep a charged phone, water, and critical documents in your shelter location.",
      "Wait for the all-clear signal from official channels (air raid app, local authorities) before leaving shelter.",
      "Do not approach or touch any unidentified object that lands nearby — it may be an unexploded munition (UXO). Call 101 (Fire/Rescue) immediately.",
    ],
    appRecommendation:
      "Install Ukraine's official air-raid alert app — 'Повітряна тривога' (Povitriana Tryvoga) — for real-time oblast-level alerts.",
    uxoNote:
      "Never approach or move unexploded ordnance. Report to emergency services (101) and mark the area. UXO incidents have caused civilian casualties long after the initial strike.",
  },
  uk: {
    headline: "Що робити під час повітряної тривоги",
    summary:
      "Aegis Lens надає наступні настанови з цивільної безпеки на основі рекомендацій уряду України та практики цивільного захисту під час атак дронів та ракет.",
    shelterInPlaceSteps: [
      "При звуку сигналу тривоги негайно перейдіть на найнижчий поверх будівлі або в підземне укриття.",
      "Уникайте вікон і зовнішніх стін — осколки вибуху є основною причиною поранень цивільних.",
      "Якщо немає підвалу, сховайтеся у внутрішньому сходовому прольоті або ванній кімнаті — вони забезпечують структурний захист.",
      "Не виходьте на вулицю спостерігати за дронами. FPV та барражуючі боєприпаси можуть змінити курс без попередження.",
      "Перед укриттям вимкніть газові прилади, щоб знизити ризик пожежі від близького влучання.",
      "Тримайте заряджений телефон, воду та важливі документи в місці укриття.",
      "Очікуйте сигналу відбою від офіційних каналів (застосунок повітряної тривоги, місцева влада) перед виходом з укриття.",
      "Не підходьте і не торкайтеся жодного невідомого предмету, що впав поблизу — це може бути невибухлий боєприпас (НРБ). Негайно зателефонуйте 101.",
    ],
    appRecommendation:
      "Встановіть офіційний застосунок сигналів повітряної тривоги — «Повітряна тривога» — для отримання попереджень в режимі реального часу.",
    uxoNote:
      "Ніколи не підходьте до невибухлих боєприпасів і не переміщуйте їх. Повідомте рятувальні служби (101) та позначте місце. Інциденти з НРБ завдавали жертв серед цивільного населення.",
  },
} as const;

// ---------------------------------------------------------------------------
// FAQ — 10 Q&As (3 open + 7 collapsed), FAQPage JSON-LD ready
// ---------------------------------------------------------------------------

export type FaqItem = {
  question: string;
  questionUk: string;
  answer: string;
  answerUk: string;
  defaultOpen: boolean;
};

export const DRONES_FAQ: FaqItem[] = [
  {
    question: "What types of drones does Aegis Lens track?",
    questionUk: "Які типи дронів відстежує Aegis Lens?",
    answer:
      "Aegis Lens tracks six categories: conventional UAVs (reconnaissance and armed), counter-UAV systems, drone swarms, loitering munitions (kamikaze drones), FPV strike drones, and maritime unmanned surface vehicles (USVs). Each category has a dedicated sub-hub with equipment profiles, incident tracking, and trend analysis.",
    answerUk:
      "Aegis Lens відстежує шість категорій: звичайні БпЛА (розвідувальні та ударні), системи протидії БпЛА, рої дронів, барражуючі боєприпаси (дрони-камікадзе), ударні FPV-дрони та морські безпілотні надводні апарати (БЕК).",
    defaultOpen: true,
  },
  {
    question: "What is a loitering munition and how is it different from a regular drone?",
    questionUk: "Що таке барражуючий боєприпас і чим він відрізняється від звичайного дрона?",
    answer:
      "A loitering munition (also called a kamikaze drone or suicide drone) is a one-way attack weapon that loiters over a target area searching for a valid target, then dives and detonates. Unlike a conventional drone, it is not recovered — it is the munition. The Shahed-136 and Lancet-3 are the two most documented examples in the Ukraine war.",
    answerUk:
      "Барражуючий боєприпас (також відомий як дрон-камікадзе) — це одноразова ударна зброя, яка кружляє над цільовою зоною у пошуках цілі, потім пікірує та детонує. На відміну від звичайного дрона, він не повертається — він і є боєприпасом.",
    defaultOpen: true,
  },
  {
    question: "How significant is drone warfare in the Ukraine conflict?",
    questionUk: "Наскільки значним є застосування дронів у конфлікті в Україні?",
    answer:
      "Drone warfare has become the defining tactical innovation of the Ukraine conflict. FPV drones account for an estimated majority of frontline vehicle kills on both sides. Strategic Shahed swarms have caused billions in infrastructure damage. Ukrainian USVs have effectively neutralised Russian Black Sea Fleet surface superiority. Both sides produce drones in the hundreds of thousands per month.",
    answerUk:
      "Дронова війна стала визначальною тактичною інновацією конфлікту в Україні. FPV-дрони забезпечують більшість підтверджених знищень фронтової техніки обох сторін. Стратегічні рої «Шахед» завдали збитків інфраструктурі на мільярди. Українські БЕК фактично нейтралізували перевагу ЧФ Росії.",
    defaultOpen: true,
  },
  {
    question: "What is an FPV drone?",
    questionUk: "Що таке FPV-дрон?",
    answer:
      "FPV (first-person view) drones are originally recreational racing drones whose pilot wears video goggles receiving a live feed from a camera on the aircraft. In Ukraine, they have been widely adapted as one-way attack weapons carrying small explosive warheads. Their low cost (~$500), high accuracy at close range, and ease of production make them the dominant attrition weapon of the war.",
    answerUk:
      "FPV-дрони (від першої особи) — спочатку спортивні гоночні дрони, де пілот носить відеоокуляри. В Україні вони широко адаптовані як одноразові ударні засоби з невеликими вибуховими бойовими частинами. Низька вартість (~500 USD), висока точність та простота виробництва зробили їх домінуючою зброєю знищення.",
    defaultOpen: false,
  },
  {
    question: "How does Aegis Lens verify drone strike claims?",
    questionUk: "Як Aegis Lens перевіряє твердження про ударі дронів?",
    answer:
      "Drone strike verification requires at least two independent sources plus geolocation confirmation. Geolocation involves matching visual landmarks in posted footage against satellite imagery and street-level data. Attribution — determining which side launched — requires additional evidence such as debris identification, trajectory analysis, or official statements.",
    answerUk:
      "Перевірка ударів дронів вимагає принаймні двох незалежних джерел плюс підтвердження геолокації. Геолокація передбачає зіставлення візуальних орієнтирів у відеоматеріалах із супутниковими знімками.",
    defaultOpen: false,
  },
  {
    question: "What counter-drone measures are deployed in Ukraine?",
    questionUk: "Які засоби протидрону застосовуються в Україні?",
    answer:
      "Ukraine deploys a layered counter-drone ecosystem: electronic warfare (jamming GPS and control frequencies), kinetic systems (modified AAA guns like Gepard, SAMs, dedicated interceptor drones like Palyanytsia), and early warning networks. Russia deploys analogous systems. Neither side has achieved anything close to full denial.",
    answerUk:
      "Україна застосовує багаторівневу систему протидії дронам: РЕБ (глушіння GPS і частот управління), кінетичні системи (Gepard, ЗРК, перехоплювачі), мережі раннього попередження.",
    defaultOpen: false,
  },
  {
    question: "What are maritime drones (USVs) and how are they used?",
    questionUk: "Що таке морські дрони (БЕК) і як вони застосовуються?",
    answer:
      "Unmanned surface vehicles (USVs) are remotely piloted or autonomous boat platforms. Ukraine's Sea Baby and Magura V5 USVs have conducted strikes on Russian naval vessels, port infrastructure, and the Kerch Strait bridge. Their use has substantially degraded the Russian Black Sea Fleet's ability to operate in northwestern Black Sea waters.",
    answerUk:
      "Безпілотні надводні апарати (БЕК) — дистанційно керовані або автономні платформи типу катер. Українські БЕК «Морський малюк» та Magura V5 завдали ударів по кораблях ЧФ, портовій інфраструктурі та Керченському мосту.",
    defaultOpen: false,
  },
  {
    question: "Can civilians be harmed by drone attacks even far from the frontline?",
    questionUk: "Чи можуть цивільні постраждати від ударів дронів далеко від лінії фронту?",
    answer:
      "Yes. Shahed and Geran-2 loitering munitions have struck cities across Ukraine including Kyiv, Odesa, Kharkiv, and Zaporizhzhia. Warhead fragments cause casualties in a radius significantly larger than the direct impact zone. Drone alerts should always be taken seriously regardless of distance from the frontline.",
    answerUk:
      "Так. Барражуючі боєприпаси «Шахед» та «Герань-2» вражали міста по всій Україні, включаючи Київ, Одесу, Харків та Запоріжжя. Осколки бойової частини завдають втрат у значно більшому радіусі.",
    defaultOpen: false,
  },
  {
    question: "Where can I access the Aegis Lens drone incident feed?",
    questionUk: "Де я можу отримати доступ до стрічки інцидентів з дронами Aegis Lens?",
    answer:
      "The drone incident feed is accessible at /topics/drones and via the filtered map at /map?class=drone. An RSS/Atom feed is available at /topics/drones/feed.xml. API access to structured drone event data is available at /api/events?topic=drones.",
    answerUk:
      "Стрічка інцидентів з дронами доступна на /topics/drones та через відфільтровану карту /map?class=drone. RSS/Atom-стрічка доступна на /topics/drones/feed.xml.",
    defaultOpen: false,
  },
  {
    question: "What is a drone swarm and has it been used in Ukraine?",
    questionUk: "Що таке рій дронів і чи застосовувався він в Україні?",
    answer:
      "A drone swarm is a coordinated formation of multiple drones operating with some degree of autonomy or tight coordination to overwhelm defences. Russia has used massed Shahed launches (40–100+ in a night) that function tactically as swarms, saturating air-defence. True autonomous swarm coordination (AI-networked drones) has been demonstrated experimentally but not yet confirmed at operational scale in Ukraine.",
    answerUk:
      "Рій дронів — скоординоване угруповання кількох дронів, що діє з певним ступенем автономності для подавлення засобів оборони. Росія використовувала масові запуски «Шахед» (40–100+ за ніч), що тактично функціонують як рої.",
    defaultOpen: false,
  },
];

// ---------------------------------------------------------------------------
// FAQPage JSON-LD schema helper
// ---------------------------------------------------------------------------

export function dronesFaqJsonLd(): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: DRONES_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
