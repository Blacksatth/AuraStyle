import { uploadToCloudinary } from "@/lib/cloudinary"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"

// ✅ Interfaz del formulario de producto
// ✅ Interfaz del formulario de producto
export interface ProductForm {
  name: string
  price: number | string
  category: string
  subcategory: string
  description: string
  stock: number | string
  onSale: boolean
  images: string[]
  salePrice?: number | string

  // 🔥 NUEVOS CAMPOS
  partner: string       // ejemplo: "Montalchino"
  brand: string         // ejemplo: "Nike"
  commission?: number | string // porcentaje de comisión (ej: "10" o 10)
}

// ✅ Interfaz para Firestore
export interface ProductPayload {
  name: string
  price: number
  category: string
  subcategory: string
  description: string
  stock: number
  onSale: boolean
  image: string
  extraImages: string[]
  createdAt: ReturnType<typeof serverTimestamp> | string
  salePrice?: number

  // 🔥 NUEVOS CAMPOS
  partner: string
  brand: string
  commission?: number

  [key: string]: unknown
}


// ✅ Mostrar mensajes de éxito/error
export const showMessage = (
  setSuccess: (msg: string) => void,
  setError: (msg: string) => void,
  message: string,
  type: "success" | "error",
) => {
  if (type === "success") {
    setSuccess(message)
    setError("")
    setTimeout(() => setSuccess(""), 3000)
  } else {
    setError(message)
    setSuccess("")
    setTimeout(() => setError(""), 5000)
  }
}

// ✅ Subida de imágenes a Cloudinary
export const handleAddImageFile = async (
  e: React.ChangeEvent<HTMLInputElement>,
  setSubmitting: (b: boolean) => void,
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>,
  showMsg: (message: string, type: "success" | "error") => void,
) => {
  if (!e.target.files) return
  setSubmitting(true)
  try {
    const urls: string[] = []
    for (let i = 0; i < e.target.files.length; i++) {
      const url = await uploadToCloudinary(e.target.files[i])
      urls.push(url)
    }
    setForm((prev) => ({ ...prev, images: [...prev.images, ...urls] }))
    showMsg("Imágenes subidas correctamente", "success")
  } catch (err) {
    console.error(err)
    showMsg("Error al subir imágenes", "error")
  } finally {
    setSubmitting(false)
    e.target.value = ""
  }
}

// ✅ Eliminar imagen
export const handleRemoveImage = (
  index: number,
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>
) => {
  setForm((prev) => ({
    ...prev,
    images: prev.images.filter((_, i) => i !== index),
  }))
}

// ✅ Guardar o actualizar producto
export async function handleAddOrUpdateProduct(
  form: ProductForm,
  editId: string | null,
  resetForm: () => void,
  showMessage: (msg: string, type: "success" | "error") => void,
  setSubmitting: (value: boolean) => void,
) {
  // Validación - subcategory es OPCIONAL
  if (!form.name || !form.price || !form.category || !form.stock) {
    showMessage("Completa los campos obligatorios: nombre, precio, categoría y stock", "error")
    return
  }

  if (form.images.length === 0) {
    showMessage("Agrega al menos una imagen", "error")
    return
  }

  setSubmitting(true)

  try {
    const parsedPrice =
      typeof form.price === "number" ? form.price : parseFloat(String(form.price))
    const parsedStock =
      typeof form.stock === "number" ? form.stock : parseInt(String(form.stock), 10)
    const parsedSalePrice =
      form.salePrice !== undefined && form.salePrice !== null && form.salePrice !== ""
        ? typeof form.salePrice === "number"
          ? form.salePrice
          : parseFloat(String(form.salePrice))
        : null

    const productData = {
      name: form.name,
      price: parsedPrice,
      category: form.category,
      subcategory: form.subcategory || "", // Permitir vacío
      description: form.description,
      image: form.images[0],
      extraImages: form.images.slice(1),
      stock: parsedStock,
      onSale: form.onSale,
      salePrice: parsedSalePrice,
      updatedAt: new Date().toISOString(),
    }

    if (editId) {
      await updateDoc(doc(db, "products", editId), productData)
      showMessage("Producto actualizado", "success")
    } else {
      await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: new Date().toISOString(),
      })
      showMessage("Producto agregado", "success")
    }

    resetForm()
  } catch (error) {
    console.error(error)
    showMessage("Error al guardar producto", "error")
  } finally {
    setSubmitting(false)
  }
}

// ✅ Eliminar producto
export const handleDeleteProduct = async (
  id: string,
  showMsg: (message: string, type: "success" | "error") => void
) => {
  if (!confirm("¿Seguro que deseas eliminar este producto?")) return
  try {
    await deleteDoc(doc(db, "products", id))
    showMsg("Producto eliminado", "success")
  } catch (err) {
    console.error(err)
    showMsg("Error al eliminar producto", "error")
  }
}

// ✅ Editar categoría masivamente
export const handleSaveEditedCategory = async (
  oldCategory: string,
  newCategoryValue: string,
  categories: string[],
  setCategories: React.Dispatch<React.SetStateAction<string[]>>,
  form: ProductForm,
  setForm: React.Dispatch<React.SetStateAction<ProductForm>>,
  showMsg: (message: string, type: "success" | "error") => void,
  setSubmitting: (b: boolean) => void,
) => {
  setSubmitting(true)
  const updatedCategories = categories.map((cat) => (cat === oldCategory ? newCategoryValue : cat))
  setCategories(updatedCategories)
  if (form.category === oldCategory) {
    setForm({ ...form, category: newCategoryValue })
  }

  try {
    const q = query(collection(db, "products"), where("category", "==", oldCategory))
    const snapshot = await getDocs(q)

    if (snapshot.size > 0) {
      const batch = writeBatch(db)
      snapshot.docs.forEach((docSnap) => {
        batch.update(doc(db, "products", docSnap.id), { category: newCategoryValue })
      })
      await batch.commit()
      showMsg(`Categoría "${oldCategory}" actualizada a "${newCategoryValue}"`, "success")
    } else {
      showMsg("Categoría actualizada localmente", "success")
    }
  } catch (err) {
    console.error(err)
    showMsg("Error al actualizar la categoría", "error")
  } finally {
    setSubmitting(false)
  }
}
