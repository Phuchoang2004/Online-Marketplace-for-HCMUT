import React, { useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Modal, Space, Table, Tag, Typography, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { productService } from '@/services/products';
import { CreateProductInput, Product, UpdateProductInput } from '@/types/product';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';

const { Title } = Typography;

export const ProductsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showErrorMessage, showSuccessMessage } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const [form] = Form.useForm<CreateProductInput | UpdateProductInput>();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['products'],
    queryFn: () => productService.list({ page: 1, limit: 50, sortBy: 'newest' }),
    staleTime: 0,
    gcTime: 5 * 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateProductInput) => productService.create(values),
    onSuccess: () => {
      showSuccessMessage('Product created');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      form.resetFields();
    },
    onError: showErrorMessage,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: UpdateProductInput }) => productService.update(id, values),
    onSuccess: () => {
      showSuccessMessage('Product updated');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsModalOpen(false);
      setEditingProduct(null);
      form.resetFields();
    },
    onError: showErrorMessage,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.remove(id),
    onSuccess: () => {
      showSuccessMessage('Product deleted');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: showErrorMessage,
  });

  const items = data?.items ?? [];

  const columns = useMemo(() => {
    return [
      {
        title: 'Image',
        key: 'image',
        render: (_: any, record: Product) => {
          const url = record.images?.[0]?.url;
          return url ? (
            <img
              src={url}
              alt={record.name}
              style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }}
            />
          ) : (
            '-'
          );
        },
      },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Price', dataIndex: 'price', key: 'price', render: (v: number) => `₫${v.toLocaleString()}` },
      { title: 'Stock', dataIndex: 'stock', key: 'stock' },
      { title: 'Category', dataIndex: 'category', key: 'category' },
      {
        title: 'Description',
        dataIndex: 'description',
        key: 'description',
        render: (text?: string) => (text ? (text.length > 60 ? `${text.slice(0, 60)}…` : text) : '-'),
      },
      {
        title: 'Status',
        dataIndex: 'approvalStatus',
        key: 'approvalStatus',
        render: (s: Product['approvalStatus'], record: Product) => {
          const color = s === 'APPROVED' ? 'green' : s === 'PENDING' ? 'gold' : 'red';
          const title = s === 'REJECTED' && record.rejectionReason ? record.rejectionReason : undefined;
          return (
            <span title={title}>
              <Tag color={color}>{s}</Tag>
            </span>
          );
        },
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_: any, record: Product) => (
          <Space>
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => {
                setEditingProduct(record);
                setIsModalOpen(true);
                form.setFieldsValue({
                  name: record.name,
                  price: record.price,
                  stock: record.stock,
                  description: record.description,
                  category: record.category,
                });
                setFileList((record.images || []).map((img, idx) => ({
                  uid: `${idx}`,
                  name: `image-${idx + 1}.jpg`,
                  status: 'done',
                  url: img.url,
                })));
              }}
            />
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
  }, [deleteMutation.isPending, form]);

  const handleSubmit = async () => {
    const values = await form.validateFields();
    const toBase64 = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (err) => reject(err);
        reader.readAsDataURL(file);
      });

    const hasFiles = (fileList || []).some((f) => f.originFileObj);
    if (hasFiles) {
      const formData = new FormData();
      formData.append('name', values.name as any);
      formData.append('price', String(values.price));
      if (values.stock != null) formData.append('stock', String(values.stock));
      formData.append('category', values.category as any);
      if (values.description) formData.append('description', values.description as any);
      (fileList || []).forEach((f) => {
        if (f.originFileObj) {
          formData.append('images', f.originFileObj as File);
        }
      });
      try {
        await productService.createMultipart(formData as any);
        showSuccessMessage('Product created');
        queryClient.invalidateQueries({ queryKey: ['products'] });
        setIsModalOpen(false);
        setFileList([]);
        form.resetFields();
        return;
      } catch (err) {
        showErrorMessage(err as any);
        return;
      }
    } else {
      const images = (
        await Promise.all(
          (fileList || []).map(async (f) => {
            const url = f.url ? f.url : f.originFileObj ? await toBase64(f.originFileObj as File) : '';
            return url ? { url } : null;
          })
        )
      ).filter(Boolean) as { url: string }[];
      const payload = { ...values, images } as CreateProductInput;
      if (editingProduct) {
        updateMutation.mutate({ id: editingProduct.id, values: payload });
      } else {
        createMutation.mutate(payload);
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
    setFileList([]);
  };

  return (
    <div>
      <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>Products</Title>
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching}>
            Refresh
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            New Product
          </Button>
        </Space>
      </Space>

      <Card>
        <Table
          rowKey={(r) => r.id}
          loading={isLoading}
          dataSource={items}
          columns={columns as any}
        />
      </Card>

      <Modal
        title={editingProduct ? 'Edit Product' : 'Create Product'}
        open={isModalOpen}
        onCancel={() => { setIsModalOpen(false); setEditingProduct(null); }}
        onOk={handleSubmit}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter name' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price" rules={[{ required: true, message: 'Please enter price' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="stock" label="Stock">
            <InputNumber min={0} precision={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true, message: 'Please enter category id' }]}>
            <Input placeholder="Category ObjectId" />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item label="Images">
            <Upload
              listType="picture-card"
              fileList={fileList}
              beforeUpload={() => false}
              onChange={({ fileList }) => setFileList(fileList)}
              multiple
            >
              {fileList.length >= 5 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};


