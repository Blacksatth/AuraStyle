import { MessageCircle, Mail, Clock } from 'lucide-react'

export default function ContactSection() {
  return (
    <section id="contacto" className="border-t border-line py-16 sm:py-20">
      <div className="container-edge">
        <div className="relative overflow-hidden rounded-2xl border border-line bg-surface px-6 py-12 sm:px-10 sm:py-14 lg:px-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gold/[0.08] blur-[90px]"
          />

          <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7">
              <p className="eyebrow">Atención personal</p>
              <h2 className="mt-4 font-display text-4xl font-light leading-[1.05] text-bone sm:text-5xl">
                ¿Hablamos de tu <span className="italic text-gold">próximo look</span>?
              </h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ash">
                Cuéntanos qué buscas y te ayudamos a elegir talla, color y combinaciones. Sin
                prisa, sin presión de venta.
              </p>
            </div>

            <div className="lg:col-span-5 lg:justify-self-end">
              <a
                href="https://wa.me/573025636290?text=Hola%2C%20quiero%20asesor%C3%ADa%20sobre%20una%20pieza%20de%20AuraStyle."
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold group w-full !justify-between sm:w-auto"
              >
                <span className="flex items-center gap-2.5">
                  <MessageCircle size={17} />
                  Escribir por WhatsApp
                </span>
                <span className="text-xs opacity-70 transition-transform duration-300 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>

              <ul className="mt-6 space-y-3 text-xs text-ash">
                <li className="flex items-center gap-2.5">
                  <Clock size={14} className="text-gold" />
                  Lun a sáb · 9:00 — 19:00
                </li>
                <li className="flex items-center gap-2.5">
                  <Mail size={14} className="text-gold" />
                  <a href="mailto:hola@aurastyle.com" className="transition-colors hover:text-bone">
                    hola@aurastyle.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
