/**
 * DNS + CDN module — Cloudflare zone, records, DNSSEC, edge rules.
 */

terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

variable "zone_id"   { type = string }
variable "domain"    { type = string }
variable "env"       { type = string }
variable "app_origin"   { type = string } # Vercel / load balancer hostname
variable "tiles_origin" { type = string } # tile service origin

# ── Apex + app records ───────────────────────────────────────────────────────

resource "cloudflare_record" "app" {
  zone_id = var.zone_id
  name    = "app"
  type    = "CNAME"
  content = var.app_origin
  proxied = true
  ttl     = 1 # automatic when proxied
}

resource "cloudflare_record" "api" {
  zone_id = var.zone_id
  name    = "api"
  type    = "CNAME"
  content = var.app_origin
  proxied = true
  ttl     = 1
}

resource "cloudflare_record" "tiles" {
  zone_id = var.zone_id
  name    = "tiles"
  type    = "CNAME"
  content = var.tiles_origin
  proxied = true
  ttl     = 1
}

# ── DNSSEC ───────────────────────────────────────────────────────────────────

resource "cloudflare_zone_dnssec" "main" {
  zone_id = var.zone_id
}

# ── CAA records (restrict cert issuance to Let's Encrypt) ────────────────────

resource "cloudflare_record" "caa_letsencrypt" {
  zone_id = var.zone_id
  name    = "@"
  type    = "CAA"
  data {
    flags = "0"
    tag   = "issue"
    value = "letsencrypt.org"
  }
}

# ── Tile cache rule — long TTL for static, short for live ────────────────────

resource "cloudflare_ruleset" "cache_rules" {
  zone_id = var.zone_id
  name    = "aegis-cache-rules"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 300 # 5 min default for tiles
      }
      cache_key {
        custom_key {
          query_string {
            # Cache tiles by layer + time-bucket + zoom params
            include = ["z", "x", "y", "layer", "t", "tenant"]
          }
        }
      }
    }
    expression = "(http.host eq \"tiles.${var.domain}\")"
    description = "Tile cache with custom key by layer/time/tenant"
    enabled    = true
  }

  rules {
    action = "set_cache_settings"
    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 86400 # 1 day for static assets
      }
    }
    expression = "(http.request.uri.path matches \"\\\\.(js|css|woff2|png|svg|webp|avif)$\")"
    description = "Long cache for static assets"
    enabled    = true
  }
}

# ── Edge function: locale negotiation (Accept-Language → /uk or /en) ─────────

resource "cloudflare_worker_script" "locale_redirect" {
  account_id = "" # set via tfvars
  name       = "aegis-locale-redirect-${var.env}"
  content    = file("${path.module}/workers/locale-redirect.js")
}

resource "cloudflare_worker_route" "locale_redirect" {
  zone_id     = var.zone_id
  pattern     = "${var.domain}/"
  script_name = cloudflare_worker_script.locale_redirect.name
}

# ── Security: TLS 1.2 min, OCSP stapling, always-HTTPS ──────────────────────

resource "cloudflare_zone_settings_override" "security" {
  zone_id = var.zone_id
  settings {
    min_tls_version          = "1.2"
    tls_1_3                  = "on"
    always_use_https         = "on"
    automatic_https_rewrites = "on"
    ssl                      = "strict"
    opportunistic_encryption = "on"
    security_level           = "medium"
    brotli                   = "on"
    http3                    = "on"
    zero_rtt                 = "on"
  }
}

output "app_hostname"   { value = cloudflare_record.app.hostname }
output "api_hostname"   { value = cloudflare_record.api.hostname }
output "tiles_hostname" { value = cloudflare_record.tiles.hostname }
