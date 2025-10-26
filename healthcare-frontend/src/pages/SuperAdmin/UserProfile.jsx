import { useState, useEffect } from 'react';
import { Card, Descriptions, Spin, Alert, Tag, Avatar, Button, Space, Modal, Form, Input, message } from 'antd';
import { 
  UserOutlined, 
  MailOutlined, 
  PhoneOutlined, 
  SafetyOutlined,
  EditOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [form] = Form.useForm();

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      // Lấy thông tin từ endpoint /me
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setUserData(response.data.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Không thể tải thông tin người dùng.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleEdit = () => {
    form.setFieldsValue({
      firstName: userData?.personalInfo?.firstName || '',
      lastName: userData?.personalInfo?.lastName || '',
      phone: userData?.phone || ''
    });
    setEditModalVisible(true);
  };

  const handleUpdateProfile = async (values) => {
    setEditLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        {
          personalInfo: {
            firstName: values.firstName,
            lastName: values.lastName
          },
          phone: values.phone
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        message.success('Cập nhật thông tin thành công!');
        setEditModalVisible(false);
        fetchUserProfile(); // Reload data
      }
    } catch (err) {
      message.error(
        err.response?.data?.error || 
        'Không thể cập nhật thông tin.'
      );
    } finally {
      setEditLoading(false);
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      'super_admin': 'red',
      'admin': 'orange',
      'doctor': 'blue',
      'nurse': 'cyan',
      'receptionist': 'green',
      'patient': 'default'
    };
    return colors[role] || 'default';
  };

  const getRoleLabel = (role) => {
    const labels = {
      'super_admin': 'Super Admin',
      'admin': 'Admin',
      'doctor': 'Bác sĩ',
      'nurse': 'Y tá',
      'receptionist': 'Lễ tân',
      'patient': 'Bệnh nhân'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Đang tải thông tin..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi"
        description={error}
        type="error"
        showIcon
        action={
          <Button size="small" onClick={fetchUserProfile}>
            Thử lại
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Card
        title={
          <Space>
            <UserOutlined />
            <span>Thông tin cá nhân</span>
          </Space>
        }
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={fetchUserProfile}
            >
              Làm mới
            </Button>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
          </Space>
        }
        style={{ maxWidth: 900, margin: '0 auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          <Avatar 
            size={80} 
            icon={<UserOutlined />}
            style={{ marginRight: 20, backgroundColor: '#1890ff' }}
          />
          <div>
            <h2 style={{ margin: 0 }}>
              {userData?.personalInfo?.firstName} {userData?.personalInfo?.lastName}
            </h2>
            <Tag color={getRoleColor(userData?.role)} style={{ marginTop: 8 }}>
              {getRoleLabel(userData?.role)}
            </Tag>
          </div>
        </div>

        <Descriptions bordered column={1}>
          <Descriptions.Item 
            label={<><MailOutlined /> Email</>}
          >
            {userData?.email}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<><PhoneOutlined /> Số điện thoại</>}
          >
            {userData?.phone || 'Chưa cập nhật'}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<><UserOutlined /> Họ</>}
          >
            {userData?.personalInfo?.lastName || 'Chưa cập nhật'}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<><UserOutlined /> Tên</>}
          >
            {userData?.personalInfo?.firstName || 'Chưa cập nhật'}
          </Descriptions.Item>

          <Descriptions.Item 
            label={<><SafetyOutlined /> Vai trò</>}
          >
            <Tag color={getRoleColor(userData?.role)}>
              {getRoleLabel(userData?.role)}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái tài khoản">
            {userData?.isActive ? (
              <Tag color="success">Đang hoạt động</Tag>
            ) : (
              <Tag color="error">Đã vô hiệu hóa</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Email đã xác thực">
            {userData?.isEmailVerified ? (
              <Tag color="success">Đã xác thực</Tag>
            ) : (
              <Tag color="warning">Chưa xác thực</Tag>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo">
            {userData?.createdAt ? new Date(userData.createdAt).toLocaleString('vi-VN') : 'N/A'}
          </Descriptions.Item>

          <Descriptions.Item label="Cập nhật lần cuối">
            {userData?.updatedAt ? new Date(userData.updatedAt).toLocaleString('vi-VN') : 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Modal chỉnh sửa profile */}
      <Modal
        title="Chỉnh sửa thông tin cá nhân"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            label="Họ"
            name="lastName"
            rules={[
              { required: true, message: 'Vui lòng nhập họ!' }
            ]}
          >
            <Input placeholder="Nhập họ" />
          </Form.Item>

          <Form.Item
            label="Tên"
            name="firstName"
            rules={[
              { required: true, message: 'Vui lòng nhập tên!' }
            ]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={editLoading}>
                Cập nhật
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserProfile;
