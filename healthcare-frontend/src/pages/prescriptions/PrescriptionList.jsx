// 📋 Prescription List Page
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    EyeOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
    PrinterOutlined,
    SearchOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Input,
    message,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import prescriptionAPI from '../../services/api/prescriptionAPI';
import './Prescription.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: null,
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadPrescriptions();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionAPI.getPrescriptions({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        status: filters.status,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      });
      setPrescriptions(response.data.prescriptions || []);
      setPagination({ ...pagination, total: response.data.total || 0 });

      // Calculate stats
      const allPrescriptions = response.data.prescriptions || [];
      setStats({
        total: allPrescriptions.length,
        pending: allPrescriptions.filter((p) => p.status === 'pending').length,
        dispensed: allPrescriptions.filter((p) => p.status === 'dispensed').length,
        completed: allPrescriptions.filter((p) => p.status === 'completed').length,
      });
    } catch (error) {
      message.error('Không thể tải danh sách đơn thuốc');
    } finally {
      setLoading(false);
    }
  };

  const handleDispense = async (prescriptionId) => {
    try {
      await prescriptionAPI.dispenseMedication(prescriptionId);
      message.success('Đã xuất thuốc thành công');
      loadPrescriptions();
    } catch (error) {
      message.error('Xuất thuốc thất bại');
    }
  };

  const handlePrint = (prescriptionId) => {
    message.info('Chức năng in đơn thuốc đang được phát triển');
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'orange',
      dispensed: 'blue',
      completed: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      pending: 'Chờ xuất thuốc',
      dispensed: 'Đã xuất thuốc',
      completed: 'Hoàn thành',
      cancelled: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'prescriptionNumber',
      key: 'number',
      width: 120,
      render: (number) => <strong>{number}</strong>,
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <Space>
          <Avatar src={record.patient?.profilePicture} icon={<UserOutlined />} />
          <div>
            <div style={{ fontWeight: 600 }}>{record.patient?.fullName}</div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {record.patient?.patientId}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Bác sĩ kê đơn',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
    },
    {
      title: 'Ngày kê đơn',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
    },
    {
      title: 'Số loại thuốc',
      dataIndex: 'medications',
      key: 'medications',
      render: (medications) => (
        <Badge
          count={medications?.length || 0}
          style={{ backgroundColor: '#1890ff' }}
        />
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>,
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
            icon={<EyeOutlined />}
            onClick={() => navigate(`/prescriptions/${record._id}`)}
          >
            Chi tiết
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              size="small"
              onClick={() => handleDispense(record._id)}
            >
              Xuất thuốc
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(record._id)}
          >
            In
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container prescription-list-container">
      <PageHeader
        title="Quản lý đơn thuốc"
        subtitle="Danh sách đơn thuốc và kê đơn"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/prescriptions/create')}
          >
            Kê đơn thuốc mới
          </Button>
        }
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng đơn thuốc"
              value={stats.total || 0}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ xuất thuốc"
              value={stats.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã xuất thuốc"
              value={stats.dispensed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={stats.completed || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Search
              placeholder="Tìm theo bệnh nhân, mã đơn..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="pending">Chờ xuất thuốc</Option>
              <Option value="dispensed">Đã xuất thuốc</Option>
              <Option value="completed">Hoàn thành</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={prescriptions}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} đơn thuốc`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>
    </div>
  );
};

export default PrescriptionList;
