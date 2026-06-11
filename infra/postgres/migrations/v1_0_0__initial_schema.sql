-- v1.0.0 — Initial schema
-- Applies the init/ scripts in order.
-- Run: atlas migrate apply --env dev

-- Extensions (idempotent)
\i ../init/01_extensions.sql

-- RLS + roles (idempotent)
\i ../init/02_rls_setup.sql

-- Core events hypertable
\i ../init/03_events_table.sql

-- Ancillary tables
\i ../init/04_ancillary_tables.sql
