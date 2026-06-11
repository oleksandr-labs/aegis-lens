# TODO — Audio / Podcast Subscriptions

## Goal
Paid private podcast feed + audio briefings for analysts who consume on-the-go. Aligns with daily-brief subscription but in audio.

## Progress
- 8 / 8 done

## Products
- [x] **Daily audio briefing** ($9 / mo) — 5-min AI-narrated + analyst-edited summary, RSS via Apple/Spotify-private feeds — apps/web/src/lib/audio/podcast-sub.ts
- [x] **Weekly deep-dive podcast** ($19 / mo) — 30-min analyst-hosted — apps/web/src/lib/audio/podcast-sub.ts
- [x] **Vertical-channel podcasts** (Maritime brief, Finance brief, etc.) — add-on to vertical packs — apps/web/src/lib/audio/podcast-sub.ts
- [x] **Free sample podcast** — once weekly, public; top-of-funnel + SEO — apps/web/src/lib/audio/podcast-sub.ts

## Mechanics
- [x] Private RSS-feed tokens per subscriber (Apple/Pocket Casts/Overcast compatible) — apps/web/src/lib/audio/podcast-sub.ts
- [x] Transcripts + chapter markers for accessibility — apps/web/src/lib/audio/podcast-sub.ts
- [x] TTS via [../ai/TODO_nlp.md](../ai/TODO_nlp.md) (STT/TTS) — multilingual (EN, UK, RU) — apps/web/src/lib/audio/podcast-sub.ts
- [x] Sponsored slot once / month (vendor-vetted only) — apps/web/src/lib/audio/podcast-sub.ts

## Linked files
- [TODO_reports_marketplace.md](TODO_reports_marketplace.md)
- [../content/TODO_brief_templates.md](../content/TODO_brief_templates.md)

### Примітки
Аудіо — нішевий, але дешевий supply (AI-TTS + редактор). Низький friction-канал привʼязки до brand.
