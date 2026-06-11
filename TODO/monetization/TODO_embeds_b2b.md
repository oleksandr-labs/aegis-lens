# TODO — Embeds-as-a-Product (B2B publishers)

## Goal
Sell embeddable widgets/iframes to media, publishers, blogs and educators as a separate SKU — distinct from white-label. Sites embed a live map / event ticker / AOI widget under their own context, branded but powered by us.

## Progress
- 15 / 15 done

## Products
- [x] **Embed Lite** — free, watermarked, low rate-limit; viral distribution — apps/web/src/lib/embeds/b2b.ts
- [x] **Embed Pro** ($49–199 / mo) — no watermark, custom theme, ≤100k impressions / mo — apps/web/src/lib/embeds/b2b.ts
- [x] **Embed Scale** ($499 / mo) — ≤1M impressions, multiple sites, callbacks — apps/web/src/lib/embeds/b2b.ts
- [x] **Embed Custom** (contract) — large publishers, news-tickers, dashboard widgets, JS SDK — apps/web/src/lib/embeds/b2b.ts

## Variants
- [x] Live map (region-restricted) — apps/web/src/lib/embeds/b2b.ts
- [x] Event ticker (per topic / region) — apps/web/src/lib/embeds/b2b.ts
- [x] AOI mini-widget — apps/web/src/lib/embeds/b2b.ts
- [x] Specific-conflict tracker — apps/web/src/lib/embeds/b2b.ts
- [x] Single-event detail card — apps/web/src/lib/embeds/b2b.ts
- [x] Confidence-score badge for sourced claims — apps/web/src/lib/embeds/b2b.ts

## Mechanics
- [x] Self-serve embed builder (pick widget, configure, paste snippet) — apps/web/src/lib/embeds/b2b.ts
- [x] Per-domain license (whitelist) — apps/web/src/lib/embeds/b2b.ts
- [x] Per-impression metering → [TODO_usage_metering_model.md](TODO_usage_metering_model.md) — apps/web/src/lib/embeds/b2b.ts
- [x] Click-through attribution back to us (acquisition channel) — apps/web/src/lib/embeds/b2b.ts
- [x] WCAG-compliant, responsive, dark/light — apps/web/src/lib/embeds/b2b.ts

## Linked files
- [../features/TODO_embeds_widgets.md](../features/TODO_embeds_widgets.md)
- [TODO_white_label.md](TODO_white_label.md)
- [TODO_freemium_strategy.md](TODO_freemium_strategy.md)

### Примітки
Embed-funnel — найкращий "вірус" для civic-utility-продуктів. Free-tier embed на Wikipedia + великих блогах = постійний brand-impression поток.
