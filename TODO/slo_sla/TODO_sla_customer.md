# TODO — Customer-Facing SLA

## Per-tier
- [x] Free: no SLA, best-effort — apps/web/src/lib/slo/sla-tiers.ts (SLA_TIERS.free)
- [x] Pro: 99.5% uptime, 24h response support — apps/web/src/lib/slo/sla-tiers.ts (SLA_TIERS.pro)
- [x] Team: 99.9% uptime, 4h response — apps/web/src/lib/slo/sla-tiers.ts (SLA_TIERS.team)
- [x] Enterprise: 99.95% uptime, 1h response, 24/7 — apps/web/src/lib/slo/sla-tiers.ts (SLA_TIERS.enterprise)
- [x] Gov: 99.99% uptime contract-dependent — apps/web/src/lib/slo/sla-tiers.ts (SLA_TIERS.gov)

## Tasks
- [x] SLA published per tier — apps/web/src/lib/slo/sla-tiers.ts (SlaTier.slaPublished)
- [x] Service-credit policy per breach — apps/web/src/lib/slo/sla-tiers.ts (SERVICE_CREDIT_POLICY)
- [x] Per-region SLA variants if relevant — apps/web/src/lib/slo/sla-tiers.ts (REGIONAL_SLA_VARIANTS)
- [x] Monthly SLA report per enterprise customer — apps/web/src/lib/slo/sla-tiers.ts (ENTERPRISE_SLA_REPORT)
