/**
 * Compare Charts — "this week vs last week" shareable auto-charts.
 *
 * Generates period-over-period comparison chart configs and shareable URLs
 * to drive re-engagement and social sharing of trend data.
 *
 * Авто-графіки порівняння тижнів/місяців/кварталів зі спільними посиланнями.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/** Supported comparison periods. / Підтримувані періоди порівняння. */
export const COMPARE_PERIODS = ["week", "month", "quarter"] as const;

export type ComparePeriod = (typeof COMPARE_PERIODS)[number];

// ── Interfaces ────────────────────────────────────────────────────────────────

export interface CompareChartConfig {
  /** Period type for the comparison. / Тип порівнюваного періоду. */
  period: ComparePeriod;
  /** ISO-8601 start of the reference (current) period. / Початок поточного періоду. */
  currentStart: string;
  /** ISO-8601 start of the baseline (previous) period. / Початок базового періоду. */
  previousStart: string;
  /** Optional AOI filter. / Необов'язковий фільтр AOI. */
  aoiId?: string;
  /** Optional event category. / Необов'язкова категорія подій. */
  category?: string;
  /** Chart display type. / Тип відображення графіка. */
  chartType: "bar" | "line" | "area";
}

export interface ComparePeriodBucket {
  label: string;
  currentCount: number;
  previousCount: number;
  delta: number;
  deltaPercent: number;
}

export interface CompareChartData {
  config: CompareChartConfig;
  buckets: ComparePeriodBucket[];
  totalCurrent: number;
  totalPrevious: number;
  totalDelta: number;
  generatedAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function periodOffsetDays(period: ComparePeriod): number {
  switch (period) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "quarter":
      return 91;
  }
}

function isoDateMinus(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Build a shareable compare-chart URL encoding the config as query params.
 *
 * Формує URL для спільного графіка порівняння.
 */
export function buildCompareChartUrl(
  baseUrl: string,
  params: Omit<CompareChartConfig, "previousStart">,
): string {
  const previous = isoDateMinus(
    params.currentStart,
    periodOffsetDays(params.period),
  );
  const url = new URL(`${baseUrl}/charts/compare`);
  url.searchParams.set("period", params.period);
  url.searchParams.set("current", params.currentStart);
  url.searchParams.set("previous", previous);
  url.searchParams.set("chart", params.chartType);
  if (params.aoiId) url.searchParams.set("aoi", params.aoiId);
  if (params.category) url.searchParams.set("cat", params.category);
  return url.toString();
}

// ── CompareChartStore ─────────────────────────────────────────────────────────

export class CompareChartStore {
  /** Keyed by serialised config. / Ключ: серіалізований конфіг. */
  private readonly cache = new Map<string, CompareChartData>();

  private cacheKey(config: CompareChartConfig): string {
    return [
      config.period,
      config.currentStart,
      config.previousStart,
      config.aoiId ?? "",
      config.category ?? "",
      config.chartType,
    ].join("|");
  }

  /**
   * Store computed chart data.
   *
   * Зберігає обчислені дані графіка.
   */
  set(data: CompareChartData): void {
    this.cache.set(this.cacheKey(data.config), data);
  }

  /**
   * Retrieve cached chart data for a config.
   *
   * Повертає кешовані дані графіка.
   */
  get(config: CompareChartConfig): CompareChartData | undefined {
    return this.cache.get(this.cacheKey(config));
  }

  /**
   * Build a CompareChartConfig resolving previousStart automatically.
   *
   * Будує CompareChartConfig з автоматичним визначенням previousStart.
   */
  buildConfig(
    params: Omit<CompareChartConfig, "previousStart">,
  ): CompareChartConfig {
    return {
      ...params,
      previousStart: isoDateMinus(
        params.currentStart,
        periodOffsetDays(params.period),
      ),
    };
  }
}

// ── Singleton ─────────────────────────────────────────────────────────────────

/** Global compare-chart store. */
export const compareChartStore = new CompareChartStore();
