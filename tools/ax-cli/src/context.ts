/**
 * Builds the `DiagnosticContext` handed to every command.
 *
 * Будує `DiagnosticContext`, що передається кожній команді.
 *
 * This is the seam between the CLI and infrastructure. By default it returns a
 * context backed by `StubDataSources` (laptop-runnable). To run against a real
 * environment, replace the `sources` here with production adapters — every
 * command depends only on the `DataSources` port, so nothing else changes.
 */

import type { DiagnosticContext } from "./types";
import { StubDataSources } from "./stubs";

export interface ContextOptions {
  env?: DiagnosticContext["env"];
  /** Override "now" for deterministic output (tests, snapshots). */
  now?: Date;
}

export function buildContext(opts: ContextOptions = {}): DiagnosticContext {
  const env = opts.env ?? (process.env.AX_ENV as DiagnosticContext["env"]) ?? "prod";
  const now = opts.now ?? new Date();
  return {
    env,
    now,
    // PROD WIRING: replace with real adapters, e.g.
    //   sources: new LiveDataSources({ pg, redis, kafka, prom, stripe, llm })
    sources: new StubDataSources(now),
  };
}
