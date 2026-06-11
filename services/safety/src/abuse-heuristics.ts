/**
 * Account abuse heuristics — detect scraping, rate-limit evasion, alt-account farms.
 *
 * These checks run on the API gateway and can flag or throttle suspicious clients.
 */

export type AbuseSignal =
  | "high_request_rate"     // >10× expected usage for tier
  | "systematic_enumeration" // sequential IDs / coordinates
  | "download_all"          // fetching entire dataset in one session
  | "agent_rotation"        // rapid user-agent rotation
  | "export_velocity"       // many exports in short window
  | "api_key_sharing"       // same key from many IPs
  | "alt_account_pattern";  // multiple accounts from same IP/fingerprint

export type AbuseAction = "allow" | "warn" | "throttle" | "block";

export interface AbuseEvaluation {
  action: AbuseAction;
  signals: AbuseSignal[];
  confidence: number;
  /** If throttled: ms to wait before next request */
  retryAfterMs?: number;
}

export interface RequestContext {
  ip: string;
  userId?: string;
  orgId?: string;
  tier: "free" | "pro" | "enterprise" | "public";
  /** Requests in last 60s */
  requestsPerMinute: number;
  /** Exports in last 24h */
  exportsToday: number;
  /** Distinct IPs for this API key in last 24h */
  distinctIpsForKey?: number;
  /** Distinct user-agents in last 10 minutes */
  distinctUAsLastTenMin?: number;
  /** Are request IDs/coords sequential? */
  requestPattern?: "sequential" | "random" | "unknown";
}

const TIER_RATE_LIMITS: Record<string, number> = {
  public:     5,
  free:       60,
  pro:        600,
  enterprise: 6000,
};

const TIER_EXPORT_LIMITS: Record<string, number> = {
  public:     0,
  free:       5,
  pro:        100,
  enterprise: 1000,
};

export function evaluateAbuse(ctx: RequestContext): AbuseEvaluation {
  const signals: AbuseSignal[] = [];

  const rateLimit = TIER_RATE_LIMITS[ctx.tier] ?? 60;
  const exportLimit = TIER_EXPORT_LIMITS[ctx.tier] ?? 5;

  if (ctx.requestsPerMinute > rateLimit * 2) {
    signals.push("high_request_rate");
  }

  if (ctx.requestPattern === "sequential") {
    signals.push("systematic_enumeration");
  }

  if (ctx.exportsToday > exportLimit * 3) {
    signals.push("download_all");
    signals.push("export_velocity");
  } else if (ctx.exportsToday > exportLimit) {
    signals.push("export_velocity");
  }

  if ((ctx.distinctUAsLastTenMin ?? 0) > 5) {
    signals.push("agent_rotation");
  }

  if ((ctx.distinctIpsForKey ?? 0) > 10) {
    signals.push("api_key_sharing");
  }

  const confidence = Math.min(1, signals.length / 3);
  let action: AbuseAction;

  if (signals.length === 0) {
    action = "allow";
  } else if (signals.includes("high_request_rate") && signals.length >= 2) {
    action = "block";
  } else if (signals.length >= 2 || signals.includes("download_all")) {
    action = "throttle";
  } else {
    action = "warn";
  }

  return {
    action,
    signals,
    confidence,
    retryAfterMs: action === "throttle" ? 5000 : undefined,
  };
}
