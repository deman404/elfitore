create table if not exists public.sales (
  id bigserial primary key,
  reference text unique,
  payment_method text not null,
  notes text not null default '',
  cashier_email text not null default '',
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.sale_items (
  id bigserial primary key,
  sale_id bigint not null references public.sales(id) on delete cascade,
  product_id bigint not null references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null
);

create index if not exists sale_items_sale_id_idx on public.sale_items (sale_id);
create index if not exists sales_created_at_idx on public.sales (created_at desc);

create or replace function public.create_pos_sale(
  p_payment_method text,
  p_notes text,
  p_cashier_email text,
  p_items jsonb
)
returns table (
  sale_id bigint,
  reference text,
  subtotal numeric(10,2),
  total numeric(10,2),
  created_at timestamptz
)
language plpgsql
as $$
declare
  item record;
  product_row public.products%rowtype;
  sale_id_local bigint;
  created_at_local timestamptz;
  sale_subtotal numeric(10,2) := 0;
  line_total numeric(10,2);
  reference_local text;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Sale must contain items.';
  end if;

  insert into public.sales (
    reference,
    payment_method,
    notes,
    cashier_email,
    subtotal,
    total
  )
  values (null, p_payment_method, coalesce(p_notes, ''), coalesce(p_cashier_email, ''), 0, 0)
  returning id into sale_id_local;

  select s.created_at
  into created_at_local
  from public.sales s
  where s.id = sale_id_local;

  for item in
    select * from jsonb_to_recordset(p_items) as x(product_id bigint, quantity integer)
  loop
    if item.quantity is null or item.quantity < 1 then
      raise exception 'Invalid quantity for product %.', item.product_id;
    end if;

    select * into product_row
    from public.products
    where id = item.product_id
    for update;

    if not found then
      raise exception 'Product % not found.', item.product_id;
    end if;

    if product_row.stock < item.quantity then
      raise exception 'Insufficient stock for %.', product_row.name_en;
    end if;

    line_total := product_row.price * item.quantity;
    sale_subtotal := sale_subtotal + line_total;

    update public.products
    set stock = stock - item.quantity
    where id = product_row.id;

    insert into public.sale_items (
      sale_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      line_total
    )
    values (
      sale_id_local,
      product_row.id,
      product_row.name_en,
      item.quantity,
      product_row.price,
      line_total
    );
  end loop;

  reference_local := 'POS-' || to_char(created_at_local, 'YYYYMMDD') || '-' || lpad(sale_id_local::text, 6, '0');

  update public.sales
  set subtotal = sale_subtotal,
      total = sale_subtotal,
      reference = reference_local
  where id = sale_id_local;

  return query
  select sale_id_local, reference_local, sale_subtotal, sale_subtotal, created_at_local;
end;
$$;
