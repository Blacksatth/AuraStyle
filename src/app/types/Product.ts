// src/types/Product.ts
export interface Product {
  id: string
  name: string
  price: number
  stock: number
  category: string
  subcategory: string
  description: string
  image: string
  extraImages: string[]
  onSale: boolean
  salePrice?: number
  createdAt?: Date | string | unknown
  
}
