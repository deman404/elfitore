create table if not exists public.theme_feature_section (
  id smallint primary key default 1 check (id = 1),
  left_image_url text not null default '',
  top_image_url text not null default '',
  bottom_image_url text not null default '',
  video_image_url text not null default '',
  overlay_title_en text not null default '',
  overlay_title_fr text not null default '',
  overlay_title_ar text not null default '',
  overlay_description_en text not null default '',
  overlay_description_fr text not null default '',
  overlay_description_ar text not null default '',
  top_title_en text not null default '',
  top_title_fr text not null default '',
  top_title_ar text not null default '',
  top_subtitle_en text not null default '',
  top_subtitle_fr text not null default '',
  top_subtitle_ar text not null default '',
  top_bullet1_en text not null default '',
  top_bullet1_fr text not null default '',
  top_bullet1_ar text not null default '',
  top_bullet2_en text not null default '',
  top_bullet2_fr text not null default '',
  top_bullet2_ar text not null default '',
  top_bullet3_en text not null default '',
  top_bullet3_fr text not null default '',
  top_bullet3_ar text not null default '',
  section_eyebrow_en text not null default '',
  section_eyebrow_fr text not null default '',
  section_eyebrow_ar text not null default '',
  section_title_en text not null default '',
  section_title_fr text not null default '',
  section_title_ar text not null default '',
  section_description_en text not null default '',
  section_description_fr text not null default '',
  section_description_ar text not null default '',
  bottom_eyebrow_en text not null default '',
  bottom_eyebrow_fr text not null default '',
  bottom_eyebrow_ar text not null default '',
  bottom_title_en text not null default '',
  bottom_title_fr text not null default '',
  bottom_title_ar text not null default '',
  cards jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.theme_trust_badges (
  id smallint primary key default 1 check (id = 1),
  badges jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.theme_cta_banner (
  id smallint primary key default 1 check (id = 1),
  background_image_url text not null default '',
  title1_en text not null default '',
  title1_fr text not null default '',
  title1_ar text not null default '',
  title2_en text not null default '',
  title2_fr text not null default '',
  title2_ar text not null default '',
  leaf_en text not null default '',
  leaf_fr text not null default '',
  leaf_ar text not null default '',
  flower_en text not null default '',
  flower_fr text not null default '',
  flower_ar text not null default '',
  globe_en text not null default '',
  globe_fr text not null default '',
  globe_ar text not null default '',
  updated_at timestamptz not null default now()
);

create or replace function public.touch_theme_feature_section_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.touch_theme_trust_badges_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.touch_theme_cta_banner_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_theme_feature_section_updated_at on public.theme_feature_section;
drop trigger if exists touch_theme_trust_badges_updated_at on public.theme_trust_badges;
drop trigger if exists touch_theme_cta_banner_updated_at on public.theme_cta_banner;

create trigger touch_theme_feature_section_updated_at
before update on public.theme_feature_section
for each row
execute function public.touch_theme_feature_section_updated_at();

create trigger touch_theme_trust_badges_updated_at
before update on public.theme_trust_badges
for each row
execute function public.touch_theme_trust_badges_updated_at();

create trigger touch_theme_cta_banner_updated_at
before update on public.theme_cta_banner
for each row
execute function public.touch_theme_cta_banner_updated_at();
