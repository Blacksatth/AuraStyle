'use client'

import { Button } from "../components/ui/button"
import { ArrowRight, Truck, RotateCcw, Headphones, Sparkles } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'

export default function FashionBanner() {
  // 🔹 Reemplaza esta URL con tu imagen de Cloudinary
  const imageUrl = "https://res.cloudinary.com/ddpexfbjn/image/upload/v1763011838/ChatGPT_Image_13_nov_2025_00_26_57_ennplo.png"

  return (
    <div className="bg-gradient-to-b from-slate-950 to-slate-900 rounded-3xl overflow-hidden shadow-2xl">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center">
          {/* Imagen (arriba en móvil) */}
          <div className="relative order-1 lg:order-2">
            <div className="aspect-[4/3] sm:aspect-[3/2] lg:aspect-square rounded-2xl overflow-hidden shadow-2xl bg-slate-800 border border-slate-700/50 relative group">
              <Image
                src={imageUrl}
                alt="Colección fashion exclusiva"
                fill
                className="object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
              
              {/* Efecto de brillo al hacer hover */}
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/0 via-fuchsia-500/0 to-pink-500/0 group-hover:from-violet-500/10 group-hover:via-fuchsia-500/10 group-hover:to-pink-500/10 transition-all duration-700"></div>
            </div>

            {/* Badge flotante mejorado */}
            <div className="absolute -bottom-3 sm:-bottom-4 left-3 sm:left-4 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 rounded-xl sm:rounded-2xl p-2 sm:p-4 shadow-2xl shadow-purple-500/50 border border-purple-400/30 max-w-[180px] sm:max-w-none backdrop-blur-sm hover:scale-105 transition-transform">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center animate-pulse">
                  <Sparkles className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] sm:text-sm font-black text-white leading-tight">
                    Nueva Colección
                  </div>
                  <div className="text-[8px] sm:text-xs text-purple-100 font-medium">
                    2025
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Texto */}
          <div className="space-y-3 sm:space-y-4 lg:space-y-6 order-2 lg:order-1 text-center lg:text-left">
            {/* Badge superior */}
            <div className="inline-flex items-center gap-2 px-2 py-1 sm:px-4 sm:py-2 bg-violet-500/10 border border-violet-500/30 rounded-full backdrop-blur-sm hover:bg-violet-500/20 transition-all">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-violet-400 animate-pulse" />
              <span className="text-[10px] sm:text-sm font-bold text-violet-400">
                Colección Exclusiva 2025
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h1 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-black text-white leading-tight sm:leading-snug">
                Estilo que <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-500 animate-gradient">
                  define
                </span>
                <br />
                tu esencia
              </h1>

              <p className="text-xs sm:text-sm lg:text-lg text-slate-400 max-w-md mx-auto lg:mx-0 leading-relaxed">
                Descubre piezas únicas que elevan tu estilo personal y te hacen destacar en cada momento.
              </p>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2 sm:gap-4">
              <Link href="#productos" className="w-full sm:w-auto">
                <Button
                  size="sm"
                  className="group relative overflow-hidden bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white border-0 px-4 py-2 sm:px-8 sm:py-3 rounded-xl transition-all hover:scale-105 shadow-xl shadow-purple-500/40 text-xs sm:text-base font-bold w-full"
                >
                  <span className="relative z-10 flex items-center justify-center">
                    Ver Colección
                    <ArrowRight className="ml-2 h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </Link>

              <Button
                variant="outline"
                size="sm"
                className="px-4 py-2 sm:px-8 sm:py-3 border-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-violet-500/50 rounded-xl font-bold text-xs sm:text-base w-full sm:w-auto transition-all hover:scale-105"
              >
                Novedades
              </Button>
            </div>

            {/* Stats mejorados */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4">
              {[
                { number: "500+", label: "Productos" },
                { number: "15K+", label: "Clientes" },
                { number: "98%", label: "Satisfacción" }
              ].map((stat, i) => (
                <div key={i} className="text-center group cursor-default">
                  <div className="text-lg sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500 group-hover:from-fuchsia-500 group-hover:to-pink-500 transition-all">
                    {stat.number}
                  </div>
                  <div className="text-[10px] sm:text-sm text-slate-400 font-medium group-hover:text-slate-300 transition-colors">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section mejorada */}
      <div className="border-t border-slate-800/50 bg-gradient-to-b from-slate-930 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {[
              {
                icon: Truck,
                title: "Envío Gratis",
                desc: "Pedidos superiores a $100",
                shortDesc: "+ $100",
                gradient: "from-violet-600/20 to-fuchsia-600/20",
                iconColor: "text-violet-400",
                hoverBorder: "hover:border-violet-500/50"
              },
              {
                icon: RotateCcw,
                title: "Devoluciones",
                desc: "30 días sin preguntas",
                shortDesc: "30 días",
                gradient: "from-fuchsia-600/20 to-pink-600/20",
                iconColor: "text-fuchsia-400",
                hoverBorder: "hover:border-fuchsia-500/50"
              },
              {
                icon: Headphones,
                title: "Soporte 24/7",
                desc: "Siempre a tu disposición",
                shortDesc: "24/7",
                gradient: "from-violet-600/20 to-purple-600/20",
                iconColor: "text-violet-400",
                hoverBorder: "hover:border-violet-500/50"
              }
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <div
                  key={i}
                  className={`group flex flex-col items-center gap-1 sm:gap-4 p-2 sm:p-5 bg-slate-800/30 backdrop-blur-sm rounded-xl hover:bg-slate-800/60 transition-all duration-300 border border-slate-700/50 ${feature.hoverBorder} cursor-default hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1`}
                >
                  <div className={`w-8 h-8 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg group-hover:shadow-purple-500/30`}>
                    <Icon className={`w-4 h-4 sm:w-7 sm:h-7 ${feature.iconColor}`} />
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-white text-[10px] sm:text-base group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-fuchsia-400 transition-all">
                      {feature.title}
                    </div>
                    <div className="text-[8px] sm:text-sm text-slate-400 hidden sm:block group-hover:text-slate-300 transition-colors">
                      {feature.desc}
                    </div>
                    <div className="text-[8px] sm:text-sm text-slate-400 sm:hidden">
                      {feature.shortDesc}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}