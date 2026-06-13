# TODO — Monitoring / Diagnostic Scripts

## Goal
Quick-diagnosis scripts the on-call engineer reaches for in incidents.

## Progress
- 9 / 9 done

## Tasks
- [x] `ax doctor` — checks all services + dependencies — tools/ax-cli/src/commands/doctor.ts (doctorCommand)
- [x] `ax source health <name>` — last seen, latency, error rate — tools/ax-cli/src/commands/source-health.ts (sourceHealthCommand)
- [x] `ax replay event <id>` — full enrichment chain re-execution — tools/ax-cli/src/commands/replay-event.ts (replayEventCommand)
- [x] `ax tenant inspect <org>` — usage, plan, recent activity — tools/ax-cli/src/commands/tenant-inspect.ts (tenantInspectCommand)
- [x] `ax alert dry-run <rule>` — preview rule matches over 30d — tools/ax-cli/src/commands/alert-dry-run.ts (alertDryRunCommand)
- [x] `ax cost today` — daily cost summary across cloud + LLM + saas — tools/ax-cli/src/commands/cost-today.ts (costTodayCommand)
- [x] `ax embeds top <n>` — top embed referrers — tools/ax-cli/src/commands/embeds-top.ts (embedsTopCommand)
- [x] Per-script README + sample output — tools/ax-cli/README.md (sample output)
- [x] On-call runbook references these by name — docs/runbooks/oncall-diagnostics.md (Diagnostic CLI (`ax`))

## i18n
- N/A.

### Примітки
The fewer steps from "alert paged" to "fact found", the shorter the incident.
