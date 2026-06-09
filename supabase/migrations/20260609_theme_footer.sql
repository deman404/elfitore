create table if not exists public.theme_footer (
  id integer primary key default 1,
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.theme_footer (id, content)
values (
  1,
  $json$
  {
    "brandName": "El Fitore",
    "description": {
      "en": "Premium Moroccan olive oils and olives, bringing authentic flavors and quality to your table.",
      "fr": "Huiles d'olive et olives marocaines premium, apportant des saveurs authentiques et une qualité à votre table.",
      "ar": "زيوت زيتون وزيتون مغربي فاخر، يجلب النكهات الأصلية والجودة إلى طاولتك."
    },
    "shopLinks": [
      {
        "name": { "en": "All Products", "fr": "Tous les produits", "ar": "جميع المنتجات" },
        "href": "/shop"
      },
      {
        "name": { "en": "Olive Oils", "fr": "Huiles d'olive", "ar": "زيوت الزيتون" },
        "href": "/shop?category=oil"
      },
      {
        "name": { "en": "Olives", "fr": "Olives", "ar": "الزيتون" },
        "href": "/shop?category=olives"
      },
      {
        "name": { "en": "Gift Sets", "fr": "Coffrets cadeaux", "ar": "مجموعات هدايا" },
        "href": "/shop"
      },
      {
        "name": { "en": "New Arrivals", "fr": "Nouveautés", "ar": "الوصول الجديد" },
        "href": "/shop"
      }
    ],
    "usefulLinks": [
      {
        "name": { "en": "Home", "fr": "Accueil", "ar": "الرئيسية" },
        "href": "/"
      },
      {
        "name": { "en": "Shop", "fr": "Boutique", "ar": "المتجر" },
        "href": "/shop"
      },
      {
        "name": { "en": "Blog", "fr": "Blog", "ar": "المدونة" },
        "href": "/blog"
      },
      {
        "name": { "en": "Contact", "fr": "Contact", "ar": "اتصل بنا" },
        "href": "/contact"
      },
      {
        "name": { "en": "FAQ", "fr": "FAQ", "ar": "الأسئلة الشائعة" },
        "href": "/faq"
      },
      {
        "name": { "en": "Shipping", "fr": "Livraison", "ar": "التوصيل" },
        "href": "/shipping"
      }
    ],
    "supportLinks": [
      {
        "name": { "en": "Contact Us", "fr": "Nous contacter", "ar": "اتصل بنا" },
        "href": "/contact"
      },
      {
        "name": { "en": "FAQ", "fr": "FAQ", "ar": "الأسئلة الشائعة" },
        "href": "/faq"
      },
      {
        "name": { "en": "Shipping", "fr": "Livraison", "ar": "التوصيل" },
        "href": "/shipping"
      },
      {
        "name": { "en": "Returns", "fr": "Retours", "ar": "المرتجعات" },
        "href": "/returns"
      }
    ],
    "socialLinks": {
      "facebook": "https://www.facebook.com/share/1CQYK9qNjd/?mibextid=wwXIfr",
      "instagram": "https://www.instagram.com/elfitor.officiel?igsh=MTdnOHBiaW1na3FpaQ%3D%3D&utm_source=qr",
      "tiktok": "https://www.tiktok.com/@elfitor.officiel?_r=1&_t=ZS-96WkEg14VE4"
    },
    "copyright": {
      "en": "All rights reserved",
      "fr": "Tous droits réservés",
      "ar": "جميع الحقوق محفوظة"
    }
  }
  $json$::jsonb
)
on conflict (id) do update
set content = excluded.content,
    updated_at = now();

create or replace function public.touch_theme_footer_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_theme_footer_updated_at on public.theme_footer;

create trigger touch_theme_footer_updated_at
before update on public.theme_footer
for each row
execute function public.touch_theme_footer_updated_at();
