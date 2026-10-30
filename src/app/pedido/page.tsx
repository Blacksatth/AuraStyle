import { Suspense } from "react";
import OrderConfirmation from "./OrderConfirmation";

export const metadata = {
  title: "Pedido confirmado — AuraStyle",
  description: "Resumen de tu compra en AuraStyle.",
};

export default function PedidoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-ash">
          Cargando pedido...
        </div>
      }
    >
      <OrderConfirmation />
    </Suspense>
  );
}
