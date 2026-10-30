"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/lib/firebase/client"
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
import { Search, Filter } from "lucide-react"

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
        router.push("/login")
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
      <div className="flex items-center justify-center py-16 text-ash">
        Cargando ventas…
      </div>
    )
  }

  return (
    <div className="text-bone">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row">
        <div>
          <h2 className="font-display text-4xl text-bone">Ventas</h2>
          <p className="mt-1 text-ash">
            {user?.displayName || "Vendedor"} · {stats.totalSales} ventas
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ash" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="admin-field py-2.5 pl-9"
            />
          </div>

          <div className="relative">
            <Filter className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ash" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "credited" | "pending")}
              className="admin-select py-2.5 pl-9 pr-8"
            >
              <option value="all">Todos</option>
              <option value="credited">Acreditado</option>
              <option value="pending">Pendiente</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-line text-left text-[11px] font-medium uppercase tracking-[0.16em] text-ash">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Producto</th>
              <th className="px-6 py-4">Comprador</th>
              <th className="px-6 py-4">Vendedor</th>
              <th onClick={() => handleSort("date")} className="cursor-pointer px-6 py-4">
                Fecha
              </th>
              <th onClick={() => handleSort("amount")} className="cursor-pointer px-6 py-4">
                Monto
              </th>
              <th onClick={() => handleSort("commission")} className="cursor-pointer px-6 py-4">
                Comisión
              </th>
              <th className="px-6 py-4 text-center">Estado</th>
            </tr>
          </thead>

          <tbody>
            {filteredSales.map((sale) => (
              <tr key={sale.id} className="border-b border-line hover:bg-elevated/50">
                <td className="px-6 py-4 text-ash">{sale.id.slice(0, 8)}…</td>
                <td className="px-6 py-4">{sale.productName}</td>
                <td className="px-6 py-4">{sale.buyer}</td>
                <td className="px-6 py-4 font-medium text-gold">{sale.sellerName}</td>
                <td className="px-6 py-4 text-ash">{sale.date}</td>
                <td className="px-6 py-4 font-medium">${sale.amount.toLocaleString()}</td>
                <td className="px-6 py-4 font-medium text-gold-soft">
                  +${sale.commission.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      sale.status === "credited"
                        ? "border border-gold/30 bg-gold/10 text-gold"
                        : "border border-line bg-elevated text-ash"
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
  )
}
