# Hub — Civil-Society Advocacy & Petition Tracker

## Goal
Track external civil-society campaigns, petitions, and open letters related to tracked conflicts — distinct from the platform's own community/contributor programs (`community_ops/TODO_contributor_program.md`, `pages/TODO_community.md`), which are about the platform's own UGC, not external advocacy activity. Zero content found anywhere in the repo.

## Progress
- 0 / 4 done

## URLs
- `/advocacy` (pillar, cross-conflict) · `/advocacy/<campaign-slug>` (per-campaign page)

## Tasks
- [ ] Pillar page: scope (notable petitions, open letters, civil-society campaigns tied to tracked conflicts), neutral-framing editorial policy (document, don't endorse — same principle already used for `topical_hubs/TODO_hub_peace_diplomacy.md`)
- [ ] Per-campaign page: campaign name/organizer, stated ask, signatory count where publicly reported, status, source links (official campaign page only)
- [ ] Data model: `AdvocacyCampaignSeed` (campaignSlug, conflictSlug, organizer, ask, signatoryCount?, status, sourceUrls[]) in `apps/web/src/lib/hubs/advocacy.ts`
- [ ] FAQPage JSON-LD (10 Q&A)

## Notes
- Editorial neutrality is the main risk here — document campaign existence/facts, do not editorialize on merit. Route through the same neutral-framing review as the peace/diplomacy hub.
- Lower priority than troll-farms/war-economy given a less obvious direct SEO/traffic case, but a real, well-differentiated gap.

## i18n
- EN + UK.
