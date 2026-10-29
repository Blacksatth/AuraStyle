'use client'

import { getProducts } from '../lib/firebaseFunctions'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import { Product } from '../types/Product'
import { ShoppingCart, Percent } from 'lucide-react'

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    getProducts().then((data) => {
      const filteredData = (data as Product[]).filter(
        (p) => p.id && p.name && typeof p.price === 'number'
      )
      setProducts(filteredData)
      setLoading(false)
    })
  }, [])

  const categories = [...new Set(products.map((p) => p.category ?? ""))]
  const filtered = products
    .filter((p) => !filter || p.category === filter)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const capitalize = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : ""

  const getImage = (img?: string | string[] | null) =>
    Array.isArray(img) ? img[0] : img ?? "/placeholder.png"

  const calculateDiscount = (price: number, salePrice: number) =>
    Math.round(((price - salePrice) / price) * 100)

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price)
  

  return (
    <section id="productos" className="py-5 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Título */}
      <div className="text-center mb-4">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-1">Nuestros Productos</h2>
        <p className="text-slate-400 text-lg">Encuentra el estilo perfecto para ti</p>
      </div>

      {/* Buscador */}
      <div className="max-w-xl mx-auto mb-4">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-violet-500 focus:outline-none transition"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => setFilter("")}
          className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
            filter === ""
              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          Todos
        </button>
        {categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              filter === cat
                ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            {capitalize(cat)}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
        {loading
          ? Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-slate-800 rounded-xl aspect-[3/4]"
              ></div>
            ))
          : filtered.length > 0
          ? filtered.map((product) => (
              <div
                key={product.id}
                className="group bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all hover:shadow-lg hover:shadow-violet-500/10 flex flex-col opacity-0 animate-fadeIn text-xs sm:text-sm"
                style={{ animationDelay: `${Math.random() * 0.3}s`, animationFillMode: 'forwards' }}
              >
                <Link href={`/products/${product.id}`} className="relative">
                  <div className="aspect-[3/4] sm:aspect-square relative bg-slate-800">
                    <Image
                      src={getImage(product.image)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                    {/* Badge de oferta */}
                    {product.onSale && product.salePrice && (
                      <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg font-bold text-[10px] sm:text-xs shadow-lg flex items-center gap-1">
                          <Percent className="w-3 h-3" />
                          -{calculateDiscount(product.price, product.salePrice)}%
                        </div>
                      </div>
                    )}
                    {/* Badge de categoría */}
                    {product.category && (
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                        <div className="bg-slate-900/90 backdrop-blur-sm text-slate-200 px-2 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[10px] sm:text-xs font-semibold border border-slate-700/50">
                          {capitalize(product.category)}
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-3 sm:p-4 flex flex-col flex-1">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-white text-xs sm:text-sm mb-1 line-clamp-1 group-hover:text-violet-400 transition">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mb-2 sm:mb-3">
                    {product.onSale && product.salePrice ? (
                      <div>
                        <p className="text-slate-500 line-through text-[11px] sm:text-xs">{formatPrice(product.price)}
</p>
                        <p className="text-green-400 font-black text-base sm:text-lg">{formatPrice(product.salePrice)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
                        ${formatPrice(product.price)}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="mt-auto w-full px-3 py-2 sm:px-4 sm:py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 rounded-lg text-white font-bold transition-all hover:scale-105 shadow-md sm:shadow-lg shadow-purple-500/30 flex items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-sm"
                    aria-label={`Añadir ${product.name} al carrito`}
                  >
                    <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" /> Añadir
                  </button>
                </div>
              </div>
            ))
          : (
            <div className="col-span-full text-center py-20">
              <p className="text-slate-400 text-lg">No se encontraron productos</p>
            </div>
          )}
      </div>

      {/* Animación Fade-in */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </section>
  )
}
