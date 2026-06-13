# `ax` — Aegis Lens on-call diagnostic CLI

> The subcommands an on-call engineer reaches for during an incident. The fewer
> steps from "alert paged" to "fact found", the shorter the incident.

`ax` is a thin, typed CLI over a single `DataSources` port. Every subcommand is
a `CommandHandler<Args, Result>` that returns a uniform `CommandResult`
(`status` / `headline` / `human` / `data` / `elapsedMs`). The shell renders
`human` to the terminal, or `--json` for piping into `jq`, and exits non-zero
when `status === "fail"` so it composes in scripts and CI gates.

```
usage: ax <command> [args] [--json] [--env=prod|staging|dev]
```

| Command | Purpose | Symbol |
| --- | --- | --- |
| `ax doctor` | checks all services + dependencies | `doctorCommand` |
| `ax source health <name>` | last seen, latency, error rate | `sourceHealthCommand` |
| `ax replay event <id>` | full enrichment chain re-execution | `replayEventCommand` |
| `ax tenant inspect <org>` | usage, plan, recent activity | `tenantInspectCommand` |
| `ax alert dry-run <rule>` | preview rule matches over 30d | `alertDryRunCommand` |
| `ax cost today` | daily cost across cloud + LLM + saas | `costTodayCommand` |
| `ax embeds top <n>` | top embed referrers | `embedsTopCommand` |

## Architecture

- `src/types.ts` — the command contract (`CommandResult`, `CommandHandler`,
  `CommandSpec`) and the `DataSources` port every command depends on.
- `src/stubs.ts` — `StubDataSources`, a fully-typed in-memory implementation so
  the CLI is runnable on a laptop during a drill. Swap for live adapters
  (`pg` / `ioredis` / `kafkajs` / `prom-client` / `stripe`) in `context.ts`.
- `src/context.ts` — `buildContext()`, the single injection seam.
- `src/commands/*.ts` — one module per command, each exporting a typed handler.
- `src/index.ts` — the `COMMANDS` registry + `resolveCommand` / `runCommand`.
- `src/cli.ts` — the argv shell (`--json`, `--env`, `--help`, exit codes).

Run a command:

```sh
pnpm --filter @ua-map/ax-cli exec ts-node src/cli.ts doctor
# or, after build:
ax source health deepstatemap
```

---

## Sample output

### `ax doctor`

```
ax doctor — env=prod

status  service   dependency            latency  detail
------  --------  --------------------  -------  ------------------------------
[ OK ]  gateway   edge                  12ms     200s nominal, p95 41ms
[ OK ]  ingest    kafka:usage.events    28ms     lag 1.2k msgs, consuming
[ OK ]  geo       —                     64ms     geocoder warm, cache hit 91%
[WARN]  nlp       llm:claude            870ms    p95 elevated (provider slow)
[ OK ]  verify    —                     110ms    eval suite green
[ OK ]  alerts    redis                 7ms      throttle keys nominal
[ OK ]  metering  postgres:primary      19ms     reconcile lag 4m
[FAIL]  tiles     maptiler              —        vendor 5xx, breaker OPEN

2/8 services need attention (worst: FAIL)
```

### `ax source health <name>`

```
ax source health deepstatemap — env=prod

status  metric       value
------  -----------  --------------------------
[WARN]  last seen    2h 22m ago (142m silent)
[ OK ]  latency p50  510ms
[ OK ]  latency p95  2100ms
[FAIL]  error rate   7.1% over 60m

DeepStateMAP: FAIL (silent 142m, err 7.1%)
```

### `ax replay event <id>`

```
ax replay event evt_9a3f — env=prod
source=alerts-in-ua  received=2026-06-13T...Z
raw: Повітряна тривога в Харківській області. Загроза балістики.

status  stage         service  latency  note
------  ------------  -------  -------  --------------------------------------------
[ OK ]  normalize     ingest   14ms     parsed source=alerts-in-ua, lang=uk
[ OK ]  geocode       geo      73ms     matched 'Харківська область' -> oblast centroid
[ OK ]  classify      nlp      612ms    class=air_threat subclass=ballistic conf=0.88
[ OK ]  danger-score  nlp      31ms     danger_score=0.74
[WARN]  verify        verify   144ms    single-source; corroboration pending
[ OK ]  index         ingest   22ms     written to canonical store + search

Replay evt_9a3f: WARN through 6 stages (896ms)
```

### `ax tenant inspect <org>`

```
ax tenant inspect org_kyiv_desk — env=prod
Kyiv Investigations Desk  (org_kyiv_desk)
plan=business  seats=12  created=2025-11-02T09:14:00.000Z (223d ago)

Usage this period:
product          units
---------------  ---------
api_calls        184,220
events_ingested  2,140,900
ai_tokens        9,820,000
copilot_queries  412
exports          38

Recent activity:
when       actor         action
---------  ------------  ----------------------------------------------
4m ago     n.kovalenko   ran copilot query 'drone strikes Odesa 24h'
51m ago    system        alert rule 'ballistic-kharkiv' fired -> 3 deliveries
3h 10m ago a.bondar      exported AOI report (PDF)

Kyiv Investigations Desk — plan=business seats=12 age=223d
```

### `ax alert dry-run <rule>`

```
ax alert dry-run ballistic-kharkiv — env=prod
rule=rule_8f21 org=org_kyiv_desk
condition={"eventClass":"air_threat","minDangerScore":0.6,"keyword":"балістик"}
window=30d  evaluated=120  matched=8  est=0.3/day

Most recent matches:
at                    class       danger  conf  summary
--------------------  ----------  ------  ----  ----------------------
2026-06-13T...Z       air_threat  0.91    0.90  Загроза балістики, Харків
2026-06-11T...Z       air_threat  0.82    0.70  Загроза балістики, Харків
...

Rule 'ballistic-kharkiv': 8/120 match (6.7%), ~0.3/day
```

### `ax cost today`

```
ax cost today — day=2026-06-13 env=prod

By category:
category  total     share
--------  --------  -----
cloud     $6.70     38%
llm       $85.50    49%
saas      $19.90    13%

Line items (desc):
cat    vendor                      cost     driver
-----  --------------------------  -------  --------------------
llm    Anthropic Claude            $76.40   9820 1K tokens
saas   Mapbox/MapTiler             $11.50   88 tile-loads-K
llm    embeddings (HF inference)   $9.10    14200 1K tokens
...

TOTAL $112.10
```

### `ax embeds top <n>`

```
ax embeds top 5 — window=7d env=prod

status  #  domain                  loads    widgets  err%
------  -  ----------------------  -------  -------  -----
[ OK ]  1  kyivindependent.com     48,210   6        0.2%
[ OK ]  2  pravda.com.ua           31,905   4        0.1%
[ OK ]  3  nv.ua                   22,140   3        0.0%
[FAIL]  4  embed-test.localhost    9,400    1        21.4%
[ OK ]  5  suspilne.media          7,780    2        0.4%

total loads across all referrers: 119,435
Top 5 embed referrers (7d): kyivindependent.com leads with 48,210 loads
NOTE: a referrer shows an elevated embed error rate — check token/CSP for it.
```

---

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | command ran; status `ok` / `warn` / `unknown` |
| `1` | command ran; status `fail` (page-worthy) |
| `2` | usage error / unknown command / arg-parse failure |
