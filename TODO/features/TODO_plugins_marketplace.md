# TODO — Plugins & Marketplace

## Goal
Open ecosystem: third-party data layers, custom widgets, AI tools, integrations. Moat + revenue share.

## Progress
- 15 / 15 done

## Tasks

### Plugin SDK
- [x] TypeScript SDK with strict typed manifests — `packages/plugin-sdk/src/types.ts` PluginManifest with typed fields; `@aegis/plugin-sdk`
- [x] Plugin types: data layer, widget, AI tool, action, exporter, notification channel — `PluginType` enum in plugin-sdk types
- [x] Sandbox runtime (iframe + postMessage for UI; isolated workers for compute) — `PluginBridge` class in `packages/plugin-sdk/src/host-api.ts`; postMessage protocol with typed HostMessage
- [x] Permission model (scopes, opt-in per org) — `PluginScope` type; scope validation on install; `InstalledPlugin.manifest.scopes`
- [x] Versioning + semver compatibility checks — `packages/plugin-sdk/src/versioning.ts`

### Marketplace UI
- [x] Public listing pages (SEO surfaces — per plugin) — `apps/web/src/lib/marketplace/listing-pages.ts`
- [x] Categories, search, filters — `apps/web/src/lib/marketplace/search.ts`
- [x] Ratings + verified-developer badges — `apps/web/src/lib/marketplace/ratings.ts`
- [x] Install / uninstall flow — `apps/web/src/lib/marketplace/install.ts`
- [x] Per-plugin docs & changelog — `apps/web/src/lib/marketplace/docs.ts`

### Developer experience
- [x] CLI scaffold (`create-aegis-plugin`) — `packages/plugin-sdk/src/cli-scaffold.ts`
- [x] Local dev mode (live reload against staging API) — `packages/plugin-sdk/src/dev-mode.ts`
- [x] Submission + review process (security + content review) — `apps/web/src/lib/marketplace/submission.ts`
- [x] Analytics for developers (installs, usage, errors) — `apps/web/src/lib/marketplace/dev-analytics.ts`

### Monetization
- [x] Paid plugins (Stripe Connect) with 80/20 split — `apps/web/src/lib/marketplace/paid-plugins.ts`
- [x] Org-internal private plugins (no marketplace listing) — `apps/web/src/lib/marketplace/private-plugins.ts`

## i18n
- Marketplace UI + plugin metadata localized.

### Примітки
Critical to never grant a plugin raw user data without explicit scope grants.
