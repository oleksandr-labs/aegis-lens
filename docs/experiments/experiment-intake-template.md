# Experiment Intake Template

Fill out this template before starting any A/B test or experiment.
Pre-registration prevents post-hoc rationalization.

---

## Experiment Metadata

| Field | Value |
|-------|-------|
| **Experiment ID** | EXP-NNN |
| **Name** | Short descriptive name |
| **Owner** | @person |
| **Team** | Growth / Product / Engineering |
| **Start date** | YYYY-MM-DD |
| **Expected end date** | YYYY-MM-DD (min 7 days, max 28 days) |
| **Status** | Draft / Running / Paused / Shipped / Killed |

---

## Hypothesis

> We believe that **[change]** will cause **[metric]** to **[increase/decrease]** by **[magnitude]** for **[population]** because **[reasoning]**.

**Example:**
> We believe that adding "Last 24h" as the default time filter in the map workspace will cause DAU-to-alert-creation conversion to increase by 8% for free-tier users because it reduces the friction of scoping results to current events.

---

## Primary Metric

| Field | Value |
|-------|-------|
| **Metric name** | e.g. alert_creation_rate |
| **Measurement** | e.g. alerts created per DAU per day |
| **Direction** | Increase / Decrease |
| **Minimum detectable effect (MDE)** | e.g. 5% relative |
| **Statistical significance** | 95% |
| **Power** | 80% |
| **Estimated sample size** | N users per variant |
| **Estimated runtime** | N days |

---

## Guardrail Metrics (must not regress)

| Metric | Threshold |
|--------|-----------|
| Map load time (p95) | ≤ 2.5s |
| API error rate | ≤ 0.5% |
| User session length | Must not decrease by > 10% |
| Churn (7-day) | Must not increase by > 2pp |

---

## Variants

| Variant | Description | Traffic split |
|---------|-------------|---------------|
| Control | Current behaviour | 50% |
| Treatment | [Describe change] | 50% |

---

## Eligibility / Targeting

- **User tiers:** Free / Pro / Enterprise / All
- **Locales:** EN / UK / All
- **Personas:** All / [specific persona]
- **New users only:** Yes / No
- **Platform:** Web / Extension / API / All
- **Exclusions:** [e.g. exclude trial users in first 3 days]

---

## Implementation

- **Feature flag:** `exp_NNN_description`
- **Assignment method:** Sticky bucketing by `user_id` (SHA-256 hash)
- **Log event:** `experiment_exposure` with `{ experiment_id, variant, user_id, ts }`
- **Tracking event:** `[specific_user_action]` as conversion

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|-----------|
| Sample pollution (shared accounts) | Low | Assign by org_id not user_id for org-level experiments |
| Novelty effect | Medium | Extend runtime; check week 2 vs week 1 |
| Segment heterogeneity | Low | Pre-stratify by tier; check per-tier results |

---

## Analysis Plan

1. **Primary analysis:** Chi-square test on conversion rate; t-test on continuous metrics
2. **Per-segment breakdown:** tier × locale × persona
3. **Early stopping rule:** Stop if guardrail breaches OR if experiment effect reaches p < 0.001
4. **Bayesian check:** Expected loss < 1% before shipping
5. **Decision rule:** Ship if p < 0.05 AND MDE achieved AND all guardrails green

---

## Sign-off

| Role | Person | Date |
|------|--------|------|
| Experiment owner | | |
| Data analyst | | |
| Engineering | | |
| Product lead | | |

---

## Pre-registration Checklist

- [ ] Hypothesis written before seeing any data
- [ ] Primary metric and MDE defined before running
- [ ] Sample size calculated using power analysis
- [ ] Guardrail metrics defined
- [ ] Targeting criteria documented
- [ ] Feature flag created
- [ ] Tracking event implemented and tested
- [ ] Sign-offs obtained
