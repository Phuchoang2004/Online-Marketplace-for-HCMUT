import React from 'react';
import { Card, Row, Col, Typography, Switch, Select, Divider, Button, Space, Form } from 'antd';
import { useApp } from '@/contexts/AppContext';

const { Title, Paragraph } = Typography;
const { Option } = Select;

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, sidebarCollapsed, toggleSidebar } = useApp();

  const handleSave = () => {
    console.log('Settings saved');
  };

  return (
    <div>
      <Title level={2}>Settings</Title>
      <Paragraph>Customize your application preferences and behavior.</Paragraph>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Appearance Settings">
            <Form layout="vertical">
              <Form.Item label="Theme">
                <Space>
                  <span>Light</span>
                  <Switch
                    checked={theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <span>Dark</span>
                </Space>
              </Form.Item>

              <Form.Item label="Sidebar">
                <Space>
                  <span>Expanded</span>
                  <Switch
                    checked={sidebarCollapsed}
                    onChange={toggleSidebar}
                  />
                  <span>Collapsed</span>
                </Space>
              </Form.Item>

              <Form.Item label="Language">
                <Select defaultValue="en" style={{ width: 200 }}>
                  <Option value="en">English</Option>
                  <Option value="es">Spanish</Option>
                  <Option value="fr">French</Option>
                  <Option value="de">German</Option>
                </Select>
              </Form.Item>

              <Form.Item label="Date Format">
                <Select defaultValue="MM/DD/YYYY" style={{ width: 200 }}>
                  <Option value="MM/DD/YYYY">MM/DD/YYYY</Option>
                  <Option value="DD/MM/YYYY">DD/MM/YYYY</Option>
                  <Option value="YYYY-MM-DD">YYYY-MM-DD</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Notification Settings">
            <Form layout="vertical">
              <Form.Item label="Email Notifications">
                <Switch defaultChecked />
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                  Receive email notifications for important updates
                </Paragraph>
              </Form.Item>

              <Form.Item label="Push Notifications">
                <Switch defaultChecked />
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                  Receive push notifications in your browser
                </Paragraph>
              </Form.Item>

              <Form.Item label="SMS Notifications">
                <Switch />
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                  Receive SMS notifications for critical alerts
                </Paragraph>
              </Form.Item>

              <Form.Item label="Marketing Communications">
                <Switch />
                <Paragraph style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                  Receive promotional emails and product updates
                </Paragraph>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Privacy & Security">
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Form layout="vertical">
                  <Form.Item label="Profile Visibility">
                    <Select defaultValue="public" style={{ width: '100%' }}>
                      <Option value="public">Public</Option>
                      <Option value="private">Private</Option>
                      <Option value="friends">Friends Only</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="Two-Factor Authentication">
                    <Space direction="vertical">
                      <Switch />
                      <Paragraph style={{ margin: 0, fontSize: 12, color: '#666' }}>
                        Add an extra layer of security to your account
                      </Paragraph>
                    </Space>
                  </Form.Item>
                </Form>
              </Col>

              <Col xs={24} lg={12}>
                <Form layout="vertical">
                  <Form.Item label="Data Export">
                    <Button type="default" block>
                      Download My Data
                    </Button>
                    <Paragraph style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                      Export all your personal data
                    </Paragraph>
                  </Form.Item>

                  <Form.Item label="Account Deletion">
                    <Button danger block>
                      Delete Account
                    </Button>
                    <Paragraph style={{ margin: '8px 0 0 0', fontSize: 12, color: '#666' }}>
                      Permanently delete your account and all data
                    </Paragraph>
                  </Form.Item>
                </Form>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Divider />

      <Space>
        <Button type="primary" size="large" onClick={handleSave}>
          Save Settings
        </Button>
        <Button size="large">
          Reset to Defaults
        </Button>
      </Space>
    </div>
  );
};