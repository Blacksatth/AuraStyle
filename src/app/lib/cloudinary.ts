// src/lib/cloudinary.ts

/**
 * Función para subir una imagen a Cloudinary desde el cliente
 * usando un upload preset sin firmar.
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
  // ✅ Lee desde variables de entorno (.env.local)
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "ddpexfbjn"
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "productos"

  if (!cloudName || !uploadPreset) {
    throw new Error("Faltan variables de entorno de Cloudinary. Verifica tu .env.local")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", uploadPreset)

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const error = await res.text()
    throw new Error(`Error al subir imagen a Cloudinary: ${error}`)
  }

  const data = await res.json()
  return data.secure_url // 🔹 URL pública de la imagen subida
}
