-- mart: per-source health metrics
-- Used by the source health dashboard and SLO tracking

{{
    config(
        materialized='table',
        indexes=[
            {'columns': ['source_id'], 'type': 'btree'},
        ]
    )
}}

with daily as (
    select
        source_id,
        date_trunc('day', occurred_at) as day,
        count(*) as events_on_day
    from {{ ref('stg_events') }}
    group by 1, 2
),

last_30d as (
    select
        source_id,
        count(*) as total_events,
        count(distinct date_trunc('day', occurred_at)) as active_days,
        max(occurred_at) as last_event_at,
        min(occurred_at) as first_event_at,
        avg(case
            when date_trunc('day', occurred_at) >= current_date - 7
            then 1.0 else 0.0
        end) as recent_activity_ratio
    from {{ ref('stg_events') }}
    where occurred_at >= current_date - 30
    group by 1
)

select
    l.*,
    -- SLO: healthy if active ≥ 25 of 30 days
    case
        when l.active_days >= 25 then 'healthy'
        when l.active_days >= 15 then 'warning'
        when l.active_days >= 5  then 'critical'
        else 'unknown'
    end as health_status,
    -- Silence: days since last event
    extract(day from now() - l.last_event_at)::int as days_silent
from last_30d l
