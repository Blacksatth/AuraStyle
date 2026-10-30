'use client'

import { useState, useEffect, useRef } from 'react'
import { getProducts } from '@/lib/firebase/products'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight, Heart } from 'lucide-react'
import type { Product } from '@/types/product'
import { formatPrice } from '@/lib/format'

export default function ProductHeroSlider() {
  const [products, setProducts] = useState<Product[]>([])
  const [index, setIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({})
  const sliderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data.filter((p) => p.id && p.name && p.image).slice(0, 5))
      })
      .catch((error) => console.error('Error cargando productos:', error))
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    if (products.length === 0 || isHovered) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [products, isHovered])

  const handlePrev = () => setIndex((prev) => (prev - 1 + products.length) % products.length)
  const handleNext = () => setIndex((prev) => (prev + 1) % products.length)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(0)
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > 50) handleNext()
    if (distance < -50) handlePrev()
  }

  const handleImageLoad = (productId: string) => {
    setImageLoaded((prev) => ({ ...prev, [productId]: true }))
  }

  if (isLoading) {
    return (
      <section className="container-edge py-16 sm:py-20">
        <div className="flex h-[420px] items-center justify-center rounded-2xl border border-line bg-surface sm:h-[500px]">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-gold" />
            <p className="text-sm tracking-wide text-ash">Preparando la selección…</p>
          </div>
        </div>
      </section>
    )
  }

  if (products.length === 0) return null

  return (
    <section className="container-edge py-16 sm:py-20" aria-labelledby="seleccion-title">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="eyebrow">Selección de la casa</p>
          <h2 id="seleccion-title" className="mt-3 font-display text-4xl font-light text-bone sm:text-5xl">
            Piezas que <span className="italic text-gold">destacan</span>
          </h2>
        </div>

        <div className="flex items-center gap-5">
          <span className="text-xs tracking-[0.2em] text-ash" aria-hidden="true">
            <span className="text-gold">{String(index + 1).padStart(2, '0')}</span>
            <span className="mx-1 text-line">/</span>
            {String(products.length).padStart(2, '0')}
          </span>
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              aria-label="Pieza anterior"
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-bone transition-colors hover:border-gold/60 hover:text-gold"
            >
              <ArrowLeft size={17} />
            </button>
            <button
              onClick={handleNext}
              aria-label="Pieza siguiente"
              className="grid h-11 w-11 place-items-center rounded-full border border-line text-bone transition-colors hover:border-gold/60 hover:text-gold"
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={sliderRef}
        className="relative h-[460px] w-full overflow-hidden rounded-2xl border border-line bg-surface sm:h-[540px] lg:h-[580px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-roledescription="carrusel"
        aria-label="Productos destacados"
      >
        {products.map((product, i) => {
          const image = Array.isArray(product.image) ? product.image[0] : product.image
          const active = i === index

          return (
            <div
              key={product.id}
              className={`absolute inset-0 transition-opacity duration-700 ${active ? 'z-10 opacity-100' : 'z-0 opacity-0'
                }`}
              aria-hidden={!active}
            >
              <Image
                src={image}
                alt={product.name}
                fill
                priority={active}
                sizes="100vw"
                className={`object-cover transition-transform duration-[1200ms] ease-out ${active ? 'scale-100' : 'scale-105'
                  } ${imageLoaded[product.id || ''] ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => handleImageLoad(product.id || '')}
              />

              {!imageLoaded[product.id || ''] && (
                <div className="absolute inset-0 animate-pulse bg-elevated" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
              <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-ink/20 to-transparent" />

              <div className="absolute inset-0 flex items-end">
                <div className="w-full p-6 sm:p-10 lg:p-14">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
                        Novedad
                      </span>
                      {product.category && (
                        <span className="rounded-full border border-bone/25 bg-ink/30 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-bone backdrop-blur-sm">
                          {product.category}
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-display text-4xl font-light leading-[1.02] text-bone sm:text-5xl lg:text-6xl">
                      {product.name}
                    </h3>

                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                      {product.price !== undefined && (
                        <p className="text-xl font-medium text-gold sm:text-2xl">
                          {formatPrice(product.price)}
                          <span className="ml-2 text-[10px] uppercase tracking-[0.18em] text-ash">COP</span>
                        </p>
                      )}
                      {product.stock !== undefined && (
                        <p className="flex items-center gap-2 text-xs text-ash">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${product.stock > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}
                          />
                          {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                        </p>
                      )}
                    </div>

                    <div className="mt-7 flex items-center gap-3">
                      <Link href={`/products/${product.id}`} className="btn-gold group !py-3">
                        Ver pieza
                        <ArrowUpRight
                          size={16}
                          className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </Link>
                      <button
                        aria-label={`Guardar ${product.name} en favoritos`}
                        className="grid h-11 w-11 place-items-center rounded-full border border-bone/25 bg-ink/30 text-bone backdrop-blur-sm transition-colors hover:border-gold hover:text-gold"
                      >
                        <Heart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {/* Progreso */}
        <div className="absolute bottom-5 right-5 z-20 hidden gap-1.5 sm:flex lg:bottom-7 lg:right-7">
          {products.map((product, i) => (
            <button
              key={product.id}
              onClick={() => setIndex(i)}
              aria-label={`Ir a la pieza ${i + 1}`}
              aria-current={i === index}
              className={`h-[3px] rounded-full transition-all duration-500 ${i === index ? 'w-8 bg-gold' : 'w-3 bg-bone/25 hover:bg-bone/50'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
