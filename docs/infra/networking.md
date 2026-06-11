# Networking

> Defensible network topology, low latency to users, traffic isolation.
> **Public attack surface = ALBs only. Lock the rest down.**

## 1. VPC topology (per environment)

Each AWS account/environment has an identical VPC structure (Terraform module
at `infra/terraform/modules/network/`):

```
VPC  10.x.0.0/16
├── Public subnets     (3 AZs)  10.x.0.0/22  — ALBs, NAT gateways, Bastion NLB
├── Private subnets    (3 AZs)  10.x.16.0/20 — EKS nodes, Lambda, app services
└── Isolated subnets   (3 AZs)  10.x.64.0/20 — RDS, ElastiCache, MSK — NO internet egress
```

- **Public subnets**: only ALBs and NAT gateways. No EC2 instances with public IPs.
- **Private subnets**: EKS worker nodes; can reach the internet via NAT. Security
  groups restrict inter-service traffic; Cilium network policies layer on top.
- **Isolated subnets**: data stores only. No NAT, no IGW route. Reachable only
  from the private subnets via security-group rules.

## 2. Transit Gateway (cross-account)

A **Transit Gateway** connects the prod-EU, prod-US, staging, and dev VPCs:
- Route tables are configured so dev → prod traffic is **blocked** by default.
- Staging → prod traffic is read-only (monitoring only, no write paths).
- Cross-region VPC peering or TGW peering handles eu-central-1 ↔ us-east-1 for
  ingest-worker → Kafka replication paths.

## 3. VPC endpoints (no public-internet egress for AWS services)

VPC Interface Endpoints configured for all AWS services the platform uses:

| Service | Endpoint type |
| --- | --- |
| S3 | Gateway endpoint (free) |
| ECR (API + DKR) | Interface endpoint |
| Secrets Manager | Interface endpoint |
| SSM | Interface endpoint |
| CloudWatch Logs | Interface endpoint |
| Kinesis / MSK | Interface endpoint |
| EKS API server | Private endpoint only (no public) |

With these endpoints, no AWS API traffic traverses the public internet.
EKS API server is private — `kubectl` access requires VPN or SSM.

## 4. NAT gateways — sized and monitored

- One **NAT gateway per AZ** (not one per VPC) to avoid cross-AZ data-transfer
  costs and single-NAT-gateway blast radius.
- Metrics monitored: `BytesOutToDestination`, `ConnectionEstablishedCount`.
- Alert: unexpected spike in NAT egress > 10× baseline → potential data exfil
  signal → security team paged.
- NAT is the expensive egress path; VPC endpoints (§3) minimize its use.

## 5. Bastion access — SSM Session Manager (no public SSH)

- **No bastion EC2 with public IP** or open `port 22`. All operator access to
  private instances is via **AWS Systems Manager Session Manager**.
- SSM Session Manager:
  - No inbound security-group rule needed.
  - All sessions logged to CloudWatch Logs + S3 (audit trail).
  - IAM-controlled: only roles with `ssm:StartSession` can connect.
- For Kubernetes: `kubectl` via EKS private endpoint + `aws eks update-kubeconfig` +
  SSM tunnel. No cluster exposed publicly.

## 6. WAF on public ALBs

Two-layer WAF:

- **Cloudflare WAF** (outer layer): handles DDoS, bot management, OWASP top-10
  rules, and the pre-staged attack-signature rules from the
  [DDoS runbook](../security/ddos-response-runbook.md#4-pre-staged-waf-rule-groups).
  Cloudflare terminates TLS and forwards to origin over HTTPS.
- **AWS WAF** (inner layer, on the ALB): catches anything that passes Cloudflare.
  Rules: rate-limit per IP, block known-bad ASNs, geo-block (only for isolated
  admin endpoints), and SQL-injection / XSS managed rule groups.

**Cloudflare Authenticated Origin Pulls** ensure the ALB only accepts
connections from Cloudflare IPs, preventing direct origin bypass.

## 7. DDoS protection

- **Cloudflare** (primary): L3/L4/L7 protection, "I'm Under Attack" mode, bot
  management. Handles 99% of DDoS before traffic reaches AWS.
- **AWS Shield Standard** (baseline, free): included. **Shield Advanced** is
  evaluated if Cloudflare absorption proves insufficient at Tier 3 scale.
- See [DDoS response runbook](../security/ddos-response-runbook.md) for the
  full mitigation ladder.

## 8. mTLS between services

- **East-west** (pod-to-pod inside EKS): Cilium Mutual Auth with SPIFFE/SVID
  identities. No plaintext service communication inside the cluster.
- **Cloudflare → origin**: Cloudflare Authenticated Origin Pulls (client certs).
- **Origin → external APIs** (Anthropic, DeepL, etc.): standard TLS 1.2+ with
  certificate pinning for critical upstream APIs.
- See [security architecture](../architecture/security-architecture.md#3-network-controls)
  for the full network-security overlay.

## 9. Egress allow-list

Ingest and AI pods have a strict **egress network policy** (Cilium FQDN policy):

```yaml
egress:
  - toFQDNs:
    - matchName: "api.anthropic.com"
    - matchName: "api.openai.com"
    - matchName: "api.mapbox.com"
    - matchName: "nominatim.openstreetmap.org"
    # ... explicit list per service
  toPorts:
    - ports: [{ port: "443", protocol: TCP }]
```

Any unapproved outbound connection is dropped. New external dependencies go
through an ARB review before the FQDN is added to the allow-list.

## 10. Flow logs → OpenSearch (forensics)

- **VPC Flow Logs** enabled for all VPCs, captured to S3 → streamed to
  OpenSearch via Lambda.
- Retained 90 days (hot) + 1 year (S3 Glacier) for forensic analysis.
- Queries used in: [security incident runbook](../security/security-incident-runbook.md)
  (§4 forensic snapshotting), NAT egress anomaly detection (§4 alert), and
  the DDoS post-incident forensic capture (§6 log capture).
- Dashboard in OpenSearch / Grafana: top talkers by source/destination, unusual
  protocol patterns, cross-subnet flows.
