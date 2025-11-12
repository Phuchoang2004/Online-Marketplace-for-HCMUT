import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Divider, Timeline, Tag, Button } from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  RiseOutlined,
  CheckCircleOutlined,
  FundOutlined,
  HistoryOutlined,
  DesktopOutlined,
  ArrowRightOutlined,
  ShopOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import { useAuth } from '@/hooks/useAuth';
import { VendorDashboard } from './VendorDashboard';

const { Title, Paragraph } = Typography;

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Render vendor dashboard if user is a vendor
  if (user?.role === 'vendor') {
    return <VendorDashboard />;
  }
  // === Dữ liệu mẫu cho các biểu đồ ===
  const revenueData = [
    { date: '2025-11-01', value: 300 },
    { date: '2025-11-02', value: 450 },
    { date: '2025-11-03', value: 620 },
    { date: '2025-11-04', value: 510 },
    { date: '2025-11-05', value: 800 },
    { date: '2025-11-06', value: 750 },
    { date: '2025-11-07', value: 980 },
    { date: '2025-11-08', value: 1234 },
  ];

  const userTrendData = [120, 130, 150, 140, 180, 200, 210, 234];
  const orderTrendData = [50, 60, 55, 70, 80, 75, 90, 101];
  const sparklineConfig = {
    height: 60,
    autoFit: true,
    smooth: true,
    xAxis: false,
    yAxis: false,
    legend: false,
    tooltip: false,
  };

  // Màu chủ đạo xanh dương
  const primaryBlue = '#1890ff';
  const lightBlue = '#e6f7ff';
  const darkBlue = '#001529';

  return (
    <div>
      {/* PHẦN 1: BANNER */}
      <div
        style={{
          background: `linear-gradient(45deg, ${primaryBlue} 0%, #40a9ff 100%)`,
          color: '#fff',
          padding: '60px 40px',
          borderRadius: '8px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Row align="middle" gutter={[32, 32]}>
          <Col xs={24} lg={14}>
            <Title level={1} style={{ color: '#fff', marginBottom: '10px' }}>
              Your Campus Marketplace
            </Title>
            <Paragraph style={{ color: '#e6f7ff', fontSize: '16px', lineHeight: 1.6 }}>
              Buy, sell, and trade safely within the HCMUT community. From textbooks to tech, find everything you need from fellow students.
            </Paragraph>
            <Space style={{ marginTop: '20px' }}>
            </Space>
          </Col>
          <Col xs={24} lg={10} style={{ textAlign: 'center' }}>
            <img 
              src="https://cdn.prod.website-files.com/63d926b37ec0d886c2d5d538/66bb66990191f0f7cbd5b497_6696449889aff652530258af_online-marketplace-min--2---1-.jpeg" 
              alt="Dashboard Illustration" 
              style={{ 
                maxWidth: '100%', 
                height: 'auto', 
                maxHeight: '250px',
                borderRadius: '8px' 
              }} 
            />
          </Col>
        </Row>
      </div>

      {/* PHẦN 2: THỐNG KÊ NỔI BẬT */}
      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ textAlign: 'center', padding: '15px 0' }}>
            <Statistic
              title="Active Users"
              value={500}
              valueStyle={{ color: primaryBlue, fontSize: '30px' }}
              prefix={<UserOutlined style={{ color: primaryBlue }} />}
            />
            <Paragraph style={{ color: '#888', marginTop: '5px' }}>More than 500 active users</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ textAlign: 'center', padding: '15px 0' }}>
            <Statistic
              title="Total Products"
              value={1200}
              valueStyle={{ color: primaryBlue, fontSize: '30px' }}
              prefix={<ShopOutlined style={{ color: primaryBlue }} />}
            />
            <Paragraph style={{ color: '#888', marginTop: '5px' }}>Over 1,200 listed items</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ textAlign: 'center', padding: '15px 0' }}>
            <Statistic
              title="Satisfaction"
              value={98}
              suffix="%"
              valueStyle={{ color: primaryBlue, fontSize: '30px' }}
              prefix={<CheckCircleOutlined style={{ color: primaryBlue }} />}
            />
            <Paragraph style={{ color: '#888', marginTop: '5px' }}>High user satisfaction rate</Paragraph>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable style={{ textAlign: 'center', padding: '15px 0' }}>
            <Statistic
              title="Pending"
              value={12}
              valueStyle={{ color: '#f5222d', fontSize: '30px' }}
              prefix={<AuditOutlined style={{ color: '#f5222d' }} />}
            />
            <Paragraph style={{ color: '#888', marginTop: '5px' }}>Products and Vendors awaiting review</Paragraph>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* PHẦN 3: BIỂU ĐỒ VÀ CÁC THÔNG TIN KHÁC */}
      <Title level={3} style={{ marginBottom: '24px', textAlign: 'center', color: darkBlue }}>
        Application Overview & Health
      </Title>

      <Row gutter={[24, 24]} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={16}>
          <Card title={<Space><FundOutlined style={{ color: primaryBlue }} /> Revenue Trend (Last 7 Days)</Space>} bordered={false}>
            <Line
              data={revenueData}
              xField="date"
              yField="value"
              height={250}
              point={{ size: 5, shape: 'diamond' }}
              tooltip={{ showMarkers: true }}
              yAxis={{ title: { text: 'Revenue ($)' } }}
              smooth={true}
              color={primaryBlue}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title={<Space><DesktopOutlined style={{ color: primaryBlue }} /> System Status</Space>} bordered={false} style={{ height: '100%' }}>
            <Paragraph strong style={{ marginBottom: '15px' }}>Application Health: All systems operational</Paragraph>
            <Space direction="vertical" size="middle">
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 14, padding: '5px 10px' }}>
                API Service: Online
              </Tag>
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 14, padding: '5px 10px' }}>
                Database: Connected
              </Tag>
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ fontSize: 14, padding: '5px 10px' }}>
                Cache: Active
              </Tag>
              <Tag color="warning" icon={<CheckCircleOutlined />} style={{ fontSize: 14, padding: '5px 10px' }}>
                CDN: Limited performance
              </Tag>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card title={<Space><HistoryOutlined style={{ color: primaryBlue }} /> Recent Activity</Space>} bordered={false} style={{ height: '100%' }}>
            <Timeline mode="left" style={{ padding: '20px' }}>
              <Timeline.Item label="2025-11-11 09:30:00" color="green">
                <strong>Product A</strong> is now 50% off!
              </Timeline.Item>
              <Timeline.Item label="2025-11-11 09:15:00" color="blue">
                <strong>Product B</strong> is now 50% off!
              </Timeline.Item>
              <Timeline.Item label="2025-11-10 17:30:00" color="red">
                <strong>Product C</strong> is now 50% off!
              </Timeline.Item>
              <Timeline.Item label="2025-11-10 14:00:00" color="gray">
                New user <strong>CUSTOMER_User</strong> registered.
              </Timeline.Item>
            </Timeline>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
            <Card title={<Space><AuditOutlined style={{ color: primaryBlue }} /> Approval Overview</Space>} bordered={false} style={{ height: '100%' }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        <Statistic
                            title="Vendors Available"
                            value={3636}
                            valueStyle={{ color: '#faad14' }}
                            prefix={<ShopOutlined />}
                        />
                    </Col>
                    <Col span={12}>
                        <Statistic
                            title="Customer Available"
                            value={6677}
                            valueStyle={{ color: '#eb2f96' }}
                            prefix={<UserOutlined />}
                        />
                    </Col>
                </Row>
                <Divider />
                <Paragraph>We bring together a wide range of items across different categories, 
                  from fashion and technology to lifestyle and home essentials. With a user-friendly interface, 
                  secure payment methods, and fast delivery, our mission is to make online shopping easier, 
                  safer, and more enjoyable for everyone. Discover great deals, explore new brands, 
                  and shop with confidence — all in one place.</Paragraph>
            </Card>
        </Col>
      </Row>

      <Divider />

      {/* PHẦN 4: Ready to Start Trading? */}
      <div
        style={{
          background: primaryBlue, // Màu xanh dương
          color: '#fff',
          padding: '60px 40px',
          borderRadius: '8px',
          textAlign: 'center',
          marginTop: '24px',
        }}
      >
        <Title level={2} style={{ color: '#fff', marginBottom: '10px' }}>
          Ready to Start Trading ?
        </Title>
        <Paragraph style={{ color: '#e6f7ff', fontSize: '16px', marginBottom: '30px' }}>
          Join hundreds of HCMUT students already buying and selling on our platform
        </Paragraph>
        <Space size="large">
          <Button
            type="primary"
            size="large"
            style={{ background: '#fff', color: primaryBlue, borderColor: '#fff' }}
          >
            Create Account
          </Button>
          <Button
            type="default"
            size="large"
            style={{ background: '#fff', color: primaryBlue, borderColor: '#fff' }}
          >
            Sign In
          </Button>
        </Space>
      </div>
    </div>
  );
};