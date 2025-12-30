// src/pages/admin/users/CreateUser.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import adminAPI from '@/services/api/admin/adminAPI';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Col, DatePicker, Form, Input, Row, Select, Space, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const roles = [
    { label: 'SUPER_ADMIN', value: 'SUPER_ADMIN' },
    { label: 'SYSTEM_ADMIN', value: 'SYSTEM_ADMIN' },
    { label: 'HOSPITAL_ADMIN', value: 'HOSPITAL_ADMIN' },
    { label: 'CLINICAL_ADMIN', value: 'CLINICAL_ADMIN' },
    { label: 'DEPARTMENT_HEAD', value: 'DEPARTMENT_HEAD' },
    { label: 'DOCTOR', value: 'DOCTOR' },
    { label: 'NURSE', value: 'NURSE' },
    { label: 'LAB_TECHNICIAN', value: 'LAB_TECHNICIAN' },
    { label: 'PHARMACIST', value: 'PHARMACIST' },
    { label: 'RECEPTIONIST', value: 'RECEPTIONIST' },
    { label: 'BILLING_STAFF', value: 'BILLING_STAFF' },
    { label: 'PATIENT', value: 'PATIENT' }
  ];

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Format dữ liệu
      const userData = {
        email: values.email,
        password: values.password,
        role: values.role,
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          dateOfBirth: values.dateOfBirth ? values.dateOfBirth.toISOString() : null,
          gender: values.gender,
          phone: values.phone,
          address: {
            street: values.street,
            city: values.city,
            state: values.state,
            zipCode: values.zipCode,
            country: values.country || 'Vietnam'
          }
        },
        status: values.status || 'ACTIVE',
        isEmailVerified: values.isEmailVerified || false
      };

      // Gọi API tạo người dùng
      const response = await adminAPI.createUser(userData);
      
      if (response?.data?.success) {
        message.success('Tạo người dùng thành công!');
        navigate('/admin/users/list');
      } else {
        message.error(response?.data?.message || 'Lỗi tạo người dùng');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      message.error(error?.message || 'Lỗi tạo người dùng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Tạo Người Dùng Mới</h1>
          <Button 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/admin/users/list')}
          >
            Quay lại
          </Button>
        </div>

        {/* Form */}
        <Card className="rounded-lg">
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
          >
            {/* Thông tin đăng nhập */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Email là bắt buộc' },
                    { type: 'email', message: 'Email không hợp lệ' }
                  ]}
                >
                  <Input placeholder="user@example.com" />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: 'Mật khẩu là bắt buộc' },
                    { min: 8, message: 'Mật khẩu phải ít nhất 8 ký tự' }
                  ]}
                >
                  <Input.Password placeholder="Nhập mật khẩu (tối thiểu 8 ký tự)" />
                </Form.Item>
              </Col>
            </Row>

            {/* Role và Trạng thái */}
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Role"
                  name="role"
                  rules={[{ required: true, message: 'Role là bắt buộc' }]}
                >
                  <Select 
                    placeholder="Chọn role"
                    options={roles}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Trạng thái"
                  name="status"
                  initialValue="ACTIVE"
                >
                  <Select 
                    options={[
                      { label: 'ACTIVE', value: 'ACTIVE' },
                      { label: 'INACTIVE', value: 'INACTIVE' },
                      { label: 'SUSPENDED', value: 'SUSPENDED' },
                      { label: 'PENDING_APPROVAL', value: 'PENDING_APPROVAL' }
                    ]}
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Thông tin cá nhân */}
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <h3 className="font-bold mb-4">Thông tin cá nhân</h3>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tên"
                    name="firstName"
                    rules={[{ required: true, message: 'Tên là bắt buộc' }]}
                  >
                    <Input placeholder="Tên" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Họ"
                    name="lastName"
                    rules={[{ required: true, message: 'Họ là bắt buộc' }]}
                  >
                    <Input placeholder="Họ" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Ngày sinh"
                    name="dateOfBirth"
                    rules={[{ required: true, message: 'Ngày sinh là bắt buộc' }]}
                  >
                    <DatePicker 
                      format="DD/MM/YYYY"
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Giới tính"
                    name="gender"
                    rules={[{ required: true, message: 'Giới tính là bắt buộc' }]}
                  >
                    <Select 
                      options={[
                        { label: 'Nam', value: 'MALE' },
                        { label: 'Nữ', value: 'FEMALE' },
                        { label: 'Khác', value: 'OTHER' }
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Số điện thoại"
                    name="phone"
                  >
                    <Input placeholder="Số điện thoại" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Xác minh email"
                    name="isEmailVerified"
                    valuePropName="checked"
                    initialValue={false}
                  >
                    <Checkbox>Đánh dấu email đã xác minh</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              {/* Địa chỉ */}
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Form.Item
                    label="Đường"
                    name="street"
                  >
                    <Input placeholder="Địa chỉ" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Thành phố"
                    name="city"
                  >
                    <Input placeholder="Thành phố" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Tỉnh/Thành"
                    name="state"
                  >
                    <Input placeholder="Tỉnh/Thành" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Mã bưu điện"
                    name="zipCode"
                  >
                    <Input placeholder="Mã bưu điện" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Quốc gia"
                    name="country"
                    initialValue="Vietnam"
                  >
                    <Input placeholder="Quốc gia" />
                  </Form.Item>
                </Col>
              </Row>
            </div>

            {/* Buttons */}
            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={loading}
                  size="large"
                >
                  Tạo người dùng
                </Button>
                <Button 
                  onClick={() => form.resetFields()}
                  size="large"
                >
                  Xóa form
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default CreateUser;
