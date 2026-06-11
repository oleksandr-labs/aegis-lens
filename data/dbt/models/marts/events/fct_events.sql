-- mart: fct_events — queryable event fact table
-- Adds region dimension join, time dimension, danger score

{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['occurred_at'], 'type': 'btree'},
            {'columns': ['country', 'region_code'], 'type': 'btree'},
            {'columns': ['geom'], 'type': 'gist'},
            {'columns': ['class', 'severity'], 'type': 'btree'},
        ]
    )
}}

with events as (
    select * from {{ ref('stg_events') }}
),

-- Danger score: weighted combination of severity + recency + confidence
scored as (
    select
        e.*,
        -- danger 0-100: severity weight 40%, confidence 30%, recency 30%
        round(
            (e.severity / 5.0) * 40
            + e.confidence * 30
            + (1.0 - least(1.0, extract(epoch from (now() - e.occurred_at)) / 604800.0)) * 30
        )::int                              as danger_score,
        date_trunc('hour', e.occurred_at)  as occurred_hour,
        date_trunc('day',  e.occurred_at)  as occurred_day,
        date_trunc('week', e.occurred_at)  as occurred_week,
        extract(epoch from e.occurred_at)::bigint as occurred_epoch
    from events e
)

select * from scored
