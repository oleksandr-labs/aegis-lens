# TODO — Telegram / Slack / Discord Bots

## Goal
Bring the platform to where users already live. Search, ask, get alerts in chat.

## Progress
- 13 / 13 done (Sprint 2.69 — auth-link, private bot, directory, help, bounty leaderboard)

## Tasks

### Common bot capabilities
- [x] `/search <query>` — return top events with links — `integrations/telegram/src/bot-handler.ts` AegisLensBot /search command (top 5 results)
- [x] `/ask <question>` — AI copilot answer with citations — AegisLensBot /ask command (BotDependencies.askCopilot)
- [x] `/subscribe <filter>` — alerts to this chat — AegisLensBot /subscribe command
- [x] `/region <name>` — current region brief — AegisLensBot /region command
- [x] `/event <id>` — event card with media — AegisLensBot /event command (danger score, class, date)
- [x] Per-user auth-linking (DM the bot) — `integrations/telegram/src/auth-link.ts`

### Telegram
- [x] Public-channel auto-poster for daily briefs — `integrations/telegram/src/daily-poster.ts` DailyBriefPoster; `POST /api/integrations/telegram/daily-brief`; EN+UK bilingual; dry-run mode; cron-secret auth
- [x] Private bot for paid users — `integrations/telegram/src/private-bot.ts`
- [x] UA / EN / RU command sets — bot-handler.ts locale inference (Cyrillic ratio + UA-specific letter detection)

### Slack
- [x] Slack app (slash commands + interactivity + scheduled briefs) — `integrations/slack/src/bot-handler.ts` AegisLensSlackBot (/aegis-search /aegis-region /aegis-event /aegis-ask /aegis-subscribe /aegis-help)
- [x] Per-channel routing for alerts — `buildAlertMessage()` in SlackBotHandler; signature verification in bolt-client.ts
- [x] Marketplace listing — `apps/web/src/lib/bots/directory.ts` (BOT_DIRECTORY entries for Telegram/Slack/Discord)

### Discord
- [x] Discord bot for OSINT community server — `integrations/discord/src/interaction-handler.ts` AegisLensDiscordBot (slash commands: /search /region /event /ask /subscribe /help); Ed25519 verification in verify.ts
- [x] Bounty / leaderboard integrations — `integrations/discord/src/bounty-leaderboard.ts`

### Discoverability
- [x] Bot directory pages on the site (SEO surfaces) — `apps/web/src/lib/bots/directory.ts` (BOT_DIRECTORY + buildBotPageSchema)
- [x] Per-bot help command + linked docs — `apps/web/src/lib/bots/help.ts` (BOT_HELP_COMMANDS + buildHelpMessage + HELP_DOCS_URL)

## i18n
- Bots respond in user's locale; commands accept transliteration.

### Примітки
Bots have 10× higher daily engagement than the web app for casual users. Big retention play.
