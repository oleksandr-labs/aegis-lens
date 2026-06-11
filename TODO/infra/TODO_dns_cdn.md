# TODO — DNS, CDN, Edge

## Goal
Global low-latency delivery + DDoS protection + edge logic for SEO performance.

## Progress
- 6 / 9 done

## Tasks
- [x] DNS: Cloudflare (primary) + Route 53 (failover) — `infra/terraform/modules/dns/main.tf` (Cloudflare zone, app/api/tiles CNAMEs, proxied)
- [x] CDN: Cloudflare for marketing + tiles; Vercel for app pages — tiles CNAME → tile origin, proxied through Cloudflare
- [x] DNSSEC + CAA records — `cloudflare_zone_dnssec` + CAA record restricting issuance to Let's Encrypt
- [x] Edge functions for locale negotiation + A/B routing — `workers/locale-redirect.js` (cookie → Accept-Language → default) + `cloudflare_worker_route`
- [ ] Image optimization at edge
- [x] Tile cache at edge with custom keys — `cloudflare_ruleset` cache rule keyed by `z/x/y/layer/t/tenant` (5-min TTL tiles, 1-day static)
- [ ] Status badge proxying
- [ ] Multi-domain handling (white-label custom domains)
- [x] TLS auto-rotation, OCSP stapling — `zone_settings_override` (min TLS 1.2, TLS 1.3, strict SSL, always-HTTPS, HTTP/3); cert-manager handles rotation

## i18n
- Edge-detect `Accept-Language` for landing redirect.

### Примітки
Cloudflare gives the best $/request at our scale.
