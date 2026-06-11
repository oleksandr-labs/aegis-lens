-- v1.1.0 — Add full-text search indexes and unaccent configuration
-- Safety: CREATE INDEX CONCURRENTLY — does not lock table

-- Unaccent support for Ukrainian transliteration
ALTER TEXT SEARCH CONFIGURATION public.ukrainian
  ADD MAPPING FOR hword, hword_part, word
  WITH unaccent, ukrainian_stem;

-- English full-text: title_en + summary_en
CREATE INDEX CONCURRENTLY IF NOT EXISTS events_fts_en_idx
  ON events
  USING GIN (to_tsvector('english', coalesce(title_en, '') || ' ' || coalesce(summary_en, '')));

-- Ukrainian full-text: title_uk + summary_uk
CREATE INDEX CONCURRENTLY IF NOT EXISTS events_fts_uk_idx
  ON events
  USING GIN (to_tsvector('simple', coalesce(title_uk, '') || ' ' || coalesce(summary_uk, '')));

-- Trigram index for fuzzy search on titles
CREATE INDEX CONCURRENTLY IF NOT EXISTS events_title_trgm_en_idx
  ON events
  USING GIN (title_en gin_trgm_ops)
  WHERE title_en IS NOT NULL;
