create table if not exists public.theme_hero (
  id smallint primary key default 1 check (id = 1),
  media_type text not null default 'video' check (media_type in ('image', 'video')),
  media_url text not null default '',
  subtitle_en text not null default '',
  subtitle_fr text not null default '',
  subtitle_ar text not null default '',
  title1_en text not null default '',
  title1_fr text not null default '',
  title1_ar text not null default '',
  title2_en text not null default '',
  title2_fr text not null default '',
  title2_ar text not null default '',
  description_en text not null default '',
  description_fr text not null default '',
  description_ar text not null default '',
  cta_en text not null default '',
  cta_fr text not null default '',
  cta_ar text not null default '',
  scroll_en text not null default '',
  scroll_fr text not null default '',
  scroll_ar text not null default '',
  updated_at timestamptz not null default now()
);

create or replace function public.touch_theme_hero_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_theme_hero_updated_at on public.theme_hero;

create trigger touch_theme_hero_updated_at
before update on public.theme_hero
for each row
execute function public.touch_theme_hero_updated_at();
