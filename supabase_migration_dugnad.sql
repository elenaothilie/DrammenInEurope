-- =============================================================================
-- Run in Supabase: Dashboard → SQL Editor → New query → paste and Run
-- Adds dugnad column to payment_months so participants can mark dugnad
-- (work party) as alternative to Vipps per month. Safe to run multiple times.
-- =============================================================================

alter table payment_months add column if not exists dugnad boolean default false;
