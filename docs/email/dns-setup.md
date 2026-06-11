# Email DNS Setup Guide / Налаштування DNS для Email

## Overview / Огляд

This guide walks through all DNS records required for **aegislens.com** email deliverability.
Target: inbox rate > 95% transactional, > 80% marketing.

Цей посібник охоплює всі DNS-записи, необхідні для доставки листів з **aegislens.com**.

---

## Step 1 — SPF (Sender Policy Framework)

**What it does:** Tells receiving mail servers which IPs may send for your domain.

Add the following TXT record at the apex (`@`):

| Field | Value |
|-------|-------|
| Type  | TXT |
| Host  | @ |
| Value | `v=spf1 include:spf.resend.com include:spf.postmarkapp.com ~all` |
| TTL   | 300 |

> After warm-up (day 30+) change `~all` (softfail) to `-all` (hard fail).

**Крок 1 — SPF:** Додайте TXT-запис на кореневий домен (`@`) — дозволяє Resend та Postmark надсилати листи від імені aegislens.com.

---

## Step 2 — DKIM (DomainKeys Identified Mail)

DKIM signs every outgoing message. Both Resend and Postmark use CNAME-based key management (they rotate keys automatically).

### Resend DKIM

| Field | Value |
|-------|-------|
| Type  | CNAME |
| Host  | `resend._domainkey` |
| Value | `resend._domainkey.resend.com` |
| TTL   | 3600 |

### Postmark DKIM (two selectors for rotation)

| Field | Value |
|-------|-------|
| Type  | CNAME |
| Host  | `pm._domainkey` |
| Value | `pm._domainkey.postmarkapp.com` |
| TTL   | 3600 |

| Field | Value |
|-------|-------|
| Type  | CNAME |
| Host  | `pm2._domainkey` |
| Value | `pm2._domainkey.postmarkapp.com` |
| TTL   | 3600 |

**Крок 2 — DKIM:** CNAME-записи для автоматичної ротації ключів Resend і Postmark.

---

## Step 3 — DMARC

DMARC tells receivers what to do with mail that fails SPF/DKIM, and where to send reports.

| Field | Value |
|-------|-------|
| Type  | TXT |
| Host  | `_dmarc` |
| Value | `v=DMARC1; p=quarantine; rua=mailto:dmarc@aegislens.com; ruf=mailto:dmarc@aegislens.com; fo=1; pct=100; adkim=s; aspf=s` |
| TTL   | 300 |

### DMARC policy progression

| Phase | Policy | When |
|-------|--------|------|
| Day 0–30 | `p=quarantine` | Failing mail goes to spam. Monitor reports. |
| Day 30+ | `p=reject` | Failing mail is dropped. Maximum protection. |

> **Never skip quarantine.** Going straight to `reject` before confirming DKIM/SPF pass
> rates are > 98% will cause legitimate mail loss.

**Крок 3 — DMARC:** TXT-запис `_dmarc`. Починайте з `p=quarantine`, після 30 днів моніторингу переходьте на `p=reject`.

---

## Step 4 — MX records (inbound reply handling)

Even if you don't receive mail, you need MX for bounce processing and DMARC reply-to.

| Type | Host   | Value                         | Priority | TTL |
|------|--------|-------------------------------|----------|-----|
| MX   | @      | `inbound.postmarkapp.com`     | 10       | 300 |
| MX   | mail   | `inbound.postmarkapp.com`     | 10       | 300 |

**Крок 4 — MX:** Записи для обробки bounce-повідомлень і відповідей через Postmark inbound.

---

## Step 5 — BIMI (Brand Indicators for Message Identification)

BIMI displays your logo in supported inboxes (Apple Mail, Yahoo, Gmail with VMC).

**Prerequisites:**
- DMARC must be `p=quarantine` or `p=reject` (not `p=none`)
- Logo must be an SVG (Tiny 1.2 specification) hosted at an HTTPS URL
- Gmail requires a VMC (Verified Mark Certificate) from Entrust or DigiCert

| Field | Value |
|-------|-------|
| Type  | TXT |
| Host  | `default._bimi` |
| Value | `v=BIMI1; l=https://aegislens.com/brand/logo-bimi.svg; a=https://aegislens.com/brand/vmc.pem` |
| TTL   | 3600 |

**Крок 5 — BIMI:** TXT-запис для відображення логотипу в поштових клієнтах. Потребує DMARC p=quarantine або p=reject та VMC-сертифіката для Gmail.

---

## Verification / Перевірка

After publishing records, verify with:

```bash
# SPF
dig TXT aegislens.com +short

# DKIM (Resend)
dig CNAME resend._domainkey.aegislens.com +short

# DMARC
dig TXT _dmarc.aegislens.com +short

# BIMI
dig TXT default._bimi.aegislens.com +short
```

Online tools:
- MXToolbox: https://mxtoolbox.com/SuperTool.aspx
- DMARC Analyzer: https://dmarcanalyzer.com
- BIMI Inspector: https://bimigroup.org/bimi-generator/

---

## DNS Propagation

TTL 300 = records visible globally within ~5 minutes after publish.
TTL 3600 = up to 1 hour propagation for DKIM/BIMI CNAMEs.

---

## Checklist / Чекліст

- [ ] SPF TXT record published at `@`
- [ ] Resend DKIM CNAME published at `resend._domainkey`
- [ ] Postmark DKIM CNAME published at `pm._domainkey` and `pm2._domainkey`
- [ ] DMARC TXT record published at `_dmarc` with `p=quarantine`
- [ ] MX records published for `@` and `mail`
- [ ] Verified with MXToolbox / dig
- [ ] DMARC reports arriving at `dmarc@aegislens.com`
- [ ] Scheduled calendar reminder in 30 days to upgrade DMARC to `p=reject`
- [ ] BIMI SVG uploaded to `https://aegislens.com/brand/logo-bimi.svg`
- [ ] VMC certificate procured (Entrust / DigiCert) for Gmail BIMI
