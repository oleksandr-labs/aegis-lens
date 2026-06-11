# TODO — Push Notification Taxonomy

## Categories
- Critical (override quiet hours): air alert, family-watchlist critical event
- Alerts (priority): user-rule matches
- Digest: daily / weekly rollups
- Product: changelog, new features, beta invites
- Account: billing, security, MFA
- Marketing: opt-in only

## Progress
- 5 / 6 done

## Tasks
- [x] Per-category opt-out — `UserNotificationPreferences.enabled` in `services/notifications/src/taxonomy.ts`
- [x] Per-category badge / sound / vibration — `NotificationCategoryConfig.badge/vibrate/sound/iosCritical` in taxonomy.ts
- [x] Per-category delivery channel (push / email / TG / SMS) — `defaultChannels` + `UserNotificationPreferences.channels` overrides
- [x] Per-category cap (anti-fatigue) — `rateCapPerHour` per category (0 = no cap for critical)
- [x] Per-category analytics — `services/notifications/src/analytics.ts` NotificationAnalyticsStore; recordDelivery/markClicked/markDismissed; getStatsForCategory() returns deliveryRate/CTR/fatiguePressure per category
- [x] iOS Critical Alert entitlement for civilian persona — `iosCritical: true` for critical category; `requireInteraction` in `buildPushPayload()`
