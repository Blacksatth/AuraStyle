import React from "react";
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Calendar,
  TrendingUp,
  Building2,
  CreditCard,
  Info,
} from "lucide-react";

export default function PartnerProfile({ partner, userRole, onEditPartner }) {
  const isAdmin = userRole === "admin";
  const isPartner = userRole === "partner";

  if (!partner) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center gap-3 text-sm text-slate-400">
        <Info className="w-4 h-4 text-slate-500" />
        Cargando información del socio...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado / resumen */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center">
            <User className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-50">
              {partner.name}
            </h2>
            <p className="text-sm text-slate-400 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {partner.businessName || "Sin razón social"}
            </p>
            {isPartner && (
              <p className="text-[11px] text-slate-500 mt-1">
                Este es el resumen de tu marca dentro del marketplace.
              </p>
            )}
          </div>
        </div>

        <div className="flex-1" />

        {/* Estado + botón editar */}
        <div className="flex flex-col items-start md:items-end gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              partner.status === "active"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : partner.status === "paused"
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                : "bg-red-500/10 text-red-400 border border-red-500/30"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />
            {partner.status === "active"
              ? "Activo"
              : partner.status === "paused"
              ? "Pausado"
              : "Inactivo"}
          </span>

          {(isAdmin || isPartner) && (
            <button
              onClick={onEditPartner}
              className="text-xs px-3 py-1 rounded-lg border border-slate-700 hover:border-violet-500 hover:text-violet-400 transition"
            >
              Editar información
            </button>
          )}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Ventas totales
            </p>
          </div>
          <p className="text-xl font-semibold text-slate-50">
            $
            {partner.totalSales
              ? partner.totalSales.toLocaleString("es-CO")
              : "0"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Ventas generadas con los productos de tu marca.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Comisión generada
            </p>
          </div>
          <p className="text-xl font-semibold text-emerald-400">
            $
            {partner.totalCommission
              ? partner.totalCommission.toLocaleString("es-CO")
              : "0"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Total acumulado de comisiones para tu marca.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              Comisión actual
            </p>
          </div>
          <p className="text-xl font-semibold text-violet-400">
            {partner.commission ?? 0}%
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Porcentaje aplicado a las ventas de tus productos.
          </p>
        </div>
      </div>

      {/* Detalle de información */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Contacto */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Información de contacto
          </h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-slate-500" />
              {partner.email || "Sin correo registrado"}
            </p>
            <p className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-slate-500" />
              {partner.phone || "Sin teléfono registrado"}
            </p>
            {partner.address && (
              <p className="text-slate-400 text-xs">
                Dirección: {partner.address}
              </p>
            )}
            <p className="flex items-center gap-2 text-slate-400 text-xs mt-2">
              <Calendar className="w-3 h-3" />
              Socio desde:{" "}
              {partner.createdAt
                ? new Date(partner.createdAt).toLocaleDateString("es-CO")
                : "N/D"}
            </p>
          </div>
        </div>

        {/* Pago */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-200 mb-1">
            Información de pagos
          </h3>

          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-slate-300">
              <CreditCard className="w-4 h-4 text-slate-500" />
              Método: {partner.paymentMethod || "No configurado"}
            </p>

            {partner.paymentMethod === "bancario" && (
              <div className="text-xs text-slate-400 space-y-1">
                <p>Banco: {partner.paymentDetails?.bankName || "N/D"}</p>
                <p>
                  Tipo de cuenta:{" "}
                  {partner.paymentDetails?.accountType || "N/D"}
                </p>
                <p>
                  N° cuenta:{" "}
                  {partner.paymentDetails?.accountNumber || "N/D"}
                </p>
                <p>
                  Titular: {partner.paymentDetails?.holderName || "N/D"}
                </p>
              </div>
            )}

            {partner.paymentMethod === "nequi" && (
              <div className="text-xs text-slate-400 space-y-1">
                <p>Nequi: {partner.paymentDetails?.phone || "N/D"}</p>
                <p>
                  Titular: {partner.paymentDetails?.holderName || "N/D"}
                </p>
              </div>
            )}

            {partner.paymentMethod === "daviplata" && (
              <div className="text-xs text-slate-400 space-y-1">
                <p>Daviplata: {partner.paymentDetails?.phone || "N/D"}</p>
                <p>
                  Titular: {partner.paymentDetails?.holderName || "N/D"}
                </p>
              </div>
            )}

            {!partner.paymentMethod && (
              <p className="text-xs text-amber-400">
                Aún no has configurado un método de pago. Agrega uno para
                recibir tus comisiones.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
