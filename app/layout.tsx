import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display, Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/components/boty/cart-context'
import { LanguageProvider } from '@/components/language-context'
import { RtlWrapper } from '@/components/rtl-wrapper'
import './globals.css'

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700']
});

const cairo = Cairo({
  subsets: ["latin", "arabic"],
  variable: '--font-cairo',
  weight: ['300', '400', '500', '600', '700']
});

export const metadata: Metadata = {
  title: 'El Fitore — Premium Moroccan Olive Oil',
  description: 'Premium Moroccan olive oils and olives. Direct from Morocco with authenticity and tradition.',
  generator: 'v0.app',
  keywords: ['olive oil', 'moroccan', 'olives', 'premium', 'organic', 'natural'],
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#F7F4EF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <LanguageProvider>
      <RtlWrapper>
        <html lang="en" suppressHydrationWarning>
          <body className={`${dmSans.variable} ${playfairDisplay.variable} ${cairo.variable} font-sans antialiased`}>
            <CartProvider>
              {children}
            </CartProvider>
            <Analytics />
          </body>
        </html>
      </RtlWrapper>
    </LanguageProvider>
  )
}
