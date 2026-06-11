# Secrets Management — Aegis Lens

Zero hardcoded secrets. Per-env isolation. Auto-rotation where possible.

## Sources of Truth

| Layer | Tool | Scope |
|-------|------|-------|
| Cloud infra | AWS Secrets Manager | DB credentials, API keys for AWS services |
| Application | Doppler | App env vars per environment |
| Kubernetes | External Secrets Operator (ESO) | Syncs AWS/Doppler → k8s Secrets |
| Developer local | `.env.local` (gitignored) | Local-only dev placeholders |

**Never** commit real secrets. Local dev uses placeholder values (`dev-secret`, `ak_pro_demo`) that are explicitly allowlisted in `.gitleaks.toml`.

## Per-Environment Isolation

```
doppler/
  aegis-web/
    dev      → DATABASE_URL, MAPBOX_TOKEN (test), ...
    staging  → DATABASE_URL_STAGING, ...
    prod     → DATABASE_URL_PROD, ...
```

Each environment has fully separate secret values. A leaked staging secret cannot access production.

## External Secrets Operator (k8s)

Secrets are never stored directly in k8s manifests. ESO pulls from AWS Secrets Manager:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: aegis-web-secrets
  namespace: aegis-platform
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: ClusterSecretStore
  target:
    name: aegis-web-secrets
  dataFrom:
    - extract:
        key: aegis/prod/web
```

## Rotation Policy

| Secret class | Rotation interval | Method |
|--------------|-------------------|--------|
| Database master credentials | 30 days | AWS Secrets Manager automatic rotation (Lambda) |
| API keys (customer) | On-demand + 90-day reminder | Self-service in dashboard |
| Internal service secrets | 90 days | Doppler + redeploy |
| JWT signing keys | 90 days (overlapping) | JWKS rotation — old + new key valid during overlap |
| Webhook secrets | On-demand | Customer-initiated rotation with grace period |
| TLS certificates | 90 days | cert-manager (Let's Encrypt) automatic |

## Access Audit

- AWS Secrets Manager: every `GetSecretValue` call logged to CloudTrail
- Doppler: access log per secret per user
- Quarterly review of who has access to production secrets

## Pre-commit + CI Scanning

- **Pre-commit:** `.pre-commit-config.yaml` runs gitleaks + `detect-private-key` on every commit
- **CI:** `security-scan` job in `ci.yml` runs gitleaks on the full history of every PR
- Config: `.gitleaks.toml` with custom rules for `ak_` keys, Telegram tokens, Mapbox/Anthropic tokens

## Break-Glass Procedure

When emergency production access is needed:

1. Request approval from on-call lead (Slack `#security` + verbal)
2. Use the break-glass IAM role `aegis-breakglass-prod` (MFA required)
3. All break-glass actions are logged to a dedicated CloudWatch log group
4. Within 24h: write a short justification in the incident channel
5. Rotate any secrets that were exposed during the session

## Customer-Managed Keys (BYOK) — Enterprise

Enterprise customers may supply their own KMS key for encrypting their data at rest:

- Per-tenant KMS key ARN stored in `orgs.kms_key_arn`
- Data encrypted with the customer key before storage
- Customer can revoke the key to render their data inaccessible (crypto-shred)

## Leaked Secret = P0 Incident

If a secret leaks (committed to git, posted in a ticket, etc.):

1. Treat as SEV-1 — follow incident runbook
2. **Rotate immediately** — don't wait to assess impact
3. Audit access logs for the leaked secret's usage window
4. Write a blameless postmortem
