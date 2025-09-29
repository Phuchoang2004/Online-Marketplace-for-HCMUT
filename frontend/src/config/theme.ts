import { theme } from 'antd';

// Custom theme configuration for Ant Design
export const customTheme = {
  token: {
    // Primary colors
    colorPrimary: '#1890ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1890ff',
    
    // Layout
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f0f2f5',
    
    // Border
    borderRadius: 6,
    
    // Typography
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
    fontSizeHeading1: 38,
    fontSizeHeading2: 30,
    fontSizeHeading3: 24,
    fontSizeHeading4: 20,
    fontSizeHeading5: 16,
    
    // Spacing
    padding: 16,
    margin: 16,
    
    // Animation
    motionDuration: '0.2s',
    motionEaseInOut: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
  },
  algorithm: theme.defaultAlgorithm,
};

export const darkTheme = {
  ...customTheme,
  algorithm: theme.darkAlgorithm,
  token: {
    ...customTheme.token,
    colorBgContainer: '#141414',
    colorBgElevated: '#1f1f1f',
    colorBgLayout: '#000000',
  },
};