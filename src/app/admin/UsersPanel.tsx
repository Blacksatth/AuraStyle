"use client"

import { useState, useEffect } from "react"
import { Search, Shield } from "lucide-react"
import { collection, updateDoc, doc, onSnapshot } from "firebase/firestore"
import { db } from "../lib/firebase"

interface User {
  id: string
  uid: string
  name?: string
  email: string
  role: "admin" | "seller" | "user" | "partner"
  referralCode?: string
  salesCount?: number
  totalEarnings?: number
  createdAt: string
}

interface UsersPanelProps {
  onMessage: (message: string, type: "success" | "error") => void
}

export default function UsersPanel({ onMessage }: UsersPanelProps) {
  const [users, setUsers] = useState<User[]>([])
  const [searchUser, setSearchUser] = useState("")
  const [filterRole, setFilterRole] = useState("all")
  const [submitting, setSubmitting] = useState(false)

  // ────────────────────────────────────────────────
  // Cargar usuarios en tiempo real
  // ────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const data: User[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as User[]
        setUsers(data)
      },
      () => onMessage("Error cargando usuarios", "error")
    )

    return () => unsubscribe()
  }, [onMessage])

  // ────────────────────────────────────────────────
  // Actualizar rol (SOLO AQUÍ ESTABA EL ERROR)
  // ────────────────────────────────────────────────
  const handleUpdateUserRole = async (
    userId: string,
    newRole: "admin" | "seller" | "user" | "partner"
  ) => {
    if (!confirm(`¿Cambiar el rol de este usuario a "${newRole}"?`)) return

    setSubmitting(true)
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole })
      onMessage(`Rol actualizado a ${newRole}`, "success")
    } catch (e) {
      onMessage("Error al actualizar el rol", "error")
    } finally {
      setSubmitting(false)
    }
  }

  // ────────────────────────────────────────────────
  // Filtrado por búsqueda y rol
  // ────────────────────────────────────────────────
  const filteredUsers = users.filter((u) => {
    const s = searchUser.toLowerCase()
    const matchesSearch =
      u.name?.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.referralCode?.toLowerCase().includes(s)

    const matchesRole = filterRole === "all" || u.role === filterRole

    return matchesSearch && matchesRole
  })

  // ────────────────────────────────────────────────
  // Mapeo visual de los roles (etiquetas)
  // ────────────────────────────────────────────────
  const roleDisplay = {
    admin: "Administrador",
    seller: "Vendedor",
    user: "Usuario",
    partner: "Socio",
  } as const

  const roleStyles: Record<string, string> = {
    admin: "bg-violet-500/20 text-violet-400 border border-violet-500/30",
    seller: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
    user: "bg-green-500/20 text-green-400 border border-green-500/30",
    partner: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  }

  // ────────────────────────────────────────────────
  // UI COMPLETA
  // ────────────────────────────────────────────────
  return (
    <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-500/10 rounded-xl flex items-center justify-center">
          <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Gestión de Usuarios</h2>
          <p className="text-xs sm:text-sm text-slate-400">Asigna roles y administra permisos</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o código..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-violet-500 focus:outline-none"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg bg-slate-800 border border-slate-700 focus:ring-2 focus:ring-violet-500 focus:outline-none"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="seller">Vendedores</option>
          <option value="user">Usuarios</option>
          <option value="partner">Socios</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3 sm:p-4 border border-slate-700">
          <p className="text-xs sm:text-sm text-slate-400 mb-1">Total</p>
          <p className="text-xl sm:text-2xl font-black text-white">{users.length}</p>
        </div>

        <div className="bg-violet-500/10 rounded-lg p-3 sm:p-4 border border-violet-500/30">
          <p className="text-xs sm:text-sm text-violet-400 mb-1">Admins</p>
          <p className="text-xl sm:text-2xl font-black text-violet-400">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>

        <div className="bg-blue-500/10 rounded-lg p-3 sm:p-4 border border-blue-500/30">
          <p className="text-xs sm:text-sm text-blue-400 mb-1">Vendedores</p>
          <p className="text-xl sm:text-2xl font-black text-blue-400">
            {users.filter((u) => u.role === "seller").length}
          </p>
        </div>

        <div className="bg-yellow-500/10 rounded-lg p-3 sm:p-4 border border-yellow-500/30">
          <p className="text-xs sm:text-sm text-yellow-400 mb-1">Socios</p>
          <p className="text-xl sm:text-2xl font-black text-yellow-400">
            {users.filter((u) => u.role === "partner").length}
          </p>
        </div>
      </div>

      {/* MOBILE */}
      <div className="block sm:hidden space-y-3">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-sm text-white">{user.name || "Sin nombre"}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                  {user.referralCode && (
                    <p className="text-xs text-violet-400 mt-1">Código: {user.referralCode}</p>
                  )}
                </div>

                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${roleStyles[user.role]}`}>
                  {roleDisplay[user.role]}
                </span>
              </div>

              <select
                value={user.role}
                onChange={(e) =>
                  handleUpdateUserRole(
                    user.id,
                    e.target.value as "admin" | "seller" | "user" | "partner"
                  )
                }
                disabled={submitting}
                className="w-full p-2 text-sm rounded-lg bg-slate-900 border border-slate-700 text-white"
              >
                <option value="user">Usuario</option>
                <option value="seller">Vendedor</option>
                <option value="admin">Administrador</option>
                <option value="partner">Socio</option>
              </select>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-slate-400 text-sm">No hay usuarios que mostrar</div>
        )}
      </div>

      {/* DESKTOP */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="py-3 px-4 text-left text-sm">Usuario</th>
              <th className="py-3 px-4 text-left text-sm">Código</th>
              <th className="py-3 px-4 text-left text-sm">Estadísticas</th>
              <th className="py-3 px-4 text-left text-sm">Rol Actual</th>
              <th className="py-3 px-4 text-left text-sm">Cambiar Rol</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition">
                <td className="py-4 px-4">
                  <p className="font-medium text-sm text-white">{user.name || "Sin nombre"}</p>
                  <p className="text-xs text-slate-400">{user.email}</p>
                </td>

                <td className="py-4 px-4">
                  {user.referralCode ? (
                    <span className="px-2 py-1 bg-violet-500/10 border border-violet-500/30 rounded text-xs text-violet-400">
                      {user.referralCode}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">N/A</span>
                  )}
                </td>

                <td className="py-4 px-4 text-xs text-slate-500">
                  {user.role === "seller" ? (
                    <div>
                      <p className="text-slate-400">
                        Ventas: <span className="text-white">{user.salesCount || 0}</span>
                      </p>
                      <p className="text-slate-400">
                        Ganado:{" "}
                        <span className="text-green-400">
                          {user.totalEarnings?.toLocaleString() || 0} pts
                        </span>
                      </p>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${roleStyles[user.role]}`}>
                    {roleDisplay[user.role]}
                  </span>
                </td>

                <td className="py-4 px-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleUpdateUserRole(
                        user.id,
                        e.target.value as "admin" | "seller" | "user" | "partner"
                      )
                    }
                    disabled={submitting}
                    className="p-2 text-sm rounded-lg bg-slate-800 border border-slate-700 text-white"
                  >
                    <option value="user">Usuario</option>
                    <option value="seller">Vendedor</option>
                    <option value="admin">Administrador</option>
                    <option value="partner">Socio</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
