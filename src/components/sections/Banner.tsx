'use client'

import { useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, ArrowRight, Sparkles } from 'lucide-react'

const imageUrl =
  'https://res.cloudinary.com/ddpexfbjn/image/upload/v1762982615/g5bxylbppw1umgehbxcj.jpg'

const stats = [
  { value: '500+', label: 'Piezas curadas' },
  { value: '15k', label: 'Clientes' },
  { value: '4.9', label: 'Valoración' },
]

const values = [
  'Piezas atemporales',
  'Envío gratis desde $250.000',
  'Curaduría 1:1',
  'Series cortas',
  'Devoluciones en 30 días',
]

function RotatingSeal() {
  return (
    <div className="pointer-events-none absolute right-5 top-5 z-20 hidden h-24 w-24 place-items-center lg:grid">
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full animate-spin-slow">
        <defs>
          <path
            id="aura-seal-path"
            d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"
          />
        </defs>
        <text className="fill-gold-soft/75 text-[8px] uppercase tracking-[0.32em]">
          <textPath href="#aura-seal-path">
            AuraStyle · Nueva temporada · 2026 ·
          </textPath>
        </text>
      </svg>
      <span className="font-display text-2xl italic text-gold">A</span>
      <span className="absolute inset-2 rounded-full border border-gold/20" />
    </div>
  )
}

export default function Banner() {
  const panelRef = useRef<HTMLDivElement>(null)

  const handleSpotlight = (event: React.MouseEvent<HTMLDivElement>) => {
    const panel = panelRef.current
    if (!panel) return
    const rect = panel.getBoundingClientRect()
    panel.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    panel.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  return (
    <section className="relative pt-5 sm:pt-8">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div
          ref={panelRef}
          onMouseMove={handleSpotlight}
          className="hero-panel relative overflow-hidden rounded-[1.75rem] border border-line/90 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.9)] sm:rounded-[2.25rem]"
        >
          {/* Textura e interacción */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.045] [background-image:linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] [background-size:72px_72px]"
          />
          <div aria-hidden="true" className="hero-spotlight pointer-events-none absolute inset-0" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-24 top-1/2 hidden h-96 w-96 -translate-y-1/2 rounded-full bg-gold/[0.06] blur-[100px] lg:block"
          />

          <div className="relative grid lg:grid-cols-12">
            {/* Imagen */}
            <div className="relative order-1 min-h-[300px] overflow-hidden sm:min-h-[420px] lg:order-2 lg:col-span-6 lg:min-h-[640px]">
              <Image
                src={imageUrl}
                alt="Gorra de la colección AuraStyle"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="animate-slow-zoom object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17181c] via-transparent to-transparent lg:hidden" />
              <div className="absolute inset-0 hidden bg-gradient-to-r from-[#1b1c21] via-[#1b1c21]/25 to-transparent lg:block" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10" />

              <RotatingSeal />

              <div className="absolute inset-x-5 bottom-5 z-20 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7">
                <div className="rounded-2xl border border-bone/15 bg-ink/45 px-4 py-3 backdrop-blur-md">
                  <p className="text-[9px] uppercase tracking-[0.26em] text-gold-soft/90">
                    Edición 01
                  </p>
                  <p className="mt-0.5 font-display text-xl text-bone">Aura Essentials</p>
                </div>
                <Link
                  href="#productos"
                  aria-label="Ver la colección Aura Essentials"
                  className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full border border-bone/25 bg-ink/40 text-bone backdrop-blur-md transition-colors hover:border-gold hover:bg-gold hover:text-ink"
                >
                  <ArrowUpRight size={18} />
                </Link>
              </div>

              <span className="absolute right-3 top-1/2 hidden -translate-y-1/2 rotate-90 text-[9px] uppercase tracking-[0.44em] text-bone/40 lg:block">
                AuraStyle · 2026
              </span>
            </div>

            {/* Texto */}
            <div className="relative order-2 flex flex-col justify-center px-6 py-11 text-center sm:px-10 sm:py-14 lg:order-1 lg:col-span-6 lg:px-14 lg:py-20 lg:text-left">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 left-2 hidden select-none font-display text-[11rem] leading-none text-outline lg:block"
              >
                AURA
              </span>

              <div className="relative">
                <div className="flex items-center justify-center gap-4 lg:justify-start">
                  <span className="h-px w-10 bg-gold" aria-hidden="true" />
                  <span className="eyebrow">Colección 2026</span>
                  <Sparkles size={13} className="text-gold/70" aria-hidden="true" />
                </div>

                <h1 className="animate-rise mt-6 font-display text-[clamp(2.9rem,7.4vw,5.5rem)] font-light leading-[0.93] tracking-[-0.02em] text-bone">
                  Viste tu
                  <br />
                  <span className="italic text-gold">propia</span> aura.
                </h1>

                <p className="animate-rise delay-100 mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-ash sm:text-base lg:mx-0">
                  Una selección editorial de moda y accesorios pensada para durar más que una
                  tendencia. Materiales nobles, cortes precisos y piezas que hablan por ti.
                </p>

                <div className="animate-rise delay-200 mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="#productos" className="btn-gold group w-full sm:w-auto">
                    Explorar colección
                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                  <Link href="#manifiesto" className="btn-ghost w-full sm:w-auto">
                    Nuestra filosofía
                  </Link>
                </div>

                <dl className="animate-rise delay-300 mx-auto mt-10 grid max-w-sm grid-cols-3 border-t border-line/80 pt-6 lg:mx-0">
                  {stats.map((stat, i) => (
                    <div
                      key={stat.label}
                      className={`text-left ${i > 0 ? 'border-l border-line/80 pl-4 sm:pl-6' : ''}`}
                    >
                      <dt className="sr-only">{stat.label}</dt>
                      <dd>
                        <span className="block font-display text-2xl font-light text-bone sm:text-3xl">
                          {stat.value}
                        </span>
                        <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-ash">
                          {stat.label}
                        </span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinta de valores */}
      <div className="mt-8 overflow-hidden border-y border-line/70 bg-surface/40 py-4 sm:mt-10">
        <div className="flex w-max animate-marquee items-center gap-8">
          {[...values, ...values].map((value, index) => (
            <div key={`${value}-${index}`} className="flex items-center gap-8">
              <span className="whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.28em] text-ash">
                {value}
              </span>
              <span className="h-1 w-1 rotate-45 bg-gold" aria-hidden="true" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
