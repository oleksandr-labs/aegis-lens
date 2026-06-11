# Cost Model Overlay

> Per-architectural-choice cost breakdown so engineering decisions have a
> financial dimension. Updated at each growth-tier transition. Companion to
> [`scalability-plan.md`](scalability-plan.md) — scaling decisions have cost
> consequences.

## 1. Philosophy

- **Cost follows architecture.** Every major tech choice has a cost implication;
  document it at decision time (in the ADR) so it's not a surprise at invoice time.
- **Optimize for unit economics, not total bill.** The metric is
  `cost per 1000 API calls` or `cost per seat`, not monthly AWS spend.
- **Don't pre-optimize.** At < 1k DAU, simplicity > cost efficiency. At 10k+
  DAU, optimize the top-3 cost drivers — everything else is noise.

## 2. Cost drivers by growth tier

### Tier 1 — MVP (< 1k DAU)

| Category | Est. monthly | Main driver |
| --- | --- | --- |
| AWS (RDS t3.large, EKS t3.medium ×3, MSK t3.small) | ~$600 | Compute baseline |
| Vercel Pro | $20 | Web hosting |
| Cloudflare Pro / Business | $20–200 | CDN + WAF |
| Anthropic (Claude API) | $50–200 | Token usage (briefings, copilot) |
| Mapbox / MapLibre | $0–50 | Tile requests (MapLibre self-hosted = $0) |
| **Total** | **~$700–1,100 / mo** | |

### Tier 2 — Growth (10k DAU)

New costs vs. Tier 1:
| Addition | Est. increment |
| --- | --- |
| RDS read replica (r6g.large) | +$200/mo |
| ElastiCache Redis (r7g.small cluster) | +$200/mo |
| Kafka MSK scale (6 brokers) | +$400/mo |
| Qdrant EKS node (r6i.xlarge) | +$300/mo |
| LLM costs (10× usage) | +$1,000–3,000/mo |
| Elasticsearch (r6g.large ×2) | +$500/mo |
| **Tier 2 total** | **~$3,300–5,700/mo** |

### Tier 3 — Scale (100k DAU)

New costs vs. Tier 2:
| Addition | Est. increment |
| --- | --- |
| Multi-AZ RDS (r6g.2xlarge), PITR | +$800/mo |
| GPU node group (g4dn.xlarge ×2 for vLLM) | +$1,200/mo |
| Kafka MSK (9 brokers, 3 AZs) | +$800/mo |
| us-east-1 secondary region (EKS + RDS replica) | +$1,500/mo |
| LLM / AI inference (100× vs Tier 1) | +$8,000–20,000/mo |
| S3 data lake + Athena / Trino | +$300/mo |
| **Tier 3 total** | **~$16,000–35,000/mo** |

## 3. Top cost drivers and optimization levers

| Driver | At Tier 3 | Optimization |
| --- | --- | --- |
| **LLM API calls** | 50–60% of bill | Cache common briefings; batch non-urgent; route simpler tasks to cheaper models; self-host NLLB for translation |
| **EKS compute** | 15–20% | Karpenter spot instances for stateless services (save 60–70%); Graviton (ARM) instances for Go/Node services (save 20%) |
| **RDS** | 10–15% | Read replicas; partition pruning; materialized views; TimescaleDB compression for old time-series |
| **Kafka (MSK)** | 5–10% | Tune retention to 7 days (vs. 30); use tiered storage for cold offsets |
| **Data egress** | 5–10% | Cloudflare proxies most traffic; minimize cross-region transfer; use S3 Transfer Acceleration only when needed |

## 4. Per-seat unit economics target

| Tier | Target gross-margin contribution | Notes |
| --- | --- | --- |
| Pro ($X/mo) | > 70% | Minimal human CSM; self-serve support |
| Team ($Y/mo/seat) | > 65% | Shared CSM pool |
| Enterprise | > 60% | Named CSM + dedicated slack; higher infra headroom |

Finance tracks `gross margin per tier` monthly (revenue minus COGS: hosting + LLM
+ support FTE allocated). If a tier drops below target, the first lever is LLM
cost (§3), then support automation (KB deflection), then pricing.

## 5. ADR cost annotations

Every ADR for an infrastructure or AI choice includes a **Cost** section
estimating the monthly cost at Tier 1/2/3. This prevents "it's just a small
service" choices that become $5k/mo surprises.

Example pattern (from an ADR):
```
## Cost
- Tier 1 (~1k DAU): ~$200/mo (r6i.large, 1 node)
- Tier 2 (~10k DAU): ~$600/mo (r6i.xlarge, 2 nodes)
- Tier 3 (~100k DAU): ~$2,000/mo (r6i.2xlarge, 3 nodes + read replica)
Trigger for upgrade: memory utilization > 70% sustained for 2 weeks.
```
