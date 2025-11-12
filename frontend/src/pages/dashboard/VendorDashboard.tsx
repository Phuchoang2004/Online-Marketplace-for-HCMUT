import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Button, Tag } from 'antd';
import {
  DollarOutlined,
  ShopOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  FileTextOutlined,
  ShoppingCartOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/orders';
import { productService } from '@/services/products';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/config/routes';
import { Order, OrderStatus } from '@/types/order';

const { Title, Text } = Typography;

export const VendorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch orders
  const { data: orders = [] } = useQuery({
    queryKey: ['vendor-orders'],
    queryFn: () => orderService.list(),
    enabled: !!user,
  });

  // Fetch vendor products
  const { data: products = [] } = useQuery({
    queryKey: ['vendor-products'],
    queryFn: () => productService.listMine(),
    enabled: !!user,
  });

  // Get vendor items from all orders (backend already filters orders by vendor)
  const allVendorItems = orders.flatMap((order) => 
    order.items.filter((item) => {
      // Backend filters orders to only include orders with vendor items
      // All items in these orders are vendor items
      return item.vendor;
    })
  );

  // Calculate metrics
  const totalSales = allVendorItems
    .filter((item) => item.status === 'COMPLETED')
    .reduce((sum, item) => sum + item.subtotal, 0);

  const activeListings = (products.data ?? []).filter((p) => p.approvalStatus === 'APPROVED').length;


  const pendingOrders = allVendorItems.filter((item) => item.status === 'PENDING').length;

  const completedOrders = allVendorItems.filter((item) => item.status === 'COMPLETED').length;

  // Get recent orders (last 5) and create order items with order index
  const recentOrdersWithIndex = orders.slice(0, 5).map((order, orderIndex) => ({
    ...order,
    orderIndex: orderIndex + 1,
  }));

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    })
      .format(amount)
      .replace('₫', '₫');
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // Get status tag color (based on image: pending/shipped = gray, completed = red)
  const getStatusColor = (status: OrderStatus) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'default'; // Light gray for pending
      case 'SHIPPED':
        return 'default'; // Light gray for shipped
      case 'COMPLETED':
        return 'error'; // Red for completed (based on image)
      case 'CANCELLED':
        return 'error'; // Red for cancelled
      default:
        return 'default';
    }
  };

  // Get order item status (for vendor view, we show item status, not order status)
  const getOrderDisplayStatus = (order: Order): OrderStatus => {
    // For vendor, check if any item in the order is pending/shipped/completed
    const vendorItems = order.items.filter((item) => item.vendor);
    if (vendorItems.length > 0) {
      // Return the most common status or first item status
      return vendorItems[0].status;
    }
    return order.status;
  };

  return (
    <div>
      {/* Header Section */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '32px' }}>
        <Col>
          <Title level={1} style={{ marginBottom: '8px' }}>
            Seller Dashboard
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            Manage your listings and track your sales
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate(ROUTES.PRODUCTS)}
            style={{
              backgroundColor: '#faad14',
              borderColor: '#faad14',
              height: '48px',
              fontSize: '16px',
            }}
          >
            Add New Listing
          </Button>
        </Col>
      </Row>

      {/* Key Metric Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Statistic
              title="Total Sales"
              value={totalSales}
              formatter={(value) => formatCurrency(Number(value))}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}
              prefix={<DollarOutlined style={{ color: '#faad14', fontSize: '24px' }} />}
            />
            <Text type="success" style={{ fontSize: '12px' }}>
              +12.5% from last month
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Statistic
              title="Active Listings"
              value={activeListings}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}
              prefix={<ShopOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} />}
            />
            <Text style={{ fontSize: '12px', color: '#fa8c16' }}>
              +2 from last month
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Statistic
              title="Pending Orders"
              value={pendingOrders}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}
              prefix={<ClockCircleOutlined style={{ color: '#8c8c8c', fontSize: '24px' }} />}
            />
            <Text style={{ fontSize: '12px', color: '#8c8c8c' }}>
              0 from last month
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card
            bordered={false}
            style={{
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Statistic
              title="Completed"
              value={completedOrders}
              valueStyle={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}
              prefix={<CheckCircleOutlined style={{ color: '#faad14', fontSize: '24px' }} />}
            />
            <Text style={{ fontSize: '12px', color: '#fa8c16' }}>
              +8 from last month
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions Section */}
      <div style={{ marginBottom: '32px' }}>
        <Title level={2} style={{ marginBottom: '8px' }}>
          Quick Actions
        </Title>
        <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
          Manage your seller account
        </Text>
        <Row gutter={[16, 16]}>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onClick={() => navigate(ROUTES.PRODUCTS)}
            >
              <ShopOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <Text strong>My Listings</Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
              onClick={() => navigate(ROUTES.PRODUCTS)}
            >
              <PlusOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <Text strong>Add Product</Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <ClockCircleOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <Text strong>Orders</Text>
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '8px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <BarChartOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
              <Text strong>Analytics</Text>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Recent Orders Section */}
      <div>
        <Title level={2} style={{ marginBottom: '8px' }}>
          Recent Orders
        </Title>
        <Text type="secondary" style={{ fontSize: '16px', display: 'block', marginBottom: '16px' }}>
          Your latest sales and order status
        </Text>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          {recentOrdersWithIndex.length > 0 ? (
            recentOrdersWithIndex.flatMap((order) => {
              // Get vendor items from this order (all items are vendor items since backend filters)
              const vendorItems = order.items.filter((item) => item.vendor && item.product);
              return vendorItems.map((item, itemIndex) => {
                const status = item.status;
                // Format order ID: use sequential number based on order index
                const orderId = `ORD-${String(order.orderIndex).padStart(3, '0')}`;
                const productName = item.product?.name || 'Unknown Product';
                const customerName = order.user?.fullName || 'Unknown Customer';
                
                return (
                  <Card
                    key={`${order.id}-${item.product?._id || item.product?.id || itemIndex}`}
                    bordered={false}
                    style={{
                      borderRadius: '8px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Row justify="space-between" align="middle">
                      <Col flex="auto">
                        <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: '8px' }}>
                          {productName}
                        </Text>
                        <Text type="secondary" style={{ fontSize: '14px' }}>
                          {orderId} • {customerName} • {formatDate(order.createdAt)}
                        </Text>
                      </Col>
                      <Col>
                        <Space size="large">
                          <Text strong style={{ fontSize: '16px' }}>
                            {formatCurrency(item.subtotal)}
                          </Text>
                          <Tag color={getStatusColor(status)} style={{ fontSize: '12px', padding: '4px 12px' }}>
                            {status.toLowerCase()}
                          </Tag>
                        </Space>
                      </Col>
                    </Row>
                  </Card>
                );
              });
            })
          ) : (
            <Card bordered={false} style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">No orders yet</Text>
            </Card>
          )}
        </Space>
        {recentOrdersWithIndex.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Button type="default">View All Orders</Button>
          </div>
        )}
      </div>
    </div>
  );
};

