import React, { useState } from 'react';
import { Button, Modal, Form, Input, Space, Table, Tag, Typography } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vendorService } from '@/services/vendor';
import { Vendor } from '@/types/vendor';
import { useToast } from '@/hooks/useToast';
import { CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';

const { Title } = Typography;

export const VendorApprovalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showErrorMessage, showSuccessMessage } = useToast();
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [form] = Form.useForm<{ reason: string }>();

  // Lấy danh sách vendor
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: vendorService.list,
  });

  // Mutation để accept
  const approveMutation = useMutation({
    mutationFn: (id: string) => vendorService.approve(id),
    onSuccess: () => {
      showSuccessMessage('Vendor approved');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
    },
    onError: showErrorMessage,
  });

  // Mutation để reject
  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      vendorService.reject(id, { reason }),
    onSuccess: () => {
      showSuccessMessage('Vendor rejected');
      queryClient.invalidateQueries({ queryKey: ['vendors'] });
      setRejectModalVisible(false);
      form.resetFields();
    },
    onError: showErrorMessage,
  });

  // Mở modal từ chối
  const handleOpenRejectModal = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setRejectModalVisible(true);
  };

  // Xử lý submit form từ chối
  const handleRejectSubmit = async () => {
    if (!selectedVendor) return;
    try {
      const values = await form.validateFields();
      rejectMutation.mutate({ id: selectedVendor.id, ...values });
    } catch (error) {
      console.error('Validate Failed:', error);
    }
  };

  const columns = [
    { title: 'Store Name', dataIndex: 'business_name', key: 'business_name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    {
      title: 'Status',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status: Vendor['approvalStatus']) => {
        let color = 'gold';
        if (status === 'APPROVED') color = 'green';
        if (status === 'REJECTED') color = 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Vendor) => (
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

  return (
    <div>
      <Title level={2}>Approve Vendor Registrations</Title>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={vendors}
        loading={isLoading}
      />

      {/* Modal để nhập lý do từ chối */}
      <Modal
        title={`Reject "${selectedVendor?.business_name}"`}
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