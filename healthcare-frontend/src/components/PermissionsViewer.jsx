import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Table,
  Tag,
  Spin,
  message,
  Button,
  Space,
  Empty,
  Tooltip,
  Card,
  Row,
  Col,
  Statistic,
  Badge
} from 'antd';
import {
  SafetyOutlined,
  CheckCircleOutlined,
  LockOutlined,
  ReloadOutlined,
  CloseCircleOutlined,
  FileDoneOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';

const permissionCategories = {
  USER: {
    icon: '👤',
    color: 'blue',
    permissions: ['VIEW_USER', 'CREATE_USER', 'UPDATE_USER', 'DELETE_USER', 'DISABLE_USER']
  },
  PATIENT: {
    icon: '🏥',
    color: 'green',
    permissions: ['PATIENT_VIEW', 'PATIENT_CREATE', 'PATIENT_UPDATE', 'PATIENT_DELETE']
  },
  APPOINTMENT: {
    icon: '📅',
    color: 'orange',
    permissions: ['APPOINTMENT_VIEW', 'APPOINTMENT_CREATE', 'APPOINTMENT_UPDATE', 'APPOINTMENT_CANCEL']
  },
  PRESCRIPTION: {
    icon: '💊',
    color: 'purple',
    permissions: ['PRESCRIPTION_VIEW', 'PRESCRIPTION_CREATE', 'PRESCRIPTION_APPROVE']
  },
  BILLING: {
    icon: '💰',
    color: 'cyan',
    permissions: ['BILLING_VIEW', 'BILLING_CREATE', 'BILLING_APPROVE', 'BILLING_EXPORT']
  },
  ADMIN: {
    icon: '⚙️',
    color: 'red',
    permissions: ['SYSTEM_CONFIG', 'USER_MANAGEMENT', 'AUDIT_LOG', 'BACKUP']
  }
};

const PermissionsViewer = ({ visible, user, onClose }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allPermissions, setAllPermissions] = useState([]);

  useEffect(() => {
    if (visible && user) {
      fetchPermissions();
    }
  }, [visible, user]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(
        `/users/${user?._id}/permissions`
      );

      setPermissions(response.data.data?.permissions || []);
      setAllPermissions(response.data.data?.allPermissions || []);
    } catch (err) {
      message.error('Không thể tải danh sách quyền');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const permissionColumns = [
    {
      title: 'Quyền',
      dataIndex: 'permission',
      key: 'permission',
      width: '40%',
      render: (text) => (
        <Space>
          <LockOutlined style={{ color: '#1890ff' }} />
          <span style={{ fontFamily: 'monospace', fontSize: '13px' }}>{text}</span>
        </Space>
      )
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: '25%',
      render: (category) => {
        const cat = Object.entries(permissionCategories).find(
          ([_, v]) => v.permissions.some(p => p === category)
        );
        if (cat) {
          return <Tag color={cat[1].color}>{cat[0]}</Tag>;
        }
        return <Tag>OTHER</Tag>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'permission',
      key: 'status',
      width: '20%',
      render: (perm) => {
        const hasPermission = permissions.includes(perm);
        return hasPermission ? (
          <Badge
            status="success"
            text={<span style={{ color: '#52c41a', fontWeight: 'bold' }}>Có</span>}
          />
        ) : (
          <Badge
            status="error"
            text={<span style={{ color: '#ff4d4f' }}>Không có</span>}
          />
        );
      }
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: '15%',
      render: (_, record) => {
        const hasPermission = permissions.includes(record.permission);
        return (
          <Tooltip title={hasPermission ? 'Có quyền' : 'Không có quyền'}>
            {hasPermission ? (
              <CheckCircleOutlined style={{ color: '#52c41a', fontSize: '16px' }} />
            ) : (
              <CloseCircleOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
            )}
          </Tooltip>
        );
      }
    }
  ];

  const permissionData = allPermissions.map(perm => ({
    key: perm,
    permission: perm
  }));

  const grantedCount = permissions.length;
  const totalCount = allPermissions.length;
  const percentGranted = totalCount > 0 ? Math.round((grantedCount / totalCount) * 100) : 0;

  return (
    <Drawer
      title={
        <Space>
          <SafetyOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
          <span>Quản lý quyền hạn</span>
        </Space>
      }
      onClose={onClose}
      open={visible}
      width={900}
      styles={{ body: { padding: '24px' } }}
    >
      <Spin spinning={loading}>
        {/* User Info Header */}
        <Card
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            marginBottom: '24px',
            border: 'none'
          }}
          styles={{ body: { padding: '16px' } }}
        >
          <Space direction="vertical" size={12}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Người dùng</div>
              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>{user?.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>Vai trò</div>
              <Tag color="gold">{user?.role}</Tag>
            </div>
          </Space>
        </Card>

        {/* Statistics */}
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              style={{ textAlign: 'center', borderRadius: '8px' }}
            >
              <Statistic
                title="Quyền được cấp"
                value={grantedCount}
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card
              hoverable
              style={{ textAlign: 'center', borderRadius: '8px' }}
            >
              <Statistic
                title="Tổng số quyền"
                value={totalCount}
                suffix={`(${percentGranted}%)`}
                prefix={<FileDoneOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Permissions Table */}
        <Card
          title={
            <Space>
              <LockOutlined />
              <span>Danh sách quyền chi tiết</span>
            </Space>
          }
          extra={
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchPermissions}
              loading={loading}
            >
              Làm mới
            </Button>
          }
          styles={{ body: { padding: '16px' } }}
        >
          {permissionData.length > 0 ? (
            <Table
              columns={permissionColumns}
              dataSource={permissionData}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} quyền`
              }}
              size="small"
              bordered
            />
          ) : (
            <Empty
              description="Không có quyền nào"
              style={{ marginTop: '40px' }}
            />
          )}
        </Card>

        {/* Permission Categories */}
        <Card
          title="📑 Danh mục quyền"
          style={{ marginTop: '24px' }}
          styles={{ body: { padding: '16px' } }}
        >
          <Row gutter={[16, 16]}>
            {Object.entries(permissionCategories).map(([category, data]) => {
              const categoryPermissions = data.permissions.filter(p => 
                allPermissions.includes(p)
              );
              const grantedInCategory = categoryPermissions.filter(p =>
                permissions.includes(p)
              ).length;

              return (
                <Col xs={24} sm={12} md={8} key={category}>
                  <Card
                    hoverable
                    size="small"
                    style={{
                      borderLeft: `4px solid #${Math.floor(Math.random()*16777215).toString(16)}`
                    }}
                  >
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <div style={{ fontSize: '16px' }}>
                        {data.icon} <span style={{ fontWeight: 'bold' }}>{category}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {grantedInCategory}/{categoryPermissions.length} quyền
                      </div>
                      <div style={{
                        background: '#f0f0f0',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        height: '6px'
                      }}>
                        <div
                          style={{
                            height: '100%',
                            background: '#1890ff',
                            width: `${categoryPermissions.length > 0 ? (grantedInCategory / categoryPermissions.length) * 100 : 0}%`,
                            transition: 'width 0.3s'
                          }}
                        />
                      </div>
                    </Space>
                  </Card>
                </Col>
              );
            })}
          </Row>
        </Card>
      </Spin>
    </Drawer>
  );
};

export default PermissionsViewer;
