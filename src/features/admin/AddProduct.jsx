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
        <div className="admin-card p-4 lg:p-6">
          <h2 className="mb-5 flex items-center gap-2 font-display text-2xl text-bone">
            {editId ? (
              <Edit className="w-4 h-4 text-gold" />
            ) : (
              <Plus className="w-4 h-4 text-gold" />
            )}
            {editId ? "Editar producto" : "Nuevo producto"}
          </h2>

          <input
            type="text"
            placeholder="Nombre del producto"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="admin-field mb-3"
          />

          <div className="mb-3 grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="Precio"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="admin-field"
            />
            <input
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="admin-field"
            />
          </div>

          {isAdmin && (
            <div className="mb-3">
              <label className="mb-1 block text-xs text-ash">
                Socio / Proveedor
              </label>
              <input
                type="text"
                placeholder="Ej: Montalchino"
                value={form.partner || ""}
                onChange={(e) => setForm({ ...form, partner: e.target.value })}
                className="admin-field"
              />
            </div>
          )}

          <div className="mb-3 grid grid-cols-1 gap-3">
            <div>
              <label className="mb-1 block text-xs text-ash">
                Marca del producto
              </label>
              <input
                type="text"
                placeholder="Ej: Nike, Adidas..."
                value={form.brand || ""}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="admin-field"
              />
            </div>
          </div>

          {isAdmin && (
            <div className="mb-3">
              <label className="mb-1 block text-xs text-ash">
                Comisión que ganas (%)
              </label>
              <input
                type="number"
                placeholder="Ej: 10"
                value={form.commission ?? ""}
                onChange={(e) =>
                  setForm({ ...form, commission: e.target.value })
                }
                className="admin-field"
              />
              <p className="mt-1 text-[11px] text-ash">
                Este porcentaje se usará para calcular tu ganancia por venta de este producto.
              </p>
            </div>
          )}

          <div className="mb-3 rounded-2xl border border-line bg-elevated/60 p-3">
            <label className="mb-3 flex cursor-pointer items-center gap-2">
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
                className="h-4 w-4 cursor-pointer accent-gold"
              />
              <Tag className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-bone">
                Producto en descuento
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
                  className="admin-field"
                />
                {form.price &&
                  form.salePrice &&
                  Number(form.salePrice) < Number(form.price) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-ash">
                        Precio original:{" "}
                        <span className="line-through">${form.price}</span>
                      </span>
                      <span className="rounded-full bg-gold/15 px-2 py-1 text-xs font-medium text-gold">
                        -{calculateDiscount()}%
                      </span>
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                list="categories-list"
                placeholder="Categoría"
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="admin-field"
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
              className="admin-select w-full"
            >
              <option value="">Subcategoría</option>
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
            </select>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-ghost mb-3 w-full py-2.5 text-sm"
            >
              <Layers className="mr-2 inline-block h-4 w-4" /> Gestionar categorías
            </button>
          )}

          <textarea
            placeholder="Descripción"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="admin-field mb-3 h-24 resize-none rounded-2xl"
          />

          <div className="relative mb-3 rounded-2xl border border-dashed border-line p-4 text-center">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                handleAddImageFile(e, setSubmitting, setForm, showMessageHandler)
              }
              className="absolute inset-0 cursor-pointer opacity-0"
            />
            <ImageIcon className="mx-auto mb-1 h-6 w-6 text-ash" />
            <p className="text-sm text-ash">
              {submitting ? "Subiendo..." : "Arrastra o haz clic"}
            </p>
          </div>

          {form.images.length > 0 && (
            <div className="mb-3 grid grid-cols-3 gap-2">
              {form.images.map((img, idx) => (
                <div key={idx} className="relative aspect-square">
                  <Image
                    src={img}
                    alt=""
                    fill
                    className="rounded-xl object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => handleRemoveImage(idx, setForm)}
                    className="absolute top-1 right-1 rounded-full bg-ink/70 p-1"
                  >
                    <Trash2 className="h-3 w-3 text-red-300" />
                  </button>
                </div>
              ))}
            </div>
          )}

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
              className="btn-gold flex-1"
            >
              {editId ? "Actualizar" : "Agregar"}
            </button>

            {editId && (
              <button
                onClick={resetForm}
                className="btn-ghost px-5"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
