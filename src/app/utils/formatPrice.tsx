// utils/formatPrice.ts
export const formatPrice = (value: number | undefined) => {
  if (value === undefined || isNaN(value)) return "$0"
  return `$${value.toLocaleString("es-CO")}`
}
