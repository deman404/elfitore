alter table if exists public.admin_users
  add column if not exists updated_at timestamptz not null default now();

create or replace function public.touch_admin_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_admin_users_updated_at on public.admin_users;

create trigger touch_admin_users_updated_at
before update on public.admin_users
for each row
execute function public.touch_admin_users_updated_at();
