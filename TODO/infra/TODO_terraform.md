# TODO — Terraform / IaC

## Goal
All infra defined, reviewed, and reproducible.

## Progress
- 3 / 10 done

## Tasks
- [x] Terraform workspace per env (prod / staging / dev) — `infra/terraform/main.tf` uses `terraform.workspace`
- [x] Module structure (network, eks, rds, s3, iam, kafka, observability) — `modules/network`, `modules/rds`, `modules/s3` implemented; eks/kafka stubs referenced
- [x] State in S3 with DynamoDB locking — S3 backend config in `main.tf` with `dynamodb_table = "aegis-lens-tf-locks"`
- [ ] OpenTofu evaluation (license hedge)
- [ ] Atlantis for PR-driven applies
- [ ] Policy-as-code (OPA / Sentinel / Checkov)
- [ ] Drift detection (Terraform Cloud / Spacelift / driftctl)
- [ ] Cost preview on PRs (Infracost)
- [ ] Secrets via Vault / SOPS, never in state
- [ ] Per-module README + ownership

## i18n
- N/A.

### Примітки
Treat IaC like code. Reviews, tests, CI gates.
