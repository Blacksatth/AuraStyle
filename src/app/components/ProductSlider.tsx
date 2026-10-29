'use client'

import { useState, useEffect, useRef } from 'react'
import { getProducts } from '../lib/firebaseFunctions'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, ShoppingCart, Heart, Star, Sparkles, Zap } from 'lucide-react'
import { Product } from '../types/Product'
import { formatPrice } from "../utils/formatPrice"

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
    getProducts().then((data: Product[]) => {
      const filtered = data.filter((p) => p.id && p.name && p.image).slice(0, 5)
      setProducts(filtered)
      setIsLoading(false)
    })
  }, [])

  useEffect(() => {
    if (products.length === 0 || isHovered) return
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % products.length)
    }, 5000)
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
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50
    
    if (isLeftSwipe) handleNext()
    if (isRightSwipe) handlePrev()
  }

  const handleImageLoad = (productId: string) => {
    setImageLoaded(prev => ({ ...prev, [productId]: true }))
  }

  if (isLoading) {
    return (
      <div className="w-full h-[40vh] sm:h-[45vh] bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 animate-pulse"></div>
        <div className="flex flex-col items-center gap-3 z-10">
          <div className="relative">
            <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-violet-500 animate-pulse" />
            </div>
          </div>
          <p className="text-slate-300 text-base font-medium">Cargando productos destacados...</p>
        </div>
      </div>
    )
  }

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 py-3 sm:py-4 rounded-2xl shadow-2xl border border-slate-800/50">
      <div className="max-w-8xl mx-auto px-2 sm:px-6 lg:px-8">
        <div 
          ref={sliderRef}
          className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] rounded-2xl overflow-hidden shadow-2xl border border-slate-800/50"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Efectos de fondo animados */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-0 w-72 h-72 bg-purple-500/10 rounded-full filter blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-violet-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                i === index 
                  ? 'opacity-100 z-10 scale-100' 
                  : i === (index - 1 + products.length) % products.length || i === (index + 1) % products.length
                    ? 'opacity-0 z-0 scale-105'
                    : 'opacity-0 z-0 scale-95'
              }`}
            >
              <div className="relative w-full h-full">
                <Image
                  src={Array.isArray(product.image) ? product.image[0] : product.image}
                  alt={product.name}
                  fill
                  className={`object-cover transition-opacity duration-700 ${imageLoaded[product.id || ''] ? 'opacity-100' : 'opacity-0'}`}
                  priority={i === index}
                  onLoad={() => handleImageLoad(product.id || '')}
                />
                
                {!imageLoaded[product.id || ''] && (
                  <div className="absolute inset-0 bg-slate-800 animate-pulse"></div>
                )}

                {/* Overlay de gradiente optimizado */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-transparent"></div>
                
                {/* Efecto de brillo en el borde */}
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(139,92,246,0.1)]"></div>

                {/* Contenido compacto */}
                <div className={`absolute inset-0 flex items-center px-4 sm:px-10 md:px-16 transition-all duration-700 delay-300 ${
                  i === index ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
                }`}>
                  <div className="max-w-xl space-y-3 sm:space-y-4">
                    {/* Badges compactos */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold rounded-full text-xs uppercase tracking-wide shadow-lg shadow-purple-500/30">
                        <Zap className="w-3 h-3" />
                        Nuevo
                      </span>
                      {product.category && (
                        <span className="px-2.5 py-1 bg-slate-800/90 backdrop-blur-md text-slate-200 font-semibold rounded-full text-xs border border-slate-700/50">
                          {product.category}
                        </span>
                      )}
                      {typeof product.stock === 'number' && product.stock < 5 && (
                        <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 font-semibold rounded-full text-xs border border-amber-500/30 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Últimas
                        </span>
                      )}
                    </div>

                    {/* Título compacto */}
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white drop-shadow-2xl leading-tight tracking-tight">
                      {product.name}
                      <div className="h-0.5 w-16 bg-gradient-to-r from-violet-500 to-fuchsia-500 mt-1.5 rounded-full"></div>
                    </h3>

                    {/* Precio y stock en línea */}
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                      {product.price && (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-2xl sm:text-3xl md:text-4xl font-black text-white bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs sm:text-sm text-slate-400 font-medium">COP</span>
                        </div>
                      )}
                      
                      {product.stock !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                          <span className="text-xs sm:text-sm text-slate-300 font-medium">
                            {product.stock > 0 ? `${product.stock} Disponibles.` : 'Agotado'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botones compactos */}
                    <div className="flex items-center gap-2 pt-1">
                      <Link
                        href={`/products/${product.id}`}
                        className="group relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg shadow-purple-500/30 text-sm overflow-hidden"
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Ver
                        </span>
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      </Link>

                      <button className="group relative p-2 bg-slate-800/90 backdrop-blur-md hover:bg-slate-700 text-white rounded-lg transition-all hover:scale-105 border border-slate-700/50 overflow-hidden">
                        <Heart className="w-4 h-4" />
                        <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Botones de navegación compactos */}
          <button
            onClick={handlePrev}
            className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full z-20 transition-all hover:scale-110 border border-slate-700/50 backdrop-blur-md group"
            aria-label="Anterior"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:-translate-x-0.5" />
          </button>

          <button
            onClick={handleNext}
            className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 p-1.5 sm:p-2 bg-slate-900/90 hover:bg-slate-800 text-white rounded-full z-20 transition-all hover:scale-110 border border-slate-700/50 backdrop-blur-md group"
            aria-label="Siguiente"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-0.5" />
          </button>

          {/* Indicadores compactos */}
          <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-slate-900/70 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700/50">
            {products.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`transition-all ${i === index
                  ? 'w-6 h-1.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full shadow-lg shadow-purple-500/50'
                  : 'w-1.5 h-1.5 bg-slate-600 hover:bg-slate-500 rounded-full'
                }`}
              />
            ))}
          </div>

          {/* Contador compacto */}
          <div className="absolute top-3 sm:top-4 right-3 sm:right-4 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md text-slate-200 text-xs sm:text-sm font-bold rounded-full z-20 border border-slate-700/50 flex items-center gap-1.5">
            <span className="text-violet-400">{index + 1}</span>
            <span className="text-slate-600">/</span>
            <span>{products.length}</span>
          </div>
        </div>
      </div>
    </section>
  )
}