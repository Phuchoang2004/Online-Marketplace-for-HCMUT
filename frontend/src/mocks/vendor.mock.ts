// Mock data for vendor requyest
import { Vendor } from '@/types/vendor';

export const mockVendors: Vendor[] = [
  {
    id: 'vendor-1',
    user: 'customer-id-456',
    business_name: 'Cửa hàng ABC (Chờ duyệt)',
    description: 'Chuyên bán sỉ lẻ',
    approvalStatus: 'PENDING',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vendor-2',
    user: 'customer-id-789',
    business_name: 'Tech Store (Đã duyệt)',
    description: 'Thiết bị điện tử',
    approvalStatus: 'APPROVED',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vendor-3',
    user: 'customer-id-101',
    business_name: 'Shop Quần Áo (Từ chối)',
    description: 'Thông tin không hợp lệ',
    approvalStatus: 'REJECTED',
    rejectionReason: 'Thiếu giấy phép kinh doanh',
    createdAt: new Date().toISOString(),
  },
];