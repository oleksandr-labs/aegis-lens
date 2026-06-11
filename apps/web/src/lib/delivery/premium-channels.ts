/**
 * Premium Delivery Channels — registry of high-cost / high-reliability alert delivery options.
 * Each channel maps to a separate Stripe meter; pricing is per-message or per-month.
 *
 * Реєстр преміум-каналів доставки сповіщень: SMS, голос, супутник, push, webhook тощо.
 * Кожен канал — окремий Stripe-лічильник; ціна — за повідомлення або за місяць.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Supported delivery channel types.
 * Підтримувані типи каналів доставки.
 */
export type DeliveryChannelType =
  | "sms-alert"
  | "voice-call"
  | "satellite-sms"
  | "encrypted-email"
  | "push-notification"
  | "pager"
  | "secure-api-webhook"
  | "whatsapp"
  | "signal";

/**
 * Subscription tier required to access a delivery channel.
 * Мінімальний тарифний рівень для доступу до каналу.
 */
export type DeliveryTier = "standard" | "premium" | "critical-ops";

/**
 * Latency class of the delivery channel.
 * Клас затримки каналу доставки.
 */
export type DeliveryLatencyClass = "realtime" | "near-realtime" | "scheduled";

// ── Interface ─────────────────────────────────────────────────────────────────

/**
 * Full configuration record for a premium delivery channel.
 * Повна конфігурація преміум-каналу доставки.
 */
export interface PremiumChannelConfig {
  /** Unique slug identifier. / Унікальний ідентифікатор-slug. */
  id: string;
  /** Channel technology type. / Тип технології каналу. */
  channel: DeliveryChannelType;
  /** Display name in English. / Відображувана назва англійською. */
  name_en: string;
  /** Display name in Ukrainian. / Відображувана назва українською. */
  name_uk: string;
  /** Access tier required. / Необхідний рівень доступу. */
  tier: DeliveryTier;
  /** Latency class. / Клас затримки. */
  latency: DeliveryLatencyClass;
  /** Human-readable pricing description in English. / Опис ціни англійською. */
  pricePerUnit_en: string;
  /** Human-readable pricing description in Ukrainian. / Опис ціни українською. */
  pricePerUnit_uk: string;
  /** Regions where this channel is available (English). / Регіони доступності (англійська). */
  availableRegions_en: string;
  /** Regions where this channel is available (Ukrainian). / Регіони доступності (українська). */
  availableRegions_uk: string;
  /** Operational notes in English. / Операційні примітки англійською. */
  notes_en: string;
  /** Operational notes in Ukrainian. / Операційні примітки українською. */
  notes_uk: string;
  /** Prohibited uses in English. / Заборонені варіанти використання англійською. */
  prohibitedUses_en: string;
  /** Prohibited uses in Ukrainian. / Заборонені варіанти використання українською. */
  prohibitedUses_uk: string;
}

// ── Policy strings ────────────────────────────────────────────────────────────

/**
 * Prohibited uses for all premium delivery channels (English).
 * Заборонені варіанти використання для всіх преміум-каналів (англійська).
 */
export const CHANNEL_PROHIBITED_USES_EN =
  "Prohibited: marketing or promotional messaging; unsolicited bulk messages (spam); unverified or fabricated alert content; financial market manipulation via alert timing; harassment or targeted intimidation; any use in violation of applicable telecommunications law.";

/**
 * Prohibited uses for all premium delivery channels (Ukrainian).
 * Заборонені варіанти використання для всіх преміум-каналів (українська).
 */
export const CHANNEL_PROHIBITED_USES_UK =
  "Заборонено: маркетингові або рекламні повідомлення; небажані масові розсилки (спам); неперевірений або сфабрикований вміст сповіщень; маніпулювання фінансовими ринками через таймінг сповіщень; переслідування або цілеспрямоване залякування; будь-яке використання, що порушує застосовне телекомунікаційне законодавство.";

/**
 * Note on satellite-SMS usage restrictions (English).
 * Примітка щодо обмежень використання супутникового SMS (англійська).
 */
export const SATELLITE_NOTE_EN =
  "Satellite-SMS is reserved for operational contexts only: humanitarian missions, field intelligence operations, conflict-zone journalism, and defense-adjacent use cases where terrestrial networks are unavailable or compromised. Commercial or consumer use is prohibited. Subject to Iridium/Thuraya export controls and applicable sanctions regimes.";

/**
 * Note on satellite-SMS usage restrictions (Ukrainian).
 * Примітка щодо обмежень використання супутникового SMS (українська).
 */
export const SATELLITE_NOTE_UK =
  "Супутниковий SMS призначений виключно для оперативних контекстів: гуманітарні місії, польові розвідувальні операції, журналістика в зонах конфліктів та суміжні з обороною сценарії, де наземні мережі недоступні або скомпрометовані. Комерційне або споживче використання заборонено. Підлягає експортним контролям Iridium/Thuraya та застосовним санкційним режимам.";

/**
 * Per-channel rate limits to prevent abuse (English).
 * Обмеження швидкості на канал для запобігання зловживанням (англійська).
 */
export const DELIVERY_RATE_LIMITS_EN =
  "Rate limits by channel — SMS: 100 msg/min per workspace, 10,000 msg/day; Voice: 20 concurrent calls per workspace; Satellite-SMS: 50 msg/day per workspace (operational justification required above 20/day); Push: 1,000 notifications/min; Webhook: 500 events/sec; WhatsApp: subject to Meta Business API tier limits; Signal/Threema: 200 msg/day. Limits enforced at workspace level; burst allowance of 2x for up to 60 seconds.";

/**
 * Per-channel rate limits to prevent abuse (Ukrainian).
 * Обмеження швидкості на канал для запобігання зловживанням (українська).
 */
export const DELIVERY_RATE_LIMITS_UK =
  "Ліміти швидкості по каналах — SMS: 100 повідомл./хв на простір, 10 000 повідомл./день; Голос: 20 одночасних дзвінків на простір; Супутниковий SMS: 50 повідомл./день на простір (потрібне оперативне обґрунтування понад 20/день); Push: 1 000 сповіщень/хв; Webhook: 500 подій/сек; WhatsApp: відповідно до рівневих лімітів Meta Business API; Signal/Threema: 200 повідомл./день. Ліміти застосовуються на рівні простору; допустимий burst 2x протягом до 60 секунд.";

// ── Registry ──────────────────────────────────────────────────────────────────

/**
 * Canonical registry of premium delivery channels.
 * Канонічний реєстр преміум-каналів доставки.
 */
export const PREMIUM_CHANNEL_CONFIGS: PremiumChannelConfig[] = [
  {
    id: "sms-alert",
    channel: "sms-alert",
    name_en: "SMS Alert (Twilio)",
    name_uk: "SMS-сповіщення (Twilio)",
    tier: "premium",
    latency: "realtime",
    pricePerUnit_en:
      "$0.05–$0.15 per message (varies by destination country); Twilio passthrough + 30% markup. Included quota per tier.",
    pricePerUnit_uk:
      "$0.05–$0.15 за повідомлення (залежно від країни призначення); прохідна вартість Twilio + 30% націнка. Квота включена до тарифу.",
    availableRegions_en: "Global coverage via Twilio; rate varies by country code.",
    availableRegions_uk: "Глобальне покриття через Twilio; ставка залежить від коду країни.",
    notes_en:
      "Real-time SMS delivery for air raid alerts, critical incident notifications, and operational warnings. Supports Unicode (Cyrillic). Per-message billing via Stripe metered pricing. Bulk SMS credit packs available at volume discount.",
    notes_uk:
      "SMS-доставка в реальному часі для сповіщень про повітряну тривогу, критичні інциденти та оперативні попередження. Підтримує Unicode (кирилиця). Оплата за повідомлення через Stripe. Доступні пакети SMS-кредитів зі знижкою за обсяг.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "voice-call",
    channel: "voice-call",
    name_en: "Voice / IVR Alert (Automated Call)",
    name_uk: "Голосове / IVR-сповіщення (Автодзвінок)",
    tier: "critical-ops",
    latency: "realtime",
    pricePerUnit_en:
      "$0.10–$0.50 per minute (destination-dependent); available on Pro+ and above.",
    pricePerUnit_uk:
      "$0.10–$0.50 за хвилину (залежно від напряму); доступно для Pro+ і вище.",
    availableRegions_en: "Global PSTN; rate varies by destination country.",
    availableRegions_uk: "Глобальна PSTN; ставка залежить від країни призначення.",
    notes_en:
      "Automated robocall for critical-ops alerts where SMS may go unnoticed. Supports text-to-speech in Ukrainian, English, and other languages. Configurable retry policy (up to 3 attempts). SLA: call initiated within 30 seconds of trigger.",
    notes_uk:
      "Автоматичний дзвінок для критично важливих оперативних сповіщень, коли SMS може залишитися непоміченим. Підтримує TTS українською, англійською та іншими мовами. Налаштована політика повторних спроб (до 3). SLA: дзвінок ініціюється протягом 30 секунд після тригера.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "satellite-sms",
    channel: "satellite-sms",
    name_en: "Satellite SMS (Iridium / Thuraya)",
    name_uk: "Супутниковий SMS (Iridium / Thuraya)",
    tier: "critical-ops",
    latency: "near-realtime",
    pricePerUnit_en:
      "$0.50–$2.00 per message; Iridium and Thuraya passthrough. For offline or remote areas only.",
    pricePerUnit_uk:
      "$0.50–$2.00 за повідомлення; прохідна вартість Iridium та Thuraya. Лише для офлайн або віддалених районів.",
    availableRegions_en:
      "Global, including areas without terrestrial cellular coverage (conflict zones, remote humanitarian missions).",
    availableRegions_uk:
      "Глобально, включно з районами без наземного стільникового зв'язку (зони конфліктів, віддалені гуманітарні місії).",
    notes_en: SATELLITE_NOTE_EN,
    notes_uk: SATELLITE_NOTE_UK,
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "encrypted-email",
    channel: "encrypted-email",
    name_en: "Encrypted Email Digest (PGP)",
    name_uk: "Зашифрований email-дайджест (PGP)",
    tier: "standard",
    latency: "scheduled",
    pricePerUnit_en:
      "$5–$20 per month depending on digest frequency (hourly / 6-hourly / daily). Included in Business+ subscription.",
    pricePerUnit_uk:
      "$5–$20 на місяць залежно від частоти дайджесту (щогодини / кожні 6 годин / щодня). Включено в підписку Business+.",
    availableRegions_en: "Global; delivered to any PGP-capable email client.",
    availableRegions_uk: "Глобально; доставляється на будь-який PGP-сумісний email-клієнт.",
    notes_en:
      "Scheduled PGP-encrypted alert digests for users who cannot use app push or SMS. Supports custom digest templates. Recipient public key stored in user profile. Ideal for journalists and NGO workers operating in high-risk environments.",
    notes_uk:
      "Заплановані PGP-зашифровані дайджести сповіщень для користувачів, які не можуть використовувати push або SMS. Підтримує кастомні шаблони. Відкритий ключ одержувача зберігається в профілі. Ідеально для журналістів та працівників НКО у зонах підвищеного ризику.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "push-notification",
    channel: "push-notification",
    name_en: "Mobile Push Notification",
    name_uk: "Мобільний push-сповіщення",
    tier: "standard",
    latency: "realtime",
    pricePerUnit_en:
      "Included in Pro+ and above; no additional per-message charge. Standard tier: up to 500 pushes/day.",
    pricePerUnit_uk:
      "Включено до Pro+ і вище; без додаткової плати за повідомлення. Стандартний рівень: до 500 push/день.",
    availableRegions_en: "Global via FCM (Android) and APNs (iOS).",
    availableRegions_uk: "Глобально через FCM (Android) та APNs (iOS).",
    notes_en:
      "Real-time mobile push via FCM and APNs. Supports rich notifications (title, body, image, action buttons). Configurable per-channel priority (normal / high). Failover: if push fails, system can fall back to SMS per user preference.",
    notes_uk:
      "Push-сповіщення в реальному часі через FCM та APNs. Підтримує розширені сповіщення (заголовок, тіло, зображення, кнопки дій). Налаштований пріоритет на канал (звичайний / високий). Failover: при збої push система може перейти на SMS відповідно до налаштувань користувача.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "pager",
    channel: "pager",
    name_en: "Pager / SMS-Gateway (Legacy Gov)",
    name_uk: "Пейджер / SMS-шлюз (Застарілий держсектор)",
    tier: "premium",
    latency: "near-realtime",
    pricePerUnit_en:
      "$0.05–$0.20 per page/message via legacy pager network or SMS gateway. Available on request; Enterprise+ only.",
    pricePerUnit_uk:
      "$0.05–$0.20 за сторінку/повідомлення через застарілу пейджерну мережу або SMS-шлюз. Доступно на запит; лише Enterprise+.",
    availableRegions_en:
      "Select regions with legacy pager infrastructure (primarily EU and North America government networks).",
    availableRegions_uk:
      "Окремі регіони з застарілою пейджерною інфраструктурою (переважно державні мережі ЄС та Північної Америки).",
    notes_en:
      "Legacy pager and SMS-gateway support for government agencies that still operate pager infrastructure. Low bandwidth; text-only messages up to 240 characters. Failover option for critical government alerts when IP connectivity is unavailable.",
    notes_uk:
      "Підтримка застарілих пейджерів і SMS-шлюзів для держорганів, що досі використовують пейджерну інфраструктуру. Низька пропускна здатність; лише текст до 240 символів. Варіант failover для критичних держ-сповіщень при відсутності IP-з'єднання.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "secure-api-webhook",
    channel: "secure-api-webhook",
    name_en: "Dedicated Webhook SLA (TLS + HMAC-Signed)",
    name_uk: "Виділений Webhook SLA (TLS + HMAC-підпис)",
    tier: "premium",
    latency: "realtime",
    pricePerUnit_en:
      "Included in Enterprise subscription; $199/mo as standalone add-on for Business tier.",
    pricePerUnit_uk:
      "Включено в підписку Enterprise; $199/міс як окрема надбудова для рівня Business.",
    availableRegions_en: "Global; endpoint must be reachable from Aegis Lens egress IPs.",
    availableRegions_uk: "Глобально; ендпоінт має бути доступний з вихідних IP Aegis Lens.",
    notes_en:
      "Guaranteed delivery webhook with TLS mutual auth and HMAC-SHA256 request signing. Configurable retry policy (exponential backoff, up to 72 hours). Dead-letter queue with manual replay. Per-event delivery receipts. Dedicated egress IP allowlisting supported.",
    notes_uk:
      "Webhook з гарантованою доставкою, взаємною TLS-аутентифікацією та підписом запиту HMAC-SHA256. Налаштована політика повторних спроб (експоненційне зменшення, до 72 годин). Черга мертвих листів з ручним відтворенням. Квитанції про доставку на подію. Підтримується allowlisting виділеного вихідного IP.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "whatsapp",
    channel: "whatsapp",
    name_en: "WhatsApp Business API Alerts",
    name_uk: "Сповіщення через WhatsApp Business API",
    tier: "premium",
    latency: "realtime",
    pricePerUnit_en:
      "$0.03–$0.10 per conversation (24-hour window); Meta passthrough pricing. Available in approved regions only.",
    pricePerUnit_uk:
      "$0.03–$0.10 за розмову (вікно 24 години); прохідна вартість Meta. Доступно лише в затверджених регіонах.",
    availableRegions_en:
      "Available in most regions where WhatsApp Business API is approved by Meta. Excludes some sanctioned countries.",
    availableRegions_uk:
      "Доступно в більшості регіонів, де WhatsApp Business API затверджено Meta. Виключає деякі країни під санкціями.",
    notes_en:
      "WhatsApp Business API for structured alert messages. Supports approved message templates only (per Meta policy). Rich cards with images, action buttons, and location pins. Conversation-based billing (24h window). Subject to Meta template approval process.",
    notes_uk:
      "WhatsApp Business API для структурованих сповіщень. Підтримує лише затверджені шаблони повідомлень (згідно з політикою Meta). Розширені картки із зображеннями, кнопками дій та геолокацією. Оплата за розмову (вікно 24 год). Підлягає процесу затвердження шаблонів Meta.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
  {
    id: "signal",
    channel: "signal",
    name_en: "Signal / Threema Secure Alerts",
    name_uk: "Безпечні сповіщення через Signal / Threema",
    tier: "critical-ops",
    latency: "near-realtime",
    pricePerUnit_en:
      "Included in Critical-Ops tier; $49/mo add-on for Premium. Where API access is available.",
    pricePerUnit_uk:
      "Включено в рівень Critical-Ops; надбудова $49/міс для Premium. Там, де доступний API.",
    availableRegions_en:
      "Available where Signal/Threema APIs permit programmatic access; primarily EU and select humanitarian regions.",
    availableRegions_uk:
      "Доступно там, де API Signal/Threema дозволяють програмний доступ; переважно ЄС та окремі гуманітарні регіони.",
    notes_en:
      "End-to-end encrypted alerts via Signal or Threema for journalists, field operators, and humanitarian workers in hostile environments. Leverages Signal Note-to-Self or group-delivery approach. Subject to Signal/Threema API availability and terms of service.",
    notes_uk:
      "Наскрізно зашифровані сповіщення через Signal або Threema для журналістів, польових операторів та гуманітарних працівників у ворожих умовах. Використовує підхід Signal Note-to-Self або групової доставки. Залежить від доступності та умов використання API Signal/Threema.",
    prohibitedUses_en: CHANNEL_PROHIBITED_USES_EN,
    prohibitedUses_uk: CHANNEL_PROHIBITED_USES_UK,
  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

/**
 * Filter the channel registry by delivery tier.
 *
 * Фільтрація реєстру каналів за рівнем доставки.
 */
export function getChannelsByTier(tier: DeliveryTier): PremiumChannelConfig[] {
  return PREMIUM_CHANNEL_CONFIGS.filter((c) => c.tier === tier);
}
