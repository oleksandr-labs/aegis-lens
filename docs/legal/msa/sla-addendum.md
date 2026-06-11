# Service Level Agreement (SLA) Addendum

> Attaches to the MSA. Uptime commitment and service credits scale by tier.
> Credits are the **sole and exclusive remedy** for availability failures
> (Enterprise termination right at sustained breach is the escape hatch).

---

## 1. Definitions

- **Monthly Uptime Percentage** = `(Total Minutes − Downtime Minutes) / Total
  Minutes × 100`, measured per calendar month.
- **Downtime** = sustained unavailability of the core API/UI confirmed by Aegis
  Lens monitoring, **excluding** Scheduled Maintenance and Exclusions (§4).
- **Scheduled Maintenance** = maintenance announced at least 48 hours in advance,
  within the published maintenance window.

## 2. Uptime commitment by tier

| Tier | Monthly Uptime Target | Support response (P1) | Credit schedule |
| --- | --- | --- | --- |
| **Standard** | 99.5% | 1 business day | §3 table |
| **Pro** | 99.9% | 4 business hours | §3 table |
| **Enterprise** | 99.95% | 1 hour, 24×7 | §3 table + termination right |

## 3. Service credits

If Monthly Uptime falls below the tier target, Customer may request a credit
against the next invoice:

| Monthly Uptime | Credit (% of monthly fee for affected Service) |
| --- | --- |
| Below target but ≥ 99.0% | 10% |
| ≥ 95.0% but < 99.0% | 25% |
| < 95.0% | 50% |

Credits are requested in writing within 30 days of the affected month, capped at
50% of that month's fee, and are the **sole and exclusive remedy** for failing
to meet the uptime target — except (Enterprise only) Customer may terminate the
affected Order Form for cause if uptime is below target for `[3]` consecutive
months, with a pro-rata refund of prepaid unused fees.

## 4. Exclusions

Downtime does not include unavailability caused by: Scheduled Maintenance;
factors outside Aegis Lens's reasonable control (force majeure, internet/ISP
failures, upstream OSINT-source outages — see the source-outage runbook);
Customer's equipment, software, or network; Customer's breach of the AUP or
misuse; or suspension for non-payment or security risk.

## 5. Support and escalation

Support channels, hours, and escalation paths are defined per tier in the
support documentation. P1 = production down / no workaround; P2 = major
degradation; P3 = minor; P4 = question. Response targets in §2 are time-to-first-
response, not time-to-resolution.

## 6. Status and reporting

Aegis Lens maintains a public status page and posts incident notices there.
Enterprise customers receive a monthly availability report on request.
