import { apiClient } from './api';

export interface Category {
  id: string;
  name: string;
  parent?: string | null;
}

function normalizeCategory(payload: any): Category {
  const c = payload?.category ?? payload;
  return {
    id: c._id ?? c.id ?? '',
    name: c.name ?? '',
    parent: typeof c.parent === 'object' ? (c.parent?._id ?? null) : (c.parent ?? null),
  };
}

export const categoryService = {
  async list(): Promise<Category[]> {
    const raw = await apiClient.getRaw<any>('/categories');
    const list = raw?.data ?? raw?.items ?? raw ?? [];
    return (list as any[]).map((c) => normalizeCategory(c));
  },
  async create(input: { name: string; parent?: string | null }): Promise<Category> {
    const raw = await apiClient.postRaw<any>('/category/create', input);
    const payload = raw?.category ?? raw?.data ?? raw;
    return normalizeCategory(payload);
  },
  async remove(id: string): Promise<{ success?: boolean; message?: string }>{
    const raw = await apiClient.deleteRaw<any>(`/category/${id}`);
    return raw as { success?: boolean; message?: string };
  },
};


