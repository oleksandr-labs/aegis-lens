# Architecture Public Summary

> A public-safe overview of how Aegis Lens is built — for the Trust Center,
> enterprise procurement, and security questionnaires. No sensitive detail:
> no specific IP ranges, no security-control gaps, no internal service names
> that aid reconnaissance.

## What Aegis Lens is

Aegis Lens is a **conflict-intelligence platform** that ingests, verifies, and
delivers real-time situational awareness from open-source (OSINT) data sources.
It is used by humanitarian organizations, defense analysts, journalists,
researchers, and financial risk teams monitoring the Ukrainian conflict and
adjacent regions.

## How the system is structured

The platform is a **cloud-native, multi-tier system** built on AWS (primary
region in the EU for GDPR data residency), delivered globally via Cloudflare's
network.

| Layer | Technology | Notes |
| --- | --- | --- |
| Web application | Next.js on Vercel Edge | Server-side rendered for SEO; content delivered from the edge |
| API | TypeScript services on Kubernetes | Horizontally scalable; multi-AZ |
| Data processing | Kafka event backbone + Temporal workflows | Fault-tolerant, replayable |
| Database | PostgreSQL with PostGIS | Spatial event data; row-level security for multi-tenancy |
| AI/ML | Anthropic Claude + open-weight models | Briefing generation, verification assistance, translation |
| CDN / DDoS protection | Cloudflare | Global DDoS mitigation; WAF; DNS |

## Security controls (summary for procurement)

| Control | In place |
| --- | --- |
| Encryption in transit | TLS 1.2+ everywhere; mTLS within the platform |
| Encryption at rest | AES-256 on all data stores |
| Access control | Role-based; row-level security; MFA for all admin accounts |
| Vulnerability scanning | Automated in CI/CD; dependency + container image scanning |
| Penetration testing | Annual third-party pen test |
| Incident response | Documented runbooks; < 72h breach notification (GDPR) |
| Secret management | Centralized secrets manager; automated rotation |
| Logging & monitoring | Immutable audit logs; real-time anomaly alerting |

For detailed security controls, request our **SOC 2 report** or complete our
security questionnaire (contact: security@aegis-lens.com).

## Data handling

- **EU data residency:** Personal data of EU residents is stored and processed
  in AWS eu-central-1 (Frankfurt, Germany).
- **Subprocessors:** listed at our Trust Center (see subprocessor list).
- **Data protection:** governed by our [Data Processing Agreement](../legal/dpa.md),
  which covers GDPR, UK GDPR, and Swiss FADP.
- **Source protection:** human-source identities are isolated, encrypted, and
  access-logged. PII is redacted from the processing pipeline before storage.

## Availability

- We target 99.9% monthly uptime for Pro/Team and 99.95% for Enterprise (per
  our SLA).
- Multi-availability-zone deployment; Cloudflare provides an additional
  availability layer at the network edge.
- A public status page (status.aegis-lens.com) reports real-time availability.

## Compliance

| Framework | Status |
| --- | --- |
| GDPR | Compliant — DPA + SCCs + subprocessor management |
| UK GDPR / DPA 2018 | Compliant — UK IDTA for transfers |
| Swiss FADP | Compliant |
| SOC 2 Type II | In progress |
| ISO 27001 | Roadmap |

Questions? → security@aegis-lens.com or your account CSM.
