// 🏥 Patient List Page
import {
    CalendarOutlined,
    IdcardOutlined,
    ManOutlined,
    PhoneOutlined,
    PlusOutlined,
    SearchOutlined,
    UserOutlined,
    WomanOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    Input,
    message,
    Pagination,
    Row,
    Select,
    Space,
    Statistic,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import patientAPI from '../../services/api/patientAPI';
import './PatientManagement.css';

const { Search } = Input;
const { Option } = Select;

const PatientList = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [pagination, setPagination] = useState({ current: 1, pageSize: 12, total: 0 });
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', gender: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadPatients();
    loadStats();
  }, [pagination.current, search, filters]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getPatients({
        page: pagination.current,
        limit: pagination.pageSize,
        search,
        ...filters,
      });
      setPatients(response.data.patients);
      setPagination({ ...pagination, total: response.data.total });
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await patientAPI.getPatientStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleSearch = (value) => {
    setSearch(value);
    setPagination({ ...pagination, current: 1 });
  };

  const getBloodTypeColor = (bloodType) => {
    const colors = {
      'A': 'red',
      'B': 'blue',
      'AB': 'purple',
      'O': 'green',
    };
    return colors[bloodType?.replace('+', '').replace('-', '')] || 'default';
  };

  return (
    <div className="page-container patient-list-container">
      <div className="search-section">
        <h2>Tìm kiếm bệnh nhân</h2>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Search
              placeholder="Tìm theo tên, ID, số điện thoại..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              onSearch={handleSearch}
            />
          </Col>
          <Col xs={24} md={6}>
            <Select
              style={{ width: '100%' }}
              size="large"
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="active">Đang điều trị</Option>
              <Option value="discharged">Đã xuất viện</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Button
              type="primary"
              size="large"
              block
              icon={<PlusOutlined />}
              onClick={() => navigate('/patients/register')}
            >
              Đăng ký bệnh nhân mới
            </Button>
          </Col>
        </Row>
      </div>

      <Row gutter={[16, 16]} className="quick-stats">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tổng số bệnh nhân"
              value={stats.totalPatients || 2846}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đang điều trị"
              value={stats.activePatients || 156}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Nhập viện hôm nay"
              value={stats.todayAdmissions || 12}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Xuất viện hôm nay"
              value={stats.todayDischarges || 8}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {loading ? (
        <Row gutter={[16, 16]}>
          {[...Array(6)].map((_, i) => (
            <Col xs={24} sm={12} lg={8} key={i}>
              <Card loading />
            </Col>
          ))}
        </Row>
      ) : patients.length === 0 ? (
        <Card>
          <Empty description="Không tìm thấy bệnh nhân" />
        </Card>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            {patients.map((patient) => (
              <Col xs={24} sm={12} lg={8} key={patient._id}>
                <Card
                  className="patient-card"
                  onClick={() => navigate(`/patients/${patient._id}`)}
                >
                  <div className="patient-card-header">
                    <Avatar
                      size={64}
                      src={patient.profilePicture}
                      icon={patient.gender === 'male' ? <ManOutlined /> : <WomanOutlined />}
                    />
                    <div className="patient-card-info">
                      <h3>{patient.fullName}</h3>
                      <Space>
                        <Tag icon={<IdcardOutlined />} color="blue">
                          {patient.patientId}
                        </Tag>
                        {patient.bloodType && (
                          <Tag color={getBloodTypeColor(patient.bloodType)}>
                            {patient.bloodType}
                          </Tag>
                        )}
                      </Space>
                    </div>
                  </div>

                  <div className="patient-card-meta">
                    <div className="patient-card-meta-item">
                      <CalendarOutlined />
                      <span>
                        {patient.dateOfBirth
                          ? `${moment().diff(patient.dateOfBirth, 'years')} tuổi`
                          : 'N/A'}
                      </span>
                    </div>
                    <div className="patient-card-meta-item">
                      <PhoneOutlined />
                      <span>{patient.phone || 'Chưa cập nhật'}</span>
                    </div>
                    <div className="patient-card-meta-item">
                      <UserOutlined />
                      <span>{patient.gender === 'male' ? 'Nam' : 'Nữ'}</span>
                    </div>
                  </div>

                  {patient.status && (
                    <Tag
                      color={patient.status === 'active' ? 'green' : 'default'}
                      style={{ marginTop: 12 }}
                    >
                      {patient.status === 'active' ? 'Đang điều trị' : 'Đã xuất viện'}
                    </Tag>
                  )}
                </Card>
              </Col>
            ))}
          </Row>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={pagination.current}
              pageSize={pagination.pageSize}
              total={pagination.total}
              showSizeChanger
              showTotal={(total) => `Tổng số ${total} bệnh nhân`}
              onChange={(page, pageSize) =>
                setPagination({ ...pagination, current: page, pageSize })
              }
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PatientList;
