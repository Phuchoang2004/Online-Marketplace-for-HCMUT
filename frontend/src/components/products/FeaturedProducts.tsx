import React from 'react';
import { Card, Button, Tag, Rate, Typography } from 'antd';

const { Paragraph } = Typography;

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images?: { url: string }[];
  rating?: number;
  ratingCount?: number;
  badge?: string;
  badgeColor?: string;
}

interface FeaturedProductsProps {
  products: Product[];
}

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ products }) => (
  <div style={{
    margin: '32px 0',
  }}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{margin: 0}}>Featured Products</h2>
      <a href="#" style={{ color: '#5732E0', fontWeight: 500 }}>View All &rarr;</a>
    </div>
    <div style={{display: 'flex', gap: 24, flexWrap: 'wrap'}}>
      {products.slice(0, 4).map(prod => (
        <Card
          key={prod.id}
          style={{maxWidth: 250, width: '100%' , borderRadius: 14, boxShadow: '0 2px 12px #e7e7f5'}} 
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
    </div>
  </div>
);

export default FeaturedProducts;
