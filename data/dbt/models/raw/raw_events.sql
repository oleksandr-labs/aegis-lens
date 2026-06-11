-- raw layer: events as ingested, no transformation
-- Source: ingest service writes to raw.events table

select
    event_id,
    source_id,
    external_id,
    class,
    subclass,
    lat,
    lon,
    country,
    region_code,
    severity,
    confidence,
    occurred_at,
    ingested_at,
    title_en,
    title_uk,
    summary_en,
    summary_uk,
    media_urls,
    source_urls,
    raw_payload,
    is_retracted,
    retracted_at,
    retraction_reason
from {{ source('ingest', 'events') }}
