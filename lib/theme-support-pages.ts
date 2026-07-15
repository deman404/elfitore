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
  bullets: LocalizedText[]
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
    title: text("FAQ", "FAQ", "الأسئلة الشائعة"),
    subtitle: text(
      "Quick answers to the most common questions about orders, payment, and delivery.",
      "Réponses rapides aux questions les plus fréquentes sur les commandes, le paiement et la livraison.",
      "إجابات سريعة على أكثر الأسئلة شيوعًا حول الطلبات والدفع والتوصيل."
    ),
    items: [
      {
        q: text("How do I place an order?", "Comment passer une commande ?", "كيف أقدم طلبًا؟"),
        a: text(
          "Add products to your cart, choose checkout or WhatsApp, then complete your contact details and delivery choice.",
          "Ajoutez les produits au panier, choisissez le paiement ou WhatsApp, puis complétez vos coordonnées et la livraison.",
          "أضف المنتجات إلى السلة، ثم اختر الدفع أو واتس آب وأكمل بياناتك وخيار التوصيل."
        ),
      },
      {
        q: text("Can I pay on delivery?", "Puis-je payer à la livraison ?", "هل يمكنني الدفع عند الاستلام؟"),
        a: text(
          "Yes. Cash on delivery is available for supported delivery areas.",
          "Oui. Le paiement à la livraison est disponible pour les zones compatibles.",
          "نعم، الدفع عند الاستلام متاح للمناطق المدعومة."
        ),
      },
      {
        q: text("Do you ship across Morocco?", "Livrez-vous partout au Maroc ?", "هل تشحنون داخل المغرب؟"),
        a: text(
          "We ship to the Moroccan cities and zones listed in the delivery settings, and admins can add more destinations anytime.",
          "Nous livrons dans les villes et zones définies dans les paramètres de livraison, et l’admin peut en ajouter d’autres à tout moment.",
          "نحن نشحن إلى المدن والمناطق المحددة في إعدادات التوصيل، ويمكن للمشرف إضافة وجهات جديدة في أي وقت."
        ),
      },
      {
        q: text("How long does delivery take?", "Combien de temps prend la livraison ?", "كم يستغرق التوصيل؟"),
        a: text(
          "Delivery time depends on the city and carrier. Your order will show the shipping price during checkout.",
          "Le délai dépend de la ville et du transporteur. Le prix de livraison apparaît au paiement.",
          "يعتمد الوقت على المدينة وشركة الشحن. يظهر سعر الشحن عند إتمام الطلب."
        ),
      },
      {
        q: text(
          "Can I change my order after placing it?",
          "Puis-je modifier ma commande après l’avoir passée ?",
          "هل يمكنني تعديل الطلب بعد إرساله؟"
        ),
        a: text(
          "Contact us as soon as possible on WhatsApp so we can help update the order before it is processed.",
          "Contactez-nous au plus vite sur WhatsApp afin que nous puissions vous aider avant le traitement.",
          "تواصل معنا بسرعة عبر واتس آب وسنحاول تحديث الطلب قبل معالجته."
        ),
      },
    ],
  },
  shipping: {
    title: text("Shipping", "Livraison", "التوصيل"),
    subtitle: text(
      "Delivery pricing, areas, and how shipping works on El Fitore.",
      "Prix de livraison, zones desservies et fonctionnement de la livraison sur El Fitore.",
      "أسعار التوصيل والمناطق وكيفية عمل الشحن في El Fitore."
    ),
    bullets: [
      text(
        "Shipping rates are set by city and delivery company in the admin panel.",
        "Les tarifs sont définis par ville et par transporteur dans le panneau d’administration.",
        "يتم تحديد أسعار الشحن حسب المدينة وشركة التوصيل من لوحة الإدارة."
      ),
      text(
        "Checkout shows the shipping price before you place the order.",
        "Le paiement affiche le prix de livraison avant validation de la commande.",
        "يعرض الدفع سعر الشحن قبل إتمام الطلب."
      ),
      text(
        "Admins can add or update delivery methods and city prices anytime.",
        "Les admins peuvent ajouter ou modifier les méthodes de livraison et les prix à tout moment.",
        "يمكن للمشرف إضافة أو تعديل طرق التوصيل وأسعار المدن في أي وقت."
      ),
      text(
        "Orders placed by WhatsApp or COD are still saved in the admin orders list.",
        "Les commandes passées par WhatsApp ou contre remboursement sont aussi enregistrées dans l’administration.",
        "الطلبات عبر واتس آب أو الدفع عند الاستلام تُحفظ أيضًا في لوحة الإدارة."
      ),
    ],
  },
  returns: {
    title: text("Returns", "Retours", "المرتجعات"),
    subtitle: text(
      "How returns and issue handling work for online orders.",
      "Comment fonctionnent les retours et la gestion des problèmes pour les commandes en ligne.",
      "كيفية التعامل مع المرتجعات والمشاكل في الطلبات عبر الإنترنت."
    ),
    points: [
      text(
        "Contact us quickly if a product arrives damaged or incorrect.",
        "Contactez-nous rapidement si un produit arrive endommagé ou incorrect.",
        "تواصل معنا بسرعة إذا وصل المنتج تالفًا أو غير صحيح."
      ),
      text(
        "We will review the issue and guide you through the next step.",
        "Nous examinerons le problème et vous guiderons pour la suite.",
        "سنراجع المشكلة ونرشدك إلى الخطوة التالية."
      ),
      text(
        "Returns are handled case by case depending on the product and condition.",
        "Les retours sont traités au cas par cas selon le produit et son état.",
        "تُعالج المرتجعات حالةً بحالة حسب المنتج والحالة."
      ),
      text(
        "Please keep the original packaging when possible so we can review it properly.",
        "Conservez si possible l’emballage d’origine pour que nous puissions l’examiner correctement.",
        "يرجى الاحتفاظ بالتغليف الأصلي قدر الإمكان لنتمكن من مراجعته بشكل صحيح."
      ),
    ],
  },
  privacyPolicy: {
    title: text("Privacy Policy", "Politique de confidentialité", "سياسة الخصوصية"),
    subtitle: text(
      "How we collect, use, and protect your information.",
      "Comment nous collectons, utilisons et protégeons vos informations.",
      "كيف نجمع معلوماتك ونستخدمها ونحميها."
    ),
    sections: [
      {
        title: text("Information we collect", "Informations collectées", "المعلومات التي نجمعها"),
        body: text(
          "We may collect details you submit through checkout, WhatsApp orders, contact forms, and admin-managed delivery settings.",
          "Nous pouvons collecter les informations que vous soumettez via le paiement, les commandes WhatsApp, les formulaires de contact et les paramètres de livraison gérés par l’admin.",
          "قد نجمع التفاصيل التي ترسلها عبر الدفع وطلبات واتس آب ونماذج التواصل وإعدادات التوصيل التي يديرها المشرف."
        ),
      },
      {
        title: text("How we use information", "Utilisation des informations", "كيف نستخدم المعلومات"),
        body: text(
          "We use your information to process orders, contact you about delivery, improve the storefront experience, and maintain admin records.",
          "Nous utilisons vos informations pour traiter les commandes, vous contacter au sujet de la livraison, améliorer la boutique et conserver les enregistrements administratifs.",
          "نستخدم معلوماتك لمعالجة الطلبات والتواصل معك بخصوص التوصيل وتحسين تجربة المتجر والحفاظ على السجلات الإدارية."
        ),
      },
      {
        title: text("Sharing and security", "Partage et sécurité", "المشاركة والأمان"),
        body: text(
          "We do not sell personal data. Access is limited to authorized staff, and we take reasonable steps to protect stored information.",
          "Nous ne vendons pas les données personnelles. L’accès est limité au personnel autorisé et nous prenons des mesures raisonnables pour protéger les informations stockées.",
          "نحن لا نبيع البيانات الشخصية. يقتصر الوصول على الموظفين المخولين، ونتخذ خطوات معقولة لحماية المعلومات المخزنة."
        ),
      },
      {
        title: text("Your choices", "Vos choix", "خياراتك"),
        body: text(
          "You can contact us to review or update order details where applicable, and you may choose not to submit optional information.",
          "Vous pouvez nous contacter pour consulter ou mettre à jour les détails de commande lorsque cela est possible, et vous pouvez choisir de ne pas fournir les informations facultatives.",
          "يمكنك التواصل معنا لمراجعة أو تحديث تفاصيل الطلب حيثما ينطبق ذلك، ويمكنك اختيار عدم إرسال المعلومات الاختيارية."
        ),
      },
    ],
  },
  termsOfService: {
    title: text("Terms of Service", "Conditions d’utilisation", "شروط الخدمة"),
    subtitle: text(
      "The basic rules for using our site and placing orders.",
      "Les règles de base pour utiliser notre site et passer commande.",
      "القواعد الأساسية لاستخدام الموقع وإرسال الطلبات."
    ),
    sections: [
      {
        title: text("Using the site", "Utilisation du site", "استخدام الموقع"),
        body: text(
          "Please use the website lawfully and do not attempt to disrupt, scrape, or misuse the service or its content.",
          "Veuillez utiliser le site de manière légale et ne pas tenter de perturber, copier ou détourner le service ou son contenu.",
          "يرجى استخدام الموقع بشكل قانوني وعدم محاولة تعطيل الخدمة أو نسخها أو إساءة استخدامها أو إساءة استخدام محتواها."
        ),
      },
      {
        title: text("Orders and availability", "Commandes et disponibilité", "الطلبات والتوفر"),
        body: text(
          "Orders are accepted subject to product availability, delivery area coverage, and confirmation of order details.",
          "Les commandes sont acceptées sous réserve de disponibilité des produits, de la zone de livraison et de la confirmation des détails.",
          "تُقبل الطلبات حسب توفر المنتجات وتغطية منطقة التوصيل وتأكيد تفاصيل الطلب."
        ),
      },
      {
        title: text("Pricing and delivery", "Prix et livraison", "الأسعار والتوصيل"),
        body: text(
          "Prices, shipping rates, and delivery options may change. The checkout page shows the current total before you submit an order.",
          "Les prix, tarifs de livraison et options peuvent changer. La page de paiement affiche le total actuel avant validation.",
          "قد تتغير الأسعار ورسوم الشحن وخيارات التوصيل. تعرض صفحة الدفع الإجمالي الحالي قبل إرسال الطلب."
        ),
      },
      {
        title: text("Limitations and contact", "Limites et contact", "القيود والتواصل"),
        body: text(
          "We do our best to provide accurate information, but errors can happen. Contact us if you need help resolving an issue.",
          "Nous faisons de notre mieux pour fournir des informations exactes, mais des erreurs peuvent survenir. Contactez-nous en cas de besoin.",
          "نبذل قصارى جهدنا لتقديم معلومات دقيقة، لكن قد تحدث أخطاء. تواصل معنا إذا كنت بحاجة إلى المساعدة."
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
