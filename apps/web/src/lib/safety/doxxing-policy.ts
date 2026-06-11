/**
 * Anti-Doxxing Policy — platform policy text in English and Ukrainian.
 *
 * Used to render the public policy page and as a reference for moderation.
 *
 * Текст публічної антидоксинг-політики платформи (EN + UK).
 */

// ── Policy metadata ───────────────────────────────────────────────────────────

export const POLICY_VERSION = "1.0";
export const POLICY_LAST_UPDATED = "2026-06-11";

// ── English policy ────────────────────────────────────────────────────────────

export const DOXXING_POLICY_EN = `
# Anti-Doxxing & Privacy Protection Policy
Version ${POLICY_VERSION} — Last updated ${POLICY_LAST_UPDATED}

## 1. Purpose
Aegis Lens is an open-source intelligence platform designed for conflict monitoring and accountability journalism. We recognise that our capabilities could be misused to expose private individuals. This policy establishes binding rules to prevent that.

## 2. Definitions
- **Private individual**: Any person who has not voluntarily entered public life (e.g. not an elected official, military commander, or executive of a public company).
- **Doxxing**: Publishing private personal information (address, phone number, national ID, family details) with the intent to harm or enable harassment.
- **PII**: Personally identifiable information including names, addresses, phone numbers, email addresses, financial account details, and precise GPS coordinates.

## 3. Prohibited Content
The following are strictly prohibited on the platform:
- Publishing household-level addresses of private individuals.
- Sharing phone numbers, email addresses, or national ID numbers of private individuals.
- Uploading images that contain unblurred faces of private individuals.
- Uploading images containing visible, unblurred vehicle license plates.
- Creating watchlists or search queries targeting private individuals by name.
- Using AI-assisted tools (Rule Builder, Copilot) to build dossiers on private individuals.

## 4. Enforcement Mechanisms
- **Automated detection**: NER classification, PII scanning, face blur, and plate blur run on all content before publication.
- **Review queue**: Borderline content is held in a moderation queue with SLA-bound review (1h–72h depending on risk level).
- **Takedown requests**: Any person may request removal of content about them. Requests are processed within 24 hours.
- **Contributor strikes**: Violations result in strikes. Three strikes trigger suspension; five trigger permanent ban.

## 5. Appeals
Users whose content was removed or whose account was suspended may appeal by contacting privacy@aegis-lens.uk. Appeals are reviewed within 72 hours.

## 6. Public Figures
Public figures (politicians, military commanders, executives) may be profiled in their official capacity. Their private lives (family members, home addresses, medical data) are protected under the same rules as private individuals.

## 7. KYC for Advanced Features
Access to advanced enrichment and export features requires identity verification (KYC) for Business and Enterprise tier users. This is a structural safeguard against coordinated doxxing campaigns.

## 8. Contact
Privacy concerns: privacy@aegis-lens.uk
Takedown requests: takedown@aegis-lens.uk
Abuse reports: abuse@aegis-lens.uk
`.trim();

// ── Ukrainian policy ──────────────────────────────────────────────────────────

export const DOXXING_POLICY_UK = `
# Антидоксинг та захист приватності
Версія ${POLICY_VERSION} — Оновлено ${POLICY_LAST_UPDATED}

## 1. Мета
Aegis Lens — платформа відкритої розвідки для моніторингу конфліктів і журналістики відповідальності. Ми усвідомлюємо, що можливості платформи можуть бути використані для розкриття інформації про приватних осіб. Ця політика встановлює обов'язкові правила для запобігання цьому.

## 2. Визначення
- **Приватна особа**: будь-яка людина, яка добровільно не увійшла у публічне життя (не є обраною посадовою особою, військовим командиром або керівником публічної компанії).
- **Доксинг**: публікація приватної персональної інформації (адреса, телефон, ідентифікаційний номер, сімейні дані) з метою заподіяння шкоди або сприяння переслідуванню.
- **ПДн**: персональні дані, включаючи імена, адреси, номери телефонів, адреси електронної пошти, фінансові рахунки та точні GPS-координати.

## 3. Заборонений контент
На платформі суворо заборонено:
- Публікувати адреси на рівні будинку для приватних осіб.
- Розповсюджувати номери телефонів, електронні адреси або ідентифікаційні номери приватних осіб.
- Завантажувати зображення з нерозмитими обличчями приватних осіб.
- Завантажувати зображення з видимими нерозмитими номерними знаками транспортних засобів.
- Створювати списки спостереження або пошукові запити, що цілеспрямовано шукають приватних осіб за іменем.
- Використовувати AI-інструменти (Rule Builder, Copilot) для складання досьє на приватних осіб.

## 4. Механізми виконання
- **Автоматичне виявлення**: NER-класифікація, сканування ПДн, розмиття облич і номерних знаків застосовуються до всього контенту перед публікацією.
- **Черга перегляду**: Спірний контент затримується в черзі модерації з SLA-зобов'язаннями (1–72 год залежно від рівня ризику).
- **Запити на видалення**: Будь-яка особа може подати запит на видалення контенту про себе. Запити обробляються протягом 24 годин.
- **Система страйків**: Порушення призводять до страйків. Три страйки — призупинення акаунту; п'ять — постійне блокування.

## 5. Апеляції
Користувачі, чий контент було видалено або акаунт призупинено, можуть оскаржити рішення, звернувшись до privacy@aegis-lens.uk. Апеляції розглядаються протягом 72 годин.

## 6. Публічні особи
Публічні особи (політики, військові командири, керівники) можуть бути описані в їхньому офіційному статусі. Їхнє приватне життя (члени сім'ї, домашні адреси, медичні дані) захищені тими самими правилами, що і для приватних осіб.

## 7. KYC для розширених функцій
Доступ до розширеного збагачення даних і функцій експорту вимагає верифікації особи (KYC) для користувачів Business та Enterprise рівнів. Це структурний захист від скоординованих доксинг-кампаній.

## 8. Контакти
Питання конфіденційності: privacy@aegis-lens.uk
Запити на видалення: takedown@aegis-lens.uk
Повідомлення про зловживання: abuse@aegis-lens.uk
`.trim();
