"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "../lib/firebase"
import { onAuthStateChanged, type User } from "firebase/auth"
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore"
import {
  ShoppingBag,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react"

/* =======================
   Interfaces
======================= */

interface SaleData {
  id: string
  productName: string
  buyer: string
  sellerName: string
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

/* =======================
   Component
======================= */

export default function ProfessionalSalesDashboard() {
  const router = useRouter()

  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const [sales, setSales] = useState<SaleData[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "credited" | "pending">("all")
  const [sortBy, setSortBy] = useState<"date" | "amount" | "commission">("date")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const [stats, setStats] = useState({
    totalSales: 0,
    totalEarnings: 0,
    pendingCommissions: 0,
    thisMonthSales: 0,
    thisMonthEarnings: 0,
  })

  /* =======================
     Load sales
  ======================= */

  const loadSalesData = useCallback(async (userId: string, currentUser: User) => {
    try {
      const userRef = doc(db, "users", userId)
      const userSnap = await getDoc(userRef)

      let referralCode = userSnap.data()?.referralCode

      if (!referralCode && currentUser.email) {
        referralCode =
          currentUser.email.split("@")[0].slice(0, 4).toUpperCase() +
          Math.floor(1000 + Math.random() * 9000)
        await updateDoc(userRef, { referralCode })
      }

      if (!referralCode) return

      const q = query(
        collection(db, "orders"),
        where("sellerCode", "==", referralCode)
      )

      const snapshot = await getDocs(q)

      let totalEarnings = 0
      let pendingCommissions = 0
      let thisMonthSales = 0
      let thisMonthEarnings = 0

      const now = new Date()
      const month = now.getMonth()
      const year = now.getFullYear()

      const salesList: SaleData[] = []

      snapshot.forEach((docSnap) => {
        const order = docSnap.data() as OrderData
        const dateObj = new Date(order.createdAt)
        const commission = Math.round((order.total || 0) * 0.1)

        const credited = order.status === "paid"

        if (credited) {
          totalEarnings += commission
          if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
            thisMonthEarnings += commission
          }
        } else {
          pendingCommissions += commission
        }

        if (dateObj.getMonth() === month && dateObj.getFullYear() === year) {
          thisMonthSales++
        }

        const firstItem = order.items?.[0]?.name || "Producto"
        const productName =
          order.items && order.items.length > 1
            ? `${firstItem} +${order.items.length - 1} más`
            : firstItem

        salesList.push({
          id: docSnap.id,
          productName,
          buyer: order.shipping?.fullName || "Cliente",
          sellerName: currentUser.displayName || "Vendedor",
          amount: order.total || 0,
          commission,
          date: dateObj.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          createdAt: order.createdAt,
          status: credited ? "credited" : "pending",
        })
      })

      salesList.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      setSales(salesList)
      setStats({
        totalSales: snapshot.size,
        totalEarnings,
        pendingCommissions,
        thisMonthSales,
        thisMonthEarnings,
      })
    } catch (err) {
      console.error(err)
    }
  }, [])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/inicio")
        return
      }
      setUser(currentUser)
      await loadSalesData(currentUser.uid, currentUser)
      setLoading(false)
    })

    return () => unsub()
  }, [router, loadSalesData])

  /* =======================
     Filter + Sort
  ======================= */

  const filteredSales = useMemo(() => {
    const result = sales.filter((sale) => {
      const text = `${sale.productName} ${sale.buyer} ${sale.sellerName} ${sale.id} ${sale.amount} ${sale.commission}`.toLowerCase()

      const matchesSearch = text.includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || sale.status === statusFilter

      return matchesSearch && matchesStatus
    })

    result.sort((a, b) => {
      let diff = 0
      if (sortBy === "date") diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      if (sortBy === "amount") diff = a.amount - b.amount
      if (sortBy === "commission") diff = a.commission - b.commission
      return sortOrder === "asc" ? diff : -diff
    })

    return result
  }, [sales, searchQuery, statusFilter, sortBy, sortOrder])

  const handleSort = (col: "date" | "amount" | "commission") => {
    if (sortBy === col) setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    else {
      setSortBy(col)
      setSortOrder("desc")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-300">
        Cargando dashboard…
      </div>
    )
  }

  /* =======================
     UI
  ======================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-violet-400 to-fuchsia-500 bg-clip-text text-transparent">
              Dashboard de Ventas
            </h1>
            <p className="text-slate-400 mt-1">
              {user?.displayName || "Vendedor"} • {stats.totalSales} ventas
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar..."
                className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "all" | "credited" | "pending")}
                className="pl-9 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm"
              >
                <option value="all">Todos</option>
                <option value="credited">Acreditado</option>
                <option value="pending">Pendiente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-slate-900/80 border border-slate-700 rounded-2xl">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-slate-700 text-sm text-slate-400">
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Producto</th>
                <th className="px-6 py-4">Comprador</th>
                <th className="px-6 py-4">Vendedor</th>
                <th onClick={() => handleSort("date")} className="px-6 py-4 cursor-pointer">
                  Fecha
                </th>
                <th onClick={() => handleSort("amount")} className="px-6 py-4 cursor-pointer">
                  Monto
                </th>
                <th onClick={() => handleSort("commission")} className="px-6 py-4 cursor-pointer">
                  Comisión
                </th>
                <th className="px-6 py-4 text-center">Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-slate-800 hover:bg-slate-800/40">
                  <td className="px-6 py-4 text-slate-300">{sale.id.slice(0, 8)}…</td>
                  <td className="px-6 py-4">{sale.productName}</td>
                  <td className="px-6 py-4">{sale.buyer}</td>
                  <td className="px-6 py-4 text-violet-400 font-semibold">{sale.sellerName}</td>
                  <td className="px-6 py-4 text-slate-400">{sale.date}</td>
                  <td className="px-6 py-4 font-semibold">${sale.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-emerald-400">
                    +${sale.commission.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        sale.status === "credited"
                          ? "bg-green-900/40 text-green-400"
                          : "bg-yellow-900/40 text-yellow-400"
                      }`}
                    >
                      {sale.status === "credited" ? "Acreditado" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  )
}
