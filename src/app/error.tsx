"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-edge flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="eyebrow">Error</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl">Algo salió mal</h1>
      <p className="max-w-md text-sm text-ash">
        No pudimos cargar esta sección. Intenta de nuevo o vuelve al inicio.
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <button onClick={reset} className="btn-gold">
          Reintentar
        </button>
        <Link
          href="/"
          className="rounded-full border border-line px-5 py-3 text-sm text-ash transition-colors hover:border-gold/50 hover:text-gold"
        >
          Ir al inicio
        </Link>
      </div>
    </section>
  );
}
