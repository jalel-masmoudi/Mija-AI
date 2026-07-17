create table public.assembly_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null default 'nordic-bedside-cabinet',
  current_step integer not null default 0 check (current_step between 0 and 12),
  completed_steps jsonb not null default '[]'::jsonb,
  manual_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table public.assembly_sessions enable row level security;
grant select, insert, update, delete on public.assembly_sessions to authenticated;

create policy "Users read own assembly sessions" on public.assembly_sessions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create own assembly sessions" on public.assembly_sessions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own assembly sessions" on public.assembly_sessions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own assembly sessions" on public.assembly_sessions for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public) values ('manuals', 'manuals', false) on conflict (id) do nothing;
create policy "Users upload own manuals" on storage.objects for insert to authenticated with check (bucket_id = 'manuals' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users read own manuals" on storage.objects for select to authenticated using (bucket_id = 'manuals' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users update own manuals" on storage.objects for update to authenticated using (bucket_id = 'manuals' and (storage.foldername(name))[1] = (select auth.uid()::text)) with check (bucket_id = 'manuals' and (storage.foldername(name))[1] = (select auth.uid()::text));
create policy "Users delete own manuals" on storage.objects for delete to authenticated using (bucket_id = 'manuals' and (storage.foldername(name))[1] = (select auth.uid()::text));
