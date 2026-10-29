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
      <div className="admin-card flex items-center gap-3 p-6 text-sm text-ash">
        <Info className="h-4 w-4 text-gold" />
        Cargando información del socio...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="admin-card flex flex-col items-start gap-4 p-5 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-gold/10">
            <User className="h-6 w-6 text-gold" />
          </div>
          <div>
            <h2 className="font-display text-2xl text-bone">
              {partner.name}
            </h2>
            <p className="flex items-center gap-1 text-sm text-ash">
              <Building2 className="h-3 w-3" />
              {partner.businessName || "Sin razón social"}
            </p>
            {isPartner && (
              <p className="mt-1 text-[11px] text-ash">
                Este es el resumen de tu marca dentro del marketplace.
              </p>
            )}
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex flex-col items-start gap-2 md:items-end">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
              partner.status === "active"
                ? "border border-gold/30 bg-gold/10 text-gold"
                : partner.status === "paused"
                ? "border border-line bg-elevated text-ash"
                : "border border-red-400/30 bg-red-500/10 text-red-300"
            }`}
          >
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
            {partner.status === "active"
              ? "Activo"
              : partner.status === "paused"
              ? "Pausado"
              : "Inactivo"}
          </span>

          {(isAdmin || isPartner) && (
            <button
              onClick={onEditPartner}
              className="rounded-full border border-line px-3 py-1 text-xs text-ash transition hover:border-gold/50 hover:text-gold"
            >
              Editar información
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="admin-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1 text-xs text-ash">
              <DollarSign className="h-3 w-3" />
              Ventas totales
            </p>
          </div>
          <p className="font-display text-2xl text-bone">
            $
            {partner.totalSales
              ? partner.totalSales.toLocaleString("es-CO")
              : "0"}
          </p>
          <p className="mt-1 text-[11px] text-ash">
            Ventas generadas con los productos de tu marca.
          </p>
        </div>

        <div className="admin-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1 text-xs text-ash">
              <TrendingUp className="h-3 w-3" />
              Comisión generada
            </p>
          </div>
          <p className="font-display text-2xl text-gold">
            $
            {partner.totalCommission
              ? partner.totalCommission.toLocaleString("es-CO")
              : "0"}
          </p>
          <p className="mt-1 text-[11px] text-ash">
            Total acumulado de comisiones para tu marca.
          </p>
        </div>

        <div className="admin-card p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1 text-xs text-ash">
              <DollarSign className="h-3 w-3" />
              Comisión actual
            </p>
          </div>
          <p className="font-display text-2xl text-gold">
            {partner.commission ?? 0}%
          </p>
          <p className="mt-1 text-[11px] text-ash">
            Porcentaje aplicado a las ventas de tus productos.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="admin-card space-y-3 p-4">
          <h3 className="mb-1 font-display text-xl text-bone">
            Información de contacto
          </h3>
          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-bone">
              <Mail className="h-4 w-4 text-ash" />
              {partner.email || "Sin correo registrado"}
            </p>
            <p className="flex items-center gap-2 text-bone">
              <Phone className="h-4 w-4 text-ash" />
              {partner.phone || "Sin teléfono registrado"}
            </p>
            {partner.address && (
              <p className="text-xs text-ash">
                Dirección: {partner.address}
              </p>
            )}
            <p className="mt-2 flex items-center gap-2 text-xs text-ash">
              <Calendar className="h-3 w-3" />
              Socio desde:{" "}
              {partner.createdAt
                ? new Date(partner.createdAt).toLocaleDateString("es-CO")
                : "N/D"}
            </p>
          </div>
        </div>

        <div className="admin-card space-y-3 p-4">
          <h3 className="mb-1 font-display text-xl text-bone">
            Información de pagos
          </h3>

          <div className="space-y-2 text-sm">
            <p className="flex items-center gap-2 text-bone">
              <CreditCard className="h-4 w-4 text-ash" />
              Método: {partner.paymentMethod || "No configurado"}
            </p>

            {partner.paymentMethod === "bancario" && (
              <div className="space-y-1 text-xs text-ash">
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
              <div className="space-y-1 text-xs text-ash">
                <p>Nequi: {partner.paymentDetails?.phone || "N/D"}</p>
                <p>
                  Titular: {partner.paymentDetails?.holderName || "N/D"}
                </p>
              </div>
            )}

            {partner.paymentMethod === "daviplata" && (
              <div className="space-y-1 text-xs text-ash">
                <p>Daviplata: {partner.paymentDetails?.phone || "N/D"}</p>
                <p>
                  Titular: {partner.paymentDetails?.holderName || "N/D"}
                </p>
              </div>
            )}

            {!partner.paymentMethod && (
              <p className="text-xs text-gold">
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
