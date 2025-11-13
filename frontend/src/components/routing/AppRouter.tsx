import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ManagementLayout } from '@/components/layout/MainLayout';
import { ROUTES } from '@/config/routes';
import { ProductsPage } from '@/pages/products/ProductsPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import ShoppingPage from '@/pages/products/shopping';

import { useAuth } from '@/hooks/useAuth';
import { RegisterVendorPage } from '@/pages/vendor/RegisterVendorPage';
import { VendorApprovalPage } from '@/pages/admin/VendorApprovalPage';
import { CategoryManagementPage } from '@/pages/admin/CategoryManagementPage';
import { ProductApprovalPage } from '@/pages/admin/ProductApprovalPage';
import { CartPage } from '@/pages/cart/cartpage';

export const AppRouter: React.FC = () => {
  useAuth();
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path={ROUTES.HOME} element={<ShoppingPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTES.SHOPPING} element={<ShoppingPage />} />

        {/* Protected routes with layout */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <ManagementLayout>
                <DashboardPage />
              </ManagementLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <ManagementLayout>
                <SettingsPage />
              </ManagementLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PRODUCTS}
          element={
            <ProtectedRoute>
              <ManagementLayout>
                <ProductsPage />
              </ManagementLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CartPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.REGISTER_VENDOR}
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <ManagementLayout>
                <RegisterVendorPage />
              </ManagementLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_VENDORS}
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ManagementLayout>
                <VendorApprovalPage />
              </ManagementLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CATEGORIES}
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ManagementLayout>
                <CategoryManagementPage />
              </ManagementLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PRODUCTS_APPROVAL}
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <ManagementLayout>
                <ProductApprovalPage />
              </ManagementLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

