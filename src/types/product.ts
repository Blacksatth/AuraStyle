export type ProductImage = string | string[];

export interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  subcategory?: string;
  description: string;
  image: ProductImage;
  extraImages?: string[];
  onSale: boolean;
  salePrice?: number;
  brand?: string;
  partner?: string;
  commission?: number;
  createdAt?: string;
  updatedAt?: string;
}
