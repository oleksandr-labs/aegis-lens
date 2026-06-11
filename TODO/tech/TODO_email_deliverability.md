# TODO — Email Deliverability

## Goal
Inbox-rate > 95% on transactional + > 80% on marketing. Reputation is hard to earn, easy to lose.

## Progress
- 11 / 11 done

## Tasks
- [x] DKIM + SPF + DMARC configured (strict policy) — `apps/web/src/lib/email/dns-records.ts` (REQUIRED_DNS_RECORDS, validateDnsSetup, DMARC_POLICY) + `docs/email/dns-setup.md`
- [x] BIMI for branded inbox — `apps/web/src/lib/email/bimi.ts` (BimiConfig, DEFAULT_BIMI_CONFIG, BIMI_DNS_RECORD, buildBimiHeader, checkBimiReadiness)
- [x] Per-traffic-type subdomain (`mail.`, `news.`, `alerts.`) — `apps/web/src/lib/email/subdomains.ts` (EmailSubdomain enum, SUBDOMAIN_CONFIG, getSenderAddress, getSubdomainForTrafficType)
- [x] Separate IPs / pools per traffic type (transactional vs marketing) — `apps/web/src/lib/email/ip-pools.ts` (IpPoolConfig, IP_POOL_CONFIGS, getPoolForMessage, IP_POOL_ENV_VARS, POOL_SEPARATION_RATIONALE)
- [x] Per-pool warm-up plan — `apps/web/src/lib/email/warmup-plan.ts` (WarmupDay, WARMUP_SCHEDULE 30-day, WarmupStatus, computeWarmupStatus, isWarmupComplete)
- [x] Bounce + complaint handling (auto-suppress) — `apps/web/src/lib/email/suppression-list.ts` (SuppressionEntry, InMemorySuppressionList, processBounceWebhook, processComplaintWebhook, suppressionList singleton)
- [x] Per-recipient engagement-based throttling — `apps/web/src/lib/email/engagement-throttle.ts` (EngagementScore, EngagementTier, computeEngagementTier, getThrottleConfig, shouldSendEmail)
- [x] Postmaster Tools (Google + Microsoft) monitoring — `apps/web/src/lib/email/postmaster-monitoring.ts` (PostmasterMetric, POSTMASTER_ALERT_THRESHOLDS, evaluatePostmasterMetrics) + `docs/email/postmaster-tools-setup.md`
- [x] Per-region deliverability per ISP tracking — `apps/web/src/lib/email/regional-deliverability.ts` (Region, RegionalDeliverabilityStats, mapCountryToRegion, computeRegionalStats, getRegionalRecommendations)
- [x] Quarterly reputation audit — `apps/web/src/lib/email/reputation-audit.ts` (ReputationAuditResult, AUDIT_CHECKLIST 20 items, generateAuditReport, QUARTERLY_AUDIT_TEMPLATE)
- [x] One-click unsubscribe (RFC 8058) — mandatory for Gmail / Yahoo bulk — `apps/web/src/lib/email/unsubscribe.ts` (UnsubscribeToken, generateUnsubscribeToken, verifyUnsubscribeToken, buildUnsubscribeHeaders) + `apps/web/src/app/api/email/unsubscribe/route.ts` (GET + POST)

## i18n
- Per-locale templates; per-region best practices.

### Примітки
Critical alerts MUST land. Pool isolation is non-negotiable.
