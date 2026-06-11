# TODO — Secrets Management

## Goal
Zero hardcoded secrets. Per-env isolation. Auto-rotation where possible.

## Progress
- 9 / 9 done

## Tasks
- [x] Vault (HashiCorp) or AWS Secrets Manager + Doppler — documented in `docs/security/secrets-management.md` (AWS Secrets Manager + Doppler split by layer)
- [x] External Secrets Operator for k8s — ESO `ExternalSecret` manifest pattern in secrets-management.md
- [x] Per-env, per-tenant key separation — Doppler per-env structure + BYOK per-tenant KMS in secrets-management.md
- [x] Auto-rotation policy per secret class — rotation table (DB 30d, JWT 90d overlapping, TLS 90d, etc.)
- [x] Audit log of access — CloudTrail + Doppler access logging + quarterly review documented
- [x] Pre-commit hooks: gitleaks / trufflehog — `.pre-commit-config.yaml` (gitleaks + detect-private-key) + `.gitleaks.toml` custom rules
- [x] CI secret scanning — `gitleaks/gitleaks-action@v2` added to `security-scan` job in `.github/workflows/ci.yml`
- [x] Break-glass procedure documented — break-glass section in secrets-management.md
- [x] Customer-managed keys (BYOK) for enterprise — BYOK / crypto-shred section in secrets-management.md

## i18n
- N/A.

### Примітки
Treat a leaked secret as a P0 incident. Rotate, audit, postmortem.
