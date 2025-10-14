import { apiClient } from './api';
import { Product, CreateProductInput, UpdateProductInput } from '@/types/product';

function normalizeProduct(payload: any): Product {
  const p = payload.product ?? payload.data ?? payload;
  const id = p.id ?? p._id;
  return { ...p, id } as Product;
}

function normalizeProducts(payload: any): Product[] {
  const list = payload.data ?? payload.items ?? payload.products ?? payload;
  return (list as any[]).map((p) => normalizeProduct(p));
}

export const productService = {
  async list(params?: { keyword?: string; category?: string; sortBy?: string; page?: number; limit?: number }): Promise<{ items: Product[]; total?: number; page?: number; limit?: number; totalPages?: number; }>{
    const query = new URLSearchParams();
    if (params?.keyword) query.set('keyword', params.keyword);
    if (params?.category) query.set('category', params.category);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const raw = await apiClient.getRaw<any>(`/products${query.toString() ? `?${query.toString()}` : ''}`);
    const items = normalizeProducts(raw);

    const pagination = raw.pagination ?? undefined;
    return { items, ...(pagination || {}) };
  },

  async getById(id: string): Promise<Product> {
    const raw = await apiClient.getRaw<any>(`/products/${id}`);
    return normalizeProduct(raw);
  },

  async create(input: CreateProductInput): Promise<Product> {
    const raw = await apiClient.postRaw<any>('/products', input);
    return normalizeProduct(raw);
  },

  async createMultipart(formData: FormData): Promise<Product> {
    const raw = await apiClient.postRaw<any>('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeProduct(raw);
  },

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const raw = await apiClient.putRaw<any>(`/products/${id}`, input);
    return normalizeProduct(raw);
  },

  async remove(id: string): Promise<{ message?: string }>{
    const raw = await apiClient.deleteRaw<any>(`/products/${id}`);
    return raw as { message?: string };
  },
};
