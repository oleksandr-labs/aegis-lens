# TODO — Plugins & Dataset Marketplace Revshare

## Goal
Third-party developers and analysts publish plugins (custom layers, analytics, integrations) and datasets to our marketplace; we take a platform fee. Stripe Connect handles payouts.

## Progress
- 11 / 11 done

## Marketplace items
- [x] **Plugins** — custom UI panels, data overlays, analytics widgets, vertical extensions — apps/web/src/lib/marketplace/types.ts (MarketplaceItemType['plugin'])
- [x] **Workspace presets** — packaged dashboards / saved views — apps/web/src/lib/marketplace/types.ts (MarketplaceItemType['workspace-preset'])
- [x] **Datasets** — community-contributed verified datasets — apps/web/src/lib/marketplace/types.ts (MarketplaceItemType['dataset'])
- [x] **Alert rule packs** — pre-built complex rules for vertical use — apps/web/src/lib/marketplace/types.ts (MarketplaceItemType['alert-rule-pack'])
- [x] **AI prompt packs** — Copilot prompt libraries for niches — apps/web/src/lib/marketplace/types.ts (MarketplaceItemType['ai-prompt-pack'])
- [x] **Report templates** — custom PDF / brief styles — apps/web/src/lib/marketplace/types.ts (MarketplaceItemType['report-template'])

## Revenue model
- [x] **70/30 split** (creator / platform) for paid items — apps/web/src/lib/marketplace/revshare.ts (PLATFORM_FEE_PCT / CREATOR_SHARE_PCT)
- [x] **Free items** allowed, drive ecosystem — apps/web/src/lib/marketplace/revshare.ts (FREE_ITEMS_POLICY_EN/UK)
- [x] **Subscription items** (creator sells monthly) — apps/web/src/lib/marketplace/types.ts (RevshareModel)
- [x] **Featured placement** paid by creator (small fee, transparent label) — apps/web/src/lib/marketplace/revshare.ts (FEATURED_PLACEMENT_POLICY_EN/UK)
- [x] **Refund window** 7 days, charged to creator if refunded — apps/web/src/lib/marketplace/revshare.ts (REFUND_POLICY_EN/UK)

## Quality / safety
- [x] Review queue: ethics + security + perf — apps/web/src/lib/marketplace/quality-gate.ts (QUALITY_CHECKLIST)
- [x] Sandboxed runtime — apps/web/src/lib/marketplace/types.ts (MarketplaceItem.sandboxed)
- [x] Auto-disable on telemetry-anomaly (excessive resource use, data exfil) — apps/web/src/lib/marketplace/quality-gate.ts (AUTO_DISABLE_TRIGGERS_EN/UK)
- [x] Creator KYC for payouts (Stripe Connect Express) — apps/web/src/lib/marketplace/creator-kyc.ts (kycStore)
- [x] DMCA / takedown flow → [../legal_docs/TODO_takedown_licensing.md](../legal_docs/TODO_takedown_licensing.md) — apps/web/src/lib/marketplace/quality-gate.ts (DMCA_TAKEDOWN_POLICY_EN/UK)

## Linked files
- [../features/TODO_plugins_marketplace.md](../features/TODO_plugins_marketplace.md)
- [../integrations/TODO_stripe.md](../integrations/TODO_stripe.md)

### Примітки
Marketplace = довгостроковий moat. Запускати після Phase 3, не раніше.
