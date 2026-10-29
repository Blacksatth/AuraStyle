  import React from 'react'
  import { Plus, Edit, Layers, Trash2, Image as ImageIcon, Tag } from "lucide-react";
  import Image from "next/image";

  export default function AddProduct({
    editId,
    form,
    setForm,
    categories,
    setShowCategoryModal,
    submitting,
    handleAddImageFile,
    handleRemoveImage,
    handleAddOrUpdateProduct,
    resetForm,
    showMessageHandler,
    setSubmitting,
    userRole, // 'admin' | 'vendedor' | 'socio'
  }) {
    // helpers de rol
    const isAdmin = userRole === "admin";
    const isPartner = userRole === "socio";

    // Calcular porcentaje de descuento
    const calculateDiscount = () => {
      if (form.price && form.salePrice) {
        const price = Number(form.price);
        const salePrice = Number(form.salePrice);
        if (!price || !salePrice || salePrice >= price) return 0;
        const discount = ((price - salePrice) / price) * 100;
        return Math.round(discount);
      }
      return 0;
    };

    return (
      <div>
        <div className="bg-slate-900 p-4 lg:p-5 rounded-xl border border-slate-800">
          <h2 className="font-bold mb-4 text-lg flex items-center gap-2">
            {editId ? (
              <Edit className="w-4 h-4 text-violet-400" />
            ) : (
              <Plus className="w-4 h-4 text-violet-400" />
            )}
            {editId ? "Editar Producto" : "Nuevo Producto"}
          </h2>

          {/* Nombre */}
          <input
            type="text"
            placeholder="Nombre del producto"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 mb-3 bg-slate-800 border border-slate-700 rounded-lg"
          />

          {/* Precio / Stock */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              type="number"
              placeholder="Precio"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
            />
            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
            />
          </div>

          {/* Socio / Proveedor SOLO ADMIN */}
          {isAdmin && (
            <div className="mb-3">
              <label className="block text-xs text-slate-400 mb-1">
                Socio / Proveedor
              </label>
              <input
                type="text"
                placeholder="Ej: Montalchino"
                value={form.partner || ""}
                onChange={(e) => setForm({ ...form, partner: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </div>
          )}

          {/* Marca (visible para todos) */}
          <div className="grid grid-cols-1 gap-3 mb-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Marca del producto
              </label>
              <input
                type="text"
                placeholder="Ej: Nike, Adidas..."
                value={form.brand || ""}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
            </div>
          </div>

          {/* Comisión (solo ADMIN, SOCIO no la ve) */}
          {isAdmin && (
            <div className="mb-3">
              <label className="block text-xs text-slate-400 mb-1">
                Comisión que ganas (%)
              </label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={form.commission ?? ""}
                onChange={(e) =>
                  setForm({ ...form, commission: e.target.value })
                }
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Este porcentaje se usará para calcular tu ganancia por venta de este producto.
              </p>
            </div>
          )}

          {/* Sistema de Descuentos */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-3">
            <label className="flex items-center gap-2 mb-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.onSale || false}
                onChange={(e) =>
                  setForm({
                    ...form,
                    onSale: e.target.checked,
                    salePrice: e.target.checked ? form.salePrice : undefined,
                  })
                }
                className="w-4 h-4 accent-violet-600 cursor-pointer"
              />
              <Tag className="w-4 h-4 text-violet-400" />
              <span className="text-sm font-medium text-slate-300">
                Producto en Descuento
              </span>
            </label>

            {form.onSale && (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Precio con descuento"
                  value={form.salePrice || ""}
                  onChange={(e) =>
                    setForm({ ...form, salePrice: e.target.value })
                  }
                  className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
                />
                {form.price &&
                  form.salePrice &&
                  Number(form.salePrice) < Number(form.price) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        Precio original:{" "}
                        <span className="line-through">${form.price}</span>
                      </span>
                      <span className="bg-blue-500/20 text-red-300 px-2 py-1 rounded font-bold">
                        -{calculateDiscount()}%
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Categoría y Subcategoría */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Categoría con opción de elegir o escribir una nueva */}
            <div>
              <input
                type="text"
                list="categories-list"
                placeholder="Categoría"
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg"
              />
              <datalist id="categories-list">
                {categories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
            </div>

            <select
              value={form.subcategory || ""}
              onChange={(e) =>
                setForm({ ...form, subcategory: e.target.value })
              }
              className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
            >
              <option value="">Subcategoría</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
            </select>
          </div>  

          {/* Botón gestionar categorías SOLO admin, socios no crean categorías */}
          {isAdmin && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 py-2 px-4 rounded-lg mb-3 text-sm font-medium"
            >
              <Layers className="inline-block mr-2 w-4 h-4" /> Gestionar Categorías
            </button>
          )}

          {/* Descripción */}
          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg mb-3 h-24 resize-none"
          />

          {/* Imágenes */}
          <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-4 text-center mb-3">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                handleAddImageFile(e, setSubmitting, setForm, showMessageHandler)
              }
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <ImageIcon className="w-6 h-6 text-slate-500 mx-auto mb-1" />
            <p className="text-slate-400 text-sm">
              {submitting ? "Subiendo..." : "Arrastra o haz clic"}
            </p>
          </div>

          {/* Preview imágenes */}
          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-3">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="object-cover rounded-lg"
                    unoptimized
                  />
                  <button
                    onClick={() => handleRemoveImage(idx, setForm)}
                    className="absolute top-1 right-1 bg-black/50 p-1 rounded-full"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                handleAddOrUpdateProduct(
                  form,
                  editId,
                  resetForm,
                  showMessageHandler,
                  setSubmitting
                )
              }
              className="flex-1 bg-violet-600 hover:bg-violet-700 py-3 rounded-lg font-bold"
            >
              {editId ? "Actualizar" : "Agregar"}
            </button>

            {editId && (
              <button
                onClick={resetForm}
                className="bg-slate-700 hover:bg-slate-600 py-3 px-4 rounded-lg"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
