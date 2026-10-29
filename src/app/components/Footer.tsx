import Link from 'next/link'
import { Mail, Phone, Instagram, Facebook, MapPin } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  const columns = [
    {
      title: 'Tienda',
      links: [
        { label: 'Inicio', href: '/' },
        { label: 'Productos', href: '#productos' },
        { label: 'Novedades', href: '#productos' },
      ],
    },
    {
      title: 'Ayuda',
      links: [
        { label: 'Preguntas frecuentes', href: '/faq' },
        { label: 'Envíos y devoluciones', href: '/shipping' },
        { label: 'Contacto', href: '/contact' },
        { label: 'Privacidad', href: '/privacy' },
      ],
    },
  ]

  return (
    <footer className="border-t border-line bg-ink">
      <div className="container-edge grid gap-12 py-14 sm:py-16 lg:grid-cols-12">
        {/* Marca */}
        <div className="lg:col-span-4">
          <Link href="/" className="group inline-flex items-center gap-3" aria-label="AuraStyle, ir al inicio">
            <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/40 transition-colors group-hover:border-gold">
              <span className="font-display text-[22px] italic leading-none text-gold">A</span>
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[26px] tracking-[0.04em] text-bone">
                Aura<span className="italic text-gold">Style</span>
              </span>
              <span className="mt-1.5 text-[9px] uppercase tracking-[0.34em] text-ash">
                Moda con carácter
              </span>
            </span>
          </Link>

          <p className="mt-6 max-w-xs text-sm leading-relaxed text-ash">
            Moda y accesorios seleccionados uno a uno. Series cortas, materiales nobles y un
            estilo que no necesita ruido.
          </p>

          <div className="mt-7 flex gap-2.5">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AuraStyle en Instagram"
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
            >
              <Instagram size={16} />
            </a>
            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="AuraStyle en Facebook"
              className="grid h-10 w-10 place-items-center rounded-full border border-line text-ash transition-colors hover:border-gold/50 hover:text-gold"
            >
              <Facebook size={16} />
            </a>
          </div>
        </div>

        {/* Enlaces */}
        {columns.map((column) => (
          <div key={column.title} className="lg:col-span-2">
            <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-bone">
              {column.title}
            </h3>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-ash transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Contacto */}
        <div className="lg:col-span-4">
          <h3 className="text-[11px] font-medium uppercase tracking-[0.22em] text-bone">
            Contacto
          </h3>
          <ul className="mt-5 space-y-3.5 text-sm text-ash">
            <li className="flex items-start gap-3">
              <Mail size={15} className="mt-0.5 flex-shrink-0 text-gold" />
              <a href="mailto:hola@aurastyle.com" className="transition-colors hover:text-gold">
                hola@aurastyle.com
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Phone size={15} className="mt-0.5 flex-shrink-0 text-gold" />
              <a href="tel:+573025636290" className="transition-colors hover:text-gold">
                +57 302 563 6290
              </a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin size={15} className="mt-0.5 flex-shrink-0 text-gold" />
              <span>
                Bogotá, Colombia
                <br />
                Envíos a todo el país
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-edge flex flex-col items-center justify-between gap-3 py-6 text-[11px] text-ash sm:flex-row">
          <p>© {year} AuraStyle. Todos los derechos reservados.</p>
          <p className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />
            Diseñado en Colombia
          </p>
        </div>
      </div>
    </footer>
  )
}
