"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '../lib/firebase'
import { collection, addDoc, doc, updateDoc, query, where, getDocs } from 'firebase/firestore'
import {
  ShoppingBag,
  CreditCard,
  MapPin,
  User,
  Mail,
  Phone,
  Lock,
  CheckCircle,
  AlertCircle,
  Truck,
  Shield,
  ArrowLeft,
  Tag,
  Gift,
  Sparkles,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
}

interface Coupon {
  code: string
  percentage: number
  description: string
}

interface UserData {
  uid: string
  email: string | null
  displayName: string | null
}

// Estructura para almacenar los datos del vendedor antes de guardar la orden
interface SellerInfo {
  id: string | null
  code: string | null
  name: string | null // Nuevo campo
}

export default function CheckoutPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [step, setStep] = useState(1)

  // Formulario de envío
  const [shippingData, setShippingData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    department: '',
    postalCode: '',
    notes: ''
  })

  // Cupón
  const [couponCode, setCouponCode] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const [couponError, setCouponError] = useState('')

  // Código de vendedor
  const [sellerCode, setSellerCode] = useState('')
  // Ahora almacenamos más info del vendedor aplicado
  const [appliedSellerInfo, setAppliedSellerInfo] = useState<SellerInfo>({ id: null, code: null, name: null }) 
  const [sellerCodeError, setSellerCodeError] = useState('')
  const [sellerCodeLoading, setSellerCodeLoading] = useState(false)

  // AJUSTE: Cargar el nombre del vendedor si el código es válido
  const applySellerCode = async () => {
    setSellerCodeError('')
    setSellerCodeLoading(true)
    setAppliedSellerInfo({ id: null, code: null, name: null }) // Resetear info

    if (!sellerCode.trim()) {
      setSellerCodeError('Ingresa un código de vendedor')
      setSellerCodeLoading(false)
      return
    }

    try {
      const codeToSearch = sellerCode.trim().toUpperCase()
      const usersRef = collection(db, 'users')
      // Buscamos el vendedor por el referralCode
      const q = query(usersRef, where('referralCode', '==', codeToSearch)) 
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        const sellerDoc = querySnapshot.docs[0]
        const sellerData = sellerDoc.data() as Record<string, unknown>
        
        // Asumiendo que el campo es 'uid'
        if (sellerData.uid === user?.uid) { 
          setSellerCodeError('No puedes usar tu propio código')
          setSellerCodeLoading(false)
          return
        }
        
        // 🔥 AJUSTE CLAVE 1: Obtenemos el nombre y guardamos toda la info
        const sellerName =
  (sellerData.name as string) ||
  (sellerData.displayName as string) ||
  (sellerData.email as string) ||
  codeToSearch

        
        setAppliedSellerInfo({
          id: sellerDoc.id, // El ID del documento en 'users'
          code: codeToSearch,
          name: sellerName
        })
        setSellerCode('')
        setSellerCodeError('') // Limpiar errores en caso de éxito
      } else {
        setSellerCodeError('Código de vendedor no válido')
      }
    } catch (err) {
      console.error('Error al validar código de vendedor:', err)
      setSellerCodeError('Error al validar código de vendedor')
    } finally {
      setSellerCodeLoading(false)
    }
  }


  // (Resto de useEffects y funciones sin cambios...)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName
        })
        loadCart()
        setShippingData(prev => ({
          ...prev,
          email: currentUser.email || '',
          fullName: currentUser.displayName || ''
        }))
      } else {
        router.push('/inicio')
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')) {
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.wompi.co/widget.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[src="https://checkout.wompi.co/widget.js"]')
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript)
      }
    }
  }, [])

  const loadCart = async () => {
    try {
      const savedCart = localStorage.getItem('cart')
      if (savedCart) {
        setCartItems(JSON.parse(savedCart))
      }
    } catch (err) {
      console.error('Error loading cart:', err)
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 100000 ? 0 : 12000
  const discount = appliedCoupon ? (subtotal * appliedCoupon.percentage) / 100 : 0
  const total = subtotal + shipping - discount

  const applyCoupon = async () => {
    setCouponError('')
    if (!couponCode.trim()) {
      setCouponError('Ingresa un código de cupón')
      return
    }

    try {
      if (couponCode.toUpperCase() === 'DESCUENTO10') {
        setAppliedCoupon({
          code: couponCode,
          percentage: 10,
          description: '10% de descuento'
        })
        setCouponCode('')
      } else {
        setCouponError('Cupón inválido o expirado')
      }
    } catch {
      setCouponError('Error al validar cupón')
    }
  }

  const validateForm = () => {
    const { fullName, email, phone, address, city, department } = shippingData
    if (!fullName || !email || !phone || !address || !city || !department) {
      alert('Por favor completa todos los campos obligatorios')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      alert('Por favor ingresa un email válido')
      return false
    }

    const phoneRegex = /^[0-9]{10}$/
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      alert('Por favor ingresa un teléfono válido (10 dígitos)')
      return false
    }

    return true
  }

  // Procesar pago con Wompi
  const processPayment = async () => {
    if (!validateForm()) return
    setProcessing(true)

    try {
      // Los datos de sellerId, sellerCode y sellerName ya están pre-cargados en appliedSellerInfo

      const orderData = {
        userId: user?.uid,
        items: cartItems,
        shipping: shippingData,
        subtotal,
        shippingCost: shipping,
        discount,
        total,
        coupon: appliedCoupon?.code || null,
        // 🔥 AJUSTE CLAVE 2: Guardar la información del vendedor pre-cargada
        sellerCode: appliedSellerInfo.code, 
        sellerId: appliedSellerInfo.id,
        sellerName: appliedSellerInfo.name, // 🔥 ESTO ES LO QUE QUERÍAS
        // -------------------------------------------------------------
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData)
      const orderId = orderRef.id

      const wompiData = {
        currency: 'COP',
        amountInCents: Math.round(total * 100),
        reference: orderId,
        publicKey: 'pub_test_tu_llave_publica_de_wompi',
        redirectUrl: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
        customerData: {
          email: shippingData.email,
          fullName: shippingData.fullName,
          phoneNumber: shippingData.phone
        },
        shippingAddress: {
          addressLine1: shippingData.address,
          city: shippingData.city,
          region: shippingData.department,
          country: 'CO',
          postalCode: shippingData.postalCode || '000000'
        }
      }

      const checkout = new (window as unknown as { WidgetCheckout: new (config: Record<string, unknown>) => { open: (cb: (r: { transaction?: { status: string; id: string } }) => void) => void } }).WidgetCheckout({
        ...wompiData
      })

      checkout.open(async (result: { transaction?: { status: string; id: string } }) => {
        if (result.transaction?.status === 'APPROVED') {
          const orderUpdate: Record<string, unknown> = {
            status: 'paid',
            transactionId: result.transaction.id,
            paymentDate: new Date().toISOString()
          }

          if (appliedSellerInfo.code) {
            orderUpdate.sellerCode = appliedSellerInfo.code
            orderUpdate.sellerId = appliedSellerInfo.id
            orderUpdate.sellerName = appliedSellerInfo.name // Actualizar por si acaso
          }

          await updateDoc(doc(db, 'orders', orderId), orderUpdate)

          // Puntos vendedor
          if (appliedSellerInfo.code) {
            try {
              // Ya tenemos el ID del vendedor en appliedSellerInfo.id
              const sellerDocRef = doc(db, 'users', appliedSellerInfo.id as string) 
              const sellerDoc = await (await getDocs(query(collection(db, 'users'), where('referralCode', '==', appliedSellerInfo.code)))).docs[0]; // Se puede optimizar usando solo el doc(db, 'users', appliedSellerInfo.id) si se carga desde el inicio. Aquí mantenemos el query para seguridad.

              if (sellerDoc) {
                const sellerData = sellerDoc.data()
                const pointsToAdd = Math.round(total * 0.1)

                await updateDoc(sellerDocRef, {
                  points: (sellerData.points || 0) + pointsToAdd,
                  salesCount: (sellerData.salesCount || 0) + 1,
                  totalEarnings: (sellerData.totalEarnings || 0) + pointsToAdd
                })
              }
            } catch (err) {
              console.error('Error al otorgar puntos al vendedor:', err)
            }
          }

          localStorage.removeItem('cart')
          router.push(`/order-confirmation?orderId=${orderId}`)
        }
      })
    } catch (err) {
      console.error('Error processing payment:', err)
      alert('Error al procesar el pago. Por favor intenta de nuevo.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-ash">Cargando checkout...</p>
        </div>
      </div>
    )
  }

    return (
      <div className="min-h-screen bg-ink">
        {/* Header */}
        <div className="bg-surface/50 border-b border-line sticky top-0 z-50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/carrito" className="flex items-center gap-2 text-ash hover:text-bone transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">Volver al carrito</span>
              </Link>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm font-semibold text-green-400">Pago Seguro</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center gap-4 max-w-2xl mx-auto">
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= 1 ? 'bg-gold text-ink' : 'bg-elevated text-ash/70'
                }`}>
                  {step > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
                </div>
                <span className={`font-semibold transition-colors ${
                  step >= 1 ? 'text-bone' : 'text-ash/70'
                }`}>Información</span>
              </div>
              <div className={`flex-1 h-1 rounded-full transition-colors ${
                step >= 2 ? 'bg-gold' : 'bg-elevated'
              }`}></div>
              <div className="flex items-center gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= 2 ? 'bg-gold text-ink' : 'bg-elevated text-ash/70'
                }`}>
                  2
                </div>
                <span className={`font-semibold transition-colors ${
                  step >= 2 ? 'text-bone' : 'text-ash/70'
                }`}>Pago</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {step === 1 ? (
                <>
                  {/* Información de Envío */}
                  <div className="bg-surface rounded-2xl border border-line p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gold/10 rounded-lg">
                        <MapPin className="w-5 h-5 text-gold" />
                      </div>
                      <h2 className="text-xl font-black text-bone">Información de Envío</h2>
                    </div>

                    <div className="space-y-4">
                      {/* Nombre completo */}
                      <div>
                        <label className="block text-sm font-bold text-bone mb-2">
                          Nombre completo *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ash/70" />
                          <input
                            type="text"
                            value={shippingData.fullName}
                            onChange={(e) => setShippingData({...shippingData, fullName: e.target.value})}
                            placeholder="Juan Pérez"
                            className="w-full pl-11 pr-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                            required
                          />
                        </div>
                      </div>

                      {/* Email y Teléfono */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-bone mb-2">
                            Email *
                          </label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ash/70" />
                            <input
                              type="email"
                              value={shippingData.email}
                              onChange={(e) => setShippingData({...shippingData, email: e.target.value})}
                              placeholder="correo@ejemplo.com"
                              className="w-full pl-11 pr-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-bone mb-2">
                            Teléfono *
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-ash/70" />
                            <input
                              type="tel"
                              value={shippingData.phone}
                              onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                              placeholder="3001234567"
                              className="w-full pl-11 pr-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Dirección */}
                      <div>
                        <label className="block text-sm font-bold text-bone mb-2">
                          Dirección de envío *
                        </label>
                        <input
                          type="text"
                          value={shippingData.address}
                          onChange={(e) => setShippingData({...shippingData, address: e.target.value})}
                          placeholder="Calle 123 #45-67, Apartamento 801"
                          className="w-full px-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                          required
                        />
                      </div>

                      {/* Ciudad, Departamento y Código Postal */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-bone mb-2">
                            Ciudad *
                          </label>
                          <input
                            type="text"
                            value={shippingData.city}
                            onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                            placeholder="Medellín"
                            className="w-full px-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-bone mb-2">
                            Departamento *
                          </label>
                          <input
                            type="text"
                            value={shippingData.department}
                            onChange={(e) => setShippingData({...shippingData, department: e.target.value})}
                            placeholder="Antioquia"
                            className="w-full px-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-bone mb-2">
                            Código Postal
                          </label>
                          <input
                            type="text"
                            value={shippingData.postalCode}
                            onChange={(e) => setShippingData({...shippingData, postalCode: e.target.value})}
                            placeholder="050001"
                            className="w-full px-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                          />
                        </div>
                      </div>

                      {/* Notas adicionales */}
                      <div>
                        <label className="block text-sm font-bold text-bone mb-2">
                          Notas adicionales (opcional)
                        </label>
                        <textarea
                          value={shippingData.notes}
                          onChange={(e) => setShippingData({...shippingData, notes: e.target.value})}
                          placeholder="Instrucciones de entrega, punto de referencia, etc."
                          rows={3}
                          className="w-full px-4 py-3 bg-elevated border border-line rounded-xl text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Método de Envío */}
                  <div className="bg-surface rounded-2xl border border-line p-6 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gold/10 rounded-lg">
                        <Truck className="w-5 h-5 text-gold" />
                      </div>
                      <h2 className="text-xl font-black text-bone">Método de Envío</h2>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 bg-elevated/50 rounded-xl border-2 border-gold">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full border-4 border-gold bg-gold"></div>
                            <div>
                              <p className="font-bold text-bone">Envío Estándar</p>
                              <p className="text-xs text-ash">Entrega en 3-5 días hábiles</p>
                            </div>
                          </div>
                          <span className="font-bold text-bone">
                            {shipping === 0 ? '¡GRATIS!' : `$${shipping.toLocaleString()}`}
                          </span>
                        </div>
                        {shipping === 0 && (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                            <Gift className="w-4 h-4 text-green-400" />
                            <span className="text-xs font-semibold text-green-400">
                              Envío gratis en compras mayores a $100.000
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Paso 2: Pago */
                <div className="bg-surface rounded-2xl border border-line p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-gold/10 rounded-lg">
                      <CreditCard className="w-5 h-5 text-gold" />
                    </div>
                    <h2 className="text-xl font-black text-bone">Método de Pago</h2>
                  </div>

                  <div className="text-center py-12 space-y-4">
                    <div className="w-20 h-20 bg-gold/10 rounded-2xl flex items-center justify-center mx-auto border-2 border-gold/30">
                      <Lock className="w-10 h-10 text-gold" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-bone mb-2">Pago Seguro con Wompi</h3>
                      <p className="text-sm text-ash max-w-md mx-auto">
                        Acepta tarjetas de crédito, débito, PSE y más. Tus datos están protegidos.
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-4 pt-4">
                      <Image src="/visa.svg" alt="Visa" width={32} height={32} className="opacity-70" />
                      <Image src="/mastercard.svg" alt="Mastercard" width={32} height={32} className="opacity-70" />
                      <Image src="/pse.svg" alt="PSE" width={32} height={32} className="opacity-70" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Resumen */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-2xl border border-line p-6 shadow-xl sticky top-24">
                <div className="flex items-center gap-2 mb-6">
                  <ShoppingBag className="w-5 h-5 text-gold" />
                  <h3 className="text-lg font-black text-bone">Resumen de Compra</h3>
                </div>

                {/* Productos */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 p-3 bg-elevated/50 rounded-lg">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 object-cover rounded-lg"
                        unoptimized
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-bone truncate">{item.name}</p>
                        <p className="text-xs text-ash">Cantidad: {item.quantity}</p>
                        <p className="text-sm font-bold text-gold mt-1">
                          ${(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cupón de descuento */}
                <div className="mb-6 p-4 bg-elevated/50 rounded-xl border border-line">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gold" />
                    <span className="text-sm font-bold text-bone">Cupón de descuento</span>
                  </div>
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-400">{appliedCoupon.code}</span>
                      </div>
                      <button
                        onClick={() => setAppliedCoupon(null)}
                        className="text-xs text-ash hover:text-bone transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => {
                            setCouponCode(e.target.value)
                            setCouponError('')
                          }}
                          placeholder="Código de cupón"
                          className="flex-1 px-3 py-2 bg-elevated border border-line rounded-lg text-sm text-bone placeholder-ash/70 focus:outline-none focus:border-gold transition-all"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-4 py-2 bg-gold hover:bg-gold-soft text-ink text-sm font-semibold rounded-lg transition-all"
                        >
                          Aplicar
                        </button>
                      </div>
                      {couponError && (
                        <div className="flex items-center gap-2 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          {couponError}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Código de vendedor */}
                <div className="mb-6 p-4 bg-gold/10 border border-gold/20 rounded-xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span className="text-sm font-bold text-gold-soft">¿Te vendió alguien?</span>
                  </div>
                  {appliedSellerInfo.code ? (
                    <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <div>
                          {/* Muestra el nombre del vendedor si está disponible */}
                          <span className="text-sm font-semibold text-green-400">{appliedSellerInfo.name}</span> 
                          <p className="text-xs text-green-300 mt-0.5">
                            El vendedor ganará {Math.round(total * 0.1).toLocaleString()} puntos
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setAppliedSellerInfo({ id: null, code: null, name: null })}
                        className="text-xs text-ash hover:text-bone transition-colors"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={sellerCode}
                          onChange={(e) => {
                            setSellerCode(e.target.value.toUpperCase())
                            setSellerCodeError('')
                          }}
                          placeholder="Código de vendedor"
                          className="flex-1 px-3 py-2 bg-elevated border border-line rounded-lg text-sm text-bone placeholder-ash/70 focus:outline-none focus:border-gold transition-all font-semibold tracking-wider"
                        />
                        <button
                          onClick={applySellerCode}
                          disabled={sellerCodeLoading}
                          className="px-4 py-2 bg-gold hover:bg-gold-soft text-ink text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {sellerCodeLoading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            'Aplicar'
                          )}
                        </button>
                      </div>
                      {sellerCodeError && (
                        <div className="flex items-center gap-2 text-xs text-red-400">
                          <AlertCircle className="w-3 h-3" />
                          {sellerCodeError}
                        </div>
                      )}
                      <p className="text-xs text-gold/70 mt-2">
                        Si alguien te vendió este producto, ingresa su código y ganará el 10% en puntos
                      </p>
                    </div>
                  )}
                </div>

                {/* Totales */}
                <div className="border-t border-line pt-6 space-y-3">
                  <div className="flex justify-between text-bone/80">
                    <span className="text-sm">Subtotal</span>
                    <span className="font-semibold">${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-bone/80">
                    <span className="text-sm">Envío</span>
                    <span className="font-semibold text-green-400">
                      {shipping === 0 ? 'GRATIS' : `$${shipping.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-red-400">
                    <span className="text-sm font-semibold">Descuento (Cupón)</span>
                    <span className="font-bold">-${discount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-4 border-t border-line/50">
                    <span className="text-lg font-black text-bone">Total a Pagar</span>
                    <span className="text-xl font-black text-gold">${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Botón de navegación / pago */}
                <div className="mt-8">
                  {step === 1 ? (
                    <button
                      onClick={() => {
                        if (validateForm()) {
                          setStep(2)
                          window.scrollTo(0, 0) // Subir al inicio de la página
                        }
                      }}
                      className="w-full py-3 bg-gold hover:bg-gold-soft text-ink text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      disabled={cartItems.length === 0}
                    >
                      <CreditCard className="w-5 h-5" />
                      Continuar al Pago
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={processPayment}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-bone text-lg font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        disabled={processing || cartItems.length === 0}
                      >
                        {processing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Procesando Pago...
                          </>
                        ) : (
                          <>
                            <Lock className="w-5 h-5" />
                            Pagar de forma segura (${total.toLocaleString()})
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setStep(1)}
                        className="w-full py-2 text-sm text-ash hover:text-bone transition-colors"
                        disabled={processing}
                      >
                        ← Volver a Información de Envío
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
}