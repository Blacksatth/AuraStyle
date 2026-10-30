'use client'

import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { useRouter } from 'next/navigation'
import {
  Loader2,
  Lock,
  Mail,
  LogIn,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import Image from 'next/image'

export default function LoginForm() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [validations, setValidations] = useState({
    emailValid: false,
    passwordValid: false,
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirige según el rol del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid)
          const userDoc = await getDoc(userDocRef)

          if (userDoc.exists()) {
            const userData = userDoc.data()
            // Redirigir según el rol
            if (userData.role === 'admin') {
              router.push('/admin')
            } else {
              router.push('/')
            }
          }
        } catch (error) {
          console.error('Error al verificar usuario:', error)
        }
      }
    })
    return () => unsubscribe()
  }, [router])

  // Validaciones
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const validatePassword = (password: string) => {
    if (password.length < 6) return false
    if (/\s/.test(password)) return false
    return true
  }

  // Actualiza formulario y validaciones en tiempo real
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }

    setFormData(updated)
    setValidations({
      emailValid: validateEmail(updated.email),
      passwordValid: validatePassword(updated.password),
    })
  }

  const handleLogin = async () => {
    setError('')

    if (!formData.email || !formData.password)
      return setError('Por favor completa todos los campos.')

    if (!validateEmail(formData.email))
      return setError('Por favor ingresa un correo electrónico válido.')

    if (!validatePassword(formData.password))
      return setError(
        'La contraseña debe tener al menos 6 caracteres y no contener espacios.'
      )

    try {
      setLoading(true)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password
      )

      // Verificar si el usuario existe en Firestore y obtener su rol
      const userDocRef = doc(db, 'users', userCredential.user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        setError(
          'Tu cuenta existe en Firebase Authentication, pero no encontramos tu perfil. Contacta al administrador.'
        )
        return
      }

      const userData = userDoc.data()

      // Redirigir según el rol
      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (err: unknown) {
      const errorMap: Record<string, string> = {
        'auth/user-not-found': 'No encontramos una cuenta con esas credenciales. Si te registraste con Google, utiliza el botón "Continuar con Google".',
        'auth/wrong-password': 'Contraseña incorrecta. Si te registraste con Google, utiliza el botón "Continuar con Google".',
        'auth/invalid-email': 'Correo electrónico inválido.',
        'auth/invalid-credential': 'No pudimos iniciar sesión con esos datos. Si te registraste con Google, continúa usando el botón "Continuar con Google".',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde.',
        'auth/network-request-failed': 'Error de conexión. Verifica tu red.',
        'auth/operation-not-allowed': 'El acceso con correo y contraseña no está habilitado.',
      }
      const errorCode = (err as { code?: string })?.code
      setError(errorMap[errorCode || ''] || 'Error al iniciar sesión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    try {
      setLoading(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Verificar si el usuario existe en Firestore
      const userDocRef = doc(db, 'users', user.uid)
      const userDoc = await getDoc(userDocRef)

      if (!userDoc.exists()) {
        // Usuario no registrado - eliminar de Firebase Authentication
        await user.delete()
        setError(
          'Esta cuenta de Google no está registrada. Por favor regístrate primero.'
        )
        return
      }

      // Usuario existe - obtener rol y redirigir
      const userData = userDoc.data()

      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    } catch (err: unknown) {
      const errorCode = (err as { code?: string })?.code

      // Si el usuario cancela el popup, no mostrar error
      if (errorCode === 'auth/popup-closed-by-user' || errorCode === 'auth/cancelled-popup-request') {
        return
      }

      setError('Error al iniciar sesión con Google.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-ink text-bone px-4 overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute w-[900px] h-[900px] bg-gold/10 rounded-full blur-3xl animate-pulse-slow top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute w-[600px] h-[600px] bg-gold-soft/5 rounded-full blur-2xl animate-float top-[10%] left-[60%]"></div>
        <div className="absolute w-[500px] h-[500px] bg-gold-deep/10 rounded-full blur-2xl animate-float-slow top-[70%] left-[20%]"></div>
      </div>

      {/* Contenedor del formulario */}
      <div className="relative z-10 w-full max-w-md bg-elevated/50 backdrop-blur-xl rounded-3xl shadow-2xl border border-line p-8 sm:p-10 animate-fadeIn">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-gold/5">
            <Lock className="w-5 h-5 text-gold" />
          </div>
          <h2 className="mt-4 text-3xl font-light">Iniciar sesión</h2>
          <p className="mt-1.5 text-xs tracking-wide text-ash">
            Accede para gestionar tus pedidos
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 py-3 px-4 mb-4 rounded-xl text-sm animate-shake">
            <p className="font-medium">{error}</p>

            {error.includes('Google') && (
              <p className="mt-2 text-gold-soft">
                Selecciona el botón «Continuar con Google» para acceder a tu cuenta.
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Campo de correo */}
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash w-5 h-5" />
            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              className={`w-full pl-11 pr-10 py-3 rounded-xl border border-line bg-ink/50 text-sm focus:ring-2 focus:outline-none placeholder:text-ash transition ${formData.email
                  ? validations.emailValid
                    ? 'focus:ring-green-500'
                    : 'focus:ring-amber-500'
                  : 'focus:ring-gold'
                }`}
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />

            {formData.email && (
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                {validations.emailValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>
            )}
          </div>

          {/* Campo de contraseña */}
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ash w-5 h-5" />

            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Contraseña"
              className={`w-full pl-11 pr-20 py-3 rounded-xl border border-line bg-ink/50 text-sm focus:ring-2 focus:outline-none placeholder:text-ash transition ${formData.password
                  ? validations.passwordValid
                    ? 'focus:ring-green-500'
                    : 'focus:ring-amber-500'
                  : 'focus:ring-gold'
                }`}
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
            />

            {/* Icono de validación */}
            {formData.password && (
              <div className="absolute right-10 top-1/2 -translate-y-1/2">
                {validations.passwordValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                )}
              </div>
            )}

            {/* Botón mostrar/ocultar */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center rounded-full text-ash hover:text-bone transition"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Botón de login */}
          <button
            onClick={handleLogin}
            disabled={loading || !validations.emailValid || !validations.passwordValid}
            className={`w-full flex justify-center items-center gap-2 py-3 rounded-full font-medium text-sm tracking-wide transition-all duration-300 ${loading || !validations.emailValid || !validations.passwordValid
                ? 'bg-elevated text-ash/60 border border-line cursor-not-allowed'
                : 'bg-gold text-ink hover:bg-gold-soft hover:scale-[1.02]'
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Iniciar sesión
              </>
            )}
          </button>

          {/* Divisor */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-line"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-elevated/60 text-ash">o continúa con</span>
            </div>
          </div>

          {/* Botón Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 rounded-full font-medium text-sm bg-white text-slate-900 hover:bg-gray-100 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
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
          </button>
        </div>

        {/* Enlace de registro */}
        <div className="text-center mt-6">
          <p className="text-ash text-sm">
            ¿No tienes cuenta?
            <a href="/registro" className="text-gold hover:underline ml-1">
              Regístrate aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}