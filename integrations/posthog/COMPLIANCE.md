# PostHog Compliance

## GDPR / data residency

- **EU Cloud**: The client defaults to `https://eu.posthog.com` which stores data in the EU (Frankfurt). Use `POSTHOG_HOST=https://eu.posthog.com` to be explicit.
- **US Cloud**: `https://app.posthog.com` (US) — do not use for EU user data without adequate safeguards (SCC or equivalent).
- **Self-hosted**: PostHog can be self-hosted on the Hetzner server for complete data sovereignty. See: https://posthog.com/docs/self-host
- **Data Processing Agreement**: Available at https://posthog.com/dpa — execute before processing EU personal data.

## What is captured

- `$pageview` — URL only (no PII in URL by default; scrub query params containing user IDs before capture).
- `$identify` — user plan, role, and anonymised attributes. Do **not** pass email addresses or full names to `identify()` without consent.
- Feature usage events — action names and layer types; no content of events/reports.

## Cookie policy

- PostHog sets a `ph_` cookie by default for session continuity. The web app must declare this in its cookie consent banner.
- Use `persistence: 'memory'` in the PostHog JS SDK to opt out of cookies; the server-side client in this package does not set cookies.

## Terms
- https://posthog.com/terms
- PostHog does not sell data; analytics are used only for product improvement by the account holder.

## Key storage
- `POSTHOG_API_KEY`: project API key (write-only, starts with `phc_`). Store in GitHub Actions secrets / server env.
- Rotate if compromised; old key can be revoked in PostHog project settings.
