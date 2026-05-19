create table if not exists public.theme_home_categories (
  id integer primary key default 1,
  cards jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.theme_home_categories (id, cards)
values (
  1,
  '[
    {
      "title": {"en": "Olive Collection", "fr": "Collection d’olive", "ar": "مجموعة الزيتون"},
      "description": {"en": "Fresh olive oils and olive picks for everyday use.", "fr": "Huiles d’olive fraîches et olives pour tous les jours.", "ar": "زيوت زيتون طازجة واختيارات زيتون للاستخدام اليومي."},
      "imageUrl": "/product.png"
    },
    {
      "title": {"en": "Olive Oil", "fr": "Huile d’olive", "ar": "زيت الزيتون"},
      "description": {"en": "Cold-pressed and rich in flavor.", "fr": "Pressée à froid et riche en goût.", "ar": "معصور على البارد وغني بالنكهة."},
      "imageUrl": "/product2.png"
    },
    {
      "title": {"en": "Olives", "fr": "Olives", "ar": "الزيتون"},
      "description": {"en": "Selected for taste, texture, and quality.", "fr": "Choisies pour leur goût, texture et qualité.", "ar": "مختارة للطعم والقوام والجودة."},
      "imageUrl": "/product3.png"
    },
    {
      "title": {"en": "Gift Boxes", "fr": "Coffrets cadeaux", "ar": "علب هدايا"},
      "description": {"en": "Beautiful sets ready for sharing.", "fr": "De beaux coffrets prêts à offrir.", "ar": "مجموعات جميلة جاهزة للمشاركة."},
      "imageUrl": "/product4.png"
    }
  ]'::jsonb
)
on conflict (id) do update
set cards = excluded.cards,
    updated_at = now();

create or replace function public.touch_theme_home_categories_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_theme_home_categories_updated_at on public.theme_home_categories;

create trigger touch_theme_home_categories_updated_at
before update on public.theme_home_categories
for each row
execute function public.touch_theme_home_categories_updated_at();
