# Notification Design Hierarchy

> **Status:** v1.0 — design specification. Review with each major feature release.
> **Related:** `TODO/features/TODO_notifications_alerts.md` (backend/infra), `TODO/features/TODO_push_taxonomy.md` (push notification taxonomy)

Aegis Lens users monitor crisis situations. Notification design must prevent **alarm fatigue** — overloading users to the point where they stop reading alerts — while ensuring critical events reach them with zero ambiguity. The hierarchy below defines each channel's role and the rules that govern routing.

---

## 1. The Hierarchy

From least to most intrusive. Every notification decision starts here.

| Level | Channel | Blocking? | Duration | Use when |
|---|---|---|---|---|
| 1 | **Inline** | No | Persistent until dismissed | Context-specific feedback next to a UI control |
| 2 | **Toast** | No | ~5s (auto-dismiss) | Transient success / info confirmation |
| 3 | **Banner** | No | Persistent, dismissible | Platform-wide notices; time-sensitive but not critical |
| 4 | **Dialog / Modal** | Yes | Until user acts | Destructive actions; required confirmations |
| 5 | **Native Push** (PWA / mobile) | No | Delivered when app is backgrounded | Important events matching user's AOI / alert rules |
| 6 | **Email** | No | Asynchronous | Digests; account events; verifications; reports |
| 7 | **Telegram / Slack / Discord bot** | No | Asynchronous | Chat-channel alerts matching bot configuration |
| 8 | **SMS** | No | Immediate delivery | Enterprise critical-only; life-safety situations |

**Rule:** Escalate channel level only when the lower channel has failed or is unavailable, or when the event severity explicitly calls for the higher level. Do not skip levels.

---

## 2. Channel Specifications

### 2.1 Toast (Level 2)

**Purpose:** Transient feedback for user-triggered actions. Never for incoming intelligence events.

- **Duration:** 5 seconds auto-dismiss. Do not extend for low-priority messages.
- **Position:** Top-right corner (desktop); top-center (mobile).
- **Max simultaneous:** 3 (stack; oldest auto-dismisses first when cap reached).
- **No close button required** — auto-dismisses; optional close icon for accessibility.
- **No toast for errors that need action** — use inline or dialog instead.
- **Examples:** "Alert saved", "Report exported", "Source added"

### 2.2 Banner (Level 3)

**Purpose:** Persistent platform-wide or session-wide notices.

- **Position:** Below the global nav bar; full width.
- **Dismiss:** ✕ close button; dismissal persists in localStorage for 30 days (user doesn't see the same banner again on re-load).
- **Max simultaneous:** 1 banner visible at a time. Queue additional banners; show next after dismissal.
- **Use cases:**
  - Planned maintenance window announcement
  - Data outage notice ("NASA FIRMS data delayed — last update 3h ago")
  - New feature announcement (first-time only)
  - Legal / cookie consent (separate cookie banner component — not this system)

### 2.3 Inline (Level 1)

**Purpose:** Contextual feedback within a form, input, or data display. Never interrupts the user.

- **Position:** Immediately below the relevant control or data element.
- **Dismiss:** Resolves automatically when the underlying issue resolves, or user dismisses with ✕.
- **Examples:** "This region has insufficient data for AI summary", "Verification pending — confidence score is preliminary", "API key expires in 3 days"

### 2.4 Dialog / Modal (Level 4)

**Purpose:** When user action is required before proceeding. Sparingly used.

- **Blocking:** Yes — background interaction disabled.
- **Always includes:** Primary CTA + "Cancel" / "Dismiss" escape.
- **Use cases:** Delete confirmation, irreversible export, security re-auth (session expired), subscription downgrade impact warning.
- **Never use for:** informational messages that don't require action (use banner or toast instead).
- **A11y:** Focus trapped inside modal; ESC key closes; `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to modal title.

### 2.5 Native Push (Level 5 — PWA / Mobile)

**Purpose:** Intelligence events matching the user's configured alert rules and AOI, delivered when the app is backgrounded.

- **Trigger:** User's alert rules evaluated against incoming events in near real-time (< 30s lag target).
- **Content:** Event class + location + confidence level. No PII, no coordinates in the notification body (security).
- **Max rate:** 10 push notifications / hour per user (hard throttle). Critical severity events (5/5) bypass this throttle.
- **Grouping:** Push notifications grouped by region + event class when rate exceeds 3/10min for the same rule.
- **Click action:** Deep links into the map zoomed to the event location.
- **Opt-out:** User can configure per-rule push delivery in `/account/alerts`.

### 2.6 Email (Level 6)

**Purpose:** Async delivery for digests, reports, account events.

**Email types:**

| Email type | Trigger | Frequency |
|---|---|---|
| Alert digest | User's alert rules fired | User-configurable: real-time / hourly / daily / weekly |
| Weekly intelligence brief | Automated — top events in user's watched regions | Weekly, Monday 08:00 UTC |
| Account events | Login from new device, API key created/expired, billing | Immediate (transactional) |
| Report ready | AI-generated report finished processing | On completion |
| Subscription | Trial ending, renewal, failed payment | Per billing event |

**Format:**
- Plain HTML, minimal design (loads in any email client).
- Dark mode compatible (`@media (prefers-color-scheme: dark)`).
- Unsubscribe link in every non-transactional email (CAN-SPAM / GDPR compliant).
- AMP for Email not used (too complex, limited client support).

### 2.7 Telegram / Slack / Discord Bot (Level 7)

**Purpose:** Alert delivery into user-configured chat channels.

- **Configuration:** `/bots` in account settings — connect channel, select alert rules to mirror.
- **Format:** Structured message with event summary, confidence score, region, source count, and a link to the event detail page.
- **Rate limit:** 30 bot messages / hour per channel (Telegram limit compliance). Excess batched into a summary message.
- **Latency target:** < 60s from event ingestion to bot message.
- **Bot commands (Telegram / Slack):** `/aegis status`, `/aegis region ua`, `/aegis events 24h`.

### 2.8 SMS (Level 8 — Enterprise Only)

**Purpose:** Last-resort channel for critical, life-safety alerts. Enterprise / Gov plans only.

- **Trigger criteria:** Severity 5 event + matches critical AOI + user has SMS enabled in plan.
- **Content:** Ultra-brief (140 chars max): event type, region, confidence. No URLs.
- **Provider:** Twilio (primary) / Vonage (fallback).
- **Opt-in:** Explicit SMS consent required (TCPA / GDPR). Double opt-in — confirm via verification SMS.
- **Max rate:** 5 SMS / 24h per user (hard cap, even during crisis).
- **Cost:** Included in Enterprise / Government plans; metered for Team plan (add-on).

---

## 3. Visual Style per Severity

| Severity | Color | Icon | Example use |
|---|---|---|---|
| **Info** | `#4a90e2` blue | ℹ️ `info-circle` | Data update notice, feature tip |
| **Success** | `#27ae60` green | ✓ `check-circle` | Alert saved, export complete |
| **Warning** | `#f39c12` amber | ⚠ `alert-triangle` | API key expiring, data delay, low confidence |
| **Danger / Error** | `#e74c3c` red | ✗ `x-circle` | Data source down, verification failed, billing failure |
| **Critical** | `#c0392b` deep red + blinking border | 🔴 `alert-octagon` | Severity-5 intelligence event |

**Colorblind rule:** Every severity level uses a **distinct icon** in addition to color — icon alone must convey the severity without the color. Never rely on color alone.

---

## 4. Iconography per Severity

All icons from the Lucide icon set (MIT licensed), consistent with the broader design system.

| Severity | Lucide icon | Aria label |
|---|---|---|
| Info | `Info` | "Information" |
| Success | `CheckCircle` | "Success" |
| Warning | `AlertTriangle` | "Warning" |
| Danger | `XCircle` | "Error" |
| Critical | `AlertOctagon` | "Critical alert" |

Icons are 16px in toasts and banners, 20px in modals and push notifications.

---

## 5. Motion Rules

- **Toast:** slide in from top-right (100ms ease-out), auto-dismiss with fade-out (200ms ease-in). No bounce, no jiggle.
- **Banner:** slide down from top (150ms ease-out). Dismiss with fade + slide-up (150ms).
- **Modal:** fade-in overlay (100ms) + scale-in modal from 95% → 100% (150ms ease-out). Dismiss reverses.
- **Critical pulse:** CSS `@keyframes pulse` on the critical border — opacity 1 → 0.5 → 1 over 1s. No size change (size animations cause layout shifts).
- **Respect `prefers-reduced-motion`:** all animations disabled; elements appear/disappear instantly.

---

## 6. Stacking & Collision Rules

- **Toasts:** stack vertically (newest on top), max 3. 4th toast pushes oldest off.
- **Toasts + Banner:** toasts render above the banner (higher z-index); the banner does not push toasts down.
- **Modal + Toast:** active modal suppresses new toasts (they queue and display after modal closes).
- **Push + any in-app:** push notifications are OS-level; no in-app collision handling needed.
- **Same-event dedup:** if the same event ID fires two notifications within 60s, only the first is shown (second is dropped).

---

## 7. Behavior Rules

### 7.1 Per-user channel preferences

All non-critical, non-transactional channels configurable in `/account/settings/notifications`:
- Per-alert-rule: which channels fire (in-app push, email, Telegram, Slack, SMS).
- Digest frequency (real-time / hourly / daily / weekly) per channel.
- Do-not-disturb window: globally mutes push and SMS but not email.
- Per-region granularity: enable SMS only for Ukraine region, email for all.

### 7.2 Per-org quiet hours

For Team and Enterprise plans, org admins set quiet hours that apply to the entire org:
- Push, SMS, and bot alerts suppressed during quiet hours.
- Severity-5 events bypass quiet hours (cannot be silenced by org admins; only by individual users explicitly).
- Time zone: org's configured time zone (defaults to UTC).

### 7.3 Throttling & deduplication

| Channel | Throttle | Dedup window |
|---|---|---|
| Toast | Unlimited (in-app, transient) | Same event ID: 60s |
| Banner | 1 visible at a time | — |
| Push | 10/hour (critical bypass) | Same event + rule: 10min |
| Email digest | Configured by user | — |
| Bot | 30/hour (Telegram limit) | Same event + channel: 5min |
| SMS | 5/24h | Same event + user: 1h |

### 7.4 Failure isolation

Each notification channel is independently queued. A failure in the email queue (e.g., SendGrid outage) does not block push notifications or bot alerts.

- Channels use separate worker processes with their own retry queues (Redis + BullMQ).
- Circuit breakers per channel: 5 consecutive delivery failures triggers circuit open; health-check every 30s before re-closing.
- Users see a degraded-mode banner ("Email notifications temporarily delayed") if a channel is in degraded state for > 5 minutes.

---

## Appendix: Component Naming (Design System)

| Component | File (design system) |
|---|---|
| `<Toast>` | `packages/ui/src/Toast.tsx` |
| `<Banner>` | `packages/ui/src/Banner.tsx` |
| `<InlineAlert>` | `packages/ui/src/InlineAlert.tsx` |
| `<Dialog>` | `packages/ui/src/Dialog.tsx` |
| Push notification | OS-native via `@web-push` + `expo-notifications` |
| Email template | `packages/email/` (React Email) |
