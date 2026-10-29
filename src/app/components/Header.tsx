'use client'

import { useEffect, useState, ElementType } from 'react'
import { Menu, X, LogOut, User, ShoppingBag, Home, Phone, Shield, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth'
import { auth } from '../lib/firebase'
import CartIcon from './CartIcon'

type AuthLink = {
  href: string
  label: string
  icon?: ElementType
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const toggleMenu = () => setMenuOpen(!menuOpen)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setMenuOpen(false)
      router.push('/')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleProductLink = () => {
    setMenuOpen(false)
    if (pathname !== "/") {
      router.push("/#productos")
    } else {
      const section = document.querySelector("#productos")
      if (section) {
        section.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  const isAdmin = user?.email === 'santiago.cifuentes@correo.tdea.edu.co'
  const isSeller = user && !isAdmin

  const navLinks = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '#productos', label: 'Productos', icon: ShoppingBag },
    { href: '#contacto', label: 'Contacto', icon: Phone },
  ]

  const authLinks: AuthLink[] = !user
    ? [
      { href: '/inicio', label: 'Iniciar sesión' },
      { href: '/registro', label: 'Registrarse' },
    ]
    : isAdmin
      ? [
        { href: '/admin', label: 'Admin Panel', icon: Shield },
      ]
      : isSeller
        ? [
          { href: '/vendedor-dashboard', label: 'Panel Vendedor', icon: User },
          { href: '/admin', label: 'Admin', icon: Shield },
        ]
        : []

  return (
    <>
      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] lg:hidden"
          onClick={toggleMenu}
        />
      )}

      {/* Sidebar móvil mejorado */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 z-[9999] transform transition-transform duration-300 ease-out ${menuOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:hidden shadow-2xl border-r border-slate-700/30 flex flex-col overflow-hidden`}
      >
        {/* Header del sidebar con logo mejorado */}
        <div className="p-6 flex justify-between items-center border-b border-slate-700/30 bg-slate-800/30 backdrop-blur-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo mejorado con efecto de brillo */}
            <div className="relative w-10 h-10 sm:w-10 sm:h-9 bg-gradient-to-br from-violet-200 via-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/20 group-hover:ring-purple-400/40 transition-all group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  <img 
                    src="https://res.cloudinary.com/ddpexfbjn/image/upload/v1763011838/ChatGPT_Image_13_nov_2025_00_26_57_ennplo.png" 
                    alt="SharkZone Logo" 
                    className="w-9 h-9 sm:w-7 sm:h-7 object-contain relative z-10 drop-shadow-md"
                  />
                </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-white via-purple-100 to-fuchsia-100 bg-clip-text text-transparent">
                SharkZone
              </h2>
              <p className="text-xs text-purple-300/70 font-medium">Premium Store</p>
            </div>
          </div>
          <button 
            onClick={toggleMenu} 
            className="p-2 hover:bg-slate-700/50 rounded-xl transition-all hover:scale-110"
          >
            <X size={22} className="text-slate-300" />
          </button>
        </div>

        {/* Perfil de usuario mejorado */}
        {user && (
          <div className="p-6 border-b border-slate-700/30 bg-gradient-to-br from-slate-800/50 to-transparent flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-full flex items-center justify-center ring-4 ring-purple-500/20 shadow-lg shadow-purple-500/30">
                <User size={24} className="text-white" />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.displayName || 'Usuario'}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
                {isAdmin && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-violet-500/20 text-violet-300 text-[10px] font-semibold rounded-full border border-violet-500/30">
                    ADMIN
                  </span>
                )}
                {isSeller && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-semibold rounded-full border border-blue-500/30">
                    VENDEDOR
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Navegación mejorada */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
          {navLinks.map(({ href, label, icon: Icon }) => (
            label === "Productos" ? (
              <button
                key={href}
                onClick={handleProductLink}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-left text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-transparent rounded-xl transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:via-purple-500/5 group-hover:to-fuchsia-500/10 transition-all duration-300"></div>
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-fuchsia-600 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-purple-500/30 relative z-10">
                  <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <span className="font-semibold relative z-10">{label}</span>
                <ChevronRight size={18} className="ml-auto text-slate-600 group-hover:text-purple-400 transition-all group-hover:translate-x-1 relative z-10" />
              </button>
            ) : (
              <Link
                key={href}
                href={href}
                onClick={toggleMenu}
                className="flex items-center gap-3 px-4 py-3.5 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-transparent rounded-xl transition-all group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:via-purple-500/5 group-hover:to-fuchsia-500/10 transition-all duration-300"></div>
                <div className="w-10 h-10 rounded-xl bg-slate-700/50 group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-fuchsia-600 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-purple-500/30 relative z-10">
                  <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                </div>
                <span className="font-semibold relative z-10">{label}</span>
                <ChevronRight size={18} className="ml-auto text-slate-600 group-hover:text-purple-400 transition-all group-hover:translate-x-1 relative z-10" />
              </Link>
            )
          ))}

          {authLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={toggleMenu}
              className="flex items-center gap-3 px-4 py-3.5 text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-slate-700/50 hover:to-transparent rounded-xl transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:via-purple-500/5 group-hover:to-fuchsia-500/10 transition-all duration-300"></div>
              <div className="w-10 h-10 rounded-xl bg-slate-700/50 group-hover:bg-gradient-to-br group-hover:from-violet-500 group-hover:to-fuchsia-600 flex items-center justify-center transition-all duration-300 shadow-md group-hover:shadow-purple-500/30 relative z-10">
                {Icon ? (
                  <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                ) : (
                  <User size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                )}
              </div>
              <span className="font-semibold relative z-10">{label}</span>
              <ChevronRight size={18} className="ml-auto text-slate-600 group-hover:text-purple-400 transition-all group-hover:translate-x-1 relative z-10" />
            </Link>
          ))}
        </nav>

        {/* Botón de logout mejorado */}
        {user && (
          <div className="p-4 border-t border-slate-700/30 bg-gradient-to-t from-slate-950 to-transparent flex-shrink-0">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-3 px-4 py-4 bg-gradient-to-r from-red-500/10 via-red-500/5 to-red-500/10 text-red-400 hover:from-red-500/20 hover:via-red-500/10 hover:to-red-500/20 rounded-xl transition-all font-bold border border-red-500/20 hover:border-red-500/40 shadow-lg hover:shadow-red-500/20 hover:scale-[1.02]"
            >
              <LogOut size={20} />
              Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      {/* Header principal mejorado */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
            ? 'bg-slate-900/98 backdrop-blur-2xl shadow-2xl border-b border-slate-700/50'
            : 'bg-slate-900 border-b border-slate-800/50'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 lg:h-20">
            {/* Logo y menú hamburguesa */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMenu}
                aria-label="Abrir menú"
                className="lg:hidden p-2.5 hover:bg-slate-800 rounded-xl transition-all hover:scale-110"
              >
                <Menu size={24} className="text-slate-300" />
              </button>

              <Link href="/" className="flex items-center gap-3 group">
                {/* Logo mejorado en header */}
                <div className="relative w-10 h-10 sm:w-10 sm:h-9 bg-gradient-to-br from-violet-200 via-purple-500 to-fuchsia-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/40 ring-2 ring-purple-400/20 group-hover:ring-purple-400/40 transition-all group-hover:scale-110">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                  <img 
                    src="https://res.cloudinary.com/ddpexfbjn/image/upload/v1763011838/ChatGPT_Image_13_nov_2025_00_26_57_ennplo.png" 
                    alt="SharkZone Logo" 
                    className="w-9 h-9 sm:w-7 sm:h-7 object-contain relative z-10 drop-shadow-md"
                  />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-purple-100 to-fuchsia-100 bg-clip-text text-transparent block leading-none group-hover:from-purple-200 group-hover:via-fuchsia-200 group-hover:to-pink-200 transition-all">
                    SharkZone
                  </span>
                  <span className="text-xs text-purple-300/70 font-semibold">Premium Store</span>
                </div>
              </Link>
            </div>

            {/* Navegación desktop mejorada */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map(({ href, label }) =>
                label === "Productos" ? (
                  <button
                    key={href}
                    onClick={handleProductLink}
                    className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-all font-semibold hover:scale-105 relative group"
                  >
                    <span className="relative z-10">{label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10 rounded-xl transition-all"></div>
                  </button>
                ) : (
                  <Link
                    key={href}
                    href={href}
                    className="px-5 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-all font-semibold hover:scale-105 relative group"
                  >
                    <span className="relative z-10">{label}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 to-fuchsia-500/0 group-hover:from-violet-500/10 group-hover:to-fuchsia-500/10 rounded-xl transition-all"></div>
                  </Link>
                )
              )}
            </nav>

            {/* Botones de acción mejorados */}
            <div className="flex items-center gap-2 sm:gap-3">
              <CartIcon />

              {!user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/inicio"
                    className="px-4 py-2.5 text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-xl transition-all font-semibold hover:scale-105"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-700 hover:via-purple-700 hover:to-fuchsia-700 text-white rounded-xl transition-all font-bold shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60 hover:scale-105"
                  >
                    Registrarse
                  </Link>
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  {(isAdmin || isSeller) && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2.5 bg-violet-600/20 text-violet-300 hover:bg-violet-600/30 rounded-xl transition-all font-bold border border-violet-500/30 hover:border-violet-400/50 shadow-md hover:shadow-violet-500/30 hover:scale-105"
                    >
                      <Shield size={18} />
                      Admin
                    </Link>
                  )}

                  {isSeller && (
                    <Link
                      href="/vendedor-dashboard"
                      className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/40 hover:shadow-purple-500/60"
                    >
                      <User size={18} />
                      Vendedor
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-semibold hover:scale-105 border border-transparent hover:border-red-500/20"
                  >
                    <LogOut size={18} />
                    Salir
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}