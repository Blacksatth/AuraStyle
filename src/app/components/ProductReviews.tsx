"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, addDoc, query, where, getDocs, orderBy, Timestamp, updateDoc, doc } from "firebase/firestore"
import { db, auth } from "../lib/firebase"
import { onAuthStateChanged, User } from "firebase/auth"
import { Star, ThumbsUp, Filter, MessageSquare, Send, LogIn, TrendingUp, Clock, Award, ChevronDown, ChevronUp, Sparkles, UserCheck, Heart, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface Review {
  id: string
  productId: string
  productName?: string
  productCategory?: string
  productSubcategory?: string
  userName: string
  userEmail: string
  rating: number
  comment: string
  createdAt: Timestamp
  helpful: number
  userId?: string
}

interface ProductReviewsProps {
  productId: string
  productName?: string
  productCategory?: string
  productSubcategory?: string
}

interface FirebaseError {
  code?: string
  message?: string
}

export default function ProductReviews({ productId, productName, productCategory, productSubcategory }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<"recent" | "helpful" | "rating">("recent")
  const [showAllReviews, setShowAllReviews] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [animateItems, setAnimateItems] = useState(false)
  
  // Auth state
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  
  // Form state
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)

  // Cargar reseñas usando useCallback para evitar dependencias innecesarias
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true)
      // Solución: Primero obtenemos todos los documentos del producto sin ordenar
      const q = query(
        collection(db, "reviews"),
        where("productId", "==", productId)
      )
      const snapshot = await getDocs(q)
      const reviewsData = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as Review[]
      
      // Luego ordenamos los datos en el lado del cliente
      reviewsData.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis())
      
      setReviews(reviewsData)
      // Activar animación después de cargar
      setTimeout(() => setAnimateItems(true), 100)
    } catch (error) {
      const firebaseError = error as FirebaseError
      console.error("Error al cargar reseñas:", error)
      if (firebaseError?.code === 'permission-denied') {
        console.warn('⚠️ Configura las reglas de Firestore para la colección "reviews"')
      } else if (firebaseError?.code === 'failed-precondition') {
        console.warn('⚠️ Error de índice. Usando ordenamiento en cliente.')
      }
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [productId])

  // Verificar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // Cargar reseñas
  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  // Enviar reseña
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      alert("Debes iniciar sesión para dejar una reseña")
      return
    }

    if (rating === 0 || !comment.trim()) {
      alert("Por favor selecciona una calificación y escribe tu opinión")
      return
    }

    if (comment.trim().length < 10) {
      alert("Tu opinión debe tener al menos 10 caracteres")
      return
    }

    try {
      setSubmitting(true)
      
      const reviewData = {
        productId,
        productName,
        productCategory,
        productSubcategory,
        userName: user.displayName || user.email?.split('@')[0] || 'Usuario',
        userEmail: user.email || '',
        rating,
        comment: comment.trim(),
        createdAt: Timestamp.now(),
        helpful: 0,
        userId: user.uid
      }
      
      await addDoc(collection(db, "reviews"), reviewData)

      // Limpiar formulario
      setRating(0)
      setComment("")
      setShowReviewForm(false)
      
      // Recargar reseñas
      await loadReviews()
      
      // Scroll suave a las reseñas
      setTimeout(() => {
        document.getElementById('reviews-list')?.scrollIntoView({ behavior: 'smooth' })
      }, 300)
    } catch (error) {
      console.error("Error al enviar reseña:", error)
      alert("Error al enviar la reseña. Intenta de nuevo.")
    } finally {
      setSubmitting(false)
    }
  }

  // Marcar como útil
  const handleHelpful = async (reviewId: string, currentHelpful: number) => {
    try {
      const reviewRef = doc(db, "reviews", reviewId)
      await updateDoc(reviewRef, {
        helpful: currentHelpful + 1
      })
      await loadReviews()
    } catch (error) {
      console.error("Error al marcar como útil:", error)
    }
  }

  // Calcular estadísticas
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => r.rating === stars).length,
    percentage: reviews.length > 0 
      ? (reviews.filter(r => r.rating === stars).length / reviews.length) * 100 
      : 0
  }))

  // Filtrar y ordenar reseñas
  const filteredReviews = filterRating
    ? reviews.filter(r => r.rating === filterRating)
    : reviews

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === "helpful") return b.helpful - a.helpful
    if (sortBy === "rating") return b.rating - a.rating
    // Usamos toMillis() para comparar timestamps de forma más precisa
    return b.createdAt.toMillis() - a.createdAt.toMillis()
  })

  // Formatear fecha
  const formatDate = (timestamp: Timestamp) => {
    const date = timestamp.toDate()
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Hoy'
    if (diffDays === 2) return 'Ayer'
    if (diffDays <= 7) return `Hace ${diffDays} días`
    
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Obtener color del avatar
  const getAvatarColor = (email: string) => {
    const colors = [
      'from-violet-500 to-purple-600',
      'from-blue-500 to-cyan-600',
      'from-green-500 to-emerald-600',
      'from-orange-500 to-red-600',
      'from-pink-500 to-rose-600',
      'from-indigo-500 to-blue-600',
    ]
    const index = email.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Mostrar solo 3 reseñas si no se ha expandido
  const displayedReviews = showAllReviews ? sortedReviews : sortedReviews.slice(0, 3)

  return (
    <div className="space-y-6 relative">
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-fuchsia-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header de Reseñas */}
      <div className={`flex items-center gap-3 transition-all duration-500 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="p-2 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl border border-violet-500/30 shadow-lg shadow-violet-500/10">
          <MessageSquare className="w-6 h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            Reseñas de Clientes
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </h2>
          <p className="text-sm text-slate-400">Opiniones verificadas de compradores</p>
        </div>
      </div>

      {/* Información del producto */}
      {(productName || productCategory || productSubcategory) && (
        <div className={`bg-gradient-to-r from-slate-900/50 to-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 transition-all duration-500 delay-100 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{productName || "Producto"}</h3>
              <div className="flex items-center gap-2 mt-1">
                {productCategory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-300">
                    {productCategory}
                  </span>
                )}
                {productSubcategory && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    {productSubcategory}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de Calificaciones - Compacto */}
      <div className={`grid md:grid-cols-3 gap-4 transition-all duration-500 delay-200 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        {/* Calificación General */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 rounded-full blur-2xl group-hover:blur-xl transition-all"></div>
          <div className="text-center relative z-10">
            <div className="inline-flex items-end gap-1.5 mb-2">
              <span className="text-4xl font-black text-white leading-none">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-xl text-slate-400 pb-1">/5</span>
            </div>
            <div className="flex items-center justify-center gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 transition-all ${
                    i < Math.round(averageRating)
                      ? "fill-amber-400 text-amber-400"
                      : "fill-slate-700 text-slate-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-slate-400">
              {reviews.length} {reviews.length === 1 ? "reseña" : "reseñas"}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex items-center justify-center gap-1.5 text-violet-400">
                <Award className="w-4 h-4" />
                <span className="text-xs font-semibold">Verificada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribución de Calificaciones */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Distribución de calificaciones
          </h3>
          <div className="space-y-2">
            {ratingDistribution.map(({ stars, count, percentage }) => (
              <button
                key={stars}
                onClick={() => setFilterRating(filterRating === stars ? null : stars)}
                className={`w-full flex items-center gap-2 group transition-all ${
                  filterRating === stars ? 'scale-105' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center gap-1 w-12">
                  <span className="text-sm font-medium text-slate-300">{stars}</span>
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </div>
                <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${
                      filterRating === stars 
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500' 
                        : 'bg-gradient-to-r from-amber-400 to-orange-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-400 w-8 text-right">
                  {count}
                </span>
              </button>
            ))}
          </div>
          {filterRating && (
            <button
              onClick={() => setFilterRating(null)}
              className="mt-3 text-sm text-violet-400 hover:text-violet-300 font-medium transition-colors flex items-center gap-1"
            >
              ✕ Limpiar filtro
            </button>
          )}
        </div>
      </div>

      {/* Formulario de Nueva Reseña - Compacto */}
      <div className={`bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-5 shadow-xl transition-all duration-500 delay-300 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl border border-violet-500/30">
              <Send className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Comparte tu experiencia</h3>
              <p className="text-sm text-slate-400">Tu opinión ayuda a otros</p>
            </div>
          </div>
          {!showReviewForm && user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 shadow-lg shadow-violet-500/25"
            >
              Escribir reseña
            </button>
          )}
        </div>
        
        {authLoading ? (
          <div className="text-center py-8">
            <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-slate-400">Verificando...</p>
          </div>
        ) : !user ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center mx-auto border border-violet-500/30">
              <LogIn className="w-8 h-8 text-violet-400" />
            </div>
            <div className="max-w-sm mx-auto">
              <h4 className="text-lg font-bold text-white mb-2">¡Queremos conocer tu opinión!</h4>
              <p className="text-slate-400 text-sm">
                Inicia sesión para compartir tu experiencia
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Link
                href="/inicio"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-bold rounded-lg transition-all hover:scale-105 shadow-lg shadow-violet-500/25"
              >
                <LogIn className="w-4 h-4" />
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-all hover:scale-105"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        ) : showReviewForm ? (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(user.email || '')} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {(user.displayName || user.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">
                  {user.displayName || user.email?.split('@')[0] || 'Usuario'}
                </p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                Calificación
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-all hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-all ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "fill-slate-700 text-slate-700 hover:fill-slate-600"
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-semibold text-amber-400 animate-fade-in">
                    {rating === 5 ? '¡Excelente!' : rating === 4 ? '¡Muy bueno!' : rating === 3 ? 'Bueno' : rating === 2 ? 'Regular' : 'Mejorable'}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-200 mb-2">
                Tu comentario
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onFocus={() => setFocusedField('comment')}
                onBlur={() => setFocusedField(null)}
                placeholder="Comparte tu experiencia con este producto..."
                rows={4}
                maxLength={500}
                className={`w-full px-4 py-3 bg-slate-800 border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none transition-all resize-none ${
                  focusedField === 'comment' 
                    ? 'border-violet-500 ring-2 ring-violet-500/20' 
                    : 'border-slate-700'
                }`}
                required
              />
              <p className={`text-sm font-medium mt-1 ${comment.length >= 10 ? 'text-green-400' : 'text-slate-500'}`}>
                {comment.length} / 500
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowReviewForm(false);
                  setRating(0);
                  setComment('');
                }}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-lg border border-slate-700 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || rating === 0 || comment.trim().length < 10}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/25"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Publicando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Publicar
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">
              Haz clic en &quot;Escribir reseña&quot; para compartir tu opinión
            </p>
          </div>
        )}
      </div>

      {/* Controles de Filtro y Ordenamiento - Compacto */}
      {reviews.length > 0 && (
        <div className={`flex flex-wrap items-center gap-3 transition-all duration-500 delay-400 ${animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-400">Ordenar:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "recent", label: "Recientes", icon: Clock },
              { value: "helpful", label: "Útiles", icon: TrendingUp },
              { value: "rating", label: "Mejor valoradas", icon: Star }
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setSortBy(value as typeof sortBy)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                  sortBy === value
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-500/25"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de Reseñas - Compacta */}
      <div id="reviews-list" className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm text-slate-400">Cargando reseñas...</p>
          </div>
        ) : sortedReviews.length === 0 ? (
          <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {filterRating ? `No hay reseñas con ${filterRating} estrellas` : "Aún no hay reseñas"}
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              {filterRating 
                ? "Prueba con otro filtro para ver más opiniones"
                : "Sé el primero en compartir tu experiencia con este producto"}
            </p>
          </div>
        ) : (
          <>
            {displayedReviews.map((review, index) => (
              <div
                key={review.id}
                className={`bg-slate-900 rounded-xl border border-slate-800 p-5 hover:border-slate-700 transition-all hover:shadow-lg hover:shadow-slate-900/50 ${
                  animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${500 + index * 100}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getAvatarColor(review.userEmail)} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                    {review.userName.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white text-sm truncate">{review.userName}</span>
                          <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full flex-shrink-0">
                            <UserCheck className="w-3 h-3 text-green-500" />
                            <span className="text-xs font-semibold text-green-400">Verificado</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-700 text-slate-700"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mb-4">
                      {review.comment}
                    </p>

                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleHelpful(review.id, review.helpful)}
                        className="flex items-center gap-2 text-xs text-slate-400 hover:text-violet-400 transition-colors group"
                      >
                        <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Útil ({review.helpful})</span>
                      </button>
                      {review.productCategory && (
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <ShoppingBag className="w-3 h-3" />
                          <span>{review.productCategory}</span>
                          {review.productSubcategory && (
                            <>
                              <span>•</span>
                              <span className="text-violet-400">{review.productSubcategory}</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {sortedReviews.length > 3 && (
              <button
                onClick={() => setShowAllReviews(!showAllReviews)}
                className={`w-full px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2 ${
                  animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: `${500 + displayedReviews.length * 100}ms` }}
              >
                {showAllReviews ? (
                  <>
                    Ver menos reseñas
                    <ChevronUp className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Ver todas las reseñas ({sortedReviews.length})
                    <ChevronDown className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}