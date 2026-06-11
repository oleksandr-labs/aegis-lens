# Aegis Lens — Digital Asset Management (DAM) Plan v1.0

**Status:** v1.0 — Sprint 2.39 (2026-05-24). Owner: Brand lead + Ops.
**Pair with:** `BRAND_BOOK.md`, `BRAND_GOVERNANCE.md`, `legal_docs/TODO_takedown_licensing.md`.

---

## 1. Goal

One central, versioned, rights-cleared asset library. Searchable by staff and approved partners. Self-serve for press. Asset chaos is brand drift; centralize early.

---

## 2. Tool selection

**Decision:** start with **self-hosted lightweight** (S3-backed + a thin web UI on top of `apps/web`), migrate to **Frontify** when staff ≥ 25 or partner count ≥ 50.

### Why self-hosted to start
- Cost: ~$0 vs. $1.2k/mo for Frontify entry tier.
- Control: our taxonomy, our rights model, our access tiers.
- We already operate S3 + auth + RBAC.
- Migration cost to Frontify later is low because metadata is the only valuable artifact.

### Migration trigger to Frontify (or Bynder)
Any one of:
- ≥ 25 internal staff requesting assets monthly.
- ≥ 50 active partners with DAM access.
- ≥ 1,000 individual assets under management.
- Brand lead spends > 4 hours/week on access provisioning.

---

## 3. Storage architecture

- **Origin:** S3 bucket `aegis-dam-prod` (private, KMS-encrypted, versioning on, MFA-delete on, object-lock on for compliance assets).
- **CDN:** Cloudflare in front for partner + press surfaces.
- **Metadata:** Postgres `dam_assets` table — see § 6 for schema.
- **Search:** existing Meilisearch instance, new index `dam_assets`.
- **Backup:** daily snapshot to a second region; 90-day retention.

---

## 4. Asset taxonomy

Two-axis taxonomy. Every asset has exactly one `kind` and one or more `tags`.

### `kind` (mutually exclusive)

| Kind | Examples |
| --- | --- |
| `logo` | Lockup, monogram, wordmark, variants (mono, white-on-dark) |
| `palette` | Color swatches, Tailwind tokens, ASE / Sketch palettes |
| `typography` | Font files, font specimen, type scale specimen |
| `photo` | Photography (rights metadata required) |
| `illustration` | Custom illustrations and figures |
| `icon` | Custom icons (event class icons, layer icons) |
| `template` | Social card templates, deck templates, report templates |
| `partner_kit` | Pre-generated co-brand packs |
| `press_kit` | Curated public press surfaces |
| `marketing` | Hero images, banners, OG images |
| `product_ui` | Screenshots, product mockups, demo videos |
| `document` | Brand book PDF, voice & tone PDF, deck PDFs |

### `tags` (any combination)

- Surface: `social_x`, `social_li`, `social_bsky`, `ogimage`, `web`, `print`, `deck`, `pdf`, `video`.
- Locale: `en`, `uk`, `de`, `fr`, ...
- Theater: `ua`, `global`, `regional_<id>`.
- Status: `approved`, `draft`, `expired`, `retired`, `embargo`.
- Sensitivity: `public`, `partner`, `internal`, `restricted` (e.g., raw conflict photography pre-release).

---

## 5. Required asset variants (day 1 catalogue)

### Logo
- `primary-horizontal.svg`, `.png` @1x/@2x/@3x, all on transparent BG.
- `primary-stacked.svg`, `.png`.
- `monogram.svg`, `.png`, favicon set (`.ico`, 16/32/48/96/180/192/512).
- `wordmark.svg`, `.png`.
- Monochrome variants: `mono-white.svg`, `mono-black.svg`.
- Apple touch icon, Android adaptive icon (foreground/background).
- Open Graph default (`og-default.png` 1200×630).
- App icon source (`icon-master.svg`, plus rendered ios/android/web pwa set).

### Palette
- Tailwind tokens JSON.
- ASE (Adobe), `.sketchpalette`, Figma library file.
- A11y matrix PDF showing contrast on `bg.base`.

### Typography
- Inter variable woff2 + license file.
- JetBrains Mono woff2 + license file.
- Type-scale specimen PDF.

### Templates
- Event card (1:1, 9:16, 16:9) Figma + exported PNGs.
- Brief card (1.91:1, 1:1) Figma.
- Deck template (Google Slides + Keynote).
- Report template (Markdown source + PDF render).
- Email signature template (HTML).

### Partner kits
- "Powered by Aegis Lens" lockup pack.
- "Source: Aegis Lens" wordmark pack.
- Co-brand template (joint report cover, joint webinar banner).

### Press kit
- Lockup PNGs (with + without padding).
- 5 approved product screenshots (with placeholder data — never real verified events).
- Founder portraits (when available).
- One-pager (PDF) on the product.
- BRAND_BOOK.md + VOICE_TONE.md PDFs.
- Quote bank (3 pre-approved CEO quotes).

---

## 6. Metadata schema

```ts
// packages/types -- DAMAsset (planned)
interface DAMAsset {
  id: string;                 // ULID
  kind: AssetKind;            // see § 4
  slug: string;               // human-readable, unique per kind
  title: string;              // EN
  title_locales: Record<Locale, string>;
  description: string;        // EN, what + when to use
  tags: string[];             // see § 4
  // Storage
  s3_key: string;
  mime: string;
  bytes: number;
  width?: number;
  height?: number;
  duration_ms?: number;       // for video / audio
  checksum_sha256: string;
  // Variants (links to sibling DAMAsset.id)
  variant_of?: string;        // parent asset
  variants: string[];         // child assets (size / format / locale variants)
  // Versioning
  version: number;            // monotonic per slug
  supersedes?: string;        // previous DAMAsset.id
  superseded_by?: string;
  // Rights
  rights: {
    type: "owned" | "licensed" | "public_domain" | "creative_commons" | "editorial_only";
    license_id?: string;      // FK to dam_licenses
    license_name?: string;    // e.g., "Getty Standard", "CC BY 4.0"
    photographer?: string;
    source_url?: string;
    territory: string[];      // ISO country codes or ["WORLD"]
    expires_at?: string;      // ISO date
    usage_restrictions?: string;
  };
  // Access
  access_tier: "public" | "press" | "partner" | "internal" | "restricted";
  approved_at?: string;
  approved_by?: string;       // user id
  approval_notes?: string;
  // Lifecycle
  status: "draft" | "approved" | "embargoed" | "expired" | "retired";
  embargo_until?: string;
  retire_after?: string;
  // Audit
  created_at: string;
  created_by: string;
  updated_at: string;
  download_count: number;
  last_downloaded_at?: string;
}
```

A separate `dam_downloads` table records `(asset_id, user_id_or_token, surface, at)` for per-asset analytics.

---

## 7. Per-asset usage rights + expiration

- Every asset records its rights tuple (type, license, photographer, territory, expiration).
- Expired assets auto-flip to `status = expired` via a daily job. They remain in the DAM read-only with a banner; downloads are blocked unless re-cleared.
- Rights renewals open 60 days before expiration. Reminder to brand lead at 60 / 30 / 7 days.
- Editorial-only assets are flagged loudly in the UI — they may not be used in marketing.

---

## 8. Per-asset version history

- Every replacement is a new version (`version += 1`, `supersedes` set to the previous `id`).
- Previous versions remain downloadable from the asset detail page (history tab).
- A diff view shows: filename, size, dimensions, rights, status delta.
- Retired versions remain stored but hidden from default search; surface a banner if someone deep-links to one.

---

## 9. Per-asset download analytics

- Each download logged with `(asset_id, user, source_surface, ip_hash, ts)`.
- Dashboard surfaces:
  - Top 25 most-downloaded assets per quarter.
  - Assets with zero downloads in 12 months (candidates for retirement).
  - Per-partner download volume.
  - Per-press-surface download volume (informs media reach).
- PII-light: we hash IPs and rotate the hash salt monthly.

---

## 10. External partner access tier

Tiers (mirrored from access control):

| Tier | Who | What they see | How |
| --- | --- | --- | --- |
| `public` | Anyone | Press kit subset, brand book PDF | Direct download links, no auth |
| `press` | Verified journalists | Press kit + extended product screenshots + quote bank | Email-gated download (magic link) |
| `partner` | Approved partners | `partner` + `public` tier assets; auto-generated partner kit | Auth + per-partner token |
| `internal` | Staff | All `approved` assets | SSO |
| `restricted` | Brand lead + Legal | Embargoed, raw conflict media, draft assets | SSO + role gate |

Partner tokens are scoped: they reveal only the assets explicitly tagged for that partner + the public tier.

---

## 11. Auto-generated partner kits

When a partner is added to the program (BRAND_GOVERNANCE.md § 8), a background job generates a partner kit:

- "Powered by Aegis Lens" co-brand lockup, rendered with the partner's mark at correct ratios.
- Partner-specific download portal URL.
- One-pager (PDF) with the partner's product as the lede + Aegis Lens as the data source.
- Email signature template with the partner's logo on the right.
- 12-month expiration on every asset in the kit; renews on partnership review.

The kit is reviewed by the brand lead before sending. Auto-generation drafts, humans approve.

---

## 12. Per-locale variants

- Text-bearing assets (templates, social cards, OG images) require a variant per locale we publish in.
- Locale variants are child assets (`variant_of`) tagged with the locale.
- A "locale coverage" widget on the asset detail page shows which locales are missing.
- Missing-locale alerts go to the localization workflow (`platform/TODO_localization_workflow.md`).

---

## 13. Search + discovery

- Faceted search on `kind`, `tags`, `access_tier`, `status`, `locale`.
- Visual grid for `logo`, `photo`, `illustration`, `icon`, `template`.
- Saved searches (e.g., "all UK social templates approved in the last 30 days").
- Embed snippets: each asset detail page offers a copy-paste snippet for web (HTML img + caption + license attribution) and for decks (right-click → download proper size).

---

## 14. Governance touchpoints

- Asset upload requires an approver from `BRAND_GOVERNANCE.md` § 2 RACI.
- Approval transitions `draft → approved` and records `approved_by + approved_at + approval_notes`.
- Quarterly DAM audit (part of BRAND_GOVERNANCE.md § 9): orphans, missing rights, missing locales, oldest unviewed.
- Off-boarding integration: revoking a user's DAM access doesn't delete their uploads; ownership transfers to brand lead.

---

## 15. Phase plan

| Phase | When | Deliverable |
| --- | --- | --- |
| P0 | Sprint 2.39 | Day-1 catalogue (§ 5) lives in S3 with a hand-maintained index. |
| P1 | Sprint 2.40–2.42 | `dam_assets` schema, basic upload + approval UI, internal SSO access. |
| P2 | Sprint 2.43–2.45 | Press kit page (`/press-kit`), partner token access, partner kit generator. |
| P3 | Sprint 2.46+ | Analytics dashboard, search facets, locale coverage widget. |
| P4 | Trigger-based | Migrate to Frontify or Bynder when § 2 triggers fire. |

---

## 16. Open questions

- Do we self-host the press kit on `aegislens.<tld>/press-kit` or on a separate `press.aegislens.<tld>` subdomain? — defer to SEO + Comms.
- Do we let press users register accounts, or stick with magic-link gating per request? — start with magic links; revisit at P3.
- Per-partner branded subdomain for partner kits? — likely yes for enterprise tier; defer to P3.
