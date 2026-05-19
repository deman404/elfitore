create table if not exists public.theme_marketing_pages (
  id integer primary key default 1,
  propos jsonb not null default '{}'::jsonb,
  our_story jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.theme_marketing_pages (id, propos, our_story)
values (
  1,
  $${
    "eyebrow": {"en": "About Us", "fr": "À propos", "ar": "من نحن"},
    "title": {"en": "Moroccan olive oil, brought to you with care.", "fr": "L’huile d’olive marocaine, avec soin.", "ar": "زيت زيتون مغربي يصل إليك بعناية."},
    "subtitle": {"en": "El Fitore is built around simple values: honest sourcing, thoughtful quality, and products that feel at home on everyday tables.", "fr": "El Fitore repose sur des valeurs simples : un sourcing honnête, une qualité soignée et des produits qui trouvent leur place au quotidien.", "ar": "إلفيتوري مبني على قيم بسيطة: مصادر صادقة، جودة مدروسة، ومنتجات تشعر بأنها في مكانها الطبيعي على الموائد اليومية."},
    "intro": {"en": "We work with trusted Moroccan partners to offer olive oil and olives that reflect the region’s natural character.", "fr": "Nous travaillons avec des partenaires marocains de confiance pour proposer des huiles d’olive et des olives qui reflètent le caractère naturel de la région.", "ar": "نعمل مع شركاء مغاربة موثوقين لنقدم زيت الزيتون والزيتون الذي يعكس الطابع الطبيعي للمنطقة."},
    "missionTitle": {"en": "Our mission", "fr": "Notre mission", "ar": "مهمتنا"},
    "missionText": {"en": "To make premium Moroccan olive products easy to discover, easy to order, and enjoyable to share.", "fr": "Rendre les produits d’olive marocains premium faciles à découvrir, à commander et à partager.", "ar": "نجعل منتجات الزيتون المغربية الفاخرة سهلة الاكتشاف والطلب والمشاركة."},
    "featureTitles": [
      {"title": {"en": "Natural taste", "fr": "Goût naturel", "ar": "طعم طبيعي"}},
      {"title": {"en": "Trusted quality", "fr": "Qualité fiable", "ar": "جودة موثوقة"}},
      {"title": {"en": "Premium selection", "fr": "Sélection premium", "ar": "اختيار فاخر"}},
      {"title": {"en": "Tracked delivery", "fr": "Livraison suivie", "ar": "توصيل متابع"}}
    ],
    "cta": {"en": "Explore the shop", "fr": "Explorer la boutique", "ar": "استكشف المتجر"}
  }$$::jsonb,
  $${
    "eyebrow": {"en": "Our Story", "fr": "Notre histoire", "ar": "قصتنا"},
    "title": {"en": "From a local Moroccan idea to a growing brand.", "fr": "D’une idée marocaine locale à une marque grandissante.", "ar": "من فكرة مغربية محلية إلى علامة تنمو بثبات."},
    "subtitle": {"en": "We started with a simple desire: make authentic Moroccan olive products easier to discover and more enjoyable to share.", "fr": "Nous avons commencé avec un désir simple : rendre les produits d’olive marocains authentiques plus faciles à découvrir et plus agréables à partager.", "ar": "بدأنا برغبة بسيطة: جعل منتجات الزيتون المغربية الأصيلة أسهل اكتشافًا وأكثر متعة في المشاركة."},
    "timelineTitle": {"en": "How we grew", "fr": "Notre évolution", "ar": "كيف تطورنا"},
    "steps": [
      {"title": {"en": "A family-rooted beginning", "fr": "Des racines familiales", "ar": "بداية عائلية"}, "body": {"en": "The brand was shaped by Moroccan food culture, family tables, and a respect for traditional quality.", "fr": "La marque s’est construite autour de la culture culinaire marocaine, des tables familiales et du respect de la qualité traditionnelle.", "ar": "تشكّلت العلامة من ثقافة الطعام المغربية، والموائد العائلية، والاحترام للجودة التقليدية."}},
      {"title": {"en": "Built around trust", "fr": "Une base de confiance", "ar": "مبني على الثقة"}, "body": {"en": "We focus on reliable sourcing, clear product information, and a smooth shopping experience.", "fr": "Nous mettons l’accent sur un sourcing fiable, des informations claires et une expérience d’achat fluide.", "ar": "نركز على مصادر موثوقة، ومعلومات واضحة عن المنتج، وتجربة شراء سلسة."}},
      {"title": {"en": "Made for everyday use", "fr": "Pensé pour le quotidien", "ar": "مناسب للاستخدام اليومي"}, "body": {"en": "Our products are chosen to feel natural in kitchens, gift boxes, and shared meals.", "fr": "Nos produits sont choisis pour s’intégrer naturellement dans les cuisines, les coffrets cadeaux et les repas partagés.", "ar": "نختار منتجاتنا لتناسب المطابخ وعلب الهدايا والوجبات المشتركة بشكل طبيعي."}},
      {"title": {"en": "Still growing", "fr": "En constante évolution", "ar": "نواصل النمو"}, "body": {"en": "We keep improving the catalog and customer journey while staying close to our original values.", "fr": "Nous améliorons sans cesse le catalogue et le parcours client tout en restant fidèles à nos valeurs d’origine.", "ar": "نحسن الكتالوج وتجربة العملاء باستمرار مع البقاء قريبين من قيمنا الأصلية."}}
    ],
    "bottomTitle": {"en": "What we stand for", "fr": "Ce que nous défendons", "ar": "ما نمثله"},
    "bottomText": {"en": "Authenticity, transparency, and a warm shopping experience are the core of everything we build.", "fr": "L’authenticité, la transparence et une expérience d’achat chaleureuse sont au cœur de tout ce que nous construisons.", "ar": "الأصالة والشفافية وتجربة تسوق دافئة هي جوهر كل ما نبنيه."},
    "cta": {"en": "Visit the shop", "fr": "Visiter la boutique", "ar": "زيارة المتجر"}
  }$$::jsonb
)
on conflict (id) do update
set propos = excluded.propos,
    our_story = excluded.our_story,
    updated_at = now();

create or replace function public.touch_theme_marketing_pages_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_theme_marketing_pages_updated_at on public.theme_marketing_pages;

create trigger touch_theme_marketing_pages_updated_at
before update on public.theme_marketing_pages
for each row
execute function public.touch_theme_marketing_pages_updated_at();
