# TODO — Anti-Spam, Anti-Bot, WAF Strategy

## Goal
Keep submissions, reviews, accounts, and APIs clean. Stay fast for real users.

## Progress
- 13 / 13 done

## Tasks

### WAF + edge
- [x] Cloudflare WAF rules (managed + custom) — apps/web/src/lib/anti-spam/waf-rules.ts
- [x] Cloudflare Turnstile / hCaptcha for forms — apps/web/src/lib/anti-spam/waf-rules.ts
- [x] Bot Fight Mode + custom heuristics — apps/web/src/lib/anti-spam/waf-rules.ts
- [x] Rate-limit at edge for known abuse paths — apps/web/src/lib/anti-spam/waf-rules.ts

### Form-level
- [x] Honeypot fields — apps/web/src/lib/anti-spam/honeypot.ts
- [x] Time-on-form lower bound — apps/web/src/lib/anti-spam/honeypot.ts
- [x] Browser fingerprinting (privacy-respecting) — apps/web/src/lib/anti-spam/account-abuse.ts
- [x] IP + ASN reputation — apps/web/src/lib/anti-spam/ip-reputation.ts

### Content-level
- [x] Review spam detection (NSFW, repetitive, link-stuffed) — apps/web/src/lib/anti-spam/content-spam.ts
- [x] AI-content detector for reviews — apps/web/src/lib/anti-spam/content-spam.ts
- [x] Cross-account graph (catch sockpuppets) — apps/web/src/lib/anti-spam/account-abuse.ts
- [x] Auto-quarantine + manual review queue — apps/web/src/lib/anti-spam/decision-engine.ts

### Account-level
- [x] Signup abuse detection (disposable email, mass signups) — apps/web/src/lib/anti-spam/account-abuse.ts
- [x] Per-account behavior scoring — apps/web/src/lib/anti-spam/account-abuse.ts

## i18n
- Captcha + error messages localized.

### Примітки
The right level of friction filters bots, not users. Tune weekly.
