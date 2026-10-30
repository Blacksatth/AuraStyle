import type { Product } from "@/types/product";

const FALLBACK_IMAGE = "/placeholder.svg";

/** Normaliza el campo image de un producto (string o string[]) a una URL usable. */
export function getProductImage(
  image: Product["image"] | null | undefined,
  fallback: string = FALLBACK_IMAGE,
): string {
  if (Array.isArray(image)) return image[0] ?? fallback;
  return image || fallback;
}

/** Devuelve todas las imágenes de un producto, principal + extras. */
export function getProductImages(product: Product): string[] {
  const main = Array.isArray(product.image) ? product.image : [product.image];
  return [...main, ...(product.extraImages ?? [])].filter(Boolean);
}
