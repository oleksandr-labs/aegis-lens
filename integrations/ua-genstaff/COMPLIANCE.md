# COMPLIANCE — `@ua-map/ua-genstaff` (UA General Staff + MoD + branches)

## Sources (official, highest trust tier — PUBLIC output only)

- **Генеральний штаб ЗСУ** (General Staff of the Armed Forces of Ukraine) —
  the standardized daily operational summary ("оперативна інформація" /
  "Загальні бойові втрати противника"), published on the official Facebook page
  and mirrored to Telegram.
- **Міністерство оборони України / MoD** (`mil.gov.ua` / `mod.gov.ua`) — press
  releases on the official site + Telegram channel.
- **Повітряні Сили ЗСУ** (Air Force Command) — operational missile/drone threat
  posts, via Telegram.
- **Військово-Морські Сили ЗСУ** (Navy Command) — Black Sea / naval-threat
  statements, via Telegram.
- **Official spokespersons** per branch (`spokespersons.ts`) — official statement
  accounts, tracked by ROLE (not personal name) so the registry survives
  personnel changes.

All handles in `sources.ts` / `spokespersons.ts` are a CONFIG registry following
each authority's documented public naming. Unverified handles are marked
`official: false` and are GATED in live mode; verify against the authority's own
site/channel before enabling in production.

## Neutrality (THE defining constraint for this source)

Official military communications are the **highest trust tier**, but this
package is deliberately **NEUTRAL**: it **presents** official claims, it does not
**editorialise** them.

- **Loss tallies travel as structured data**, never baked into a human-facing
  title/summary as a fact-claim by us. `summary-parser.ts` extracts figures
  VERBATIM; unparseable numbers are dropped and `partial` is set — we never
  guess or round. The adapter carries them in `rawPayload` with
  `framing: "official_reported_figures"`.
- Every figure surfaced in the widget / API is labelled **"as officially
  reported"** and carries a source citation.
- `verificationState` is set to `"in_review"` (official source, NOT asserted
  independently verified). Downstream verification workflows decide otherwise.
- `divergence.ts` reports official-vs-OSINT gaps **neutrally** — official and
  OSINT use different methodologies (official tally vs visually-confirmed
  losses); a divergence is explicitly NOT a claim that either side is wrong, and
  a standing disclaimer is emitted with every report.
- `airalert-correlation.ts` describes the RELATIONSHIP between two official
  signals (Air Force threat post vs civilian air-raid layer) without ruling one
  correct.

## License / republication terms

- These are official Ukrainian government communications. Under Ukrainian law
  (Law «Про доступ до публічної інформації») official public information may be
  reused. Press output is published for public awareness.
- **Attribution is required and applied:** every normalised event carries a
  canonical `SourceCitation` with `sourceType: "official_statement"`,
  `sourceId`, and the original `url`. The UI MUST display the attribution line
  from `provenance.ts` ("Source: General Staff of the AFU…") next to any figure.
- We republish **short factual extracts + structured figures + a link**, not full
  article bodies. Media remain the authority's property and are linked, not
  rehosted, unless explicit permission is obtained.
- This integration redistributes **facts/figures**, not the authorities'
  branding, and implies no endorsement of Aegis Lens.

## ToS constraints

- **Telegram:** Bot API only, public channels, read-only. The bot is added as a
  channel member to receive `channel_post` updates; no userbot/MTProto, no
  scraping of user accounts. Token from `process.env` (per-branch vars:
  `GENSTAFF_TG_BOT_TOKEN`, `MOD_TG_BOT_TOKEN`, `AIRFORCE_TG_BOT_TOKEN`,
  `NAVY_TG_BOT_TOKEN`; fallback `UA_MIL_TG_BOT_TOKEN`) — never hardcoded.
- **Facebook (General Staff daily summary):** Graph API page feed only, with a
  `FB_PAGE_TOKEN`; no login scraping of the page. Gated when no token is present.
- **MoD site:** respect `robots.txt` and server load; short extracts + link, no
  bulk archival scraping.

## Crawler discipline

The shared `client-base.ts` enforces:

- **Per-host polite rate limit** (`minIntervalMs`, default **5 s**) — one live
  request per host per interval; never concurrent / rapid-fire.
- **Per-channel cache TTL** (`cacheTtlMs`, default **5 min**) — repeat reads in
  the window are served from cache.
- **Descriptive User-Agent** identifying the crawler + contact.
- **Conservative fallback:** any network/parse error falls back to the demo
  fixture and never throws into the pipeline (no retry storms).
- **Unverified handles gated** until confirmed against the authority's channel.

## Partnership / liaison notes

- No formal data-sharing agreement exists; ingestion relies solely on public
  press output. A liaison with the General Staff / MoD press services is the path
  to a structured or higher-rate feed and should precede any increase in polling
  frequency. Facebook Graph access requires an app review for the page feed
  permission — a documented prerequisite, not assumed.

## Map layer

- **No new map layer.** The daily summary feeds a dashboard WIDGET (no map
  paint). Air Force / Navy threat alerts inform the existing `air_raid_alerts`
  layer via `airalert-correlation.ts`. See handoff
  `c:\tmp\sprint259_shared_GENSTAFF.txt` (`<none>`).

## PII / safety

- Records are aggregate operational/press information. We track spokespersons by
  ROLE, not personal name. Coordinates are oblast-centre level with large honest
  uncertainty radii (100–150 km) — not precise enough to target, by design.
