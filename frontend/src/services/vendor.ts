// src/services/vendor.ts
import { apiClient } from './api';
import { CreateVendorInput, RejectVendorInput, Vendor } from '@/types/vendor';

function normalizeVendor(payload: any): Vendor {
  const v = payload?.information ?? payload?.vendor ?? payload?.data ?? payload ?? {};
  const id = v._id ?? v.id ?? '';
  const user = typeof v.user === 'object' ? (v.user?._id ?? '') : (v.user ?? '');
  return {
    id,
    user,
    business_name: v.businessName ?? v.business_name ?? '',
    description: v.description ?? '',
    approvalStatus: v.approvalStatus ?? 'PENDING',
    rejectionReason: v.rejectionReason,
    createdAt: v.createdAt ?? new Date().toISOString(),
  } as Vendor;
}

export const vendorService = {
  /**
   * (CUSTOMER) Đăng ký để trở thành vendor
   * Endpoint: POST /api/vendor/register
   */
  async register(input: CreateVendorInput): Promise<Vendor> {
    const raw = await apiClient.postRaw<any>('/vendor/register', input);
    return normalizeVendor(raw);
  },

  /**
   * (ADMIN/STAFF) Lấy danh sách vendors để duyệt
   * Endpoint: GET /api/vendors
   */
  async list(): Promise<Vendor[]> {
    const raw = await apiClient.getRaw<any>('/vendors');
    const list = raw?.data ?? raw?.items ?? raw ?? [];
    return (list as any[]).map((v) => normalizeVendor(v));
  },

  /**
   * (ADMIN/STAFF) Chấp thuận vendor
   * Endpoint: POST /api/vendor/:id/approve
   */
  async approve(id: string): Promise<{ success: boolean; message?: string }> {
    const raw = await apiClient.postRaw<{ success: boolean; message?: string }>(`/vendor/${id}/approve`);
    return raw;
  },

  /**
   * (ADMIN/STAFF) Từ chối vendor
   * Endpoint: POST /api/vendor/:id/reject
   */
  async reject(id: string, input: RejectVendorInput): Promise<{ success: boolean; message?: string }> {
    const raw = await apiClient.postRaw<{ success: boolean; message?: string }>(`/vendor/${id}/reject`, input);
    return raw;
  },
};