create table if not exists public.site_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

create or replace function public.touch_site_settings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_site_settings_updated_at on public.site_settings;

create trigger touch_site_settings_updated_at
before update on public.site_settings
for each row
execute function public.touch_site_settings_updated_at();
