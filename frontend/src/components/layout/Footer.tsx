import React from 'react';
import { Layout, Typography, theme, Row, Col, Space, Avatar, Divider } from 'antd';

const { Footer: AntFooter } = Layout;
const { Title, Text, Link, Paragraph } = Typography;

export const Footer: React.FC = () => {
  const { token } = theme.useToken();
  const currentYear = new Date().getFullYear();

  return (
    <AntFooter
      style={{
        background: token.colorBgContainer,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        padding: '40px 50px',
      }}
    >
      <Row gutter={[16, 32]}>
        
        <Col xs={24} md={8}>
          <Space align="center" style={{ marginBottom: 16 }}>
            <Avatar 
              size="large" 
              style={{ backgroundColor: '#1890ff', color: 'white', fontWeight: 'bold' }}
            >
              H
            </Avatar>
            <Title level={4} style={{ margin: 0 }}>HCMUT Marketplace</Title>
          </Space>
          <Paragraph type="secondary" style={{ maxWidth: 300 }}>
            Your trusted campus trading platform
          </Paragraph>
        </Col>
        <Col xs={24} md={16}>
          <Row gutter={[16, 32]}>
            <Col xs={12} sm={8}>
              <Title level={5} style={{ marginBottom: 16 }}>Platform</Title>
              <Space direction="vertical" size="small">
                <Link href="#" type="secondary">Browse</Link>
                <Link href="#" type="secondary">Sell</Link>
                <Link href="#" type="secondary">How It Works</Link>
              </Space>
            </Col>

            <Col xs={12} sm={8}>
              <Title level={5} style={{ marginBottom: 16 }}>Support</Title>
              <Space direction="vertical" size="small">
                <Link href="#" type="secondary">Help Center</Link>
                <Link href="#" type="secondary">Safety Tips</Link>
                <Link href="#" type="secondary">Contact Us</Link>
              </Space>
            </Col>

            <Col xs={12} sm={8}>
              <Title level={5} style={{ marginBottom: 16 }}>Legal</Title>
              <Space direction="vertical" size="small">
                <Link href="#" type="secondary">Terms of Service</Link>
                <Link href="#" type="secondary">Privacy Policy</Link>
                <Link href="#" type="secondary">Community Guidelines</Link>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>

      <Divider style={{ margin: '32px 0 16px' }} />
      <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
        HCMUT Online Marketplace ©{currentYear} Created with ❤️ using React, TypeScript & Ant Design
      </Text>
    </AntFooter>
  );
};