create table if not exists public.web_orders (
  id bigserial primary key,
  reference text unique,
  channel text not null default 'checkout' check (channel in ('checkout', 'product-page')),
  payment_method text not null check (payment_method in ('cod', 'whatsapp')),
  delivery_method text not null default '',
  delivery_city text not null default '',
  shipping_amount numeric(10,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'fulfilled', 'cancelled')),
  customer_full_name text not null default '',
  customer_email text not null default '',
  customer_phone text not null default '',
  customer_address text not null default '',
  customer_city text not null default '',
  customer_postal_code text not null default '',
  customer_country text not null default '',
  notes text not null default '',
  subtotal numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.web_order_items (
  id bigserial primary key,
  web_order_id bigint not null references public.web_orders(id) on delete cascade,
  product_id bigint references public.products(id),
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  line_total numeric(10,2) not null,
  image text not null default ''
);

create index if not exists web_order_items_web_order_id_idx on public.web_order_items (web_order_id);
create index if not exists web_orders_created_at_idx on public.web_orders (created_at desc);
create index if not exists web_orders_reference_idx on public.web_orders (reference);

create or replace function public.create_web_order(
  p_channel text,
  p_payment_method text,
  p_delivery_method text,
  p_delivery_city text,
  p_shipping_amount numeric,
  p_customer_full_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_address text,
  p_customer_city text,
  p_customer_postal_code text,
  p_customer_country text,
  p_notes text,
  p_items jsonb
)
returns table (
  order_id bigint,
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
  order_id_local bigint;
  created_at_local timestamptz;
  order_subtotal numeric(10,2) := 0;
  line_total numeric(10,2);
  reference_local text;
  item_product_name text;
  item_unit_price numeric(10,2);
  item_image text;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain items.';
  end if;

  insert into public.web_orders (
    reference,
    channel,
    payment_method,
    delivery_method,
    delivery_city,
    shipping_amount,
    status,
    customer_full_name,
    customer_email,
    customer_phone,
    customer_address,
    customer_city,
    customer_postal_code,
    customer_country,
    notes,
    subtotal,
    total
  )
  values (
    null,
    coalesce(p_channel, 'checkout'),
    p_payment_method,
    coalesce(p_delivery_method, ''),
    coalesce(p_delivery_city, ''),
    coalesce(p_shipping_amount, 0),
    'pending',
    coalesce(p_customer_full_name, ''),
    coalesce(p_customer_email, ''),
    coalesce(p_customer_phone, ''),
    coalesce(p_customer_address, ''),
    coalesce(p_customer_city, ''),
    coalesce(p_customer_postal_code, ''),
    coalesce(p_customer_country, ''),
    coalesce(p_notes, ''),
    0,
    0
  )
  returning id into order_id_local;

  select o.created_at
  into created_at_local
  from public.web_orders o
  where o.id = order_id_local;

  for item in
    select * from jsonb_to_recordset(p_items) as x(product_id bigint, product_name text, quantity integer, unit_price numeric, image text)
  loop
    if item.quantity is null or item.quantity < 1 then
      raise exception 'Invalid quantity for product %.', coalesce(item.product_id::text, item.product_name, 'unknown');
    end if;

    item_product_name := coalesce(item.product_name, '');
    item_unit_price := coalesce(item.unit_price, 0);
    item_image := coalesce(item.image, '');

    if item.product_id is not null then
      select * into product_row
      from public.products
      where id = item.product_id;

      if found then
        item_product_name := coalesce(product_row.name_en, item_product_name);
        item_unit_price := coalesce(product_row.price, item_unit_price);
        item_image := coalesce(product_row.image, item_image);
      end if;
    end if;

    if item_product_name = '' then
      raise exception 'Order item must include a product name.';
    end if;

    line_total := item_unit_price * item.quantity;
    order_subtotal := order_subtotal + line_total;

    insert into public.web_order_items (
      web_order_id,
      product_id,
      product_name,
      quantity,
      unit_price,
      line_total,
      image
    )
    values (
      order_id_local,
      item.product_id,
      item_product_name,
      item.quantity,
      item_unit_price,
      line_total,
      item_image
    );
  end loop;

  reference_local := 'WEB-' || to_char(created_at_local, 'YYYYMMDD') || '-' || lpad(order_id_local::text, 6, '0');

  update public.web_orders
  set subtotal = order_subtotal,
      total = order_subtotal,
      reference = reference_local
  where id = order_id_local;

  return query
  select order_id_local, reference_local, order_subtotal, order_subtotal, created_at_local;
end;
$$;
