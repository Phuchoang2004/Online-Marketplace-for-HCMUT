import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

interface SearchBarProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder }) => (
  <div style={{
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    padding: 16,
    maxWidth: 600,
    margin: '32px auto 0',
    display: 'flex',
    alignItems: 'center',
  }}>
    <Input
      prefix={<SearchOutlined style={{ color: '#aaa' }} />}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      placeholder={placeholder || 'Search for products, brands, and more...'}
      size="large"
      style={{ border: 'none', background: 'transparent' }}
    />
  </div>
);

export default SearchBar;
