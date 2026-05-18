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
    { id: 1, name: "Ken Zer", location: "Verified Customer", rating: 5, text: "I highly recommend them; very good quality products, very fast service, they are the best, keep up the good work ELFITOR 🙏🙏🙏", product: "Olive Oil & Olives" },
    { id: 2, name: "Samira IGUIDER", location: "Verified Customer", rating: 5, text: "I highly recommend them. I congratulate you on your professionalism and the quality of your products—a true delight. Thank you so much.", product: "Premium Selection" },
    { id: 3, name: "Asma Asma", location: "Local Guide", rating: 5, text: "A real treat! Healthy products that take us on a journey through time, an exceptional delight that reminds us of the times of our grandmothers! I highly recommend Elfitor.", product: "Traditional Collection" },
    { id: 4, name: "Amal Jallouli", location: "Verified Customer", rating: 5, text: "Your products are excellent, with wonderful taste, superb quality, and fast delivery. We wish you continued success.", product: "Family Bundle" },
    { id: 5, name: "Reda Elghozlafi", location: "Verified Customer", rating: 5, text: "Natural products of excellent quality, may God bless you. May God grant you success and prosperity.", product: "Organic Range" },
    { id: 6, name: "M EL", location: "Verified Customer", rating: 5, text: "Masha Allah, may Allah bless your products, they are second to none in terms of quality and taste, as well as the good treatment of customers and respect for time in delivering orders.", product: "Full Collection" },
    { id: 7, name: "Myriam Abdennasser", location: "Verified Customer", rating: 5, text: "Very good quality products 👍! A real natural delight and professional service!", product: "Cold Pressed Oil" },
    { id: 8, name: "hamil hanan", location: "Verified Customer", rating: 5, text: "Excellent quality product, mashallah, professional service and a competent team.", product: "Gourmet Set" },
    { id: 9, name: "Khadija Akaou", location: "Verified Customer", rating: 5, text: "The first taste took me back to my childhood when I used to visit my grandmothers; their products are worth trying and using regularly.", product: "Heritage Blend" }
  ],
  fr: [
    { id: 1, name: "Ken Zer", location: "Client vérifié", rating: 5, text: "Je les recommande vivement ; produits de très bonne qualité, service très rapide, ils sont les meilleurs, continuez le bon travail ELFITOR 🙏🙏🙏", product: "Huile & Olives" },
    { id: 2, name: "Samira IGUIDER", location: "Client vérifié", rating: 5, text: "Je les recommande vivement. Je vous félicite pour votre professionnalisme et la qualité de vos produits — un vrai régal. Merci beaucoup.", product: "Sélection Premium" },
    { id: 3, name: "Asma Asma", location: "Guide Local", rating: 5, text: "Un vrai régal ! Des produits sains qui nous font voyager dans le temps, un délice exceptionnel qui nous rappelle l'époque de nos grand-mères ! Je recommande vivement Elfitor.", product: "Collection Traditionnelle" },
    { id: 4, name: "Amal Jallouli", location: "Client vérifié", rating: 5, text: "Vos produits sont excellents, avec un goût merveilleux, une qualité superbe et une livraison rapide. Nous vous souhaitons un succès continu.", product: "Pack Famille" },
    { id: 5, name: "Reda Elghozlafi", location: "Client vérifié", rating: 5, text: "Produits naturels d'excellente qualité, que Dieu vous bénisse. Que Dieu vous accorde succès et prospérité.", product: "Gamme Bio" },
    { id: 6, name: "M EL", location: "Client vérifié", rating: 5, text: "Masha Allah, que Dieu bénisse vos produits, ils sont inégalés en termes de qualité et de goût, ainsi que le bon traitement des clients et le respect des délais de livraison.", product: "Collection Complète" },
    { id: 7, name: "Myriam Abdennasser", location: "Client vérifié", rating: 5, text: "Produits de très bonne qualité 👍 ! Un vrai délice naturel et un service professionnel !", product: "Huile Pressée à Froid" },
    { id: 8, name: "hamil hanan", location: "Client vérifié", rating: 5, text: "Produit d'excellente qualité, mashallah, service professionnel et une équipe compétente.", product: "Set Gourmet" },
    { id: 9, name: "Khadija Akaou", location: "Client vérifié", rating: 5, text: "La première dégustation m'a ramenée à mon enfance quand je rendais visite à mes grand-mères ; leurs produits méritent d'être essayés et utilisés régulièrement.", product: "Mélange Heritage" }
  ],
  ar: [
    { id: 1, name: "Ken Zer", location: "عميل مُحقق", rating: 5, text: "أنصح بهم بشدة؛ منتجات ذات جودة ممتازة، خدمة سريعة جداً، هم الأفضل، استمروا في العمل الرائع ELFITOR 🙏🙏🙏", product: "زيت وزيتون" },
    { id: 2, name: "Samira IGUIDER", location: "عميل مُحقق", rating: 5, text: "أنصح بهم بشدة. أهنئكم على احترافيتكم وجودة منتجاتكم — لذة حقيقية. شكراً جزيلاً.", product: "الselection الممتازة" },
    { id: 3, name: "Asma Asma", location: "دليل محلي", rating: 5, text: "لذة حقيقية! منتجات صحية تأخذنا في رحلة عبر الزمن، متعة استثنائية تذكرنا بزمن جداتنا! أنصح بـ Elfitor بشدة.", product: "المجموعة التقليدية" },
    { id: 4, name: "Amal Jallouli", location: "عميل مُحقق", rating: 5, text: "منتجاتكم ممتازة، ذات طعم رائع وجودة فائقة وتوصيل سريع. نتمنى لكم النجاح المستمر.", product: "باقة العائلة" },
    { id: 5, name: "Reda Elghozlafi", location: "عميل مُحقق", rating: 5, text: "منتجات طبيعية بجودة ممتازة، بارك الله فيكم. وفقكم الله لكل خير وازدهار.", product: "المنتجات العضوية" },
    { id: 6, name: "M EL", location: "عميل مُحقق", rating: 5, text: "ما شاء الله، بارك الله في منتجاتكم، لا مثيل لها في الجودة والطعم، وكذلك حسن معاملة العملاء والتزام المواعيد في التوصيل.", product: "المجموعة الكاملة" },
    { id: 7, name: "Myriam Abdennasser", location: "عميل مُحقق", rating: 5, text: "منتجات ذات جودة ممتازة 👍! لذة طبيعية حقيقية وخدمة احترافية!", product: "زيت معصور على البارد" },
    { id: 8, name: "hamil hanan", location: "عميل مُحقق", rating: 5, text: "منتج بجودة ممتازة، ما شاء الله، خدمة احترافية وفريق كفء.", product: "طقم الذواقة" },
    { id: 9, name: "Khadija Akaou", location: "عميل مُحقق", rating: 5, text: "أول قضمة أعادتني إلى طفولتي حين كنت أزور جداتي؛ منتجاتهم تستحق التجربة والاستخدام المنتظم.", product: "خليط التراث" }
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
