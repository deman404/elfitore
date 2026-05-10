alter table if exists public.products
add column if not exists stock integer not null default 100;

alter table if exists public.products
add constraint products_stock_nonnegative check (stock >= 0);

update public.products
set stock = 100
where stock is null;
