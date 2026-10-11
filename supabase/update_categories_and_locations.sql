-- ============================================================================
-- UHASMART Database Update: Expanded Categories & Ho-wide Locations
-- Run this in the Supabase SQL Editor if category checks are enabled
-- ============================================================================

-- 1. Drop old category check constraint if it exists
alter table public.listings drop constraint if exists listings_category_check;

-- 2. Add updated check constraint supporting Hostels, Salons/Barbers, Groceries, etc.
alter table public.listings add constraint listings_category_check
  check (category in (
    'hostels',
    'food',
    'groceries',
    'salons-barbers',
    'fashion',
    'electronics',
    'beauty',
    'academic-services',
    'printing',
    'photography',
    'other'
  ));

comment on column public.listings.category is 'Category including Hostels, Salons & Barbers, Groceries, Food, Fashion, Tech, etc.';
