create table if not exists public.theme_support_pages (
  id integer primary key default 1,
  contact jsonb not null default '{}'::jsonb,
  faq jsonb not null default '{}'::jsonb,
  shipping jsonb not null default '{}'::jsonb,
  returns jsonb not null default '{}'::jsonb,
  privacy_policy jsonb not null default '{}'::jsonb,
  terms_of_service jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.theme_support_pages (id)
values (1)
on conflict (id) do nothing;

create or replace function public.touch_theme_support_pages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_theme_support_pages_updated_at on public.theme_support_pages;

create trigger touch_theme_support_pages_updated_at
before update on public.theme_support_pages
for each row
execute function public.touch_theme_support_pages_updated_at();
