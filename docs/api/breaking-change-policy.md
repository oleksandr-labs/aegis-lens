# Aegis Lens API — Breaking Change Policy

**Version:** 1.0  
**Effective:** 2026-06-10  
**Owner:** Platform Engineering  

---

## 1. Scope

This policy applies to all versioned public endpoints under `/api/v*` and to all published SDKs (`@aegis/sdk-ts`, `aegis-sdk`, `aegis-sdk-go`).

---

## 2. What Constitutes a Breaking Change

A change is **breaking** if any existing, correctly-written client can receive an unexpected error, a different response shape, or a silent behavioural difference after the change is deployed.

| Category | Breaking examples | Non-breaking examples |
|---|---|---|
| **Fields** | Remove a field; rename a field; change field type | Add an optional field; add a new enum value |
| **Endpoints** | Remove an endpoint; rename a URL path segment | Add a new endpoint; add optional query params |
| **Auth** | Change required auth scheme; remove accepted token format | Accept an additional token format |
| **Pagination** | Change cursor encoding; remove `meta.nextCursor` | Add extra metadata keys |
| **Error format** | Change top-level error envelope shape | Add optional diagnostic fields |
| **Requests** | Make an optional field required | Make a required field optional |

---

## 3. The Major-Version-Only Rule

> **Breaking changes are only permitted in new major API versions.**

- `v1` → `v2` is the only correct place to introduce a breaking change.
- Hotfixes and feature releases within `v1` must be strictly additive.
- A new major version must be announced at least **60 days** before `v1` is deprecated.

---

## 4. Deprecation Floor

Every deprecated endpoint must remain fully functional for a minimum of **12 months (365 days)** from the deprecation announcement.

Announcement channels:
- `Deprecation` response header (RFC 8594) set to `true` on affected endpoints
- Email notifications at 60d / 30d / 7d before sunset (see `deprecation-notifier.ts`)
- Developer changelog and docs update

---

## 5. Notification Cadence

| Days before sunset | Action |
|---|---|
| 60 | Initial deprecation notice email + docs update |
| 30 | Reminder email + in-API `Warning` header |
| 7  | Final notice email + elevated `Warning` header |
| 0  | Endpoint disabled (returns `410 Gone` with migration guide link) |

---

## 6. Parallel Running Period

During a major-version transition, both the old and new version run simultaneously for at least **6 months**. SDKs ship compatibility shims where feasible.

---

## 7. Enterprise SLA

Enterprise contracts with a signed SLA may negotiate an extended deprecation period beyond the 12-month floor. Contact your account manager to amend the contract.

---

## 8. Dev-time Enforcement

`apps/web/src/lib/api-version-guard.ts` provides `assertNonBreaking(description, currentVersion)` — a CI-friendly guard that throws if a change description contains breaking-change keywords. Use it in migration checklists and PR review scripts.

---

## 9. Exceptions

Security vulnerabilities may require faster deprecation. In such cases:

1. Immediate patch deployed silently
2. 7-day notice where feasible
3. Post-mortem published within 30 days

---

*Кирилиця: Зміни, що порушують сумісність API, допускаються лише у нових мажорних версіях. Кожен застарілий ендпойнт підтримується щонайменше 12 місяців після оголошення про застарівання.*
