import React, { useMemo } from 'react';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Typography } from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoryService, Category } from '@/services/categories';
import { useToast } from '@/hooks/useToast';

const { Title } = Typography;

export const CategoryManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showErrorMessage, showSuccessMessage } = useToast();
  const [form] = Form.useForm<{ name: string; parent?: string }>();

  const { data: categories, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.list,
    refetchOnMount: 'always',
  });

  const createMutation = useMutation({
    mutationFn: (values: { name: string; parent?: string | null }) =>
      categoryService.create(values),
    onSuccess: () => {
      showSuccessMessage('Category created');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      form.resetFields();
      setCreateOpen(false);
    },
    onError: showErrorMessage,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.remove(id),
    onSuccess: () => {
      showSuccessMessage('Category deleted');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: showErrorMessage,
  });

  const [createOpen, setCreateOpen] = React.useState(false);

  const columns = useMemo(() => {
    return [
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Parent', dataIndex: 'parent', key: 'parent', render: (p?: string | null) => p || '-' },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: Category) => (
          <Space>
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => deleteMutation.mutate(record.id)}
              loading={deleteMutation.isPending}
            />
          </Space>
        ),
      },
    ];
  }, [deleteMutation.isPending]);

  const handleCreate = async () => {
    const values = await form.validateFields();
    await createMutation.mutateAsync({ name: values.name, parent: values.parent || null });
  };

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Categories</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>Refresh</Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>
            New Category
          </Button>
        </Space>
      </Space>

      <Card>
        <Table
          rowKey={(r) => r.id}
          loading={isLoading}
          dataSource={categories || []}
          columns={columns as any}
        />
      </Card>

      <Modal
        title="Create Category"
        open={createOpen}
        onCancel={() => setCreateOpen(false)}
        onOk={handleCreate}
        confirmLoading={createMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="parent" label="Parent">
            <Select
              allowClear
              placeholder="Select parent category"
              options={(categories || []).map((c) => ({ value: c.id, label: c.name }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};


