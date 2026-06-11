export type ScoreMetric = {
  slug: "confidence" | "danger" | "anomaly" | "reliability";
  label: string;
  range: string;
  oneLiner: string;
  /** Plain-language explanation, 2–4 paragraphs. */
  plain: string[];
  /** Worked examples. */
  examples: { label: string; explanation: string }[];
  /** Inputs / signal sources that feed the score. */
  inputs: string[];
  /** FAQ pairs. */
  faqs: { q: string; a: string }[];
};

export const SCORE_METRICS: ScoreMetric[] = [
  {
    slug: "confidence",
    label: "Confidence",
    range: "0.0 – 1.0",
    oneLiner: "How sure we are that a reported event happened as described.",
    plain: [
      "Confidence is Aegis Lens's headline quality signal on every event. It combines source count, source diversity, corroboration timing, and verification state into a single decimal between 0 and 1.",
      "A confidence of 0.5 is the threshold at which an event is considered evidenced enough to display on the public map. Confidence ≥ 0.7 is the bar for inclusion in `/incidents`.",
      "Confidence updates as new sources arrive. An event published at 0.45 may move to 0.85 within an hour once two independent sources corroborate it.",
    ],
    examples: [
      {
        label: "Single anonymous Telegram post (0.20)",
        explanation:
          "One source, low reliability, no independent corroboration. Visible internally; not exposed on public surfaces.",
      },
      {
        label: "Two regional outlets agree within 30 minutes (0.65)",
        explanation:
          "Two independent sources, same direction, tight corroboration window. Visible publicly, not yet at incident threshold.",
      },
      {
        label: "Official statement + multiple geolocated photos (0.92)",
        explanation:
          "Primary-source admission plus visual confirmation. Above the threshold for inclusion in syndicated incident feeds.",
      },
    ],
    inputs: [
      "Number of independent sources reporting the event",
      "Source tier (T1 official / T2 reputable media / T3 social)",
      "Time between first and last corroborating source",
      "Verification-state transitions (geolocated, primary-confirmed)",
      "Penalties for retractions or contradictions",
    ],
    faqs: [
      {
        q: "Why doesn't confidence go above 1.0?",
        a: "It's a probability-style scalar normalized to [0, 1]. Capping at 1.0 lets downstream consumers reason about it uniformly without dealing with open-ended values.",
      },
      {
        q: "Can confidence go down?",
        a: "Yes. If a primary source retracts or a corroborating source is found to be a re-share rather than independent, confidence is recomputed downward and the event is re-scored.",
      },
      {
        q: "How does it differ from `verificationState`?",
        a: "verificationState is the categorical state of a single human-verifiable claim (unverified / geolocated / primary-confirmed). confidence is the continuous aggregate over all signals.",
      },
    ],
  },
  {
    slug: "danger",
    label: "Danger",
    range: "0 – 100",
    oneLiner: "Operational severity of an event for civilians and operators in the affected area.",
    plain: [
      "Danger is the field most consumers consult first. It ranges 0–100 and combines casualty potential, infrastructure impact, geographic blast radius, and time-of-day modifiers.",
      "Danger ≥ 70 is `severe`. ≥ 80 is `critical`. ≥ 90 is `mass-casualty`. The `/incidents` page filters to ≥ 70 by default; alerts subscriptions accept a per-region floor.",
      "Danger is calibrated against past observed outcomes — not a per-incident analyst guess. A score of 75 means events scored at that level have historically required civilian shelter response.",
    ],
    examples: [
      {
        label: "Single drone intercept over uninhabited area (12)",
        explanation:
          "No infrastructure impact, no civilian risk, useful for trend tracking but not for alerting.",
      },
      {
        label: "Substation hit in regional capital, ~50k households affected (78)",
        explanation:
          "Severe infrastructure impact, multi-day civilian effect. Triggers civilian-alert layer.",
      },
      {
        label: "Apartment building strike confirmed, multiple casualties (94)",
        explanation:
          "Mass-casualty class. Triggers maximum-priority routing across all subscription channels.",
      },
    ],
    inputs: [
      "Estimated casualty range from open-source reporting",
      "Infrastructure class affected (residential / energy / industrial)",
      "Geographic blast radius",
      "Time-of-day modifier (residential events are weighted higher overnight)",
      "Confirmed-vs-projected damage",
    ],
    faqs: [
      {
        q: "Is danger a casualty count?",
        a: "No. It's a calibrated severity score. A casualty count, when known, is a separate field on the event record.",
      },
      {
        q: "Does danger include long-tail effects (e.g., loss of heat in winter)?",
        a: "Yes. Time-of-year and infrastructure-class modifiers capture cascading civilian effects beyond the immediate kinetic moment.",
      },
    ],
  },
  {
    slug: "anomaly",
    label: "Anomaly",
    range: "0.0 – 1.0",
    oneLiner: "How unusual an event or signal is, relative to recent baselines.",
    plain: [
      "Anomaly is a derived score that says: this is unusual for this region, this class, this time window. Useful for analysts looking for trend changes rather than absolute severity.",
      "An anomaly score of 0.9 means the observed rate or composition deviates substantially from the 30-day baseline. An analyst should look.",
      "Anomaly is published on aggregate signals (region × class × hour buckets) — not on individual events.",
    ],
    examples: [
      {
        label: "Routine drone activity in a regularly-active oblast (0.10)",
        explanation:
          "Consistent with baseline. Nothing for an analyst to chase.",
      },
      {
        label: "Cyber incidents in a normally-quiet country triple within 24h (0.87)",
        explanation:
          "Clear deviation from baseline. Worth a triage call.",
      },
    ],
    inputs: [
      "Rolling 30-day baseline per region × class",
      "Hour-of-day and day-of-week seasonality",
      "Cluster composition shifts (class mix changes)",
      "Source-flow rate (sudden burst of new sources)",
    ],
    faqs: [
      {
        q: "Does anomaly = bad?",
        a: "No. Anomaly is direction-agnostic. A sudden absence of expected events is just as anomalous as a sudden surge.",
      },
    ],
  },
  {
    slug: "reliability",
    label: "Reliability",
    range: "0.0 – 1.0",
    oneLiner: "Per-source historical track record of accurate reporting.",
    plain: [
      "Reliability is a per-source rolling score. It rewards sources whose past claims have been independently corroborated, and penalizes those whose past claims have been retracted or contradicted.",
      "Reliability feeds directly into confidence: an event sourced from reliability-0.9 outlets gets a much higher prior than the same wording from a reliability-0.3 account.",
      "Reliability is visible on every source detail page and can be filtered in the `/sources` directory.",
    ],
    examples: [
      {
        label: "Established wire service with multi-year track record (0.95)",
        explanation:
          "Long history of corroborated reporting. Heavy weight on confidence contributions.",
      },
      {
        label: "Anonymous Telegram account with mixed history (0.40)",
        explanation:
          "Some confirmed reports, several retractions. Counts toward corroboration but at reduced weight.",
      },
      {
        label: "New source with no track record (0.50)",
        explanation:
          "Default prior. Climbs or falls with each new published claim.",
      },
    ],
    inputs: [
      "Number of published claims",
      "Confirmation rate against independent corroboration",
      "Retraction rate",
      "Latency from event to publication (faster sources without sacrificing accuracy score higher)",
      "Editorial-process disclosure (where applicable)",
    ],
    faqs: [
      {
        q: "Can a source's reliability be appealed?",
        a: "Yes. Source operators can submit corrections via /contact; we re-score on receipt of new evidence. See /trust/corrections for the public log.",
      },
    ],
  },
];

export function getScoreMetric(slug: string): ScoreMetric | null {
  return SCORE_METRICS.find((m) => m.slug === slug) ?? null;
}

export function listScoreMetrics(): ScoreMetric[] {
  return SCORE_METRICS.slice();
}
