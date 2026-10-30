const copFormatter = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

/** Formatea un número como precio colombiano sin símbolo: 1.250.000 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "0";
  return copFormatter.format(value);
}

/** Formatea un número como precio con símbolo: $1.250.000 */
export function formatPrice(value: number | null | undefined): string {
  return `$${formatNumber(value)}`;
}

/** Calcula el porcentaje de descuento entre precio y precio de oferta. */
export function calculateDiscount(
  price: number,
  salePrice?: number | null,
): number {
  if (!salePrice || salePrice >= price || price <= 0) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/** Capitaliza la primera letra de un texto. */
export function capitalize(text?: string | null): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
