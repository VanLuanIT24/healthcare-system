import {
    ArrowLeftOutlined,
    CalendarOutlined,
    DollarOutlined,
    EditOutlined,
    MedicineBoxOutlined,
    PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    message,
    Row,
    Space,
    Spin,
    Statistic,
    Table,
    Tabs,
    Tag,
    Timeline,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { patientApi } from '../../../services/adminApi';
import EditPatientModal from './EditPatientModal';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [noteModal, setNoteModal] = useState(false);
  const [noteForm] = Form.useForm();

  useEffect(() => {
    fetchPatientDetail();
  }, [id]);

  useEffect(() => {
    if (activeTab === 'medical-records') fetchMedicalRecords();
    if (activeTab === 'appointments') fetchAppointments();
    if (activeTab === 'prescriptions') fetchPrescriptions();
    if (activeTab === 'lab-results') fetchLabResults();
    if (activeTab === 'billing') fetchBills();
  }, [activeTab]);

  const fetchPatientDetail = async () => {
    try {
      setLoading(true);
      const response = await patientApi.getDemographics(id);
      
      if (response.success && response.data) {
        setPatient(response.data.patient || response.data);
      }
    } catch (error) {
      console.error('❌ [PATIENT DETAIL] Fetch error:', error);
      message.error('Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditModalVisible(true);
  };

  const fetchMedicalRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/medical-records?patientId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMedicalRecords(response.data.records || []);
    } catch (error) {
      console.error('Fetch medical records error:', error);
    }
  };

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/appointments?patientId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments(response.data.appointments || []);
    } catch (error) {
      console.error('Fetch appointments error:', error);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/prescriptions?patientId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrescriptions(response.data.prescriptions || []);
    } catch (error) {
      console.error('Fetch prescriptions error:', error);
    }
  };

  const fetchLabResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/laboratory/orders?patientId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLabResults(response.data.orders || []);
    } catch (error) {
      console.error('Fetch lab results error:', error);
    }
  };

  const fetchBills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/billing?patientId=${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBills(response.data.bills || []);
    } catch (error) {
      console.error('Fetch bills error:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tab 1: Overview
  const OverviewTab = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={8}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <Avatar size={100} icon={<UserOutlined />} />
            <Title level={4} style={{ marginTop: 16, marginBottom: 0 }}>
              {patient?.userId?.personalInfo?.firstName} {patient?.userId?.personalInfo?.lastName}
            </Title>
            <Text type="secondary">Mã BN: {patient?._id?.slice(-8).toUpperCase()}</Text>
          </div>
          
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="Ngày sinh">
              {moment(patient?.userId?.personalInfo?.dateOfBirth).format('DD/MM/YYYY')}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {patient?.userId?.personalInfo?.gender === 'MALE' ? 'Nam' : 'Nữ'}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {patient?.userId?.phone}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {patient?.userId?.email}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {patient?.userId?.address?.street}, {patient?.userId?.address?.city}
            </Descriptions.Item>
          </Descriptions>

          <Button 
            type="primary" 
            icon={<EditOutlined />}
            block
            style={{ marginTop: 16 }}
            onClick={() => navigate(`/admin/patients/edit/${id}`)}
          >
            Chỉnh sửa thông tin
          </Button>
        </Card>
      </Col>

      <Col xs={24} lg={16}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Lượt khám"
                value={appointments.length}
                prefix={<CalendarOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đơn thuốc"
                value={prescriptions.length}
                prefix={<MedicineBoxOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Tổng chi phí"
                value={bills.reduce((sum, b) => sum + b.finalAmount, 0)}
                prefix={<DollarOutlined />}
                valueStyle={{ color: '#fa8c16' }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>

          <Col xs={24}>
            <Card title="Thông tin y tế">
              <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Nhóm máu">
                  <Tag color="red">{patient?.medicalInfo?.bloodType || 'Chưa xác định'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Chiều cao">
                  {patient?.medicalInfo?.height} cm
                </Descriptions.Item>
                <Descriptions.Item label="Cân nặng">
                  {patient?.medicalInfo?.weight} kg
                </Descriptions.Item>
                <Descriptions.Item label="BMI">
                  {patient?.medicalInfo?.height && patient?.medicalInfo?.weight
                    ? (patient.medicalInfo.weight / Math.pow(patient.medicalInfo.height / 100, 2)).toFixed(1)
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Dị ứng" span={2}>
                  {patient?.medicalInfo?.allergies?.length > 0 
                    ? patient.medicalInfo.allergies.map(a => (
                        <Tag key={a} color="orange">{a}</Tag>
                      ))
                    : <Text type="secondary">Không có</Text>
                  }
                </Descriptions.Item>
                <Descriptions.Item label="Bệnh mãn tính" span={2}>
                  {patient?.medicalInfo?.chronicConditions?.length > 0
                    ? patient.medicalInfo.chronicConditions.map(c => (
                        <Tag key={c} color="purple">{c}</Tag>
                      ))
                    : <Text type="secondary">Không có</Text>
                  }
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24}>
            <Card title="Thông tin bảo hiểm">
              <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Nhà cung cấp">
                  {patient?.insuranceInfo?.provider || 'Không có'}
                </Descriptions.Item>
                <Descriptions.Item label="Số thẻ">
                  {patient?.insuranceInfo?.policyNumber || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Hiệu lực từ">
                  {patient?.insuranceInfo?.effectiveDate 
                    ? moment(patient.insuranceInfo.effectiveDate).format('DD/MM/YYYY')
                    : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Hết hạn">
                  {patient?.insuranceInfo?.expirationDate
                    ? moment(patient.insuranceInfo.expirationDate).format('DD/MM/YYYY')
                    : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          <Col xs={24}>
            <Card 
              title="Lịch hẹn sắp tới"
              extra={
                <Button 
                  type="link" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate(`/admin/appointments/create?patientId=${id}`)}
                >
                  Đặt lịch
                </Button>
              }
            >
              <Timeline>
                {appointments
                  .filter(apt => moment(apt.appointmentDate).isAfter(moment()))
                  .slice(0, 5)
                  .map(apt => (
                    <Timeline.Item key={apt._id} color="blue">
                      <p style={{ margin: 0, fontWeight: 'bold' }}>
                        {moment(apt.appointmentDate).format('DD/MM/YYYY HH:mm')}
                      </p>
                      <p style={{ margin: 0 }}>
                        Bác sĩ: {apt.doctorId?.personalInfo?.firstName} {apt.doctorId?.personalInfo?.lastName}
                      </p>
                      <p style={{ margin: 0 }}>
                        <Tag color="blue">{apt.type}</Tag>
                      </p>
                    </Timeline.Item>
                  ))}
              </Timeline>
            </Card>
          </Col>
        </Row>
      </Col>
    </Row>
  );

  // Tab 2: Medical Records
  const medicalRecordColumns = [
    {
      title: 'Ngày khám',
      dataIndex: 'visitDate',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctorId', 'personalInfo'],
      render: (info) => `${info?.firstName} ${info?.lastName}`
    },
    {
      title: 'Chẩn đoán',
      dataIndex: 'diagnosis',
      render: (diagnosis) => diagnosis?.description || 'N/A'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/admin/medical-records/${record._id}`)}>
          Xem chi tiết
        </Button>
      )
    }
  ];

  // Tab 3: Appointments
  const appointmentColumns = [
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.appointmentDate).unix() - moment(b.appointmentDate).unix()
    },
    {
      title: 'Bác sĩ',
      render: (record) => 
        `${record.doctorId?.personalInfo?.firstName} ${record.doctorId?.personalInfo?.lastName}`
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      render: (type) => <Tag>{type}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === 'COMPLETED' ? 'success' :
          status === 'CONFIRMED' ? 'processing' :
          status === 'CANCELLED' ? 'error' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/admin/appointments/${record._id}`)}>
          Chi tiết
        </Button>
      )
    }
  ];

  // Tab 4: Prescriptions
  const prescriptionColumns = [
    {
      title: 'Ngày kê đơn',
      dataIndex: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Bác sĩ',
      render: (record) =>
        `${record.doctorId?.personalInfo?.firstName} ${record.doctorId?.personalInfo?.lastName}`
    },
    {
      title: 'Số thuốc',
      dataIndex: 'medications',
      render: (meds) => meds?.length || 0
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'DISPENSED' ? 'success' : 'processing'}>
          {status === 'DISPENSED' ? 'Đã cấp' : 'Chờ cấp'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/admin/prescriptions/${record._id}`)}>
          Xem
        </Button>
      )
    }
  ];

  // Tab 5: Lab Results
  const labColumns = [
    {
      title: 'Ngày xét nghiệm',
      dataIndex: 'orderDate',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Loại xét nghiệm',
      dataIndex: ['testId', 'name']
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={
          status === 'COMPLETED' ? 'success' :
          status === 'IN_PROGRESS' ? 'processing' : 'default'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/admin/laboratory/${record._id}`)}>
          Kết quả
        </Button>
      )
    }
  ];

  // Tab 6: Billing
  const billingColumns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'billNumber'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      render: (amount) => formatCurrency(amount)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      render: (status) => (
        <Tag color={status === 'PAID' ? 'success' : 'warning'}>
          {status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      render: (_, record) => (
        <Button size="small" onClick={() => navigate(`/admin/billing/${record._id}`)}>
          Chi tiết
        </Button>
      )
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Tổng quan',
      children: <OverviewTab />
    },
    {
      key: 'medical-records',
      label: 'Hồ sơ bệnh án',
      children: (
        <Card>
          <Table
            columns={medicalRecordColumns}
            dataSource={medicalRecords}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'appointments',
      label: 'Lịch hẹn',
      children: (
        <Card>
          <Table
            columns={appointmentColumns}
            dataSource={appointments}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'prescriptions',
      label: 'Đơn thuốc',
      children: (
        <Card>
          <Table
            columns={prescriptionColumns}
            dataSource={prescriptions}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'lab-results',
      label: 'Kết quả XN',
      children: (
        <Card>
          <Table
            columns={labColumns}
            dataSource={labResults}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    },
    {
      key: 'billing',
      label: 'Thanh toán',
      children: (
        <Card>
          <Table
            columns={billingColumns}
            dataSource={bills}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )
    }
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="Đang tải thông tin bệnh nhân..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="secondary">Không tìm thấy thông tin bệnh nhân</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header với các nút hành động */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/admin/patients')}
            >
              Quay lại
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              Chi tiết bệnh nhân
            </Title>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button 
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Chỉnh sửa
            </Button>
            <Button 
              icon={<PlusOutlined />}
              onClick={() => navigate(`/admin/appointments/create?patientId=${id}`)}
            >
              Đặt lịch khám
            </Button>
          </Space>
        </Col>
      </Row>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Modal chỉnh sửa */}
      <EditPatientModal
        visible={editModalVisible}
        patient={patient}
        onClose={() => setEditModalVisible(false)}
        onSuccess={() => {
          fetchPatientDetail();
          setEditModalVisible(false);
        }}
      />
    </div>
  );
};

export default PatientDetail;
