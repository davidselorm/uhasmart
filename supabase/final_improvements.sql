-- ==============================================================================
-- UHASMART - FINAL IMPROVEMENTS DATABASE MIGRATION SCRIPT
-- ==============================================================================
-- Run this in your Supabase Project -> SQL Editor:
-- https://supabase.com/dashboard/project/fjhlczvwmlvtxdxcnhxi/sql/new
--
-- Features implemented:
-- 1. Seller 30-Day Free Trial & Paid Subscriptions
-- 2. Expired Subscription Hiding (Keep saved, hide from buyers)
-- 3. Automatic Mobile Money Payments & Subscriptions Table
-- 4. Multiple Product Uploads & Gallery Images
-- 5. Two Posting Options ("Post a Flyer" vs "Upload Products")
-- 6. Price Ranges and Contact Details
-- ==============================================================================

-- 1. PROFILES: Subscription & Trial Columns
alter table public.profiles
  add column if not exists subscription_status text not null default 'trial',
  add column if not exists subscription_tier text default 'free_trial',
  add column if not exists trial_started_at timestamptz default now(),
  add column if not exists trial_ends_at timestamptz default (now() + interval '30 days'),
  add column if not exists subscription_expires_at timestamptz default (now() + interval '30 days'),
  add column if not exists subscription_reminder_sent boolean default false;

-- Backfill existing profiles with 30-day trial from their creation date
update public.profiles
set 
  trial_started_at = coalesce(trial_started_at, created_at, now()),
  trial_ends_at = coalesce(trial_ends_at, coalesce(created_at, now()) + interval '30 days'),
  subscription_expires_at = coalesce(subscription_expires_at, coalesce(created_at, now()) + interval '30 days'),
  subscription_status = coalesce(subscription_status, 'trial')
where subscription_expires_at is null;

-- Ensure authenticated users can view subscription status
grant select on public.profiles to anon, authenticated;

-- 2. LISTINGS: Multiple Photos, Gallery, Flyer vs Product, Price Range
alter table public.listings
  add column if not exists listing_type text not null default 'product',
  add column if not exists gallery_images text[] default '{}',
  add column if not exists price_type text not null default 'fixed',
  add column if not exists price_max_ghs numeric(10, 2),
  add column if not exists contact_phone text;

-- Add constraints if not already present
alter table public.listings drop constraint if exists listings_listing_type_check;
alter table public.listings add constraint listings_listing_type_check
  check (listing_type in ('product', 'flyer'));

alter table public.listings drop constraint if exists listings_price_type_check;
alter table public.listings add constraint listings_price_type_check
  check (price_type in ('fixed', 'range'));

-- Create index on seller_id and listing_type
create index if not exists listings_type_idx on public.listings (listing_type);

-- 3. SUBSCRIPTION PAYMENTS TABLE (Mobile Money Records)
create table if not exists public.subscription_payments (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  amount_ghs numeric(10, 2) not null check (amount_ghs >= 0),
  plan_name text not null,
  duration_days integer not null default 30,
  payment_method text not null default 'momo',
  momo_number text,
  momo_network text,
  reference text not null unique,
  status text not null default 'success' check (status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now()
);

-- Enable Row Level Security on subscription_payments
alter table public.subscription_payments enable row level security;

-- Grants for subscription_payments
grant select, insert on public.subscription_payments to authenticated;
grant select on public.subscription_payments to anon;

-- RLS Policies for subscription_payments
drop policy if exists "Users view own subscription payments" on public.subscription_payments;
create policy "Users view own subscription payments"
  on public.subscription_payments for select
  using (seller_id = (select auth.uid()) or (select public.is_admin()));

drop policy if exists "Users insert own subscription payments" on public.subscription_payments;
create policy "Users insert own subscription payments"
  on public.subscription_payments for insert to authenticated
  with check (seller_id = (select auth.uid()));

-- 4. RPC: ACTIVATE SELLER SUBSCRIPTION AUTOMATICALLY AFTER PAYMENT
create or replace function public.activate_seller_subscription(
  p_plan_name text,
  p_duration_days integer,
  p_amount_ghs numeric,
  p_payment_method text,
  p_momo_number text,
  p_momo_network text,
  p_reference text
)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_current_expiry timestamptz;
  v_new_expiry timestamptz;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'You must be signed in to activate a subscription';
  end if;

  -- Fetch current expiry timestamp
  select subscription_expires_at into v_current_expiry
  from public.profiles
  where id = v_user_id;

  -- If subscription has not yet expired, add duration to current expiry date;
  -- otherwise start new period from current time
  if v_current_expiry is not null and v_current_expiry > now() then
    v_new_expiry := v_current_expiry + (p_duration_days || ' days')::interval;
  else
    v_new_expiry := now() + (p_duration_days || ' days')::interval;
  end if;

  -- Record the payment
  insert into public.subscription_payments (
    seller_id,
    amount_ghs,
    plan_name,
    duration_days,
    payment_method,
    momo_number,
    momo_network,
    reference,
    status
  ) values (
    v_user_id,
    p_amount_ghs,
    p_plan_name,
    p_duration_days,
    p_payment_method,
    p_momo_number,
    p_momo_network,
    p_reference,
    'success'
  );

  -- Update seller's profile
  update public.profiles
  set
    subscription_status = 'active',
    subscription_tier = p_plan_name,
    subscription_expires_at = v_new_expiry,
    subscription_reminder_sent = false
  where id = v_user_id;

  return json_build_object(
    'success', true,
    'new_expiry', v_new_expiry,
    'plan', p_plan_name
  );
end;
$$;

grant execute on function public.activate_seller_subscription(text, integer, numeric, text, text, text, text) to authenticated;

-- 5. FUNCTION TO CHECK IF SELLER HAS ACTIVE SUBSCRIPTION / TRIAL
create or replace function public.is_seller_subscription_active(p_seller_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = p_seller_id
      and (
        subscription_expires_at is null 
        or subscription_expires_at > now()
      )
  );
$$;

grant execute on function public.is_seller_subscription_active(uuid) to anon, authenticated;
