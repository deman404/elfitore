create table if not exists public.blog_posts (
  id bigserial primary key,
  title text not null,
  slug text not null unique,
  excerpt text not null,
  content text not null,
  media_type text not null default 'image',
  media_url text not null,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_published_created_at_idx on public.blog_posts (published, created_at desc);

create or replace function public.touch_blog_posts_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_blog_posts_updated_at on public.blog_posts;

create trigger touch_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.touch_blog_posts_updated_at();

