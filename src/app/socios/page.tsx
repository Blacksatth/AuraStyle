"use client";

import { useState, type FormEvent } from "react";
import { User, Building2, Mail, Phone, Info } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PartnerFormData {
  name: string;
  businessName: string;
  email: string;
  phone: string;
}

export default function PartnerApplyPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const data: PartnerFormData = {
      name: String(form.get("name") ?? "").trim(),
      businessName: String(form.get("businessName") ?? "").trim(),
      email: String(form.get("email") ?? "").trim(),
      phone: String(form.get("phone") ?? "").trim(),
    };

    try {
      await addDoc(collection(db, "partner_requests"), {
        ...data,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setSent(true);
    } catch (err) {
      console.error("Error guardando solicitud:", err);
      setError("No pudimos enviar tu solicitud. Intenta de nuevo en unos minutos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-3xl font-bold text-slate-50">Solicitar ser socio</h1>

      <p className="mb-6 text-sm text-slate-400">
        Completa tu información para que revisemos tu solicitud y podamos agregarte como socio
        dentro del marketplace.
      </p>

      {sent ? (
        <div className="flex gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-400">
          <Info className="h-4 w-4 shrink-0" />
          Tu solicitud fue enviada correctamente. Te contactaremos pronto.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div>
            <label htmlFor="partner-name" className="text-sm text-slate-300">
              Nombre completo
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="partner-name"
                name="name"
                required
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 pl-10 text-slate-100"
                placeholder="Ej: Carlos Gómez"
              />
            </div>
          </div>

          <div>
            <label htmlFor="partner-business" className="text-sm text-slate-300">
              Nombre de tu marca
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="partner-business"
                name="businessName"
                required
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 pl-10 text-slate-100"
                placeholder="Ej: BlackZone Store"
              />
            </div>
          </div>

          <div>
            <label htmlFor="partner-email" className="text-sm text-slate-300">
              Correo
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="partner-email"
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 pl-10 text-slate-100"
                placeholder="ejemplo@gmail.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="partner-phone" className="text-sm text-slate-300">
              WhatsApp
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input
                id="partner-phone"
                name="phone"
                required
                className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 p-3 pl-10 text-slate-100"
                placeholder="+57 300 000 0000"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-violet-600 p-3 font-semibold text-white transition hover:bg-violet-500 disabled:bg-slate-700"
          >
            {loading ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      )}
    </div>
  );
}
