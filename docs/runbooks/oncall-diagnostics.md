# Runbook: On-call diagnostics (`ax` CLI)

> The fact-finding runbook. When paged, reach for `ax` first: it collapses the
> distance from "alert paged" to "fact found" into a handful of typed commands.

| Field | Value |
| --- | --- |
| **Owner** | `Platform on-call` |
| **Service area** | `platform` |
| **Severity** | `any (diagnostic, not mitigation)` |
| **Last validated** | `2026-06-13` — see [staleness rule](README.md#practiced-vs-stale) |
| **Status** | `🟢 practiced` |
| **Dashboards** | monitor `http://88.198.199.50:8080/` |
| **Alerts** | n/a — invoked manually during any incident |

## Trigger

You have been paged (any SEV) and need to establish the facts: which service is
down, which source went silent, why an event looked wrong, whether one tenant or
all of them, whether a new alert rule will be noisy, or where today's spend went.

## Confirm / assess

Run the relevant `ax` subcommand below. Each prints a paste-ready report and
exits non-zero only when something is page-worthy (`status === "fail"`), so it
composes in scripts. Add `--json` to pipe structured output into `jq`.

## Diagnostic CLI (`ax`)

Source: [`tools/ax-cli/`](../../tools/ax-cli/) — README with sample output:
[`tools/ax-cli/README.md`](../../tools/ax-cli/README.md). Command registry:
`tools/ax-cli/src/index.ts` (`COMMANDS`).

Reach for these by name, in roughly this order:

1. **`ax doctor`** — checks all services + dependencies. First command after a
   page: shows the health board for gateway/ingest/geo/nlp/verify/alerts/
   metering/tiles and their owned deps (Postgres, Kafka, Redis, vendors). The
   `[FAIL]`/`[WARN]` rows tell you where to look next.
   _(handler: `doctorCommand`)_
2. **`ax source health <name>`** — last seen, latency, error rate for one OSINT
   source. Use when the map looks stale or a feed is suspected silent; mirrors
   the silence/error SLOs from the source-outage runbook.
   _(handler: `sourceHealthCommand`)_
3. **`ax replay event <id>`** — re-runs the full enrichment chain (normalize →
   geocode → classify → danger-score → verify → index) for one event. Use when
   an item was mis-classified, mis-located, or dropped, to see which stage did
   it — without re-ingesting.
   _(handler: `replayEventCommand`)_
4. **`ax tenant inspect <org>`** — usage, plan, and recent activity for one
   tenant. The "is it just them?" check: correlate a customer complaint with
   their plan limits and the tail of their audit log.
   _(handler: `tenantInspectCommand`)_
5. **`ax alert dry-run <rule>`** — previews a rule's matches over the last 30
   days (match count, rate, est. pages/day, recent matches) before it can page
   anyone. Use before shipping or while tuning a noisy rule.
   _(handler: `alertDryRunCommand`)_
6. **`ax cost today`** — daily cost summary across cloud + LLM + saas. Answers
   "did the incident cost us money?" / "why is the LLM bill up?"; warns on a
   daily spend spike.
   _(handler: `costTodayCommand`)_
7. **`ax embeds top <n>`** — top embed referrers by widget loads over 7 days,
   flagging any referrer with an abnormal embed error rate (broken token / CSP /
   expired key).
   _(handler: `embedsTopCommand`)_

## Steps (mitigate)

`ax` is diagnostic, not mitigation. Once it has located the fault, hand off to
the matching scenario runbook:

1. `ax doctor` shows a service/dep `[FAIL]` → its service runbook (or the
   relevant incident-class runbook below).
2. `ax source health` shows a source silent/erroring → [Source outage](../security/source-outage-runbook.md).
3. `ax replay event` shows a wrong classification/score → [AI regression](../security/ai-regression-runbook.md).
4. `ax replay event` / `ax doctor` show wrong-data published → [Data incident](../security/data-incident-runbook.md).
5. `ax tenant inspect` shows abnormal usage / suspected abuse → [DDoS / abuse](../security/ddos-response-runbook.md).

## Verification

Re-run the same `ax` command after mitigation; confirm the previously red rows
are `[ OK ]` and the overall status is no longer `fail` for N consecutive minutes.

## Rollback

None — `ax` is read-only. It performs no mutations against any service.

## Escalation

If `ax doctor` itself errors or cannot reach infra, the diagnostic path is
blind: escalate to the IC and treat as a higher SEV. See
[Incident response (overview)](../security/incident-response-runbook.md).

## Related
- `tools/ax-cli/README.md` — full command reference + sample output
- [Source outage](../security/source-outage-runbook.md)
- [AI regression](../security/ai-regression-runbook.md)
- [Data incident](../security/data-incident-runbook.md)
- [Incident response (overview)](../security/incident-response-runbook.md)
