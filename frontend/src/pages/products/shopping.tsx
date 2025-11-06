import React, { useMemo, useState } from 'react';
import { Button, Card, Input, Tag, Rate, Spin } from 'antd';
import { SearchOutlined, AppstoreOutlined, SmileOutlined, HomeOutlined, HeartOutlined, GiftOutlined, SkinOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import logo from "../../components/logo.png";
const iconMap: Record<string, JSX.Element> = {
  Electronics: <AppstoreOutlined style={{ fontSize: 28, color: '#5A54FF' }} />,
  Fashion: <SkinOutlined style={{ fontSize: 28, color: '#EA4C89' }} />,
  'Home & Living': <HomeOutlined style={{ fontSize: 28, color: '#34C759' }} />,
  Sports: <SmileOutlined style={{ fontSize: 28, color: '#FFCE00' }} />,
  'Health & Beauty': <HeartOutlined style={{ fontSize: 28, color: '#A259F7' }} />,
  'Toys & Games': <GiftOutlined style={{ fontSize: 28, color: '#FF6D00' }} />,
};

const ShoppingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    if (!user || user.role !== 'customer') {
      navigate('/');
    }
  }, [user, navigate]);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.list,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['products-shopping'],
    queryFn: () => productService.list({ page: 1, limit: 50, sortBy: 'newest' }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const products = useMemo(() => {
    let items: any[] = data?.items || [];
    // Chỉ hiển thị sản phẩm đã được duyệt
    items = items.filter((p: any) => p.approvalStatus === 'APPROVED');
    if (search) {
      items = items.filter((prd: any) => prd.name?.toLowerCase().includes(search.toLowerCase()));
    }
    return items as any[];
  }, [search, data]);

  const featuredProducts = useMemo(() => (
    (products as any[]).slice(0, 4).map((p: any, idx: number) => ({
      ...p,
      badge: idx === 0 ? '-25%' : idx === 1 ? 'Best Seller' : idx === 3 ? 'New' : undefined,
      badgeColor: idx === 1 ? 'green' : idx === 3 ? 'blue' : 'red',
      rating: 5 - idx * 0.5,
      ratingCount: 120 - idx * 31,
      oldPrice: idx === 0 ? p.price + 200 : undefined,
    }))
  ), [products]);

  const bestDeals = useMemo(() => (
    (products as any[])
      .filter((_: any, idx: number) => idx >= 4 && idx < 10)
      .map((p: any, idx: number) => ({
        ...p,
        discountPercent: [40, 30, 50, 35, 45, 25][idx % 6],
        oldPrice: p.price + (p.price * ([40, 30, 50, 35, 45, 25][idx % 6]) / 100),
      }))
  ), [products]);

  return (
    <div style={{background: '#F5F6FA', minHeight: '80vh',paddingTop: 20, paddingBottom: 32}}>
      {/* Search Bar */}
      <div style={{
        background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.03)', padding: 16, maxWidth: 600,
        margin: '32px auto 0', display: 'flex', alignItems: 'center'
      }}>
        <Input
          prefix={<SearchOutlined style={{ color: '#aaa' }} />}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={"Search for products, brands, and more..."}
          size="large"
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>
      {/* Main content */}
      <div style={{ maxWidth: 1250, margin: '0 auto', padding: '0 16px' }}>
        {/* Banner */}
        <div style={{
          background: 'linear-gradient(90deg, #5A54FF 0%, #24C6DC 100%)',
          borderRadius: 12, padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '32px 0', minHeight: 220, color: '#fff', overflow: 'hidden',
        }}>
          <div style={{ maxWidth: 360 }}>
            <div style={{ fontWeight: 700, fontSize: 36, marginBottom: 16 }}>
              Flash Sale Today!
            </div>
            <div style={{ opacity: 0.93, fontSize: 18, marginBottom: 24 }}>
              Up to 70% off on selected items. Limited time offer!
            </div>
            <Button size="large" type="primary" style={{ background: '#fff', color: '#5732E0', fontWeight: 500 }}>
              Shop Now
            </Button>
          </div>
          <img src={logo} alt="flash-sale-cart" style={{ height: 270, width: 370 }} />
        </div>
        {/* Category icons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, margin: '32px 0', flexWrap: 'wrap' }}>
          {categories.slice(0, 6).map((cat: any) => (
            <div key={cat.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F7F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                {iconMap[cat.name] || <AppstoreOutlined style={{ fontSize: 28, color: '#5A54FF' }} />}
              </div>
              <span style={{ fontWeight: 500 }}>{cat.name}</span>
            </div>
          ))}
        </div>
        {/* Featured Products */}
        <div style={{ margin: '32px 0' }}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{margin: 0}}>Featured Products</h2>
            <a href="#" style={{ color: '#5732E0', fontWeight: 500 }}>View All &rarr;</a>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spin size="large"/></div>
          ) : (
            <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
              {(featuredProducts as any[]).slice(0, 4).map((prod: any) => (
                <Card
                  key={prod.id}
                  style={{maxWidth: 250, width: '100%' , borderRadius: 14, boxShadow: '0 2px 12px #e7e7f5', position: 'relative'}}
                  cover={<img alt={prod.name} src={prod.images?.[0]?.url || ''} style={{ height: 130, objectFit: 'cover', borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />}
                >
                  <div style={{position: 'absolute', left: 16, top: 8}}>
                    {prod.badge && (
                      <Tag color={prod.badgeColor || 'blue'}>{prod.badge}</Tag>
                    )}
                  </div>
                  <div style={{height: 40, fontWeight: 600}}>{prod.name}</div>
                  <Rate allowHalf value={prod.rating || 5} disabled style={{ fontSize: 16 }} />
                  <span style={{color: '#999', marginLeft: 4}}>({prod.ratingCount || 0} reviews)</span>
                  <div style={{ fontSize: 20, fontWeight: 700, marginTop: 8 }}>
                    ${prod.price.toLocaleString()}
                    {prod.oldPrice && (
                      <span style={{ marginLeft: 8, fontWeight: 400, color: '#bbb', textDecoration: 'line-through', fontSize: 15 }}>
                        ${prod.oldPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <Button type="primary" block style={{ marginTop: 16, background: '#5732E0' }}>
                    Add to Cart
                  </Button>
                </Card>
              ))}
              {(featuredProducts as any[]).length === 0 && (
                <div style={{ color: '#888' }}>No approved products yet. Please create products as a vendor and have staff/admin approve them.</div>
              )}
            </div>
          )}
        </div>
        {/* Best Deals */}
        <div style={{margin: '32px 0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{margin: 0}}>Best Deals</h2>
            <a href="#" style={{ color: '#5732E0', fontWeight: 500 }}>View All &rarr;</a>
          </div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 24 }}><Spin size="large"/></div>
          ) : (
            <div style={{display: 'flex', gap: 20, flexWrap: 'wrap'}}>
              {(bestDeals as any[]).slice(0, 6).map((prod: any) => (
                <Card
                  key={prod.id}
                  style={{ width: 180, borderRadius: 10, boxShadow: '0 2px 8px #ece9f4', position: 'relative' }}
                  cover={<img alt={prod.name} src={prod.images?.[0]?.url || ''} style={{ height: 90, objectFit: 'cover', borderTopLeftRadius: 10, borderTopRightRadius: 10 }} />}
                >
                  <Tag color="red" style={{ position: 'absolute', left: 10, top: 8, fontWeight: 600, fontSize: 15, borderRadius: 6 }}>
                    -{prod.discountPercent || 30}%
                  </Tag>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{prod.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>${prod.price.toLocaleString()}</div>
                  {prod.oldPrice && (
                    <span style={{ marginLeft: 0, fontWeight: 400, color: '#bbb', textDecoration: 'line-through', fontSize: 13 }}>
                      ${prod.oldPrice.toLocaleString()}
                    </span>
                  )}
                  <Button type="primary" block style={{ marginTop: 8, background: '#5732E0' }}>
                    Add to Cart
                  </Button>
                </Card>
              ))}
              {(bestDeals as any[]).length === 0 && (
                <div style={{ color: '#888' }}>No deals yet. Once products are approved, they will appear here.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShoppingPage;
