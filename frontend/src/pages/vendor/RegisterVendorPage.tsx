import React from 'react';
import { Button, Card, Form, Input, Typography } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { vendorService } from '@/services/vendor';
import { CreateVendorInput } from '@/types/vendor';
import { useToast } from '@/hooks/useToast';

const { Title } = Typography;
const { TextArea } = Input;

export const RegisterVendorPage: React.FC = () => {
  const { showErrorMessage, showSuccessMessage } = useToast();
  const [form] = Form.useForm<CreateVendorInput>();

  const mutation = useMutation({
    mutationFn: (values: CreateVendorInput) => vendorService.register(values),
    onSuccess: () => {
      showSuccessMessage('Registration successful! Please wait for approval.');
      form.resetFields();
    },
    onError: showErrorMessage,
  });

  // Thêm màu nền
  const darkerBlueBg = '#bae7ff';

  return (
    <div
      style={{
        background: darkerBlueBg,
        padding: '40px 20px', 
        minHeight: 'calc(100vh - 64px)', 
      }}
    >
      <Card style={{ maxWidth: 600, margin: 'auto' }}>
        <Title level={3}>Start Selling on Our E-commerce Platform !</Title>
        <p>
          Complete the information below to submit your store registration request.
          We will review it and get back to you as soon as possible.
        </p>
        <Form
          form={form}
          layout="vertical"
          onFinish={mutation.mutate}
          disabled={mutation.isPending}
        >
          <Form.Item
            name="business_name"
            label="Store / Business Name"
            rules={[{ required: true, message: 'Please provide your store name' }]}
          >
            <Input placeholder="Example: Tech Store HCMUT" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please fill out the description' }]}
          >
            <TextArea
              rows={9}
              placeholder="Provide a description of the products you offer…"
              style={{ resize: 'none' }}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={mutation.isPending}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};