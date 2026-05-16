alter table if exists public.web_orders
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_web_orders_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_web_orders_updated_at on public.web_orders;

create trigger touch_web_orders_updated_at
before update on public.web_orders
for each row
execute function public.touch_web_orders_updated_at();
