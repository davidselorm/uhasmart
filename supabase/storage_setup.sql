-- ============================================================================
-- UHASMART: SUPABASE STORAGE SETUP FOR LISTING IMAGES
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/fjhlczvwmlvtxdxcnhxi/sql/new
-- ============================================================================

-- 1. Ensure the 'listing-images' bucket exists and is set to PUBLIC
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];

-- 2. Drop any previous storage policies on listing-images to avoid conflicts
drop policy if exists "Approved listing images are readable" on storage.objects;
drop policy if exists "Public listing images are readable" on storage.objects;
drop policy if exists "Users upload to their own image folder" on storage.objects;
drop policy if exists "Authenticated users upload listing images" on storage.objects;
drop policy if exists "Users delete their own images" on storage.objects;
drop policy if exists "Users manage their own listing images" on storage.objects;

-- 3. Public read policy: Anyone browsing the marketplace can view product images
create policy "Public listing images are readable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

-- 4. Upload policy: Authenticated sellers can upload to their user folder
create policy "Authenticated users upload listing images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'listing-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- 5. Delete policy: Users can delete their own uploaded images (or admins can delete any)
create policy "Users manage their own listing images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'listing-images'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or (select public.is_admin())
    )
  );
