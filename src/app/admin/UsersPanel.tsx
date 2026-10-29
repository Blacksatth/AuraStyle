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

  const filteredUsers = users.filter((u) => {
    const s = searchUser.toLowerCase()
    const matchesSearch =
      u.name?.toLowerCase().includes(s) ||
      u.email.toLowerCase().includes(s) ||
      u.referralCode?.toLowerCase().includes(s)

    const matchesRole = filterRole === "all" || u.role === filterRole

    return matchesSearch && matchesRole
  })

  const roleDisplay = {
    admin: "Administrador",
    seller: "Vendedor",
    user: "Usuario",
    partner: "Socio",
  } as const

  const roleStyles: Record<string, string> = {
    admin: "border border-gold/40 bg-gold/15 text-gold",
    seller: "border border-line bg-elevated text-bone",
    user: "border border-line bg-ink text-ash",
    partner: "border border-gold/20 bg-gold/10 text-gold-soft",
  }

  return (
    <div className="admin-card p-4 sm:p-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
          <Shield className="h-5 w-5 text-gold" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-bone sm:text-3xl">Usuarios</h2>
          <p className="text-sm text-ash">Asigna roles y administra permisos</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ash" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o código..."
            value={searchUser}
            onChange={(e) => setSearchUser(e.target.value)}
            className="admin-field pl-10"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="admin-select"
        >
          <option value="all">Todos los roles</option>
          <option value="admin">Administradores</option>
          <option value="seller">Vendedores</option>
          <option value="user">Usuarios</option>
          <option value="partner">Socios</option>
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-line bg-elevated p-4">
          <p className="mb-1 text-xs text-ash">Total</p>
          <p className="font-display text-3xl text-bone">{users.length}</p>
        </div>

        <div className="rounded-2xl border border-gold/30 bg-gold/10 p-4">
          <p className="mb-1 text-xs text-gold">Admins</p>
          <p className="font-display text-3xl text-gold">
            {users.filter((u) => u.role === "admin").length}
          </p>
        </div>

        <div className="rounded-2xl border border-line bg-elevated p-4">
          <p className="mb-1 text-xs text-ash">Vendedores</p>
          <p className="font-display text-3xl text-bone">
            {users.filter((u) => u.role === "seller").length}
          </p>
        </div>

        <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <p className="mb-1 text-xs text-gold-soft">Socios</p>
          <p className="font-display text-3xl text-gold-soft">
            {users.filter((u) => u.role === "partner").length}
          </p>
        </div>
      </div>

      <div className="block space-y-3 sm:hidden">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div key={user.id} className="rounded-2xl border border-line bg-elevated p-3">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-bone">{user.name || "Sin nombre"}</p>
                  <p className="text-xs text-ash">{user.email}</p>
                  {user.referralCode && (
                    <p className="mt-1 text-xs text-gold">Código: {user.referralCode}</p>
                  )}
                </div>

                <span className={`rounded-full px-2 py-0.5 text-xs ${roleStyles[user.role]}`}>
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
                className="admin-select w-full py-2"
              >
                <option value="user">Usuario</option>
                <option value="seller">Vendedor</option>
                <option value="admin">Administrador</option>
                <option value="partner">Socio</option>
              </select>
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-sm text-ash">No hay usuarios que mostrar</div>
        )}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-line text-left text-[11px] font-medium uppercase tracking-[0.16em] text-ash">
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Estadísticas</th>
              <th className="px-4 py-3">Rol actual</th>
              <th className="px-4 py-3">Cambiar rol</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-b border-line transition hover:bg-elevated/50">
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-bone">{user.name || "Sin nombre"}</p>
                  <p className="text-xs text-ash">{user.email}</p>
                </td>

                <td className="px-4 py-4">
                  {user.referralCode ? (
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-1 text-xs text-gold">
                      {user.referralCode}
                    </span>
                  ) : (
                    <span className="text-xs text-ash">N/A</span>
                  )}
                </td>

                <td className="px-4 py-4 text-xs text-ash">
                  {user.role === "seller" ? (
                    <div>
                      <p>
                        Ventas: <span className="text-bone">{user.salesCount || 0}</span>
                      </p>
                      <p>
                        Ganado:{" "}
                        <span className="text-gold">
                          {user.totalEarnings?.toLocaleString() || 0} pts
                        </span>
                      </p>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="px-4 py-4">
                  <span className={`rounded-full px-3 py-1 text-xs ${roleStyles[user.role]}`}>
                    {roleDisplay[user.role]}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleUpdateUserRole(
                        user.id,
                        e.target.value as "admin" | "seller" | "user" | "partner"
                      )
                    }
                    disabled={submitting}
                    className="admin-select py-2 text-sm"
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
