import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-edge flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <p className="eyebrow">404</p>
      <h1 className="font-display text-4xl text-bone sm:text-5xl">Página no encontrada</h1>
      <p className="max-w-md text-sm text-ash">
        La página que buscas no existe o fue movida. Vuelve al catálogo para seguir explorando.
      </p>
      <Link href="/" className="btn-gold mt-2">
        Volver al inicio
      </Link>
    </section>
  );
}
