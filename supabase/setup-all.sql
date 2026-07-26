-- Vicino core schema
create extension if not exists "pgcrypto";

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  bio text,
  birthdate date,
  gender text check (gender in ('woman', 'man', 'nonbinary', 'other')),
  seeking text check (seeking in ('woman', 'man', 'nonbinary', 'other', 'everyone')),
  photo_urls text[] not null default '{}',
  discovery_enabled boolean not null default false,
  radius_m integer not null default 150,
  onboarding_complete boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.profile_interests (
  user_id uuid not null references public.profiles(id) on delete cascade,
  interest text not null,
  primary key (user_id, interest)
);

create table if not exists public.physical_prefs (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  height_cm_min integer,
  height_cm_max integer,
  style_tags text[] not null default '{}',
  looking_for_tags text[] not null default '{}'
);

create table if not exists public.presence (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  geohash text not null,
  ble_token text not null,
  updated_at timestamptz not null default now()
);

create index if not exists presence_geohash_idx on public.presence (geohash);
create index if not exists presence_updated_idx on public.presence (updated_at desc);
create unique index if not exists presence_ble_token_unique on public.presence (ble_token);

create table if not exists public.nearby_matches (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'candidate'
    check (status in ('candidate', 'ble_confirmed', 'continued', 'passed', 'mutual', 'expired')),
  haptic_seed text not null default encode(gen_random_bytes(8), 'hex'),
  score double precision not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint nearby_matches_ordered check (user_a < user_b),
  constraint nearby_matches_unique unique (user_a, user_b)
);

create table if not exists public.match_actions (
  match_id uuid not null references public.nearby_matches(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  action text not null check (action in ('continue', 'pass')),
  created_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null unique references public.nearby_matches(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists messages_convo_idx on public.messages (conversation_id, created_at);

-- Auto profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  insert into public.physical_prefs (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Geohash encode (precision 8) — compact base32 implementation
create or replace function public.encode_geohash(lat double precision, lng double precision, hash_precision integer default 8)
returns text
language plpgsql
immutable
as $$
declare
  base32 text := '0123456789bcdefghjkmnpqrstuvwxyz';
  lat_min double precision := -90;
  lat_max double precision := 90;
  lng_min double precision := -180;
  lng_max double precision := 180;
  hash text := '';
  bit_idx integer := 0;
  ch integer := 0;
  even boolean := true;
  mid double precision;
begin
  while length(hash) < hash_precision loop
    if even then
      mid := (lng_min + lng_max) / 2;
      if lng >= mid then
        ch := ch * 2 + 1;
        lng_min := mid;
      else
        ch := ch * 2;
        lng_max := mid;
      end if;
    else
      mid := (lat_min + lat_max) / 2;
      if lat >= mid then
        ch := ch * 2 + 1;
        lat_min := mid;
      else
        ch := ch * 2;
        lat_max := mid;
      end if;
    end if;
    even := not even;
    bit_idx := bit_idx + 1;
    if bit_idx = 5 then
      hash := hash || substr(base32, ch + 1, 1);
      bit_idx := 0;
      ch := 0;
    end if;
  end loop;
  return hash;
end;
$$;

create or replace function public.haversine_m(
  lat1 double precision, lng1 double precision,
  lat2 double precision, lng2 double precision
)
returns double precision
language sql
immutable
as $$
  select 2 * 6371000 * asin(sqrt(
    power(sin(radians(lat2 - lat1) / 2), 2) +
    cos(radians(lat1)) * cos(radians(lat2)) *
    power(sin(radians(lng2 - lng1) / 2), 2)
  ));
$$;

create or replace function public.upsert_presence(
  p_lat double precision,
  p_lng double precision,
  p_ble_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data record;
begin
  insert into public.presence as p (user_id, lat, lng, geohash, ble_token, updated_at)
  values (auth.uid(), p_lat, p_lng, public.encode_geohash(p_lat, p_lng), p_ble_token, now())
  on conflict (user_id) do update
    set lat = excluded.lat,
        lng = excluded.lng,
        geohash = excluded.geohash,
        ble_token = excluded.ble_token,
        updated_at = now()
  returning * into row_data;

  update public.profiles set last_seen_at = now() where id = auth.uid();
  return to_jsonb(row_data);
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.profile_interests enable row level security;
alter table public.physical_prefs enable row level security;
alter table public.presence enable row level security;
alter table public.nearby_matches enable row level security;
alter table public.match_actions enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Profiles: own full access; peers only when ble_confirmed+
create policy profiles_select_own on public.profiles
  for select using (auth.uid() = id);

create policy profiles_select_matched on public.profiles
  for select using (
    exists (
      select 1 from public.nearby_matches m
      where m.status in ('ble_confirmed', 'continued', 'mutual')
        and ((m.user_a = auth.uid() and m.user_b = profiles.id)
          or (m.user_b = auth.uid() and m.user_a = profiles.id))
    )
  );

create policy profiles_update_own on public.profiles
  for update using (auth.uid() = id);

create policy profiles_insert_own on public.profiles
  for insert with check (auth.uid() = id);

create policy interests_own on public.profile_interests
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy prefs_own on public.physical_prefs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy presence_own_rw on public.presence
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Presence is queried server-side via service role in edge functions;
-- no direct client RLS access to presence rows is required.

create policy matches_participants on public.nearby_matches
  for select using (auth.uid() = user_a or auth.uid() = user_b);

create policy match_actions_own on public.match_actions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy conversations_participants on public.conversations
  for select using (
    exists (
      select 1 from public.nearby_matches m
      where m.id = conversations.match_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
        and m.status = 'mutual'
    )
  );

create policy messages_participants_select on public.messages
  for select using (
    exists (
      select 1
      from public.conversations c
      join public.nearby_matches m on m.id = c.match_id
      where c.id = messages.conversation_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
        and m.status = 'mutual'
    )
  );

create policy messages_participants_insert on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1
      from public.conversations c
      join public.nearby_matches m on m.id = c.match_id
      where c.id = conversation_id
        and (m.user_a = auth.uid() or m.user_b = auth.uid())
        and m.status = 'mutual'
    )
  );

-- Helper RPCs used by mobile client
create or replace function public.get_revealed_matches()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object(
    'match', to_jsonb(m),
    'peer', jsonb_build_object(
      'id', p.id,
      'display_name', p.display_name,
      'photo_urls', p.photo_urls,
      'bio', p.bio
    )
  )), '[]'::jsonb)
  into result
  from public.nearby_matches m
  join public.profiles p
    on p.id = case when m.user_a = auth.uid() then m.user_b else m.user_a end
  where (m.user_a = auth.uid() or m.user_b = auth.uid())
    and m.status in ('ble_confirmed', 'continued', 'mutual');
  return result;
end;
$$;

create or replace function public.record_match_action(p_match_id uuid, p_action text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.nearby_matches;
  other uuid;
  other_action text;
  convo_id uuid;
begin
  select * into m from public.nearby_matches where id = p_match_id;
  if m.id is null then
    raise exception 'Match not found';
  end if;
  if auth.uid() <> m.user_a and auth.uid() <> m.user_b then
    raise exception 'Not a participant';
  end if;

  insert into public.match_actions (match_id, user_id, action)
  values (p_match_id, auth.uid(), p_action)
  on conflict (match_id, user_id) do update set action = excluded.action;

  if p_action = 'pass' then
    update public.nearby_matches set status = 'passed', updated_at = now() where id = p_match_id;
    return jsonb_build_object('match', (select to_jsonb(nm) from public.nearby_matches nm where id = p_match_id), 'conversation_id', null);
  end if;

  other := case when auth.uid() = m.user_a then m.user_b else m.user_a end;
  select action into other_action from public.match_actions where match_id = p_match_id and user_id = other;

  if other_action = 'continue' then
    update public.nearby_matches set status = 'mutual', updated_at = now() where id = p_match_id;
    insert into public.conversations (match_id)
    values (p_match_id)
    on conflict (match_id) do update set match_id = excluded.match_id
    returning id into convo_id;
    if convo_id is null then
      select id into convo_id from public.conversations where match_id = p_match_id;
    end if;
    return jsonb_build_object(
      'match', (select to_jsonb(nm) from public.nearby_matches nm where id = p_match_id),
      'conversation_id', convo_id
    );
  end if;

  update public.nearby_matches set status = 'continued', updated_at = now() where id = p_match_id;
  return jsonb_build_object(
    'match', (select to_jsonb(nm) from public.nearby_matches nm where id = p_match_id),
    'conversation_id', null
  );
end;
$$;

create or replace function public.list_conversations()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'conversation', to_jsonb(c),
      'match', to_jsonb(m),
      'peer', jsonb_build_object(
        'id', p.id,
        'display_name', p.display_name,
        'photo_urls', p.photo_urls,
        'bio', p.bio
      )
    ))
    from public.conversations c
    join public.nearby_matches m on m.id = c.match_id
    join public.profiles p on p.id = case when m.user_a = auth.uid() then m.user_b else m.user_a end
    where m.status = 'mutual'
      and (m.user_a = auth.uid() or m.user_b = auth.uid())
  ), '[]'::jsonb);
end;
$$;

-- Photo storage bucket (no-op if storage schema unavailable)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public)
    values ('photos', 'photos', false)
    on conflict (id) do update set public = false;
  end if;
exception when others then
  raise notice 'Skipping storage bucket setup: %', sqlerrm;
end $$;
-- Storage policies for profile photos (apply after storage bucket exists)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'objects') then
    -- Drop existing policies so they can be recreated with updated rules
    execute $pol$ drop policy if exists "photo upload own folder" on storage.objects $pol$;
    execute $pol$ drop policy if exists "photo update own folder" on storage.objects $pol$;
    execute $pol$ drop policy if exists "photo select public" on storage.objects $pol$;
    execute $pol$ drop policy if exists "photo select matched or own" on storage.objects $pol$;

    execute $pol$
      create policy "photo upload own folder"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
    $pol$;
    execute $pol$
      create policy "photo update own folder"
      on storage.objects for update to authenticated
      using (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text)
    $pol$;
    -- Select: own photos or photos of a confirmed/mutual match peer
    execute $pol$
      create policy "photo select matched or own"
      on storage.objects for select to authenticated
      using (
        bucket_id = 'photos' and (
          (storage.foldername(name))[1] = auth.uid()::text
          or exists (
            select 1 from public.nearby_matches m
            where m.status in ('ble_confirmed', 'continued', 'mutual')
              and (
                (m.user_a = auth.uid() and m.user_b::text = (storage.foldername(name))[1])
                or (m.user_b = auth.uid() and m.user_a::text = (storage.foldername(name))[1])
              )
          )
        )
      )
    $pol$;
  end if;
exception when others then
  raise notice 'Skipping storage policies: %', sqlerrm;
end $$;
-- Enable Realtime for match and message updates
alter table public.nearby_matches replica identity full;
alter table public.messages replica identity full;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.nearby_matches;
  end if;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    alter publication supabase_realtime add table public.messages;
  end if;
exception when duplicate_object then
  null;
end $$;
