# Aegis Lens — Webhook Event Catalog

This page documents every webhook event type dispatched by Aegis Lens.  
All payloads are JSON, signed with HMAC-SHA256 (see [Webhook Security](../api/webhooks-security.md)).

**Headers on every delivery:**

| Header | Description |
|---|---|
| `x-aegis-signature-256` | `sha256=<hex>` HMAC signature |
| `x-aegis-timestamp` | Unix epoch seconds used in signature |
| `x-aegis-delivery-id` | Idempotency UUID — safe to deduplicate by |
| `Content-Type` | `application/json` |

---

## event.created

**When fired:** A new geospatial event is ingested and passes minimum confidence threshold.  
**Коли надсилається:** Нова геопросторова подія пройшла мінімальний поріг достовірності.

**Payload:**

```typescript
interface EventCreatedPayload {
  type: "event.created";
  deliveredAt: string;          // ISO-8601
  data: {
    eventId: string;
    occurredAt: string;
    class: EventClass;
    subclass: string | null;
    severity: number;           // 1–3
    dangerScore: number;        // 0.0–1.0
    confidence: number;         // 0.0–1.0
    verificationState: "unverified" | "corroborated";
    location: { lat: number; lon: number; precisionM?: number };
    summary: { en: string; uk?: string };
    sourceCount: number;
  };
}
```

**Example:**

```json
{
  "type": "event.created",
  "deliveredAt": "2026-06-10T14:32:00Z",
  "data": {
    "eventId": "evt_01hw5x3k4r",
    "occurredAt": "2026-06-10T14:29:00Z",
    "class": "military_action",
    "subclass": "shelling",
    "severity": 3,
    "dangerScore": 0.87,
    "confidence": 0.72,
    "verificationState": "unverified",
    "location": { "lat": 48.46, "lon": 37.96, "precisionM": 500 },
    "summary": { "en": "Artillery shelling reported near Avdiivka.", "uk": "Повідомляється про артилерійський обстріл поблизу Авдіївки." },
    "sourceCount": 2
  }
}
```

---

## event.verified

**When fired:** An existing event reaches `verified` or `corroborated` verification state after cross-source confirmation.  
**Коли надсилається:** Подія підтверджена кількома незалежними джерелами.

**Payload:**

```typescript
interface EventVerifiedPayload {
  type: "event.verified";
  deliveredAt: string;
  data: {
    eventId: string;
    verificationState: "corroborated" | "verified";
    confidence: number;
    sourceCount: number;
    verifiedAt: string;
  };
}
```

**Example:**

```json
{
  "type": "event.verified",
  "deliveredAt": "2026-06-10T14:45:00Z",
  "data": {
    "eventId": "evt_01hw5x3k4r",
    "verificationState": "verified",
    "confidence": 0.94,
    "sourceCount": 5,
    "verifiedAt": "2026-06-10T14:44:00Z"
  }
}
```

---

## event.retracted

**When fired:** An event is retracted because it was determined to be false, duplicated, or mis-classified.  
**Коли надсилається:** Подію відкликано через помилкову ідентифікацію.

**Payload:**

```typescript
interface EventRetractedPayload {
  type: "event.retracted";
  deliveredAt: string;
  data: {
    eventId: string;
    reason: "false_positive" | "duplicate" | "misclassified" | "source_error";
    retractedAt: string;
    note: string | null;
  };
}
```

**Example:**

```json
{
  "type": "event.retracted",
  "deliveredAt": "2026-06-10T16:00:00Z",
  "data": {
    "eventId": "evt_01hw5x3k4r",
    "reason": "false_positive",
    "retractedAt": "2026-06-10T15:59:00Z",
    "note": "Source video verified as from 2024."
  }
}
```

---

## alert.triggered

**When fired:** A customer-configured alert rule matches one or more new events.  
**Коли надсилається:** Спрацьовує користувацьке правило сповіщення.

**Payload:**

```typescript
interface AlertTriggeredPayload {
  type: "alert.triggered";
  deliveredAt: string;
  data: {
    alertId: string;
    alertName: string;
    matchedEventIds: string[];
    matchCount: number;
    triggeredAt: string;
    filters: Record<string, unknown>;
  };
}
```

**Example:**

```json
{
  "type": "alert.triggered",
  "deliveredAt": "2026-06-10T14:33:00Z",
  "data": {
    "alertId": "alr_0x9a1b",
    "alertName": "Donetsk severity-3 events",
    "matchedEventIds": ["evt_01hw5x3k4r"],
    "matchCount": 1,
    "triggeredAt": "2026-06-10T14:32:55Z",
    "filters": { "region": "donetsk", "severity": 3 }
  }
}
```

---

## alert.delivered

**When fired:** Aegis confirms the alert notification reached its destination (email / Slack / etc).  
**Коли надсилається:** Підтвердження доставки сповіщення.

**Payload:**

```typescript
interface AlertDeliveredPayload {
  type: "alert.delivered";
  deliveredAt: string;
  data: {
    alertId: string;
    channel: "email" | "slack" | "webhook" | "sms";
    recipientCount: number;
    deliveredAt: string;
  };
}
```

**Example:**

```json
{
  "type": "alert.delivered",
  "deliveredAt": "2026-06-10T14:33:05Z",
  "data": {
    "alertId": "alr_0x9a1b",
    "channel": "email",
    "recipientCount": 3,
    "deliveredAt": "2026-06-10T14:33:03Z"
  }
}
```

---

## report.ready

**When fired:** A scheduled or on-demand intelligence report has finished generating and is ready to download.  
**Коли надсилається:** Звіт щойно згенеровано та готовий до завантаження.

**Payload:**

```typescript
interface ReportReadyPayload {
  type: "report.ready";
  deliveredAt: string;
  data: {
    reportSlug: string;
    title: { en: string; uk?: string };
    kind: "regional" | "incident" | "weekly" | "trend" | "methodology";
    downloadUrl: string;
    expiresAt: string;   // signed URL expiry
    generatedAt: string;
  };
}
```

**Example:**

```json
{
  "type": "report.ready",
  "deliveredAt": "2026-06-10T06:05:00Z",
  "data": {
    "reportSlug": "weekly-ua-2026-w24",
    "title": { "en": "Ukraine Weekly Summary — W24 2026", "uk": "Тижневий огляд України — W24 2026" },
    "kind": "weekly",
    "downloadUrl": "https://aegislens.io/api/reports/weekly-ua-2026-w24/download?token=...",
    "expiresAt": "2026-06-11T06:05:00Z",
    "generatedAt": "2026-06-10T06:04:12Z"
  }
}
```

---

## report.published

**When fired:** A report is made publicly available (visible to all subscribers, not just the requesting org).  
**Коли надсилається:** Звіт опубліковано публічно.

**Payload:**

```typescript
interface ReportPublishedPayload {
  type: "report.published";
  deliveredAt: string;
  data: {
    reportSlug: string;
    title: { en: string; uk?: string };
    kind: string;
    publishedAt: string;
    url: string;
  };
}
```

**Example:**

```json
{
  "type": "report.published",
  "deliveredAt": "2026-06-10T08:00:00Z",
  "data": {
    "reportSlug": "weekly-ua-2026-w24",
    "title": { "en": "Ukraine Weekly Summary — W24 2026" },
    "kind": "weekly",
    "publishedAt": "2026-06-10T08:00:00Z",
    "url": "https://aegislens.io/reports/weekly-ua-2026-w24"
  }
}
```

---

## source.degraded

**When fired:** A monitored intelligence source drops below acceptable reliability or goes offline.  
**Коли надсилається:** Джерело інформації деградувало або перестало відповідати.

**Payload:**

```typescript
interface SourceDegradedPayload {
  type: "source.degraded";
  deliveredAt: string;
  data: {
    sourceSlug: string;
    sourceName: string;
    kind: string;
    previousReliability: number;  // 0.0–1.0
    currentReliability: number;
    degradedAt: string;
    reason: "offline" | "low_reliability" | "high_error_rate" | "stale";
  };
}
```

**Example:**

```json
{
  "type": "source.degraded",
  "deliveredAt": "2026-06-10T11:17:00Z",
  "data": {
    "sourceSlug": "ua-mil-telegram-001",
    "sourceName": "Ukraine MoD Telegram",
    "kind": "telegram",
    "previousReliability": 0.88,
    "currentReliability": 0.41,
    "degradedAt": "2026-06-10T11:15:00Z",
    "reason": "stale"
  }
}
```

---

## aoi.breach

**When fired:** A new event is detected inside a customer-defined Area of Interest (AOI).  
**Коли надсилається:** Нова подія зафіксована всередині зони інтересу (AOI).

**Payload:**

```typescript
interface AoiBreachPayload {
  type: "aoi.breach";
  deliveredAt: string;
  data: {
    aoiId: string;
    aoiName: string;
    eventId: string;
    eventClass: EventClass;
    severity: number;
    dangerScore: number;
    distanceFromCenterKm: number;
    breachedAt: string;
    location: { lat: number; lon: number };
  };
}
```

**Example:**

```json
{
  "type": "aoi.breach",
  "deliveredAt": "2026-06-10T14:32:01Z",
  "data": {
    "aoiId": "aoi_plant_zaporizhzhia",
    "aoiName": "Zaporizhzhia Nuclear Plant Buffer",
    "eventId": "evt_01hw5x9z2m",
    "eventClass": "military_action",
    "severity": 3,
    "dangerScore": 0.91,
    "distanceFromCenterKm": 4.2,
    "breachedAt": "2026-06-10T14:31:45Z",
    "location": { "lat": 47.5061, "lon": 34.5864 }
  }
}
```

---

## Filtering events on your endpoint

Register event type filters when creating a webhook:

```bash
curl -X POST https://aegislens.io/api/webhooks \
  -H "X-Api-Key: ak_..." \
  -d '{
    "name": "Critical alerts only",
    "url": "https://your-server.example.com/webhook",
    "events": ["event.created", "aoi.breach", "alert.triggered"]
  }'
```

Omitting `events` (or passing `["*"]`) subscribes you to all event types.

---

*Документ підтримується командою Platform Engineering. Останнє оновлення: 2026-06-10.*
