import React from 'react';
import { Button, Card, Col, List, Row, Statistic, Typography, InputNumber, Divider, Empty, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/services/cart';
import { useToast } from '@/hooks/useToast';
import { CartItem } from '@/types/cart';

const { Title, Text } = Typography;

export const CartPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showErrorMessage, showSuccessMessage } = useToast();
  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartService.getCart,
  });

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      cartService.updateQuantity(productId, quantity),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
    },
    onError: showErrorMessage,
  });

  const removeMutation = useMutation({
    mutationFn: (productId: string) => cartService.removeFromCart(productId),
    onSuccess: (updatedCart) => {
      queryClient.setQueryData(['cart'], updatedCart);
      showSuccessMessage('Item removed from cart');
    },
    onError: showErrorMessage,
  });

  const checkoutMutation = useMutation({
    mutationFn: cartService.checkout,
    onSuccess: (data) => {
      showSuccessMessage(data.message || 'Checkout successful!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: showErrorMessage,
  });

  const totalAmount = React.useMemo(() => {
    return cart?.items.reduce((acc: number, item: CartItem) => {
      return acc + item.product.price * item.quantity;
    }, 0) || 0;
  }, [cart]);

  const itemsInCart = cart?.items || [];

  return (
    <div style={{ padding: '24px', background: '#f0f2f5' }}>
      <Row gutter={[24, 24]}>
        {/* Danh sách sản phẩm */}
        <Col xs={24} lg={16}>
          <Card>
            <Title level={3}>Your Shopping Cart ({itemsInCart.length} items)</Title>
            <List
              loading={isLoading}
              itemLayout="horizontal"
              dataSource={itemsInCart}
              locale={{ emptyText: <Empty description="Your cart is empty" /> }}
              renderItem={(item: CartItem) => (
                <List.Item
                  actions={[
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeMutation.mutate(item.product.id)}
                      loading={removeMutation.isPending}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <img
                        width={80}
                        alt={item.product.name}
                        src={item.product.images?.[0]?.url || '/placeholder.png'}
                      />
                    }
                    title={<Text strong>{item.product.name}</Text>}
                    description={`Price: $${item.product.price.toFixed(2)}`}
                  />
                  <Space>
                    <Text>Quantity:</Text>
                    <InputNumber
                      min={1}
                      max={item.product.stock}
                      value={item.quantity}
                      onChange={(newQuantity) => {
                        if (newQuantity) {
                          updateMutation.mutate({
                            productId: item.product.id,
                            quantity: newQuantity,
                          });
                        }
                      }}
                      disabled={updateMutation.isPending}
                    />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Tóm tắt và Checkout */}
        <Col xs={24} lg={8}>
          <Card>
            <Title level={4}>Order Summary</Title>
            <Statistic
              title="Total Amount"
              value={totalAmount}
              precision={2}
              prefix="$"
            />
            <Divider />
            <Button
              type="primary"
              size="large"
              block
              onClick={() => checkoutMutation.mutate()}
              loading={checkoutMutation.isPending}
              disabled={itemsInCart.length === 0}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
};