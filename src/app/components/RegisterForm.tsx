"use client"

import { useState } from "react"
import Image from "next/image" // 👈 Importación de Image de Next.js
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react"
import { auth, db } from "../lib/firebase"
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"

// ================================
// 🔹 Tipos
// ================================
type FormData = {
  name: string
  email: string
  password: string
  confirmPassword: string
}

type Validations = {
  nameValid: boolean
  emailValid: boolean
  passwordValid: boolean
  passwordMatch: boolean
}

// Interfaz para un error de Firebase conocido
interface FirebaseError {
  code: string
  message: string
}

// ================================
// 🔹 Generar código único vendedor
// ================================
const generateReferralCode = (email: string): string => {
  const namePart = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase()
  const random = Math.floor(1000 + Math.random() * 9000)
  return `${namePart.slice(0, 4)}${random}`
}

// ================================
// 🔹 Componente principal
// ================================
export default function RegisterForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const [validations, setValidations] = useState<Validations>({
    nameValid: false,
    emailValid: false,
    passwordValid: false,
    passwordMatch: false,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [generatedCode, setGeneratedCode] = useState("")

  // ================================
  // 🔹 Validaciones
  // ================================
  const validateField = (field: string, value: string) => {
    const newValidations = { ...validations }

    switch (field) {
      case "name":
        newValidations.nameValid = value.trim().length >= 3
        break
      case "email":
        newValidations.emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        break
      case "password":
        newValidations.passwordValid = value.length >= 6
        newValidations.passwordMatch =
          value === formData.confirmPassword && value.length > 0
        break
      case "confirmPassword":
        newValidations.passwordMatch =
          value === formData.password && value.length > 0
        break
    }

    setValidations(newValidations)
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData({ ...formData, [field]: value })
    validateField(field, value)
    setError("")
  }

  // ================================
  // 🔹 Registro con Email
  // ================================
  const handleRegister = async () => {
    if (
      !validations.nameValid ||
      !validations.emailValid ||
      !validations.passwordValid ||
      !validations.passwordMatch
    ) {
      setError("Por favor completa todos los campos correctamente")
      return
    }

    setLoading(true)
    setError("")

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      )
      const user = userCredential.user
      await updateProfile(user, { displayName: formData.name })

      const referralCode = generateReferralCode(formData.email)
      const userData = {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        role: "usuario",
        referralCode,
        points: 0,
        salesCount: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString(),
      }

      // 🔥 Crear documento Firestore
      await setDoc(doc(db, "users", user.uid), userData)

      setGeneratedCode(referralCode)
      setSuccess(true)
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      })
      setValidations({
        nameValid: false,
        emailValid: false,
        passwordValid: false,
        passwordMatch: false,
      })
    } catch (err: unknown) { // 👈 Corregido: tipado a unknown
      let errorMessage = "Error al registrar usuario"
      // Verificar si el error es de tipo FirebaseError
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as FirebaseError).code === "string"
      ) {
        const firebaseError = err as FirebaseError
        if (firebaseError.code === "auth/email-already-in-use")
          errorMessage = "Este correo ya está registrado."
        else if (firebaseError.code === "auth/weak-password")
          errorMessage = "La contraseña debe tener al menos 6 caracteres"
        else if (firebaseError.code === "auth/invalid-email")
          errorMessage = "El correo electrónico no es válido"
        else if (firebaseError.code === "auth/network-request-failed")
          errorMessage = "Error de conexión. Verifica tu internet."
        else if (firebaseError.message) errorMessage = firebaseError.message
      } else if (typeof err === "object" && err !== null && "message" in err) {
        // Manejar otros posibles errores con 'message'
        errorMessage = (err as { message: string }).message
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // ================================
  // 🔹 Registro con Google
  // ================================
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError("")
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userDocRef = doc(db, "users", user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // En caso de que el usuario de Google sea nuevo
        const referralCode = generateReferralCode(user.email || "USER")
        const userData = {
          uid: user.uid,
          name: user.displayName || "",
          email: user.email || "",
          role: "usuario",
          referralCode,
          points: 0,
          salesCount: 0,
          totalEarnings: 0,
          createdAt: new Date().toISOString(),
        }

        await setDoc(userDocRef, userData)
        setGeneratedCode(referralCode) // Se establece el código generado para la pantalla de éxito
      } else {
        // El usuario ya existe, obtiene el código existente
        const existingData = userDoc.data()
        setGeneratedCode(existingData?.referralCode || generateReferralCode(user.email || "USER"))
      }

      setSuccess(true)
    } catch (err: unknown) { // 👈 Corregido: tipado a unknown
      let errorMessage = "Error al iniciar sesión con Google"
      // Verificar si el error es de tipo FirebaseError
      if (
        typeof err === "object" &&
        err !== null &&
        "code" in err &&
        typeof (err as FirebaseError).code === "string"
      ) {
        const firebaseError = err as FirebaseError
        if (firebaseError.code === "auth/popup-closed-by-user")
          errorMessage = "Inicio de sesión cancelado"
        else if (firebaseError.code === "auth/popup-blocked")
          errorMessage = "Permite las ventanas emergentes"
        else if (firebaseError.code === "auth/network-request-failed")
          errorMessage = "Error de conexión. Verifica tu internet."
      } else if (typeof err === "object" && err !== null && "message" in err) {
        // Manejar otros posibles errores con 'message'
        errorMessage = (err as { message: string }).message
      }
      setError(errorMessage)
    } finally {
      setGoogleLoading(false)
    }
  }

  // ================================
  // 🔹 Pantalla de éxito
  // ================================
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink p-4">
        <div className="max-w-md w-full text-center bg-surface rounded-3xl border border-line p-8 shadow-2xl">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-bone" />
          </div>
          <h2 className="text-3xl font-black text-bone mb-2">¡Registro Exitoso! 🎉</h2>
          <p className="text-ash mb-6">Tu cuenta de vendedor ha sido creada</p>
          <div className="bg-surface/50 p-5 rounded-xl border border-line mb-6">
            <p className="text-sm text-ash mb-1">Tu código de referido:</p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gold to-gold-soft">
              {generatedCode}
            </p>
          </div>
          <button
            onClick={() => (window.location.href = "/inicio")}
            className="w-full px-6 py-4 bg-gold text-ink font-bold rounded-xl hover:scale-105 transition-all"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-gold to-gold-soft rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-gold/20">
            <span className="font-display text-3xl italic text-ink">A</span>
          </div>
          <h1 className="text-4xl font-black text-bone">Únete a AuraStyle</h1>
          <p className="text-ash mt-2 text-balance">Crea tu cuenta profesional y comienza a ganar comisiones</p>
        </div>

        <div className="bg-surface border border-line rounded-3xl p-8 shadow-2xl">
          {error && (
            <div className="mb-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Botón de Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-slate-800 font-bold rounded-xl hover:bg-slate-100 transition-all mb-6 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {googleLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Conectando con Google...
              </>
            ) : (
              <>
                {/* 👈 Corregido: uso de componente Image de Next.js */}
                <Image
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  width={20} // Añadir width
                  height={20} // Añadir height
                  className="w-5 h-5"
                  priority // Se recomienda para imágenes above the fold
                />
                Continuar con Google
              </>
            )}
          </button>

          {/* Línea divisoria */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-line" />
            <span className="px-3 text-ash/70 text-sm font-medium">o regístrate con email</span>
            <hr className="flex-grow border-line" />
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            {/* Nombre */}
            <div className="relative">
              <User className="absolute left-3 top-4 text-ash/70 w-5 h-5" />
              <input
                type="text"
                placeholder="Nombre completo"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-elevated/60 border border-line text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
              {formData.name && (
                <div className="absolute right-3 top-4">
                  {validations.nameValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-4 text-ash/70 w-5 h-5" />
              <input
                type="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-elevated/60 border border-line text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
              {formData.email && (
                <div className="absolute right-3 top-4">
                  {validations.emailValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              )}
            </div>

            {/* Contraseña */}
            <div className="relative">
              <Lock className="absolute left-3 top-4 text-ash/70 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña (mínimo 6 caracteres)"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="w-full pl-10 pr-20 py-3 rounded-xl bg-elevated/60 border border-line text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {formData.password &&
                  (validations.passwordValid ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ))}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-ash/70 hover:text-bone/80 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="relative">
              <Lock className="absolute left-3 top-4 text-ash/70 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirmar contraseña"
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                className="w-full pl-10 pr-20 py-3 rounded-xl bg-elevated/60 border border-line text-bone placeholder-ash/70 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
              />
              <div className="absolute right-3 top-3 flex items-center gap-2">
                {formData.confirmPassword &&
                  (validations.passwordMatch ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  ))}
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-ash/70 hover:text-bone/80 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={
              loading ||
              !validations.nameValid ||
              !validations.emailValid ||
              !validations.passwordValid ||
              !validations.passwordMatch
            }
            className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-4 bg-gold text-ink font-bold rounded-xl hover:scale-[1.02] transition-all shadow-lg shadow-gold/20 hover:shadow-xl hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Creando tu cuenta...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Crear Cuenta Profesional
              </>
            )}
          </button>

          <p className="text-center text-sm text-ash/70 mt-4">
            ¿Ya tienes cuenta?{" "}
            <a href="/inicio" className="text-gold hover:text-gold-soft font-semibold transition-colors">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}