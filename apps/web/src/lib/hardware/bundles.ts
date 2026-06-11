/**
 * Hardware Bundles — canonical registry of Aegis Lens hardware kit offerings.
 * Bundles pair certified hardware devices with software subscriptions for field
 * journalists, analysts, teams, and enterprise command deployments.
 *
 * Реєстр апаратних комплектів Aegis Lens: поєднання сертифікованого обладнання
 * зі програмними підписками для польових журналістів, аналітиків, команд і
 * корпоративних командних розгортань.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Physical device categories included in hardware bundles.
 * Категорії фізичних пристроїв, що входять до апаратних комплектів.
 */
export type HardwareDeviceType =
  | "ruggedized-tablet"
  | "satellite-communicator"
  | "encrypted-laptop"
  | "radio-scanner"
  | "field-sensor"
  | "drone-detection-node";

/**
 * Tier identifiers for hardware bundle offerings.
 * Ідентифікатори рівнів пропозицій апаратних комплектів.
 */
export type HardwareBundleTier =
  | "field-starter"
  | "analyst-pro"
  | "team-ops"
  | "enterprise-command";

// ── Interface ─────────────────────────────────────────────────────────────────

/**
 * A hardware bundle pairing physical devices with Aegis Lens software subscription.
 * Апаратний комплект, що поєднує фізичні пристрої з програмним підписком Aegis Lens.
 */
export interface HardwareBundle {
  /** Unique bundle identifier. / Унікальний ідентифікатор комплекту. */
  id: string;
  /** Bundle tier. / Рівень комплекту. */
  tier: HardwareBundleTier;
  /** Bundle name in English. / Назва комплекту англійською. */
  name_en: string;
  /** Bundle name in Ukrainian. / Назва комплекту українською. */
  name_uk: string;
  /** List of device types included. / Перелік типів пристроїв у комплекті. */
  devices: HardwareDeviceType[];
  /** Software/subscription included (English). / Програмне забезпечення та підписка у комплекті (англійською). */
  softwareInclusion_en: string;
  /** Software/subscription included (Ukrainian). / Програмне забезпечення та підписка у комплекті (українською). */
  softwareInclusion_uk: string;
  /**
   * Total price in USD (hardware + software bundled).
   * Use 0 to indicate custom/SOW pricing.
   * Загальна ціна в USD (обладнання + ПЗ). 0 — індивідуальне / за SOW.
   */
  priceUsd: number;
  /** OPSEC notes for this bundle (English). / Примітки щодо OPSEC для цього комплекту (англійською). */
  notesOpsec_en: string;
  /** OPSEC notes for this bundle (Ukrainian). / Примітки щодо OPSEC для цього комплекту (українською). */
  notesOpsec_uk: string;
  /** Additional notes (English). / Додаткові примітки (англійською). */
  notes_en: string;
  /** Additional notes (Ukrainian). / Додаткові примітки (українською). */
  notes_uk: string;
}

// ── Canonical registry ─────────────────────────────────────────────────────────

export const HARDWARE_BUNDLES: HardwareBundle[] = [
  {
    id: "field-starter",
    tier: "field-starter",
    name_en: "Field Starter Kit",
    name_uk: "Польовий стартовий комплект",
    devices: ["ruggedized-tablet", "satellite-communicator"],
    softwareInclusion_en:
      "1-year Aegis Lens Pro subscription (annual billing). Offline maps, incident reporting, and field alert push included.",
    softwareInclusion_uk:
      "1 рік підписки Aegis Lens Pro (річна оплата). Включає офлайн-карти, звітування про інциденти та польові push-сповіщення.",
    priceUsd: 2500,
    notesOpsec_en:
      "Tablet pre-configured with full-disk encryption (AES-256), hardened OS, and VPN client. Satellite communicator paired to a dedicated secure channel.",
    notesOpsec_uk:
      "Планшет попередньо налаштований з повним шифруванням диска (AES-256), захищеною ОС і VPN-клієнтом. Супутниковий комунікатор прив'язано до виділеного захищеного каналу.",
    notes_en:
      "Designed for field journalists, NGO field workers, and humanitarian responders operating in conflict or low-connectivity zones. Drop-shipped from certified partner. Activation code included in box.",
    notes_uk:
      "Призначений для польових журналістів, польових працівників НГО та гуманітарних рятувальників, що діють у зонах конфлікту або з поганим зв'язком. Доставка безпосередньо від сертифікованого партнера. Код активації у коробці.",
  },
  {
    id: "analyst-pro",
    tier: "analyst-pro",
    name_en: "Analyst Pro Kit",
    name_uk: "Комплект «Аналітик Про»",
    devices: ["encrypted-laptop", "satellite-communicator"],
    softwareInclusion_en:
      "1-year Aegis Lens Business subscription (annual billing). Full API access, custom dashboards, and priority verification queue included.",
    softwareInclusion_uk:
      "1 рік підписки Aegis Lens Business (річна оплата). Повний доступ до API, кастомні дашборди та пріоритетна черга верифікації.",
    priceUsd: 4500,
    notesOpsec_en:
      "Laptop ships with BIOS lock, full-disk encryption, hardened OS baseline, and pre-configured VPN + Tor routing. Satellite communicator enables out-of-band comms when terrestrial networks are compromised.",
    notesOpsec_uk:
      "Ноутбук постачається з BIOS-блокуванням, повним шифруванням диска, захищеною базовою ОС, попередньо налаштованим VPN і Tor-маршрутизацією. Супутниковий комунікатор забезпечує позасмуговий зв'язок при компрометації наземних мереж.",
    notes_en:
      "Intended for desk analysts, OSINT researchers, and verification teams operating from fixed locations within or near conflict zones. Optimised for prolonged analytical sessions with secure remote connectivity.",
    notes_uk:
      "Призначений для стаціонарних аналітиків, OSINT-дослідників і команд верифікації, що працюють із фіксованих локацій у зонах конфлікту або поблизу них. Оптимізований для тривалих аналітичних сесій із захищеним віддаленим підключенням.",
  },
  {
    id: "team-ops",
    tier: "team-ops",
    name_en: "Team Ops Bundle",
    name_uk: "Командний операційний комплект",
    devices: [
      "ruggedized-tablet",
      "ruggedized-tablet",
      "ruggedized-tablet",
      "ruggedized-tablet",
      "ruggedized-tablet",
      "satellite-communicator",
    ],
    softwareInclusion_en:
      "1-year Aegis Lens Team subscription for up to 10 seats (annual billing). Shared workspaces, co-investigation tools, and team alert channels included.",
    softwareInclusion_uk:
      "1 рік підписки Aegis Lens Team на 10 місць (річна оплата). Спільні робочі простори, інструменти співрозслідування та командні канали сповіщень.",
    priceUsd: 10000,
    notesOpsec_en:
      "All tablets identically configured: AES-256 full-disk encryption, hardened OS, mesh-capable VPN so the team can operate on a private LAN over satellite backhaul. Remote-wipe capability enabled by default.",
    notesOpsec_uk:
      "Усі планшети ідентично налаштовані: AES-256 повне шифрування диска, захищена ОС, mesh-сумісний VPN для роботи команди у приватній LAN через супутниковий канал. Функція дистанційного стирання увімкнена за замовчуванням.",
    notes_en:
      "Designed for small team deployments: investigative journalism units, NGO field teams, or civil monitoring missions. 5 ruggedized tablets + 1 shared satellite communicator as uplink hub. Discounted vs. individual units.",
    notes_uk:
      "Призначений для розгортання невеликих команд: підрозділів журналістських розслідувань, польових команд НГО або цивільних місій моніторингу. 5 захищених планшетів + 1 спільний супутниковий комунікатор як вузол зв'язку. Вигідніше за окремі одиниці.",
  },
  {
    id: "enterprise-command",
    tier: "enterprise-command",
    name_en: "Enterprise Command Kit",
    name_uk: "Корпоративний командний комплект",
    devices: [
      "encrypted-laptop",
      "satellite-communicator",
      "radio-scanner",
      "field-sensor",
      "drone-detection-node",
    ],
    softwareInclusion_en:
      "Custom Aegis Lens Enterprise or Gov-Defense subscription. Dedicated deployment support, onboarding, SLA, and custom integrations included. Pricing via Statement of Work.",
    softwareInclusion_uk:
      "Індивідуальна підписка Aegis Lens Enterprise або Gov-Defense. Включає виділену підтримку розгортання, онбординг, SLA та кастомні інтеграції. Ціна за Statement of Work.",
    priceUsd: 0,
    notesOpsec_en:
      "Full OPSEC hardening: TEMPEST-assessed components where available, air-gapped configuration option, hardware security modules (HSM) for key storage, and physical tamper-evident seals. Deployment audit provided.",
    notesOpsec_uk:
      "Повне зміцнення OPSEC: компоненти з оцінкою TEMPEST (де доступно), варіант конфігурації з повітряним зазором, апаратні модулі безпеки (HSM) для зберігання ключів та фізичні пломби захисту від втручання. Аудит розгортання надається.",
    notes_en:
      "Intended for large government agencies, defense organizations, and enterprise security operations centers. Custom hardware configuration, phased deployment, and dedicated Aegis Lens engineering support. Contact sales for scoping.",
    notes_uk:
      "Призначений для великих державних органів, оборонних організацій та корпоративних центрів безпекових операцій. Індивідуальна конфігурація обладнання, поетапне розгортання та виділена інженерна підтримка Aegis Lens. Зверніться до відділу продажів для оцінки.",
  },
];

// ── Policy notes ──────────────────────────────────────────────────────────────

/**
 * Hardware is sourced via certified supply chain partners; Aegis Lens is not a
 * hardware manufacturer.
 *
 * Обладнання постачається через сертифікованих партнерів ланцюга постачань;
 * Aegis Lens не є виробником обладнання.
 */
export const HARDWARE_PARTNER_NOTE_EN =
  "All hardware included in Aegis Lens bundles is sourced exclusively through certified supply chain partners. Aegis Lens does not manufacture hardware and accepts no liability for hardware defects beyond the warranty terms set by the partner.";

export const HARDWARE_PARTNER_NOTE_UK =
  "Усе обладнання, що входить до комплектів Aegis Lens, постачається виключно через сертифікованих партнерів ланцюга постачань. Aegis Lens не виробляє обладнання і не несе відповідальності за дефекти обладнання, що виходять за межі гарантійних умов партнера.";

/**
 * Certain devices are subject to export control regulations.
 * US EAR and EU Dual-Use Regulation compliance is required.
 *
 * Певні пристрої підпадають під норми експортного контролю.
 * Потрібна відповідність US EAR та Регламенту ЄС про подвійне використання.
 */
export const HARDWARE_EXPORT_CONTROL_NOTE_EN =
  "Certain devices included in hardware bundles are subject to export control regulations, including the US Export Administration Regulations (EAR) and ITAR, and the EU Dual-Use Regulation. Purchasers are solely responsible for obtaining any required export licences and ensuring end-use compliance.";

export const HARDWARE_EXPORT_CONTROL_NOTE_UK =
  "Певні пристрої, що входять до апаратних комплектів, підпадають під норми експортного контролю, включаючи Правила адміністрації експорту США (EAR) та ITAR, а також Регламент ЄС про подвійне використання. Покупці несуть виключну відповідальність за отримання необхідних експортних ліцензій та дотримання умов кінцевого використання.";

/**
 * Hardware warranty is provided via partners; Aegis Lens is responsible for the
 * software/subscription component only.
 *
 * Гарантія на обладнання надається через партнерів; Aegis Lens відповідає
 * лише за програмну/підписну частину.
 */
export const HARDWARE_WARRANTY_NOTE_EN =
  "Hardware warranty (typically 12–24 months) is provided directly by the certified hardware partner. Aegis Lens is responsible exclusively for the software and subscription component of the bundle. For hardware warranty claims, contact the partner via the details provided with your shipment.";

export const HARDWARE_WARRANTY_NOTE_UK =
  "Гарантія на обладнання (як правило, 12–24 місяці) надається безпосередньо сертифікованим апаратним партнером. Aegis Lens несе відповідальність виключно за програмну та підписну складову комплекту. Для гарантійних претензій щодо обладнання зверніться до партнера за реквізитами, наданими разом із відвантаженням.";

/**
 * All devices are pre-configured with full disk encryption, VPN, and a hardened
 * OS baseline before shipment.
 *
 * Усі пристрої попередньо налаштовані з повним шифруванням диска, VPN та
 * захищеною базовою ОС до відвантаження.
 */
export const HARDWARE_OPSEC_NOTE_EN =
  "All Aegis Lens hardware bundles are pre-configured before shipment with: full-disk encryption (AES-256), a hardened OS baseline (unnecessary services disabled, kernel hardening applied), an approved VPN client pre-provisioned, and remote-wipe capability. Physical tamper-evident packaging is used for enterprise bundles.";

export const HARDWARE_OPSEC_NOTE_UK =
  "Усі апаратні комплекти Aegis Lens перед відвантаженням попередньо налаштовуються: повне шифрування диска (AES-256), захищена базова ОС (зайві служби вимкнено, застосовано зміцнення ядра), попередньо підготовлений затверджений VPN-клієнт та можливість дистанційного стирання. Для корпоративних комплектів використовується фізичне пакування з захистом від втручання.";

/**
 * No hardware may be exported to sanctioned countries or entities on export
 * control lists.
 *
 * Заборонено постачати обладнання до підсанкційних країн або суб'єктів,
 * внесених до списків експортного контролю.
 */
export const HARDWARE_PROHIBITED_DESTINATIONS_EN =
  "Hardware bundles may not be shipped to, or procured on behalf of, any country, entity, or individual: (a) subject to US, EU, or UN sanctions; (b) listed on the US Denied Persons List, Entity List, or Specially Designated Nationals (SDN) list; or (c) otherwise prohibited under applicable export control laws. Aegis Lens reserves the right to cancel any order suspected of violating these restrictions.";

export const HARDWARE_PROHIBITED_DESTINATIONS_UK =
  "Апаратні комплекти не можуть бути відвантажені до або придбані від імені будь-якої країни, суб'єкта чи фізичної особи: (a) що підпадають під санкції США, ЄС або ООН; (б) внесених до Списку відмов осіб, Списку суб'єктів або Списку спеціально визначених громадян (SDN) США; або (в) іншим чином заборонених відповідно до застосовного законодавства про експортний контроль. Aegis Lens залишає за собою право анулювати будь-яке замовлення, щодо якого підозрюється порушення цих обмежень.";

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Approximate per-device hardware costs used to split bundle totals.
 * These are internal estimates; actual partner costs vary.
 *
 * Приблизна вартість окремих пристроїв для розподілу загальної суми комплекту.
 */
const DEVICE_HARDWARE_COST_USD: Record<HardwareDeviceType, number> = {
  "ruggedized-tablet": 600,
  "satellite-communicator": 700,
  "encrypted-laptop": 1800,
  "radio-scanner": 400,
  "field-sensor": 350,
  "drone-detection-node": 1200,
};

/**
 * Approximate annual software subscription price included in each bundle tier.
 * Enterprise (priceUsd === 0) returns 0 as pricing is bespoke.
 *
 * Приблизна річна вартість програмного підписку, включеного у кожен рівень комплекту.
 */
const TIER_SOFTWARE_USD: Record<HardwareBundleTier, number> = {
  "field-starter": 699,
  "analyst-pro": 1188,
  "team-ops": 2388,
  "enterprise-command": 0,
};

/**
 * Computes the hardware and software cost breakdown for a given bundle.
 * Returns `{ hardwareUsd, softwareUsd, totalUsd }`.
 * For bundles with custom pricing (`priceUsd === 0`) all values are 0.
 *
 * Обчислює розподіл вартості обладнання та ПЗ для вказаного комплекту.
 * Для комплектів із індивідуальним ціноутворенням (`priceUsd === 0`) усі значення — 0.
 */
export function computeHardwareBundleTotal(bundleId: string): {
  hardwareUsd: number;
  softwareUsd: number;
  totalUsd: number;
} {
  const bundle = HARDWARE_BUNDLES.find((b) => b.id === bundleId);
  if (!bundle || bundle.priceUsd === 0) {
    return { hardwareUsd: 0, softwareUsd: 0, totalUsd: 0 };
  }

  const hardwareUsd = bundle.devices.reduce(
    (sum, device) => sum + (DEVICE_HARDWARE_COST_USD[device] ?? 0),
    0
  );
  const softwareUsd = TIER_SOFTWARE_USD[bundle.tier] ?? 0;
  const totalUsd = bundle.priceUsd;

  return { hardwareUsd, softwareUsd, totalUsd };
}

/**
 * Look up a hardware bundle by its ID.
 * Пошук апаратного комплекту за ідентифікатором.
 */
export function getHardwareBundleById(id: string): HardwareBundle | undefined {
  return HARDWARE_BUNDLES.find((b) => b.id === id);
}
