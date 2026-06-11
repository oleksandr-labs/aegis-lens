# TODO — Networking

## Goal
Defensible network topology, low latency to users, traffic isolation.

## Progress
- 10 / 10 done

## Tasks
- [x] VPC topology (public/private/isolated subnets per env) → [networking.md §1](../../docs/infra/networking.md) (3-tier: public ALBs/NAT / private EKS nodes / isolated data stores)
- [x] Transit Gateway between accounts → §2 (dev→prod blocked; staging→prod read-only)
- [x] VPC endpoints to avoid public-internet egress for AWS services → §3 (S3 gateway + Interface endpoints for ECR/SM/SSM/MSK/EKS)
- [x] NAT gateways sized + monitored → §4 (per-AZ; BytesOutToDestination anomaly alert)
- [x] Bastion via SSM Session Manager (no public SSH) → §5 (no EC2 public IP; all sessions logged; kubectl via SSM tunnel)
- [x] WAF on public ALBs (Cloudflare or AWS WAF) → §6 (Cloudflare outer + AWS WAF inner; Authenticated Origin Pulls)
- [x] DDoS protection (Cloudflare or Shield Advanced) → §7 (Cloudflare primary; Shield Standard baseline)
- [x] mTLS between services (cert-manager + Cilium) → §8 (Cilium SPIFFE east-west; CF Authenticated Origin Pulls; TLS 1.2+ on all external)
- [x] Egress allow-list to known third parties → §9 (Cilium FQDN policy; ARB approval for new external deps)
- [x] Flow logs to OpenSearch for forensics → §10 (VPC Flow Logs → S3 → Lambda → OpenSearch; 90d hot + 1y Glacier)

## i18n
- N/A.

### Примітки
Public attack surface = ALBs only. Lock the rest down.

### Done notes (2026-05-30)
[docs/infra/networking.md](../../docs/infra/networking.md). Cloudflare Authenticated Origin Pulls prevent
ALB bypass. Cilium FQDN egress policy means unapproved outbound is dropped.
