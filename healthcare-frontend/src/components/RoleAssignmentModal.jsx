import React, { useState } from 'react';
import {
  Modal,
  Form,
  Select,
  Button,
  Space,
  message,
  Divider,
  Alert,
  Tag,
  Tooltip,
  Spin
} from 'antd';
import {
  SafetyOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
  MedicineBoxOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';

const roleDescriptions = {
  SUPER_ADMIN: {
    icon: <CrownOutlined />,
    color: 'red',
    description: 'Quyền cao nhất, quản lý toàn hệ thống',
    permissions: ['Tất cả quyền']
  },
  ADMIN: {
    icon: <SafetyOutlined />,
    color: 'orange',
    description: 'Quản lý bệnh viện, nhân sự',
    permissions: ['Quản lý users', 'Quản lý phòng ban', 'Xem báo cáo']
  },
  DOCTOR: {
    icon: <MedicineBoxOutlined />,
    color: 'blue',
    description: 'Khám chữa bệnh, kê đơn thuốc',
    permissions: ['Khám bệnh', 'Kê đơn', 'Xem hồ sơ bệnh nhân']
  },
  NURSE: {
    icon: <MedicineBoxOutlined />,
    color: 'cyan',
    description: 'Hỗ trợ bác sĩ, chăm sóc bệnh nhân',
    permissions: ['Chăm sóc bệnh nhân', 'Cập nhật hồ sơ', 'Lấy mẫu']
  },
  RECEPTIONIST: {
    icon: <PhoneOutlined />,
    color: 'green',
    description: 'Tiếp nhân, đặt lịch hẹn',
    permissions: ['Tiếp nhân', 'Đặt lịch hẹn', 'Xử lý hóa đơn']
  },
  PATIENT: {
    icon: <UserOutlined />,
    color: 'default',
    description: 'Bệnh nhân',
    permissions: ['Xem hồ sơ cá nhân', 'Xem lịch khám', 'Thanh toán']
  }
};

const RoleAssignmentModal = ({ visible, user, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role || 'PATIENT');

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await apiClient.patch(
        `/users/${user?._id}/role`,
        { role: values.role }
      );

      message.success(`Đã cập nhật vai trò thành "${values.role}"`);
      onSuccess();
      form.resetFields();
    } catch (err) {
      message.error(
        err.response?.data?.error || 
        'Không thể cập nhật vai trò'
      );
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = Object.entries(roleDescriptions).map(([key, value]) => ({
    label: (
      <Space direction="vertical" size={0}>
        <Space>
          {value.icon}
          <span>{key}</span>
        </Space>
        <span style={{ fontSize: '12px', color: '#999' }}>
          {value.description}
        </span>
      </Space>
    ),
    value: key,
    icon: value.icon,
    color: value.color,
    permissions: value.permissions
  }));

  return (
    <Modal
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span>Gán vai trò cho người dùng</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
      bodyStyle={{ padding: '24px' }}
    >
      <Spin spinning={loading}>
        {/* User Info */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          color: 'white'
        }}>
          <Space direction="vertical" size={0}>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Email</div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{user?.email}</div>
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.9 }}>Vai trò hiện tại</div>
            <div>
              <Tag color={roleDescriptions[user?.role]?.color}>
                {user?.role}
              </Tag>
            </div>
          </Space>
        </div>

        <Alert
          message="Lưu ý"
          description="Thay đổi vai trò sẽ ảnh hưởng đến quyền hạn và chức năng mà người dùng có thể truy cập."
          type="warning"
          showIcon
          style={{ marginBottom: '20px' }}
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ role: user?.role }}
        >
          <Form.Item
            label={<span style={{ fontWeight: 'bold' }}>Chọn vai trò mới</span>}
            name="role"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select
              placeholder="Chọn vai trò..."
              size="large"
              optionLabelProp="label"
              onChange={setSelectedRole}
            >
              {roleOptions.map(option => (
                <Select.Option key={option.value} value={option.value} label={
                  <Space>
                    {option.icon}
                    <span>{option.value}</span>
                  </Space>
                }>
                  <Space direction="vertical" size={0} style={{ width: '100%' }}>
                    <Space>
                      {option.icon}
                      <span style={{ fontWeight: 'bold' }}>{option.value}</span>
                      <Tag color={option.color} style={{ marginLeft: '8px' }}>
                        {option.color}
                      </Tag>
                    </Space>
                    <div style={{
                      fontSize: '12px',
                      color: '#666',
                      marginTop: '8px',
                      marginLeft: '24px'
                    }}>
                      {option.description}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#999',
                      marginTop: '4px',
                      marginLeft: '24px'
                    }}>
                      Quyền: {option.permissions.join(', ')}
                    </div>
                  </Space>
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Role Details */}
          {selectedRole && roleDescriptions[selectedRole] && (
            <>
              <Divider />
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px' }}>📋 Chi tiết vai trò</h4>
                <div style={{
                  background: '#f5f5f5',
                  padding: '12px',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${
                    roleDescriptions[selectedRole]?.color === 'default' 
                      ? '#d9d9d9' 
                      : '#1890ff'
                  }`
                }}>
                  <Space direction="vertical" size={8} style={{ width: '100%' }}>
                    <div>
                      <strong>{roleDescriptions[selectedRole]?.description}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      <strong>Quyền hạn:</strong>
                      <ul style={{ margin: '4px 0 0 20px', paddingLeft: 0 }}>
                        {roleDescriptions[selectedRole]?.permissions.map((perm, idx) => (
                          <li key={idx}>{perm}</li>
                        ))}
                      </ul>
                    </div>
                  </Space>
                </div>
              </div>
            </>
          )}

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={onCancel}>Hủy</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SafetyOutlined />}
              >
                Cập nhật vai trò
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default RoleAssignmentModal;
