import { apiClient } from './api';
import { Cart } from '@/types/cart';

export const cartService = {
  async getCart(): Promise<Cart> {
    const cart = await apiClient.getRaw<Cart>('/api/cart');
    return cart || { items: [] }; 
  },

  async addToCart(productId: string, quantity: number): Promise<Cart> {
    const updatedCart = await apiClient.postRaw<Cart>('/api/cart/add', {
      productId,
      quantity,
    });
    return updatedCart;
  },

  async updateQuantity(productId: string, quantity: number): Promise<Cart> {
    const updatedCart = await apiClient.putRaw<Cart>(`/api/cart/${productId}`, { quantity });
    return updatedCart;
  },

  async removeFromCart(productId: string): Promise<Cart> {
    const updatedCart = await apiClient.deleteRaw<Cart>(`/api/cart/${productId}`);
    return updatedCart;
  },

  async checkout(): Promise<{ success: boolean; message: string; orders: any[] }> {
    const result = await apiClient.postRaw<{ success: boolean; message: string; orders: any[] }>(
      '/api/cart/checkout'
    );
    return result;
  },
};