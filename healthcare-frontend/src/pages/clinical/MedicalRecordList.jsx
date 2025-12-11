// 📋 Medical Record List
import {
    EyeOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Input,
    message,
    Row,
    Select,
    Space,
    Table,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import clinicalAPI from '../../services/api/clinicalAPI';
import './Clinical.css';

const { Search } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

const MedicalRecordList = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    dateRange: null,
    department: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadRecords();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const response = await clinicalAPI.getMedicalRecords({
        page: pagination.current,
        limit: pagination.pageSize,
        search: filters.search,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
        department: filters.department,
      });
      setRecords(response.data.records || []);
      setPagination({ ...pagination, total: response.data.total || 0 });
    } catch (error) {
      message.error('Không thể tải danh sách hồ sơ bệnh án');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Mã hồ sơ',
      dataIndex: 'recordNumber',
      key: 'recordNumber',
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
      title: 'Ngày khám',
      dataIndex: 'visitDate',
      key: 'visitDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.visitDate).unix() - moment(b.visitDate).unix(),
    },
    {
      title: 'Bác sĩ điều trị',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
    },
    {
      title: 'Khoa',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => <Tag color="blue">{dept}</Tag>,
    },
    {
      title: 'Chẩn đoán chính',
      dataIndex: 'primaryDiagnosis',
      key: 'primaryDiagnosis',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          'in-treatment': 'orange',
          completed: 'green',
          'follow-up': 'blue',
          discharged: 'default',
        };
        const texts = {
          'in-treatment': 'Đang điều trị',
          completed: 'Hoàn thành',
          'follow-up': 'Tái khám',
          discharged: 'Đã xuất viện',
        };
        return <Tag color={colors[status]}>{texts[status]}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/medical-records/${record._id}`)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container medical-record-list-container">
      <PageHeader
        title="Hồ sơ bệnh án"
        subtitle="Quản lý hồ sơ bệnh án điện tử"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/medical-records/create')}
          >
            Tạo hồ sơ mới
          </Button>
        }
      />

      <Card className="filter-section">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Search
              placeholder="Tìm theo bệnh nhân, mã hồ sơ..."
              allowClear
              onSearch={(value) => setFilters({ ...filters, search: value })}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Khoa"
              allowClear
              onChange={(value) => setFilters({ ...filters, department: value || '' })}
            >
              <Option value="Nội khoa">Nội khoa</Option>
              <Option value="Ngoại khoa">Ngoại khoa</Option>
              <Option value="Sản khoa">Sản khoa</Option>
              <Option value="Nhi khoa">Nhi khoa</Option>
              <Option value="Tim mạch">Tim mạch</Option>
              <Option value="Thần kinh">Thần kinh</Option>
            </Select>
          </Col>
          <Col xs={24} md={8}>
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
          dataSource={records}
          loading={loading}
          rowKey="_id"
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} hồ sơ bệnh án`,
          }}
          onChange={(newPagination) => setPagination(newPagination)}
        />
      </Card>
    </div>
  );
};

export default MedicalRecordList;
