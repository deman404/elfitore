"use client"

import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import Image from "next/image"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { useCart } from "./cart-context"
import { useLanguage } from "@/components/language-context"
import type { Locale } from "@/i18n.config"

const translations = {
  en: {
    cart: 'Cart',
    item: 'item',
    items: 'items',
    empty: 'Your cart is empty',
    continueShopping: 'Continue Shopping',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    free: 'Calculated at checkout',
    checkout: 'Checkout'
  },
  fr: {
    cart: 'Panier',
    item: 'article',
    items: 'articles',
    empty: 'Votre panier est vide',
    continueShopping: 'Continuer vos achats',
    subtotal: 'Sous-total',
    shipping: 'Livraison',
    total: 'Total',
    free: 'Calculé au paiement',
    checkout: 'Paiement'
  },
  ar: {
    cart: 'سلة',
    item: 'عنصر',
    items: 'عناصر',
    empty: 'سلتك فارغة',
    continueShopping: 'متابعة التسوق',
    subtotal: 'المجموع الجزئي',
    shipping: 'التوصيل',
    total: 'الإجمالي',
    free: 'يُحسب عند الدفع',
    checkout: 'الدفع'
  }
}

const ariaLabels = {
  en: {
    decrease: 'Decrease quantity',
    increase: 'Increase quantity',
    remove: 'Remove item'
  },
  fr: {
    decrease: 'Diminuer la quantité',
    increase: 'Augmenter la quantité',
    remove: 'Supprimer l’article'
  },
  ar: {
    decrease: 'تقليل الكمية',
    increase: 'زيادة الكمية',
    remove: 'إزالة العنصر'
  }
}

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isOpen, setIsOpen, itemCount, subtotal } = useCart()
  const { locale } = useLanguage()
  const t = translations[locale as Locale]
  const labels = ariaLabels[locale as Locale]

  const shipping = 0
  const total = subtotal + shipping

  return (
    <>
      <Drawer open={isOpen} onOpenChange={setIsOpen} direction="right">
        <DrawerContent className="h-full w-full sm:max-w-[440px]">
          <DrawerHeader className="border-b border-border/50 p-6 py-2.5">
            <DrawerTitle className="font-serif text-2xl">{t.cart}</DrawerTitle>
            <DrawerDescription>{itemCount} {itemCount === 1 ? t.item : t.items}</DrawerDescription>
          </DrawerHeader>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">{t.empty}</p>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="mt-4 text-primary hover:underline text-sm"
                  >
                    {t.continueShopping}
                  </button>
                </DrawerClose>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-serif text-base text-foreground mb-1 font-semibold">{item.name}</h3>
                      <p
                        className="mb-3 text-sm text-muted-foreground"
                        style={{
                          display: "-webkit-box",
                          WebkitBoxOrient: "vertical",
                          WebkitLineClamp: 2,
                          overflow: "hidden",
                        }}
                      >
                        {item.description}
                      </p>
                      
                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-border rounded-full">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-muted boty-transition rounded-l-full"
                            aria-label={labels.decrease}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-muted boty-transition rounded-r-full disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={item.quantity >= item.stock}
                            aria-label={labels.increase}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-muted-foreground hover:text-destructive boty-transition"
                          aria-label={labels.remove}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="font-medium text-foreground">DH {item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <DrawerFooter className="border-t border-border/50 p-6 gap-4">
              {/* Summary */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.subtotal}</span>
                  <span>DH {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t.shipping}</span>
                  <span>{t.free}</span>
                </div>
                <div className="flex justify-between text-base font-medium text-foreground pt-2 border-t border-border/50">
                  <span>{t.total}</span>
                  <span>DH {total.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <Link
                href="/checkout"
                className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium hover:bg-primary/90 boty-transition text-center"
              >
                {t.checkout}
              </Link>

              <DrawerClose asChild>
                <button
                  type="button"
                  className="w-full border border-border text-foreground py-4 rounded-full font-medium hover:bg-muted boty-transition"
                >
                  {t.continueShopping}
                </button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </DrawerContent>
      </Drawer>

    </>
  )
}
