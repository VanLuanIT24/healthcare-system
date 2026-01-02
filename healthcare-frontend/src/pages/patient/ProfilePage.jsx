// src/pages/patient/ProfilePage.jsx
import { DashboardLayout } from '@/components/layout';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Card, DatePicker, Form, Input, message, Tabs } from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

import locale from 'antd/es/date-picker/locale/vi_VN';
import { motion } from 'framer-motion';
import { useState } from 'react';

const { TabPane } = Tabs;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Profile updated:', values);
      message.success('Cập nhật hồ sơ thành công!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Hồ sơ cá nhân</h1>
          <p className="text-gray-500">Quản lý thông tin cá nhân và cài đặt tài khoản</p>
        </div>

        <Tabs defaultActiveKey="info">
          {/* Personal Info */}
          <TabPane tab="Thông tin cá nhân" key="info">
            <Card className="rounded-xl">
              <div className="flex justify-center mb-6">
                <Avatar size={80} icon={<UserOutlined />} />
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                  fullName: 'Nguyễn Văn A',
                  email: 'nguyenvana@email.com',
                  phone: '0912345678',
                  gender: 'male',
                  birthday: null,
                  address: '123 Đường ABC, Quận 7',
                  city: 'TP. Hồ Chí Minh',
                }}
              >
                <Form.Item
                  name="fullName"
                  label="Họ và tên"
                  rules={[{ required: true }]}
                >
                  <Input size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[{ required: true, type: 'email' }]}
                >
                  <Input size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Số điện thoại"
                  rules={[{ required: true }]}
                >
                  <Input size="large" className="rounded-lg" />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                  <Form.Item
                    name="gender"
                    label="Giới tính"
                    rules={[{ required: true }]}
                  >
                    <CustomSelect
                      options={[
                        { label: 'Nam', value: 'male' },
                        { label: 'Nữ', value: 'female' },
                        { label: 'Khác', value: 'other' },
                      ]}
                    />

                  </Form.Item>

                  <Form.Item
                    name="birthday"
                    label="Ngày sinh"
                    rules={[{ required: true }]}
                  >
                    <DatePicker
                      size="large"
                      locale={locale}
                      className="w-full rounded-lg"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="address"
                  label="Địa chỉ"
                >
                  <Input size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item
                  name="city"
                  label="Thành phố"
                >
                  <Input size="large" className="rounded-lg" />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    className="rounded-lg"
                  >
                    Lưu thay đổi
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </TabPane>

          {/* Security */}
          <TabPane tab="Bảo mật" key="security">
            <Card className="rounded-xl space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Đổi mật khẩu
                </h3>
                <Form
                  layout="vertical"
                  onFinish={(values) => {
                    message.success('Mật khẩu đã được cập nhật!');
                  }}
                >
                  <Form.Item
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    rules={[{ required: true }]}
                  >
                    <Input.Password size="large" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[{ required: true, min: 6 }]}
                  >
                    <Input.Password size="large" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu"
                    dependencies={['newPassword']}
                    rules={[
                      { required: true },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('newPassword') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('Mật khẩu không khớp')
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password size="large" className="rounded-lg" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" className="rounded-lg">
                      Đổi mật khẩu
                    </Button>
                  </Form.Item>
                </Form>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thiết bị
                </h3>
                <p className="text-gray-600 mb-4">Quản lý các thiết bị đã đăng nhập</p>
                <Button>Xem chi tiết</Button>
              </div>
            </Card>
          </TabPane>

          {/* Notifications */}
          <TabPane tab="Thông báo" key="notifications">
            <Card className="rounded-xl">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Thông báo email
                    </h4>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo qua email
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Thông báo SMS
                    </h4>
                    <p className="text-sm text-gray-500">
                      Nhận thông báo qua tin nhắn
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Nhắc nhở lịch khám
                    </h4>
                    <p className="text-sm text-gray-500">
                      Nhắc nhở trước lịch khám
                    </p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-5 h-5" />
                </div>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
