export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductImage {
  url: string;
}

export interface Product {
  id: string;
  vendor: string;
  category: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images: ProductImage[];
  approvalStatus: ApprovalStatus;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  category: string;
  name: string;
  description?: string;
  price: number;
  stock?: number;
  images?: ProductImage[];
}

export interface UpdateProductInput extends Partial<CreateProductInput> {}
