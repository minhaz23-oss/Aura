create table if not exists public.clerk_onboarding_profiles (
  clerk_user_id text primary key,
  is_onboarding_complete boolean not null default false,
  onboarding_data jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
