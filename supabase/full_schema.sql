-- ==============================================================================
-- UHASMART - COMPLETE DATABASE INITIALIZATION SCRIPT
-- ==============================================================================
-- Run this in your new Supabase Project -> SQL Editor
-- Project URL: https://fjhlczvwmlvtxdxcnhxi.supabase.co
-- ==============================================================================

-- STEP 0: CLEAN SLATE
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists listings_protect_status on public.listings;

drop function if exists public.create_profile_for_new_user() cascade;
drop function if exists public.protect_listing_status() cascade;
drop function if exists public.is_admin() cascade;
drop function if exists public.is_super_admin() cascade;
drop function if exists public.is_seller() cascade;
drop function if exists public.delete_user_account() cascade;
drop function if exists public.get_admin_stats() cascade;
drop function if exists public.get_admin_users() cascade;
drop function if exists public.admin_toggle_moderator(uuid) cascade;
drop function if exists public.admin_toggle_admin_role(uuid) cascade;
drop function if exists public.admin_delete_listing(uuid) cascade;

drop table if exists public.listing_reports cascade;
drop table if exists public.inquiry_messages cascade;
drop table if exists public.inquiries cascade;
drop table if exists public.listings cascade;
drop table if exists public.user_roles cascade;
drop table if exists public.profiles cascade;

drop type if exists public.account_role cascade;
drop type if exists public.listing_status cascade;

-- STEP 1: EXTENSIONS & ENUMS
create extension if not exists pgcrypto;

create type public.account_role as enum ('customer', 'seller');
create type public.listing_status as enum ('pending', 'active', 'rejected', 'withdrawn', 'sold');

-- STEP 2: TABLES

-- 2.1 Profiles (linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  role public.account_role not null default 'customer',
  business_name text,
  phone_number text,
  campus_location text,
  created_at timestamptz not null default now()
);

-- 2.2 User Roles (Moderators and Super Admins)
create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in ('moderator', 'admin')),
  primary key (user_id, role)
);

-- 2.3 Listings
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null check (char_length(description) between 10 and 3000),
  category text not null check (category in ('food', 'fashion', 'electronics', 'beauty', 'photography', 'printing', 'academic-services', 'other')),
  price_ghs numeric(10, 2) not null check (price_ghs >= 0),
  location text not null check (char_length(location) between 2 and 120),
  image_path text,
  status public.listing_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2.4 Inquiries
create table public.inquiries (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id),
  check (buyer_id <> seller_id)
);

-- 2.5 Inquiry Messages
create table public.inquiry_messages (
  id uuid primary key default gen_random_uuid(),
  inquiry_id uuid not null references public.inquiries (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now()
);

-- 2.6 Listing Reports
create table public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (char_length(reason) between 5 and 1000),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  unique (listing_id, reporter_id)
);

-- STEP 3: INDEXES
create index listings_active_created_idx on public.listings (created_at desc) where status = 'active';
create index listings_seller_created_idx on public.listings (seller_id, created_at desc);
create index listings_category_active_idx on public.listings (category, created_at desc) where status = 'active';
create index inquiry_messages_conversation_idx on public.inquiry_messages (inquiry_id, created_at);

-- STEP 4: FUNCTIONS & TRIGGERS

-- 4.1 Admin Check Function
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role in ('moderator', 'admin')
  );
$$;

-- 4.2 Super Admin Check Function
create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

-- 4.3 Seller Check Function
create or replace function public.is_seller()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'seller'
  );
$$;

-- 4.4 Trigger to Create Profile on User Signup
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_name text;
  requested_role text;
  user_role public.account_role;
  biz_name text;
  phone text;
  loc text;
begin
  requested_name := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
  requested_role := lower(coalesce(new.raw_user_meta_data ->> 'role', 'customer'));

  if requested_role = 'seller' then
    user_role := 'seller'::public.account_role;
    biz_name := nullif(trim(new.raw_user_meta_data ->> 'business_name'), '');
    phone := nullif(trim(new.raw_user_meta_data ->> 'phone_number'), '');
    loc := nullif(trim(new.raw_user_meta_data ->> 'campus_location'), '');
  else
    user_role := 'customer'::public.account_role;
    biz_name := null;
    phone := null;
    loc := null;
  end if;

  insert into public.profiles (id, display_name, role, business_name, phone_number, campus_location)
  values (
    new.id,
    coalesce(left(requested_name, 80), split_part(new.email, '@', 1), 'UHASMART user'),
    user_role,
    biz_name,
    phone,
    loc
  )
  on conflict (id) do update
  set
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    role = coalesce(excluded.role, public.profiles.role),
    business_name = coalesce(excluded.business_name, public.profiles.business_name),
    phone_number = coalesce(excluded.phone_number, public.profiles.phone_number),
    campus_location = coalesce(excluded.campus_location, public.profiles.campus_location);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

-- 4.5 Protect Listing Status Transitions
create or replace function public.protect_listing_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status <> old.status and not (
    (select public.is_admin())
    or (
      old.seller_id = (select auth.uid())
      and old.status in ('active', 'pending')
      and new.status in ('withdrawn', 'sold')
    )
  ) then
    raise exception 'Listing status changes require seller or moderator permission';
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger listings_protect_status
  before update on public.listings
  for each row execute function public.protect_listing_status();

-- 4.6 User Self-Delete RPC
create or replace function public.delete_user_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_user_id uuid;
begin
  current_user_id := auth.uid();
  if current_user_id is null then
    raise exception 'You must be signed in to delete your account.';
  end if;

  delete from auth.users where id = current_user_id;
end;
$$;

-- 4.7 Admin Platform Stats RPC
create or replace function public.get_admin_stats()
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  result json;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select json_build_object(
    'total_users', (select count(*) from public.profiles),
    'total_customers', (select count(*) from public.profiles where role = 'customer'),
    'total_sellers', (select count(*) from public.profiles where role = 'seller'),
    'active_listings', (select count(*) from public.listings where status = 'active'),
    'pending_listings', (select count(*) from public.listings where status = 'pending'),
    'rejected_listings', (select count(*) from public.listings where status = 'rejected'),
    'total_reports', (select count(*) from public.listing_reports where reviewed_at is null)
  ) into result;

  return result;
end;
$$;

-- 4.8 Admin User Directory RPC
create or replace function public.get_admin_users()
returns table (
  id uuid,
  display_name text,
  role text,
  business_name text,
  phone_number text,
  campus_location text,
  created_at timestamptz,
  is_moderator boolean,
  is_admin_role boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  return query
  select
    p.id,
    p.display_name,
    p.role::text,
    p.business_name,
    p.phone_number,
    p.campus_location,
    p.created_at,
    exists (select 1 from public.user_roles ur where ur.user_id = p.id and ur.role in ('moderator', 'admin')),
    exists (select 1 from public.user_roles ur where ur.user_id = p.id and ur.role = 'admin')
  from public.profiles p
  order by p.created_at desc;
end;
$$;

-- 4.9 Admin Toggle Moderator RPC
create or replace function public.admin_toggle_moderator(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_mod boolean;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  select exists (select 1 from public.user_roles where user_id = p_user_id and role = 'moderator') into is_mod;

  if is_mod then
    delete from public.user_roles where user_id = p_user_id and role = 'moderator';
    return false;
  else
    insert into public.user_roles (user_id, role) values (p_user_id, 'moderator') on conflict do nothing;
    return true;
  end if;
end;
$$;

-- 4.10 Admin Toggle Super Admin RPC
create or replace function public.admin_toggle_admin_role(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  is_adm boolean;
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  if p_user_id = (select auth.uid()) then
    raise exception 'Cannot change your own admin status';
  end if;

  select exists (select 1 from public.user_roles where user_id = p_user_id and role = 'admin') into is_adm;

  if is_adm then
    delete from public.user_roles where user_id = p_user_id and role = 'admin';
    return false;
  else
    insert into public.user_roles (user_id, role) values (p_user_id, 'admin') on conflict do nothing;
    return true;
  end if;
end;
$$;

-- 4.11 Admin Delete Listing RPC
create or replace function public.admin_delete_listing(p_listing_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized';
  end if;

  delete from public.listings where id = p_listing_id;
  return true;
end;
$$;

-- STEP 5: PERMISSIONS & RLS

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.listings enable row level security;
alter table public.inquiries enable row level security;
alter table public.inquiry_messages enable row level security;
alter table public.listing_reports enable row level security;

-- Revoke direct tampering of roles table
revoke all on public.user_roles from anon, authenticated;

-- Grants for authenticated & anon
grant select on public.profiles to anon, authenticated;
grant update (display_name, role, business_name, phone_number, campus_location) on public.profiles to authenticated;

grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;

grant select, insert on public.inquiries to authenticated;
grant select, insert on public.inquiry_messages to authenticated;

grant select, insert on public.listing_reports to authenticated;
grant update (reviewed_at, reviewed_by) on public.listing_reports to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_super_admin() to anon, authenticated;
grant execute on function public.is_seller() to anon, authenticated;
grant execute on function public.delete_user_account() to authenticated;
grant execute on function public.get_admin_stats() to authenticated;
grant execute on function public.get_admin_users() to authenticated;
grant execute on function public.admin_toggle_moderator(uuid) to authenticated;
grant execute on function public.admin_toggle_admin_role(uuid) to authenticated;
grant execute on function public.admin_delete_listing(uuid) to authenticated;

-- 5.1 Profiles Policies
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users update their own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 5.2 Listings Policies
create policy "Active listings and own listings are readable"
  on public.listings for select
  using (status = 'active' or seller_id = (select auth.uid()) or (select public.is_admin()));

create policy "Sellers create pending listings"
  on public.listings for insert to authenticated
  with check (
    seller_id = (select auth.uid())
    and status = 'pending'
    and (
      (select public.is_seller())
      or (select public.is_admin())
    )
  );

create policy "Sellers edit own listings"
  on public.listings for update to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()))
  with check (seller_id = (select auth.uid()) or (select public.is_admin()));

create policy "Sellers or moderators delete listings"
  on public.listings for delete to authenticated
  using (seller_id = (select auth.uid()) or (select public.is_admin()));

-- 5.3 Inquiries Policies
create policy "Inquiry participants read inquiries"
  on public.inquiries for select to authenticated
  using (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()) or (select public.is_admin()));

create policy "Buyers inquire on active listings"
  on public.inquiries for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and buyer_id <> seller_id
    and exists (
      select 1 from public.listings
      where id = listing_id and status = 'active' and seller_id = inquiries.seller_id
    )
  );

-- 5.4 Inquiry Messages Policies
create policy "Inquiry participants read messages"
  on public.inquiry_messages for select to authenticated
  using (
    exists (
      select 1 from public.inquiries
      where id = inquiry_id
        and (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()))
    )
    or (select public.is_admin())
  );

create policy "Inquiry participants send messages"
  on public.inquiry_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.inquiries
      where id = inquiry_id
        and (buyer_id = (select auth.uid()) or seller_id = (select auth.uid()))
    )
  );

-- 5.5 Listing Reports Policies
create policy "Users submit a report"
  on public.listing_reports for insert to authenticated
  with check (
    reporter_id = (select auth.uid())
    and exists (
      select 1 from public.listings
      where id = listing_id
        and status = 'active'
        and seller_id <> (select auth.uid())
    )
  );

create policy "Moderators review reports"
  on public.listing_reports for select to authenticated
  using ((select public.is_admin()));

create policy "Moderators resolve reports"
  on public.listing_reports for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- STEP 6: STORAGE BUCKET (Listing Images)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Approved listing images are readable" on storage.objects;
drop policy if exists "Users upload to their own image folder" on storage.objects;
drop policy if exists "Users delete their own images" on storage.objects;

create policy "Approved listing images are readable"
  on storage.objects for select
  using (
    bucket_id = 'listing-images'
    and exists (
      select 1 from public.listings
      where image_path = name
        and (
          status = 'active'
          or seller_id = (select auth.uid())
          or (select public.is_admin())
        )
    )
  );

create policy "Users upload to their own image folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.listings
      where id::text = (storage.foldername(name))[2]
        and seller_id = (select auth.uid())
    )
  );

create policy "Users delete their own images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and exists (
      select 1 from public.listings
      where id::text = (storage.foldername(name))[2]
        and seller_id = (select auth.uid())
    )
  );
