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
  const userRole = user?.role || "user"
  const router = useRouter()

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
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-slate-400">Cargando...</p>
      </div>
    )

if (!["admin", "seller", "partner"].includes(userRole))

    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <p className="text-red-400 text-xl">Acceso Denegado</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
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
        <div className="px-4 py-3">
          <div
            className={`p-3 rounded-lg border ${error
              ? "bg-red-500/10 text-red-300 border-red-500/30"
              : "bg-green-500/10 text-green-300 border-green-500/30"
              }`}
          >
            {error || success}
          </div>
        </div>
      )}

      {/* --- Productos --- */}
      {activeTab === "products" && (
        <div className="p-4 lg:p-6">
          <div className="grid lg:grid-cols-3 gap-6">
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
            <div className="lg:col-span-2 bg-slate-900 p-4 lg:p-5 rounded-xl border border-slate-800">
              {/* Filtros móviles */}
              <div className="flex flex-col lg:flex-row gap-3 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 p-3 bg-slate-800 border border-slate-700 rounded-lg"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                    className="flex items-center gap-2 p-3 bg-slate-800 border border-slate-700 rounded-lg w-full lg:w-auto"
                  >
                    <Filter className="w-4 h-4" />
                    <span>{filterCategory === "all" ? "Todas" : filterCategory}</span>
                    <ChevronDown className="w-4 h-4 ml-auto" />
                  </button>
                  {filterMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-slate-800 border border-slate-700 rounded-lg z-10">
                      <button
                        onClick={() => {
                          setFilterCategory("all")
                          setFilterMenuOpen(false)
                        }}
                        className="block w-full text-left p-3 hover:bg-slate-700"
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
                          className="block w-full text-left p-3 hover:bg-slate-700"
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
                    <tr className="text-slate-400 border-b border-slate-800">
                      <th className="py-2 text-left">Producto</th>
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
                          className="border-b border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                        >
                          <td className="py-2 flex items-center gap-3">
                            <div className="relative">
                              <Image
                                src={p.image || "/placeholder.svg"}
                                alt={p.name}
                                width={50}
                                height={50}
                                className="rounded-lg object-cover"
                                unoptimized
                              />
                              {p.onSale && (
                                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                                  <Tag className="w-3 h-3" />
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{p.name}</p>
                                {p.onSale && (
                                  <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                    <Percent className="w-3 h-3" />
                                    -{calculateDiscount(p.price, p.salePrice)}%
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 capitalize">{p.subcategory || "-"}</p>
                            </div>
                          </td>
                          <td>
                            <p className="text-slate-300">{p.category}</p>
                          </td>
                          <td>
                            <div className="flex flex-col">
                              {p.onSale && p.salePrice ? (
                                <>
                                  <span className="text-red-400 font-bold">{formatPrice(p.salePrice)}</span>
                                  <span className="text-slate-500 text-xs line-through">{formatPrice(p.price)}</span>
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
                              className="p-2 bg-blue-600 rounded-lg mr-2 hover:bg-blue-700"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteProduct(p.id, showMessageHandler)
                              }}
                              className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-slate-500">
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
                      className="bg-slate-800 rounded-lg p-3 relative">
                      
                      {/* Badge de oferta */}
                      {p.onSale && (
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 z-10">
                          <Tag className="w-3 h-3" />
                          -{calculateDiscount(p.price, p.salePrice)}%
                        </div>
                      )}

                      <div className="flex gap-3 mb-2">
                        <div className="relative">
                          <Image
                            src={p.image || "/placeholder.svg"}
                            alt={p.name}
                            width={60}
                            height={60}
                            className="rounded-lg object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{p.name}</h3>
                          <p className="text-xs text-slate-400 capitalize">{p.subcategory || "-"}</p>
                          <p className="text-xs text-slate-400">{p.category}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-3 text-sm">
                          {p.onSale && p.salePrice ? (
                            <div className="flex flex-col">
                              <span className="text-red-400 font-bold">{formatPrice(p.salePrice)}</span>
                              <span className="text-slate-500 text-xs line-through">{formatPrice(p.price)}</span>
                            </div>
                          ) : (
                            <span className="text-violet-400">{formatPrice(p.price)}</span>
                          )}
                          <span className="text-slate-400">Stock: {p.stock}</span>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditProduct(p)
                            }}
                            className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteProduct(p.id, showMessageHandler)
                            }}
                            className="p-2 bg-red-600 rounded-lg hover:bg-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-500">
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
        <div className="p-4 lg:p-6">
          <SalesPanel />
        </div>
      )}

      {/* --- Usuarios --- */}
      {activeTab === "users" && userRole === "admin" && (
        <div className="p-4 lg:p-6">
          <UsersPanel onMessage={showMessageHandler} />
        </div>
      )}

        {activeTab === "partnerProfile" && userRole === "admin" && (
        <div className="p-4 lg:p-6">
          <PartnerProfile partner={{}} userRole={userRole} onEditPartner={() => {}} />
        </div>
      )}
  

      {/* Modal Categorías */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-lg">Categorías Principales</h3>
              <button onClick={() => setShowCategoryModal(false)} className="hover:text-red-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nueva categoría */}
            <div className="flex gap-2 mb-4">
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Ej: Gorras, Camisas"
                className="flex-1 p-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
              <button
                onClick={handleAddCategory}
                className="bg-violet-600 hover:bg-violet-700 px-3 rounded-lg font-bold"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Lista */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {categories.map((cat) => (
                <div key={cat} className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                  {editingCategory === cat ? (
                    <>
                      <input
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="flex-1 p-2 bg-slate-900 border border-slate-700 rounded"
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
                        className="bg-green-600 hover:bg-green-700 p-2 rounded ml-2"
                      >
                        <Plus className="w-3 h-3 rotate-45" />
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
                          className="bg-blue-600 hover:bg-blue-700 p-2 rounded"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className="bg-red-600 hover:bg-red-700 p-2 rounded"
                        >
                          <Trash2 className="w-3 h-3" />
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