import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function Manifesto() {
  return (
    <section id="manifiesto" className="border-t border-line bg-surface/30">
      <div className="container-edge grid gap-10 py-16 sm:py-20 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-8">
          <p className="eyebrow">Manifiesto</p>
          <blockquote className="mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] font-light leading-[1.05] text-bone">
            El lujo no es llevar más.
            <br />
            Es <span className="italic text-gold">elegir mejor</span>.
          </blockquote>
        </div>

        <div className="lg:col-span-4 lg:pt-12">
          <p className="text-sm leading-relaxed text-ash">
            Creemos en menos piezas y mejor hechas. Por eso trabajamos con talleres
            independientes, series cortas y materiales que envejecen bien. Lo que compras hoy
            debería acompañarte durante años.
          </p>
          <Link
            href="#productos"
            className="group mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-gold"
          >
            Ver la colección
            <ArrowUpRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  )
}
