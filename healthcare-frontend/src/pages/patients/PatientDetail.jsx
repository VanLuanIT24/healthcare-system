// 👤 Patient Detail Page - Complete Profile
import {
    CalendarOutlined,
    DollarOutlined,
    EditOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    HeartOutlined,
    HomeOutlined,
    IdcardOutlined,
    MailOutlined,
    MedicineBoxOutlined,
    PhoneOutlined,
    UserOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    List,
    Modal,
    Row,
    Space,
    Table,
    Tabs,
    Tag,
    message
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import patientAPI from '../../services/api/patientAPI';
import './PatientManagement.css';

const { TabPane } = Tabs;

const PatientDetail = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [bills, setBills] = useState([]);
  const [labResults, setLabResults] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [patientRes, recordsRes, appointmentsRes, prescriptionsRes, billsRes, labRes] = 
        await Promise.all([
          patientAPI.getPatientById(id),
          patientAPI.getPatientMedicalRecords(id),
          patientAPI.getPatientAppointments(id),
          patientAPI.getPatientPrescriptions(id),
          patientAPI.getPatientBills(id),
          patientAPI.getPatientLabResults(id),
        ]);

      setPatient(patientRes.data);
      setMedicalRecords(recordsRes.data?.records || []);
      setAppointments(appointmentsRes.data?.appointments || []);
      setPrescriptions(prescriptionsRes.data?.prescriptions || []);
      setBills(billsRes.data?.bills || []);
      setLabResults(labRes.data?.results || []);
    } catch (error) {
      message.error('Không thể tải thông tin bệnh nhân');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleAdmit = async () => {
    Modal.confirm({
      title: 'Nhập viện',
      content: 'Xác nhận nhập viện cho bệnh nhân này?',
      onOk: async () => {
        try {
          await patientAPI.admitPatient(id);
          message.success('Đã nhập viện thành công');
          loadPatientData();
        } catch (error) {
          message.error('Nhập viện thất bại');
        }
      },
    });
  };

  const handleDischarge = async () => {
    Modal.confirm({
      title: 'Xuất viện',
      content: 'Xác nhận xuất viện cho bệnh nhân này?',
      onOk: async () => {
        try {
          await patientAPI.dischargePatient(id);
          message.success('Đã xuất viện thành công');
          loadPatientData();
        } catch (error) {
          message.error('Xuất viện thất bại');
        }
      },
    });
  };

  const appointmentColumns = [
    {
      title: 'Ngày hẹn',
      dataIndex: 'appointmentDate',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Bác sĩ',
      dataIndex: ['doctor', 'fullName'],
      key: 'doctor',
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const colors = {
          scheduled: 'blue',
          'checked-in': 'orange',
          'in-progress': 'purple',
          completed: 'green',
          cancelled: 'red',
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/appointments/${record._id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  const billColumns = [
    {
      title: 'Mã HĐ',
      dataIndex: 'billNumber',
      key: 'billNumber',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => `${amount?.toLocaleString('vi-VN')} VND`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'paid' ? 'green' : 'orange'}>
          {status === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => navigate(`/billing/${record._id}`)}>
          Chi tiết
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Card loading />;
  }

  return (
    <div className="page-container patient-detail-container">
      <PageHeader
        title="Hồ sơ bệnh nhân"
        showBack
        backPath="/patients"
        extra={
          <Space>
            <Button icon={<EditOutlined />} onClick={() => navigate(`/patients/${id}/edit`)}>
              Chỉnh sửa
            </Button>
            {patient?.status === 'active' ? (
              <Button onClick={handleDischarge}>Xuất viện</Button>
            ) : (
              <Button type="primary" onClick={handleAdmit}>
                Nhập viện
              </Button>
            )}
          </Space>
        }
      />

      <div className="patient-profile-header">
        <Avatar size={120} src={patient?.profilePicture} icon={<UserOutlined />} />
        <div className="patient-profile-info">
          <h1>{patient?.fullName}</h1>
          <div className="patient-id">ID: {patient?.patientId}</div>
          <Space>
            <Tag color="blue" icon={<IdcardOutlined />}>
              {patient?.patientId}
            </Tag>
            {patient?.bloodType && <Tag color="red">{patient.bloodType}</Tag>}
            <Tag color={patient?.status === 'active' ? 'green' : 'default'}>
              {patient?.status === 'active' ? 'Đang điều trị' : 'Đã xuất viện'}
            </Tag>
          </Space>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card className="patient-stats-card">
            <div className="patient-stats-value">{medicalRecords.length}</div>
            <div className="patient-stats-label">Lần khám</div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="patient-stats-card">
            <div className="patient-stats-value">{prescriptions.length}</div>
            <div className="patient-stats-label">Đơn thuốc</div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="patient-stats-card">
            <div className="patient-stats-value">{labResults.length}</div>
            <div className="patient-stats-label">Xét nghiệm</div>
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card className="patient-stats-card">
            <div className="patient-stats-value">{bills.length}</div>
            <div className="patient-stats-label">Hóa đơn</div>
          </Card>
        </Col>
      </Row>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab={<span><UserOutlined /> Thông tin cơ bản</span>} key="1">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Họ và tên" span={2}>
                {patient?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày sinh">
                {patient?.dateOfBirth ? moment(patient.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Tuổi">
                {patient?.dateOfBirth ? moment().diff(patient.dateOfBirth, 'years') : 'N/A'} tuổi
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {patient?.gender === 'male' ? 'Nam' : 'Nữ'}
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">
                {patient?.bloodType || 'Chưa xác định'}
              </Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>
                {patient?.phone}
              </Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>
                {patient?.email || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label={<><HomeOutlined /> Địa chỉ</>} span={2}>
                {patient?.address}
              </Descriptions.Item>
              <Descriptions.Item label="Số CCCD/CMND">
                {patient?.idNumber || 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Số hộ chiếu">
                {patient?.nationalId || 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>

            {patient?.emergencyContact && (
              <>
                <h3 style={{ marginTop: 24, marginBottom: 16 }}>Người liên hệ khẩn cấp</h3>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Họ và tên">
                    {patient.emergencyContact.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="Quan hệ">
                    {patient.emergencyContact.relationship}
                  </Descriptions.Item>
                  <Descriptions.Item label="Điện thoại">
                    {patient.emergencyContact.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">
                    {patient.emergencyContact.address}
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </TabPane>

          <TabPane tab={<span><HeartOutlined /> Thông tin y tế</span>} key="2">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Chiều cao">
                {patient?.height ? `${patient.height} cm` : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="Cân nặng">
                {patient?.weight ? `${patient.weight} kg` : 'Chưa cập nhật'}
              </Descriptions.Item>
              <Descriptions.Item label="BMI">
                {patient?.height && patient?.weight
                  ? (patient.weight / Math.pow(patient.height / 100, 2)).toFixed(1)
                  : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">
                <Tag color="red">{patient?.bloodType || 'Chưa xác định'}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={<><WarningOutlined /> Dị ứng</>} span={2}>
                {patient?.allergies || 'Không có'}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền sử bệnh" span={2}>
                {patient?.medicalHistory || 'Không có'}
              </Descriptions.Item>
            </Descriptions>

            {patient?.insurance && (
              <>
                <h3 style={{ marginTop: 24, marginBottom: 16 }}>Thông tin bảo hiểm</h3>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="Nhà cung cấp">
                    {patient.insurance.provider}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số thẻ">
                    {patient.insurance.policyNumber}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày hết hạn">
                    {patient.insurance.expiryDate
                      ? moment(patient.insurance.expiryDate).format('DD/MM/YYYY')
                      : 'N/A'}
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <Tag
                      color={
                        moment(patient.insurance.expiryDate).isAfter(moment())
                          ? 'green'
                          : 'red'
                      }
                    >
                      {moment(patient.insurance.expiryDate).isAfter(moment())
                        ? 'Còn hiệu lực'
                        : 'Hết hiệu lực'}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </>
            )}
          </TabPane>

          <TabPane tab={<span><FileTextOutlined /> Hồ sơ bệnh án ({medicalRecords.length})</span>} key="3">
            <List
              dataSource={medicalRecords}
              renderItem={(record) => (
                <div className="medical-record-item">
                  <div className="medical-record-header">
                    <div className="medical-record-title">
                      {record.diagnosis || 'Khám tổng quát'}
                    </div>
                    <div className="medical-record-date">
                      {moment(record.date).format('DD/MM/YYYY')}
                    </div>
                  </div>
                  <div className="medical-record-content">
                    <div>Bác sĩ: {record.doctor?.fullName}</div>
                    <div>Triệu chứng: {record.symptoms}</div>
                    <div>Chẩn đoán: {record.diagnosis}</div>
                  </div>
                  <Button
                    type="link"
                    onClick={() => navigate(`/medical-records/${record._id}`)}
                  >
                    Xem chi tiết
                  </Button>
                </div>
              )}
            />
          </TabPane>

          <TabPane tab={<span><CalendarOutlined /> Lịch hẹn ({appointments.length})</span>} key="4">
            <Table
              columns={appointmentColumns}
              dataSource={appointments}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
            />
          </TabPane>

          <TabPane tab={<span><MedicineBoxOutlined /> Đơn thuốc ({prescriptions.length})</span>} key="5">
            <List
              dataSource={prescriptions}
              renderItem={(prescription) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                    >
                      Chi tiết
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={`Đơn thuốc - ${moment(prescription.createdAt).format('DD/MM/YYYY')}`}
                    description={
                      <div>
                        <div>Bác sĩ: {prescription.doctor?.fullName}</div>
                        <div>Số loại thuốc: {prescription.medications?.length || 0}</div>
                        <Tag color={prescription.status === 'dispensed' ? 'green' : 'orange'}>
                          {prescription.status === 'dispensed' ? 'Đã xuất thuốc' : 'Chờ xuất thuốc'}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab={<span><ExperimentOutlined /> Xét nghiệm ({labResults.length})</span>} key="6">
            <List
              dataSource={labResults}
              renderItem={(result) => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => navigate(`/lab/results/${result._id}`)}>
                      Xem kết quả
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={result.testName}
                    description={
                      <div>
                        <div>Ngày: {moment(result.date).format('DD/MM/YYYY')}</div>
                        <Tag color={result.status === 'approved' ? 'green' : 'blue'}>
                          {result.status}
                        </Tag>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </TabPane>

          <TabPane tab={<span><DollarOutlined /> Hóa đơn ({bills.length})</span>} key="7">
            <Table
              columns={billColumns}
              dataSource={bills}
              rowKey="_id"
              pagination={{ pageSize: 10 }}
              summary={(pageData) => {
                const total = pageData.reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={2}>
                      <strong>Tổng cộng</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <strong>{total.toLocaleString('vi-VN')} VND</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell colSpan={2} />
                  </Table.Summary.Row>
                );
              }}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default PatientDetail;
