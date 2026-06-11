/**
 * Canonical event taxonomy for the Ukrainian conflict intelligence platform.
 * Version 1.0 — change log maintained below.
 *
 * Top-level classes map directly to CanonicalEvent.class.
 * Subclasses map to CanonicalEvent.subclass.
 *
 * CHANGELOG
 *   v1.0  2026-05-25  Initial taxonomy.
 */

export interface TaxonomyNode {
  code: string;
  label: Record<string, string>;
  description: Record<string, string>;
  subclasses?: TaxonomyNode[];
}

export const TAXONOMY: TaxonomyNode[] = [
  {
    code: "military_action",
    label: { en: "Military Action", uk: "Бойові дії" },
    description: {
      en: "Armed engagements, strikes, and force-on-force events.",
      uk: "Збройні зіткнення, удари та бойові контакти.",
    },
    subclasses: [
      {
        code: "airstrike",
        label: { en: "Airstrike", uk: "Авіаудар" },
        description: { en: "Attack delivered by aircraft or UAV.", uk: "Удар авіації або БПЛА." },
      },
      {
        code: "artillery_strike",
        label: { en: "Artillery Strike", uk: "Артилерійський удар" },
        description: { en: "Rockets, mortars, or tube artillery.", uk: "Ракети, міномети або ствольна артилерія." },
      },
      {
        code: "missile_strike",
        label: { en: "Missile Strike", uk: "Ракетний удар" },
        description: { en: "Ballistic or cruise missile impact.", uk: "Удар балістичної або крилатої ракети." },
      },
      {
        code: "drone_strike",
        label: { en: "Drone Strike", uk: "Удар БПЛА" },
        description: { en: "Kamikaze or loitering munition impact.", uk: "Удар камікадзе або барражуючого боєприпасу." },
      },
      {
        code: "ground_assault",
        label: { en: "Ground Assault", uk: "Штурм" },
        description: { en: "Infantry or armored ground assault.", uk: "Піхотний або бронетанковий штурм." },
      },
      {
        code: "air_defense",
        label: { en: "Air-Defense Engagement", uk: "Робота ППО" },
        description: { en: "Interception by air-defense systems.", uk: "Перехоплення системами ППО." },
      },
      {
        code: "naval_action",
        label: { en: "Naval Action", uk: "Морська операція" },
        description: { en: "Sea-based military engagement.", uk: "Морський бойовий контакт." },
      },
      {
        code: "sabotage",
        label: { en: "Sabotage", uk: "Диверсія" },
        description: { en: "Behind-enemy-lines sabotage or IED.", uk: "Диверсія або замінування." },
      },
    ],
  },
  {
    code: "infrastructure",
    label: { en: "Infrastructure", uk: "Інфраструктура" },
    description: {
      en: "Damage, disruption, or restoration of critical infrastructure.",
      uk: "Пошкодження, порушення або відновлення критичної інфраструктури.",
    },
    subclasses: [
      { code: "energy", label: { en: "Energy", uk: "Енергетика" }, description: { en: "Power plants, substations, grid.", uk: "Електростанції, підстанції, мережа." } },
      { code: "transport", label: { en: "Transport", uk: "Транспорт" }, description: { en: "Roads, railways, bridges, ports.", uk: "Дороги, залізниця, мости, порти." } },
      { code: "telecom", label: { en: "Telecom", uk: "Телекомунікації" }, description: { en: "Cellular towers, fiber, internet exchange.", uk: "Вежі зв'язку, оптоволокно, інтернет-вузли." } },
      { code: "water", label: { en: "Water", uk: "Водопостачання" }, description: { en: "Water treatment plants, dams, pipelines.", uk: "Водоочисні станції, дамби, трубопроводи." } },
      { code: "healthcare", label: { en: "Healthcare", uk: "Охорона здоров'я" }, description: { en: "Hospitals, clinics, pharmacies.", uk: "Лікарні, поліклініки, аптеки." } },
      { code: "fuel", label: { en: "Fuel", uk: "Паливо" }, description: { en: "Fuel depots, refineries, pipelines.", uk: "Паливні склади, НПЗ, трубопроводи." } },
    ],
  },
  {
    code: "civilian_alert",
    label: { en: "Civilian Alert", uk: "Цивільне сповіщення" },
    description: {
      en: "Events directly affecting civilian safety and movement.",
      uk: "Події, що безпосередньо впливають на безпеку та переміщення цивільних.",
    },
    subclasses: [
      { code: "air_raid_siren", label: { en: "Air-Raid Siren", uk: "Повітряна тривога" }, description: { en: "Official air-raid alert.", uk: "Офіційна повітряна тривога." } },
      { code: "evacuation_order", label: { en: "Evacuation Order", uk: "Наказ на евакуацію" }, description: { en: "Mandatory or voluntary evacuation.", uk: "Обов'язкова або добровільна евакуація." } },
      { code: "curfew", label: { en: "Curfew", uk: "Комендантська година" }, description: { en: "Movement restrictions.", uk: "Обмеження пересування." } },
      { code: "shelter_opening", label: { en: "Shelter Opening", uk: "Відкриття укриття" }, description: { en: "Shelter or humanitarian point opened.", uk: "Відкриття укриття або гуманітарного пункту." } },
      { code: "crossing_status", label: { en: "Border / Checkpoint Status", uk: "Статус КПП" }, description: { en: "Border or checkpoint open/closed/queue.", uk: "КПП відкрито/закрито/черга." } },
    ],
  },
  {
    code: "humanitarian",
    label: { en: "Humanitarian", uk: "Гуманітарна ситуація" },
    description: { en: "Aid delivery, displacement, and civilian casualties.", uk: "Гуманітарна допомога, переміщення та втрати серед цивільних." },
    subclasses: [
      { code: "displacement", label: { en: "Displacement", uk: "Переміщення" }, description: { en: "IDP flows and numbers.", uk: "Потоки та кількість ВПО." } },
      { code: "casualties", label: { en: "Casualties", uk: "Втрати" }, description: { en: "Civilian killed / wounded.", uk: "Цивільні загиблі / поранені." } },
      { code: "aid_delivery", label: { en: "Aid Delivery", uk: "Гуманітарна допомога" }, description: { en: "Food, medicine, shelter aid.", uk: "Їжа, медикаменти, укриття." } },
    ],
  },
  {
    code: "cyber",
    label: { en: "Cyber", uk: "Кіберінциденти" },
    description: { en: "Cyberattacks, disinformation ops, and electronic warfare.", uk: "Кібератаки, дезінформаційні операції та РЕБ." },
    subclasses: [
      { code: "ddos", label: { en: "DDoS", uk: "DDoS" }, description: { en: "Distributed denial-of-service attack.", uk: "Розподілена атака відмови в обслуговуванні." } },
      { code: "intrusion", label: { en: "Intrusion", uk: "Злом" }, description: { en: "Unauthorized access / data breach.", uk: "Несанкціонований доступ / витік даних." } },
      { code: "electronic_warfare", label: { en: "Electronic Warfare", uk: "РЕБ" }, description: { en: "GPS jamming, spoofing, EW action.", uk: "Глушіння GPS, спуфінг, дія РЕБ." } },
      { code: "info_operation", label: { en: "Information Operation", uk: "Інформаційна операція" }, description: { en: "Coordinated narrative manipulation.", uk: "Скоординована маніпуляція наративом." } },
    ],
  },
  {
    code: "maritime",
    label: { en: "Maritime", uk: "Морська обстановка" },
    description: { en: "Naval, shipping, and port events in Black Sea / Azov.", uk: "Морські, судноплавні та портові події в Чорному/Азовському морі." },
    subclasses: [
      { code: "vessel_movement", label: { en: "Vessel Movement", uk: "Рух суден" }, description: { en: "Notable ship transit.", uk: "Помітний рух судна." } },
      { code: "naval_incident", label: { en: "Naval Incident", uk: "Морський інцидент" }, description: { en: "Attack, seizure, or sinking.", uk: "Атака, захоплення або затоплення." } },
      { code: "port_status", label: { en: "Port Status", uk: "Статус порту" }, description: { en: "Port open/closed/blocked.", uk: "Порт відкрито/закрито/заблоковано." } },
    ],
  },
  {
    code: "aviation",
    label: { en: "Aviation", uk: "Авіаційна обстановка" },
    description: { en: "Military and civilian aviation events.", uk: "Військова та цивільна авіаційна обстановка." },
    subclasses: [
      { code: "military_flight", label: { en: "Military Flight", uk: "Військовий рейс" }, description: { en: "Tracked military aircraft activity.", uk: "Відстежена активність військового літака." } },
      { code: "airspace_closure", label: { en: "Airspace Closure", uk: "Закриття повітряного простору" }, description: { en: "NOTAM or de-facto closure.", uk: "NOTAM або фактичне закриття." } },
      { code: "aircraft_loss", label: { en: "Aircraft Loss", uk: "Втрата літака" }, description: { en: "Confirmed shootdown or crash.", uk: "Підтверджений збитий або авіакатастрофа." } },
    ],
  },
  {
    code: "environmental",
    label: { en: "Environmental", uk: "Екологія" },
    description: { en: "Fires, floods, pollution events.", uk: "Пожежі, повені, забруднення." },
    subclasses: [
      { code: "wildfire", label: { en: "Wildfire", uk: "Лісова пожежа" }, description: { en: "Active fire perimeter.", uk: "Периметр активної пожежі." } },
      { code: "industrial_fire", label: { en: "Industrial Fire", uk: "Промислова пожежа" }, description: { en: "Fire at industrial facility.", uk: "Пожежа на промисловому об'єкті." } },
      { code: "flooding", label: { en: "Flooding", uk: "Повінь" }, description: { en: "Flood event or dam breach.", uk: "Повінь або прорив дамби." } },
      { code: "pollution", label: { en: "Pollution", uk: "Забруднення" }, description: { en: "Spill, radiation, chemical release.", uk: "Розлив, радіація, хімічний викид." } },
    ],
  },
  {
    code: "political",
    label: { en: "Political", uk: "Політика" },
    description: { en: "Significant political statements, decisions, and sanctions.", uk: "Значущі політичні заяви, рішення та санкції." },
    subclasses: [
      { code: "statement", label: { en: "Official Statement", uk: "Офіційна заява" }, description: { en: "Government / military official statement.", uk: "Заява уряду або військових." } },
      { code: "sanction", label: { en: "Sanction", uk: "Санкції" }, description: { en: "New sanctions package.", uk: "Новий пакет санкцій." } },
      { code: "diplomatic", label: { en: "Diplomatic Event", uk: "Дипломатична подія" }, description: { en: "Talks, agreements, expulsions.", uk: "Переговори, угоди, висилки." } },
    ],
  },
  {
    code: "economic",
    label: { en: "Economic", uk: "Економіка" },
    description: { en: "Supply chain, commodity, and financial events tied to the conflict.", uk: "Ланцюги постачання, сировина та фінансові події, пов'язані з конфліктом." },
    subclasses: [
      { code: "grain_corridor", label: { en: "Grain Corridor", uk: "Зернова ініціатива" }, description: { en: "Grain shipment or corridor status.", uk: "Статус зернового коридору." } },
      { code: "commodity_price", label: { en: "Commodity Price Impact", uk: "Вплив на ціни" }, description: { en: "Conflict-driven commodity price move.", uk: "Зміна цін на сировину через конфлікт." } },
      { code: "supply_chain", label: { en: "Supply Chain Disruption", uk: "Збій ланцюга постачання" }, description: { en: "Logistics disruption.", uk: "Логістичний збій." } },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const _classMap = new Map<string, TaxonomyNode>();
const _subclassMap = new Map<string, TaxonomyNode>();

for (const cls of TAXONOMY) {
  _classMap.set(cls.code, cls);
  for (const sub of cls.subclasses ?? []) {
    _subclassMap.set(`${cls.code}.${sub.code}`, sub);
  }
}

export function getClass(code: string): TaxonomyNode | undefined {
  return _classMap.get(code);
}

export function getSubclass(classCode: string, subCode: string): TaxonomyNode | undefined {
  return _subclassMap.get(`${classCode}.${subCode}`);
}

export function allClassCodes(): string[] {
  return TAXONOMY.map((n) => n.code);
}

export function allSubclassCodes(classCode: string): string[] {
  return (getClass(classCode)?.subclasses ?? []).map((n) => n.code);
}

export function isValidClass(code: string): boolean {
  return _classMap.has(code);
}

export function isValidSubclass(classCode: string, subCode: string): boolean {
  return _subclassMap.has(`${classCode}.${subCode}`);
}
