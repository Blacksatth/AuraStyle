"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";
import { db } from "@/lib/firebase/client";
import { formatPrice } from "@/lib/format";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total?: number;
  status?: string;
  items?: OrderItem[];
  shipping?: { fullName?: string; email?: string };
}

export default function OrderConfirmation() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(orderId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    getDoc(doc(db, "orders", orderId))
      .then((snapshot) => {
        if (cancelled) return;
        if (!snapshot.exists()) {
          setError("No encontramos este pedido.");
          return;
        }
        setOrder({ id: snapshot.id, ...(snapshot.data() as Omit<Order, "id">) });
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Error cargando el pedido:", err);
          setError("No pudimos cargar el pedido.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ash">
        Cargando pedido...
      </div>
    );
  }

  if (!orderId || error) {
    return (
      <section className="container-edge flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <Package className="h-10 w-10 text-ash" />
        <h1 className="font-display text-3xl text-bone">Pedido no disponible</h1>
        <p className="max-w-md text-sm text-ash">
          {error || "No recibimos un identificador de pedido válido."}
        </p>
        <Link href="/" className="btn-gold mt-2">
          Volver a la tienda
        </Link>
      </section>
    );
  }

  return (
    <section className="container-edge flex min-h-[60vh] flex-col items-center justify-center py-16">
      <div className="w-full max-w-xl rounded-2xl border border-line bg-surface p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          <div>
            <h1 className="font-display text-3xl text-bone">¡Gracias por tu compra!</h1>
            <p className="text-sm text-ash">Tu pedido fue registrado correctamente.</p>
          </div>
        </div>

        <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-ash">Pedido</dt>
            <dd className="font-mono text-bone">{order?.id ?? orderId}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-ash">Estado</dt>
            <dd className="text-bone">{order?.status ?? "pending"}</dd>
          </div>
          {order?.shipping?.fullName && (
            <div className="flex justify-between gap-4">
              <dt className="text-ash">Cliente</dt>
              <dd className="text-bone">{order.shipping.fullName}</dd>
            </div>
          )}
          {typeof order?.total === "number" && (
            <div className="flex justify-between gap-4 border-t border-line pt-3 text-base">
              <dt className="text-ash">Total</dt>
              <dd className="font-medium text-gold">{formatPrice(order.total)}</dd>
            </div>
          )}
        </dl>

        {order?.items && order.items.length > 0 && (
          <ul className="mt-6 space-y-2 border-t border-line pt-6 text-sm">
            {order.items.map((item, index) => (
              <li key={`${item.name}-${index}`} className="flex justify-between gap-4">
                <span className="text-ash">
                  {item.quantity} × {item.name}
                </span>
                <span className="text-bone">{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-gold hover:text-gold-soft"
        >
          Seguir comprando
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
