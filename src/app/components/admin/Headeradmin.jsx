import React from 'react';
import {
  Menu,
  Package,
  DollarSign,
  Users as UsersIcon,
  User as UserIcon,
  X,
} from 'lucide-react';

export default function Headeradmin({
  userRole,
  mobileMenuOpen,
  setMobileMenuOpen,
  activeTab,
  setActiveTab,
}) {
  const isAdmin = userRole === "admin";
  const isPartner = userRole === "socio" || userRole === "partner";

  const title =
    userRole === "admin"
      ? "Panel de administración"
      : isPartner
      ? "Panel de socio"
      : "Panel de vendedor";

  const subtitle =
    userRole === "admin"
      ? "Catálogo, pedidos y cuentas"
      : isPartner
      ? "Tu marca y tus piezas"
      : "Inventario y ventas";

  const tabs = [
    { id: "products", label: "Productos", icon: Package, show: true },
    { id: "sales", label: "Ventas", icon: DollarSign, show: true },
    { id: "partnerProfile", label: "Mi marca", icon: UserIcon, show: isPartner || isAdmin },
    { id: "users", label: "Usuarios", icon: UsersIcon, show: isAdmin },
  ];

  const tabClass = (id, mobile = false) => {
    const active = activeTab === id;
    if (mobile) {
      return `flex items-center gap-3 rounded-full border px-5 py-3 text-sm transition-colors ${
        active
          ? "border-gold/50 bg-gold/10 text-gold"
          : "border-line text-ash hover:border-gold/40 hover:text-bone"
      }`;
    }
    return `flex items-center gap-2 border-b-2 py-4 text-[13px] font-medium uppercase tracking-[0.14em] transition-colors ${
      active
        ? "border-gold text-gold"
        : "border-transparent text-ash hover:text-bone"
    }`;
  };

  return (
    <div className="sticky top-[73px] z-40 border-b border-line bg-ink/90 backdrop-blur-xl sm:top-[81px]">
      <div className="container-edge flex items-center justify-between py-5">
        <div>
          <p className="eyebrow mb-1">AuraStyle</p>
          <h1 className="font-display text-3xl leading-none text-bone sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-ash">{subtitle}</p>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Cerrar menú del panel" : "Abrir menú del panel"}
          className="grid h-10 w-10 place-items-center rounded-full border border-line text-bone transition-colors hover:border-gold/50 hover:text-gold lg:hidden"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-line px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-2">
            {tabs.filter((tab) => tab.show).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setMobileMenuOpen(false);
                }}
                className={tabClass(id, true)}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container-edge hidden gap-8 lg:flex">
        {tabs.filter((tab) => tab.show).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={tabClass(id)}
          >
            <Icon className="inline-block w-4 h-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
