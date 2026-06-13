# Model Governance Extensions

> Sprint 2.73 — closes open tasks in `TODO/research/TODO_model_governance.md`
> Extends the existing `docs/ai/model-registry.md`

## Open Tasks Implemented

### 1. License Tracking (Open-Weights Models)

All open-weights models must have a completed license entry before deployment.

#### License Inventory Table

| Model | License | Commercial Use | Restrictions | Review Date |
|-------|---------|----------------|--------------|-------------|
| Mistral 7B | Apache 2.0 | Yes | Attribution required | 2026-01-15 |
| Llama 3.1 8B | Meta Llama 3.1 Community | Yes (≥700M DAU requires addendum) | No use to train competing LLMs | 2026-01-15 |
| Whisper v3 | MIT | Yes | None | 2025-12-01 |
| CLIP ViT-L/14 | MIT | Yes | None | 2025-12-01 |
| MapTiler vector tiles | MapTiler Hosting | Yes | Per-request pricing; no sublicensing | 2026-03-01 |

#### License Change Monitoring

- Legal team subscribes to upstream license change alerts (GitHub releases, official changelogs)
- License field in model registry must be re-reviewed when: model version changes, upstream license changes, usage exceeds tier thresholds
- Any license conflict (e.g., copyleft contamination of proprietary components) escalates to CTO + Legal within 48h

---

### 2. Shadow Deployment

Shadow deployment runs a new model version **alongside** the current production model. Traffic is duplicated; shadow model responses are logged but not served to users. Divergence between models is analysed to catch regressions before promotion.

#### Process

```
1. New model version passes eval suite (existing gate)
2. Deploy to shadow slot (separate container, same infra cluster)
3. Traffic mirror: 100% of prod requests duplicated to shadow
4. Shadow responses: logged to S3 / ClickHouse shadow_predictions table
5. Divergence dashboard: compare prod vs shadow on:
   - Classification accuracy on live data (sample-graded)
   - Confidence distribution (check for systematic shifts)
   - Latency p50/p95/p99
   - Token cost per request
   - Error rate
6. Shadow period: minimum 48h for low-risk models; 7 days for copilot / classifier
7. Human review: ML engineer signs off on divergence report
8. Promote or reject based on report
```

#### Divergence Thresholds (auto-reject shadow promotion)

| Metric | Threshold |
|--------|-----------|
| Classification accuracy drop | > 2 percentage points |
| p95 latency increase | > 30% |
| Token cost increase | > 20% |
| Error rate increase | > 0.5 percentage points |
| Confidence mean shift | > 0.05 absolute |

---

### 3. Canary Deployment

After shadow passes, canary serves real traffic to a small user slice.

#### Process

```
1. Shadow period complete + divergence report approved
2. Canary: route 5% of production traffic to new model version
3. Monitor for 24h:
   - Error rate (auto-rollback if > baseline + 1%)
   - User-reported quality issues (copilot thumbs-down rate)
   - Latency SLOs
4. If stable: ramp to 25%, then 50%, then 100%
5. Each ramp step: 24h observation minimum
6. If any regression: immediate rollback (see auto-rollback below)
```

#### Traffic Split Implementation

- Feature flag in `apps/web/src/lib/feature-flags.ts`: `model_version_canary`
- Value: `{ modelId: "classifier-v2.1", trafficPct: 5 }`
- Canary assignment: user ID hash deterministic (same user always hits same model)
- Sticky canary: once a user is in canary cohort, they stay for the full ramp

---

### 4. Auto-Rollback on Regression

Automatic rollback triggers without human intervention when error rate or quality signals cross thresholds.

#### Rollback Triggers

| Signal | Threshold | Action |
|--------|-----------|--------|
| Model error rate | > baseline + 2% for 5 min | Auto-rollback + PagerDuty alert |
| p99 latency | > 10s for 5 min | Auto-rollback + alert |
| Copilot refusal rate | > 15% for 10 min | Auto-rollback + alert |
| Copilot harmful output rate | > 0% (any confirmed) | Immediate rollback + incident |
| Classifier F1 drop | > 5pp on live sample (15 min window) | Auto-rollback + alert |

#### Rollback Mechanism

```yaml
# infra/k8s/model-deployment.yaml (excerpt)
spec:
  strategy:
    type: RollingUpdate
  rollback:
    trigger: health-check-failure
    targetRevision: previous  # Always rollback to immediately prior version
```

- Rollback completes in < 60 seconds (Kubernetes revision rollback)
- Rollback event logged in model registry with: timestamp, trigger signal, affected model version
- Post-rollback: automatic incident ticket created in Linear with severity based on trigger
- Rollback runbook: `docs/security/ai-regression-runbook.md`

---

### 5. Prediction Drift Detection

Monitors for distribution shift in model inputs and outputs over time.

#### Input Drift

Monitors feature distributions of incoming data against a reference window (rolling 7-day baseline).

- **Event text length distribution**: flag if median shifts > 30%
- **Source diversity**: flag if top-3 sources account for > 60% of events (concentration risk)
- **Geographic distribution**: flag if oblast distribution shifts significantly (could indicate data pipeline issue or real battlefield change — disambiguate)
- **Language distribution**: flag if non-EN/UK content exceeds 20% (classifier trained on EN/UK)

Detection method: Population Stability Index (PSI). PSI > 0.2 triggers alert.

#### Output Drift

Monitors model prediction distributions.

- **Confidence distribution**: rolling mean + std. Flag if mean shifts > 0.05 or std changes > 50%
- **Class distribution**: flag if any class frequency changes > 20pp week-over-week
- **Sentiment/tone of copilot responses**: embedding drift via cosine similarity on response centroids

Tooling: Evidently AI (open-source) deployed as sidecar to model service.

---

### 6. Output Quality Sampling + Human Grading

Weekly sample-based quality review to catch regressions not visible in automated metrics.

#### Sampling Protocol

- **Classifier**: 200 random events/week stratified by: event type (20 per class), confidence band (low/mid/high), source tier
- **Copilot**: 50 random copilot sessions/week; sample ≥ 1 query per session
- **Rule builder parser**: 50 random rule parses/week

#### Grading Rubric — Classifier

| Grade | Criteria |
|-------|----------|
| Correct | Label matches analyst ground truth |
| Acceptable | Label is defensible given ambiguity |
| Wrong class | Misclassified event type |
| Wrong confidence | Confidence severely over- or under-stated (>0.3 off) |
| Harmful | Classification could enable harm if acted upon |

#### Grading Rubric — Copilot

| Dimension | Score 1–5 |
|-----------|-----------|
| Factual accuracy | 1 = fabricated, 5 = verifiably accurate |
| Source citation | 1 = no citations, 5 = all claims cited |
| Appropriate refusal | 1 = refused safe query, 5 = correctly handled |
| Clarity | 1 = confusing, 5 = clear and concise |
| Appropriate tone | 1 = inflammatory / sensational, 5 = professional / neutral |

#### SLAs

- Accuracy on classifier sample: > 92% (Correct + Acceptable)
- Copilot factual accuracy mean: > 4.0 / 5.0
- Human grading completed within 5 business days of sample pull
- Results logged to `model-registry.md` per model version

---

### 7. Cost per Prediction Tracking

Tracked per model version in the model registry (`costPerPrediction` field).

| Model | Cost metric | Target | Current |
|-------|------------|--------|---------|
| Event classifier | $/1000 events | < $0.02 | — |
| Copilot (Claude Haiku) | $/session | < $0.01 | — |
| Rule builder parser (Claude Haiku) | $/parse | < $0.005 | — |
| Summariser | $/report | < $0.05 | — |
| Image forensics | $/image | < $0.10 | — |

Cost tracked via: token counts × provider pricing × inference time for self-hosted models.  
Alert: cost per prediction increases > 50% vs. previous version → investigation before promotion.

---

### 8. Per-Model Latency p50/p95/p99

SLO targets per model, measured at inference service boundary (not including network RTT to client).

| Model | p50 target | p95 target | p99 target |
|-------|-----------|-----------|-----------|
| Event classifier | 80ms | 200ms | 500ms |
| Copilot (streaming first token) | 600ms | 1200ms | 2000ms |
| Rule builder parser | 400ms | 900ms | 1500ms |
| Report summariser | 2s | 5s | 10s |
| Image forensics | 1s | 3s | 6s |

Measured via: OpenTelemetry traces → ClickHouse → Grafana dashboard.  
SLO breach: p99 > target for > 5% of requests in any 5-minute window → PagerDuty.

---

### 9. Data Provenance for Training

Required for any model trained or fine-tuned internally. N/A for API-only models (Claude, GPT).

#### Provenance Record

Each training dataset must document:

```yaml
dataset:
  id: "aegis-classifier-v2-train"
  model_trained: "event-classifier-v2.1"
  sources:
    - name: "ACLED Ukraine conflict events 2022–2025"
      license: "Academic use with attribution"
      commercial_ok: false  # ← requires separate commercial license
      url: "https://acleddata.com"
      hash_sha256: "<sha256 of downloaded snapshot>"
      snapshot_date: "2025-11-01"
    - name: "Internal analyst-labelled events"
      license: "Proprietary (Aegis Lens)"
      commercial_ok: true
      count: 12450
      label_process: "dual-annotator with adjudication"
      inter_annotator_agreement: 0.87  # Cohen's kappa
  pii_check:
    completed: true
    method: "presidio scan + manual review of 10% sample"
    pii_found: false
  bias_assessment:
    completed: true
    findings: "Geographic bias toward Eastern Ukraine (85% of events); mitigated by upsampling other regions"
```

---

### 10. Right-to-Explanation for High-Impact Outputs

High-impact outputs = outputs used to make decisions affecting individuals (e.g., risk score on a person's location, population movement risk ratings used by NGOs for evacuation planning).

#### Implementation

1. **Explanation endpoint**: `POST /api/explain` accepts an event ID or copilot response ID and returns:
   - Top 3 features driving the confidence score
   - Source citations with trust scores
   - Which rule/model version produced the output
   - Uncertainty quantification (confidence interval, not just point estimate)

2. **UI**: Every high-impact confidence chip has an info icon → explanation popover

3. **Audit log**: Every explanation request logged (who, when, which output) — retained 2 years

4. **Model card disclosure**: Every model card in `docs/ai/model-registry.md` discloses:
   - What the model output means for decision-making
   - Known failure modes
   - Populations where the model performs worse (geographic / source diversity gaps)

5. **Operator responsibility**: Organisations using the API for automated decision-making must disclose in their DPA that explanations are available on request (see `docs/legal/dpa.md`)
