import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '@/pages/auth/LoginPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { MainLayout } from '@/components/layout/MainLayout';
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
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        {/* Protected routes with layout */}
        <Route
          path={ROUTES.DASHBOARD}
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PROFILE}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProfilePage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SETTINGS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <SettingsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.PRODUCTS}
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SHOPPING}
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MainLayout>
                <ShoppingPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MainLayout>
                <CartPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.REGISTER_VENDOR}
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <MainLayout>
                <RegisterVendorPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_VENDORS}
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <MainLayout>
                <VendorApprovalPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CATEGORIES}
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <MainLayout>
                <CategoryManagementPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_PRODUCTS_APPROVAL}
          element={
            <ProtectedRoute allowedRoles={['admin', 'staff']}>
              <MainLayout>
                <ProductApprovalPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Routes>
    </BrowserRouter>
  );
};

