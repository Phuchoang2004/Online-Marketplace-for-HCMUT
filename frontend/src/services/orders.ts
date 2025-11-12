import { apiClient } from './api';
import { Order } from '@/types/order';

function normalizeOrder(payload: any): Order {
  const o = payload.order ?? payload.data ?? payload;
  const id = o.id ?? o._id ?? o._id?.toString();
  return { ...o, id } as Order;
}

function normalizeOrders(payload: any): Order[] {
  // Backend returns { success: true, orders: [...] }
  const list = payload.orders ?? payload.data ?? payload.items ?? payload;
  if (!Array.isArray(list)) return [];
  return list.map((o) => normalizeOrder(o));
}

export const orderService = {
  async list(type?: string): Promise<Order[]> {
    const query = type ? `?type=${type}` : '';
    const raw = await apiClient.getRaw<any>(`/orders${query}`);
    return normalizeOrders(raw);
  },

  async getById(id: string): Promise<Order> {
    const raw = await apiClient.getRaw<any>(`/orders/${id}`);
    return normalizeOrder(raw);
  },
};

