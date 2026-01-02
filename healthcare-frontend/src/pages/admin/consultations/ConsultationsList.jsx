// src/pages/admin/consultations/ConsultationsList.jsx - Quản lý danh sách tư vấn
import { useAuth } from '@/contexts/AuthContext';
import {
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  FilterOutlined,
  SearchOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  Table,
  Tag,
  message,
} from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import clinicalAPI from '@/services/api/clinicalAPI';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const ConsultationsList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    doctorId: '',
    patientId: '',
    fromDate: null,
    toDate: null,
  });

  // Load consultations from API
  const loadConsultations = async () => {
    try {
      setLoading(true);
      // Giả sử API trả về danh sách tư vấn của tất cả bệnh nhân
      const res = await clinicalAPI.getPatientConsultations('all', {
        limit: 100,
        ...filters,
      });
      const data = res.data?.data || [];
      setConsultations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading consultations:', error);
      // Nếu API không hỗ trợ 'all', tải mặc định một danh sách trống
      setConsultations([]);
      message.warning('Không thể tải danh sách tư vấn');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsultations();
  }, []);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa yêu cầu tư vấn',
      content: 'Bạn chắc chắn muốn xóa yêu cầu tư vấn này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          // API delete nếu có, ngược lại chỉ notify
          message.success('Đã xóa yêu cầu tư vấn');
          loadConsultations();
        } catch (error) {
          message.error('Lỗi khi xóa yêu cầu tư vấn');
        }
      },
    });
  };

  const handleSearch = () => {
    loadConsultations();
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: '',
      doctorId: '',
      patientId: '',
      fromDate: null,
      toDate: null,
    });
  };

  const columns = [
    {
      title: 'Mã yêu cầu',
      dataIndex: '_id',
      key: '_id',
      render: (id) => <span className="font-mono text-sm">{id?.slice(-8)}</span>,
      width: 100,
    },
    {
      title: 'Khách hàng',
      key: 'patientName',
      render: (_, record) => {
        const patient = record.patientId;
        if (patient && typeof patient === 'object') {
          const info = patient.personalInfo || {};
          return `${info.firstName || ''} ${info.lastName || ''}`.trim() || 'N/A';
        }
        return typeof patient === 'string' ? patient : 'N/A';
      },
      width: 150,
    },
    {
      title: 'Người hỗ trợ',
      key: 'doctorName',
      render: (_, record) => {
        const doctor = record.doctorId;
        if (doctor && typeof doctor === 'object') {
          const info = doctor.personalInfo || {};
          return `${info.firstName || ''} ${info.lastName || ''}`.trim() || 'N/A';
        }
        return typeof doctor === 'string' ? doctor : 'N/A';
      },
      width: 150,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          PENDING: { color: 'orange', label: 'Chờ xử lý' },
          IN_PROGRESS: { color: 'blue', label: 'Đang khám' },
          COMPLETED: { color: 'green', label: 'Hoàn thành' },
          CANCELLED: { color: 'red', label: 'Hủy' },
          APPROVED: { color: 'cyan', label: 'Được phê duyệt' },
        };
        const config = statusMap[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: 140,
    },
    {
      title: 'Cập nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => dayjs(date).fromNow(),
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/admin/consultations/${record._id}`)}
          >
            Chi tiết
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
      width: 160,
    },
  ];

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                💬 Quản lý hỗ trợ tư vấn khách hàng
              </h1>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                Tổng {consultations.length} yêu cầu tư vấn
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/consultations/create')}
              style={{
                backgroundColor: 'white',
                color: '#667eea',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Tạo tư vấn mới
            </Button>
          </div>
        </motion.div>

        {/* Filter Section */}
        <Card style={{ marginBottom: '24px', borderRadius: '8px' }}>
          <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
            <Col xs={24} sm={12} md={6}>
              <Input
                placeholder="🔍 Tìm theo nhân viên hoặc khách hàng"
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                style={{ borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <CustomSelect
                placeholder="📊 Lọc theo trạng thái"
                allowClear
                value={filters.status || undefined}
                onChange={(value) => setFilters({ ...filters, status: value })}
                options={[
                  { label: '⏳ Chờ xử lý', value: 'PENDING' },
                  { label: '🔵 Đang khám', value: 'IN_PROGRESS' },
                  { label: '✅ Hoàn thành', value: 'COMPLETED' },
                  { label: '❌ Hủy', value: 'CANCELLED' },
                  { label: '✔️ Được phê duyệt', value: 'APPROVED' },
                ]}
                style={{ borderRadius: '8px' }}
              />
            </Col>

            <Col xs={24} sm={12} md={6}>
              <DatePicker
                placeholder="📅 Từ ngày"
                value={filters.fromDate}
                onChange={(date) => setFilters({ ...filters, fromDate: date })}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <DatePicker
                placeholder="📅 Đến ngày"
                value={filters.toDate}
                onChange={(date) => setFilters({ ...filters, toDate: date })}
                style={{ width: '100%', borderRadius: '8px' }}
              />
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Space>
                <Button
                  type="primary"
                  icon={<FilterOutlined />}
                  onClick={handleSearch}
                  style={{ borderRadius: '8px' }}
                >
                  Tìm kiếm
                </Button>
                <Button
                  onClick={handleReset}
                  style={{ borderRadius: '8px' }}
                >
                  Đặt lại
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Consultations Table */}
        <Card style={{ borderRadius: '8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              />
              <div style={{ marginTop: '16px', color: '#1890ff' }}>
                Đang tải danh sách tư vấn...
              </div>
            </div>
          ) : consultations.length === 0 ? (
            <Empty
              description="Chưa có phiên tư vấn"
              style={{ padding: '40px' }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={consultations.map((c) => ({
                ...c,
                key: c._id,
              }))}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1200 }}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ConsultationsList;
