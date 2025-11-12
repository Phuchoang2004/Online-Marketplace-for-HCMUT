import React from 'react';
import { Layout, Button, Dropdown, Avatar, Space, Switch, theme } from 'antd';
import type { MenuProps } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  SunOutlined,
  MoonOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const { Header: AntHeader } = Layout;

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const { theme: appTheme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const { token } = theme.useToken();

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
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => logout(),
    },
  ];

  return (
    <AntHeader
      style={{
        padding: '0 24px',
        background: token.colorBgContainer,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={onToggle}
          style={{
            fontSize: '16px',
            width: 64,
            height: 64,
          }}
        />
      </div>

      <Space>
        {user?.role === 'customer' && (
          <Button
            type="text"
            shape="circle"
            icon={<ShoppingCartOutlined style={{ fontSize: '18px' }} />}
            onClick={() => navigate('/cart')}
          />
        )}

        <Space>
          <SunOutlined />
          <Switch
            checked={appTheme === 'dark'}
            onChange={toggleTheme}
            checkedChildren={<MoonOutlined />}
            unCheckedChildren={<SunOutlined />}
          />
          <MoonOutlined />
        </Space>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size="small"
              src={user?.avatar}
              icon={<UserOutlined />}
            />
            <span>{user?.name}</span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
};