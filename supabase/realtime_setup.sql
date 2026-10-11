-- ============================================================================
-- UHASMART Realtime Messaging Configuration
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor)
-- ============================================================================

-- 1. Add inquiries and inquiry_messages to the supabase_realtime publication
do $$
begin
  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inquiries'
  ) then
    alter publication supabase_realtime add table public.inquiries;
  end if;

  if not exists (
    select 1 from pg_publication_tables 
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'inquiry_messages'
  ) then
    alter publication supabase_realtime add table public.inquiry_messages;
  end if;
end;
$$;

-- 2. Ensure RLS policies allow reading and writing for participants
-- (These match the policies in full_schema.sql)
comment on table public.inquiry_messages is 'Realtime chat messages between buyers and student sellers';
