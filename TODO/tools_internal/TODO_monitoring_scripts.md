# TODO — Monitoring / Diagnostic Scripts

## Goal
Quick-diagnosis scripts the on-call engineer reaches for in incidents.

## Progress
- 0 / 9 done

## Tasks
- [ ] `ax doctor` — checks all services + dependencies
- [ ] `ax source health <name>` — last seen, latency, error rate
- [ ] `ax replay event <id>` — full enrichment chain re-execution
- [ ] `ax tenant inspect <org>` — usage, plan, recent activity
- [ ] `ax alert dry-run <rule>` — preview rule matches over 30d
- [ ] `ax cost today` — daily cost summary across cloud + LLM + saas
- [ ] `ax embeds top <n>` — top embed referrers
- [ ] Per-script README + sample output
- [ ] On-call runbook references these by name

## i18n
- N/A.

### Примітки
The fewer steps from "alert paged" to "fact found", the shorter the incident.
