import React from 'react';
import { Form, Input, Button, Card, Typography, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, LoginOutlined } from '@ant-design/icons';
import { authService } from '@/services/auth';
import { useToast } from '@/hooks/useToast';
import { useNavigate, Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';

const { Title, Text } = Typography;

export const RegisterPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { showErrorMessage, showSuccessMessage } = useToast();

  const onFinish = async (values: { fullName: string; email: string; password: string }) => {
    try {
      const res = await authService.register(values);
      if (res?.success) {
        showSuccessMessage(res.message || 'Registration successful');
        navigate(ROUTES.LOGIN);
      } else {
        showErrorMessage('Registration failed');
      }
    } catch (e: any) {
      showErrorMessage(e?.message || 'Registration failed');
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
          width: 420,
          padding: '20px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Title level={2} style={{ marginBottom: '8px' }}>
            Create Account
          </Title>
          <Text type="secondary">Register to get started</Text>
        </div>

        <Form form={form} layout="vertical" onFinish={onFinish} requiredMark={false}>
          <Form.Item
            name="fullName"
            label="Full name"
            rules={[{ required: true, message: 'Please enter your full name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Your full name" size="large" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="you@example.com" size="large" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, min: 6, max: 32, message: 'Password must be 6-32 chars' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Choose a password" size="large" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" block icon={<LoginOutlined />}>
              Register
            </Button>
          </Form.Item>
        </Form>

        <Divider />
        <div style={{ textAlign: 'center' }}>
          <Text>Already have an account? </Text>
          <Link to={ROUTES.LOGIN}>Sign in</Link>
        </div>
      </Card>
    </div>
  );
};


