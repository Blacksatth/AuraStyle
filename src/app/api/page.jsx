"use client";
import { useState } from "react";
import { User, Building2, Mail, Phone, Info } from "lucide-react";

// Firebase
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PartnerApplyPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = Object.fromEntries(new FormData(e.target).entries());

    try {
      await addDoc(collection(db, "partner_requests"), {
        name: formData.name,
        businessName: formData.businessName,
        email: formData.email,
        phone: formData.phone,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      setSent(true);
    } catch (error) {
      console.error("Error guardando solicitud:", error);
      alert("Hubo un error al enviar la solicitud.");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-slate-50 mb-6">
        Solicitar ser socio
      </h1>

      <p className="text-slate-400 text-sm mb-6">
        Completa tu información para que revisemos tu solicitud y podamos
        agregarte como socio dentro del marketplace.
      </p>

      {sent ? (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 flex gap-2">
          <Info className="w-4" />
          Tu solicitud fue enviada correctamente. Te contactaremos pronto.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Nombre */}
          <div>
            <label className="text-sm text-slate-300">Nombre completo</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                name="name"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 p-3 mt-1 text-slate-100"
                placeholder="Ej: Carlos Gómez"
              />
            </div>
          </div>

          {/* Marca */}
          <div>
            <label className="text-sm text-slate-300">Nombre de tu marca</label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                name="businessName"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 p-3 mt-1 text-slate-100"
                placeholder="Ej: BlackZone Store"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-slate-300">Correo</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                name="email"
                type="email"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 p-3 mt-1 text-slate-100"
                placeholder="ejemplo@gmail.com"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-slate-300">WhatsApp</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <input
                name="phone"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 p-3 mt-1 text-slate-100"
                placeholder="+57 300 000 0000"
              />
            </div>
          </div>

          <button
            disabled={loading}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 p-3 rounded-xl text-white font-semibold transition"
          >
            {loading ? "Enviando..." : "Enviar solicitud"}
          </button>
        </form>
      )}
    </div>
  );
}
