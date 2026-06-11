# TODO — Technical Risk

## Goal
Single-vendor dependencies, license sudden-changes, scaling bottlenecks tracked + mitigated.

## Progress
- 10 / 10 done ✅ COMPLETE (Sprint 2.56)

## Watch list
- [x] LLM cost spike (Anthropic + OpenAI pricing volatile) → [docs/risk/risk-register.md §5.1](../../docs/risk/risk-register.md)
- [x] LLM API outage (multi-provider hedge) → [docs/risk/risk-register.md §5.2](../../docs/risk/risk-register.md)
- [x] Mapbox / commercial-satellite license shift → [docs/risk/risk-register.md §5.3](../../docs/risk/risk-register.md)
- [x] Telegram / X API restrictions (we've seen X change) → [docs/risk/risk-register.md §5.4](../../docs/risk/risk-register.md)
- [x] Key open-weights model deprecation → [docs/risk/risk-register.md §5.5](../../docs/risk/risk-register.md)
- [x] Cloud vendor lock-in → [docs/risk/risk-register.md §5.6](../../docs/risk/risk-register.md)
- [x] Postgres scaling ceiling → [docs/risk/risk-register.md §5.7](../../docs/risk/risk-register.md)
- [x] CDN / WAF single-vendor dependency → [docs/risk/risk-register.md §5.8](../../docs/risk/risk-register.md)
- [x] Source breakage (any major upstream goes silent) → [docs/risk/risk-register.md §5.9](../../docs/risk/risk-register.md)
- [x] Per-vendor exit plan documented → [docs/risk/risk-register.md §5.10](../../docs/risk/risk-register.md)

## Ops
- [x] Multi-vendor abstraction layer → [docs/risk/risk-register.md §5.11](../../docs/risk/risk-register.md)
- [x] Quarterly technical-risk review → [docs/risk/risk-register.md §5.12](../../docs/risk/risk-register.md)

### Done notes (2026-05-30)
Full technical risk in `docs/risk/risk-register.md §Part 5`. LLM cost: prompt caching > 70% cache target, open-weights fallback, multi-provider Claude→OpenAI→Gemini, alert if > 15% MRR. LLM outage: circuit breaker 60s → automatic failover; graceful degrade to keyword-only. Mapbox: MapLibre fallback maintained + tested quarterly; Maptiler alternative; self-hosted tiles for Ukraine AOI; negotiate before $1M ARR. Telegram/X: Bot API only (permitted), X stopped as primary source, OVA + CERT-UA direct feeds as hedge. Model deprecation: version pinning, multiple embedding options, translation fallback chain (DeepL→NLLB→Argos). Cloud lock-in: Kubernetes-first, Terraform portable, Hetzner for batch, S3-compatible storage only. Postgres: read replicas + ClickHouse analytical, partitioning by month, Qdrant for vectors, Elasticsearch for FTS. CDN: dual-CDN (Cloudflare primary + CloudFront secondary). Source breakage: per-source freshness monitor, format-change detection, 4h response SLA for tier-1. Exit plans table: Mapbox 2–4 weeks, Claude 1–3 days, AWS 2–4 weeks. Abstraction layer: LLMProvider + TileProvider + EmbedProvider interfaces — no direct SDK calls in business logic.

## i18n
- N/A.

### Примітки
Hedge structurally. One pricing change ≠ one bad week if you've hedged.
