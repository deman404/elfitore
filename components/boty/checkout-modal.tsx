'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useCart } from './cart-context'
import { useLanguage } from '@/components/language-context'
import { fetchSiteSettings } from '@/lib/site-settings'
import { generateWhatsAppMessage, getWhatsAppMessageUrl } from '@/lib/whatsapp'
import type { Locale } from '@/i18n.config'

const translations = {
  en: {
    checkout: 'Checkout',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    address: 'Delivery Address',
    city: 'City',
    orderSummary: 'Order Summary',
    shipping: 'Shipping',
    free: 'Calculated at checkout',
    total: 'Total',
    sendViaWhatsApp: 'Send Order via WhatsApp',
    required: 'This field is required',
    successMessage: 'Order placed successfully! We will contact you shortly.',
    orderDetails: 'Order Details',
    processing: 'Processing...'
  },
  fr: {
    checkout: 'Paiement',
    personalInfo: 'Informations personnelles',
    fullName: 'Nom complet',
    email: 'E-mail',
    phone: 'Numéro de téléphone',
    address: 'Adresse de livraison',
    city: 'Ville',
    orderSummary: 'Résumé de la commande',
    shipping: 'Livraison',
    free: 'Calculé au paiement',
    total: 'Total',
    sendViaWhatsApp: 'Envoyer la commande via WhatsApp',
    required: 'Ce champ est obligatoire',
    successMessage: 'Commande passée avec succès! Nous vous contacterons bientôt.',
    orderDetails: 'Détails de la commande',
    processing: 'Traitement...'
  },
  ar: {
    checkout: 'الدفع',
    personalInfo: 'المعلومات الشخصية',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    address: 'عنوان التوصيل',
    city: 'المدينة',
    orderSummary: 'ملخص الطلب',
    shipping: 'التوصيل',
    free: 'يُحسب عند الدفع',
    total: 'الإجمالي',
    sendViaWhatsApp: 'إرسال الطلب عبر واتس آب',
    required: 'هذا الحقل مطلوب',
    successMessage: 'تم تقديم الطلب بنجاح! سنتصل بك قريبًا.',
    orderDetails: 'تفاصيل الطلب',
    processing: 'جارٍ المعالجة...'
  }
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { locale } = useLanguage()
  const { items, subtotal, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [deliveryCities, setDeliveryCities] = useState<Array<{ city: string; price: number }>>([])
  const t = translations[locale as Locale]

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchSiteSettings()
      setWhatsappNumber(settings.whatsappNumber ?? '')
      const activeDeliveryMethod = settings.deliveryMethods?.find((method) => method.active) ?? null
      setDeliveryCities(activeDeliveryMethod?.rates ?? [])
    }

    void loadSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName) newErrors.fullName = t.required
    if (!formData.email) newErrors.email = t.required
    if (!formData.phone) newErrors.phone = t.required
    if (!formData.address) newErrors.address = t.required
    if (!formData.city) newErrors.city = t.required

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    const orderItems = items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price
    }))

    if (!whatsappNumber) {
      setIsSubmitting(false)
      alert('WhatsApp is not configured yet.')
      return
    }

    const orderDetails = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      country: '',
      items: orderItems,
      total: subtotal
    }

    const message = generateWhatsAppMessage(orderDetails, locale as Locale)
    const whatsappUrl = getWhatsAppMessageUrl(message, whatsappNumber)
    window.open(whatsappUrl, '_blank')
    clearCart()
    onClose()
    setIsSubmitting(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto ${locale === 'ar' ? 'rtl text-right' : 'ltr text-left'}`}>
        <div className="sticky top-0 bg-white border-b border-border/50 p-6 flex items-center justify-between">
          <h2 className="font-serif text-2xl">{t.checkout}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">{t.personalInfo}</h3>
              <div className="space-y-4">
                {[
                  { name: 'fullName', label: t.fullName, type: 'text' },
                  { name: 'email', label: t.email, type: 'email' },
                  { name: 'phone', label: t.phone, type: 'tel' },
                  { name: 'address', label: t.address, type: 'text' },
                ].map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={formData[field.name as keyof typeof formData]}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                        errors[field.name] ? 'border-red-500' : 'border-border'
                      }`}
                    />
                    {errors[field.name] && (
                      <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                    )}
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium mb-2">{t.city}</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    list="checkout-city-suggestions"
                    placeholder={t.city}
                    autoComplete="off"
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                      errors.city ? 'border-red-500' : 'border-border'
                    }`}
                  />
                  <datalist id="checkout-city-suggestions">
                    {deliveryCities.map((rate) => (
                      <option key={rate.city} value={rate.city} />
                    ))}
                  </datalist>
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <h3 className="font-semibold mb-4">{t.orderSummary}</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                {items.map(item => (
                  <div key={item.id} className={`flex justify-between gap-3 text-sm ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                    <span
                      className="min-w-0 flex-1"
                      style={{
                        display: "-webkit-box",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 2,
                        overflow: "hidden",
                      }}
                    >
                      {item.name} x {item.quantity}
                    </span>
                    <span>DH {(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className={`flex justify-between gap-3 text-sm text-muted-foreground ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span>{t.shipping}</span>
                  <span>{t.free}</span>
                </div>
                <div className={`border-t border-border/50 pt-2 mt-2 font-semibold flex justify-between ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                  <span>{t.total}:</span>
                  <span>DH {subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-full font-medium transition bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              {isSubmitting ? t.processing : t.sendViaWhatsApp}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
