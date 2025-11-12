import { BaseEntity } from './common';
import { ProductImage } from './product';
export interface CartProduct {
  id: string;
  name: string;
  price: number;
  images: ProductImage[];
  stock: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface Cart extends BaseEntity {
  user: string;
  items: CartItem[];
}