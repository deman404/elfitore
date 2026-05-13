export const DEFAULT_WHATSAPP_NUMBER = ""

export interface OrderDetails {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  deliveryMethod?: string
  deliveryCity?: string
  shipping?: number
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
}

export function generateWhatsAppMessage(order: OrderDetails, locale: 'en' | 'fr' | 'ar'): string {
  const deliverySection = order.deliveryMethod
    ? `\n\n*Delivery:*\nMethod: ${order.deliveryMethod}${order.deliveryCity ? `\nCity: ${order.deliveryCity}` : ""}${typeof order.shipping === "number" ? `\nShipping: DH ${order.shipping.toFixed(2)}` : ""}`
    : ""

  const messages = {
    en: `Hello! I would like to place an order with El Fitore:\n\n*Customer Details:*\nName: ${order.fullName}\nEmail: ${order.email}\nPhone: ${order.phone}\nAddress: ${order.address}, ${order.city}, ${order.country}${deliverySection}\n\n*Order Items:*\n${order.items.map(item => `• ${item.name} x${item.quantity} = DH ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n*Order Total: DH ${order.total.toFixed(2)}*\n\nPlease confirm this order. Thank you!`,
    
    fr: `Bonjour! Je voudrais passer une commande chez El Fitore:\n\n*Détails du client:*\nNom: ${order.fullName}\nE-mail: ${order.email}\nTéléphone: ${order.phone}\nAdresse: ${order.address}, ${order.city}, ${order.country}${deliverySection}\n\n*Articles de la commande:*\n${order.items.map(item => `• ${item.name} x${item.quantity} = DH ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n*Total de la commande: DH ${order.total.toFixed(2)}*\n\nVeuillez confirmer cette commande. Merci!`,
    
    ar: `مرحبا! أود تقديم طلب لدى الفيتوري:\n\n*تفاصيل العميل:*\nالاسم: ${order.fullName}\nالبريد الإلكتروني: ${order.email}\nالهاتف: ${order.phone}\nالعنوان: ${order.address}, ${order.city}, ${order.country}${deliverySection}\n\n*عناصر الطلب:*\n${order.items.map(item => `• ${item.name} x${item.quantity} = DH ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n*إجمالي الطلب: DH ${order.total.toFixed(2)}*\n\nيرجى تأكيد هذا الطلب. شكرا لك!`
  }

  return messages[locale]
}

export function formatWhatsAppNumberForLink(number: string): string {
  return number.replace(/[^\d]/g, "")
}

export function getWhatsAppChatUrl(number = DEFAULT_WHATSAPP_NUMBER): string {
  return `https://wa.me/${formatWhatsAppNumberForLink(number)}`
}

export function getWhatsAppMessageUrl(message: string, number = DEFAULT_WHATSAPP_NUMBER): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formatWhatsAppNumberForLink(number)}?text=${encodedMessage}`
}

export function openWhatsAppMessage(message: string, number = DEFAULT_WHATSAPP_NUMBER) {
  if (typeof window === "undefined") {
    return null
  }

  const whatsappUrl = getWhatsAppMessageUrl(message, number)
  const popup = window.open(whatsappUrl, "_blank", "noopener,noreferrer")

  if (!popup) {
    window.location.href = whatsappUrl
  }

  return popup
}
