create table if not exists sessions (
  id uuid primary key,
  locale text not null,
  combination text not null,
  pair_order jsonb not null,
  sides jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists pair_responses (
  id uuid primary key,
  session_id uuid not null references sessions (id),
  site_type text not null,
  pair_index int not null,
  left_site_id text not null,
  right_site_id text not null,
  enjoyment text not null,
  familiarity_left int not null,
  familiarity_right int not null,
  chinese_model_side text not null,
  reason text,
  reason_tags jsonb,
  created_at timestamptz not null default now(),
  unique (session_id, site_type)
);

create table if not exists background (
  session_id uuid primary key references sessions (id),
  lives_now text not null,
  years_abroad text not null,
  design_experience text not null,
  age text,
  gender text,
  born text,
  born_specify text,
  grew_up text,
  grew_up_specify text,
  lives_specify text,
  years_outside text,
  first_language text,
  language_specify text,
  chinese_web_use text,
  created_at timestamptz not null default now()
);

alter table background add column if not exists age text;
alter table background add column if not exists gender text;
alter table background add column if not exists born text;
alter table background add column if not exists born_specify text;
alter table background add column if not exists grew_up text;
alter table background add column if not exists grew_up_specify text;
alter table background add column if not exists lives_specify text;
alter table background add column if not exists years_outside text;
alter table background add column if not exists first_language text;
alter table background add column if not exists language_specify text;
alter table background add column if not exists chinese_web_use text;
alter table pair_responses add column if not exists reason_tags jsonb;
