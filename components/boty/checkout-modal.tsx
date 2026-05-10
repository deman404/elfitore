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
    paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery (COD)',
    whatsapp: 'WhatsApp',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email',
    phone: 'Phone Number',
    address: 'Delivery Address',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
    orderSummary: 'Order Summary',
    total: 'Total',
    placeOrder: 'Place Order',
    sendViaWhatsApp: 'Send Order via WhatsApp',
    contactViaWhatsApp: 'Contact via WhatsApp',
    required: 'This field is required',
    successMessage: 'Order placed successfully! We will contact you shortly.',
    orderDetails: 'Order Details',
    processing: 'Processing...'
  },
  fr: {
    checkout: 'Paiement',
    paymentMethod: 'Mode de paiement',
    cod: 'Paiement à la livraison',
    whatsapp: 'WhatsApp',
    personalInfo: 'Informations personnelles',
    fullName: 'Nom complet',
    email: 'E-mail',
    phone: 'Numéro de téléphone',
    address: 'Adresse de livraison',
    city: 'Ville',
    postalCode: 'Code postal',
    country: 'Pays',
    orderSummary: 'Résumé de la commande',
    total: 'Total',
    placeOrder: 'Passer la commande',
    sendViaWhatsApp: 'Envoyer la commande via WhatsApp',
    contactViaWhatsApp: 'Contacter via WhatsApp',
    required: 'Ce champ est obligatoire',
    successMessage: 'Commande passée avec succès! Nous vous contacterons bientôt.',
    orderDetails: 'Détails de la commande',
    processing: 'Traitement...'
  },
  ar: {
    checkout: 'الدفع',
    paymentMethod: 'طريقة الدفع',
    cod: 'الدفع عند الاستلام',
    whatsapp: 'واتس آب',
    personalInfo: 'المعلومات الشخصية',
    fullName: 'الاسم الكامل',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    address: 'عنوان التوصيل',
    city: 'المدينة',
    postalCode: 'الرمز البريدي',
    country: 'الدولة',
    orderSummary: 'ملخص الطلب',
    total: 'الإجمالي',
    placeOrder: 'تقديم الطلب',
    sendViaWhatsApp: 'إرسال الطلب عبر واتس آب',
    contactViaWhatsApp: 'تواصل عبر واتس آب',
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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'whatsapp'>('cod')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const t = translations[locale as Locale]

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadSettings = async () => {
      const settings = await fetchSiteSettings()
      setWhatsappNumber(settings.whatsappNumber ?? '')
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
    if (!formData.country) newErrors.country = t.required

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

    if (paymentMethod === 'cod') {
      // For COD, simulate order processing
      setTimeout(() => {
        alert(t.successMessage)
        clearCart()
        onClose()
        setIsSubmitting(false)
      }, 1000)
    } else {
      // For WhatsApp
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
        country: formData.country,
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
          {/* Payment Method Selection */}
          <div>
            <h3 className="font-semibold mb-4">{t.paymentMethod}</h3>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                  className={locale === 'ar' ? 'ml-3' : 'mr-3'}
                />
                <span className="font-medium">{t.cod}</span>
              </label>
              <label className={`flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition ${locale === 'ar' ? 'flex-row-reverse' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="whatsapp"
                  checked={paymentMethod === 'whatsapp'}
                  onChange={(e) => setPaymentMethod(e.target.value as 'whatsapp')}
                  className={locale === 'ar' ? 'ml-3' : 'mr-3'}
                />
                <span className="font-medium">{t.whatsapp}</span>
              </label>
            </div>
          </div>

          {/* Personal Information */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">{t.personalInfo}</h3>
              <div className="space-y-4">
                {[
                  { name: 'fullName', label: t.fullName, type: 'text' },
                  { name: 'email', label: t.email, type: 'email' },
                  { name: 'phone', label: t.phone, type: 'tel' },
                  { name: 'address', label: t.address, type: 'text' },
                  { name: 'city', label: t.city, type: 'text' },
                  { name: 'postalCode', label: t.postalCode, type: 'text' },
                  { name: 'country', label: t.country, type: 'text' }
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
              className={`w-full py-4 rounded-full font-medium transition ${
                paymentMethod === 'cod'
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'bg-green-600 text-white hover:bg-green-700'
              } disabled:opacity-50`}
            >
              {isSubmitting ? t.processing : (paymentMethod === 'cod' ? t.placeOrder : t.sendViaWhatsApp)}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
