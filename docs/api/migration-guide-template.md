# API Migration Guide: v{OLD} → v{NEW}

> **Deprecation date:** {DEPRECATION_DATE}
> **Sunset date:** {SUNSET_DATE} (12 months after deprecation)
> **Status:** Announced / In Progress / Final

---

## Summary of breaking changes

| Area | v{OLD} behaviour | v{NEW} behaviour |
|------|-----------------|-----------------|
| Endpoint | `/api/v{OLD}/…` | `/api/v{NEW}/…` |
| Response field | `field_old` | `field_new` |
| Error format | `{ "error": "…" }` | RFC 7807 `{ "type": "…", "title": "…", "status": … }` |

---

## Step-by-step migration

### 1. Update your base URL

```diff
- const BASE = "https://app.aegislens.com/api/v{OLD}";
+ const BASE = "https://app.aegislens.com/api/v{NEW}";
```

### 2. Update response parsing

**Breaking change: `data.items` → `data.events`**

```diff
- const events = response.data.items;
+ const events = response.data.events;
```

**Breaking change: error format (RFC 7807)**

```diff
- if (response.error) { handleError(response.error); }
+ if (!response.ok) {
+   const problem = await response.json(); // { type, title, status, detail }
+   handleError(problem.detail ?? problem.title);
+ }
```

### 3. Update pagination

v{NEW} uses cursor-based pagination instead of offset.

```diff
- const page2 = await client.events.list({ offset: 20, limit: 20 });
+ const page2 = await client.events.list({ cursor: page1.meta.nextCursor, limit: 20 });
```

### 4. Update SDK version

```bash
# TypeScript
npm install aegis-lens@^{NEW_MAJOR}.0.0

# Python
pip install aegis-lens=={NEW_MAJOR}.0.0
```

---

## Parallel running period

During the 12-month sunset window, **both versions are fully operational**.

You can identify which version your requests are hitting via the response header:

```
Aegis-API-Version: v{NEW}
```

Deprecated endpoints will include:

```
Deprecation: {DEPRECATION_DATE}
Sunset: {SUNSET_DATE}
Link: <https://docs.aegislens.com/api/migration/v{OLD}-to-v{NEW}>; rel="deprecation"
```

---

## Getting help

- Docs: https://docs.aegislens.com/api/v{NEW}
- Migration support: sdk@aegislens.com
- Changelog: https://docs.aegislens.com/changelog

---

*This guide covers Aegis Lens API v{OLD} → v{NEW}. Generated {DATE}.*
