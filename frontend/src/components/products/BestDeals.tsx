import React from 'react';
import { Card, Button, Tag } from 'antd';

interface Product {
  id: string;
  name: string;
  price: number;
  oldPrice?: number;
  images?: { url: string }[];
  discountPercent?: number;
}

interface BestDealsProps {
  products: Product[];
}

const BestDeals: React.FC<BestDealsProps> = ({ products }) => (
  <div style={{margin: '32px 0'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h2 style={{margin: 0}}>Best Deals</h2>
      <a href="#" style={{ color: '#5732E0', fontWeight: 500 }}>View All &rarr;</a>
    </div>
    <div style={{display: 'flex', gap: 20, flexWrap: 'wrap'}}>
      {products.slice(0, 6).map(prod => (
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
    </div>
  </div>
);

export default BestDeals;
