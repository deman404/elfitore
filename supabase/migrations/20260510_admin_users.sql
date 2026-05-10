create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null default '',
  role text not null default 'staff' check (role in ('owner', 'admin', 'manager', 'cashier', 'viewer')),
  can_manage_users boolean not null default false,
  can_manage_sales boolean not null default true,
  can_manage_products boolean not null default true,
  can_manage_categories boolean not null default true,
  can_manage_theme boolean not null default false,
  can_manage_settings boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
