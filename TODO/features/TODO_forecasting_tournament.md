# TODO — Public Conflict-Forecasting Tournament

## Goal
Crowd-sourced or expert forecasting tournament (Metaculus/Good Judgment-style) on conflict outcomes — distinct from `services/predictions/` and `layers/TODO_ai_predictions.md`, which are entirely the platform's own internal AI model output (persona-gated, backtested). This is a public-facing product feature, not just a content page — highest effort of round 6's findings.

## Progress
- 0 / 5 done

## URLs
- `/forecasts` (tournament index, leaderboard) · `/forecasts/<question-slug>` (individual forecasting question)

## Tasks
- [ ] Question bank: recurring forecastable questions per conflict (e.g. "will X territory change control by date Y", calibrated resolution criteria) — editorial process to avoid ambiguous/unresolvable questions
- [ ] Forecaster accounts + probability-submission UI, Brier-score leaderboard (reuse `community_ops/TODO_community_metrics.md` patterns for public leaderboard display)
- [ ] Aggregate crowd-forecast display per question, compared against (but clearly labeled as distinct from) the platform's own internal AI prediction where one exists for the same question
- [ ] Anti-manipulation safeguards (reuse `features/TODO_anti_spam_bot.md` patterns — forecasting tournaments are a known bot-manipulation target)
- [ ] FAQPage JSON-LD (10 Q&A) on `/forecasts` index

## Notes
- This is a real product surface (accounts, scoring, leaderboard), not a doc/content page — sequence behind the round-6 content-only gaps (troll-farms, war-economy, veterans, advocacy). Treat similarly to `features/TODO_data_explorer.md` (round 2) in terms of build complexity.

## i18n
- UI chrome needs standard i18n; forecasting questions should be published in both EN and UK simultaneously to avoid giving one locale's forecasters an information/timing advantage.
