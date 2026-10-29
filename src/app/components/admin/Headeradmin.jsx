import React from 'react';
import {
  Menu,
  Package,
  DollarSign,
  Users as UsersIcon,
  User as UserIcon,
} from 'lucide-react';

export default function Headeradmin({
  userRole,
  mobileMenuOpen,
  setMobileMenuOpen,
  activeTab,
  setActiveTab,
}) {
  const isAdmin = userRole === "admin";
  const isPartner = userRole === "socio";

  const title =
    userRole === "admin"
      ? "Panel Admin"
      : isPartner
      ? "Panel Socio"
      : "Panel Vendedor";

  return (
    <div>
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-violet-400">
            {title}
          </h1>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-slate-900 border-t border-slate-800 px-4 py-3">
            <div className="flex flex-col space-y-2">
              {/* Productos */}
              <button
                onClick={() => {
                  setActiveTab("products");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  activeTab === "products"
                    ? "bg-slate-800 text-violet-400"
                    : "text-slate-400"
                }`}
              >
                <Package className="w-4 h-4" /> Productos
              </button>

              {/* Ventas */}
              <button
                onClick={() => {
                  setActiveTab("sales");
                  setMobileMenuOpen(false);
                }}
                className={`flex items-center gap-2 p-2 rounded-lg ${
                  activeTab === "sales"
                    ? "bg-slate-800 text-violet-400"
                    : "text-slate-400"
                }`}
              >
                <DollarSign className="w-4 h-4" /> Ventas
              </button>

              {/* PERFIL SOCIO / MI MARCA */}
              {isPartner && (
                <button
                  onClick={() => {
                    setActiveTab("partnerProfile");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    activeTab === "partnerProfile"
                      ? "bg-slate-800 text-violet-400"
                      : "text-slate-400"
                  }`}
                >
                  <UserIcon className="w-4 h-4" /> Mi marca
                </button>
              )}

              {/* Usuarios solo admin */}
              {isAdmin && (
                <button
                  onClick={() => {
                    setActiveTab("users");
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-2 rounded-lg ${
                    activeTab === "users"
                      ? "bg-slate-800 text-violet-400"
                      : "text-slate-400"
                  }`}
                >
                  <UsersIcon className="w-4 h-4" /> Usuarios
                </button>
              )}
            </div>
          </div>
        )}

        {/* DESKTOP TABS */}
        <div className="hidden lg:flex px-6 gap-6 border-t border-slate-800">
          {/* Productos */}
          <button
            onClick={() => setActiveTab("products")}
            className={`py-3 font-medium border-b-2 -mb-px ${
              activeTab === "products"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-slate-400"
            }`}
          >
            <Package className="inline-block mr-2 w-4 h-4" /> Productos
          </button>

          {/* Ventas */}
          <button
            onClick={() => setActiveTab("sales")}
            className={`py-3 font-medium border-b-2 -mb-px ${
              activeTab === "sales"
                ? "border-violet-500 text-violet-400"
                : "border-transparent text-slate-400"
            }`}
          >
            <DollarSign className="inline-block mr-2 w-4 h-4" /> Ventas
          </button>

          {/* PERFIL SOCIO */}
          {isPartner || isAdmin&& (
            <button
              onClick={() => setActiveTab("partnerProfile")}
              className={`py-3 font-medium border-b-2 -mb-px ${
                activeTab === "partnerProfile"
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-slate-400"
              }`}
            >
              <UserIcon className="inline-block mr-2 w-4 h-4" /> Mi marca
            </button>
          )}

          {/* Usuarios admin */}
          {isAdmin && (
            <button
              onClick={() => setActiveTab("users")}
              className={`py-3 font-medium border-b-2 -mb-px ${
                activeTab === "users"
                  ? "border-violet-500 text-violet-400"
                  : "border-transparent text-slate-400"
              }`}
            >
              <UsersIcon className="inline-block mr-2 w-4 h-4" /> Usuarios
            </button>
          )}
        </div>
      </div>
    </div>
  );
}