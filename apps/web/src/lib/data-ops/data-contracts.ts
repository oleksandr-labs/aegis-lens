/**
 * Data Contracts — schema ownership, consumer subscriptions, and change policy.
 * Контракти даних — власність схем, підписки споживачів та політика змін.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Semver-style contract version string (e.g. "1.0.0").
 * Рядок версії контракту у стилі semver (наприклад "1.0.0").
 */
export type ContractVersion = string;

/** Schema contract for a single field. */
export interface FieldContract {
  /** Field name as it appears in the schema. */
  field: string;
  /** Data type (e.g. "string", "number", "boolean", "ISO8601"). */
  type: string;
  /** Whether the field is mandatory. */
  required: boolean;
  /** Field description — English. */
  description_en: string;
  /** Field description — Ukrainian. */
  description_uk: string;
}

/** Full data contract between a producer and its consumers. */
export interface DataContract {
  /** Unique contract identifier. */
  id: string;
  /** Human-readable contract name — English. */
  name_en: string;
  /** Human-readable contract name — Ukrainian. */
  name_uk: string;
  /** Current contract version (semver). */
  version: ContractVersion;
  /** Service or team that owns and produces this data. */
  producer: string;
  /** Services or teams subscribed to this contract. */
  consumers: string[];
  /** Field-level schema contracts. */
  fields: FieldContract[];
  /** Policy for handling breaking changes — English. */
  breakingChangePolicy_en: string;
  /** Policy for handling breaking changes — Ukrainian. */
  breakingChangePolicy_uk: string;
  notes_en: string;
  notes_uk: string;
}

// ---------------------------------------------------------------------------
// Principles & tooling notes
// ---------------------------------------------------------------------------

export const DATA_CONTRACT_PRINCIPLE_EN =
  "Producers own their schemas and are responsible for maintaining backward compatibility. " +
  "Consumers must explicitly subscribe to a contract before depending on it. " +
  "Breaking changes (field removal, type change, rename) require a minimum 30-day deprecation notice " +
  "with a migration guide published to the contract registry.";

export const DATA_CONTRACT_PRINCIPLE_UK =
  "Виробники володіють своїми схемами і відповідають за підтримку зворотної сумісності. " +
  "Споживачі зобов'язані явно підписатися на контракт перед тим, як від нього залежати. " +
  "Зламні зміни (видалення поля, зміна типу, перейменування) вимагають щонайменше 30-денного повідомлення про застаріння " +
  "з посібником із міграції, опублікованим у реєстрі контрактів.";

export const DATA_CONTRACT_TOOLING_NOTE_EN =
  "Automated contract testing is enforced in CI using Soda Core or Great Expectations. " +
  "Every PR that touches a producer schema must pass contract tests before merge. " +
  "Drift between declared contract and actual data shape fails the build.";

export const DATA_CONTRACT_TOOLING_NOTE_UK =
  "Автоматичне тестування контрактів виконується в CI за допомогою Soda Core або Great Expectations. " +
  "Кожен PR, що торкається схеми виробника, повинен пройти тести контрактів перед злиттям. " +
  "Розбіжність між задекларованим контрактом та фактичною формою даних призводить до провалу білду.";

export const DATA_CONTRACT_REGISTRY_NOTE_EN =
  "All contracts are versioned in Git under `data/contracts/`. " +
  "Schema diffs are auto-generated and attached to PRs. " +
  "Subscribed consumers are notified via Slack and email when a contract version is bumped or deprecated.";

export const DATA_CONTRACT_REGISTRY_NOTE_UK =
  "Усі контракти версійовані в Git у директорії `data/contracts/`. " +
  "Diff схем генерується автоматично та додається до PR. " +
  "Підписані споживачі отримують сповіщення в Slack та електронною поштою при підвищенні версії або застаріванні контракту.";
