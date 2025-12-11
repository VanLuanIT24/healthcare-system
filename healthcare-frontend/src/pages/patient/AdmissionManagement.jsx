// 🏥 Admission Management - Quản lý nhập/xuất viện
import {
    BedOutlined,
    LogoutOutlined,
    UserAddOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tabs,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import patientAPI from '../../services/api/patientAPI';
import userAPI from '../../services/api/userAPI';
import './AdmissionManagement.css';

const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

const AdmissionManagement = () => {
  const [loading, setLoading] = useState(false);
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [allPatients, setAllPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [admitModalVisible, setAdmitModalVisible] = useState(false);
  const [dischargeModalVisible, setDischargeModalVisible] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [stats, setStats] = useState({
    totalBeds: 150,
    occupiedBeds: 0,
    availableBeds: 150,
    occupancyRate: 0,
  });

  const [admitForm] = Form.useForm();
  const [dischargeForm] = Form.useForm();

  useEffect(() => {
    fetchAdmittedPatients();
    fetchAllPatients();
    fetchDoctors();
  }, []);

  const fetchAdmittedPatients = async () => {
    try {
      setLoading(true);
      const response = await patientAPI.searchPatients({ admissionStatus: 'ADMITTED' });
      const patients = response.data.data.patients || response.data.data || [];
      setAdmittedPatients(patients);
      
      // Calculate stats
      const occupied = patients.length;
      const available = stats.totalBeds - occupied;
      const rate = ((occupied / stats.totalBeds) * 100).toFixed(1);
      
      setStats({
        ...stats,
        occupiedBeds: occupied,
        availableBeds: available,
        occupancyRate: parseFloat(rate),
      });
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân nội trú');
      console.error('Fetch admitted patients error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllPatients = async () => {
    try {
      const response = await patientAPI.searchPatients({ admissionStatus: 'NOT_ADMITTED' });
      const patients = response.data.data.patients || response.data.data || [];
      setAllPatients(patients);
    } catch (error) {
      console.error('Fetch all patients error:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await userAPI.getUsersByRole('DOCTOR');
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Fetch doctors error:', error);
    }
  };

  const handleAdmit = async (values) => {
    try {
      setLoading(true);
      await patientAPI.admitPatient(values.patientId, {
        department: values.department,
        ward: values.ward,
        bed: values.bed,
        admittingDoctorId: values.admittingDoctorId,
        diagnosis: values.diagnosis,
        plannedDischargeDate: values.plannedDischargeDate?.format('YYYY-MM-DD'),
      });
      
      message.success('Nhập viện thành công');
      setAdmitModalVisible(false);
      admitForm.resetFields();
      fetchAdmittedPatients();
      fetchAllPatients();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể nhập viện');
      console.error('Admit patient error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = async (values) => {
    try {
      setLoading(true);
      await patientAPI.dischargePatient(selectedPatient._id, {
        dischargeDate: values.dischargeDate?.format('YYYY-MM-DD'),
        dischargeDiagnosis: values.dischargeDiagnosis,
        dischargeInstructions: values.dischargeInstructions,
        followUpDate: values.followUpDate?.format('YYYY-MM-DD'),
      });
      
      message.success('Xuất viện thành công');
      setDischargeModalVisible(false);
      dischargeForm.resetFields();
      setSelectedPatient(null);
      fetchAdmittedPatients();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể xuất viện');
      console.error('Discharge patient error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDischargeModal = (patient) => {
    setSelectedPatient(patient);
    setDischargeModalVisible(true);
    dischargeForm.setFieldsValue({
      dischargeDate: moment(),
    });
  };

  const columns = [
    {
      title: 'Mã BN',
      dataIndex: 'patientId',
      key: 'patientId',
      width: 100,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text}</div>
          <div style={{ fontSize: 12, color: '#888' }}>
            {record.gender === 'MALE' ? 'Nam' : 'Nữ'}, {record.age || 'N/A'} tuổi
          </div>
        </div>
      ),
    },
    {
      title: 'Khoa',
      dataIndex: ['currentAdmission', 'department'],
      key: 'department',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Phòng/Giường',
      key: 'bedInfo',
      render: (_, record) => (
        <div>
          <BedOutlined /> {record.currentAdmission?.ward || 'N/A'} - 
          {record.currentAdmission?.bed || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Bác sĩ điều trị',
      dataIndex: ['currentAdmission', 'admittingDoctor'],
      key: 'admittingDoctor',
      render: (doctor) => doctor?.fullName || 'N/A',
    },
    {
      title: 'Chẩn đoán',
      dataIndex: ['currentAdmission', 'diagnosis'],
      key: 'diagnosis',
      ellipsis: true,
    },
    {
      title: 'Ngày nhập viện',
      dataIndex: ['currentAdmission', 'admissionDate'],
      key: 'admissionDate',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số ngày nằm viện',
      key: 'daysAdmitted',
      render: (_, record) => {
        const admissionDate = moment(record.currentAdmission?.admissionDate);
        const days = moment().diff(admissionDate, 'days');
        return <Tag color="blue">{days} ngày</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<LogoutOutlined />}
          onClick={() => openDischargeModal(record)}
        >
          Xuất viện
        </Button>
      ),
    },
  ];

  return (
    <div className="admission-management">
      <PageHeader
        title="Quản lý Nhập/Xuất viện"
        subtitle="Quản lý bệnh nhân nội trú và giường bệnh"
      />

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số giường"
              value={stats.totalBeds}
              prefix={<BedOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Giường đang sử dụng"
              value={stats.occupiedBeds}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Giường còn trống"
              value={stats.availableBeds}
              prefix={<BedOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tỷ lệ lấp đầy"
              value={stats.occupancyRate}
              suffix="%"
              valueStyle={{ color: stats.occupancyRate > 80 ? '#f5222d' : '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Admitted Patients Table */}
      <Card
        title={
          <Badge count={admittedPatients.length} showZero>
            <span style={{ marginRight: 12 }}>Bệnh nhân đang nội trú</span>
          </Badge>
        }
        extra={
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setAdmitModalVisible(true)}
          >
            Nhập viện
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={admittedPatients}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bệnh nhân`,
          }}
        />
      </Card>

      {/* Admit Patient Modal */}
      <Modal
        title={<><UserAddOutlined /> Nhập viện</>}
        open={admitModalVisible}
        onCancel={() => {
          setAdmitModalVisible(false);
          admitForm.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={admitForm}
          layout="vertical"
          onFinish={handleAdmit}
        >
          <Form.Item
            label="Chọn bệnh nhân"
            name="patientId"
            rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
          >
            <Select
              showSearch
              placeholder="Tìm kiếm bệnh nhân..."
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {allPatients.map((patient) => (
                <Option key={patient._id} value={patient._id}>
                  {patient.patientId} - {patient.fullName}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Khoa"
                name="department"
                rules={[{ required: true, message: 'Vui lòng chọn khoa' }]}
              >
                <Select placeholder="Chọn khoa">
                  <Option value="Nội khoa">Nội khoa</Option>
                  <Option value="Ngoại khoa">Ngoại khoa</Option>
                  <Option value="Sản khoa">Sản khoa</Option>
                  <Option value="Nhi khoa">Nhi khoa</Option>
                  <Option value="Hồi sức cấp cứu">Hồi sức cấp cứu</Option>
                  <Option value="Tim mạch">Tim mạch</Option>
                  <Option value="Thần kinh">Thần kinh</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Bác sĩ điều trị"
                name="admittingDoctorId"
                rules={[{ required: true, message: 'Vui lòng chọn bác sĩ' }]}
              >
                <Select
                  showSearch
                  placeholder="Chọn bác sĩ"
                  optionFilterProp="children"
                >
                  {doctors.map((doctor) => (
                    <Option key={doctor._id} value={doctor._id}>
                      {doctor.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Phòng"
                name="ward"
                rules={[{ required: true, message: 'Vui lòng nhập phòng' }]}
              >
                <Input placeholder="VD: A101" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Giường"
                name="bed"
                rules={[{ required: true, message: 'Vui lòng nhập số giường' }]}
              >
                <Input placeholder="VD: 01" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Chẩn đoán nhập viện"
            name="diagnosis"
            rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán' }]}
          >
            <TextArea rows={3} placeholder="Nhập chẩn đoán nhập viện..." />
          </Form.Item>

          <Form.Item
            label="Dự kiến xuất viện"
            name="plannedDischargeDate"
          >
            <DatePicker
              format="DD/MM/YYYY"
              style={{ width: '100%' }}
              placeholder="Chọn ngày dự kiến xuất viện"
            />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setAdmitModalVisible(false);
                admitForm.resetFields();
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Nhập viện
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Discharge Patient Modal */}
      <Modal
        title={<><LogoutOutlined /> Xuất viện</>}
        open={dischargeModalVisible}
        onCancel={() => {
          setDischargeModalVisible(false);
          dischargeForm.resetFields();
          setSelectedPatient(null);
        }}
        footer={null}
        width={700}
      >
        {selectedPatient && (
          <>
            <Card size="small" style={{ marginBottom: 16, background: '#f0f2f5' }}>
              <p><strong>Bệnh nhân:</strong> {selectedPatient.fullName}</p>
              <p><strong>Mã BN:</strong> {selectedPatient.patientId}</p>
              <p><strong>Khoa:</strong> {selectedPatient.currentAdmission?.department}</p>
              <p><strong>Giường:</strong> {selectedPatient.currentAdmission?.ward} - {selectedPatient.currentAdmission?.bed}</p>
            </Card>

            <Form
              form={dischargeForm}
              layout="vertical"
              onFinish={handleDischarge}
            >
              <Form.Item
                label="Ngày xuất viện"
                name="dischargeDate"
                rules={[{ required: true, message: 'Vui lòng chọn ngày xuất viện' }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="Chẩn đoán ra viện"
                name="dischargeDiagnosis"
                rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán ra viện' }]}
              >
                <TextArea rows={3} placeholder="Nhập chẩn đoán ra viện..." />
              </Form.Item>

              <Form.Item
                label="Hướng dẫn sau xuất viện"
                name="dischargeInstructions"
                rules={[{ required: true, message: 'Vui lòng nhập hướng dẫn' }]}
              >
                <TextArea rows={4} placeholder="Nhập hướng dẫn chăm sóc và điều trị sau xuất viện..." />
              </Form.Item>

              <Form.Item
                label="Ngày tái khám"
                name="followUpDate"
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder="Chọn ngày tái khám"
                />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button onClick={() => {
                    setDischargeModalVisible(false);
                    dischargeForm.resetFields();
                    setSelectedPatient(null);
                  }}>
                    Hủy
                  </Button>
                  <Button type="primary" htmlType="submit" loading={loading} danger>
                    Xuất viện
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdmissionManagement;
