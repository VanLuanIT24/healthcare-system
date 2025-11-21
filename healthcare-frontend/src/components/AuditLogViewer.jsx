import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Space, Tag, DatePicker, Input, Select, Empty, Spin, Row, Col
} from 'antd';
import {
  DeleteOutlined, FilterOutlined, RedoOutlined, UserOutlined
} from '@ant-design/icons';
import { apiClient } from '../utils/api';
import dayjs from 'dayjs';

const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({
    userId: '',
    action: '',
    startDate: null,
    endDate: null
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [pagination.current, pagination.pageSize, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/audit-logs', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
          ...(filters.userId && { userId: filters.userId }),
          ...(filters.action && { action: filters.action }),
          ...(filters.startDate && { startDate: filters.startDate.toISOString() }),
          ...(filters.endDate && { endDate: filters.endDate.toISOString() })
        }
      });

      if (response.data.success) {
        setLogs(response.data.data.logs || response.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.data.total || 0
        });
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    const colors = {
      'USER_CREATE': 'green',
      'USER_UPDATE': 'blue',
      'USER_DELETE': 'red',
      'USER_LOGIN': 'cyan',
      'USER_LOGOUT': 'gray',
      'ROLE_ASSIGN': 'purple',
      'PATIENT_CREATE': 'green',
      'PATIENT_UPDATE': 'blue',
      'APPOINTMENT_CREATE': 'green',
      'APPOINTMENT_CANCEL': 'orange',
      'REPORT_GENERATED': 'blue',
      'SYSTEM_RESET': 'red'
    };
    return colors[action] || 'default';
  };

  const getActionLabel = (action) => {
    const labels = {
      'USER_CREATE': 'Tạo người dùng',
      'USER_UPDATE': 'Cập nhật người dùng',
      'USER_DELETE': 'Xóa người dùng',
      'USER_LOGIN': 'Đăng nhập',
      'USER_LOGOUT': 'Đăng xuất',
      'ROLE_ASSIGN': 'Gán vai trò',
      'PATIENT_CREATE': 'Tạo bệnh nhân',
      'PATIENT_UPDATE': 'Cập nhật bệnh nhân',
      'APPOINTMENT_CREATE': 'Tạo lịch hẹn',
      'APPOINTMENT_CANCEL': 'Hủy lịch hẹn',
      'REPORT_GENERATED': 'Xuất báo cáo',
      'SYSTEM_RESET': 'Reset hệ thống'
    };
    return labels[action] || action;
  };

  const columns = [
    {
      title: 'Người dùng',
      dataIndex: ['userId', 'email'],
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space>
          <UserOutlined />
          <span>{record.userId?.email || record.userId}</span>
        </Space>
      )
    },
    {
      title: 'Vai trò',
      dataIndex: ['userId', 'role'],
      key: 'role',
      render: (_, record) => {
        const roleColors = {
          'SUPER_ADMIN': 'red',
          'HOSPITAL_ADMIN': 'purple',
          'DOCTOR': 'blue',
          'NURSE': 'cyan',
          'PATIENT': 'green'
        };
        return <Tag color={roleColors[record.userId?.role] || 'default'}>{record.userId?.role}</Tag>;
      }
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 180,
      render: (action) => (
        <Tag color={getActionColor(action)}>
          {getActionLabel(action)}
        </Tag>
      )
    },
    {
      title: 'Chi tiết',
      dataIndex: 'metadata',
      key: 'metadata',
      width: 250,
      render: (metadata) => {
        if (!metadata) return '-';
        if (typeof metadata === 'object') {
          return <span>{JSON.stringify(metadata).substring(0, 50)}...</span>;
        }
        return <span>{String(metadata).substring(0, 50)}</span>;
      }
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ip',
      width: 130,
      render: (ip) => <span style={{ fontSize: '12px' }}>{ip || '-'}</span>
    },
    {
      title: 'User Agent',
      dataIndex: 'userAgent',
      key: 'userAgent',
      width: 200,
      render: (ua) => {
        if (!ua) return '-';
        if (ua.includes('Chrome')) return <Tag>Chrome</Tag>;
        if (ua.includes('Firefox')) return <Tag color="orange">Firefox</Tag>;
        if (ua.includes('Safari')) return <Tag color="blue">Safari</Tag>;
        return <Tag>{ua.substring(0, 20)}</Tag>;
      }
    },
    {
      title: 'Thời gian',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 160,
      render: (timestamp) => (
        <span title={dayjs(timestamp).format('DD/MM/YYYY HH:mm:ss')}>
          {dayjs(timestamp).fromNow()}
        </span>
      )
    }
  ];

  return (
    <div>
      <Card
        title="Nhật Ký Hoạt Động Hệ Thống"
        extra={
          <Button
            icon={<RedoUtlined />}
            onClick={() => fetchAuditLogs()}
            loading={loading}
          >
            Làm mới
          </Button>
        }
      >
        {/* Filters */}
        <Row gutter={16} style={{ marginBottom: '20px' }}>
          <Col span={6}>
            <Input.Search
              placeholder="Tìm theo email"
              value={filters.userId}
              onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
              allowClear
            />
          </Col>
          <Col span={6}>
            <Select
              placeholder="Chọn hành động"
              value={filters.action || undefined}
              onChange={(value) => setFilters({ ...filters, action: value })}
              allowClear
              style={{ width: '100%' }}
            >
              <Select.Option value="USER_CREATE">Tạo người dùng</Select.Option>
              <Select.Option value="USER_UPDATE">Cập nhật người dùng</Select.Option>
              <Select.Option value="USER_DELETE">Xóa người dùng</Select.Option>
              <Select.Option value="USER_LOGIN">Đăng nhập</Select.Option>
              <Select.Option value="ROLE_ASSIGN">Gán vai trò</Select.Option>
              <Select.Option value="PATIENT_CREATE">Tạo bệnh nhân</Select.Option>
              <Select.Option value="APPOINTMENT_CREATE">Tạo lịch hẹn</Select.Option>
            </Select>
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="Từ ngày"
              style={{ width: '100%' }}
              value={filters.startDate}
              onChange={(date) => setFilters({ ...filters, startDate: date })}
            />
          </Col>
          <Col span={6}>
            <DatePicker
              placeholder="Đến ngày"
              style={{ width: '100%' }}
              value={filters.endDate}
              onChange={(date) => setFilters({ ...filters, endDate: date })}
            />
          </Col>
        </Row>

        {/* Table */}
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={logs}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: (page, pageSize) => setPagination({ current: page, pageSize, total: pagination.total })
            }}
            rowKey="_id"
            scroll={{ x: 1200 }}
          />
        </Spin>
      </Card>
    </div>
  );
};

export default AuditLogViewer;
