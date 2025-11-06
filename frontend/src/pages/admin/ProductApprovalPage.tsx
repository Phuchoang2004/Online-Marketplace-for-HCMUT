import React, { useMemo, useState } from 'react';
import { Button, Form, Input, Modal, Space, Table, Tag, Typography } from 'antd';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/products';
import { Product } from '@/types/product';
import { useToast } from '@/hooks/useToast';
import { CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const ProductApprovalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showErrorMessage, showSuccessMessage } = useToast();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form] = Form.useForm<{ reason: string }>();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products-pending'],
    queryFn: productService.listPending,
    refetchOnMount: 'always',
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => productService.approvePending(id),
    onSuccess: () => {
      showSuccessMessage('Product approved');
      queryClient.invalidateQueries({ queryKey: ['products-pending'] });
    },
    onError: showErrorMessage,
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => productService.rejectPending(id, reason),
    onSuccess: () => {
      showSuccessMessage('Product rejected');
      queryClient.invalidateQueries({ queryKey: ['products-pending'] });
      setRejectModalVisible(false);
      form.resetFields();
    },
    onError: showErrorMessage,
  });

  const handleOpenRejectModal = (product: Product) => {
    setSelectedProduct(product);
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedProduct) return;
    try {
      const values = await form.validateFields();
      rejectMutation.mutate({ id: selectedProduct.id, ...values });
    } catch (error) {
      // ignore
    }
  };

  const columns = useMemo(() => {
    return [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Category', dataIndex: 'category', key: 'category' },
      { title: 'Price', dataIndex: 'price', key: 'price' },
      {
        title: 'Status',
        dataIndex: 'approvalStatus',
        key: 'approvalStatus',
        render: (status: Product['approvalStatus']) => {
          let color = 'gold';
          if (status === 'APPROVED') color = 'green';
          if (status === 'REJECTED') color = 'red';
          return <Tag color={color}>{status}</Tag>;
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: Product) => (
          <Space size="middle">
            {record.approvalStatus === 'PENDING' && (
              <>
                <Button
                  type="primary"
                  icon={<CheckOutlined />}
                  onClick={() => approveMutation.mutate(record.id)}
                  loading={approveMutation.isPending}
                >
                  Approve
                </Button>
                <Button
                  danger
                  icon={<CloseOutlined />}
                  onClick={() => handleOpenRejectModal(record)}
                >
                  Reject
                </Button>
              </>
            )}
            {record.approvalStatus !== 'PENDING' && (
              <Tag icon={<StopOutlined />} color="default">
                Processed
              </Tag>
            )}
          </Space>
        ),
      },
    ];
  }, [approveMutation.isPending]);

  return (
    <div>
      <Title level={2}>Approve Products</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={products}
        loading={isLoading}
      />

      <Modal
        title={`Reject "${selectedProduct?.name}"`}
        open={rejectModalVisible}
        onOk={handleRejectSubmit}
        onCancel={() => setRejectModalVisible(false)}
        confirmLoading={rejectMutation.isPending}
        okText="Confirm Rejection"
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Reason for rejection"
            rules={[{ required: true, message: 'Please enter a reason' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};


