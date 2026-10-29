"use client"
import { getDoc, doc, collection, getDocs } from "firebase/firestore"
import { db } from "../../lib/firebase"
import Link from "next/link"
import { useCart } from "@/app/context/CartContext"
import { useEffect, useState } from "react"
import { Minus, Plus, X, ArrowLeft, ShoppingCart, Heart, Share2, Star, MessageCircle } from "lucide-react"
import Modal from "react-modal"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Product } from "@/app/types/Product"
import ProductReviews from "@/app/components/ProductReviews"
import Footer from "@/app/components/Footer"

async function getProductById(id: string): Promise<Product | null> {
  const ref = doc(db, "products", id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as Product
}

async function getAllProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"))
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]
}

export default function ProductClient({ id }: { id: string }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [recommendations, setRecommendations] = useState<Product[]>([])
  const [moreProducts, setMoreProducts] = useState<Product[]>([])
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart()
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
    if (typeof window !== "undefined") {
      setTimeout(() => {
        const root = document.getElementById("__next")
        if (root) Modal.setAppElement(root)
      }, 0)
    }
    async function fetchData() {
      if (!id) return
      try {
        const data = await getProductById(id)
        if (!data) {
          setProduct(null)
          return
        }
        setProduct(data)
        const allProducts = await getAllProducts()
        const recommendations = allProducts.filter((p) => p.id !== data.id && p.category === data.category).slice(0, 4)
        const more = allProducts.filter((p) => p.id !== data.id).slice(0, 8)
        setRecommendations(recommendations)
        setMoreProducts(more)
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
    fetchData()
  }, [id])

  if (!product) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-ash text-sm">Cargando producto...</p>
        </div>
      </div>
    )
  }

  const images = [...(Array.isArray(product.image) ? product.image : [product.image]), ...(product.extraImages || [])]
  const whatsappMessage = `Hola, quiero comprar:\n*${product.name}*\nPrecio: $${product.onSale && product.salePrice ? product.salePrice : product.price}\nCategoría: ${product.category}`
  const cartItem = cart.find((item) => item.id === product.id)
  const effectivePrice = product.onSale && product.salePrice !== undefined ? product.salePrice : product.price

  return (
    <div className="bg-ink text-bone min-h-screen relative overflow-hidden">
      {/* Fondo animado tipo aurora */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface via-ink to-ink" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[90vw] h-[90vw] max-w-5xl rounded-full bg-gradient-to-r from-gold/10 via-gold/5 to-transparent blur-3xl opacity-80 animate-pulse" />

      {/* Header */}
      <div className="bg-ink/80 backdrop-blur-md border-b border-line sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <Link href="/" className="inline-flex items-center gap-1.5 text-ash hover:text-bone transition-colors text-sm">
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver
          </Link>
        </div>
      </div>

      {/* Contenido principal con fondo mejorado */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-3 py-8 lg:py-3">
        <div className="relative bg-surface/70 backdrop-blur-xl border border-line shadow-2xl shadow-black/40 rounded-3xl p-6 lg:p-8 transition-all hover:shadow-gold/10 hover:border-gold/30">

          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
            {/* Galería */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-ink rounded-2xl overflow-hidden border border-line shadow-inner shadow-black/60 group">
                <Image
                  src={images[activeImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                  onClick={() => {
                    setSelectedImage(images[activeImageIndex])
                    setModalOpen(true)
                  }}
                />
                {product.onSale && product.salePrice !== undefined && (
                  <span className="absolute top-3 left-3 bg-gold text-ink text-xs font-bold px-2 py-1 rounded-lg shadow-md">
                    En oferta
                  </span>
                )}
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full backdrop-blur-md border border-white/10 transition-all ${
                      isFavorite
                        ? 'bg-red-500/90 text-bone'
                        : 'bg-ink/80 hover:bg-elevated text-bone'
                    }`}
                  >
                    <Heart className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
                  </button>
                  <button className="p-2 bg-ink/80 backdrop-blur-md border border-white/10 hover:bg-elevated text-bone rounded-full transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImageIndex(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === i
                        ? 'border-gold shadow-md shadow-gold/30 scale-105'
                        : 'border-line hover:border-line'
                    }`}
                  >
                    <Image
                      src={img || "/placeholder.svg"}
                      alt={`Vista ${i + 1}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Info del producto */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-gold/10 border border-gold/20 text-gold text-xs font-semibold rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs text-ash ml-1.5">(4.8)</span>
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-bone leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-3">
                {product.onSale && product.salePrice !== undefined ? (
                  <>
                    <span className="text-3xl font-black text-gold">
                      ${product.salePrice.toLocaleString()}
                    </span>
                    <span className="text-sm text-ash">COP</span>
                    <span className="text-lg text-ash/70 line-through">
                      ${product.price.toLocaleString()}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-black text-bone">
                      ${product.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-ash">COP</span>
                  </>
                )}
              </div>

              {product.stock !== undefined && (
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-ash">
                    {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                  </span>
                </div>
              )}

              <div className="p-4 bg-surface rounded-xl border border-line">
                <h3 className="text-sm font-bold mb-2">Descripción</h3>
                <p className="text-bone/80 text-sm leading-relaxed whitespace-pre-line line-clamp-4">
                  {product.description || "Este producto no tiene descripción disponible."}
                </p>
              </div>

              <div className="p-4 bg-surface rounded-xl border border-line">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Cantidad</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decreaseQuantity(product.id)}
                      disabled={!cartItem}
                      className="p-1.5 bg-elevated hover:bg-elevated rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-xl font-bold w-10 text-center">
                      {cartItem ? cartItem.quantity : 0}
                    </span>
                    <button
                      onClick={() => {
                        if (cartItem) {
                          increaseQuantity(product.id)
                        } else {
                          addToCart({
                            ...product,
                            image: Array.isArray(product.image) ? product.image[0] : product.image,
                          })
                        }
                      }}
                      className="p-1.5 bg-elevated hover:bg-elevated rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-line">
                  <span className="text-sm text-ash">Subtotal:</span>
                  <span className="text-xl font-black text-gold">
                    ${cartItem 
                      ? (cartItem.quantity * effectivePrice).toLocaleString()
                      : "0"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => {
                    if (!cartItem) {
                      addToCart({
                        ...product,
                        image: Array.isArray(product.image) ? product.image[0] : product.image,
                      })
                    }
                    router.push("/checkout")
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gold hover:bg-gold-soft text-ink text-sm font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Comprar
                </button>
                
                <a
                  href={`https://wa.me/573025636290?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-bone text-sm font-bold rounded-xl transition-all hover:scale-105"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE RESEÑAS */}
        <div className="mt-11">
          <ProductReviews productId={product.id} productName={product.name} />
        </div>

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black mb-5">También te puede interesar</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendations.map((p) => {
                const recPrice = p.onSale && p.salePrice !== undefined ? p.salePrice : p.price
                return (
                  <Link key={p.id} href={`/products/${p.id}`} scroll={true}>
                    <div className="group bg-surface rounded-xl overflow-hidden border border-line hover:border-gold/40 transition-all hover:scale-105">
                      <div className="relative aspect-square">
                        <Image
                          src={Array.isArray(p.image) ? p.image[0] : p.image}
                          alt={p.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                        {p.onSale && p.salePrice !== undefined && (
                          <span className="absolute top-2 left-2 bg-red-600 text-bone text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">
                            Oferta
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-bone text-sm mb-1.5 line-clamp-1">{p.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-black text-gold">
                            ${recPrice.toLocaleString()}
                          </p>
                          {p.onSale && p.salePrice !== undefined && (
                            <p className="text-xs text-ash/70 line-through">
                              ${p.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Más productos */}
        {moreProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black">Explora más productos</h2>
              <Link 
                href="/#productos"
                className="text-gold hover:text-gold-soft text-sm font-semibold flex items-center gap-1.5 transition-colors"
              >
                Ver todos
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {moreProducts.map((p) => {
                const morePrice = p.onSale && p.salePrice !== undefined ? p.salePrice : p.price
                return (
                  <Link key={p.id} href={`/products/${p.id}`} scroll={true}>
                    <div className="group bg-surface rounded-xl overflow-hidden border border-line hover:border-gold/40 transition-all hover:scale-105">
                      <div className="relative aspect-square">
                        <Image
                          src={Array.isArray(p.image) ? p.image[0] : p.image}
                          alt={p.name}
                          fill
                          unoptimized
                          className="object-cover group-hover:scale-110 transition-transform"
                        />
                        {p.onSale && p.salePrice !== undefined && (
                          <span className="absolute top-2 left-2 bg-red-600 text-bone text-[10px] font-bold px-2 py-0.5 rounded-lg shadow">
                            Oferta
                          </span>
                        )}
                        {p.category && (
                          <span className="absolute top-2 right-2 px-2.5 py-0.5 bg-ink/90 backdrop-blur-sm text-bone text-[10px] font-semibold rounded-full border border-line">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold text-bone text-sm mb-1.5 line-clamp-1">{p.name}</h3>
                        <div className="flex items-center gap-2">
                          <p className="text-xl font-black text-gold">
                            ${morePrice.toLocaleString()}
                          </p>
                          {p.onSale && p.salePrice !== undefined && (
                            <p className="text-xs text-ash/70 line-through">
                              ${p.price.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de imagen */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        overlayClassName="fixed inset-0 bg-black/80 z-40"
      >
        <div className="relative bg-ink rounded-xl overflow-hidden max-w-4xl w-full">
          <button
            onClick={() => setModalOpen(false)}
            className="absolute top-3 right-3 z-10 p-2 bg-surface hover:bg-elevated text-bone rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {selectedImage && (
            <div className="relative w-full aspect-square">
              <Image
                src={selectedImage}
                alt="Vista ampliada"
                fill
                unoptimized
                className="object-contain bg-surface"
              />
            </div>
          )}
        </div>
      </Modal>
      <Footer />
    </div>
  )
}
