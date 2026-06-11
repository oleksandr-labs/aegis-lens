/**
 * Length overflow detection for localized strings.
 *
 * Ukrainian strings are typically 20-40% longer than English.
 * Flag strings that would overflow fixed-width UI components.
 */

export interface LengthOverflowConfig {
  /** Warn if target is this much longer than source (fraction: 0.4 = 40%). Default: 0.5 */
  warnFraction: number;
  /** Error if target is this much longer than source. Default: 0.8 */
  errorFraction: number;
  /** Minimum source length to check (avoid flagging short strings). Default: 10 */
  minSourceLength: number;
}

export interface LengthOverflow {
  key: string;
  sourceLen: number;
  targetLen: number;
  overflowFraction: number;
  severity: "warn" | "error";
}

const DEFAULTS: LengthOverflowConfig = {
  warnFraction: 0.5,
  errorFraction: 0.8,
  minSourceLength: 10,
};

export function checkLengthOverflows(
  source: Record<string, string>,
  target: Record<string, string>,
  locale: string,
  config: Partial<LengthOverflowConfig> = {},
): LengthOverflow[] {
  const cfg = { ...DEFAULTS, ...config };
  const overflows: LengthOverflow[] = [];

  for (const [key, sourceVal] of Object.entries(source)) {
    const targetVal = target[key];
    if (!targetVal) continue;
    if (sourceVal.length < cfg.minSourceLength) continue;

    const overflowFraction = (targetVal.length - sourceVal.length) / sourceVal.length;

    if (overflowFraction >= cfg.errorFraction) {
      overflows.push({ key, sourceLen: sourceVal.length, targetLen: targetVal.length, overflowFraction, severity: "error" });
    } else if (overflowFraction >= cfg.warnFraction) {
      overflows.push({ key, sourceLen: sourceVal.length, targetLen: targetVal.length, overflowFraction, severity: "warn" });
    }
  }

  return overflows.sort((a, b) => b.overflowFraction - a.overflowFraction);
}
