import type { Locale } from "@aegis/i18n-config";

type Localized = Partial<Record<Locale, string>> & { en: string };

export type EquipmentSpec = { label: string; value: string; source?: string };
export type EquipmentOperator = { name: string; iso2: string; note?: string };
export type EquipmentVariant = { name: string; note: string };
export type EquipmentFaq = { q: string; a: string };

export type EquipmentSeed = {
  slug: string;
  name: Localized;
  type: string;
  origin: string;
  description: Localized;
  specs?: EquipmentSpec[];
  identificationCues?: string[];
  operators?: EquipmentOperator[];
  variants?: EquipmentVariant[];
  relatedSlugs?: string[];
  faq?: EquipmentFaq[];
};

export type ConflictParty = {
  name: Localized;
  role: "aggressor" | "defender" | "mediator" | "observer";
  description: Localized;
};

export type ConflictTimelineEvent = {
  date: string;
  title: Localized;
  description: Localized;
  class?: "kinetic" | "diplomatic" | "humanitarian" | "information" | "political";
};

export type ConflictStat = {
  label: Localized;
  value: string;
  source?: string;
};

export type ConflictCitation = {
  label: string;
  url: string;
  type: "report" | "academic" | "news" | "official";
};

export type ConflictSeed = {
  slug: string;
  name: Localized;
  status: "active" | "frozen" | "resolved";
  statusDate?: string;
  description: Localized;
  regions: string[]; // iso2
  parties?: ConflictParty[];
  timelineEvents?: ConflictTimelineEvent[];
  keyStats?: ConflictStat[];
  reportSlugs?: string[];
  methodology?: Localized;
  citations?: ConflictCitation[];
  disputedAreaNotice?: Localized;
};

export type GlossarySeed = {
  slug: string;
  term: Localized;
  /** Latin-script transliteration of the Ukrainian term (for non-Cyrillic readers). */
  transliteration?: string;
  definition: Localized;
  examples?: string[];
  relatedSlugs?: string[];
  sources?: { label: string; url: string }[];
};

export const EQUIPMENT: EquipmentSeed[] = [
  {
    slug: "shahed-136",
    name: { en: "Shahed-136", uk: "Шахед-136" },
    type: "Loitering munition / one-way attack UAV",
    origin: "Iran (used by Russia)",
    description: {
      en: "Iranian-designed delta-wing one-way attack UAV. Used in mass against Ukrainian infrastructure since late 2022.",
      uk: "Іранський одноразовий ударний БПЛА з трикутним крилом. Масово застосовується проти української інфраструктури з кінця 2022 року.",
    },
    specs: [
      { label: "Wingspan", value: "2.5 m", source: "IISS" },
      { label: "Length", value: "3.5 m", source: "IISS" },
      { label: "Weight", value: "~200 kg (with warhead)", source: "US DoD" },
      { label: "Warhead", value: "~40–50 kg HE fragmentation", source: "OSC" },
      { label: "Range", value: "~2,000–2,500 km", source: "CSIS" },
      { label: "Speed", value: "~185 km/h (cruise)", source: "Bellingcat" },
      { label: "Propulsion", value: "MD550 piston engine (rear-mounted pusher)", source: "OSINT" },
      { label: "Guidance", value: "GPS + inertial navigation (pre-programmed)", source: "IISS" },
    ],
    identificationCues: [
      "Distinctive delta-wing planform — easily visible from below.",
      "Loud, distinctive lawnmower-like engine sound from MD550 piston engine.",
      "Orange-red nose section visible in recovered debris.",
      "Thermal signature visible to night-vision cameras.",
      "Typically flies at 100–200 m altitude during terminal approach.",
    ],
    operators: [
      { name: "Russian Armed Forces", iso2: "ru", note: "Primary operator; designated Geran-2 in Russian service." },
      { name: "Islamic Revolutionary Guard Corps", iso2: "ir", note: "Iranian developer and original operator." },
    ],
    variants: [
      { name: "Shahed-131", note: "Smaller variant with ~900 kg warhead, shorter range (~900 km)." },
      { name: "Shahed-136B", note: "Reported upgraded seeker for terminal guidance; not independently confirmed as of 2026." },
      { name: "Geran-2", note: "Russian designation for Shahed-136 operated by Russian forces." },
    ],
    relatedSlugs: ["lancet-3", "zala-kub"],
    faq: [
      { q: "How is Shahed-136 intercepted?", a: "Air defense systems including MANPADS, autocannon (ZSU-23-4, Gepard), electronic jamming, and fighter intercepts have all been used. GPS jamming can cause navigation errors." },
      { q: "Is Shahed-136 the same as Geran-2?", a: "Yes. Russia designates its Shahed-136 variants as Geran-2 (Geranium-2) for domestic and information operations purposes. The airframes are functionally identical." },
      { q: "How accurate is Shahed-136?", a: "GPS-guided with reported CEP of 5–15 m in uncontested airspace. Accuracy degrades significantly under GPS jamming." },
    ],
  },
  {
    slug: "bayraktar-tb2",
    name: { en: "Bayraktar TB2", uk: "Bayraktar TB2" },
    type: "Medium-altitude long-endurance UAV",
    origin: "Turkey (Baykar)",
    description: {
      en: "Turkish MALE UAV. Used by Ukrainian forces, especially in early phase of full-scale war.",
      uk: "Турецький UAV середніх висот. Використовується ЗСУ, особливо на ранній фазі повномасштабної війни.",
    },
    specs: [
      { label: "Wingspan", value: "12 m", source: "Baykar" },
      { label: "MTOW", value: "650 kg", source: "Baykar" },
      { label: "Payload", value: "150 kg", source: "Baykar" },
      { label: "Ceiling", value: "25,000 ft (7,620 m)", source: "Baykar" },
      { label: "Endurance", value: "24+ hours", source: "Baykar" },
      { label: "Range", value: "150 km (control link)", source: "Baykar" },
      { label: "Propulsion", value: "Rotax 912iS (100 hp)", source: "Baykar" },
      { label: "Armament", value: "4 × MAM-L or MAM-C laser-guided munitions", source: "Baykar" },
    ],
    identificationCues: [
      "V-tail configuration — distinctive from most other UAVs.",
      "Pusher propeller at rear of fuselage.",
      "WESCAM MX-15D electro-optical/infrared sensor ball under nose.",
      "Low acoustic signature at altitude; difficult to hear before visual acquisition.",
      "Distinctive triple-boom tail with inverted-V configuration.",
    ],
    operators: [
      { name: "Ukrainian Armed Forces", iso2: "ua", note: "Received pre-war; used extensively in early 2022." },
      { name: "Turkish Armed Forces", iso2: "tr", note: "Primary operator and developer." },
      { name: "Polish Armed Forces", iso2: "pl" },
      { name: "Azerbaijani Armed Forces", iso2: "az", note: "Extensively used in 2020 Nagorno-Karabakh war." },
    ],
    variants: [
      { name: "Bayraktar TB2S", note: "Upgraded satellite communication variant for beyond-line-of-sight operations." },
      { name: "Bayraktar TB3", note: "Naval/carrier-capable successor with folding wings." },
    ],
    relatedSlugs: ["rq-7-shadow", "mq-9-reaper"],
    faq: [
      { q: "Is Bayraktar TB2 still used in Ukraine?", a: "TB2 played a major role in the opening weeks of the 2022 invasion but is now used more selectively due to advanced Russian air defense. Survivability is lower in high-threat environments." },
      { q: "What munitions does TB2 carry?", a: "Primarily MAM-L (22 kg laser-guided) and MAM-C (6.5 kg micro munitions). Up to 4 can be carried simultaneously on underwing pylons." },
    ],
  },
  {
    slug: "iskander-m",
    name: { en: "Iskander-M", uk: "Іскандер-М" },
    type: "Short-range ballistic missile",
    origin: "Russia",
    description: {
      en: "Russian short-range ballistic missile system. Used in strikes against Ukrainian cities and military targets.",
      uk: "Російський оперативно-тактичний ракетний комплекс. Застосовується для ударів по українських містах і військових об'єктах.",
    },
    specs: [
      { label: "Length", value: "7.2 m (missile)", source: "IISS" },
      { label: "Diameter", value: "0.92 m", source: "IISS" },
      { label: "Launch weight", value: "~3,800 kg", source: "IISS" },
      { label: "Warhead", value: "480–700 kg", source: "IISS" },
      { label: "Range", value: "500 km (treaty-limited 9M723)", source: "Arms Control Association" },
      { label: "CEP", value: "5–7 m (with GLONASS + optical terminal)", source: "Estimated" },
      { label: "Guidance", value: "Inertial + GLONASS + optical terminal seeker", source: "Missile Defense Advocacy" },
      { label: "Speed", value: "Mach 6–7 (terminal phase)", source: "IISS" },
    ],
    identificationCues: [
      "Transporter-Erector-Launcher (TEL) vehicle is a distinctive 8-wheeled chassis.",
      "Quasi-ballistic trajectory with maneuvering terminal phase — makes radar tracking difficult.",
      "Impact crater significantly larger than cruise missile due to terminal velocity.",
      "Recognizable debris: cylindrical guidance section, fragmented warhead casing.",
    ],
    operators: [
      { name: "Russian Ground Forces", iso2: "ru", note: "Primary operator. Multiple brigades deployed to Ukraine front." },
      { name: "Armenian Armed Forces", iso2: "am" },
    ],
    variants: [
      { name: "Iskander-E", note: "Export variant with 280 km range to comply with MTCR limits." },
      { name: "Iskander-K", note: "Cruise missile variant (R-500) fired from same TEL." },
      { name: "9M729 (SSC-8)", note: "Reportedly INF Treaty-violating extended-range cruise missile using Iskander launcher." },
    ],
    relatedSlugs: ["switchblade-300", "switchblade-600"],
    faq: [
      { q: "Can Patriot intercept Iskander-M?", a: "Yes. Ukrainian Patriot batteries have successfully intercepted Iskander-M ballistic missiles. The quasi-ballistic trajectory and maneuvering warhead make interception challenging but not impossible." },
      { q: "What warhead types does Iskander-M carry?", a: "Confirmed types include HE-fragmentation, cluster (submunition), penetrator (bunker-buster), and EMP warheads. Nuclear delivery capability exists but is not confirmed as deployed." },
    ],
  },
  {
    slug: "lancet-3",
    name: { en: "Lancet-3", uk: "Ланцет-3" },
    type: "Loitering munition",
    origin: "Russia (ZALA Aero)",
    description: {
      en: "Russian loitering munition used against Ukrainian artillery, air defense, and armor since 2022.",
      uk: "Російський баражуючий боєприпас, що застосовується проти української артилерії, ППО та бронетехніки з 2022 року.",
    },
  },
  {
    slug: "switchblade-300",
    name: { en: "Switchblade 300", uk: "Switchblade 300" },
    type: "Loitering munition",
    origin: "USA (AeroVironment)",
    description: {
      en: "Small backpackable loitering munition supplied to Ukraine for anti-personnel and light-vehicle targets.",
      uk: "Малий переносний баражуючий боєприпас, поставлений Україні для ураження живої сили та легкої техніки.",
    },
  },
  {
    slug: "switchblade-600",
    name: { en: "Switchblade 600", uk: "Switchblade 600" },
    type: "Anti-armor loitering munition",
    origin: "USA (AeroVironment)",
    description: {
      en: "Larger anti-armor loitering munition with extended range, supplied to Ukraine to engage tanks and hardened targets.",
      uk: "Більший протитанковий баражуючий боєприпас зі збільшеною дальністю, поставлений Україні для ураження танків та укріплених цілей.",
    },
  },
  {
    slug: "zala-kub",
    name: { en: "ZALA KUB-BLA", uk: "ZALA KUB-BLA" },
    type: "Loitering munition",
    origin: "Russia (ZALA Aero)",
    description: {
      en: "Russian delta-wing loitering munition deployed alongside Lancet against Ukrainian targets.",
      uk: "Російський баражуючий боєприпас з трикутним крилом, що застосовується разом із Ланцетом проти українських цілей.",
    },
  },
  {
    slug: "rq-7-shadow",
    name: { en: "RQ-7 Shadow", uk: "RQ-7 Shadow" },
    type: "Tactical reconnaissance UAV",
    origin: "USA (AAI Corporation)",
    description: {
      en: "US tactical UAV used for brigade-level reconnaissance, surveillance, and target acquisition.",
      uk: "Американський тактичний БПЛА для розвідки, спостереження та цілевказання на рівні бригади.",
    },
  },
  {
    slug: "mq-9-reaper",
    name: { en: "MQ-9 Reaper", uk: "MQ-9 Reaper" },
    type: "Hunter-killer UAV",
    origin: "USA (General Atomics)",
    description: {
      en: "US medium-altitude long-endurance armed UAV used for strike and ISR missions.",
      uk: "Американський ударно-розвідувальний БПЛА середніх висот і великої тривалості польоту.",
    },
  },
  {
    slug: "aerovironment-puma",
    name: { en: "AeroVironment Puma", uk: "AeroVironment Puma" },
    type: "Small reconnaissance UAV",
    origin: "USA (AeroVironment)",
    description: {
      en: "Small hand-launched reconnaissance UAV supplied to Ukraine for short-range ISR.",
      uk: "Малий розвідувальний БПЛА із запуском з руки, поставлений Україні для розвідки на коротких дистанціях.",
    },
  },
  {
    slug: "patriot-pac-3",
    name: { en: "Patriot PAC-3", uk: "Patriot PAC-3" },
    type: "Long-range air defense system",
    origin: "USA (Raytheon/Lockheed Martin)",
    description: {
      en: "US long-range SAM system used by Ukraine to intercept ballistic missiles, including Kinzhal.",
      uk: "Американський ЗРК великої дальності, що використовується Україною для перехоплення балістичних ракет, зокрема «Кинджалів».",
    },
  },
  {
    slug: "nasams",
    name: { en: "NASAMS", uk: "NASAMS" },
    type: "Medium-range air defense system",
    origin: "USA/Norway (Raytheon/Kongsberg)",
    description: {
      en: "Networked medium-range SAM system supplied to Ukraine to defend cities and infrastructure.",
      uk: "Мережевий ЗРК середньої дальності, поставлений Україні для захисту міст та інфраструктури.",
    },
  },
  {
    slug: "iris-t-slm",
    name: { en: "IRIS-T SLM", uk: "IRIS-T SLM" },
    type: "Medium-range air defense system",
    origin: "Germany (Diehl Defence)",
    description: {
      en: "German medium-range SAM system delivered to Ukraine; effective against aircraft, cruise missiles, and drones.",
      uk: "Німецький ЗРК середньої дальності, поставлений Україні; ефективний проти літаків, крилатих ракет і дронів.",
    },
  },
  {
    slug: "s-300",
    name: { en: "S-300", uk: "С-300" },
    type: "Long-range air defense system",
    origin: "USSR/Russia",
    description: {
      en: "Soviet-era long-range SAM system operated by both Ukraine and Russia; Russia also uses it in ground-attack role.",
      uk: "Радянський ЗРК великої дальності, що стоїть на озброєнні і України, і Росії; Росія також використовує його для ударів по землі.",
    },
  },
  {
    slug: "tor-m2",
    name: { en: "Tor-M2", uk: "Тор-М2" },
    type: "Short-range air defense system",
    origin: "Russia",
    description: {
      en: "Russian short-range SAM system used to protect maneuver units and high-value assets from aircraft and PGMs.",
      uk: "Російський ЗРК малої дальності для прикриття військ і важливих об'єктів від літаків і високоточних боєприпасів.",
    },
  },
  {
    slug: "pantsir-s1",
    name: { en: "Pantsir-S1", uk: "Панцир-С1" },
    type: "Short-range SAM/gun air defense system",
    origin: "Russia",
    description: {
      en: "Russian combined gun-missile point-defense system; repeatedly targeted by Ukrainian strikes and HIMARS.",
      uk: "Російський комбінований гарматно-ракетний ЗРК ближньої дії; неодноразово уражений ударами України та HIMARS.",
    },
  },
  {
    slug: "stinger-manpads",
    name: { en: "FIM-92 Stinger", uk: "FIM-92 Stinger" },
    type: "Man-portable air defense system",
    origin: "USA (Raytheon)",
    description: {
      en: "US shoulder-launched IR-guided MANPADS supplied to Ukraine to engage low-flying aircraft, helicopters, and UAVs.",
      uk: "Американський ПЗРК з ІЧ-наведенням, поставлений Україні для ураження низьколітаючих літаків, гелікоптерів і БПЛА.",
    },
  },
  {
    slug: "himars-m142",
    name: { en: "HIMARS M142", uk: "HIMARS M142" },
    type: "Multiple launch rocket system",
    origin: "USA (Lockheed Martin)",
    description: {
      en: "Wheeled GPS-guided MLRS supplied to Ukraine; widely credited with disrupting Russian logistics and command nodes.",
      uk: "Колісний РСЗВ з GPS-наведенням, поставлений Україні; значною мірою дезорганізував російську логістику та командні пункти.",
    },
  },
  {
    slug: "m270-mlrs",
    name: { en: "M270 MLRS", uk: "M270 MLRS" },
    type: "Tracked multiple launch rocket system",
    origin: "USA/UK/Germany",
    description: {
      en: "Tracked MLRS firing the same GMLRS rockets as HIMARS; supplied to Ukraine by several NATO partners.",
      uk: "Гусеничний РСЗВ, що використовує ті ж ракети GMLRS, що й HIMARS; поставлений Україні низкою партнерів НАТО.",
    },
  },
  {
    slug: "m777-howitzer",
    name: { en: "M777", uk: "M777" },
    type: "155mm towed howitzer",
    origin: "USA/UK (BAE Systems)",
    description: {
      en: "Lightweight 155mm towed howitzer supplied in large numbers to Ukraine; firing standard and Excalibur PGM rounds.",
      uk: "Легка 155-мм буксирована гаубиця, поставлена Україні у великій кількості; стріляє стандартними та керованими снарядами Excalibur.",
    },
  },
  {
    slug: "krab-155",
    name: { en: "Krab 155mm", uk: "Krab 155 мм" },
    type: "155mm self-propelled howitzer",
    origin: "Poland (Huta Stalowa Wola)",
    description: {
      en: "Polish 155mm tracked self-propelled howitzer; delivered to Ukraine and produced for Ukrainian armed forces.",
      uk: "Польська 155-мм гусенична самохідна гаубиця; поставлена Україні та виробляється для ЗСУ.",
    },
  },
  {
    slug: "caesar-sph",
    name: { en: "CAESAR", uk: "CAESAR" },
    type: "155mm wheeled self-propelled howitzer",
    origin: "France (Nexter)",
    description: {
      en: "French 155mm truck-mounted self-propelled howitzer delivered to Ukraine for shoot-and-scoot operations.",
      uk: "Французька 155-мм самохідна гаубиця на колісному шасі, поставлена Україні для тактики «вистрілив-і-поїхав».",
    },
  },
  {
    slug: "pion-203",
    name: { en: "2S7 Pion", uk: "2С7 Піон" },
    type: "203mm self-propelled gun",
    origin: "USSR",
    description: {
      en: "Soviet 203mm heavy self-propelled gun used by both Ukrainian and Russian forces for long-range fires.",
      uk: "Радянська 203-мм важка самохідна гармата; використовується і ЗСУ, і збройними силами РФ для дальньої вогневої підтримки.",
    },
  },
  {
    slug: "bm-30-smerch",
    name: { en: "BM-30 Smerch", uk: "БМ-30 Смерч" },
    type: "300mm multiple launch rocket system",
    origin: "USSR/Russia",
    description: {
      en: "Soviet/Russian 300mm heavy MLRS with cluster and unitary warheads; used by both sides on the front.",
      uk: "Радянсько-російський 300-мм важкий РСЗВ із касетною та моноблочною бойовою частиною; використовується обома сторонами.",
    },
  },
  {
    slug: "leopard-2a6",
    name: { en: "Leopard 2A6", uk: "Leopard 2A6" },
    type: "Main battle tank",
    origin: "Germany (Krauss-Maffei Wegmann)",
    description: {
      en: "German third-generation main battle tank delivered to Ukraine by Germany and several European partners.",
      uk: "Німецький основний бойовий танк третього покоління, поставлений Україні Німеччиною та низкою європейських партнерів.",
    },
  },
  {
    slug: "challenger-2",
    name: { en: "Challenger 2", uk: "Challenger 2" },
    type: "Main battle tank",
    origin: "United Kingdom (BAE Systems)",
    description: {
      en: "British main battle tank; the UK provided a squadron to Ukraine in 2023.",
      uk: "Британський основний бойовий танк; Велика Британія передала Україні ескадрон у 2023 році.",
    },
  },
  {
    slug: "abrams-m1a2",
    name: { en: "M1A2 Abrams", uk: "M1A2 Abrams" },
    type: "Main battle tank",
    origin: "USA (General Dynamics)",
    description: {
      en: "US third-generation main battle tank; M1A1 variants delivered to Ukraine in 2023.",
      uk: "Американський основний бойовий танк третього покоління; варіанти M1A1 поставлені Україні у 2023 році.",
    },
  },
  {
    slug: "t-72b3",
    name: { en: "T-72B3", uk: "Т-72Б3" },
    type: "Main battle tank",
    origin: "Russia",
    description: {
      en: "Russian modernization of the Soviet T-72; the most common MBT in Russian service in Ukraine.",
      uk: "Російська модернізація радянського Т-72; найпоширеніший ОБТ російських військ в Україні.",
    },
  },
  {
    slug: "t-90m",
    name: { en: "T-90M Proryv", uk: "Т-90М «Прорив»" },
    type: "Main battle tank",
    origin: "Russia",
    description: {
      en: "Russia's most modern serially produced MBT; several lost to Ukrainian ATGMs, drones, and artillery.",
      uk: "Найсучасніший серійний ОБТ РФ; кілька машин втрачено від українських ПТРК, дронів та артилерії.",
    },
  },
  {
    slug: "bradley-m2a2",
    name: { en: "M2A2 Bradley", uk: "M2A2 Bradley" },
    type: "Infantry fighting vehicle",
    origin: "USA (BAE Systems)",
    description: {
      en: "US tracked IFV supplied to Ukraine; widely praised for crew survivability in combat.",
      uk: "Американська гусенична БМП, поставлена Україні; відзначена високим рівнем захисту екіпажу в бою.",
    },
  },
  {
    slug: "cv90",
    name: { en: "CV90", uk: "CV90" },
    type: "Infantry fighting vehicle",
    origin: "Sweden (BAE Systems Hägglunds)",
    description: {
      en: "Swedish tracked IFV delivered to Ukraine by Sweden and Norway; produced in multiple variants.",
      uk: "Шведська гусенична БМП, поставлена Україні Швецією та Норвегією; випускається в кількох варіантах.",
    },
  },
  {
    slug: "bradley-ods-sa",
    name: { en: "M2A2 ODS-SA Bradley", uk: "M2A2 ODS-SA Bradley" },
    type: "Infantry fighting vehicle",
    origin: "USA (BAE Systems)",
    description: {
      en: "Upgraded Bradley variant with improved situational awareness; supplied to Ukraine from US stocks.",
      uk: "Модернізована Bradley з покращеною ситуаційною обізнаністю; поставлена Україні зі складів США.",
    },
  },
  {
    slug: "moskva-cruiser",
    name: { en: "Moskva (cruiser)", uk: "Москва (крейсер)" },
    type: "Guided-missile cruiser (sunk)",
    origin: "USSR/Russia",
    description: {
      en: "Flagship of the Russian Black Sea Fleet; sunk on 14 April 2022 after Ukrainian Neptune anti-ship missile strike.",
      uk: "Флагман Чорноморського флоту РФ; затонув 14 квітня 2022 року після удару українських протикорабельних ракет «Нептун».",
    },
  },
  {
    slug: "admiral-makarov",
    name: { en: "Admiral Makarov", uk: "Адмірал Макаров" },
    type: "Frigate",
    origin: "Russia",
    description: {
      en: "Russian Admiral Grigorovich-class frigate of the Black Sea Fleet, repeatedly targeted by Ukrainian USVs and missiles.",
      uk: "Російський фрегат проекту «Адмірал Григорович» Чорноморського флоту; неодноразово атакований українськими морськими дронами та ракетами.",
    },
  },
  {
    slug: "magura-v5",
    name: { en: "Magura V5", uk: "Magura V5" },
    type: "Unmanned surface vessel (USV)",
    origin: "Ukraine",
    description: {
      en: "Ukrainian explosive-laden naval drone used to strike Russian Black Sea Fleet ships and bridge infrastructure.",
      uk: "Український морський дрон-камікадзе, що застосовується проти кораблів ЧФ РФ та мостової інфраструктури.",
    },
  },
  {
    slug: "storm-shadow-scalp",
    name: { en: "Storm Shadow / SCALP-EG", uk: "Storm Shadow / SCALP-EG" },
    type: "Air-launched cruise missile",
    origin: "United Kingdom/France (MBDA)",
    description: {
      en: "Anglo-French long-range air-launched cruise missile supplied to Ukraine for deep strikes against high-value targets.",
      uk: "Англо-французька крилата ракета великої дальності повітряного базування, поставлена Україні для дальніх ударів по важливих цілях.",
    },
  },
  {
    slug: "kinzhal-kh47m2",
    name: { en: "Kh-47M2 Kinzhal", uk: "Х-47М2 «Кинджал»" },
    type: "Air-launched aeroballistic missile",
    origin: "Russia",
    description: {
      en: "Russian air-launched hypersonic aeroballistic missile launched from MiG-31K; intercepted by Patriot over Kyiv in 2023.",
      uk: "Російська гіперзвукова аеробалістична ракета повітряного базування з МіГ-31К; перехоплена «Петріотом» над Києвом у 2023 році.",
    },
  },
  {
    slug: "atacms",
    name: { en: "ATACMS", uk: "ATACMS" },
    type: "Tactical ballistic missile",
    origin: "USA (Lockheed Martin)",
    description: {
      en: "US Army Tactical Missile System; long-range ballistic missile fired from HIMARS/M270, delivered to Ukraine in 2023–2024.",
      uk: "Американська тактична балістична ракета великої дальності для HIMARS/M270; поставлена Україні у 2023–2024 роках.",
    },
  },
];

export const CONFLICTS: ConflictSeed[] = [
  {
    slug: "russia-ukraine",
    name: { en: "Russia–Ukraine War", uk: "Російсько-українська війна" },
    status: "active",
    statusDate: "2022-02-24",
    description: {
      en: "Russian full-scale invasion of Ukraine since 24 February 2022; broader conflict since Russia's 2014 annexation of Crimea and instigation of armed conflict in Donbas.",
      uk: "Повномасштабне російське вторгнення в Україну з 24 лютого 2022; ширший конфлікт, що розпочався після анексії Криму у 2014 році та підтримки збройних формувань на Донбасі.",
    },
    regions: ["ua"],
    disputedAreaNotice: {
      en: "Crimea and parts of Donetsk, Luhansk, Zaporizhzhia, and Kherson oblasts are subject to territorial dispute. Aegis Lens follows UN General Assembly resolution ES-11/1 (2022) and represents internationally recognized borders. Occupation lines shown are operational, not political endorsements.",
      uk: "Крим та частини Донецької, Луганської, Запорізької та Херсонської областей є предметом територіального спору. Aegis Lens дотримується резолюції ГА ООН ES-11/1 (2022) і відображає міжнародно визнані кордони.",
    },
    parties: [
      {
        name: { en: "Russian Federation", uk: "Російська Федерація" },
        role: "aggressor",
        description: {
          en: "Launched full-scale invasion on 24 February 2022 following the 2014 annexation of Crimea and proxy conflict in Donbas. Operating combined-arms ground forces, air assets, and strategic missile strikes.",
          uk: "Розпочала повномасштабне вторгнення 24 лютого 2022 року після анексії Криму у 2014 році та проксі-конфлікту на Донбасі.",
        },
      },
      {
        name: { en: "Ukraine", uk: "Україна" },
        role: "defender",
        description: {
          en: "Defending its internationally recognized territory against the Russian invasion. Armed Forces of Ukraine are supported by military aid from over 50 partner countries.",
          uk: "Захищає свою міжнародно визнану територію від російського вторгнення. Збройні Сили України отримують підтримку від понад 50 країн-партнерів.",
        },
      },
      {
        name: { en: "United Nations", uk: "Організація Об'єднаних Націй" },
        role: "mediator",
        description: {
          en: "Facilitating humanitarian access, ceasefire negotiations (grain initiative), and monitoring civilian harm. Multiple UN agencies active in Ukraine.",
          uk: "Забезпечує гуманітарний доступ, переговори (зернова ініціатива) та моніторинг шкоди цивільному населенню.",
        },
      },
      {
        name: { en: "NATO / Allied nations", uk: "НАТО / союзні нації" },
        role: "observer",
        description: {
          en: "Providing military, financial, and humanitarian assistance to Ukraine. Not direct combat participants. Combined aid exceeds $200 billion since February 2022.",
          uk: "Надають військову, фінансову та гуманітарну допомогу Україні. Не є прямими учасниками бойових дій.",
        },
      },
    ],
    timelineEvents: [
      {
        date: "2014-02-27",
        title: { en: "Annexation of Crimea begins", uk: "Початок анексії Криму" },
        description: {
          en: "Russian forces seize strategic sites in Crimea. A contested referendum is held; Russia formally annexes Crimea on 18 March 2014.",
          uk: "Російські сили захоплюють стратегічні об'єкти в Криму. Проводиться оскаржуваний референдум; Росія офіційно анексує Крим 18 березня 2014 року.",
        },
        class: "political",
      },
      {
        date: "2014-04-06",
        title: { en: "Armed conflict in Donbas", uk: "Збройний конфлікт на Донбасі" },
        description: {
          en: "Russian-backed armed groups seize government buildings in Donetsk and Luhansk, beginning a low-intensity conflict that kills over 14,000 people by 2022.",
          uk: "Підтримувані Росією збройні групи захоплюють урядові будівлі в Донецьку та Луганську, розпочинаючи конфлікт низької інтенсивності.",
        },
        class: "kinetic",
      },
      {
        date: "2022-02-24",
        title: { en: "Full-scale invasion begins", uk: "Початок повномасштабного вторгнення" },
        description: {
          en: "Russia launches a multi-axis invasion from north (Kyiv), east (Kharkiv, Donbas), and south (Zaporizhzhia, Kherson). Kyiv attack repelled within days.",
          uk: "Росія розпочинає багатовекторне вторгнення з півночі (Київ), сходу (Харків, Донбас) та півдня (Запоріжжя, Херсон).",
        },
        class: "kinetic",
      },
      {
        date: "2022-03-29",
        title: { en: "Russia withdraws from Kyiv region", uk: "Відступ Росії з Київської області" },
        description: {
          en: "Russian forces withdraw from Kyiv, Chernihiv, and Sumy regions following failed advance. Evidence of war crimes discovered in Bucha and surrounding areas.",
          uk: "Російські сили відступають з Київської, Чернігівської та Сумської областей. У Бучі виявлено свідчення воєнних злочинів.",
        },
        class: "kinetic",
      },
      {
        date: "2022-09-06",
        title: { en: "Kharkiv counteroffensive", uk: "Харківський контрнаступ" },
        description: {
          en: "Ukraine's Armed Forces retake over 8,000 km² in Kharkiv oblast in under two weeks, the fastest advance of the war. Russia retreats across the Oskil river.",
          uk: "ЗСУ відвойовують понад 8 000 км² Харківської області менш ніж за два тижні — найшвидший прорив за всю війну.",
        },
        class: "kinetic",
      },
      {
        date: "2022-11-11",
        title: { en: "Kherson liberated", uk: "Звільнення Херсона" },
        description: {
          en: "Ukrainian forces enter Kherson city after Russia withdraws to the east bank of the Dnipro. Largest city liberated from occupation in the war.",
          uk: "Українські сили входять у Херсон після відступу Росії на лівий берег Дніпра. Найбільше місто, звільнене від окупації за час війни.",
        },
        class: "kinetic",
      },
      {
        date: "2023-06-04",
        title: { en: "Ukrainian summer counteroffensive", uk: "Літній контрнаступ України" },
        description: {
          en: "Ukraine launches a major counteroffensive along multiple axes in Zaporizhzhia and Donetsk. Progresses slowly against entrenched Russian defences and dense minefields.",
          uk: "Україна розпочинає масштабний контрнаступ по кількох напрямках у Запорізькій та Донецькій областях.",
        },
        class: "kinetic",
      },
      {
        date: "2024-08-06",
        title: { en: "Kursk incursion", uk: "Курський рейд" },
        description: {
          en: "Ukrainian forces cross into Russia's Kursk oblast — the first foreign military incursion into Russian territory since World War II — seizing hundreds of square kilometres.",
          uk: "Українські сили входять до Курської області Росії — перше іноземне вторгнення на територію Росії з часів Другої світової війни.",
        },
        class: "kinetic",
      },
    ],
    keyStats: [
      {
        label: { en: "Internally displaced", uk: "Внутрішньо переміщені" },
        value: "3.7 million",
        source: "UNHCR, 2025",
      },
      {
        label: { en: "Refugees abroad", uk: "Біженці за кордоном" },
        value: "6.5 million",
        source: "UNHCR, 2025",
      },
      {
        label: { en: "Verified civilian casualties", uk: "Підтверджені жертви серед цивільних" },
        value: "12,000+",
        source: "UN OHCHR, 2025",
      },
      {
        label: { en: "Territory under occupation", uk: "Територія під окупацією" },
        value: "~18% of Ukraine",
        source: "DeepStateMAP, 2025",
      },
      {
        label: { en: "Aid committed by allies", uk: "Допомога союзників" },
        value: "$250B+",
        source: "Kiel Institute, 2025",
      },
      {
        label: { en: "Conflict active since", uk: "Конфлікт активний з" },
        value: "February 2014",
        source: "UN GA resolution ES-11/1",
      },
    ],
    reportSlugs: [
      "weekly-ua-2026-w21",
      "incident-dnipro-strike-2026-05-22",
      "trend-drone-activity-q2-2026",
    ],
    methodology: {
      en: "Events are sourced from verified open-source reporting: Telegram channels, wire services (Reuters, AP, Ukrinform), official Ukrainian government briefings, satellite imagery (Sentinel-1/2, Planet), and fire data (NASA FIRMS). Each event receives a confidence score (0–1) and a danger score (0–100) computed from source count, source tier, corroboration, and imagery confirmation. Unverified events are hidden from the default view. Front-line positions follow DeepStateMAP's daily updates.",
      uk: "Події збираються з перевірених відкритих джерел: Telegram-каналів, агентств (Reuters, AP, Укрінформ), офіційних брифінгів уряду України, супутникових знімків та даних NASA FIRMS. Кожна подія отримує оцінку достовірності та небезпеки за власною методологією Aegis Lens.",
    },
    citations: [
      {
        label: "UN OHCHR — Ukraine civilian casualty reports",
        url: "https://www.ohchr.org/en/countries/ukraine",
        type: "official",
      },
      {
        label: "UNHCR — Ukraine Situation operational data",
        url: "https://data.unhcr.org/en/situations/ukraine",
        type: "official",
      },
      {
        label: "Kiel Institute — Ukraine Support Tracker",
        url: "https://www.ifw-kiel.de/topics/war-against-ukraine/ukraine-support-tracker/",
        type: "academic",
      },
      {
        label: "ISW — Institute for the Study of War: Ukraine conflict updates",
        url: "https://www.understandingwar.org/backgrounder/ukraine-conflict-updates",
        type: "report",
      },
      {
        label: "Bellingcat — Russia / Ukraine open-source investigations",
        url: "https://www.bellingcat.com/category/resources/case-studies/",
        type: "news",
      },
      {
        label: "ACLED — Armed Conflict Location & Event Data: Ukraine",
        url: "https://acleddata.com/ukraine-conflict-monitor/",
        type: "academic",
      },
    ],
  },
];

export const GLOSSARY: GlossarySeed[] = [
  {
    slug: "osint",
    term: { en: "OSINT", uk: "OSINT" },
    transliteration: "OSINT",
    definition: {
      en: "Open-Source Intelligence. The collection and analysis of information from publicly available sources.",
      uk: "Розвідка з відкритих джерел. Збір і аналіз інформації з публічно доступних джерел.",
    },
    examples: [
      "Geolocating a strike photo using Google Maps satellite imagery and landmark cross-referencing.",
      "Tracking a military convoy via publicly posted dashcam footage combined with road-sign analysis.",
      "Verifying a claimed explosion by cross-referencing Telegram posts, NASA FIRMS fire data, and Sentinel-1 SAR imagery.",
    ],
    relatedSlugs: ["geolocation", "socmint", "chronolocation", "reverse-image-search"],
    sources: [
      { label: "Bellingcat — OSINT guides", url: "https://www.bellingcat.com/resources/how-tos/" },
      { label: "GIJN — Verification Handbook", url: "https://verificationhandbook.com/" },
    ],
  },
  {
    slug: "geolocation",
    term: { en: "Geolocation", uk: "Геолокація" },
    transliteration: "Heolokatsiia",
    definition: {
      en: "Process of determining the real-world location depicted in a piece of media using visual cues, maps, and cross-references.",
      uk: "Процес визначення місця в реальному світі, зображеного на медіаматеріалі, за візуальними ознаками, картами та перехресними посиланнями.",
    },
    examples: [
      "Matching the skyline of a photo against OpenStreetMap 3D building data to pin the photographer's position.",
      "Using shadow angle and sun position tools to narrow down the recording location and time.",
      "Cross-referencing road markings visible in drone footage against satellite imagery to confirm a specific intersection.",
    ],
    relatedSlugs: ["osint", "chronolocation", "confidence-score"],
    sources: [
      { label: "Bellingcat — Geolocation guide", url: "https://www.bellingcat.com/resources/how-tos/2020/10/16/a-beginners-guide-to-geolocation/" },
      { label: "SunCalc — sun position tool", url: "https://suncalc.org/" },
    ],
  },
  {
    slug: "confidence-score",
    term: { en: "Confidence score", uk: "Оцінка достовірності" },
    transliteration: "Otsinka dostovirnosti",
    definition: {
      en: "A 0–1 calibrated metric expressing how strongly Aegis Lens trusts a given event, based on source count, reputation, and corroboration.",
      uk: "Калібрований показник 0–1, що виражає, наскільки Aegis Lens довіряє конкретній події, з урахуванням кількості джерел, репутації та корроборації.",
    },
    examples: [
      "A score of 0.95 indicates multiple high-tier sources with independent geolocation and timestamp verification.",
      "A score of 0.40 indicates a single low-tier source with no corroborating imagery or satellite confirmation.",
      "Scores below 0.30 are flagged as unverified and excluded from the public event map by default.",
    ],
    relatedSlugs: ["osint", "geolocation"],
    sources: [
      { label: "Aegis Lens — Methodology documentation", url: "/methodology" },
    ],
  },
  {
    slug: "chronolocation",
    term: { en: "Chronolocation", uk: "Хронолокація" },
    transliteration: "Khronolokatsiia",
    definition: {
      en: "Process of determining when a piece of media was captured using shadows, weather, timestamps, and other temporal clues.",
      uk: "Процес визначення часу зйомки медіаматеріалу за тінями, погодою, мітками часу та іншими часовими ознаками.",
    },
    examples: [
      "Calculating the time of day from shadow length and direction using a sun position calculator.",
      "Matching cloud cover patterns in a video to historical satellite imagery for a specific date.",
      "Cross-referencing metadata embedded in a JPEG with publicly known events to narrow the plausible date range.",
    ],
    relatedSlugs: ["geolocation", "osint"],
    sources: [
      { label: "SunCalc — sun position tool", url: "https://suncalc.org/" },
      { label: "Bellingcat — Chronolocation techniques", url: "https://www.bellingcat.com/resources/2022/01/chronolocation/" },
    ],
  },
  {
    slug: "reverse-image-search",
    term: { en: "Reverse image search", uk: "Зворотний пошук зображень" },
    transliteration: "Zvorotnyi poshuk zobrazhen",
    definition: {
      en: "Technique of querying an image against search engines to find earlier or related occurrences online.",
      uk: "Метод запиту зображення в пошукових системах для пошуку раніших або пов'язаних публікацій в інтернеті.",
    },
    examples: [
      "Uploading a photo of a destroyed vehicle to Google Images to find the original publication date.",
      "Using TinEye to check if a claimed battlefield image was actually from a different conflict or year.",
      "Running a screenshot through Yandex Images to find Russian-language sources that published it first.",
    ],
    relatedSlugs: ["osint", "geolocation"],
    sources: [
      { label: "Google Lens", url: "https://lens.google.com/" },
      { label: "TinEye", url: "https://tineye.com/" },
      { label: "Yandex Images", url: "https://yandex.com/images/" },
    ],
  },
  {
    slug: "socmint",
    term: { en: "SOCMINT", uk: "SOCMINT" },
    transliteration: "SOCMINT",
    definition: {
      en: "Social Media Intelligence. The collection and analysis of information posted on social media platforms.",
      uk: "Розвідка із соціальних медіа. Збір і аналіз інформації, опублікованої на платформах соціальних мереж.",
    },
    examples: [
      "Monitoring Telegram channels from conflict zones for real-time strike reports.",
      "Aggregating geotagged posts on X/Twitter to map civilian movement during evacuations.",
      "Tracking the spread of disinformation narratives across Facebook groups using network analysis.",
    ],
    relatedSlugs: ["osint", "geolocation", "reverse-image-search"],
    sources: [
      { label: "RAND — Social Media Intelligence", url: "https://www.rand.org/topics/social-media.html" },
    ],
  },
  {
    slug: "kinetic-action",
    term: { en: "Kinetic action", uk: "Кінетична дія" },
    transliteration: "Kinetychna diia",
    definition: {
      en: "Military operations involving physical force, such as strikes, bombings, or ground engagement, as opposed to cyber or information operations.",
      uk: "Військові операції із застосуванням фізичної сили — удари, бомбардування, наземні бої — на відміну від кібер- чи інформаційних операцій.",
    },
    examples: [
      "A ballistic missile strike on an energy facility is a kinetic action.",
      "Artillery bombardment of a defensive line is classified as a kinetic action.",
    ],
    relatedSlugs: ["electronic-warfare", "drone-swarm"],
    sources: [
      { label: "Joint Chiefs of Staff — DoD Dictionary", url: "https://www.jcs.mil/Doctrine/DOD-Dictionary/" },
    ],
  },
  {
    slug: "drone-swarm",
    term: { en: "Drone swarm", uk: "Рій дронів" },
    transliteration: "Rii droniv",
    definition: {
      en: "Coordinated deployment of multiple UAVs operating together to overwhelm defenses or accomplish a shared mission.",
      uk: "Скоординоване застосування багатьох БПЛА, що діють разом для перенасичення оборони або виконання спільного завдання.",
    },
    examples: [
      "Russia's mass Shahed-136 attacks on Ukrainian cities using 20–50 drones simultaneously to overwhelm air defenses.",
      "Ukrainian FPV drone coordinated strikes on Russian supply depots from multiple directions.",
    ],
    relatedSlugs: ["kinetic-action", "electronic-warfare"],
    sources: [
      { label: "CNAS — Drone swarm research", url: "https://www.cnas.org/programs/defense-program/drone-warfare" },
    ],
  },
  {
    slug: "electronic-warfare",
    term: { en: "Electronic warfare (EW)", uk: "Радіоелектронна боротьба (РЕБ)" },
    transliteration: "Radioelektronna borotba (REB)",
    definition: {
      en: "Military use of the electromagnetic spectrum to detect, deceive, jam, or disable enemy sensors and communications.",
      uk: "Військове використання електромагнітного спектру для виявлення, обману, придушення або виведення з ладу ворожих сенсорів і зв'язку.",
    },
    examples: [
      "GPS jamming that causes commercial aircraft navigation systems to fail near conflict zones.",
      "Drone signal jamming that forces FPV drones to fly autonomously or crash.",
      "SIGINT collection of enemy radio communications to determine unit positions.",
    ],
    relatedSlugs: ["drone-swarm", "kinetic-action"],
    sources: [
      { label: "IISS — EW in Ukraine", url: "https://www.iiss.org/online-analysis/military-balance-blog/2023/electronic-warfare-ukraine/" },
    ],
  },
  {
    slug: "counter-battery-fire",
    term: { en: "Counter-battery fire", uk: "Контрбатарейний вогонь" },
    transliteration: "Kontrbareiinyi vohon",
    definition: {
      en: "Artillery or rocket fire aimed at locating and destroying enemy artillery positions after they open fire.",
      uk: "Артилерійський або ракетний вогонь, спрямований на виявлення та знищення ворожих артилерійських позицій після відкриття ними вогню.",
    },
  },
  {
    slug: "deep-strike",
    term: { en: "Deep strike", uk: "Удар у глибину" },
    transliteration: "Udar u hlybunu",
    definition: {
      en: "Long-range attack against targets located far behind the front line, often using missiles or long-endurance UAVs.",
      uk: "Дальній удар по цілях, розташованих далеко за лінією фронту, часто з використанням ракет або БПЛА великої дальності.",
    },
  },
  {
    slug: "air-defense",
    term: { en: "Air defense", uk: "Протиповітряна оборона" },
    transliteration: "Protypovitriana oborona",
    definition: {
      en: "Systems and procedures designed to detect, track, intercept, and destroy hostile aircraft, missiles, and UAVs.",
      uk: "Системи та процедури для виявлення, супроводу, перехоплення та знищення ворожих літаків, ракет і БПЛА.",
    },
  },
  {
    slug: "manpads",
    term: { en: "MANPADS", uk: "ПЗРК" },
    transliteration: "PZRK (Perenosnyi zenitnyi raketnyi kompleks)",
    definition: {
      en: "Man-Portable Air-Defense System. Shoulder-launched surface-to-air missiles used against low-flying aircraft and helicopters.",
      uk: "Переносний зенітний ракетний комплекс. Ракети класу «земля–повітря» з плеча для ураження низьколітаючих літаків і вертольотів.",
    },
  },
  {
    slug: "sead",
    term: { en: "SEAD", uk: "Придушення ППО" },
    transliteration: "Prydushennia PPO",
    definition: {
      en: "Suppression of Enemy Air Defense. Operations to neutralize or destroy enemy surface-to-air defenses to enable friendly air operations.",
      uk: "Придушення протиповітряної оборони противника. Операції з нейтралізації або знищення ворожої ППО для забезпечення дій своєї авіації.",
    },
  },
  {
    slug: "substation",
    term: { en: "Substation", uk: "Підстанція" },
    transliteration: "Pidstantsiia",
    definition: {
      en: "Electrical facility that transforms voltage levels and switches power between transmission and distribution networks.",
      uk: "Електричний об'єкт, що трансформує рівні напруги та комутує потужність між магістральними та розподільчими мережами.",
    },
  },
  {
    slug: "switchyard",
    term: { en: "Switchyard", uk: "Розподільний пристрій" },
    transliteration: "Rozpodilnyi prystrii",
    definition: {
      en: "Outdoor section of a power station or substation containing switchgear, busbars, and transformers used to route electricity.",
      uk: "Відкрита частина електростанції або підстанції з комутаційною апаратурою, шинами та трансформаторами для розподілу електроенергії.",
    },
  },
  {
    slug: "scada",
    term: { en: "SCADA", uk: "SCADA" },
    transliteration: "SCADA (Dyspetcherske keruvannia ta zbir danykh)",
    definition: {
      en: "Supervisory Control and Data Acquisition. Industrial control systems used to monitor and control infrastructure such as power grids.",
      uk: "Диспетчерське керування та збір даних. Промислові системи управління для моніторингу та керування інфраструктурою, зокрема енергомережами.",
    },
  },
  {
    slug: "blackstart",
    term: { en: "Blackstart", uk: "Чорний пуск" },
    transliteration: "Chornyi pusk",
    definition: {
      en: "Procedure to restore a power grid from total shutdown without relying on external electricity supply.",
      uk: "Процедура відновлення електромережі після повного знеструмлення без зовнішнього живлення.",
    },
  },
  {
    slug: "ransomware",
    term: { en: "Ransomware", uk: "Програма-вимагач" },
    transliteration: "Prohrama-vymabach",
    definition: {
      en: "Malicious software that encrypts a victim's data and demands payment for the decryption key.",
      uk: "Шкідливе програмне забезпечення, що шифрує дані жертви та вимагає викуп за ключ розшифрування.",
    },
  },
  {
    slug: "zero-day",
    term: { en: "Zero-day", uk: "Уразливість нульового дня" },
    transliteration: "Urazlyvist nulovoho dnia",
    definition: {
      en: "Software vulnerability unknown to the vendor and unpatched, allowing exploitation before any defense is available.",
      uk: "Уразливість програмного забезпечення, невідома виробнику і незакрита, що дозволяє експлуатацію до появи захисту.",
    },
  },
  {
    slug: "c2",
    term: { en: "Command and control (C2)", uk: "Командування та управління (C2)" },
    transliteration: "Komanduvannia ta upravlinnia (C2)",
    definition: {
      en: "Exercise of authority by a commander over assigned forces; in cyber, the infrastructure attackers use to direct compromised systems.",
      uk: "Здійснення командиром керівництва підпорядкованими силами; у кібербезпеці — інфраструктура, через яку зловмисники керують скомпрометованими системами.",
    },
  },
  {
    slug: "corroboration",
    term: { en: "Corroboration", uk: "Корроборація" },
    transliteration: "Korroboratsiia",
    definition: {
      en: "Confirmation of a claim by independent sources or evidence, strengthening confidence in its accuracy.",
      uk: "Підтвердження твердження незалежними джерелами або доказами, що підвищує впевненість у його достовірності.",
    },
  },
  {
    slug: "primary-source",
    term: { en: "Primary source", uk: "Первинне джерело" },
    transliteration: "Pervynne dzherelo",
    definition: {
      en: "Original, first-hand account or evidence of an event, such as a direct witness, official document, or original footage.",
      uk: "Оригінальний свідок або доказ події з перших рук — безпосередній очевидець, офіційний документ або оригінальне відео.",
    },
  },
  {
    slug: "secondary-source",
    term: { en: "Secondary source", uk: "Вторинне джерело" },
    transliteration: "Vtorynne dzherelo",
    definition: {
      en: "Account that analyzes, interprets, or relays information drawn from primary sources rather than direct observation.",
      uk: "Матеріал, який аналізує, інтерпретує або переказує інформацію з первинних джерел, а не з безпосереднього спостереження.",
    },
  },
  {
    slug: "attribution",
    term: { en: "Attribution", uk: "Атрибуція" },
    transliteration: "Atrybutsiia",
    definition: {
      en: "Process of determining the actor responsible for an event, such as a strike, cyberattack, or disinformation campaign.",
      uk: "Процес встановлення суб'єкта, відповідального за подію — удар, кібератаку чи кампанію дезінформації.",
    },
  },
  {
    slug: "deepfake",
    term: { en: "Deepfake", uk: "Дипфейк" },
    transliteration: "Dypfeik",
    definition: {
      en: "Synthetic media generated using AI to convincingly impersonate a person's likeness, voice, or actions.",
      uk: "Синтетичне медіа, створене за допомогою ШІ для переконливої імітації зовнішності, голосу або дій людини.",
    },
  },
  {
    slug: "synthetic-media",
    term: { en: "Synthetic media", uk: "Синтетичне медіа" },
    transliteration: "Syntetychne media",
    definition: {
      en: "Any media (image, audio, video, text) generated or substantially altered by algorithms rather than captured from reality.",
      uk: "Будь-яке медіа (зображення, аудіо, відео, текст), створене або суттєво змінене алгоритмами, а не зняте з реальності.",
    },
  },
  {
    slug: "idp",
    term: { en: "Internally displaced person (IDP)", uk: "Внутрішньо переміщена особа (ВПО)" },
    transliteration: "Vnutrishno peremishchena osoba (VPO)",
    definition: {
      en: "Person forced to flee their home but who remains within the borders of their own country.",
      uk: "Особа, змушена покинути свій дім, але яка залишається в межах кордонів власної країни.",
    },
  },
  {
    slug: "refugee-corridor",
    term: { en: "Refugee corridor", uk: "Біженський коридор" },
    transliteration: "Bizhenskyi korydor",
    definition: {
      en: "Designated route allowing civilians to flee conflict zones safely toward host areas or international borders.",
      uk: "Визначений маршрут, який дозволяє цивільним безпечно покинути зони конфлікту в напрямку приймаючих регіонів або міжнародних кордонів.",
    },
  },
  {
    slug: "ceasefire",
    term: { en: "Ceasefire", uk: "Припинення вогню" },
    transliteration: "Prypynennia vohniu",
    definition: {
      en: "Formal or informal agreement between warring parties to temporarily or permanently halt hostilities.",
      uk: "Формальна або неформальна угода між воюючими сторонами про тимчасове або постійне припинення бойових дій.",
    },
  },
  {
    slug: "humanitarian-pause",
    term: { en: "Humanitarian pause", uk: "Гуманітарна пауза" },
    transliteration: "Humanitarna pauza",
    definition: {
      en: "Temporary cessation of hostilities in a limited area to allow delivery of aid or evacuation of civilians.",
      uk: "Тимчасове припинення бойових дій у обмеженому районі для доставки допомоги або евакуації цивільних.",
    },
  },
  {
    slug: "ais-spoofing",
    term: { en: "AIS spoofing", uk: "Підробка AIS" },
    transliteration: "Pidrobka AIS",
    definition: {
      en: "Falsification of Automatic Identification System signals by vessels to disguise their identity, position, or movements.",
      uk: "Фальсифікація сигналів автоматичної ідентифікаційної системи суднами для приховування їхньої ідентичності, позиції або переміщень.",
    },
  },
  {
    slug: "dark-fleet",
    term: { en: "Dark fleet", uk: "Темний флот" },
    transliteration: "Temnyi flot",
    definition: {
      en: "Vessels that operate with AIS disabled or spoofed to evade tracking, often used for sanctions evasion or illicit trade.",
      uk: "Судна, які працюють з вимкненою або підробленою AIS для уникнення відстеження, часто для обходу санкцій або незаконної торгівлі.",
    },
  },
  {
    slug: "shadow-fleet",
    term: { en: "Shadow fleet", uk: "Тіньовий флот" },
    transliteration: "Tinovyi flot",
    definition: {
      en: "Aging tankers operating outside mainstream maritime insurance and regulation, used to move sanctioned oil and cargo.",
      uk: "Застарілі танкери, що працюють поза межами стандартного морського страхування та регулювання, для перевезення підсанкційної нафти й вантажів.",
    },
  },
  {
    slug: "bbox",
    term: { en: "Bounding box (bbox)", uk: "Обмежувальна рамка (bbox)" },
    definition: {
      en: "Rectangular geographic area defined by minimum and maximum longitude and latitude, used to constrain spatial queries.",
      uk: "Прямокутна географічна область, задана мінімальною та максимальною довготою і широтою, що використовується для обмеження просторових запитів.",
    },
  },
  {
    slug: "geojson",
    term: { en: "GeoJSON", uk: "GeoJSON" },
    definition: {
      en: "Open standard format based on JSON for encoding geographic features such as points, lines, and polygons with attributes.",
      uk: "Відкритий стандартний формат на основі JSON для кодування географічних об'єктів — точок, ліній і полігонів з атрибутами.",
    },
  },
  {
    slug: "wgs84",
    term: { en: "WGS84", uk: "WGS84" },
    definition: {
      en: "World Geodetic System 1984. Standard global coordinate reference frame used by GPS and most web maps.",
      uk: "Світова геодезична система 1984 року. Стандартна глобальна система координат, що використовується GPS і більшістю вебкарт.",
    },
  },
  {
    slug: "gcs",
    term: { en: "Geographic coordinate system (GCS)", uk: "Географічна система координат (ГСК)" },
    definition: {
      en: "Reference framework that locates points on Earth's surface using latitude and longitude relative to a datum such as WGS84.",
      uk: "Система відліку, що визначає точки на поверхні Землі через широту і довготу відносно датуму, наприклад WGS84.",
    },
  },
];

export function localized<T extends Localized>(value: T, locale: Locale): string {
  return value[locale] ?? value.en;
}
