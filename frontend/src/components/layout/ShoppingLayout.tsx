import React from 'react';
import { Layout, Menu, Typography, Space, Button, Dropdown, Avatar } from 'antd';
import type { MenuProps } from 'antd';
import { ShoppingCartOutlined, UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { Footer } from './Footer';
import logo from '@/components/logo.png';

const { Title, Text } = Typography;

interface ShoppingLayoutProps {
  children: React.ReactNode;
  hideProfileMenu?: boolean;
}

export const ShoppingLayout: React.FC<ShoppingLayoutProps> = ({ children, hideProfileMenu }) => {
  const { user, logout } = useAuth();
  const { showErrorMessage } = useToast();
  const navigate = useNavigate();

  const isAuthenticated = !!user;
  const isCustomer = user?.role === 'customer';

  const handleCartClick = () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN);
      return;
    }
    if (!isCustomer) {
      showErrorMessage('Only customers can use the cart.');
      return;
    }
    navigate('/cart');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => logout({ redirectToHome: true }),
    },
  ];

  const menuItems = [
    { key: 'discover', label: 'Discover' },
    { key: 'categories', label: 'Categories' },
    { key: 'deals', label: 'Best Deals' },
    { key: 'support', label: 'Support' },
  ];

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5F6FA' }}>
      <Layout.Header
        style={{
          background: '#ffffff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
        }}
      >
        <Space align="center" size="large">
          <Space>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                HCMUT Marketplace
              </Title>
            </div>
          </Space>
          <Menu mode="horizontal" items={menuItems} style={{ borderBottom: 'none' }} />
        </Space>
        <Space size="middle">
          <Button type="default" icon={<ShoppingCartOutlined />} onClick={handleCartClick}>
            Cart
          </Button>
          {isAuthenticated && isCustomer && !hideProfileMenu ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space style={{ cursor: 'pointer' }}>
                <Avatar size="small" src={user?.avatar} icon={<UserOutlined />} />
                <span>{user?.name}</span>
              </Space>
            </Dropdown>
          ) : (
            <Button
              type="primary"
              icon={<UserOutlined />}
              onClick={() => navigate(ROUTES.LOGIN)}
            >
              Login / Register
            </Button>
          )}
        </Space>
      </Layout.Header>

      <Layout.Content style={{ flex: 1 }}>{children}</Layout.Content>

      <Footer />
    </Layout>
  );
};
