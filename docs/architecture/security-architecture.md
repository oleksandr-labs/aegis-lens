# Security Architecture Overview

> Where security controls sit in the system. Companion to the
> [threat model](../../TODO/security_ops/TODO_threat_modeling.md) (TBD) and the
> [incident runbooks](../security/). This page covers architecture; the runbooks
> cover response.

## 1. Defence-in-depth layers

```
Internet
   │
   ▼
[Cloudflare] ── WAF · DDoS · Bot management · Rate limiting · TLS termination
   │
   ▼
[Origin — EKS Ingress / ALB] ── mTLS (Cilium), network policy
   │
   ├── [API Gateway / Fastify] ── Auth (JWT/session) · RBAC · Input validation · Rate limit
   │         │
   │         ├── [App services] ── Least-privilege IAM · No direct DB access without service account
   │         │
   │         └── [AI services] ── Prompt injection mitigations · Output scrubbing · PII redaction
   │
   ├── [Data stores] ── RLS (Postgres) · Encryption at rest · Network-isolated subnets
   │
   └── [Ingest pipeline] ── Source verification · PII redaction · No raw PII in Kafka
```

## 2. Authentication & authorisation

- **User auth:** Passwordless / OAuth 2.0 (magic link + Google/GitHub SSO);
  sessions via short-lived JWTs + refresh tokens stored as httpOnly cookies.
  MFA enforced for Enterprise and admin accounts.
- **API auth:** API key (scoped per-customer, per-environment) + per-key rate
  limits. Keys stored hashed (BLAKE2b); rotated on any suspected compromise.
- **RBAC:** Role-based at the service layer and enforced at the **Postgres RLS**
  level (so even a misconfigured service can't leak cross-tenant data). Roles:
  `viewer` / `analyst` / `admin` / `system-service`.
- **Service-to-service:** mTLS via Cilium (east-west); no plaintext service
  communication inside the cluster. Service accounts have least-privilege IAM
  policies (no wildcard `s3:*` or similar).

## 3. Network controls

- **No public exposure of data stores.** Postgres, Kafka, Redis, Qdrant are in
  private subnets; reachable only from within the VPC via security-group allow-
  lists.
- **Egress filtering** for AI/ingest pods (restricts outbound to known source
  endpoints and API providers — limits blast radius of a supply-chain compromise).
- **Kubernetes network policies** (Cilium): default-deny all; allow only declared
  source→destination pairs. Each service can only talk to what it needs.
- **Cloudflare Authenticated Origin Pulls** (MTLS on the Cloudflare→origin leg):
  origin only accepts traffic from Cloudflare IPs, preventing direct bypass.

## 4. Secrets & credential management

- All secrets in **AWS Secrets Manager**; injected by External Secrets Operator.
  No secrets in Docker images, Git, or plain env vars.
- Automated rotation for: RDS passwords (RDS rotation Lambda), short-lived AWS
  credentials (IRSA / OIDC — no static IAM keys in pods).
- Manual-rotated secrets (API keys, Anthropic, etc.) have a rotation runbook and
  are documented in [secrets-management.md](../security/secrets-management.md).
- `gitleaks` pre-commit hook + CI scan prevents secrets landing in Git.

## 5. Data-at-rest & in-transit encryption

- **At rest:** AES-256 on all RDS volumes, S3 buckets, and EBS. Qdrant data
  on encrypted EBS. Application-layer encryption for the most sensitive fields
  (source identity data) using a customer-managed KMS key.
- **In transit:** TLS 1.2+ everywhere. Cloudflare terminates TLS at the edge;
  Cloudflare-to-origin over mTLS. Internal cluster traffic via Cilium mTLS.

## 6. PII & source-protection controls

- **Ingest pipeline PII redaction:** before any raw event enters Kafka, the PII
  redaction service strips / pseudonymises identifiers (phone numbers, IDs,
  coordinates precise to individual buildings for civilian events).
- **Source identity**: stored in a separate, access-controlled table with column-
  level encryption; never appears in the main event log or Kafka topics.
- **Audit log**: every access to source-identity or sensitive-event data is
  logged immutably (append-only audit table + S3 export).
- **Right-to-erasure** flow: GDPR deletion requests are handled via the
  [DPA](../legal/dpa.md) workflow; source opt-out registry blocks re-ingestion.

## 7. Vulnerability management

- **CI gates:** `trivy fs` (container + OS deps), `Snyk` (npm/pip deps),
  `Semgrep` (SAST rules) — CRITICAL/HIGH unfixed = build fails.
- **Runtime scanning:** `trivy` on deployed images in EKS via admission webhook;
  CRITICAL = pod rejected.
- **Penetration testing:** annual third-party pen test + scope-limited bounty
  program (responsible-disclosure via `/.well-known/security.txt`).
- **Patch cadence:** OS/runtime patches within 7 days (CRITICAL), 30 days
  (HIGH), next sprint (MEDIUM/LOW).

## 8. Supply-chain controls

- All container images pinned to immutable SHA digests (no `:latest`).
- `gitleaks` + GitHub secret scanning enabled.
- Dependabot auto-PRs for dependency updates; security advisories trigger
  immediate patch.
- Build artifacts signed and verified (Cosign / SLSA Level 2 target).
- AI model checksums verified before loading; models served from internal
  registry, not pulled from public registries at runtime.

## 9. Monitoring & detection

- **SIEM / log correlation**: Loki + OpenSearch; critical alert rules routed to
  PagerDuty (brute-force login, anomalous API usage, RLS bypass attempts,
  unusual data-export volumes).
- **Cloudflare analytics**: bot-score spikes, geographic anomalies, WAF events
  — reviewed daily by Security.
- **Langfuse**: LLM prompt-injection attempts and anomalous output patterns are
  logged and reviewed.
- See [security-incident runbook](../security/security-incident-runbook.md) for
  response flow.
