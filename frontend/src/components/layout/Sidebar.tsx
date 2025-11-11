import React from 'react';
import { Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  ShopOutlined,
  AuditOutlined,
  CheckSquareOutlined,
  SafetyCertificateOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/hooks/useAuth';

const { Sider } = Layout;

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { user } = useAuth(); // Lấy thông tin user
  
  // Handle theo role của user
  const menuItems: MenuProps['items'] = [];
  menuItems.push(
    {
      key: ROUTES.DASHBOARD,
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate(ROUTES.DASHBOARD),
    },
  );

  // Chỉ hiện Products cho role vendor
  if (user?.role !== 'admin' && user?.role !== 'staff' && user?.role !== 'customer') {
    menuItems.push({
      key: ROUTES.PRODUCTS,
      icon: <ShopOutlined />,
      label: 'Products',
      onClick: () => navigate(ROUTES.PRODUCTS),
    });
  };

  // Handle role customer
  if (user?.role === 'customer') {
    menuItems.push({
      key: ROUTES.SHOPPING,
      icon: <AppstoreOutlined />,
      label: 'Shopping',
      onClick: () => navigate(ROUTES.SHOPPING),
    });
    menuItems.push({
      key: ROUTES.REGISTER_VENDOR,
      icon: <AuditOutlined />,
      label: 'Register Seller',
      onClick: () => navigate(ROUTES.REGISTER_VENDOR),
    });
  }

  // Handle role admin/staff
  if (user?.role === 'admin' || user?.role === 'staff') {
    menuItems.push(
      {
        key: ROUTES.ADMIN_VENDORS,
        icon: <CheckSquareOutlined />,
        label: 'Confirmation',
        onClick: () => navigate(ROUTES.ADMIN_VENDORS),
      },
      {
        key: ROUTES.ADMIN_PRODUCTS_APPROVAL,
        icon: <SafetyCertificateOutlined />,
        label: 'Product Approvals',
        onClick: () => navigate(ROUTES.ADMIN_PRODUCTS_APPROVAL),
      },
      {
        key: ROUTES.ADMIN_CATEGORIES,
        icon: <AppstoreOutlined />,
        label: 'Categories',
        onClick: () => navigate(ROUTES.ADMIN_CATEGORIES),
      }
    );
  }

  menuItems.push(
    {
      type: 'divider',
    },
    {
      key: ROUTES.PROFILE,
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate(ROUTES.PROFILE),
    },
    {
      key: ROUTES.SETTINGS,
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate(ROUTES.SETTINGS),
    }
  );

  return (
    <Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      style={{
        background: token.colorBgContainer,
        borderRight: `1px solid ${token.colorBorderSecondary}`,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: collapsed ? 16 : 20,
          fontWeight: 'bold',
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
          color: token.colorPrimary,
        }}
      >
        {collapsed ? 'H' : 'HCMUT - OM'}
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        style={{
          borderRight: 0,
          background: 'transparent',
        }}
      />
    </Sider>
  );
};