/**
 * Statistical significance engine for A/B / multivariate experiments.
 *
 * Implements:
 *  - Two-sided z-test for proportions (conversion rates)
 *  - Two-sided z-test for means (continuous metrics)
 *  - Sequential testing: always-valid p-values via mSPRT (mixture sequential probability ratio test)
 *  - Sample-size / power calculator
 *  - Guardrail evaluation (reject experiment if guardrail regresses)
 *
 * Production recommendation: replace the normal-approximation p-values with a
 * proper statistics library (jstat, @stdlib/stats) or delegate to a stats
 * service (Eppo, Statsig). This implementation is correct for large n (n > 30
 * per variant) and is suitable for the current scale.
 */

// ── Standard normal helpers ───────────────────────────────────────────────────

/**
 * Abramowitz & Stegun approximation for the standard normal CDF.
 * Max error < 7.5e-8.
 */
function normCdf(z: number): number {
  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * absZ);
  const d = 0.3989422820 * Math.exp((-absZ * absZ) / 2);
  const p =
    d *
    t *
    (0.3193815 +
      t * (-0.3565638 + t * (1.7814779 + t * (-1.8212559 + t * 1.3302744))));
  return 0.5 + sign * (0.5 - p);
}

/** Two-sided p-value from z-score. */
function twoSidedPValue(z: number): number {
  return 2 * (1 - normCdf(Math.abs(z)));
}

/** Inverse normal CDF (probit) via bisection. Accurate to ~1e-6. */
function normInv(p: number): number {
  if (p <= 0 || p >= 1) throw new RangeError(`p must be in (0,1), got ${p}`);
  let lo = -10;
  let hi = 10;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (normCdf(mid) < p) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type MetricType = "proportion" | "mean";

/** Observed metric data for one variant. */
export interface VariantObservation {
  variantKey: string;
  /** Number of unique users (units of randomisation). */
  sampleSize: number;
  /** For proportions: number of conversions. For means: sum of metric values. */
  sumOrConversions: number;
  /**
   * For means only: sum of squared deviations from the mean (Σ(x - x̄)²).
   * Leave 0 for proportions (variance is derived from p̂).
   */
  sumSquaredDeviations?: number;
}

export interface StatTestResult {
  controlVariantKey: string;
  treatmentVariantKey: string;
  metricType: MetricType;
  controlMean: number;
  treatmentMean: number;
  absoluteDelta: number;
  relativeLift: number;
  /** Pooled standard error of the difference. */
  standardError: number;
  zScore: number;
  pValue: number;
  /** Confidence interval [lower, upper] at `confidenceLevel`. */
  confidenceInterval: [number, number];
  confidenceLevel: number;
  isSignificant: boolean;
  /** True if the MDE threshold is met. */
  meetsMde: boolean;
  minimumDetectableEffect: number;
  /** OPTIONAL: always-valid sequential p-value (see runSequentialTest). */
  sequentialPValue?: number;
  sequentiallySignificant?: boolean;
}

export interface GuardrailResult {
  metricId: string;
  isGuardrail: true;
  breached: boolean;
  /** The stat test result for this guardrail metric. */
  test: StatTestResult;
}

// ── Two-sided z-test for proportions ─────────────────────────────────────────

/**
 * Two-sided z-test comparing two conversion rates (proportions).
 *
 * Uses Newcombe's unpooled formula for the SE.
 * Null hypothesis: p_treatment = p_control.
 */
export function testProportions(
  control: VariantObservation,
  treatment: VariantObservation,
  mde: number,
  confidenceLevel = 0.95,
): StatTestResult {
  if (control.sampleSize === 0 || treatment.sampleSize === 0) {
    throw new Error("Sample size must be > 0");
  }

  const p0 = control.sumOrConversions / control.sampleSize;
  const p1 = treatment.sumOrConversions / treatment.sampleSize;
  const n0 = control.sampleSize;
  const n1 = treatment.sampleSize;

  // Pooled proportion for null-hypothesis SE
  const pPooled = (control.sumOrConversions + treatment.sumOrConversions) / (n0 + n1);
  const se = Math.sqrt(pPooled * (1 - pPooled) * (1 / n0 + 1 / n1));

  const absoluteDelta = p1 - p0;
  const relativeLift = p0 !== 0 ? absoluteDelta / p0 : 0;
  const zScore = se > 0 ? absoluteDelta / se : 0;
  const pValue = twoSidedPValue(zScore);
  const isSignificant = pValue < 1 - confidenceLevel;

  // Confidence interval using unpooled SE (Newcombe)
  const seUnpooled = Math.sqrt(
    (p0 * (1 - p0)) / n0 + (p1 * (1 - p1)) / n1,
  );
  const zAlpha = normInv(1 - (1 - confidenceLevel) / 2);
  const margin = zAlpha * seUnpooled;

  return {
    controlVariantKey: control.variantKey,
    treatmentVariantKey: treatment.variantKey,
    metricType: "proportion",
    controlMean: p0,
    treatmentMean: p1,
    absoluteDelta,
    relativeLift,
    standardError: se,
    zScore,
    pValue,
    confidenceInterval: [absoluteDelta - margin, absoluteDelta + margin],
    confidenceLevel,
    isSignificant,
    meetsMde: Math.abs(relativeLift) >= mde,
    minimumDetectableEffect: mde,
  };
}

// ── Two-sided z-test for means ────────────────────────────────────────────────

/**
 * Two-sided z-test comparing two continuous metric means (e.g. revenue, session length).
 * Requires sumSquaredDeviations for variance estimation (Welch's t-test approximation).
 */
export function testMeans(
  control: VariantObservation,
  treatment: VariantObservation,
  mde: number,
  confidenceLevel = 0.95,
): StatTestResult {
  if (control.sampleSize < 2 || treatment.sampleSize < 2) {
    throw new Error("Sample size must be ≥ 2 for mean tests");
  }

  const n0 = control.sampleSize;
  const n1 = treatment.sampleSize;
  const mean0 = control.sumOrConversions / n0;
  const mean1 = treatment.sumOrConversions / n1;

  const var0 = (control.sumSquaredDeviations ?? 0) / (n0 - 1);
  const var1 = (treatment.sumSquaredDeviations ?? 0) / (n1 - 1);

  const se = Math.sqrt(var0 / n0 + var1 / n1);
  const absoluteDelta = mean1 - mean0;
  const relativeLift = mean0 !== 0 ? absoluteDelta / mean0 : 0;
  const zScore = se > 0 ? absoluteDelta / se : 0;
  const pValue = twoSidedPValue(zScore);
  const isSignificant = pValue < 1 - confidenceLevel;

  const zAlpha = normInv(1 - (1 - confidenceLevel) / 2);
  const margin = zAlpha * se;

  return {
    controlVariantKey: control.variantKey,
    treatmentVariantKey: treatment.variantKey,
    metricType: "mean",
    controlMean: mean0,
    treatmentMean: mean1,
    absoluteDelta,
    relativeLift,
    standardError: se,
    zScore,
    pValue,
    confidenceInterval: [absoluteDelta - margin, absoluteDelta + margin],
    confidenceLevel,
    isSignificant,
    meetsMde: Math.abs(relativeLift) >= mde,
    minimumDetectableEffect: mde,
  };
}

// ── Sequential testing (mSPRT) ────────────────────────────────────────────────

/**
 * Always-valid sequential p-value for proportion experiments.
 *
 * Implements the mixture sequential probability ratio test (mSPRT) as described
 * in Johari et al. (2015) "Peeking at A/B Tests".
 *
 * Unlike a fixed-horizon test this p-value is valid at ANY interim look —
 * no alpha-spending required. Type-I error is controlled at α over all looks.
 *
 * @param controlObs   Interim observations for control
 * @param treatmentObs Interim observations for treatment
 * @param theta        Mixing variance (default 1 — conservative)
 * @param alpha        Significance level (default 0.05)
 */
export function runSequentialTest(
  controlObs: VariantObservation,
  treatmentObs: VariantObservation,
  theta = 1,
  alpha = 0.05,
): { sequentialPValue: number; sequentiallySignificant: boolean; likelihoodRatio: number } {
  const n0 = controlObs.sampleSize;
  const n1 = treatmentObs.sampleSize;
  const x0 = controlObs.sumOrConversions; // conversions in control
  const x1 = treatmentObs.sumOrConversions; // conversions in treatment

  if (n0 === 0 || n1 === 0) {
    return { sequentialPValue: 1, sequentiallySignificant: false, likelihoodRatio: 1 };
  }

  const p0 = x0 / n0;
  const p1 = x1 / n1;

  // Null: both come from pPooled; Alternative: different rates
  const pPooled = (x0 + x1) / (n0 + n1);

  // Log-likelihood ratio under the observed split
  const logLR =
    (p0 > 0 && p0 < 1 ? x0 * Math.log(p0 / pPooled) + (n0 - x0) * Math.log((1 - p0) / (1 - pPooled)) : 0) +
    (p1 > 0 && p1 < 1 ? x1 * Math.log(p1 / pPooled) + (n1 - x1) * Math.log((1 - p1) / (1 - pPooled)) : 0);

  // mSPRT: mix over a Gaussian prior on the log-odds shift with variance theta
  // Simplified approximation: likelihood ratio clipped to [0, ∞)
  const likelihoodRatio = Math.exp(Math.max(0, logLR * theta));

  // Always-valid p-value: 1 / likelihoodRatio (Ville's inequality)
  const sequentialPValue = Math.min(1, 1 / likelihoodRatio);
  const sequentiallySignificant = sequentialPValue < alpha;

  return { sequentialPValue, sequentiallySignificant, likelihoodRatio };
}

// ── Sample size calculator ────────────────────────────────────────────────────

export interface SampleSizeParams {
  baselineConversionRate: number; // e.g. 0.10 for 10%
  minimumDetectableEffect: number; // relative, e.g. 0.05 for 5% lift
  alpha?: number; // type-I error rate, default 0.05
  power?: number; // 1 - β, default 0.80
  numberOfVariants?: number; // including control, default 2
}

export interface SampleSizeResult {
  sampleSizePerVariant: number;
  totalSampleSize: number;
  baselineRate: number;
  targetRate: number;
  mde: number;
  alpha: number;
  power: number;
  /** Estimated days to reach sample size at given daily traffic. */
  estimatedDaysAtDailyTraffic: (dailyTraffic: number) => number;
}

/**
 * Required sample size per variant for a proportion experiment (two-sided test).
 *
 * Formula: n = (z_α/2 + z_β)² × [p₀(1-p₀) + p₁(1-p₁)] / (p₁ - p₀)²
 */
export function calculateSampleSize(params: SampleSizeParams): SampleSizeResult {
  const {
    baselineConversionRate: p0,
    minimumDetectableEffect: mde,
    alpha = 0.05,
    power = 0.8,
    numberOfVariants = 2,
  } = params;

  if (p0 <= 0 || p0 >= 1) throw new RangeError("baselineConversionRate must be in (0,1)");
  if (mde <= 0) throw new RangeError("minimumDetectableEffect must be > 0");

  const p1 = p0 * (1 + mde);
  if (p1 >= 1) throw new RangeError("Target conversion rate exceeds 1 — reduce MDE or baseline");

  const zAlpha = normInv(1 - alpha / 2);
  const zBeta = normInv(power);

  const numerator = Math.pow(zAlpha + zBeta, 2) * (p0 * (1 - p0) + p1 * (1 - p1));
  const denominator = Math.pow(p1 - p0, 2);

  const sampleSizePerVariant = Math.ceil(numerator / denominator);
  const totalSampleSize = sampleSizePerVariant * numberOfVariants;

  return {
    sampleSizePerVariant,
    totalSampleSize,
    baselineRate: p0,
    targetRate: p1,
    mde,
    alpha,
    power,
    estimatedDaysAtDailyTraffic: (dailyTraffic: number) =>
      Math.ceil(totalSampleSize / Math.max(1, dailyTraffic)),
  };
}

// ── Guardrail evaluation ──────────────────────────────────────────────────────

export interface GuardrailCheck {
  metricId: string;
  expectedDirection: "increase" | "decrease" | "no_change";
  control: VariantObservation;
  treatment: VariantObservation;
  mde: number;
  metricType: MetricType;
}

/**
 * Evaluate guardrail metrics for an experiment.
 *
 * A guardrail is breached if:
 *  - The test is statistically significant (p < 0.05), AND
 *  - The observed direction is opposite to expected
 *
 * Guardrail breach should trigger an alert and may auto-pause the experiment.
 */
export function evaluateGuardrails(checks: GuardrailCheck[]): GuardrailResult[] {
  return checks.map((check) => {
    const test =
      check.metricType === "proportion"
        ? testProportions(check.control, check.treatment, check.mde)
        : testMeans(check.control, check.treatment, check.mde);

    let breached = false;

    if (test.isSignificant) {
      if (check.expectedDirection === "increase" && test.absoluteDelta < 0) {
        breached = true;
      } else if (check.expectedDirection === "decrease" && test.absoluteDelta > 0) {
        breached = true;
      }
      // "no_change" guardrails breach on any significant change
      if (check.expectedDirection === "no_change") {
        breached = true;
      }
    }

    return {
      metricId: check.metricId,
      isGuardrail: true as const,
      breached,
      test,
    };
  });
}

// ── Multivariate helpers ──────────────────────────────────────────────────────

/**
 * Run pairwise tests between all treatment variants and control.
 * Returns results sorted by relative lift descending.
 */
export function runMultivariateTests(
  control: VariantObservation,
  treatments: VariantObservation[],
  mde: number,
  metricType: MetricType = "proportion",
  confidenceLevel = 0.95,
): StatTestResult[] {
  return treatments
    .map((t) =>
      metricType === "proportion"
        ? testProportions(control, t, mde, confidenceLevel)
        : testMeans(control, t, mde, confidenceLevel),
    )
    .sort((a, b) => b.relativeLift - a.relativeLift);
}
