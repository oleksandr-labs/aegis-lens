# TODO — State Management

## Goal
Predictable state across server cache, URL, local UI, and real-time subscriptions.

## Progress
- 5 / 10 done (Sprint 2.59)

## Tasks
- [x] Server cache: TanStack Query / Next cache ✓ Sprint 2.59 — TTL cache (query-client.ts) + useEvents hook + Next route caching
- [x] URL state: nuqs (typed search params for filters / time range / map state) ✓ Sprint 1.2
- [x] Global client state: Zustand (modular slices) ✓ Sprint 2.59 — UI/User/Map store slices (React Context fallback until Zustand installed)
- [ ] Form state: React Hook Form + Zod
- [x] Real-time: a single subscription manager (WebSocket / SSE) ✓ Sprint 2.58 — SSE EventSource manager in AegisMap
- [ ] Optimistic updates pattern (with rollback)
- [ ] Per-route hydration boundary
- [x] No prop-drilling beyond 2 levels — extract to context or store ✓ Sprint 2.59 — store slices via context
- [ ] Devtools enabled in dev only
- [ ] State debugging guide for engineers

## i18n
- N/A directly.

### Примітки
URL state is shareable state. Use it aggressively for filters / map view.
