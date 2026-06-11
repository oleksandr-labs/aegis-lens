-- staging: clean + cast raw events
-- Drops retracted events, casts types, normalises coords

with source as (
    select * from {{ ref('raw_events') }}
),

cleaned as (
    select
        event_id,
        source_id,
        external_id,
        class,
        coalesce(subclass, 'unknown')       as subclass,
        cast(lat as double precision)       as lat,
        cast(lon as double precision)       as lon,
        -- PostGIS point for spatial queries
        st_setsrid(st_makepoint(
            cast(lon as double precision),
            cast(lat as double precision)
        ), 4326)                            as geom,
        upper(trim(country))               as country,
        region_code,
        greatest(1, least(5, severity::int)) as severity,
        greatest(0.0, least(1.0, confidence::float)) as confidence,
        occurred_at,
        ingested_at,
        coalesce(title_en, summary_en, '')  as title_en,
        coalesce(title_uk, summary_uk, '')  as title_uk,
        coalesce(summary_en, '')            as summary_en,
        coalesce(summary_uk, '')            as summary_uk,
        media_urls,
        source_urls,
        false                               as is_retracted,
        null::timestamptz                   as retracted_at,
        null::text                          as retraction_reason
    from source
    where not coalesce(is_retracted, false)
      and occurred_at >= '2022-02-24'::date  -- conflict start date
      and lat between -90 and 90
      and lon between -180 and 180
)

select * from cleaned
