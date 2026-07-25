import type { Locale } from "@/i18n.config"

export type LocalizedText = Record<Locale, string>

export type ThemeSupportSection = {
  title: LocalizedText
  body: LocalizedText
}

export type ThemeSupportFaqItem = {
  q: LocalizedText
  a: LocalizedText
}

export type ThemeShippingBullet = {
  title: LocalizedText
  body: LocalizedText
}

export type ThemeContactPageData = {
  title: LocalizedText
  subtitle: LocalizedText
  intro: LocalizedText
}

export type ThemeFaqPageData = {
  title: LocalizedText
  subtitle: LocalizedText
  items: ThemeSupportFaqItem[]
}

export type ThemeShippingPageData = {
  title: LocalizedText
  subtitle: LocalizedText
  bullets: ThemeShippingBullet[]
}

export type ThemeReturnsPageData = {
  title: LocalizedText
  subtitle: LocalizedText
  points: LocalizedText[]
}

export type ThemeLegalPageData = {
  title: LocalizedText
  subtitle: LocalizedText
  sections: ThemeSupportSection[]
}

export type ThemeSupportPagesData = {
  contact: ThemeContactPageData
  faq: ThemeFaqPageData
  shipping: ThemeShippingPageData
  returns: ThemeReturnsPageData
  privacyPolicy: ThemeLegalPageData
  termsOfService: ThemeLegalPageData
}

function text(en: string, fr: string, ar: string): LocalizedText {
  return { en, fr, ar }
}

export const DEFAULT_THEME_SUPPORT_PAGES: ThemeSupportPagesData = {
  contact: {
    title: text("Contact Us", "Contactez-nous", "اتصل بنا"),
    subtitle: text(
      "Reach out if you need help with an order, product question, or delivery update.",
      "Contactez-nous pour une commande, une question produit ou une mise à jour de livraison.",
      "تواصل معنا إذا كنت بحاجة إلى مساعدة بخصوص طلب أو منتج أو تحديث توصيل."
    ),
    intro: text(
      "We are available by WhatsApp and through the contact form below.",
      "Nous sommes disponibles via WhatsApp et via le formulaire ci-dessous.",
      "نحن متاحون عبر واتس آب ومن خلال نموذج التواصل أدناه."
    ),
  },
  faq: {
    title: text("Frequently Asked Questions (FAQ)", "Foire Aux Questions (FAQ)", "الاسئلة الشائعة"),
    subtitle: text(
      "Quick answers to the most common questions about our products, delivery, and shipping.",
      "Réponses rapides aux questions les plus fréquentes sur nos produits, la livraison et l'expédition.",
      "إجابات سريعة على أكثر الأسئلة شيوعاً حول منتجاتنا والتوصيل والشحن."
    ),
    items: [
      {
        q: text("Are your products 100% natural?", "Vos produits sont-ils 100 % naturels ?", "هل منتجاتكم طبيعية 100%؟"),
        a: text(
          "Yes, all our products are prepared using only salt and healthy, natural, traditional methods without soda, preservatives, or chemical additives.",
          "Oui, tous nos produits sont préparés uniquement avec du sel et selon des méthodes traditionnelles, naturelles et saines, sans soude, sans conservateurs ni additifs chimiques.",
          "نعم، جميع منتجاتنا محضرة فقط بالملح و بطرق تقليدية وطبيعية صحية بدون صودا او أي مواد حافظة أو مضافات كيميائية."
        ),
      },
      {
        q: text(
          "How is product quality maintained during delivery?",
          "Comment la qualité des produits est-elle préservée pendant la livraison ?",
          "كيف يتم الحفاظ على جودة المنتجات أثناء التوصيل؟"
        ),
        a: text(
          "We place great importance on packaging our products securely and safely to ensure they reach you with the same high quality as when they were made, wherever you are in Morocco.",
          "Nous accordons une grande importance à l'emballage de nos produits, garantissant qu'ils soient scellés et sécurisés pour vous parvenir avec la même qualité qu'à leur fabrication, où que vous soyez au Maroc.",
          "نولي أهمية كبيرة لتغليف منتجاتنا بطريقة محكمة وآمنة تضمن وصولها إليكم بنفس الجودة التي صُنعت بها، أينما كنتم في المغرب."
        ),
      },
      {
        q: text("How long does shipping and delivery take?", "Combien de temps prennent l'expédition et la livraison ?", "كم يستغرق الشحن والوصول؟"),
        a: text(
          "Orders within major cities are delivered within 24 to 48 hours, and to the rest of Moroccan cities within 2 to 4 business days.",
          "Les commandes sont livrées dans les grandes villes sous 24 à 48 heures, et dans le reste des villes marocaines sous 2 à 4 jours ouvrables.",
          "يتم توصيل الطلبيات داخل المدن الرئيسية خلال 24 إلى 48 ساعة، وباقي المدن المغربية خلال 2 إلى 4 أيام عمل."
        ),
      },
      {
        q: text("Do you offer free shipping?", "Proposez-vous la livraison gratuite ?", "هل يوجد شحن مجاني؟"),
        a: text(
          "Yes! We regularly offer free shipping deals and special discounts. Available options and offers will appear automatically during checkout.",
          "Oui ! Nous proposons régulièrement des offres de livraison gratuite et des promotions spéciales. Les options et offres disponibles s'affichent automatiquement lors de la validation de votre commande.",
          "نعم! نقدم عروض شحن مجاني وتخفيضات مميزة بشكل دوري، وتظهر لك الخيارات والعروض المتاحة تلقائياً أثناء إتمام طلبك."
        ),
      },
    ],
  },
  shipping: {
    title: text("Shipping & Delivery Policy", "Politique d'Expédition et de Livraison", "سياسة الشحن و التوصيل"),
    subtitle: text(
      "Delivery times, packaging, tracking, and shipping costs.",
      "Délais de livraison, emballage, suivi et frais de livraison.",
      "مدة التوصيل والتغليف والتتبع ومصاريف الشحن."
    ),
    bullets: [
      {
        title: text("Delivery Time", "Délai de livraison", "مدة التوصيل"),
        body: text(
          "We take great care in preparing and packaging your orders professionally. Delivery usually takes between 1 to 3 business days depending on the city and region.",
          "Nous veillons à préparer et emballer vos commandes avec le plus grand soin. La livraison prend généralement entre 1 et 3 jours ouvrables selon la ville et la région.",
          "نحرص على تجهيز طلباتكم وتغليفها بكل عناية واحترافية. يستغرق التوصيل عادة بين 1 إلى 3 أيام عمل حسب المدينة والمنطقة."
        ),
      },
      {
        title: text("Safe & Protected Packaging", "Emballage sécurisé et protégé", "تغليف آمن ومحمي"),
        body: text(
          "All natural and glass products are packed with special shock-resistant wrapping to guarantee they arrive safely and in perfect condition.",
          "Tous les produits naturels et en verre sont emballés avec des protections spéciales contre les chocs, afin de garantir leur arrivée en toute sécurité et avec leur qualité habituelle.",
          "تُغلف جميع المنتجات الطبيعية والزجاجية بأغطية وحماية خاصة ضد الصدمات، لضمان وصولها إليكم بنفس جودتها المعهودة وبأمان تام."
        ),
      },
      {
        title: text("Order Tracking", "Suivi de la commande", "تتبع الطلبية"),
        body: text(
          "Once your order is dispatched with the delivery company, the courier will contact you by phone to arrange the most convenient time and location to receive your shipment.",
          "Dès l'expédition de votre commande avec la société de livraison, le livreur vous contacte par téléphone pour convenir de l'heure et du lieu qui vous conviennent pour réceptionner le colis.",
          "فور إرسال طلبيتك مع شركة التوصيل، يتواصل معكم الموزع هاتفياً لتحديد الوقت والمكان الأنسب لكم لتسلم الشحنة."
        ),
      },
      {
        title: text("Covered Cities & Regions", "Villes et zones desservies", "المدن والمناطق المشمولة"),
        body: text(
          "We ship our products to most Moroccan cities and regions via approved delivery partners. At checkout, you will find a list of available cities to select yours easily. If you do not find your city on the list, feel free to contact us via WhatsApp to check delivery availability or arrange a suitable solution.",
          "Nous livrons dans la plupart des villes et régions du Maroc via des sociétés de livraison agréées. Lors de la validation de votre commande, vous trouverez la liste des villes disponibles pour sélectionner facilement la vôtre. Si vous ne trouvez pas votre ville dans la liste, vous pouvez nous contacter via WhatsApp pour vérifier la possibilité de livraison ou trouver une solution adaptée.",
          "نشحن منتجاتنا لمعظم المدن والجهات المغربية عبر شركات التوصيل المعتمدة. عند إتمام طلبكم، ستجدون قائمة المدن المتاحة للتوصيل لتعيين مدينتكم بسهولة. في حال لم تجدوا مدينتكم ضمن القائمة، يمكنكم التواصل معنا عبر الواتساب للتحقق من إمكانية التوصيل أو ترتيب حل مناسب."
        ),
      },
      {
        title: text("Shipping Costs", "Frais de livraison", "مصاريف الشحن"),
        body: text(
          "Shipping fees are calculated at checkout based on the city. Free shipping promotions apply periodically according to active store offers at the time of order.",
          "Les frais de livraison sont calculés sur la page de paiement (Checkout) en fonction de la ville, et les offres de livraison gratuite s'appliquent périodiquement selon les promotions disponibles sur la boutique au moment de la commande.",
          "يتم احتساب مصاريف الشحن عند صفحة الإتمام (Checkout) بحسب المدينة، وتطبق عروض الشحن المجاني دورياً بحسب العروض المتاحة على المتجر وقت الطلب."
        ),
      },
    ],
  },
  returns: {
    title: text("Return & Exchange Policy", "Politique de Retour et de Remboursement", "سياسة الإرجاع و الاستبدال"),
    subtitle: text(
      "We are committed to delivering high-quality natural products. Returns and exchanges are subject to the following conditions.",
      "Nous nous engageons à fournir des produits naturels de haute qualité. Le retour et l'échange sont soumis aux conditions suivantes.",
      "نحن نلتزم بتقديم منتجات طبيعية عالية الجودة. تخضع عملية الإرجاع والاستبدال للشروط التالية."
    ),
    points: [
      text(
        "Eligible for return or exchange: if you receive a damaged product (broken or with a clear defect), or an incorrect product completely different from what you ordered.",
        "Cas acceptés pour le retour ou l'échange : si vous recevez un produit endommagé (cassé ou présentant un défaut évident), ou un produit incorrect ou totalement différent de celui commandé.",
        "الحالات المقبولة للإرجاع أو الاستبدال: إذا وصلك منتج متضرر (مكسور أو فيه عيب واضح)، أو إذا وصلك منتج خاطئ أو مغاير تماماً للمنتج الذي قمت بطلبه."
      ),
      text(
        "Required conditions: you must contact us immediately upon receiving the order and provide clear photos and video showing the damage or error. The product must be in its original packaging and unused.",
        "Conditions requises : vous devez nous contacter dès la réception de la commande et nous fournir des photos et une vidéo claires montrant le dommage ou l'erreur. Le produit doit être dans son emballage d'origine et ne pas avoir été utilisé.",
        "الشروط الواجب توفرها: يجب التواصل معنا فور استلام الطلب وتزويدنا بصور وفيديو واضحين يظهران الضرر أو الخطأ الحاصل في المنتج، ويجب أن يكون المنتج في غلافه الأصلي ولم يتم استخدامه."
      ),
      text(
        "Ineligible cases: returns or exchanges are not accepted simply due to a change of mind after receiving a correct product in good condition.",
        "Cas non acceptés : le retour ou l'échange n'est pas accepté simplement en cas de changement d'avis après réception d'un produit conforme et en bon état.",
        "الحالات غير المقبولة: لا يُقبل الإرجاع أو الاستبدال لمجرد تغيير الرأي بعد استلام المنتج وهو في حالة سليمة ومطابق للطلب."
      ),
      text(
        "Compensation method: after verifying the photos and confirming the damage, we commit to resending a new replacement product or refunding you directly, covering all additional shipping costs.",
        "Mode de compensation : après vérification des photos et confirmation du dommage, nous nous engageons à vous renvoyer un produit neuf de remplacement ou à vous rembourser directement, en prenant en charge tous les frais d'expédition supplémentaires.",
        "طريقة التعويض: بعد التحقق من الصور وإثبات الضرر، نلتزم بإعادة إرسال منتج جديد بديل لك أو تعويضك مباشرة، وتحمل كافة مصاريف الشحن الإضافية."
      ),
    ],
  },
  privacyPolicy: {
    title: text("Privacy Policy", "Politique de Confidentialité", "سياسة الخصوصية"),
    subtitle: text(
      "We place the highest priority on protecting your privacy and personal data.",
      "Nous accordons une importance capitale à la protection de votre vie privée et de vos données personnelles.",
      "نحن نولي أهمية قصوى لحماية خصوصيتك وبياناتك الشخصية."
    ),
    sections: [
      {
        title: text("Data We Collect", "Données collectées", "البيانات التي نجمعها"),
        body: text(
          "We only collect information necessary to process and deliver your order (such as: full name, phone number, and delivery address).",
          "Nous ne collectons que les informations nécessaires au traitement et à la livraison de votre commande (telles que : nom complet, numéro de téléphone et adresse de livraison).",
          "نجمع فقط المعلومات الضرورية لمعالجة طلبك وتوصيله (مثل: الاسم الكامل، رقم الهاتف، وعنوان التوصيل)."
        ),
      },
      {
        title: text("How We Use Your Information", "Utilisation de vos informations", "كيف نستخدم معلوماتك؟"),
        body: text(
          "We use your data solely for shipping orders, communicating regarding your purchase, or providing customer support.",
          "Nous utilisons vos données uniquement pour l'expédition des commandes, la communication concernant votre achat ou le service client.",
          "نستخدم بياناتك فقط لأغراض شحن الطلبيات، التواصل معك بخصوص طلبيتك، أو تقديم دعم العملاء."
        ),
      },
      {
        title: text("Data Protection", "Protection des données", "حماية البيانات"),
        body: text(
          "We commit never to share, sell, or leak your personal data to any external third party under any circumstances.",
          "Nous nous engageons à ne pas partager, vendre ou divulguer vos données personnelles à des tiers externes, sous aucun prétexte.",
          "نلتزم بعدم مشاركة، بيع، أو تسريب بياناتك الشخصية لأي طرف ثالث خارجي تحت أي ظرف."
        ),
      },
    ],
  },
  termsOfService: {
    title: text("Terms & Conditions", "Conditions Générales d'Utilisation", "الشروط و الاحكام"),
    subtitle: text(
      "Welcome to our store. By using this website or purchasing from it, you agree to comply with the following terms and conditions.",
      "Bienvenue sur notre boutique. En utilisant ce site ou en y effectuant un achat, vous acceptez de vous conformer aux conditions suivantes.",
      "مرحباً بكم في متجرنا. باستخدامك لهذا الموقع أو الشراء منه، فإنك توافق على الالتزام بالشروط والأحكام التالية."
    ),
    sections: [
      {
        title: text("Orders & Pricing", "Commandes et prix", "الطلبات والأسعار"),
        body: text(
          "All prices shown on the website are in Moroccan Dirhams (MAD). We reserve the right to modify prices or offers at any time without prior notice.",
          "Tous les prix indiqués sur le site sont en dirhams marocains (MAD). Nous nous réservons le droit de modifier les prix ou les offres à tout moment et sans préavis.",
          "جميع الأسعار الموضحة على الموقع بالدرهم المغربي (MAD). نحتفظ بالحق في تعديل الأسعار أو العروض في أي وقت دون إشعار مسبق."
        ),
      },
      {
        title: text("Order Confirmation", "Confirmation de la commande", "تأكيد الطلب"),
        body: text(
          "An order is considered confirmed after our team contacts you via phone or WhatsApp.",
          "La commande est considérée comme confirmée après la prise de contact de notre équipe avec vous par téléphone ou via WhatsApp.",
          "يعتبر الطلب مؤكداً بعد تواصل فريقنا معك عبر الهاتف أو الواتساب."
        ),
      },
      {
        title: text("Intellectual Property", "Propriété intellectuelle", "الملكية الفكرية"),
        body: text(
          "All images, texts, and logos on the website are the exclusive property of our brand and may not be copied or used without prior written permission.",
          "Toutes les images, textes et logos présents sur le site sont la propriété exclusive de notre marque et ne peuvent être copiés ou utilisés sans autorisation écrite préalable.",
          "جميع الصور، النصوص، والشعارات الموجودة على الموقع هي ملك حصري لعلامتنا التجارية ولا يجوز نسخها أو استخدامها بدون إذن كتابي."
        ),
      },
    ],
  },
}

export function fetchThemeSupportPages() {
  return fetch("/api/theme-support-pages", { cache: "no-store" }).then(async (response) => {
    if (!response.ok) return DEFAULT_THEME_SUPPORT_PAGES
    return (await response.json()) as ThemeSupportPagesData
  })
}