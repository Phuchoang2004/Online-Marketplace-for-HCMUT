import React from 'react';
import { Card, Row, Col, Avatar, Typography, Descriptions, Button, Space, Divider } from 'antd';
import { UserOutlined, EditOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { ShoppingLayout } from '@/components/layout/ShoppingLayout';
import { ManagementLayout } from '@/components/layout/MainLayout';

const { Title, Paragraph } = Typography;

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  const isCustomer = user.role === 'customer';

  const content = (
    <div>
      <Title level={2}>Profile</Title>
      <Paragraph>Manage your account information and preferences.</Paragraph>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar
                size={120}
                src={user.avatar}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <Title level={4} style={{ marginBottom: 8 }}>
                {user.name}
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 16 }}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </Paragraph>
              <Space>
                <Button type="primary" icon={<EditOutlined />}>
                  Edit Profile
                </Button>
                <Button icon={<MailOutlined />}>
                  Contact
                </Button>
              </Space>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Personal Information">
            <Descriptions bordered column={1}>
              <Descriptions.Item label="Full Name">
                {user.name}
              </Descriptions.Item>
              <Descriptions.Item label="Email Address">
                {user.email}
              </Descriptions.Item>
              <Descriptions.Item label="User ID">
                {user.id}
              </Descriptions.Item>
              <Descriptions.Item label="Role">
                <span style={{
                  textTransform: 'capitalize',
                  padding: '2px 8px',
                  backgroundColor: user.role === 'admin' ? '#e6f7ff' : '#f6ffed',
                  color: user.role === 'admin' ? '#1890ff' : '#52c41a',
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 500,
                }}>
                  {user.role}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Member Since">
                {new Date(user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <Title level={4}>Account Settings</Title>
            <Paragraph>
              Customize your account preferences and security settings. You can update
              your personal information, change your password, manage notification preferences,
              and configure two-factor authentication.
            </Paragraph>

            <Space wrap>
              <Button type="primary">Update Information</Button>
              <Button>Change Password</Button>
              <Button>Notification Settings</Button>
              <Button>Security Settings</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );

  if (isCustomer) {
    return <ShoppingLayout>{content}</ShoppingLayout>;
  }
  else {
    return <ManagementLayout>{content}</ManagementLayout>;
  }
};