"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { collection, onSnapshot } from "firebase/firestore"
import { db } from "../../lib/firebase"
import { formatPrice } from "../../utils/formatPrice"
import useAuth from "../../hooks/useAuth"
import SalesPanel from "../../admin/SalesPanel"
import UsersPanel from "../../admin/UsersPanel"
import { useRouter } from "next/navigation"
import AdminHeader from "./Headeradmin"
import PartnerProfile from "@/app/admin/PartnerProfile"
import addProduct from "./AddProduct"
import {
  showMessage,
  handleAddImageFile,
  handleRemoveImage,
  handleAddOrUpdateProduct,
  handleDeleteProduct,
  handleSaveEditedCategory,
  ProductForm,
} from "../../lib/adminFunctions"

import {
  Edit,
  Trash2,
  Plus,
  X,
  Search,
  Filter,
  ChevronDown,
  Tag,
  Percent,
} from "lucide-react"

import type { Product } from "../../types/Product"
import AddProduct from "./AddProduct"


export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  // Correos autorizados como administradores
  const ADMIN_EMAILS = [
    "santiago.cifuentes@correo.tdea.edu.co",
    "santiagocifuenteslora@gmail.com",
  ]

  // Normalizar correo para evitar errores de mayúsculas o espacios
  const userEmail = user?.email?.trim().toLowerCase() ?? ""

  // Verificar si el usuario es administrador
  const isAdmin = ADMIN_EMAILS.includes(userEmail)

  // Si está autorizado, darle prioridad al rol administrador
  const userRole = isAdmin ? "admin" : (user?.role || "user")


    const [form, setForm] = useState<ProductForm>({
    name: "",
    price: "",
    category: "",
    subcategory: "",
    description: "",
    images: [],
    stock: "",
    onSale: false,
    salePrice: "",
    partner: "",      // 👈 nuevo
    brand: "",        // 👈 nuevo
    commission: "",   // 👈 nuevo
  })

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newCategory, setNewCategory] = useState("")
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [editCategoryValue, setEditCategoryValue] = useState("")
  const [editId, setEditId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [activeTab, setActiveTab] = useState<
  "products" | "sales" | "users" | "partnerProfile"
>("products")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filterMenuOpen, setFilterMenuOpen] = useState(false)

  const showMessageHandler = (msg: string, type: "success" | "error") =>
    showMessage(setSuccess, setError, msg, type)

  // Función para calcular descuento
  const calculateDiscount = (price: number, salePrice?: number) => {
    if (!salePrice) return 0
    return Math.round(((price - salePrice) / price) * 100)
  }

  // Cargar productos y categorías
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const data: Product[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Product[]
        setProducts(data)
        const uniqueCategories = [...new Set(data.map((p) => p.category).filter(Boolean))]
        setCategories(uniqueCategories)
      },
      () => showMessageHandler("Error cargando productos", "error"),
    )
    return () => unsubscribe()
  }, [])

  // --- Handlers simples locales ---
  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      category: "",
      subcategory: "",
      description: "",
      images: [],
      stock: "",
      onSale: false,
      salePrice: "",
      partner: "",
      brand: "",
      commission: "",
    })
    setEditId(null)
  }
  const handleEditProduct = (product: Product) => {
    const extended = product as Product & {
      partner?: string
      brand?: string
      commission?: string | number
    }
    setForm({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      subcategory: product.subcategory || "",
      description: product.description,
      images: [product.image, ...(product.extraImages || [])],
      stock: product.stock.toString(),
      onSale: product.onSale,
      salePrice: product.salePrice ? product.salePrice.toString() : "",
      partner: extended.partner || "",
      brand: extended.brand || "",
      commission: extended.commission ? String(extended.commission) : "",
    })
    setEditId(product.id)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()])
      setForm({ ...form, category: newCategory.trim() })
      setNewCategory("")
      setShowCategoryModal(false)
      showMessageHandler("Categoría agregada localmente", "success")
    }
  }

  const handleDeleteCategory = (category: string) => {
    if (confirm(`¿Eliminar la categoría "${category}"?`)) {
      setCategories(categories.filter((cat) => cat !== category))
      if (form.category === category) setForm({ ...form, category: "" })
      showMessageHandler("Categoría eliminada localmente", "success")
    }
  }

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || p.category === filterCategory
    return matchesSearch && matchesCategory
  })

  // --- UI Render ---

  if (authLoading)
    return (
      <div className="flex min-h-screen items-center justify-center text-bone">
        <p className="text-ash">Cargando...</p>
      </div>
    )

if (!["admin", "seller", "partner"].includes(userRole))

    return (
      <div className="flex min-h-screen items-center justify-center text-bone">
        <p className="font-display text-3xl text-red-300">Acceso denegado</p>
      </div>
    )

  return (
    <div className="min-h-screen text-bone">
      {/* Header */}
      <AdminHeader
        userRole={userRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Messages */}
      {(error || success) && (
        <div className="container-edge py-4">
          <div
            className={`rounded-2xl border p-3 text-sm ${error
              ? "border-red-400/30 bg-red-500/10 text-red-300"
              : "border-gold/30 bg-gold/10 text-gold-soft"
              }`}
          >
            {error || success}
          </div>
        </div>
      )}

      {/* --- Productos --- */}
      {activeTab === "products" && (
        <div className="container-edge py-8">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Formulario */}
            <AddProduct
  editId={editId}
  form={form}
  setForm={setForm}
  categories={categories}
  setShowCategoryModal={setShowCategoryModal}
  submitting={submitting}
  handleAddImageFile={handleAddImageFile}
  handleRemoveImage={handleRemoveImage}
  handleAddOrUpdateProduct={handleAddOrUpdateProduct}
  resetForm={resetForm}
  showMessageHandler={showMessageHandler}
  setSubmitting={setSubmitting}
  userRole={userRole}
/>



            {/* Lista de productos */}
            <div className="admin-card p-4 lg:col-span-2 lg:p-6">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ash" />
                  <input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-field pl-9"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    className="flex w-full items-center gap-2 rounded-xl border border-line bg-elevated p-3 text-sm text-bone lg:w-auto"
                  >
                    <Filter className="h-4 w-4 text-gold" />
                    <span>{filterCategory === "all" ? "Todas" : filterCategory}</span>
                    <ChevronDown className="ml-auto h-4 w-4 text-ash" />
                  </button>
                  {filterMenuOpen && (
                    <div className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-2xl border border-line bg-surface">
                      <button
                        onClick={() => {
                          setFilterCategory("all")
                          setFilterMenuOpen(false)
                        }}
                        className="block w-full p-3 text-left text-sm text-ash hover:bg-elevated hover:text-bone"
                      >
                        Todas
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => {
                            setFilterCategory(cat)
                            setFilterMenuOpen(false)
                          }}
                          className="block w-full p-3 text-left text-sm text-ash hover:bg-elevated hover:text-bone"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Tabla para desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left text-[11px] font-medium uppercase tracking-[0.16em] text-ash">
                      <th className="py-3">Producto</th>
                      <th>Categoría</th>
                      <th>Precio</th>
                      <th>Stock</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <tr
                          key={p.id}
                          onClick={() => router.push(`/products/${p.id}`)}
                          className="cursor-pointer border-b border-line hover:bg-elevated/50"
                        >
                          <td className="flex items-center gap-3 py-3">
                            <div className="relative">
                              <Image
                                src={p.image || "/placeholder.svg"}
                                alt={p.name}
                                width={50}
                                height={50}
                                className="rounded-xl object-cover"
                                unoptimized
                              />
                              {p.onSale && (
                                <div className="absolute -top-1 -right-1 rounded-full bg-gold p-1 text-ink">
                                  <Tag className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-bone">{p.name}</p>
                                {p.onSale && (
                                  <span className="flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs text-gold">
                                    <Percent className="h-3 w-3" />
                                    -{calculateDiscount(p.price, p.salePrice)}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs capitalize text-ash">{p.subcategory || "-"}</p>
                            </div>
                          </td>
                          <td>
                            <p className="text-ash">{p.category}</p>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              {p.onSale && p.salePrice ? (
                                <>
                                  <span className="font-medium text-gold">{formatPrice(p.salePrice)}</span>
                                  <span className="text-xs text-ash line-through">{formatPrice(p.price)}</span>
                                </>
                              ) : (
                                <span>{formatPrice(p.price)}</span>
                              )}
                            </div>
                          </td>
                          <td>{p.stock}</td>
                          <td className="text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditProduct(p)
                              }}
                              className="mr-2 grid h-9 w-9 place-items-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteProduct(p.id, showMessageHandler)
                              }}
                              className="grid h-9 w-9 place-items-center rounded-full border border-line text-ash transition-colors hover:border-red-400/40 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-ash">
                          No hay productos que mostrar
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Cards para móvil */}
              <div className="lg:hidden space-y-3">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((p) => (
                    <div key={p.id}
                      onClick={() => router.push(`/products/${p.id}`)}
                      className="relative rounded-2xl border border-line bg-elevated p-3">
                      
                      {p.onSale && (
                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-full bg-gold px-2 py-1 text-xs font-medium text-ink">
                          <Tag className="h-3 w-3" />
                          -{calculateDiscount(p.price, p.salePrice)}%
                        </div>
                      )}

                      <div className="mb-2 flex gap-3">
                        <div className="relative">
                          <Image
                            src={p.image || "/placeholder.svg"}
                            alt={p.name}
                            width={60}
                            height={60}
                            className="rounded-xl object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl text-bone">{p.name}</h3>
                          <p className="text-xs capitalize text-ash">{p.subcategory || "-"}</p>
                          <p className="text-xs text-ash">{p.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-sm">
                          {p.onSale && p.salePrice ? (
                            <div className="flex flex-col">
                              <span className="font-medium text-gold">{formatPrice(p.salePrice)}</span>
                              <span className="text-xs text-ash line-through">{formatPrice(p.price)}</span>
                            </div>
                          ) : (
                            <span className="text-gold">{formatPrice(p.price)}</span>
                          )}
                          <span className="text-ash">Stock: {p.stock}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditProduct(p)
                            }}
                            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ash hover:border-gold/50 hover:text-gold"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProduct(p.id, showMessageHandler)
                            }}
                            className="grid h-9 w-9 place-items-center rounded-full border border-line text-ash hover:border-red-400/40 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-ash">
                    No hay productos que mostrar
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Ventas --- */}
      {activeTab === "sales" && (
        <div className="container-edge py-8">
          <SalesPanel />
        </div>
      )}

      {/* --- Usuarios --- */}
      {activeTab === "users" && userRole === "admin" && (
        <div className="container-edge py-8">
          <UsersPanel onMessage={showMessageHandler} />
        </div>
      )}

        {activeTab === "partnerProfile" && userRole === "admin" && (
        <div className="container-edge py-8">
          <PartnerProfile partner={{}} userRole={userRole} onEditPartner={() => {}} />
        </div>
      )}
  

      {/* Modal Categorías */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="admin-card max-h-[80vh] w-full max-w-md overflow-y-auto p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-2xl text-bone">Categorías</h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-ash hover:text-red-300">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex gap-2">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ej: Gorras, Camisas"
                className="admin-field flex-1"
              />
              <button
                onClick={handleAddCategory}
                className="grid h-11 w-11 place-items-center rounded-full bg-gold text-ink hover:bg-gold-soft"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between rounded-xl border border-line bg-elevated p-3">
                  {editingCategory === cat ? (
                    <>
                      <input
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="admin-field flex-1 py-2"
                      />
                      <button
                        onClick={() =>
                          handleSaveEditedCategory(
                            cat,
                            editCategoryValue,
                            categories,
                            setCategories,
                            form,
                            setForm,
                            showMessageHandler,
                            setSubmitting,
                          )
                        }
                        className="ml-2 grid h-9 w-9 place-items-center rounded-full bg-gold text-ink"
                      >
                        <Plus className="h-3 w-3 rotate-45" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{cat}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(cat)
                            setEditCategoryValue(cat)
                          }}
                          className="grid h-9 w-9 place-items-center rounded-full border border-line text-ash hover:border-gold/50 hover:text-gold"
                        >
                          <Edit className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-line text-ash hover:border-red-400/40 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}