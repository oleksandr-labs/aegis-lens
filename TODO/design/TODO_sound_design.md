# TODO — Sound Design

## Goal
Subtle, premium audio that signals importance without alarming. Default off; respectfully on with user consent.

## Progress
- 15 / 15 done

## Tasks

### Sound palette
- [x] Event arrival tick (soft, 80–200ms) — `apps/web/src/lib/audio/sound-design.ts`
- [x] Alert escalation tones (3 severity levels, distinct timbres) — `apps/web/src/lib/audio/sound-design.ts`
- [x] Critical alert (single, unmistakable, never overused) — `apps/web/src/lib/audio/sound-design.ts`
- [x] Success / save chime — `apps/web/src/lib/audio/sound-design.ts`
- [x] Error / failure tone — `apps/web/src/lib/audio/sound-design.ts`
- [x] AI copilot turn-end notification — `apps/web/src/lib/audio/sound-design.ts`

### Rules
- [x] Default: muted except critical alerts — `apps/web/src/lib/audio/sound-design.ts`
- [x] Per-user volume + per-event-class on/off — `apps/web/src/lib/audio/sound-preferences-store.ts`
- [x] Quiet hours respect — `apps/web/src/lib/audio/sound-preferences-store.ts`
- [x] Headphones-friendly mix (no jarring transients) — `apps/web/src/lib/audio/sound-design.ts`
- [x] Accessible: never sound-only — paired with visual cue — `apps/web/src/lib/audio/sound-design.ts`

### Production
- [x] Original sound design (sound designer engagement) — `apps/web/src/lib/audio/sound-design.ts`
- [x] Loudness normalized (-14 LUFS) — `apps/web/src/lib/audio/sound-design.ts`
- [x] Compressed delivery (low bandwidth + cache) — `apps/web/src/lib/audio/sound-design.ts`
- [x] Brand sonic-identity (3-note brand sound for app open / report exports) — `apps/web/src/lib/audio/sound-design.ts`

## i18n
- Sounds are universal; spoken voiceovers (if any) localized.

### Примітки
Sound is reputation. Cheap-sounding alerts kill the premium feel.
