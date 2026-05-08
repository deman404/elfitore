export const WHATSAPP_NUMBER = '+212XXXXXXXXX' // Placeholder - user to update

export interface OrderDetails {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  total: number
}

export function generateWhatsAppMessage(order: OrderDetails, locale: 'en' | 'fr' | 'ar'): string {
  const messages = {
    en: `Hello! I would like to place an order with El Fitore:\n\n*Customer Details:*\nName: ${order.fullName}\nEmail: ${order.email}\nPhone: ${order.phone}\nAddress: ${order.address}, ${order.city}, ${order.country}\n\n*Order Items:*\n${order.items.map(item => `• ${item.name} x${item.quantity} = DH ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n*Order Total: DH ${order.total.toFixed(2)}*\n\nPlease confirm this order. Thank you!`,
    
    fr: `Bonjour! Je voudrais passer une commande chez El Fitore:\n\n*Détails du client:*\nNom: ${order.fullName}\nE-mail: ${order.email}\nTéléphone: ${order.phone}\nAdresse: ${order.address}, ${order.city}, ${order.country}\n\n*Articles de la commande:*\n${order.items.map(item => `• ${item.name} x${item.quantity} = DH ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n*Total de la commande: DH ${order.total.toFixed(2)}*\n\nVeuillez confirmer cette commande. Merci!`,
    
    ar: `مرحبا! أود تقديم طلب لدى الفيتوري:\n\n*تفاصيل العميل:*\nالاسم: ${order.fullName}\nالبريد الإلكتروني: ${order.email}\nالهاتف: ${order.phone}\nالعنوان: ${order.address}, ${order.city}, ${order.country}\n\n*عناصر الطلب:*\n${order.items.map(item => `• ${item.name} x${item.quantity} = DH ${(item.price * item.quantity).toFixed(2)}`).join('\n')}\n\n*إجمالي الطلب: DH ${order.total.toFixed(2)}*\n\nيرجى تأكيد هذا الطلب. شكرا لك!`
  }

  return messages[locale]
}

export function getWhatsAppChatUrl(): string {
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, '')}`
}

export function getWhatsAppMessageUrl(message: string): string {
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, '')}?text=${encodedMessage}`
}
