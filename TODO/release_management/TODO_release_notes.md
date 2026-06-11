# TODO — Release Notes

## Goal
Customer-facing release notes that tell the *story* (not just bug list).

## Progress
- 8 / 8 done ✅ COMPLETE (Sprint 2.56)

## Tasks
- [x] Weekly aggregated notes → [docs/release/release-management.md §2.1](../../docs/release/release-management.md)
- [x] Categories: Added / Changed / Fixed / Deprecated / Security ✓ Sprint 1.9
- [x] Per-entry user-visible language (no internal jargon) ✓ Sprint 1.9
- [x] Tag by area + persona → [docs/release/release-management.md §2.2](../../docs/release/release-management.md)
- [x] Screenshots / GIFs for visual changes → [docs/release/release-management.md §2.3](../../docs/release/release-management.md)
- [x] In-app "what's new" panel (last 30d) → [docs/release/release-management.md §2.4](../../docs/release/release-management.md)
- [x] Email digest (monthly) to engaged users → [docs/release/release-management.md §2.5](../../docs/release/release-management.md)
- [x] Published as RSS + Atom + JSON → [docs/release/release-management.md §2.6](../../docs/release/release-management.md)

### Done notes (2026-05-30)
Full release notes spec in `docs/release/release-management.md §Part 2`. Weekly Monday publish format (Added/Changed/Fixed/Security). Tags: 8 area tags (Map/API/Copilot/Alerts/Reports/Admin/Data/Performance/Security) × 6 persona tags (Analyst/Journalist/NGO/Enterprise/Developer/All). Screenshots/GIFs: required for every UI change (Loom/Kap, stored in DAM). In-app "What's new" panel: bell icon drawer, last 30 days filtered by user tier, dismissal tracked per-user, loads from `/api/changelog` edge-cached. Email digest: monthly to engaged users (≥1 login in 30 days), personalized by segment, one-click unsubscribe. RSS+Atom+JSON feeds: `/changelog/feed.xml` + `/changelog/feed.atom` + `/changelog/feed.json` + `/api/changelog?since=` API endpoint; force-static, 1h cache.

## i18n
- EN + UK; future locales as needed.

### Примітки
Notes that tell a story drive engagement. Bullet lists do not.
