export interface ParsedRule {
  eventClasses?: string[];
  subclasses?: string[];
  minSeverity?: 1 | 2 | 3;
  minConfidence?: number;
  geo?: {
    placeName: string;
    lat?: number;
    lon?: number;
    radiusKm: number;
  };
  sources?: string[];
  timeWindow?: {
    kind: "recurring" | "one_time";
    daysOfWeek?: number[];
    startTime?: string;
    endTime?: string;
  };
  channels?: string[];
  keywords?: string[];
}

export interface ParseResult {
  rule: ParsedRule;
  /** Human-readable translation: "You will be alerted when…" */
  preview: string;
  /** 0–1 confidence in the parse quality */
  confidence: number;
  /** The NL input that was parsed */
  input: string;
  /** Suggestions when confidence is low */
  suggestions?: string[];
}

export interface DryRunResult {
  matchCount: number;
  sampleMatches: {
    eventId: string;
    summary: string;
    occurredAt: string;
    severity: number;
  }[];
  periodDays: number;
  estimatedDailyAlerts: number;
  isNoisy: boolean;
  refinementSuggestion?: string;
}

export interface PersoanaRuleTemplate {
  persona: string;
  title: string;
  description: string;
  nlText: string;
  rule: ParsedRule;
}
