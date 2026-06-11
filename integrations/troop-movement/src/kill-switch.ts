/**
 * TASK 10 — Misuse kill-switch.
 *
 * If exporters / abuse-monitoring flag a MISUSE SPIKE (e.g. scraping, automated
 * bulk pulls, suspected targeting use), the ENTIRE layer is disabled. This is a
 * fail-closed circuit breaker: once tripped it stays disabled until an operator
 * explicitly clears it (no auto-reset that could silently re-expose the layer).
 */

export interface MisuseSignal {
  /** Reports of suspected misuse within the observation window. */
  flagCount: number;
  /** Length of the observation window, in milliseconds. */
  windowMs: number;
  /** Where the flag came from (exporter id / monitor name). */
  source: string;
}

export interface KillSwitchConfig {
  /** Trip if flags within the window meet or exceed this count. */
  spikeThreshold: number;
  /** Observation window for the spike, in milliseconds. */
  windowMs: number;
}

/** Conservative defaults: 10 misuse flags within 1 hour trips the switch. */
export const DEFAULT_KILL_SWITCH_CONFIG: KillSwitchConfig = {
  spikeThreshold: 10,
  windowMs: 60 * 60_000,
};

export interface LayerDisableFlag {
  layerId: "troop_movement";
  disabled: boolean;
  reason?: string;
  trippedAt?: string;
  clearedAt?: string;
}

/** Pure check: does this signal constitute a misuse spike? */
export function isMisuseSpike(
  signal: MisuseSignal,
  config: KillSwitchConfig = DEFAULT_KILL_SWITCH_CONFIG,
): boolean {
  // Normalise to the configured window so a wider report window can't dilute it.
  const scale = signal.windowMs > 0 ? config.windowMs / signal.windowMs : 1;
  const normalized = signal.flagCount * scale;
  return normalized >= config.spikeThreshold;
}

/**
 * Stateful circuit breaker. Starts ENABLED, but trips permanently-until-cleared
 * on a misuse spike. While tripped, `isEnabled()` returns false (fail-closed).
 */
class TroopMovementKillSwitch {
  private state: LayerDisableFlag = { layerId: "troop_movement", disabled: false };

  constructor(private config: KillSwitchConfig = DEFAULT_KILL_SWITCH_CONFIG) {}

  /** Feed a misuse signal; trips (disables the layer) on a spike. */
  report(signal: MisuseSignal): LayerDisableFlag {
    if (!this.state.disabled && isMisuseSpike(signal, this.config)) {
      this.state = {
        layerId: "troop_movement",
        disabled: true,
        reason: `misuse_spike from ${signal.source} (${signal.flagCount} flags / ${signal.windowMs}ms)`,
        trippedAt: new Date().toISOString(),
      };
    }
    return { ...this.state };
  }

  /** Manually disable (operator action). */
  trip(reason: string): LayerDisableFlag {
    this.state = {
      layerId: "troop_movement",
      disabled: true,
      reason,
      trippedAt: new Date().toISOString(),
    };
    return { ...this.state };
  }

  /** Explicit operator clear — the ONLY way back to enabled. */
  clear(): LayerDisableFlag {
    this.state = {
      layerId: "troop_movement",
      disabled: false,
      clearedAt: new Date().toISOString(),
    };
    return { ...this.state };
  }

  isEnabled(): boolean {
    return !this.state.disabled;
  }

  status(): LayerDisableFlag {
    return { ...this.state };
  }
}

export const troopMovementKillSwitch = new TroopMovementKillSwitch();
