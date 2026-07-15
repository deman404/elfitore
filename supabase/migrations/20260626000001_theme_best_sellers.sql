create table if not exists public.theme_best_sellers (
  id integer primary key default 1,
  product_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.theme_best_sellers (id, product_ids)
values (1, '[]'::jsonb)
on conflict (id) do update
set product_ids = excluded.product_ids,
    updated_at = now();

create or replace function public.touch_theme_best_sellers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_theme_best_sellers_updated_at on public.theme_best_sellers;

create trigger touch_theme_best_sellers_updated_at
before update on public.theme_best_sellers
for each row
execute function public.touch_theme_best_sellers_updated_at();
