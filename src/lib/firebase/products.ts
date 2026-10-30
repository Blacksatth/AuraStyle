import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import type { Product } from "@/types/product";

function toProduct(id: string, data: Record<string, unknown>): Product {
  return { ...(data as Omit<Product, "id">), id };
}

/** Obtiene todo el catálogo. Incluye el id del documento. */
export async function getProducts(): Promise<Product[]> {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map((docSnap) => toProduct(docSnap.id, docSnap.data()));
}

/** Obtiene un producto por id. Devuelve null si no existe. */
export async function getProductById(id: string): Promise<Product | null> {
  const snapshot = await getDoc(doc(db, "products", id));
  if (!snapshot.exists()) return null;
  return toProduct(snapshot.id, snapshot.data());
}
