'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
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

    const ariaLabel = isClient && totalItems > 0 
    ? `Abrir carrito, ${totalItems} productos` 
    : 'Abrir carrito'
    
  return (
    <>
      <button
        id="carrito"
        onClick={() => setOpen(true)}
        aria-label={ariaLabel}
        className="relative grid h-10 w-10 place-items-center rounded-full border border-transparent text-bone transition-colors hover:border-line hover:text-gold"
      >
        <ShoppingBag size={19} />
        {isClient && totalItems > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gold px-1 text-[10px] font-semibold leading-none text-ink">
            {totalItems}
          </span>
        )}
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
