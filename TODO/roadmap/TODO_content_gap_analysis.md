# Content Gap Analysis & Forward Roadmap (2026-07-12)

## Goal
Full audit of the existing content architecture — 690 TODO files, 188 live `page.tsx` routes, 10 top-level taxonomy categories, 16 SEO topic clusters, 15 map layers, 57 integrations — to find genuinely missing content categories, page types, and SEO clusters, and turn them into a prioritized build plan. This file is the entry point; per-item specs live in the linked TODO files.

## Method
1. Read [TODO_MAIN.md](../TODO_MAIN.md) index + sprint history (Sprints 2.4–2.72, through 2026-06-13).
2. Read `data/taxonomy/category-tree.yaml` (10 top-level categories) and `apps/web/src/lib/taxonomy/topic-clusters.ts` (16 pillar clusters).
3. Checked 21 candidate content categories against existing TODO/ specs and `apps/web/src/lib/**` implementation to avoid proposing duplicates.
4. Classified each candidate: **NOT COVERED** (net-new), **PARTIALLY COVERED** (extend existing), or **FULLY COVERED** (no action).

## Finding: this platform is already exceptionally over-specced
~30 business-function TODO folders are fully closed, technical SEO has 139 built lib modules, and most obvious content types (equipment specs, sanctioned entities, military units, commander bios, glossary terms, daily situation reports, owned video/podcast) are **already fully covered** by the generic KG entity template (`/entities/<slug>`) or dedicated pages. The real gaps are narrower and more specific than "what content types are missing" — they cluster around **accountability/recovery/diplomacy tracking** (a content category type conflict-intelligence competitors like Liveuamap/Kiel Institute/ACLED dashboards carry, that this platform does not) and a handful of **publishing-hygiene pages** (surfacing content that already exists in another form).

## Net-new gaps (8) — no existing spec, added this pass
| Gap | New file | Why it matters |
|---|---|---|
| War crimes & accountability tracker | [topical_hubs/TODO_hub_war_crimes.md](../topical_hubs/TODO_hub_war_crimes.md) | High E-E-A-T/backlink surface (NGO/legal researcher citations); ties to conflict verification core competency |
| POW/detainee exchange tracker | [topical_hubs/TODO_hub_pow_exchange.md](../topical_hubs/TODO_hub_pow_exchange.md) | High public search volume, near-real-time update cadence, strong family/civilian audience reach |
| Reconstruction & recovery tracker | [topical_hubs/TODO_hub_reconstruction.md](../topical_hubs/TODO_hub_reconstruction.md) | NGO/government persona relevance; complements existing infrastructure-damage layer with a recovery-side view |
| International aid/donor tracker | [topical_hubs/TODO_hub_international_aid.md](../topical_hubs/TODO_hub_international_aid.md) | Well-known category (cf. Kiel Institute Ukraine Support Tracker) entirely absent; strong citable-dataset/licensing upsell |
| Peace talks & diplomacy tracker | [topical_hubs/TODO_hub_peace_diplomacy.md](../topical_hubs/TODO_hub_peace_diplomacy.md) | "Politics & Diplomacy" taxonomy branch has treaties/sanctions/visits/elections/coups but no negotiation-process category |
| Military acronym lookup | [programmatic/TODO_template_acronym.md](../programmatic/TODO_template_acronym.md) | Long-tail "what does X stand for" search intent, distinct from conceptual glossary intent — low-competition SEO |
| Live blog / crisis ticker page | [pages/TODO_live_blog.md](../pages/TODO_live_blog.md) | Liveuamap/BBC-style standalone live page; only an in-app embeddable ticker widget exists today, not a public page with `LiveBlogPosting` schema (blocks Google News/Top Stories eligibility) |
| Public widget gallery | [pages/TODO_widget_gallery.md](../pages/TODO_widget_gallery.md) | Embed-builder exists but requires login — no public discovery surface, which caps the embeds growth loop |

## Extend-existing gaps (4) — partial scaffolding found, tasks added to existing files
| Gap | Where extended | Status found |
|---|---|---|
| Grain corridor / agricultural export tracker | [verticals/TODO_vertical_agriculture.md](../verticals/TODO_vertical_agriculture.md) | Sketched (URL + bullet), zero code |
| Satellite before/after standalone article | [programmatic/TODO_template_before_after.md](../programmatic/TODO_template_before_after.md) (new template, reuses existing compare-slider tool) | Compare-slider tool fully built as a *map-layer feature*; no publishable article template around it |
| Newsletter public archive | [pages/TODO_newsletter_archive.md](../pages/TODO_newsletter_archive.md) | Signup capture exists (`lib/growth/newsletter.ts`); issues not published/indexed anywhere |
| RSS/Atom feeds index page | [pages/TODO_feeds_index.md](../pages/TODO_feeds_index.md) | Individual feeds exist (`/blog/feed.xml`); no single discoverable index |

## Explicitly NOT gaps (checked, already fully covered — do not re-spec)
Individual weapon/equipment spec pages, sanctioned-entity profiles, military-unit pages, commander biographies, individual glossary term pages, "day in review" narrative pages, owned video hub, owned podcast, refugee/IDP tracker (already inside `topical_hubs/TODO_hub_humanitarian.md`).

## Taxonomy updates made this pass
- [categories_taxonomy/TODO_category_tree.md](../categories_taxonomy/TODO_category_tree.md): flagged 4 new proposed sub-categories (`negotiations`, `war_crimes_accountability`, `reconstruction_recovery`, `international_aid`) + 1 micro-category (`pow_detainee_exchange`) across 3 existing top-level branches.
- [categories_taxonomy/TODO_topic_clusters.md](../categories_taxonomy/TODO_topic_clusters.md): proposed 5 new SEO pillar clusters (16 → 21), one per new hub above.

## Prioritized build order (proposed)
1. **Newsletter archive + feeds index** — near-zero net-new work, pure publishing hygiene, ships in under a sprint.
2. **International aid tracker** + **POW exchange tracker** — highest expected search/referral traffic of the net-new hubs, clear data-sourcing path (official statements, published trackers), strong monetization tie-in (`monetization/TODO_data_licensing.md`).
3. **War crimes tracker** + **Reconstruction tracker** — higher editorial/legal-review overhead (defamation risk, sourcing bar) — sequence after the review workflow in `TODO/content/` and `TODO/safety/` is confirmed to cover this content type.
4. **Live blog page** — depends on reusing existing SSE plumbing from the map; mostly a schema/template exercise, unlocks Google News eligibility (`seo/TODO_news_seo.md`).
5. **Peace/diplomacy tracker** — lowest urgency (fewer active negotiation tracks at any time), but cheapest to spec once the taxonomy sub-category lands.
6. **Acronym lookup + before/after imagery template + widget gallery** — SEO/growth long-tail plays, schedule opportunistically alongside existing `seo/` and `features/TODO_embeds_widgets.md` sprints.

## Non-goals of this pass
This analysis did not re-audit engineering readiness (DB/Kafka/PostGIS — already flagged partial in TODO_MAIN §4) or monetization/business-function folders (already ~30 folders fully closed). It is scoped strictly to public content categories, page types, and SEO clusters.

## i18n
All 8 net-new hubs/pages require EN+UK from first publish per the working-language convention in TODO_MAIN §5 — several (POW exchange, reconstruction, aid tracker) have primary relevance to Ukrainian-language audiences and should not ship EN-only even as an MVP.

---

## Round 2 (2026-07-12, same day, deeper pass)

Round 1 checked 21 topics I selected up front. Round 2 was more systematic: checked 10 broader angles (data journalism formats, historical/anniversary content, cross-conflict comparison, UGC/community, localization depth, self-service analytics, climate-conflict content, legal/policy education, methodology transparency, new-conflict onboarding) against actual file contents (not just the index) to avoid re-proposing anything already built.

### Already fully covered (no action — confirmed, not re-specced)
- UGC/community surfaces (tip line, contributor leaderboard, bounty board — `pages/TODO_investigations.md`, `community_ops/TODO_contributor_program.md`)
- Localization beyond EN/UK (8 locales already specced in `seo/TODO_international_seo.md`, Sprint 2.73)
- Public methodology/confidence-score pages (`transparency/TODO_methodology_disclosure.md`, `programmatic/TODO_template_methodology.md`)
- New-conflict-onboarding framework (`conflicts/TODO_conflict_framework.md` is already generalized, not hardcoded to 8 — the only real gap is that conflicts #2–8 are editorial-RFC-only with no data file yet, which is an execution gap tracked in each conflict's own file, not a spec gap)

### 5 new genuine gaps confirmed
| Gap | New file | Why |
|---|---|---|
| Conflict-vs-conflict comparison hub | [programmatic/TODO_template_conflict_comparison.md](../programmatic/TODO_template_conflict_comparison.md) | Existing comparison content is 100% platform-vs-platform; no cross-conflict data-journalism content exists despite the stats already being modeled per-conflict |
| IHL / laws-of-war educational pillar | [content/TODO_pillar_ihl.md](../content/TODO_pillar_ihl.md) | Round-1's war-crimes hub is a *tracker*; this is evergreen legal-education content — different search intent, different production pattern (reuses existing pillar-page process) |
| Public no-code data explorer | [features/TODO_data_explorer.md](../features/TODO_data_explorer.md) | Only the paid Analyst Dashboard and raw API exist; no simplified public self-service surface — highest-effort item in this round (real product surface) |
| Conflict anniversary / retrospective template | [programmatic/TODO_template_anniversary.md](../programmatic/TODO_template_anniversary.md) | Distinct from year-in-review (annual, calendar-fixed) and archive pages (non-narrative index) — predictable traffic spikes on known dates, low spec effort |
| Scrollytelling data-explainer article | [programmatic/TODO_template_scrollytelling.md](../programmatic/TODO_template_scrollytelling.md) | The exact content format associated with the platform's stated "Bellingcat-grade" positioning benchmark; currently no editorial template for it, only marketing-page scroll motion |

### Round 2 prioritized build order (highest confidence × lowest effort first)
1. **Conflict-vs-conflict comparison hub** — pure reuse of existing per-conflict stats, no new data pipeline.
2. **Anniversary/retrospective template** — reuses year-in-review production process; pre-schedule against known dates (Feb 24 full-scale-invasion anniversary is the single highest-traffic opportunity).
3. **IHL educational pillar** — standard pillar-page production, needs a legal-reviewer byline sourced (coordinate with `seo/TODO_eeat_authors.md`).
4. **Scrollytelling article template** — higher effort (CWV risk, a11y fallback needed); pair the first piece with item #2's anniversary launch for maximum impact.
5. **Public no-code data explorer** — highest effort of all round-1+round-2 findings; sequence after `features/TODO_export_api.md` GraphQL layer is stable, treat as its own mini-project rather than a content task.

### i18n (round 2 additions)
Same rule applies — EN+UK from first publish. The anniversary template in particular should not slip on Ukrainian-language publication given Feb 24 traffic sensitivity for that specific audience.

---

## Round 3 (2026-07-12, same day, third pass)

Rounds 1–2 covered 31 candidate topics across two passes. Round 3 checked a further 12 angles — press freedom, cultural heritage, landmines/demining, undersea infrastructure sabotage, GPS jamming/navigation warfare, nuclear facility safety, foreign fighters/PMCs, conflict-related sexual violence (CRSV)/children-in-conflict, standalone fact-check database, security.txt/accessibility statement, press kit, and forced conscription — again verified against actual file/lib contents, not filenames.

### Already fully covered (no action)
- Undersea/cross-border infrastructure sabotage — `apps/web/src/lib/hubs/maritime.ts` (`/maritime/cable-security`) + `hubs/energy-security.ts` (`/energy-security/pipelines`)
- Nuclear facility safety — `apps/web/src/lib/hubs/energy-security.ts` (`/energy-security/nuclear`, ZNPP/IAEA-specific)
- Press kit / "as seen in" — `pages/TODO_press.md` (press kit + `#seen-in` section)
- security.txt — already shipped (`apps/web/src/app/.well-known/security.txt/route.ts`)

### Partially covered (extend existing, no new file)
- Landmine/cluster-munitions/demining — a real `mine-action` sub-hub already exists in `topical_hubs/TODO_hub_humanitarian.md` / `apps/web/src/lib/hubs/humanitarian.ts`; treat as "extend," not net-new.
- GPS jamming / navigation warfare — real content exists but dispersed across `threats-seed.ts`, `trends-seed.ts`, and the drones EW hub rather than as a first-class tracker; lower-confidence gap, mostly a re-packaging opportunity — not spec'd as a new file this round, flagged here for a future pass if traffic data supports it.
- Public accessibility-statement page — VPAT content already exists (`docs/a11y/accessibility.md §1.7`) but has no public route; added as a task to [a11y/TODO_wcag_audit.md](../a11y/TODO_wcag_audit.md) rather than a new file (low effort, content already written).

### 5 new genuine gaps confirmed + 1 gated
| Gap | New file | Why |
|---|---|---|
| Fact-check / debunk database (per-claim pages) | [programmatic/TODO_template_fact_check.md](../programmatic/TODO_template_fact_check.md) | Reuses existing `disinformation.ts` narrative-cluster/source-reputation/disputed-badge machinery; near-zero net-new infra; classic high-volume "is it true that..." intent — cheapest spec of this round |
| Forced conscription & mobilization tracker | [topical_hubs/TODO_hub_conscription.md](../topical_hubs/TODO_hub_conscription.md) | High sustained public search volume (draft-age civilians, families), zero prior scaffolding, needs careful editorial framing (not legal advice, official sources only) |
| Press freedom & journalist safety tracker | [topical_hubs/TODO_hub_press_freedom.md](../topical_hubs/TODO_hub_press_freedom.md) | Distinct from the existing journalist-as-customer-persona pages; strong CPJ/RSF/IFJ-adjacent backlink surface |
| Foreign fighters & PMC presence tracker | [topical_hubs/TODO_hub_foreign_fighters.md](../topical_hubs/TODO_hub_foreign_fighters.md) | Most entity data (Wagner/Africa Corps) already exists scattered per-conflict; this is mainly an aggregation hub, lower effort than it looks |
| Cultural heritage destruction tracker | [topical_hubs/TODO_hub_cultural_heritage.md](../topical_hubs/TODO_hub_cultural_heritage.md) | Only one throwaway mention exists repo-wide; highest-effort item this round (no data source lined up yet) |
| **⚠️ CRSV & children-in-conflict tracker** | [topical_hubs/TODO_hub_crsv_children.md](../topical_hubs/TODO_hub_crsv_children.md) | **BLOCKED pending Ethics Board + legal sign-off** — a genuine content gap, but explicitly NOT to be prioritized by traffic/effort like the others. Requires UN-mandate-holder-only sourcing, victim anonymity by default, no graphic imagery, and case-by-case legal review before any spec work proceeds. |

### Round 3 prioritized build order
1. **Fact-check database** — cheapest, reuses existing detection infrastructure.
2. **Public accessibility-statement page** — trivial, content already written, just needs a route.
3. **Forced conscription tracker** — high traffic, needs editorial framing pass but no new data source.
4. **Foreign fighters/PMC hub** — mostly aggregation of existing entity data.
5. **Press freedom tracker** — clear source list (CPJ/RSF/IFJ), moderate effort.
6. **Cultural heritage tracker** — defer until a UNESCO/ICOMOS/Blue Shield data-source integration is separately scoped (shape similar to a `TODO/integrations/` spec).
7. **CRSV/children-in-conflict** — do not sequence by effort/traffic at all; next action is routing the Ethics Board gate request, not content production.

### i18n (round 3 additions)
EN + UK from first publish for items 1–6. Item 7 has no i18n plan until the ethics gate clears.

---

## Round 4 (2026-07-12, same day, fourth pass)

Round 4 had two parts. **Part A** re-verified a possible oversight: round 2 had explicitly found "Climate–conflict intersection content depth" **genuinely missing (stub only)** but no TODO file was ever created for it — confirmed on recheck as a real, still-open gap that fell through the cracks between rounds. **Part B** checked 6 fresh angles not touched by rounds 1–3: water security (same finding as Part A), space domain/ASAT warfare, ICS/SCADA critical-infrastructure attacks, deepfake-specific showcase, foreign election interference, and a public corrections/retractions log.

### Already fully covered (no action)
- Foreign election interference — `apps/web/src/lib/hubs/elections.ts` already treats this as first-class: every `ElectionRecord` has a `foreignInterference` boolean, dedicated FAQ entry, editorial principle ("document interference — do not amplify it"), and a distinct `foreign-interference` tag separate from general disinformation. Not just domestic-election monitoring as suspected — already thorough.
- Public corrections & retractions log — `/trust/corrections` is a live public page (`apps/web/src/app/[locale]/trust/corrections/page.tsx`) distinct from the internal retraction workflow, with real entries, stats tiles, and `Article` JSON-LD. Exactly the EEAT-style page reputable outlets publish. No gap.

### Weak/dispersed (flagged in-place, not spec'd as a new file)
- ICS/SCADA critical-infrastructure attacks — real content exists (APT TTP tags, one FAQ answer citing Industroyer/CrashOverride) but no dedicated incident-level tracker. Lower-confidence, same shape as round 3's GPS-jamming finding — added as a flagged task inside `topical_hubs/TODO_hub_cyber_warfare.md` rather than a new file; revisit once a dedicated ICS-incident data source (Dragos/E-ISAC-style) is scoped.

### 3 genuine gaps confirmed — down from 8 (round 1) → 5 (round 2) → 5+1-gated (round 3) → 3 (round 4)
| Gap | New file | Why |
|---|---|---|
| Climate & resource security (climate/water/drought as conflict driver) | [topical_hubs/TODO_hub_climate_conflict.md](../topical_hubs/TODO_hub_climate_conflict.md) | Confirmed round-2 oversight, now fixed. Taxonomy (`category-tree.yaml`) only has environmental-*hazard* leaves, none framing climate/water as a structural conflict driver; two illustrative `exampleSlugs` in `subcategories.ts` were never wired to real content — this hub is what should back them |
| Space domain & counter-space warfare | [topical_hubs/TODO_hub_space_domain.md](../topical_hubs/TODO_hub_space_domain.md) | Zero existing scaffolding of any kind; `hubs/satellite.ts` is entirely imagery-as-tool, never space as a contested domain — clean, well-differentiated gap |
| Deepfake case-study showcase | [programmatic/TODO_template_deepfake_showcase.md](../programmatic/TODO_template_deepfake_showcase.md) | Detection service exists as a scoring stub with no case gallery; distinct from round 3's claim-text-centric fact-check database — lowest urgency of the three since it can extend that template rather than requiring a fully separate build |

### Explicit diminishing-returns note
This round surfaced roughly half as many genuine gaps as each prior round (8 → 5 → 5(+1 gated) → **3**), and two of the six checked angles this round were already unusually well-covered (foreign election interference, corrections log) — better than initially expected. This is a reasonable stopping point for scan-only rounds. **Recommend: do not run a round 5 content-gap scan until meaningful build progress has been made against rounds 1–4's prioritized build orders.** Re-scanning an already-thoroughly-audited 700+ file / 190+ page repo before anything ships mostly re-confirms known gaps or finds progressively narrower, lower-confidence ones (as ICS/SCADA and GPS-jamming already illustrate). Future scans are better spent re-auditing after a sprint ships, or spot-checking a single angle the team specifically wants covered.

## Round 5 (2026-07-12, same day, fifth pass — user-requested despite round 4's pause recommendation)

Round 4 recommended pausing scan-only rounds until build progress landed. The user explicitly asked for another broad scan anyway; this round honored that request but was held to the same rigor bar — check against all four prior rounds' "already covered" lists before flagging anything, and report honestly if fewer gaps survive.

Checked 8 fresh angles: prisoner treatment/detention-conditions monitoring, arms trade/weapons proliferation, cybercrime-for-profit/ransomware-as-a-service, public data-quality/coverage-transparency self-disclosure, post-conflict transitional justice/reparations, energy/commodity market impact, "how we're different" editorial trust page, disability/accessibility in humanitarian content.

### Already fully covered (no action) — better-covered than expected
- Public data-quality/coverage-transparency page — `transparency/TODO_annual_transparency_report.md` already has dedicated `source-coverage`/`locale-coverage` sections explicitly self-disclosing thin coverage areas and planned investments to close them.
- Energy/commodity market impact tracker — `audiences/TODO_traders_finance.md` ships a full persona-driven market-impact system (commodity-impact tagging, asset-mapping, pre-market AI brief, anomaly time-series, Bloomberg/Refinitiv-style exports) — considerably more thorough than the sanctions/economy taxonomy leaf this angle was checked against.

### Not a clean gap (dispersed across existing files, not confirmed)
- "How we're different" trust page — the constituent pieces (why-this-exists narrative, competitor differentiation guidance, trust-center compliance framing) already exist across `pages/TODO_about.md`, `product/TODO_competitors.md`, and `pages/TODO_trust_center.md`. A repackaging opportunity, not confirmed as net-new.

### Weak/dispersed (flagged in-place, same treatment as round 3/4's GPS-jamming and ICS/SCADA)
- Ransomware/cybercrime-for-profit (RaaS) — real dispersed content (malware/APT sub-page, FAQ answer, unwired taxonomy leaf) but no dedicated per-group/victim/ransom tracker. Flagged as a task inside `topical_hubs/TODO_hub_cybersecurity.md` rather than a new file.

### 3 genuine net-new gaps + 1 resolved as an extension
| Gap | Resolution | Why |
|---|---|---|
| Prisoner treatment & detention-conditions monitoring | New file: [topical_hubs/TODO_hub_detention_conditions.md](../topical_hubs/TODO_hub_detention_conditions.md) | Zero scaffolding; explicitly distinct from the exchange-only POW tracker; carries a sourcing-caution note (ICRC/UN mandate-holder only) at the same rigor tier as the CRSV gate, though not fully blocked |
| Transitional justice & reparations tracker | New file: [topical_hubs/TODO_hub_transitional_justice.md](../topical_hubs/TODO_hub_transitional_justice.md) | Zero scaffolding, cleanly distinct from both war-crimes (criminal) and reconstruction (physical infra); clear sourcing path (Register of Damage for Ukraine, Council of Europe mechanisms) |
| Arms trade & weapons proliferation tracker | New file: [topical_hubs/TODO_hub_arms_trade.md](../topical_hubs/TODO_hub_arms_trade.md) — **deferred, no content production until a data-source integration is scoped** | Genuine and well-differentiated from equipment specs/sanctions, but highest-effort of the three — no SIPRI/UN-Comtrade-style feed exists yet, same deferred treatment as round 3's cultural-heritage tracker |
| Disability/accessibility in humanitarian content | Extended existing file: [topical_hubs/TODO_hub_humanitarian.md](../topical_hubs/TODO_hub_humanitarian.md) (new sub-page task, not a new hub) | An unwired taxonomy-stub pattern identical to round 4's climate-conflict finding, but here the fix is a sub-page of an already-complete hub rather than a standalone hub |

### Round 5 note on the diminishing-returns trend
4 of 8 checked angles survived in some form (3 new files + 1 extension) — roughly consistent with round 4's rate, not a further collapse, but two of the "already covered" findings this round (data-quality transparency, market impact) turned out to be more thoroughly built than anticipated going in. This continues to support round 4's original recommendation: broad scans are now returning a high proportion of "already covered" results relative to genuine gaps, which is the expected shape of a well-audited repo. The two lowest-effort round-5 items (detention-conditions, transitional justice) are good near-term build candidates; arms trade should stay deferred behind a data-source integration decision.

## Round 6 (2026-07-12, same day, sixth pass — user again requested a broad scan)

Round 5 predicted a continued high ratio of "already covered" results in future broad scans. Round 6 broke that trend: it found **5 genuinely missing** items — more than round 4 (3) or round 5 (4) — proving the well was not, in fact, fully dry. Checked 8 fresh angles: shadow-fleet tanker tracking, troll-farm/coordinated-inauthentic-behavior actor-tracking, veterans' reintegration, search-and-rescue/evacuation logistics, renewable-energy-targeting, public conflict-forecasting tournament, civil-society advocacy/petition tracker, war economy/illicit trade.

### Already fully covered (no action) — thoroughly built, contrary to expectation
- Shadow-fleet / sanctions-evasion tanker tracking — `integrations/ais/src/shadow-fleet.ts` is a complete tiered-scoring module (ageing-tanker, flag-of-convenience, dark-running, ship-to-ship transfers, sanctioned-port calls), surfaced at `/maritime/shadow-fleet` with its own FAQ.
- Renewable-energy infrastructure targeting — `apps/web/src/lib/hubs/energy-security.ts` has a dedicated `/energy-security/renewables` sub-page with its own FAQ, not folded generically into general energy-infrastructure content.

### Weak/dispersed (flagged in-place, same treatment as rounds 3-5's in-place flags)
- Search-and-rescue / evacuation logistics — split across two disconnected systems (`aid-corridors` sub-page for corridor status, `ua-dsns` event-extractor for SAR incidents) with no unifying tracker. Flagged as a task inside `topical_hubs/TODO_hub_humanitarian.md`.

### 5 genuine net-new gaps confirmed
| Gap | New file | Why |
|---|---|---|
| Troll farms & coordinated inauthentic behavior (actor-tracking) | [topical_hubs/TODO_hub_troll_farms.md](../topical_hubs/TODO_hub_troll_farms.md) | Existing disinformation/misinfo systems are claim-centric, never organization-centric; cheapest of this round's gaps — reuses the existing entity template |
| War economy & illicit trade tracker | [topical_hubs/TODO_hub_war_economy_smuggling.md](../topical_hubs/TODO_hub_war_economy_smuggling.md) | Fills an already-anticipated-but-never-wired taxonomy stub (`economy-logistics-chains`, `exampleSlugs: dual-use-goods-smuggling/sanctions-evasion-logistics-routes`) — same pattern as round 4's climate-conflict and round 5's disability findings |
| Veterans' post-conflict reintegration | [topical_hubs/TODO_hub_veterans_reintegration.md](../topical_hubs/TODO_hub_veterans_reintegration.md) | Zero content anywhere; distinct from POW exchange, detention-conditions, and transitional-justice (none cover returning-soldier civilian reintegration) |
| Civil-society advocacy & petition tracker | [topical_hubs/TODO_hub_advocacy_tracker.md](../topical_hubs/TODO_hub_advocacy_tracker.md) | Zero content; distinct from the platform's own community/contributor programs (external campaigns, not platform UGC) |
| Public conflict-forecasting tournament | [features/TODO_forecasting_tournament.md](../features/TODO_forecasting_tournament.md) | Distinct from the platform's internal AI-predictions model output; a real product feature (accounts/scoring/leaderboard), highest effort of this round |

### Round 6 prioritized build order
1. **Troll farms hub** — cheapest, reuses existing entity infrastructure.
2. **War economy/smuggling hub** — taxonomy already anticipates the scope; reuse shadow-fleet's scoring pattern as a model.
3. **Veterans reintegration** — no data-pipeline dependency, needs a sourcing plan only.
4. **Advocacy/petition tracker** — needs a neutral-framing editorial pass (same discipline as the peace/diplomacy hub) before content production.
5. **Forecasting tournament** — real product feature, not just content; sequence behind the round-2 data-explorer if both compete for engineering time.

### Round 6 note on the diminishing-returns trend
This round is evidence that "broad scan yield" does not decay monotonically — it depends on which angles happen to get checked each round, not on the repo being exhausted. Two rounds running low (4, 5) followed by a higher-yield round (6) suggests the remaining angle-space is large enough that predicting exhaustion after any single low round is premature. That said, the same practical guidance stands: further rounds should keep checking genuinely fresh angles (not re-litigating "already covered" ones), and at some point returns will flatten — just not predictably on a fixed schedule.

### i18n (round 6 additions)
EN + UK from first publish for all four content hubs. The forecasting tournament requires simultaneous EN/UK question publication specifically to avoid giving one locale's forecasters a timing advantage.

## Running totals across all 6 rounds (2026-07-12)
- **33 new TODO files** created (19 `topical_hubs/`, 7 `programmatic/`, 4 `pages/`, 1 `content/`, 2 `features/`)
- **8 existing files extended** with flagged tasks (`verticals/TODO_vertical_agriculture.md`, `a11y/TODO_wcag_audit.md`, `topical_hubs/TODO_hub_cyber_warfare.md`, `topical_hubs/TODO_hub_humanitarian.md` (twice — disability + SAR/evacuation), `topical_hubs/TODO_hub_cybersecurity.md`, plus the 2 `categories_taxonomy/` files)
- **1 item explicitly gated**, not queued for ordinary prioritization (CRSV/children-in-conflict)
- **1 item explicitly deferred** pending a data-source integration decision (arms trade)
- **4 items flagged as weak/dispersed** rather than spec'd as new files (GPS jamming — round 3; ICS/SCADA — round 4; ransomware/RaaS — round 5; SAR/evacuation logistics — round 6)
- Next checkpoint: given round 6's reversal of the decline trend, a round 7 remains plausible if requested — but build progress against rounds 1–6's prioritized orders is still the higher-value next step than another scan.
