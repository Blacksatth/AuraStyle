'use client'

import { getProducts } from '@/lib/firebase/products'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/features/cart/CartContext'
import { useEffect, useState } from 'react'
import type { Product } from '@/types/product'
import { calculateDiscount, capitalize, formatNumber } from '@/lib/format'
import { getProductImage } from '@/lib/product-image'
import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [filter, setFilter] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const { addToCart } = useCart()

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data.filter((p) => p.id && p.name && typeof p.price === 'number'))
      })
      .catch((error) => console.error('Error cargando productos:', error))
      .finally(() => setLoading(false))
  }, [])

  const categories = [...new Set(products.map((p) => p.category ?? ''))].filter(Boolean)
  const filtered = products
    .filter((p) => !filter || p.category === filter)
    .filter((p) => p.name.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <section id="productos" className="border-t border-line py-16 sm:py-20">
      <div className="container-edge">
        {/* Encabezado */}
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="eyebrow">Catálogo</p>
            <h2 className="mt-3 font-display text-4xl font-light leading-tight text-bone sm:text-5xl">
              Elige tu próxima <span className="italic text-gold">obsesión</span>
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-ash">
              Cada pieza pasa por una curaduría de materiales, acabados y silueta. Nada entra
              al catálogo por casualidad.
            </p>
          </div>

          <div className="lg:col-span-5">
            <label htmlFor="product-search" className="sr-only">
              Buscar producto
            </label>
            <div className="relative">
              <Search
                size={17}
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ash"
                aria-hidden="true"
              />
              <input
                id="product-search"
                type="search"
                placeholder="Buscar por nombre…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-full border border-line bg-surface py-3.5 pl-12 pr-12 text-sm text-bone placeholder:text-ash/70 transition-colors focus:border-gold/60 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-4 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ash transition-colors hover:text-bone"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="mt-8 flex items-center gap-3 overflow-x-auto pb-1">
          <span className="hidden items-center gap-2 text-xs uppercase tracking-[0.16em] text-ash sm:flex">
            <SlidersHorizontal size={14} />
            Filtrar
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('')}
              aria-pressed={filter === ''}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-300 ${filter === ''
                  ? 'bg-gold text-ink'
                  : 'border border-line text-ash hover:border-gold/40 hover:text-bone'
                }`}
            >
              Todo
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                aria-pressed={filter === cat}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-medium uppercase tracking-[0.12em] transition-all duration-300 ${filter === cat
                    ? 'bg-gold text-ink'
                    : 'border border-line text-ash hover:border-gold/40 hover:text-bone'
                  }`}
              >
                {capitalize(cat)}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, idx) => (
              <div key={idx} className="overflow-hidden rounded-xl border border-line bg-surface">
                <div className="aspect-[4/5] animate-pulse bg-elevated" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-elevated" />
                  <div className="h-3 w-1/3 animate-pulse rounded bg-elevated" />
                </div>
              </div>
            ))
            : filtered.length > 0
              ? filtered.map((product, idx) => (
                <article
                  key={product.id}
                  className="group relative overflow-hidden rounded-xl border border-line bg-surface opacity-0 transition-colors duration-300 hover:border-gold/40 animate-fadeIn"
                  style={{ animationDelay: `${Math.min(idx, 5) * 0.05}s`, animationFillMode: 'forwards' }}
                >
                  <Link
                    href={`/products/${product.id}`}
                    className="relative block aspect-[4/5] overflow-hidden bg-elevated"
                    aria-label={`Ver ${product.name}`}
                  >
                    <Image
                      src={getProductImage(product.image)}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      unoptimized
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
                      {product.category && (
                        <span className="rounded-full border border-bone/20 bg-ink/50 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-bone backdrop-blur-md">
                          {capitalize(product.category)}
                        </span>
                      )}
                      {product.onSale && product.salePrice && (
                        <span className="rounded-full bg-gold px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink">
                          -{calculateDiscount(product.price, product.salePrice)}%
                        </span>
                      )}
                    </div>

                    <span className="absolute inset-x-3 bottom-3 hidden translate-y-2 items-center justify-center rounded-full border border-bone/30 bg-ink/40 py-2.5 text-[11px] uppercase tracking-[0.16em] text-bone opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:flex">
                      Ver detalles
                    </span>
                  </Link>

                  <div className="flex flex-col p-3.5 sm:p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/products/${product.id}`} className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-bone transition-colors group-hover:text-gold">
                          {product.name}
                        </h3>
                      </Link>
                      <button
                        onClick={() => addToCart(product)}
                        aria-label={`Añadir ${product.name} al carrito`}
                        className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full border border-line text-ash transition-all duration-300 hover:border-gold hover:bg-gold hover:text-ink"
                      >
                        <Plus size={15} />
                      </button>
                    </div>

                    <div className="mt-2.5 flex items-baseline gap-2">
                      {product.onSale && product.salePrice ? (
                        <>
                          <span className="text-base font-medium text-gold">
                            ${formatNumber(product.salePrice)}
                          </span>
                          <span className="text-xs text-ash line-through">
                            ${formatNumber(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-base font-medium text-gold">
                          ${formatNumber(product.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
              : (
                <div className="col-span-full flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line py-20 text-center">
                  <Search size={24} className="text-ash" />
                  <div>
                    <p className="font-display text-2xl text-bone">Sin resultados</p>
                    <p className="mt-1 text-sm text-ash">
                      Prueba con otra palabra o cambia el filtro.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilter('')
                    }}
                    className="btn-ghost !px-5 !py-2.5 !text-xs"
                  >
                    Ver todo el catálogo
                  </button>
                </div>
              )}
        </div>
      </div>
    </section>
  )
}
