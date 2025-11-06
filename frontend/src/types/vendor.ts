// src/types/vendor.ts

export interface Vendor {
  id: string;
  user: string; // ID của user
  business_name: string;
  description: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  createdAt: string;
}

export interface CreateVendorInput {
  business_name: string;
  description: string;
}

export interface RejectVendorInput {
  reason: string;
}