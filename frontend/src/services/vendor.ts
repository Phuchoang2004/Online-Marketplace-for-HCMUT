// src/services/vendor.ts
import { apiClient } from './api';
import { CreateVendorInput, RejectVendorInput, Vendor } from '@/types/vendor';
import { mockVendors } from '@/mocks/vendor.mock';

// Đọc biến môi trường (Vite)
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

// Hàm giả lập độ trễ mạng
const mockApiCall = <T>(data: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 500);
  });
};

export const vendorService = {
  /**
   * (CUSTOMER) Đăng ký để trở thành vendor
   * Endpoint: POST /api/vendor/register
   */
  async register(input: CreateVendorInput): Promise<Vendor> {
    if (USE_MOCKS) {
      console.warn('ĐANG SỬ DỤNG MOCK DATA CHO: vendorService.register');
      const newVendor: Vendor = {
        id: `vendor-${Math.floor(Math.random() * 1000)}`,
        user: 'customer-id-456', // ID của user đang đăng nhập
        ...input,
        approvalStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      mockVendors.push(newVendor); // Thêm vào danh sách mock
      return mockApiCall(newVendor);
    }
    // API thật
    return apiClient.post<Vendor>('/vendor/register', input);
  },

  /**
   * (ADMIN/STAFF) Lấy danh sách vendors để duyệt
   * Endpoint: GET /api/vendor (Giả định, vì README không có)
   */
  async list(): Promise<Vendor[]> {
    if (USE_MOCKS) {
      console.warn('ĐANG SỬ DỤNG MOCK DATA CHO: vendorService.list');
      return mockApiCall(mockVendors);
    }
    // API thật (bạn có thể cần sửa lại endpoint)
    return apiClient.get<Vendor[]>('/vendor'); 
  },

  /**
   * (ADMIN/STAFF) Chấp thuận vendor
   * Endpoint: POST /api/vendor/:id/approve
   */
  async approve(id: string): Promise<Vendor> {
    if (USE_MOCKS) {
      console.warn('ĐANG SỬ DỤNG MOCK DATA CHO: vendorService.approve');
      const vendor = mockVendors.find(v => v.id === id);
      if (vendor) {
        vendor.approvalStatus = 'APPROVED';
      }
      return mockApiCall(vendor as Vendor);
    }
    // API thật
    return apiClient.post<Vendor>(`/vendor/${id}/approve`);
  },

  /**
   * (ADMIN/STAFF) Từ chối vendor
   * Endpoint: POST /api/vendor/:id/reject
   */
  async reject(id: string, input: RejectVendorInput): Promise<Vendor> {
    if (USE_MOCKS) {
      console.warn('ĐANG SỬ DỤNG MOCK DATA CHO: vendorService.reject');
      const vendor = mockVendors.find(v => v.id === id);
      if (vendor) {
        vendor.approvalStatus = 'REJECTED';
        vendor.rejectionReason = input.reason;
      }
      return mockApiCall(vendor as Vendor);
    }
    // API thật
    return apiClient.post<Vendor>(`/vendor/${id}/reject`, input);
  },
};