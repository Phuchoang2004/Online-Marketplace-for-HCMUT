import React from 'react';
import { Card } from 'antd';
import { 
  AppstoreOutlined, 
  SmileOutlined, 
  HomeOutlined, 
  HeartOutlined,
  GiftOutlined, 
  SkinOutlined 
} from '@ant-design/icons';

const iconMap: any = {
  Electronics: <AppstoreOutlined style={{ fontSize: 28, color: '#5A54FF' }} />, // default icons
  Fashion: <SkinOutlined style={{ fontSize: 28, color: '#EA4C89' }} />, 
  'Home & Living': <HomeOutlined style={{ fontSize: 28, color: '#34C759' }} />,
  Sports: <SmileOutlined style={{ fontSize: 28, color: '#FFCE00' }} />,
  'Health & Beauty': <HeartOutlined style={{ fontSize: 28, color: '#A259F7' }} />,
  'Toys & Games': <GiftOutlined style={{ fontSize: 28, color: '#FF6D00' }} />,
};

interface Category {
    id: string;
    name: string;
}
interface CategoryIconsProps {
    categories?: Category[];
}

const CategoryIcons: React.FC<CategoryIconsProps> = ({ categories = [] }) => (
  <div style={{
    display: 'flex', justifyContent: 'center', gap: 32, margin: '32px 0', flexWrap: 'wrap'
  }}>
    {categories.slice(0, 6).map((cat, idx) => (
      <div key={cat.id} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%', background: '#F7F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8
        }}>
          {iconMap[cat.name] || <AppstoreOutlined style={{ fontSize: 28, color: '#5A54FF' }} />}
        </div>
        <span style={{  fontWeight: 500 }}>{cat.name}</span>
      </div>
    ))}
  </div>
);

export default CategoryIcons;
