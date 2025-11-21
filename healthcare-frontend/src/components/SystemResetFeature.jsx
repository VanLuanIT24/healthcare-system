import React, { useState } from 'react';
import {
  Card,
  Button,
  Modal,
  message,
  Alert,
  Space,
  Spin,
  Checkbox,
  Divider,
  List,
  Tag,
  Statistic,
  Row,
  Col
} from 'antd';
import {
  DeleteOutlined,
  WarningOutlined,
  SafetyOutlined,
  DatabaseOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';

const SystemResetFeature = () => {
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [agreedToWarning, setAgreedToWarning] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  const handleShowResetModal = () => {
    setIsModalVisible(true);
    setConfirmationText('');
    setAgreedToWarning(false);
  };

  const handleReset = async () => {
    if (!agreedToWarning) {
      message.error('Vui lòng đồng ý với cảnh báo');
      return;
    }

    if (confirmationText !== 'RESET_SYSTEM_CONFIRM') {
      message.error('Xác nhận không chính xác');
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.post('/super-admin/reset-system');

      if (response.data.success) {
        message.success('Hệ thống đã được reset thành công');
        setResetStatus(response.data.data);
        setIsModalVisible(false);
        
        // Auto logout sau 3 giây
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/superadmin/login';
        }, 3000);
      }
    } catch (err) {
      console.error('Error resetting system:', err);
      message.error(err.response?.data?.message || 'Không thể reset hệ thống');
    } finally {
      setLoading(false);
    }
  };

  const resetItems = [
    {
      title: 'Xóa tất cả dữ liệu bệnh nhân',
      description: 'Xóa toàn bộ thông tin bệnh nhân khỏi cơ sở dữ liệu',
      icon: <DatabaseOutlined style={{ color: '#ff4d4f' }} />,
      warning: true
    },
    {
      title: 'Xóa tất cả người dùng',
      description: 'Xóa toàn bộ tài khoản người dùng (ngoại trừ SUPER_ADMIN)',
      icon: <WarningOutlined style={{ color: '#ff7a45' }} />,
      warning: true
    },
    {
      title: 'Xóa tất cả lịch hẹn',
      description: 'Xóa toàn bộ lịch hẹn và cuộc hẹn',
      icon: <DeleteOutlined style={{ color: '#faad14' }} />,
      warning: true
    },
    {
      title: 'Xóa tất cả logs',
      description: 'Xóa toàn bộ nhật ký audit và hoạt động',
      icon: <DeleteOutlined style={{ color: '#13c2c2' }} />,
      warning: false
    },
    {
      title: 'Clear cache',
      description: 'Xóa tất cả bộ nhớ cache',
      icon: <SafetyOutlined style={{ color: '#1890ff' }} />,
      warning: false
    },
    {
      title: 'Reset sessions',
      description: 'Xóa tất cả session hiện tại (tất cả người dùng sẽ bị đăng xuất)',
      icon: <WarningOutlined style={{ color: '#eb2f96' }} />,
      warning: true
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Alert
        message="⚠️ Tính năng chỉ dành cho Development"
        description="System Reset sẽ XÓA tất cả dữ liệu trong hệ thống. Chỉ sử dụng trong môi trường phát triển!"
        type="warning"
        showIcon
        closable
        style={{ marginBottom: '24px' }}
      />

      {resetStatus && (
        <Card style={{ marginBottom: '24px', backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Alert
            message="✅ Reset thành công"
            description="Hệ thống đã được reset. Bạn sẽ được đăng xuất trong 3 giây..."
            type="success"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Dữ liệu đã xóa"
                value={resetStatus.deletedRecords || 0}
                prefix={<DeleteOutlined />}
              />
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Collections"
                value={resetStatus.collections || 0}
                prefix={<DatabaseOutlined />}
              />
            </Col>
          </Row>
        </Card>
      )}

      {/* What will be reset */}
      <Card
        title="📋 Những gì sẽ được reset"
        style={{ marginBottom: '24px' }}
      >
        <List
          dataSource={resetItems}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '16px',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: item.warning ? '#fff7e6' : '#fafafa'
              }}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
              {item.warning && (
                <Tag color="red" style={{ marginLeft: 'auto' }}>
                  ⚠️ Quan trọng
                </Tag>
              )}
            </List.Item>
          )}
        />
      </Card>

      {/* Warning & Confirmation */}
      <Card
        title="🔐 Xác nhận Reset"
        style={{ backgroundColor: '#fff7e6', borderColor: '#ffbb96' }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="⚠️ CẢNH BÁO QUAN TRỌNG"
            description={
              <div>
                <p>🚨 <strong>ĐIỀU NÀY SẼ:</strong></p>
                <ul style={{ marginBottom: '12px' }}>
                  <li>Xóa TOÀN BỘ dữ liệu trong cơ sở dữ liệu</li>
                  <li>Đăng xuất TOÀN BỘ người dùng hiện tại</li>
                  <li>Xóa tất cả lịch sử hoạt động</li>
                  <li>Clear toàn bộ cache hệ thống</li>
                  <li>Reset tất cả sessions</li>
                </ul>
                <p>✋ <strong>HỌ SẼ KHÔNG THẺ PHỤC HỒI</strong></p>
              </div>
            }
            type="error"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          {/* Confirmation Checkbox */}
          <Checkbox
            checked={agreedToWarning}
            onChange={(e) => setAgreedToWarning(e.target.checked)}
            style={{ color: '#f5222d', fontWeight: 'bold' }}
          >
            Tôi hiểu các hậu quả và muốn tiếp tục reset hệ thống
          </Checkbox>

          {agreedToWarning && (
            <div>
              <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>
                Nhập <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px' }}>RESET_SYSTEM_CONFIRM</code> để xác nhận:
              </p>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder='Nhập "RESET_SYSTEM_CONFIRM"'
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '14px'
                }}
              />
              <p style={{ marginTop: '8px', fontSize: '12px', color: '#999' }}>
                Bạn phải nhập đúng text này để unlock nút Reset
              </p>
            </div>
          )}

          <Divider />

          <Button
            type="primary"
            size="large"
            danger
            icon={<DeleteOutlined />}
            block
            loading={loading}
            disabled={!agreedToWarning || confirmationText !== 'RESET_SYSTEM_CONFIRM'}
            onClick={() => {
              Modal.confirm({
                title: '⚠️ XÁC NHẬN CUỐI CÙNG',
                icon: <WarningOutlined />,
                content: (
                  <div>
                    <p><strong>Bạn có CHẮC CHẮN muốn reset hệ thống?</strong></p>
                    <p style={{ color: '#f5222d', fontWeight: 'bold' }}>
                      Điều này sẽ XÓA TOÀN BỘ dữ liệu!
                    </p>
                  </div>
                ),
                okText: 'Có, Reset ngay',
                okType: 'danger',
                cancelText: 'Hủy',
                onOk: handleReset
              });
            }}
          >
            🗑️ RESET HỆ THỐNG NGAY BÂY GIỜ
          </Button>
        </Space>
      </Card>

      {/* System Info */}
      <Card title="ℹ️ Thông tin hệ thống" style={{ marginTop: '24px' }}>
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div>
            <strong>Môi trường:</strong>
            <Tag color="blue" style={{ marginLeft: '8px' }}>
              {process.env.NODE_ENV || 'development'}
            </Tag>
          </div>
          <div>
            <strong>Trạng thái:</strong>
            <Tag color="green" style={{ marginLeft: '8px' }}>
              Hoạt động bình thường
            </Tag>
          </div>
          <div>
            <strong>Chỉ reset được trong:</strong>
            <Tag color="orange" style={{ marginLeft: '8px' }}>
              Development Mode
            </Tag>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default SystemResetFeature;
