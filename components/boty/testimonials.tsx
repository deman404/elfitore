"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const testimonials: Record<Locale, Array<{
  id: number
  name: string
  location: string
  rating: number
  text: string
  product: string
}>> = {
  en: [
    { id: 1, name: "Nadia El A.", location: "Casablanca, Morocco", rating: 5, text: "The flavor is so fresh and balanced. This olive oil makes every salad, tagine, and finishing drizzle taste better.", product: "Extra Virgin Olive Oil" },
    { id: 2, name: "Youssef B.", location: "Marrakech, Morocco", rating: 5, text: "You can taste the grove in every drop. It is smooth, peppery, and perfect with warm bread and olive tapenade.", product: "Olive Oil Reserve" },
    { id: 3, name: "Fatima Z.", location: "Rabat, Morocco", rating: 5, text: "We use it every day at home. It feels authentic, wholesome, and deeply connected to Moroccan cooking.", product: "Family Blend" },
    { id: 4, name: "Hassan R.", location: "Fes, Morocco", rating: 5, text: "The aroma is beautiful and natural. It reminds me of traditional meals, olive groves, and slow cooking.", product: "Moroccan Harvest" },
    { id: 5, name: "Leila S.", location: "Tangier, Morocco", rating: 5, text: "The bottle looks elegant, but the real magic is inside. It is the olive oil I reach for first now.", product: "Daily Kitchen Oil" },
    { id: 6, name: "Omar T.", location: "Agadir, Morocco", rating: 5, text: "Great for bread, grilled fish, and finishing dishes. Clean taste, rich body, and very refined.", product: "Chef Selection" },
    { id: 7, name: "Salma K.", location: "Tetouan, Morocco", rating: 5, text: "This feels like a true Moroccan pantry essential. The taste is bright, smooth, and beautifully layered.", product: "Pure Press" },
    { id: 8, name: "Karim E.", location: "Chefchaouen, Morocco", rating: 5, text: "From the first drizzle, you know it is special. It brings warmth and character to every dish.", product: "Olive Grove Blend" },
    { id: 9, name: "Meryem N.", location: "Essaouira, Morocco", rating: 5, text: "Pure, fragrant, and versatile. It tastes like sunshine, soil, and the spirit of Morocco.", product: "Sun-Kissed Olive Oil" }
  ],
  fr: [
    { id: 1, name: "Nadia El A.", location: "Casablanca, Maroc", rating: 5, text: "La saveur est fraîche et équilibrée. Cette huile d’olive rend chaque salade, tajine et filet de finition encore meilleur.", product: "Huile d’olive vierge extra" },
    { id: 2, name: "Youssef B.", location: "Marrakech, Maroc", rating: 5, text: "On sent le verger dans chaque goutte. Elle est douce, légèrement poivrée, et parfaite avec du pain chaud et de la tapenade.", product: "Réserve d’huile d’olive" },
    { id: 3, name: "Fatima Z.", location: "Rabat, Maroc", rating: 5, text: "Nous l’utilisons tous les jours à la maison. Elle paraît authentique, saine et profondément liée à la cuisine marocaine.", product: "Mélange familial" },
    { id: 4, name: "Hassan R.", location: "Fès, Maroc", rating: 5, text: "L’arôme est beau et naturel. Il me rappelle les repas traditionnels, les oliveraies et la cuisine lente.", product: "Récolte marocaine" },
    { id: 5, name: "Leila S.", location: "Tanger, Maroc", rating: 5, text: "La bouteille est élégante, mais la vraie magie est à l’intérieur. C’est maintenant l’huile que je choisis en premier.", product: "Huile du quotidien" },
    { id: 6, name: "Omar T.", location: "Agadir, Maroc", rating: 5, text: "Parfaite pour le pain, le poisson grillé et les plats de finition. Goût net, texture riche et très raffinée.", product: "Sélection du chef" },
    { id: 7, name: "Salma K.", location: "Tétouan, Maroc", rating: 5, text: "On dirait un indispensable du garde-manger marocain. Le goût est vif, doux et magnifiquement structuré.", product: "Pressée pure" },
    { id: 8, name: "Karim E.", location: "Chefchaouen, Maroc", rating: 5, text: "Dès la première goutte, on comprend que c’est spécial. Elle apporte chaleur et caractère à chaque plat.", product: "Mélange des oliveraies" },
    { id: 9, name: "Meryem N.", location: "Essaouira, Maroc", rating: 5, text: "Pure, parfumée et polyvalente. Elle a le goût du soleil, de la terre et de l’esprit du Maroc.", product: "Huile solaire" }
  ],
  ar: [
    { id: 1, name: "نادية أ.", location: "الدار البيضاء، المغرب", rating: 5, text: "النكهة منعشة ومتوازنة جدًا. تجعل هذه الزيتون كل سلطة وطاجين ورشة نهائية أطيب.", product: "زيت الزيتون البكر الممتاز" },
    { id: 2, name: "يوسف ب.", location: "مراكش، المغرب", rating: 5, text: "يمكنك تذوق البستان في كل قطرة. إنها ناعمة مع لمسة فلفلية، ومثالية مع الخبز الدافئ وطريقة الزيتون.", product: "خلاصة زيت الزيتون" },
    { id: 3, name: "فاطمة ز.", location: "الرباط، المغرب", rating: 5, text: "نستخدمها كل يوم في المنزل. تبدو أصيلة ومغذية ومرتبطة بعمق بالمطبخ المغربي.", product: "الخليط العائلي" },
    { id: 4, name: "حسن ر.", location: "فاس، المغرب", rating: 5, text: "الرائحة جميلة وطبيعية. تذكرني بالوجبات التقليدية وبساتين الزيتون والطهي البطيء.", product: "حصاد مغربي" },
    { id: 5, name: "ليلى س.", location: "طنجة، المغرب", rating: 5, text: "الزجاجة أنيقة، لكن السحر الحقيقي بداخلها. أصبحت الزيت التي أختارها أولًا الآن.", product: "زيت المطبخ اليومي" },
    { id: 6, name: "عمر ت.", location: "أكادير، المغرب", rating: 5, text: "رائعة مع الخبز والسمك المشوي والأطباق النهائية. طعم نظيف وجسم غني وأنيق جدًا.", product: "اختيار الشيف" },
    { id: 7, name: "سلمى ك.", location: "تطوان، المغرب", rating: 5, text: "تشعر أنها من أساسيات المخزن المغربي الحقيقي. الطعم لامع وناعم ومتعدد الطبقات.", product: "عصر نقي" },
    { id: 8, name: "كريم ا.", location: "شفشاون، المغرب", rating: 5, text: "من أول رشة تعرف أنها مميزة. تضيف دفئًا وشخصية لكل طبق.", product: "خليط بساتين الزيتون" },
    { id: 9, name: "مريم ن.", location: "الصويرة، المغرب", rating: 5, text: "نقية وعطرية ومتعددة الاستخدامات. مذاقها كالشمس والتربة وروح المغرب.", product: "زيت مشمس" }
  ]
}

type Testimonial = (typeof testimonials)[Locale][number]

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <div className="mb-4 flex-shrink-0 rounded-3xl bg-white p-5 sm:p-6"
    style={{
      boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"
    }}
  >
    {/* Stars */}
    <div className="mb-4 flex items-center gap-1 text-primary">
      {Array.from({ length: testimonial.rating }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>

    {/* Quote */}
    <p className="mb-4 font-serif text-lg font-medium tracking-wide text-foreground/80 text-pretty leading-relaxed sm:text-xl">
      &ldquo;{testimonial.text}&rdquo;
    </p>

    {/* Author */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-foreground text-sm font-bold">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
      </div>
      <span className="text-xs tracking-wide text-primary/70 bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
        {testimonial.product}
      </span>
    </div>
  </div>
)

export function Testimonials() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const { locale } = useLanguage()
  const items = testimonials[locale as Locale]
  
  const column1 = [items[0], items[3], items[6]]
  const column2 = [items[1], items[4], items[7]]
  const column3 = [items[2], items[5], items[8]]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="overflow-hidden bg-background py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="mb-12 text-center sm:mb-16">
          <span className={`mb-4 block text-xs uppercase tracking-[0.3em] text-primary sm:text-sm ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            {locale === 'fr' ? 'Voix marocaines' : locale === 'ar' ? 'أصوات مغربية' : 'Moroccan Voices'}
          </span>
          <h2 className={`text-balance font-serif text-3xl leading-tight text-foreground sm:text-4xl md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            {locale === 'fr' ? 'Apprécié par des milliers' : locale === 'ar' ? 'محبوب لدى الآلاف' : 'Loved by thousands'}
          </h2>
          <p className={`mt-4 text-sm text-muted-foreground sm:text-base ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
            {locale === 'fr'
              ? 'Des histoires venues des cuisines, des tables et des oliveraies du Maroc.'
              : locale === 'ar'
                ? 'قصص من المطابخ والموائد وبساتين الزيتون في مختلف أنحاء المغرب.'
                : 'Stories from kitchens, tables, and olive groves across Morocco.'}
          </p>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          
          {/* Mobile - Single Column */}
          <div className="md:hidden h-[540px]">
            <div className="relative overflow-hidden h-full">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...items, ...items].map((testimonial, index) => (
                  <TestimonialCard key={`mobile-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop - Three Columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 h-[600px]">
            {/* Column 1 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column1, ...column1].map((testimonial, index) => (
                  <TestimonialCard key={`col1-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 2 - Scrolling Up */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-up hover:animate-scroll-up-slow">
                {[...column2, ...column2].map((testimonial, index) => (
                  <TestimonialCard key={`col2-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 3 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column3, ...column3].map((testimonial, index) => (
                  <TestimonialCard key={`col3-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-down {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-up {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-down {
          animation: scroll-down 30s linear infinite;
        }

        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }

        .animate-scroll-down-slow {
          animation: scroll-down 60s linear infinite;
        }

        .animate-scroll-up-slow {
          animation: scroll-up 60s linear infinite;
        }
      `}</style>
    </section>
  )
}
