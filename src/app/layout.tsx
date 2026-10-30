import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/features/cart/CartContext'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'AuraStyle — Moda con carácter',
  description:
    'AuraStyle es una selección editorial de moda y accesorios: piezas atemporales, materiales nobles y envío a todo el país.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-ink text-bone antialiased">
        <CartProvider>
          <Header />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  )
}
