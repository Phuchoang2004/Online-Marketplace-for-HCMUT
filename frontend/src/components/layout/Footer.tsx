import React from 'react';
import { Layout, Typography, theme } from 'antd';

const { Footer: AntFooter } = Layout;
const { Text } = Typography;

export const Footer: React.FC = () => {
  const { token } = theme.useToken();
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        textAlign: 'center',
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        padding: '16px 50px',
      }}
    >
      <Text type="secondary">
        HCMUT Online Marketplace ©{currentYear} Created with ❤️ using React, TypeScript & Ant Design
      </Text>
    </AntFooter>
  );
};