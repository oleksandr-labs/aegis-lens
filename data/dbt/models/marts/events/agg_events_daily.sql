-- mart: daily event aggregates per region + class
-- Used by the region drill-down and the trend chart

{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['occurred_day', 'country', 'class'], 'type': 'btree'},
        ]
    )
}}

select
    occurred_day,
    country,
    coalesce(region_code, 'unknown')   as region_code,
    class,
    count(*)                           as event_count,
    avg(severity)::numeric(4,2)        as avg_severity,
    max(severity)                      as max_severity,
    avg(confidence)::numeric(4,3)      as avg_confidence,
    sum(case when severity >= 4 then 1 else 0 end) as high_severity_count,
    avg(danger_score)::int             as avg_danger_score
from {{ ref('fct_events') }}
group by 1, 2, 3, 4
