import React from 'react';
import { Layout, theme } from 'antd';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { useApp } from '@/contexts/AppContext';

const { Content } = Layout;

interface ManagementLayoutProps {
  children: React.ReactNode;
}

export const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  const { sidebarCollapsed, toggleSidebar } = useApp();
  const { token } = theme.useToken();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar collapsed={sidebarCollapsed} />
      <Layout>
        <Header collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <Content
          style={{
            margin: '24px',
            padding: '24px',
            background: token.colorBgContainer,
            borderRadius: token.borderRadius,
            minHeight: 'calc(100vh - 112px - 48px)',
          }}
        >
          {children}
        </Content>
        <Footer />
      </Layout>
    </Layout>
  );
};

export { ManagementLayout as MainLayout };