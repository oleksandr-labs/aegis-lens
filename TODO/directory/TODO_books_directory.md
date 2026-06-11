# Directory — Books (OSINT / Intel / Conflict / Cyber)

## URLs
- `/books` · `/books/<slug>` · `/books/<topic>` · `/books/<level>` (beginner / pro)

## Content
- [x] Per-book: author · summary · key takeaways · review · affiliate link (with disclosure) — `apps/web/src/lib/directory/books.ts`
- [x] Schema.org `Book` + `Review` — `BOOK_SCHEMA_NOTE_EN/UK` in `apps/web/src/lib/directory/books.ts`
- [x] Filter by topic / level — `apps/web/src/app/api/v1/directory/books/route.ts` (?topic, ?format, ?free, ?verified)
- [x] "Best books for OSINT 2025" programmatic listicle — `BOOK_PROGRAMMATIC_NOTE_EN/UK` auto-generation rule in `apps/web/src/lib/directory/books.ts`

## Progress
4 / 4 tasks done — Sprint 2.68
