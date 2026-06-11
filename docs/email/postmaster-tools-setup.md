# Postmaster Tools Setup Guide / Налаштування Postmaster Tools

## Overview / Огляд

This guide covers setting up **Google Postmaster Tools** and **Microsoft SNDS**
to monitor aegislens.com email reputation in real time.

Цей посібник охоплює налаштування Google Postmaster Tools і Microsoft SNDS для
моніторингу репутації домену aegislens.com.

---

## Part 1 — Google Postmaster Tools

### What it provides / Що надає

- Domain reputation score (high / medium / low / bad)
- IP reputation score per sending IP
- Spam rate as seen by Gmail recipients
- DKIM / SPF / DMARC authentication pass rates
- Delivery errors dashboard

### Step 1 — Add your domain

1. Go to https://postmaster.google.com
2. Click **Add Domain** → enter `aegislens.com`
3. Verify domain ownership by publishing a TXT record:

| Type | Host | Value |
|------|------|-------|
| TXT  | @    | `google-site-verification=<token-from-postmaster>` |

4. Click **Verify** in the Postmaster Tools dashboard.

**Примітка:** Перевірка домену через TXT-запис займає кілька хвилин після публікації.

### Step 2 — Add subdomains

Repeat the verification process for each sending subdomain:
- `mail.aegislens.com`
- `news.aegislens.com`
- `alerts.aegislens.com`

### Step 3 — API access (for automated monitoring)

The Postmaster Tools API allows programmatic metric collection.

**Prerequisites:**
1. Google Cloud project with billing enabled
2. Enable "Gmail Postmaster Tools API" at https://console.cloud.google.com/apis
3. Create an OAuth 2.0 credential (Service Account for server-to-server)

**Required OAuth scope:**
```
https://www.googleapis.com/auth/postmaster.readonly
```

**API base URL:**
```
https://gmailpostmastertools.googleapis.com/v1/domains
```

**Example — list domain reputation history:**
```bash
curl -H "Authorization: Bearer $ACCESS_TOKEN" \
  "https://gmailpostmastertools.googleapis.com/v1/domains/aegislens.com/trafficStats?startDate.year=2026&startDate.month=6&startDate.day=1&endDate.year=2026&endDate.month=6&endDate.day=30"
```

**API docs:** https://developers.google.com/gmail/postmaster/reference/rest

### Step 4 — Set up alerting

Wire `evaluatePostmasterMetrics()` from `apps/web/src/lib/email/postmaster-monitoring.ts`
into a daily cron job:

```typescript
// services/cron/daily-postmaster-check.ts
import { evaluatePostmasterMetrics } from "@/lib/email/postmaster-monitoring";

async function run() {
  const metrics = await fetchPostmasterMetrics(); // call the API
  for (const metric of metrics) {
    const { alerts, recommendations } = evaluatePostmasterMetrics(metric);
    if (alerts.length > 0) {
      await notifySlack({ alerts, recommendations });
    }
  }
}
```

### Thresholds / Порогові значення

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Spam rate | > 0.1% | > 1% | Pause marketing sends |
| IP reputation | medium | low / bad | Reduce volume 50% |
| Domain reputation | medium | low / bad | Audit all streams |

---

## Part 2 — Microsoft SNDS (Smart Network Data Services)

### What it provides / Що надає

- IP reputation as seen by Outlook / Hotmail / Live
- Spam trap hit rate per IP
- Filter category (green / yellow / red)

### Step 1 — Register at SNDS

1. Go to https://sendersupport.olc.protection.outlook.com/snds/
2. Sign in with a Microsoft account
3. Click **Request Access** → enter the IP ranges used by your sending pools

**Note:** You need to own or control the IP blocks you register.
For cloud providers (Resend / Postmark), request access via their portal:
- Resend: support@resend.com → "SNDS whitelist for sending IPs"
- Postmark: https://postmarkapp.com/support → "Microsoft SNDS delegation"

### Step 2 — Monitor the dashboard

Check SNDS weekly for:
- Filter status (green = good, yellow = caution, red = blocked)
- Spam trap hit rate (0% target)
- Complaint rate

### Step 3 — Junk Mail Reporting Program (JMRP)

Register for JMRP to receive FBL (Feedback Loop) emails from Outlook users:
https://postmaster.live.com/snds/JMRP.aspx

JMRP complaints should be processed by `processComplaintWebhook()` in
`apps/web/src/lib/email/suppression-list.ts`.

---

## Part 3 — Yahoo Postmaster

Yahoo / AOL also provide a feedback loop:
https://senders.yahooinc.com/

Register aegislens.com to receive complaint notifications.

---

## Monitoring schedule / Графік моніторингу

| Tool | Frequency | Responsible |
|------|-----------|-------------|
| Google Postmaster Tools | Daily (automated cron) | Engineering |
| Microsoft SNDS | Weekly | Engineering |
| Yahoo FBL | On complaint receipt | Engineering |
| Quarterly reputation audit | Every 3 months | Engineering + Security |

---

## Checklist / Чекліст

- [ ] aegislens.com verified in Google Postmaster Tools
- [ ] Subdomains (mail, news, alerts) added and verified
- [ ] Google Cloud project with Postmaster API enabled
- [ ] Service account OAuth credential created and stored in secrets
- [ ] Daily cron job for metric collection + Slack alerting configured
- [ ] Microsoft SNDS account registered
- [ ] Resend/Postmark SNDS IP delegation requested
- [ ] Yahoo FBL registration completed
- [ ] Alert thresholds tested with a synthetic bad-metric payload
