/**
 * Plugin SDK — Versioning + semver compatibility checks.
 *
 * Validates plugin versions against the platform version using semantic
 * versioning rules. Plugins declare a minPlatformVersion in their manifest;
 * this module checks whether the running platform satisfies that requirement.
 *
 * Перевірка сумісності версії плагіну з версією платформи за правилами semver.
 */

// ── Regex ─────────────────────────────────────────────────────────────────────

/**
 * Standard semver regex (major.minor.patch with optional pre-release / build).
 *
 * Стандартний regex для semver: major.minor.patch + опційний pre-release.
 */
export const SEMVER_REGEX =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([\w.-]+))?(?:\+([\w.-]+))?$/;

// ── PluginVersion ─────────────────────────────────────────────────────────────

/**
 * Parsed semantic version with numeric components.
 *
 * Розібрана семантична версія з числовими компонентами.
 */
export interface PluginVersion {
  raw: string;
  major: number;
  minor: number;
  patch: number;
  /** Pre-release label, e.g. "alpha.1" */
  preRelease?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Parse a semver string into a PluginVersion object.
 * Throws if the string does not conform to semver.
 *
 * Парсить рядок semver або кидає помилку, якщо формат некоректний.
 */
export function parseVersion(raw: string): PluginVersion {
  const m = SEMVER_REGEX.exec(raw.trim());
  if (!m) {
    throw new Error(`[versioning] Invalid semver string: "${raw}"`);
  }
  return {
    raw,
    major: parseInt(m[1], 10),
    minor: parseInt(m[2], 10),
    patch: parseInt(m[3], 10),
    preRelease: m[4] ?? undefined,
  };
}

/**
 * Compare two PluginVersion objects numerically.
 * Returns -1 | 0 | 1 following standard comparison semantics.
 *
 * Порівнює дві версії числово; повертає -1, 0 або 1.
 */
function compareVersions(a: PluginVersion, b: PluginVersion): -1 | 0 | 1 {
  for (const key of ["major", "minor", "patch"] as const) {
    if (a[key] < b[key]) return -1;
    if (a[key] > b[key]) return 1;
  }
  return 0;
}

// ── checkCompatibility ────────────────────────────────────────────────────────

/**
 * Check whether a plugin (declaring a minimum required platform version) is
 * compatible with the currently running platform version.
 *
 * Rule: plugin is compatible if platformVersion >= pluginMinVersion
 *       AND the major versions match (no cross-major compat guarantee).
 *
 * Перевіряє, чи platformVersion задовольняє мінімальну вимогу плагіну.
 * Мажорні версії мають збігатися; platformVersion >= minPlatformVersion.
 */
export function checkCompatibility(
  pluginMinVersion: string,
  platformVersion: string,
): boolean {
  try {
    const pluginV = parseVersion(pluginMinVersion);
    const platformV = parseVersion(platformVersion);

    // Major version must match — breaking changes expected across majors
    if (pluginV.major !== platformV.major) return false;

    // Platform must be >= plugin minimum
    return compareVersions(platformV, pluginV) >= 0;
  } catch {
    // Unparseable version strings are treated as incompatible
    return false;
  }
}

// ── VersionCompatibilityStore ─────────────────────────────────────────────────

/**
 * In-memory cache of per-plugin compatibility checks.
 * Keyed by `${pluginId}:${pluginMinVersion}:${platformVersion}`.
 *
 * Кеш результатів перевірки сумісності для кожного плагіну.
 */
export class VersionCompatibilityStore {
  private readonly cache = new Map<string, boolean>();

  private key(pluginId: string, pluginMinVersion: string, platformVersion: string): string {
    return `${pluginId}:${pluginMinVersion}:${platformVersion}`;
  }

  /**
   * Check and cache compatibility for a plugin.
   *
   * Перевіряє та кешує результат сумісності плагіну.
   */
  check(pluginId: string, pluginMinVersion: string, platformVersion: string): boolean {
    const k = this.key(pluginId, pluginMinVersion, platformVersion);
    if (this.cache.has(k)) return this.cache.get(k)!;
    const result = checkCompatibility(pluginMinVersion, platformVersion);
    this.cache.set(k, result);
    return result;
  }

  /**
   * Invalidate cached result for a plugin (call after manifest update).
   *
   * Видаляє кешований результат для плагіну (після оновлення маніфесту).
   */
  invalidate(pluginId: string): void {
    for (const k of this.cache.keys()) {
      if (k.startsWith(`${pluginId}:`)) this.cache.delete(k);
    }
  }

  /** Returns all cached entries as a plain object (for diagnostics). */
  snapshot(): Record<string, boolean> {
    return Object.fromEntries(this.cache.entries());
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global version compatibility store — singleton. */
export const versionCompatibilityStore = new VersionCompatibilityStore();
