-- Vicino lean onboarding + intent-weighted matching (Phase 1–2)

alter table public.profiles
  add column if not exists intent text
    check (intent is null or intent in ('tonight', 'casual', 'open', 'dating', 'long_term')),
  add column if not exists height_cm integer
    check (height_cm is null or (height_cm >= 120 and height_cm <= 230)),
  add column if not exists lifestyle jsonb not null default '{}'::jsonb,
  add column if not exists onboarding_step text,
  add column if not exists profile_gaps text[] not null default '{}',
  add column if not exists age_min integer not null default 18
    check (age_min >= 18 and age_min <= 99),
  add column if not exists age_max integer not null default 99
    check (age_max >= 18 and age_max <= 99),
  add column if not exists consent_behavioral boolean not null default false,
  add column if not exists consent_photo_analysis boolean not null default false,
  add column if not exists prompt text;

alter table public.profiles
  drop constraint if exists profiles_age_range_check;
alter table public.profiles
  add constraint profiles_age_range_check check (age_min <= age_max);

create table if not exists public.onboarding_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  step text not null,
  action text not null check (action in ('view', 'answer', 'skip', 'complete', 'resume')),
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists onboarding_events_user_idx
  on public.onboarding_events (user_id, created_at desc);

create table if not exists public.flash_round_responses (
  user_id uuid not null references public.profiles(id) on delete cascade,
  sample_id text not null,
  liked boolean not null,
  created_at timestamptz not null default now(),
  primary key (user_id, sample_id)
);

create table if not exists public.user_weights (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  intent text,
  appearance double precision not null default 0.3,
  proximity double precision not null default 0.15,
  intent_align double precision not null default 0.2,
  interests double precision not null default 0.15,
  lifestyle double precision not null default 0.1,
  prompt_reliability double precision not null default 0.1,
  updated_at timestamptz not null default now()
);

alter table public.onboarding_events enable row level security;
alter table public.flash_round_responses enable row level security;
alter table public.user_weights enable row level security;

create policy onboarding_events_own on public.onboarding_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy flash_round_own on public.flash_round_responses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy user_weights_own on public.user_weights
  for select using (auth.uid() = user_id);

create policy user_weights_own_write on public.user_weights
  for insert with check (auth.uid() = user_id);

create policy user_weights_own_update on public.user_weights
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed / refresh weights from intent preset when profile intent changes
create or replace function public.sync_user_weights_from_intent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  w_appearance double precision;
  w_proximity double precision;
  w_intent double precision;
  w_interests double precision;
  w_lifestyle double precision;
  w_prompt double precision;
begin
  if new.intent is null then
    return new;
  end if;

  case new.intent
    when 'tonight' then
      w_appearance := 0.40; w_proximity := 0.25; w_intent := 0.15;
      w_interests := 0.08; w_lifestyle := 0.02; w_prompt := 0.10;
    when 'casual' then
      w_appearance := 0.30; w_proximity := 0.15; w_intent := 0.20;
      w_interests := 0.15; w_lifestyle := 0.10; w_prompt := 0.10;
    when 'open' then
      w_appearance := 0.30; w_proximity := 0.15; w_intent := 0.20;
      w_interests := 0.15; w_lifestyle := 0.10; w_prompt := 0.10;
    else -- dating, long_term
      w_appearance := 0.18; w_proximity := 0.07; w_intent := 0.20;
      w_interests := 0.20; w_lifestyle := 0.20; w_prompt := 0.15;
  end case;

  insert into public.user_weights as uw (
    user_id, intent, appearance, proximity, intent_align, interests, lifestyle, prompt_reliability, updated_at
  ) values (
    new.id, new.intent, w_appearance, w_proximity, w_intent, w_interests, w_lifestyle, w_prompt, now()
  )
  on conflict (user_id) do update set
    intent = excluded.intent,
    appearance = excluded.appearance,
    proximity = excluded.proximity,
    intent_align = excluded.intent_align,
    interests = excluded.interests,
    lifestyle = excluded.lifestyle,
    prompt_reliability = excluded.prompt_reliability,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists profiles_sync_user_weights on public.profiles;
create trigger profiles_sync_user_weights
  after insert or update of intent on public.profiles
  for each row
  execute function public.sync_user_weights_from_intent();
