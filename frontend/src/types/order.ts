export type OrderStatus = 'PENDING' | 'SHIPPED' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  product: {
    _id?: string;
    id?: string;
    name: string;
    price: number;
  };
  vendor: string | { _id: string; businessName?: string };
  quantity: number;
  price: number;
  subtotal: number;
  status: OrderStatus;
}

export interface Order {
  id?: string;
  _id?: string;
  user: {
    _id?: string;
    id?: string;
    fullName: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderIndex?: number; // Added for display purposes
}
