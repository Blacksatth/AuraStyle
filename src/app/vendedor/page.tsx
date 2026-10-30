"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase/client"
import { onAuthStateChanged, type User } from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Gift,
  Share2,
  Copy,
  CheckCircle,
  Users,
  Calendar,
  Award,
  Sparkles,
  Target,
  Trophy,
  Wallet,
  Star,
  Flame,
} from "lucide-react"

interface SaleData {
  id: string
  productName: string
  buyer: string
  amount: number
  commission: number
  date: string
  createdAt: string
  status: "credited" | "pending"
}

interface OrderItem {
  name?: string
}

interface ShippingInfo {
  fullName?: string
}

interface OrderData {
  total?: number
  status?: string
  createdAt: string
  items?: OrderItem[]
  shipping?: ShippingInfo
}

interface UserData {
  uid?: string
  name?: string
  email?: string
  role?: string
  referralCode?: string
  points?: number
  salesCount?: number
  totalEarnings?: number
  createdAt?: string
}

export default function SellerDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    points: 0,
    totalEarnings: 0,
    salesCount: 0,
    referralCode: "",
    pendingCommissions: 0,
    thisMonthSales: 0,
    totalReferrals: 0,
  })

  const [copied, setCopied] = useState(false)
  const [recentSales, setRecentSales] = useState<SaleData[]>([])
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  // Calcular progreso hacia el bono
  const bonusTarget = 8
  const bonusAmount = 10000
  const salesProgress = Math.min((stats.salesCount / bonusTarget) * 100, 100)
  const salesToBonus = Math.max(bonusTarget - stats.salesCount, 0)
  const canWithdraw = stats.totalEarnings >= 20000

  const referralUrl =
    typeof window !== "undefined" ? `${window.location.origin}/checkout?ref=${stats.referralCode}` : ""

  const copyReferralLink = () => {
    if (referralUrl) {
      navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const copyCode = () => {
    if (stats.referralCode) {
      navigator.clipboard.writeText(stats.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const generateReferralCode = (email: string): string => {
    const namePart = email
      .split("@")[0]
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
    const random = Math.floor(1000 + Math.random() * 9000)
    return `${namePart.slice(0, 4)}${random}`
  }

  const loadUserData = useCallback(async (userId: string, currentUser: User) => {
    try {
      const userDocRef = doc(db, "users", userId)
      const userDoc = await getDoc(userDocRef)

      let userData: UserData = {
        points: 0,
        salesCount: 0,
        totalEarnings: 0,
      }
      let referralCode = ""

      if (userDoc.exists()) {
        userData = userDoc.data() as UserData
        referralCode = userData.referralCode || ""

        if (!referralCode && currentUser) {
          referralCode = generateReferralCode(currentUser.email || "USER")

          await updateDoc(userDocRef, {
            referralCode: referralCode,
            role: userData.role || "seller",
            points: userData.points || 0,
            salesCount: userData.salesCount || 0,
            totalEarnings: userData.totalEarnings || 0,
          })

          userData.referralCode = referralCode
        }
      } else {
        if (currentUser) {
          referralCode = generateReferralCode(currentUser.email || "USER")
          userData = {
            uid: userId,
            name: currentUser.displayName || "",
            email: currentUser.email || "",
            role: "seller",
            referralCode: referralCode,
            points: 0,
            salesCount: 0,
            totalEarnings: 0,
            createdAt: new Date().toISOString(),
          }

          await setDoc(userDocRef, userData)
        }
      }

      if (!referralCode) {
        setStats({
          points: 0,
          totalEarnings: 0,
          salesCount: 0,
          referralCode: "",
          pendingCommissions: 0,
          thisMonthSales: 0,
          totalReferrals: 0,
        })
        return
      }

      const ordersRef = collection(db, "orders")
      const allOrdersQuery = query(ordersRef, where("sellerCode", "==", referralCode))
      const allOrdersSnapshot = await getDocs(allOrdersQuery)

      let totalEarnings = 0
      let pendingCommissions = 0
      let thisMonthSales = 0
      const currentMonth = new Date().getMonth()
      const currentYear = new Date().getFullYear()

      const allSales: SaleData[] = []
      allOrdersSnapshot.forEach((docSnap) => {
        const orderData = docSnap.data() as OrderData
        const orderDate = new Date(orderData.createdAt)
        const commission = Math.round((orderData.total || 0) * 0.1)

        if (orderData.status === "paid") {
          totalEarnings += commission
        } else {
          pendingCommissions += commission
        }

        if (orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
          thisMonthSales++
        }

        const firstItem = orderData.items?.[0]
        const productName = firstItem?.name || "Producto"

        allSales.push({
          id: docSnap.id,
          productName:
            orderData.items?.length && orderData.items.length > 1
              ? `${productName} y ${orderData.items.length - 1} más`
              : productName,
          buyer: orderData.shipping?.fullName || "Cliente",
          amount: orderData.total || 0,
          commission: commission,
          date: orderDate.toLocaleDateString("es-CO"),
          createdAt: orderData.createdAt,
          status: orderData.status === "paid" ? "credited" : "pending",
        })
      })

      const recentSalesData = allSales
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)

      setStats({
        points: userData.points || 0,
        totalEarnings: userData.totalEarnings || totalEarnings,
        salesCount: userData.salesCount || allOrdersSnapshot.size,
        referralCode: referralCode,
        pendingCommissions: pendingCommissions,
        thisMonthSales: thisMonthSales,
        totalReferrals: allOrdersSnapshot.size,
      })

      setRecentSales(recentSalesData)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        await loadUserData(currentUser.uid, currentUser)
      } else {
        router.push("/login")
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [router, loadUserData])

  const handleWithdraw = () => {
    setShowWithdrawModal(true)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Cargando tu panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3 sm:p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/30 animate-pulse">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                  ¡Hola, {user?.displayName?.split(" ")[0] || "Vendedor"}! 👋
                </h1>
                <p className="text-sm sm:text-base text-slate-400">Sigue vendiendo y gana increíbles recompensas</p>
              </div>
            </div>

            {/* Botón de retiro responsive */}
            <button
              onClick={handleWithdraw}
              disabled={!canWithdraw}
              className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all text-sm sm:text-base whitespace-nowrap ${
                canWithdraw
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:scale-105 shadow-lg shadow-green-500/30 animate-pulse"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
              }`}
            >
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Retirar Puntos</span>
              <span className="sm:hidden">Retirar</span>
            </button>
          </div>

          {/* Banner motivacional de bono - responsive */}
          {salesToBonus > 0 && (
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 border-2 border-amber-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-orange-500/10 animate-pulse"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center animate-bounce shrink-0">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
                        🎯 ¡Bono Especial!
                      </h3>
                      <p className="text-xs sm:text-sm text-amber-200">
                        Cerca de ganar {bonusAmount.toLocaleString()} puntos
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                      {stats.salesCount}/{bonusTarget}
                    </div>
                    <p className="text-xs sm:text-sm text-amber-300">ventas</p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="relative">
                  <div className="h-3 sm:h-4 bg-slate-900/50 rounded-full overflow-hidden backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out relative"
                      style={{ width: `${salesProgress}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs font-bold text-amber-300">
                      {salesToBonus > 0
                        ? `¡Solo ${salesToBonus} ${salesToBonus === 1 ? "venta" : "ventas"} más!`
                        : "¡Bono desbloqueado! 🎉"}
                    </span>
                    <span className="text-xs font-bold text-amber-300">{Math.round(salesProgress)}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mensaje de celebración al alcanzar el bono */}
          {stats.salesCount >= bonusTarget && (
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 animate-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center animate-bounce shrink-0">
                  <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-black text-white mb-1">🎉 ¡Felicitaciones!</h3>
                  <p className="text-sm sm:text-base text-green-200">
                    Has ganado tu bono de {bonusAmount.toLocaleString()} puntos. ¡Sigue así!
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 md:mb-8">
          {/* Puntos Totales con animación */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-violet-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Gift className="w-4 h-4 sm:w-6 sm:h-6 text-violet-400" />
              </div>
              <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-violet-500/10 border border-violet-500/30 rounded-full">
                <span className="text-[10px] sm:text-xs font-bold text-violet-400">Acumulados</span>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                {stats.points.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Puntos Totales</p>
            </div>
          </div>

          {/* Ganancias Disponibles */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl hover:scale-105 transition-transform duration-300 relative overflow-hidden">
            {canWithdraw && (
              <div className="absolute top-2 right-2">
                <div className="animate-ping absolute inline-flex h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-green-400 opacity-75"></div>
                <div className="relative inline-flex rounded-full h-2 w-2 sm:h-3 sm:w-3 bg-green-500"></div>
              </div>
            )}
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div
                className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${canWithdraw ? "bg-green-500/20 border border-green-500/50 animate-pulse" : "bg-green-500/10 border border-green-500/30"}`}
              >
                <span className="text-[10px] sm:text-xs font-bold text-green-400">
                  {canWithdraw ? "¡Listo!" : "Acumulando"}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                {stats.totalEarnings.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {canWithdraw ? "Listo para retirar" : `${(20000 - stats.totalEarnings).toLocaleString()} pts`}
              </p>
            </div>
          </div>

          {/* Ventas con flame */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <span className="text-[10px] sm:text-xs font-bold text-blue-400 flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span className="hidden sm:inline">Mes:</span> {stats.thisMonthSales}
                </span>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                {stats.salesCount}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Ventas Totales</p>
            </div>
          </div>

          {/* Referencias */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl hover:scale-105 transition-transform duration-300">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-orange-500/10 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-orange-500/10 border border-orange-500/30 rounded-full">
                <span className="text-[10px] sm:text-xs font-bold text-orange-400">Activos</span>
              </div>
            </div>
            <div>
              <p className="text-xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">
                {stats.totalReferrals}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">Referidos</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Link de referido */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">Tu Link de Referido</h2>
              </div>

              <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 rounded-xl p-4 sm:p-6 border-2 border-violet-500/50 mb-4 shadow-lg shadow-violet-500/20">
                <div className="text-center mb-3 sm:mb-4">
                  <p className="text-xs sm:text-sm font-bold text-violet-300 mb-2">🎯 TU CÓDIGO DE VENDEDOR</p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                    <span className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 tracking-widest">
                      {stats.referralCode || "CARGANDO..."}
                    </span>
                    <button
                      onClick={copyCode}
                      className={`p-2 sm:p-3 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                        copied
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-violet-600 hover:bg-violet-700 text-white border border-violet-500 hover:scale-110"
                      }`}
                      title="Copiar código"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-2 sm:mt-3 px-2">
                    Tus clientes deben ingresar este código en el checkout para que recibas la comisión
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/50 rounded-xl p-3 sm:p-4 border border-slate-700 mb-3 sm:mb-4">
                <div className="mb-2 sm:mb-3">
                  <p className="text-xs sm:text-sm font-bold text-slate-300 mb-2">🔗 O comparte tu link directo:</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={referralUrl}
                    readOnly
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-xs sm:text-sm"
                    placeholder="Link de referido"
                  />
                  <button
                    onClick={copyReferralLink}
                    className={`px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap ${
                      copied
                        ? "bg-green-500/20 text-green-400 border border-green-500/30"
                        : "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600"
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">¡Copiado!</span>
                        <span className="sm:hidden">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        Copiar
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 mt-2">
                  Este link ya incluye tu código automáticamente
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="p-2 sm:p-3 bg-violet-500/10 border border-violet-500/30 rounded-lg text-center hover:scale-105 transition-transform">
                  <p className="text-lg sm:text-2xl font-black text-violet-400">10%</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Comisión</p>
                </div>
                <div className="p-2 sm:p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-center hover:scale-105 transition-transform">
                  <p className="text-lg sm:text-2xl font-black text-green-400">∞</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Sin límite</p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg text-center hover:scale-105 transition-transform">
                  <p className="text-lg sm:text-2xl font-black text-blue-400">24h</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Tracking</p>
                </div>
              </div>
            </div>

            {/* Ventas Recientes */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white">Ventas Recientes</h2>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                {recentSales.length > 0 ? (
                  recentSales.map((sale, index) => (
                    <div
                      key={sale.id}
                      className="p-3 sm:p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-all hover:scale-[1.02]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm sm:text-base truncate">{sale.productName}</p>
                          <p className="text-xs sm:text-sm text-slate-400 truncate">Comprador: {sale.buyer}</p>
                        </div>
                        <div
                          className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shrink-0 self-start sm:self-auto ${
                            sale.status === "credited"
                              ? "bg-green-500/10 text-green-400 border border-green-500/30"
                              : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/30"
                          }`}
                        >
                          {sale.status === "credited" ? "✓ Acreditado" : "⏱ Pendiente"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                          <span className="text-slate-400">{sale.date}</span>
                          <span className="text-white font-semibold">${sale.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2">
                          <span className="text-[10px] sm:text-xs text-slate-400">Puntos:</span>
                          <span className="text-base sm:text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
                            +{sale.commission.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm sm:text-base text-slate-400">Aún no tienes ventas registradas</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Comparte tu código para comenzar a ganar puntos
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Comisiones Pendientes */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">Pendientes</h3>
              </div>
              <div className="text-center py-3 sm:py-4">
                <p className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                  {stats.pendingCommissions.toLocaleString()}
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-2">
                  Puntos pendientes (se acreditan al confirmar el pago)
                </p>
              </div>
            </div>

            {/* Tips para vender más */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-500/10 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-violet-400" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">Tips</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="p-2.5 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:scale-105 transition-transform cursor-pointer">
                  <p className="text-xs sm:text-sm font-semibold text-white mb-1">🎯 Comparte en redes</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Instagram, WhatsApp, TikTok</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:scale-105 transition-transform cursor-pointer">
                  <p className="text-xs sm:text-sm font-semibold text-white mb-1">💬 Crea contenido</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Reseñas, unboxings, fotos</p>
                </div>
                <div className="p-2.5 sm:p-3 bg-slate-800/50 rounded-lg border border-slate-700 hover:scale-105 transition-transform cursor-pointer">
                  <p className="text-xs sm:text-sm font-semibold text-white mb-1">🎁 Ofrece valor</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">Consejos de estilo, combos</p>
                </div>
              </div>
            </div>

            {/* Ranking */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500/10 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">Tu Ranking</h3>
              </div>
              <div className="text-center py-3 sm:py-4">
                <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 mb-2">
                  #7
                </p>
                <p className="text-xs sm:text-sm text-slate-400 mb-3 sm:mb-4">De 150 vendedores activos</p>
                <div className="p-2.5 sm:p-3 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg">
                  <p className="text-[10px] sm:text-xs font-bold text-orange-400">🔥 ¡Sigue así! Estás en el top 10%</p>
                </div>
              </div>
            </div>

            {/* Meta del mes */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white">Meta del Mes</h3>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-400">Ventas este mes</span>
                  <span className="text-xs sm:text-sm font-bold text-white">{stats.thisMonthSales}/15</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min((stats.thisMonthSales / 15) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500">
                  {stats.thisMonthSales >= 15
                    ? "🎉 ¡Meta alcanzada! Increíble trabajo"
                    : `${15 - stats.thisMonthSales} ventas más para alcanzar tu meta`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-bounce">
                <Wallet className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Solicitar Retiro</h3>
              <p className="text-slate-400 text-xs sm:text-sm">Retira tus puntos ganados</p>
            </div>

            <div className="bg-slate-800/50 rounded-xl p-4 sm:p-6 border border-slate-700 mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs sm:text-sm text-slate-400">Puntos disponibles:</span>
                <span className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  {stats.totalEarnings.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-slate-500">Mínimo para retirar:</span>
                <span className="text-slate-300 font-semibold">20,000 pts</span>
              </div>
            </div>

            {canWithdraw ? (
              <>
                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <input
                    type="text"
                    placeholder="Nombre completo"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <select className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20">
                    <option value="">Método de pago</option>
                    <option value="bank">Transferencia bancaria</option>
                    <option value="nequi">Nequi</option>
                    <option value="daviplata">Daviplata</option>
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all border border-slate-700"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      alert("¡Solicitud de retiro enviada! Te contactaremos pronto.")
                      setShowWithdrawModal(false)
                    }}
                    className="w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-sm font-semibold hover:scale-105 transition-all shadow-lg shadow-green-500/30"
                  >
                    Solicitar
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                  <p className="text-amber-300 text-xs sm:text-sm text-center">
                    Necesitas al menos 20,000 puntos para retirar.
                    <br /> 
                    <span className="font-bold">
                      ¡Te faltan {(20000 - stats.totalEarnings).toLocaleString()} puntos!
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-700 transition-all border border-slate-700"
                >
                  Entendido
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
