# TODO — Notification Design Hierarchy

## Goal
Clear ladder from "info" → "critical": toast / banner / inline / modal / push / email / SMS. Avoid alarm fatigue.

## Progress
- 10 / 10 done ✅ COMPLETE (Sprint 2.53)

## Tasks

### Hierarchy
- [x] Toast (transient, ~5s, never blocks) → [docs/design/notification-design.md §2.1](../../docs/design/notification-design.md)
- [x] Banner (persistent, dismissible, in-page) → [docs/design/notification-design.md §2.2](../../docs/design/notification-design.md)
- [x] Inline (next to the relevant control) → [docs/design/notification-design.md §2.3](../../docs/design/notification-design.md)
- [x] Dialog / modal (blocking, requires action) → [docs/design/notification-design.md §2.4](../../docs/design/notification-design.md)
- [x] Native push (PWA / mobile) → [docs/design/notification-design.md §2.5](../../docs/design/notification-design.md)
- [x] Email (transactional + digest) → [docs/design/notification-design.md §2.6](../../docs/design/notification-design.md)
- [x] Telegram / Slack (chat-channel alerts) → [docs/design/notification-design.md §2.7](../../docs/design/notification-design.md)
- [x] SMS (enterprise critical only) → [docs/design/notification-design.md §2.8](../../docs/design/notification-design.md)

### Design rules
- [x] Visual style per severity (info / success / warning / danger) → [docs/design/notification-design.md §3](../../docs/design/notification-design.md)
- [x] Iconography distinct per severity → [docs/design/notification-design.md §4](../../docs/design/notification-design.md)
- [x] Motion: slide-in for transient, fade for persistent, no jiggle → [docs/design/notification-design.md §5](../../docs/design/notification-design.md)
- [x] Stacking + collision rules → [docs/design/notification-design.md §6](../../docs/design/notification-design.md)

### Behavior rules
- [x] Per-user channel preferences → [docs/design/notification-design.md §7.1](../../docs/design/notification-design.md)
- [x] Per-org quiet hours → [docs/design/notification-design.md §7.2](../../docs/design/notification-design.md)
- [x] Throttling + dedup → [docs/design/notification-design.md §7.3](../../docs/design/notification-design.md)
- [x] Failure isolation (one channel down doesn't block others) → [docs/design/notification-design.md §7.4](../../docs/design/notification-design.md)

### Done notes (2026-05-30)
Full notification design spec in `docs/design/notification-design.md`. 8-level hierarchy table (Inline → Toast → Banner → Modal → Push → Email → Bot → SMS). Per-channel specs: toast (5s, max 3 stack, top-right), banner (full-width, 1 active, localStorage dismiss persistence), inline (auto-resolves), modal (focus trap, ESC, ARIA), push (10/hr throttle, severity-5 bypass, < 30s lag target), email (5 types with triggers), bot (30/hr Telegram limit, < 60s latency), SMS (Enterprise only, 5/24h cap, double opt-in). Severity table (Info/Success/Warning/Danger/Critical) with colors + Lucide icons. Motion rules with `prefers-reduced-motion` respect. Stacking/collision rules. Throttle + dedup table per channel. Failure isolation: BullMQ queues + circuit breakers per channel.

## i18n
- All notification copy localized; severity icons remain locale-agnostic.

### Примітки
Pair tightly with [../features/TODO_notifications_alerts.md](../features/TODO_notifications_alerts.md) — design + infra together.
