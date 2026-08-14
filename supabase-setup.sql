-- Run once in the Supabase dashboard → SQL Editor.

create table if not exists registrations (
  id            bigserial primary key,
  submitted_at  timestamptz not null default now(),
  team_name     text not null,
  team_tag      text not null,
  game          text not null,
  captain_name  text not null,
  captain_email text not null,
  captain_phone text not null,
  discord_id    text not null,
  player_1      text not null,
  player_2      text not null,
  player_3      text not null,
  player_4      text not null,
  player_5      text not null,
  substitute    text,
  notes         text,
  agreed_rules  boolean not null default false
);

-- One entry per team, per game. A second attempt fails instead of
-- creating a duplicate row you'd have to clean up by hand later.
create unique index if not exists registrations_team_game_idx
  on registrations (lower(team_name), game);

alter table registrations enable row level security;

-- The public site may INSERT and nothing else. No select policy exists,
-- so the anon key in index.html cannot read anyone's contact details back.
drop policy if exists "public can register" on registrations;
create policy "public can register"
  on registrations for insert
  to anon
  with check (true);
