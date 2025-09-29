import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Divider } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

const { Title, Paragraph } = Typography;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Total Users',
      value: 1234,
      icon: <UserOutlined style={{ color: '#1890ff' }} />,
      suffix: '',
      precision: 0,
    },
    {
      title: 'Total Orders',
      value: 567,
      icon: <ShoppingCartOutlined style={{ color: '#52c41a' }} />,
      suffix: '',
      precision: 0,
    },
    {
      title: 'Revenue',
      value: 12345.67,
      icon: <DollarOutlined style={{ color: '#faad14' }} />,
      prefix: '$',
      precision: 2,
    },
    {
      title: 'Growth',
      value: 23.5,
      icon: <RiseOutlined style={{ color: '#f5222d' }} />,
      suffix: '%',
      precision: 1,
    },
  ];

  return (
    <div>
      <Title level={2}>Dashboard</Title>
      <Paragraph>
        Welcome back, {user?.name}! Here's an overview of your application.
      </Paragraph>

      <Divider />

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                valueStyle={{ color: stat.icon.props.style.color }}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
              <Space style={{ marginTop: 16 }}>
                {stat.icon}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity" bordered={false}>
            <div style={{ padding: '20px 0' }}>
              <Paragraph>
                This is a sample dashboard page demonstrating the layout structure 
                with header, sidebar (collapsible), and footer.
              </Paragraph>
              <Paragraph>
                Key features implemented:
              </Paragraph>
              <ul>
                <li>Multi-layer architecture with error handling</li>
                <li>React Query for data fetching</li>
                <li>Ant Design with custom theme tokens</li>
                <li>Protected routing</li>
                <li>Authentication with login page</li>
                <li>Responsive layout with collapsible sidebar</li>
              </ul>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="System Status" bordered={false}>
            <div style={{ padding: '20px 0' }}>
              <Paragraph strong>Application Health: All systems operational</Paragraph>
              <Paragraph>
                <span style={{ color: '#52c41a' }}>●</span> API Service: Online
              </Paragraph>
              <Paragraph>
                <span style={{ color: '#52c41a' }}>●</span> Database: Connected
              </Paragraph>
              <Paragraph>
                <span style={{ color: '#52c41a' }}>●</span> Cache: Active
              </Paragraph>
              <Paragraph>
                <span style={{ color: '#faad14' }}>●</span> CDN: Limited performance
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};