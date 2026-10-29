"use client"

import { useEffect } from "react"
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, MessageCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { createPortal } from "react-dom"

interface CartItem {
  id: string
  name: string
  price: number
  image?: string | string[] | null
  extraImages?: string[]
  quantity: number
  discount?: number
  onSale?: boolean
  salePrice?: number
}

interface CartModalProps {
  cartItems: CartItem[]
  isOpen: boolean
  onClose: () => void
  onRemove: (id: string) => void
  onIncrease: (id: string) => void
  onDecrease: (id: string) => void
}

export default function CartModal({
  cartItems,
  isOpen,
  onClose,
  onRemove,
  onIncrease,
  onDecrease,
}: CartModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const getImage = (item: CartItem) => {
    if (typeof item.image === "string" && item.image) return item.image
    if (Array.isArray(item.image) && item.image.length > 0) return item.image[0]
    if (item.extraImages && item.extraImages.length > 0) return item.extraImages[0]
    return "/placeholder.png"
  }

  const getTotal = () =>
    cartItems.reduce((total, item) => {
      const finalPrice = item.onSale && item.salePrice ? item.salePrice : item.price
      return total + finalPrice * item.quantity
    }, 0)

  const formatPrice = (value: number) =>
    value.toLocaleString("es-CO", { minimumFractionDigits: 0 })

  const getWhatsAppMessage = () => {
    let message = "🛍️ *Pedido desde la tienda online*\n\n"
    cartItems.forEach((item) => {
      const finalPrice = item.onSale && item.salePrice ? item.salePrice : item.price
      message += `• ${item.name} x${item.quantity} - $${formatPrice(
        finalPrice * item.quantity,
      )}\n`
    })
    message += `\n💰 *Total:* $${formatPrice(
      getTotal(),
    )}\n\n📦 Envío gratis 🚚`
    return encodeURIComponent(message)
  }

  if (!isOpen) return null

  return typeof document !== "undefined"
    ? createPortal(
        <AnimatePresence>
          <div
            className="fixed inset-0 z-[9999] flex justify-end"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          >
            {/* Fondo oscuro con blur que cierra al hacer click */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose} // 👉 Cierra al hacer clic fuera
            />

            {/* Panel del carrito */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full sm:w-[440px] h-full bg-gradient-to-b from-slate-950 to-slate-900 shadow-2xl flex flex-col rounded-l-3xl border-l border-slate-800 z-[10000]"
              onClick={(e) => e.stopPropagation()} // Evita que el click dentro cierre
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-950">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-fuchsia-600/20 to-violet-600/20 rounded-xl">
                    <ShoppingBag className="w-5 h-5 text-fuchsia-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Tu Carrito</h2>
                    <p className="text-xs text-slate-400">
                      {cartItems.length}{" "}
                      {cartItems.length === 1 ? "producto" : "productos"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all duration-200 hover:rotate-90"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de productos */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="p-6 bg-slate-800/30 rounded-2xl mb-4">
                      <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-3" />
                    </div>
                    <p className="text-base text-slate-300 font-semibold mb-1">
                      Tu carrito está vacío
                    </p>
                    <p className="text-sm text-slate-500">
                      Agrega productos para continuar
                    </p>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const finalPrice =
                      item.onSale && item.salePrice
                        ? item.salePrice
                        : item.price
                    const hasDiscount =
                      item.onSale &&
                      item.salePrice &&
                      item.salePrice < item.price

                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-start gap-4 bg-slate-800/40 hover:bg-slate-800/60 rounded-2xl p-4 border border-slate-700/50 transition-all group"
                      >
                        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                          <Image
                            src={getImage(item) || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            sizes="96px"
                            unoptimized
                          />
                          {hasDiscount && (
                            <div className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg">
                              <Tag size={10} />
                              OFERTA
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white mb-1 truncate">
                            {item.name}
                          </h3>
                          <div className="mb-3">
                            {hasDiscount ? (
                              <div className="flex items-center gap-2">
                                <span className="text-base text-green-400 font-black">
                                  ${formatPrice(finalPrice)}
                                </span>
                                <span className="text-xs text-slate-500 line-through">
                                  ${formatPrice(item.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-base text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 font-black">
                                ${formatPrice(finalPrice)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onDecrease(item.id)}
                              disabled={item.quantity <= 1}
                              className="w-8 h-8 flex items-center justify-center text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 rounded-lg transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-white text-sm font-bold w-8 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onIncrease(item.id)}
                              className="w-8 h-8 flex items-center justify-center text-white bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    )
                  })
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="p-6 border-t border-slate-800 bg-slate-950 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
                      ${formatPrice(getTotal())}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3 mt-4">
                    <a
                      href={`https://wa.me/573025636290?text=${getWhatsAppMessage()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white font-semibold text-base py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Comprar por WhatsApp
                    </a>

                    <button
                      onClick={() => {
                        onClose()
                        router.push("/checkout")
                      }}
                      className="w-full bg-gradient-to-r from-fuchsia-600 via-violet-600 to-indigo-600 hover:from-fuchsia-700 hover:via-violet-700 hover:to-indigo-700 text-white font-bold text-base py-4 rounded-xl transition-all shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Finalizar compra
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </AnimatePresence>,
        document.body,
      )
    : null
}
