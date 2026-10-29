'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { useCart } from '../context/CartContext'
import CartModal from './CartModal'

export default function CartIcon() {
  const { cart, removeFromCart, increaseQuantity, decreaseQuantity } = useCart()
  const [open, setOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <>
      <button
        id="carrito"
        onClick={() => setOpen(true)}
        className="relative hover:text-green-400 transition p-2 flex items-center justify-center"
      >
        <div className="relative">
          <ShoppingCart size={22} />
          {isClient && totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full leading-none">
              {totalItems}
            </span>
          )}
        </div>
      </button>

      {open && (
        <CartModal
          isOpen={open}
          cartItems={cart}
          onClose={() => setOpen(false)}
          onRemove={removeFromCart}
          onIncrease={increaseQuantity}
          onDecrease={decreaseQuantity}
        />
      )}
    </>
  )
}
