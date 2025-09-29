import React from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoginCredentials } from '@/types/auth';
import { ROUTES } from '@/config/routes';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated, isLoginLoading } = useAuth();
  const location = useLocation();
  const [form] = Form.useForm();

  // Redirect if already authenticated
  const from = location.state?.from?.pathname || ROUTES.DASHBOARD;
  if (isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const onFinish = async (values: LoginCredentials) => {
    try {
      await login(values);
      // Navigation is handled by the useAuth hook
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            Welcome Back
          </Title>
          <Text type="secondary">Sign in to your account</Text>
        </div>

        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Enter your email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={isLoginLoading}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        <Divider />
        
        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Demo credentials: admin@example.com / admin123
          </Text>
        </div>
      </Card>
    </div>
  );
};