# Sentinel Hub / Copernicus — Compliance & Account Contract

This file encodes the licensing, attribution, account-tier and processing-unit
budget facts behind the `@ua-map/integration-sentinel-hub` package. It is the
deliverable for the two "account / subscription" TODO tasks, which cannot be
*performed* in code (they require a registered account + a paid contract).

The typed counterparts live in `src/account-config.ts` (deployments + tier matrix)
and `src/cost-monitor.ts` (PU accounting + budget alerts).

## 1. Data sources & licences

| Source | Licence | Republication | Attribution |
|---|---|---|---|
| Sentinel-1 (SAR) | Copernicus open data (free & open) | Permitted | **Required** |
| Sentinel-2 (optical) | Copernicus open data (free & open) | Permitted | **Required** |
| Planet (PlanetScope/SkySat) | Commercial, restricted | Restricted by EULA | © Planet Labs PBC |
| BlackSky | Commercial, restricted | Restricted by EULA | © BlackSky |
| Capella (SAR) | Commercial, restricted | Restricted by EULA | © Capella Space |

**Mandatory attribution** for Copernicus Sentinel data:
> "Contains modified Copernicus Sentinel data [YEAR]" (and, when processed via
> Sentinel Hub: "processed by Sentinel Hub").

The attribution strings (en/uk) are implemented in `src/attribution.ts`.
Commercial scenes are **never** served to the public/free tier
(`publicViewable: false` in `commercial-providers.ts`).

## 2. Account requirements (TODO: "Copernicus Data Space Ecosystem account")

- **Copernicus Data Space Ecosystem (CDSE)** — free registration at
  dataspace.copernicus.eu gives OAuth2 `client_credentials` access to Sentinel-1/2
  via the Sentinel Hub Process API on `sh.dataspace.copernicus.eu`.
- Token endpoint: the CDSE Keycloak realm (see `DEPLOYMENT_HOSTS.cdse.tokenUrl`).
- The free CDSE account is **severely rate-limited** and is unsuitable for a
  production multi-AOI refresh fleet — it is the default fallback only
  (`DEFAULT_ACCOUNT_CONFIG`, tier `cdse_free`).
- Credentials are read from environment variables **by name** (`SH_CLIENT_ID`,
  `SH_CLIENT_SECRET`); secrets are never stored in this repo.

## 3. Commercial subscription (TODO: "Sentinel Hub commercial subscription, Phase 1+")

Phase 1 is free Sentinel data; commercial third-party providers unlock later
phases (`commercial-providers.ts` `ImageryPhase`). Subscription tiers and their
processing-unit (PU) allowances are encoded in `TIER_CONFIGS`:

| Tier | Deployment | PU/min | PU/month (planning) | Commercial providers |
|---|---|---|---|---|
| `cdse_free` | CDSE | 100 | 30k | no |
| `sh_exploration` | SH commercial | 300 | 30k | no |
| `sh_basic` | SH commercial | 300 | 300k | no |
| `sh_enterprise_s` | SH commercial | 1,000 | 3M | yes |
| `sh_enterprise_l` | SH commercial | 2,000 | 10M | yes |

**Recommended procurement:** start the production AOI fleet on **SH Basic**
(free Sentinel data, production rate limits); escalate to **Enterprise S/L** only
when third-party commercial tasking (Planet BYOC) is contracted.

### Verify before purchase
The PU/min, PU/month, and per-request PU formula constants in
`account-config.ts` / `cost-monitor.ts` are the **documented baseline** and are
versioned/changed by Sentinel Hub. Re-confirm the exact figures and the
Processing-Units cost model against the live SH pricing & "Processing Units"
docs before signing a contract, and update the constants in one place.

## 4. Processing-Unit budget & cost monitoring (TODO task)

PU cost of a Process API request scales with output pixels × input samples ×
data-type weight (see `estimatePu` in `cost-monitor.ts`). The `PuBudgetMonitor`:
- estimates and accumulates PU spend against the tier's monthly allowance;
- raises `warn` (80%), `critical` (95%), `exceeded` (100%) budget alerts;
- blocks new commercial requests once the budget is exceeded;
- credits PU avoided by the per-AOI cache (`aoi-cache.ts`) for ROI reporting.

## 5. Crawler / API discipline

- OAuth2 `client_credentials` only; tokens cached + refreshed in `client.ts`.
- Respect tier `puPerMinute` and `maxConcurrentRequests` throttles.
- Cache deterministic results per-AOI (`aoi-cache.ts`) to avoid re-billing
  immutable historical scenes.

## Compliance changelog
- 2026-06-06 — Initial compliance record: CDSE free account + SH commercial tier
  matrix, Copernicus attribution, commercial-provider gating, PU budget model.
