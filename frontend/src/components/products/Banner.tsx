import React from 'react';
import { Button } from 'antd';

const Banner: React.FC = () => (
  <div style={{
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
    <img src="https://cdn-icons-png.flaticon.com/512/4290/4290854.png" alt="flash-sale-cart" style={{ height: 170 }} />
  </div>
);

export default Banner;
