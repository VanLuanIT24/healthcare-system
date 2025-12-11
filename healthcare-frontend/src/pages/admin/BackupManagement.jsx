// 💾 Backup Management
import {
    CloudDownloadOutlined,
    CloudUploadOutlined,
    DeleteOutlined,
    DownloadOutlined,
    ExclamationCircleOutlined,
    ReloadOutlined,
    SafeOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    Empty,
    message,
    Modal,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Timeline
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import adminExtendedAPI from '../../services/api/adminExtendedAPI';
import './Admin.css';

const BackupManagement = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    loadBackups();
  }, [pagination.current, pagination.pageSize]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await adminExtendedAPI.getBackupHistory();
      // Assuming response has pagination
      const allBackups = response.data.backups || response.data || [];
      setBackups(allBackups);
      setPagination({
        ...pagination,
        total: allBackups.length,
      });

      // Calculate stats
      const totalSize = allBackups.reduce((sum, b) => sum + (b.size || 0), 0);
      setStats({
        totalBackups: allBackups.length,
        totalSize: totalSize,
        lastBackup: allBackups[0]?.createdAt,
        autoBackupEnabled: true,
      });
    } catch (error) {
      message.error('Không thể tải danh sách sao lưu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = () => {
    Modal.confirm({
      title: 'Tạo sao lưu mới',
      content: 'Tạo bản sao lưu toàn bộ hệ thống ngay bây giờ?',
      okText: 'Tạo',
      cancelText: 'Hủy',
      icon: <SafeOutlined />,
      onOk: async () => {
        try {
          setCreating(true);
          await adminExtendedAPI.createBackup();
          message.success('Bản sao lưu đã được tạo thành công');
          loadBackups();
        } catch (error) {
          message.error('Tạo sao lưu thất bại: ' + error.message);
        } finally {
          setCreating(false);
        }
      },
    });
  };

  const handleRestore = (backup) => {
    Modal.confirm({
      title: 'Khôi phục sao lưu',
      content: (
        <div>
          <p>
            <ExclamationCircleOutlined style={{ color: '#faad14', marginRight: 8 }} />
            <strong>Cảnh báo:</strong> Khôi phục sao lưu sẽ ghi đè tất cả dữ liệu hiện tại!
          </p>
          <p>Bạn có chắc chắn muốn khôi phục từ sao lưu này?</p>
          <p style={{ color: '#595959', fontSize: 12 }}>
            Ngày: {moment(backup.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </p>
        </div>
      ),
      okText: 'Khôi phục',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setRestoring(true);
          await adminExtendedAPI.restoreBackup(backup._id);
          message.success('Đã khôi phục sao lưu thành công');
          loadBackups();
        } catch (error) {
          message.error('Khôi phục thất bại: ' + error.message);
        } finally {
          setRestoring(false);
        }
      },
    });
  };

  const handleDeleteBackup = (backupId) => {
    Modal.confirm({
      title: 'Xóa sao lưu',
      content: 'Bạn có chắc chắn muốn xóa sao lưu này?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await adminExtendedAPI.deleteBackup(backupId);
          message.success('Đã xóa sao lưu');
          loadBackups();
        } catch (error) {
          message.error('Xóa sao lưu thất bại');
        }
      },
    });
  };

  const handleDownloadBackup = (backup) => {
    // In a real scenario, this would download the backup file
    message.info('Chức năng tải xuống sẽ được triển khai');
  };

  const columns = [
    {
      title: 'Tên sao lưu',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{name || `Backup-${record._id.slice(-8)}`}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>ID: {record._id.slice(-12)}</div>
        </div>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div>
          <div>{moment(date).format('DD/MM/YYYY')}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {moment(date).format('HH:mm:ss')}
          </div>
        </div>
      ),
      sorter: (a, b) => moment(b.createdAt) - moment(a.createdAt),
    },
    {
      title: 'Dung lượng',
      dataIndex: 'size',
      key: 'size',
      render: (size) => {
        const mb = (size / 1024 / 1024).toFixed(2);
        return <strong>{mb} MB</strong>;
      },
      sorter: (a, b) => a.size - b.size,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const types = {
          manual: <Tag color="blue">Thủ công</Tag>,
          automatic: <Tag color="green">Tự động</Tag>,
          scheduled: <Tag color="orange">Theo lịch</Tag>,
        };
        return types[type] || type;
      },
    },
    {
      title: 'Trạng thái',
      key: 'status',
      render: (_, record) => {
        const statuses = {
          completed: { color: 'green', text: 'Hoàn thành' },
          in_progress: { color: 'blue', text: 'Đang tiến hành' },
          failed: { color: 'red', text: 'Thất bại' },
        };
        const status = statuses[record.status] || statuses.completed;
        return <Tag color={status.color}>{status.text}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<CloudUploadOutlined />}
            onClick={() => handleRestore(record)}
            loading={restoring}
          >
            Khôi phục
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadBackup(record)}
          >
            Tải
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteBackup(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const paginatedBackups = backups.slice(
    (pagination.current - 1) * pagination.pageSize,
    pagination.current * pagination.pageSize
  );

  return (
    <div className="page-container backup-management-container">
      <PageHeader
        title="Quản lý sao lưu"
        subtitle="Tạo và khôi phục sao lưu hệ thống"
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={loadBackups}
              loading={loading}
            >
              Làm mới
            </Button>
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={handleCreateBackup}
              loading={creating}
            >
              Tạo sao lưu
            </Button>
          </Space>
        }
      />

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng sao lưu"
              value={stats.totalBackups || 0}
              prefix={<SafeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Dung lượng"
              value={(stats.totalSize / 1024 / 1024).toFixed(2) || 0}
              suffix="MB"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Sao lưu cuối"
              value={
                stats.lastBackup
                  ? moment(stats.lastBackup).fromNow()
                  : 'Chưa có'
              }
              valueStyle={{ color: '#52c41a', fontSize: 14 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Sao lưu tự động"
              value={stats.autoBackupEnabled ? 'Bật' : 'Tắt'}
              valueStyle={{
                color: stats.autoBackupEnabled ? '#52c41a' : '#ff4d4f',
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Backup List */}
      <Card
        title="📋 Danh sách sao lưu"
        loading={loading}
      >
        {backups.length > 0 ? (
          <Table
            columns={columns}
            dataSource={paginatedBackups}
            rowKey="_id"
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} sao lưu`,
            }}
            onChange={(newPagination) => setPagination(newPagination)}
            size="small"
          />
        ) : (
          <Empty
            description="Chưa có sao lưu"
            style={{ margin: '40px 0' }}
          >
            <Button
              type="primary"
              icon={<CloudDownloadOutlined />}
              onClick={handleCreateBackup}
              loading={creating}
            >
              Tạo sao lưu đầu tiên
            </Button>
          </Empty>
        )}
      </Card>

      {/* Backup Schedule Info */}
      <Card
        title="⏰ Lịch sao lưu tự động"
        style={{ marginTop: 16 }}
      >
        <Timeline
          items={[
            {
              children: 'Hàng ngày lúc 02:00 AM',
              dot: <Badge status="success" />,
            },
            {
              children: 'Hàng tuần vào Chủ nhật',
              dot: <Badge status="success" />,
            },
            {
              children: 'Hàng tháng vào ngày 1',
              dot: <Badge status="success" />,
            },
          ]}
        />
      </Card>

      {/* Best Practices */}
      <Card
        title="💡 Các thực hành tốt nhất"
        style={{ marginTop: 16 }}
      >
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          <li>Tạo sao lưu thủ công trước khi thực hiện cập nhật quan trọng</li>
          <li>Kiểm tra sao lưu định kỳ để đảm bảo tính toàn vẹn dữ liệu</li>
          <li>Lưu giữ ít nhất 3 bản sao lưu gần đây</li>
          <li>Lưu trữ sao lưu ở vị trí an toàn, tách biệt</li>
          <li>Kiểm tra dung lượng lưu trữ và xóa sao lưu cũ khi cần thiết</li>
        </ul>
      </Card>
    </div>
  );
};

export default BackupManagement;
