'use client'

import { useEffect, useState, ElementType } from 'react'
import { Menu, X, LogOut, User, ShoppingBag, Home, Phone, Shield, ArrowUpRight } from 'lucide-react'
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

function Wordmark() {
  return (
    <Link href="/" className="group flex items-center gap-3" aria-label="AuraStyle, ir al inicio">
      <span className="relative grid h-10 w-10 place-items-center rounded-full border border-gold/40 transition-colors duration-300 group-hover:border-gold sm:h-11 sm:w-11">
        <span className="absolute inset-[3px] rounded-full border border-gold/10" aria-hidden="true" />
        <span className="font-display text-[22px] italic leading-none text-gold">A</span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[22px] leading-none tracking-[0.04em] text-bone sm:text-[26px]">
          Aura<span className="italic text-gold">Style</span>
        </span>
        <span className="mt-1.5 hidden text-[9px] font-medium uppercase tracking-[0.34em] text-ash sm:block">
          Moda con carácter
        </span>
      </span>
    </Link>
  )
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
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

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
    if (pathname !== '/') {
      router.push('/#productos')
    } else {
      const section = document.querySelector('#productos')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' })
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
      {/* Barra de anuncio */}
      <div className="relative z-[60] bg-gold text-ink">
        <div className="container-edge flex h-9 items-center justify-center">
          <p className="text-center text-[10px] font-medium uppercase tracking-[0.2em] sm:text-[11px]">
            Envío gratis desde $250.000
            <span className="mx-2 opacity-40">·</span>
            Devoluciones en 30 días
          </p>
        </div>
      </div>

      {/* Overlay móvil */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-[9998] bg-ink/80 backdrop-blur-sm lg:hidden"
          onClick={toggleMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar móvil */}
      <aside
        className={`fixed inset-y-0 left-0 z-[9999] flex w-[86%] max-w-sm flex-col border-r border-line bg-ink transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden ${menuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        aria-hidden={!menuOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <Wordmark />
          <button
            onClick={toggleMenu}
            aria-label="Cerrar menú"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        {user && (
          <div className="border-b border-line px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-gold/10 text-gold">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-bone">{user.displayName || 'Usuario'}</p>
                <p className="truncate text-xs text-ash">{user.email}</p>
                {isAdmin && (
                  <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
                    Administrador
                  </span>
                )}
                {isSeller && (
                  <span className="mt-1 inline-block text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
                    Vendedor
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-6 py-8">
          <p className="eyebrow mb-6">Navegación</p>
          <ul className="space-y-1">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                {label === 'Productos' ? (
                  <button
                    onClick={handleProductLink}
                    className="group flex w-full items-center justify-between border-b border-line/70 py-4 text-left font-display text-3xl text-bone transition-colors hover:text-gold"
                  >
                    {label}
                    <ArrowUpRight size={18} className="text-ash transition-all group-hover:translate-x-1 group-hover:text-gold" />
                  </button>
                ) : (
                  <Link
                    href={href}
                    onClick={toggleMenu}
                    className="group flex items-center justify-between border-b border-line/70 py-4 font-display text-3xl text-bone transition-colors hover:text-gold"
                  >
                    {label}
                    <ArrowUpRight size={18} className="text-ash transition-all group-hover:translate-x-1 group-hover:text-gold" />
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {authLinks.length > 0 && (
            <div className="mt-10">
              <p className="eyebrow mb-4">Tu cuenta</p>
              <div className="space-y-2">
                {authLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={toggleMenu}
                    className="flex items-center gap-3 rounded-full border border-line px-5 py-3.5 text-sm text-bone transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    {Icon ? <Icon size={16} /> : <User size={16} />}
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </nav>

        {user && (
          <div className="border-t border-line px-6 py-6">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-line px-5 py-3.5 text-sm text-ash transition-colors hover:border-red-400/40 hover:text-red-300"
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        )}

        <div className="border-t border-line px-6 py-6">
          <p className="text-xs leading-relaxed text-ash">
            Asesoría personalizada por WhatsApp
            <br />
            Lun a sáb · 9:00 — 19:00
          </p>
        </div>
      </aside>

      {/* Header principal */}
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-500 ${scrolled
            ? 'border-line/80 bg-ink/90 backdrop-blur-xl'
            : 'border-transparent bg-ink/70 backdrop-blur-md'
          }`}
      >
        <div className="container-edge flex h-18 items-center justify-between gap-4 sm:h-20">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMenu}
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-bone transition-colors hover:border-gold/50 hover:text-gold lg:hidden"
            >
              <Menu size={18} />
            </button>
            <Wordmark />
          </div>

          <nav className="hidden items-center gap-10 lg:flex" aria-label="Navegación principal">
            {navLinks.map(({ href, label }) =>
              label === 'Productos' ? (
                <button
                  key={href}
                  onClick={handleProductLink}
                  className="link-underline text-[13px] font-medium uppercase tracking-[0.16em] text-ash transition-colors hover:text-bone"
                >
                  {label}
                </button>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="link-underline text-[13px] font-medium uppercase tracking-[0.16em] text-ash transition-colors hover:text-bone"
                >
                  {label}
                </Link>
              )
            )}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <CartIcon />

            {!user ? (
              <div className="hidden items-center gap-3 sm:flex">
                <Link
                  href="/inicio"
                  className="text-[13px] font-medium uppercase tracking-[0.16em] text-ash transition-colors hover:text-bone"
                >
                  Ingresar
                </Link>
                <Link
                  href="/registro"
                  className="rounded-full border border-gold/50 px-5 py-2.5 text-[13px] font-medium uppercase tracking-[0.14em] text-gold transition-all duration-300 hover:bg-gold hover:text-ink"
                >
                  Crear cuenta
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                {(isAdmin || isSeller) && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 rounded-full border border-line px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ash transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    <Shield size={15} />
                    Admin
                  </Link>
                )}

                {isSeller && (
                  <Link
                    href="/vendedor-dashboard"
                    className="flex items-center gap-2 rounded-full bg-gold px-4 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-ink transition-colors hover:bg-gold-soft"
                  >
                    <User size={15} />
                    Vendedor
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  aria-label="Cerrar sesión"
                  className="grid h-10 w-10 place-items-center rounded-full border border-line text-ash transition-colors hover:border-red-400/40 hover:text-red-300"
                >
                  <LogOut size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
