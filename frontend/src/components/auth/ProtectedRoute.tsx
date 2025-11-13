/*
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
*/
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  
  // Dùng để check role
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  // --- THAY ĐỔI Ở ĐÂY: Lấy thêm 'user' từ useAuth ---
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // --- LOGIC MỚI: KIỂM TRA QUYỀN (ROLE) ---
  // 1. Kiểm tra xem 'allowedRoles' có được cung cấp và có phần tử không
  const isRoleCheckRequired = allowedRoles && allowedRoles.length > 0;

  if (isRoleCheckRequired) {
    // 2. Kiểm tra xem user có vai trò, và vai trò đó có nằm trong danh sách được phép không
    const hasPermission = user?.role && allowedRoles.includes(user.role);

    if (!hasPermission) {
      // Nếu không có quyền, điều hướng về trang Shopping (trang chủ)
      // Người dùng đã đăng nhập nhưng không đủ quyền cho trang này.
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }
  // -------------------------------------------

  // Nếu đã đăng nhập VÀ (không cần check role HOẶC có quyền)
  return <>{children}</>;
};

