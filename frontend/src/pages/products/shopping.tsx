import React, { useMemo, useState } from 'react';
import { Button, Input, Card, Tag, Rate, Spin } from 'antd';
import {
  SearchOutlined,
  AppstoreOutlined,
  SmileOutlined,
  HomeOutlined,
  HeartOutlined,
  GiftOutlined,
  SkinOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { cartService } from '@/services/cart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useLocation, useNavigate } from 'react-router-dom';
import { Product } from '@/types/product';
import { ROUTES } from '@/config/routes';
import { ShoppingLayout } from '@/components/layout/ShoppingLayout';
import logo from '@/components/logo.png';

const iconMap: Record<string, JSX.Element> = {
  Electronics: <AppstoreOutlined style={{ fontSize: 28, color: '#5A54FF' }} />,
  Fashion: <SkinOutlined style={{ fontSize: 28, color: '#EA4C89' }} />,
  'Home & Living': <HomeOutlined style={{ fontSize: 28, color: '#34C759' }} />,
  Sports: <SmileOutlined style={{ fontSize: 28, color: '#FFCE00' }} />,
  'Health & Beauty': <HeartOutlined style={{ fontSize: 28, color: '#A259F7' }} />,
  'Toys & Games': <GiftOutlined style={{ fontSize: 28, color: '#FF6D00' }} />,
};

type FeaturedProduct = Product & {
  badge?: string;
  badgeColor?: string;
  rating?: number;
  ratingCount?: number;
  oldPrice?: number;
};

type DealProduct = Product & {
  discountPercent: number;
  oldPrice: number;
};

const ShoppingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();
  const { showSuccessMessage, showErrorMessage } = useToast();

  const addMutation = useMutation({
    mutationFn: (data: { productId: string; quantity: number }) =>
      cartService.addToCart(data.productId, data.quantity),
    onSuccess: () => {
      showSuccessMessage('Product added to cart!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: showErrorMessage,
  });

  React.useEffect(() => {
    if (!isAuthenticated || !user) return;
    const shoppingPaths: string[] = [ROUTES.HOME, ROUTES.SHOPPING];
    if (!shoppingPaths.includes(location.pathname)) {
      return;
    }

    if (user.role === 'vendor' || user.role === 'admin' || user.role === 'staff') {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate, user]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.list,
    enabled: isAuthenticated,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products-shopping', { keyword: search }],
    queryFn: () =>
      productService.list({
        page: 1,
        limit: 50,
        sortBy: 'newest',
        keyword: search,
      }),
    staleTime: 5 * 60 * 1000,
  });

  const products = useMemo(() => (data?.items || []) as Product[], [data]);

  const featuredProducts = useMemo<FeaturedProduct[]>(() => {
    return (products as Product[]).slice(0, 4).map((product, idx) => ({
      ...product,
      badge: idx === 0 ? '-25%' : idx === 1 ? 'Best Seller' : idx === 3 ? 'New' : undefined,
      badgeColor: idx === 1 ? 'green' : idx === 3 ? 'blue' : 'red',
      rating: 5 - idx * 0.5,
      ratingCount: 120 - idx * 31,
      oldPrice: idx === 0 ? product.price + 200 : undefined,
    }));
  }, [products]);

  const bestDeals = useMemo<DealProduct[]>(() => {
    const discounts = [40, 30, 50, 35, 45, 25];
    return (products as Product[])
      .filter((_, idx) => idx >= 4 && idx < 10)
      .map((product, idx) => {
        const discountPercent = discounts[idx % discounts.length];
        return {
          ...product,
          discountPercent,
          oldPrice: product.price + (product.price * discountPercent) / 100,
        };
      });
  }, [products]);

  const handleAddToCart = (productId: string) => {
    if (!user) {
      navigate(ROUTES.LOGIN);
      return;
    }

    if (user.role !== 'customer') {
      showErrorMessage('Only customers can add products to the cart.');
      return;
    }

    addMutation.mutate({ productId, quantity: 1 });
  };

  return (
    <ShoppingLayout>
      <div style={{ background: '#F5F6FA', paddingBottom: 64 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
            padding: 16,
            maxWidth: 600,
            margin: '32px auto 0',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Input
            prefix={<SearchOutlined style={{ color: '#aaa' }} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={'Search for products, brands, and more...'}
            size="large"
            style={{ border: 'none', background: 'transparent' }}
          />
        </div>

        <div style={{ maxWidth: 1250, margin: '0 auto', padding: '0 16px 64px' }}>
          <div
            style={{
              background: 'linear-gradient(90deg, #5A54FF 0%, #24C6DC 100%)',
              borderRadius: 12,
              padding: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              margin: '32px 0',
              minHeight: 220,
              color: '#fff',
              overflow: 'hidden',
            }}
          >
            <div style={{ maxWidth: 360 }}>
              <div style={{ fontWeight: 700, fontSize: 36, marginBottom: 16 }}>Flash Sale Today!</div>
              <div style={{ opacity: 0.93, fontSize: 18, marginBottom: 24 }}>
                Up to 70% off on selected items. Limited time offer!
              </div>
              <Button size="large" type="primary" style={{ background: '#fff', color: '#5732E0', fontWeight: 500 }}>
                Shop Now
              </Button>
            </div>
            <img src={logo} alt="flash-sale-cart" style={{ height: 270, width: 370 }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '32px 0', flexWrap: 'wrap' }}>
            {categories.slice(0, 6).map((cat: any) => (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: '#F7F8FA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  {iconMap[cat.name] || <AppstoreOutlined style={{ fontSize: 28, color: '#5A54FF' }} />}
                </div>
                <span style={{ fontWeight: 500 }}>{cat.name}</span>
              </div>
            ))}
          </div>

          <div style={{ margin: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Featured Products</h2>
              <a href="#" style={{ color: '#5732E0', fontWeight: 500 }}>
                View All &rarr;
              </a>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spin size="large" />
              </div>
            ) : featuredProducts.length > 0 ? (
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {featuredProducts.map((prod) => (
                  <Card
                    key={prod.id}
                    style={{
                      maxWidth: 250,
                      width: '100%',
                      borderRadius: 14,
                      boxShadow: '0 2px 12px #e7e7f5',
                      position: 'relative',
                    }}
                    cover={
                      <img
                        alt={prod.name}
                        src={prod.images?.[0]?.url || 'https://via.placeholder.com/250x150?text=Product'}
                        style={{ height: 130, objectFit: 'cover', borderTopLeftRadius: 14, borderTopRightRadius: 14 }}
                      />
                    }
                  >
                    {prod.badge && (
                      <Tag color={prod.badgeColor || 'blue'} style={{ position: 'absolute', left: 16, top: 12 }}>
                        {prod.badge}
                      </Tag>
                    )}
                    <div style={{ height: 40, fontWeight: 600 }}>{prod.name}</div>
                    <Rate allowHalf value={prod.rating ?? 5} disabled style={{ fontSize: 16 }} />
                    <span style={{ color: '#999', marginLeft: 4 }}>({prod.ratingCount ?? 0} reviews)</span>
                    <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
                      ${prod.price.toLocaleString()}
                      {prod.oldPrice && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontWeight: 400,
                            color: '#bbb',
                            textDecoration: 'line-through',
                            fontSize: 15,
                          }}
                        >
                          ${prod.oldPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Button
                      type="primary"
                      block
                      style={{ marginTop: 16, background: '#5732E0' }}
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleAddToCart(prod.id)}
                      loading={addMutation.isPending && addMutation.variables?.productId === prod.id}
                      disabled={prod.stock === 0}
                    >
                      {prod.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888' }}>
                No approved products yet. Please create products as a vendor and have staff/admin approve them.
              </div>
            )}
          </div>

          <div style={{ margin: '32px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0 }}>Best Deals</h2>
              <a href="#" style={{ color: '#5732E0', fontWeight: 500 }}>
                View All &rarr;
              </a>
            </div>

            {isLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}>
                <Spin size="large" />
              </div>
            ) : bestDeals.length > 0 ? (
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                {bestDeals.map((prod) => (
                  <Card
                    key={prod.id}
                    style={{ width: 180, borderRadius: 10, boxShadow: '0 2px 8px #ece9f4', position: 'relative' }}
                    cover={
                      <img
                        alt={prod.name}
                        src={prod.images?.[0]?.url || 'https://via.placeholder.com/180x120?text=Deal'}
                        style={{ height: 90, objectFit: 'cover', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
                      />
                    }
                  >
                    <Tag color="red" style={{ position: 'absolute', left: 12, top: 12, fontWeight: 600 }}>
                      -{prod.discountPercent}%
                    </Tag>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{prod.name}</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>${prod.price.toLocaleString()}</div>
                    {prod.oldPrice && (
                      <span style={{ color: '#bbb', textDecoration: 'line-through', fontSize: 13 }}>
                        ${prod.oldPrice.toLocaleString()}
                      </span>
                    )}
                    <Button
                      type="primary"
                      block
                      style={{ marginTop: 12, background: '#5732E0' }}
                      icon={<ShoppingCartOutlined />}
                      onClick={() => handleAddToCart(prod.id)}
                      loading={addMutation.isPending && addMutation.variables?.productId === prod.id}
                      disabled={prod.stock === 0}
                    >
                      {prod.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <div style={{ color: '#888' }}>
                No deals yet. Once products are approved, they will appear here.
              </div>
            )}
          </div>
        </div>
      </div>
    </ShoppingLayout>
  );
};

export default ShoppingPage;