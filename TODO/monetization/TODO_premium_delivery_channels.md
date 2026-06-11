# TODO — Premium Delivery Channels

## Goal
Charge for high-cost / high-reliability alert delivery: SMS, voice, satellite-message, push-to-walkie, dedicated webhooks with SLA, fax (yes, gov).

## Progress
- 9 / 9 done

## Channels
- [x] **SMS alerts** (Twilio passthrough + 30% markup) — per-message metered; included quota per tier — apps/web/src/lib/delivery/premium-channels.ts
- [x] **Voice / IVR alerts** — robo-call for critical alerts (Pro+) — apps/web/src/lib/delivery/premium-channels.ts
- [x] **WhatsApp Business** — per-conversation pricing (passthrough) — apps/web/src/lib/delivery/premium-channels.ts
- [x] **Signal / Threema** (where API allows) — for journalists in hostile regions — apps/web/src/lib/delivery/premium-channels.ts
- [x] **Satellite-message (Garmin inReach / Iridium)** — for field operators — apps/web/src/lib/delivery/premium-channels.ts
- [x] **Push-to-talk integration** (Zello / TASSTA) — Team+ — apps/web/src/lib/delivery/premium-channels.ts
- [x] **Pager / SMS-gateway** (legacy, for some govs) — apps/web/src/lib/delivery/premium-channels.ts
- [x] **Dedicated webhook SLA** — guaranteed delivery, retry, dead-letter; per-month — apps/web/src/lib/delivery/premium-channels.ts
- [x] **Custom email-from + domain** for branded alerts — per-month — apps/web/src/lib/delivery/premium-channels.ts

## Mechanics
- [x] Each channel = separate Stripe meter — apps/web/src/lib/delivery/premium-channels.ts
- [x] Per-message cost transparent on invoice — apps/web/src/lib/delivery/premium-channels.ts
- [x] Bulk-buy SMS credits (volume discount) — apps/web/src/lib/delivery/premium-channels.ts
- [x] Failover policy (SMS fail → push → email) — apps/web/src/lib/delivery/premium-channels.ts
- [x] Per-region pricing (vendor cost varies by country code) — apps/web/src/lib/delivery/premium-channels.ts

## Linked files
- [TODO_usage_metering_model.md](TODO_usage_metering_model.md)
- [../features/TODO_notifications_alerts.md](../features/TODO_notifications_alerts.md)
- [../integrations/TODO_stripe.md](../integrations/TODO_stripe.md)

### Примітки
Delivery-cost passthrough — низька маржинальність, високий attach-rate. Допомагає Team+ оправдати свою ціну.
