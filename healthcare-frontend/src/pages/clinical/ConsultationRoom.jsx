// 💼 Clinical Consultation Room
import {
    ExperimentOutlined,
    FileTextOutlined,
    HeartOutlined,
    HistoryOutlined,
    MedicineBoxOutlined,
    SaveOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Tabs,
    Tag,
    Timeline
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import clinicalAPI from '../../services/api/clinicalAPI';
import patientAPI from '../../services/api/patientAPI';
import './Clinical.css';

const { TextArea } = Input;
const { Option } = Select;
const { TabPane } = Tabs;

const ConsultationRoom = () => {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vitalsForm] = Form.useForm();
  const [consultationForm] = Form.useForm();
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [labOrderModal, setLabOrderModal] = useState(false);
  const { patientId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadPatientData();
  }, [patientId]);

  const loadPatientData = async () => {
    try {
      setLoading(true);
      const [patientRes, historyRes] = await Promise.all([
        patientAPI.getPatientById(patientId),
        clinicalAPI.getMedicalHistory(patientId),
      ]);
      setPatient(patientRes.data);
      setMedicalHistory(historyRes.data || []);
    } catch (error) {
      message.error('Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveVitals = async (values) => {
    try {
      await clinicalAPI.recordVitalSigns(patientId, values);
      message.success('Lưu dấu hiệu sinh tồn thành công');
      vitalsForm.resetFields();
    } catch (error) {
      message.error('Lưu thất bại');
    }
  };

  const handleSaveConsultation = async (values) => {
    try {
      await clinicalAPI.createConsultation(patientId, values);
      message.success('Lưu thông tin khám bệnh thành công');
      consultationForm.resetFields();
      loadPatientData();
    } catch (error) {
      message.error('Lưu thất bại');
    }
  };

  const handleQuickPrescription = () => {
    setPrescriptionModal(true);
  };

  const handleQuickLabOrder = () => {
    setLabOrderModal(true);
  };

  return (
    <div className="page-container consultation-room-container">
      <PageHeader
        title="Phòng khám"
        subtitle={`Khám bệnh cho ${patient?.fullName || ''}`}
        onBack={() => navigate('/appointments')}
      />

      <Row gutter={[24, 24]}>
        {/* Patient Info Card */}
        <Col xs={24} lg={8}>
          <Card loading={loading} className="patient-info-card">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={100}
                src={patient?.profilePicture}
                icon={<UserOutlined />}
                style={{ marginBottom: 16 }}
              />
              <h2 style={{ margin: 0 }}>{patient?.fullName}</h2>
              <p style={{ color: '#8c8c8c' }}>ID: {patient?.patientId}</p>
            </div>

            <Descriptions column={1} size="small">
              <Descriptions.Item label="Tuổi">
                {patient?.dateOfBirth
                  ? moment().diff(moment(patient.dateOfBirth), 'years')
                  : 'N/A'}{' '}
                tuổi
              </Descriptions.Item>
              <Descriptions.Item label="Giới tính">
                {patient?.gender === 'male'
                  ? 'Nam'
                  : patient?.gender === 'female'
                  ? 'Nữ'
                  : 'Khác'}
              </Descriptions.Item>
              <Descriptions.Item label="Nhóm máu">{patient?.bloodType || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="Điện thoại">{patient?.phoneNumber}</Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {patient?.address?.street}, {patient?.address?.district}
              </Descriptions.Item>
            </Descriptions>

            <Divider />

            <div className="allergies-section">
              <strong>Dị ứng:</strong>
              {patient?.allergies?.length > 0 ? (
                <div style={{ marginTop: 8 }}>
                  {patient.allergies.map((allergy, index) => (
                    <Tag key={index} color="red" style={{ marginBottom: 4 }}>
                      {allergy}
                    </Tag>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8c8c8c' }}>Không có</p>
              )}
            </div>

            <div className="chronic-conditions-section" style={{ marginTop: 16 }}>
              <strong>Bệnh mãn tính:</strong>
              {patient?.chronicConditions?.length > 0 ? (
                <div style={{ marginTop: 8 }}>
                  {patient.chronicConditions.map((condition, index) => (
                    <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
                      {condition}
                    </Tag>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#8c8c8c' }}>Không có</p>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card title="Thao tác nhanh" style={{ marginTop: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<MedicineBoxOutlined />}
                block
                onClick={handleQuickPrescription}
              >
                Kê đơn thuốc
              </Button>
              <Button
                type="default"
                icon={<ExperimentOutlined />}
                block
                onClick={handleQuickLabOrder}
              >
                Chỉ định xét nghiệm
              </Button>
              <Button
                type="default"
                icon={<FileTextOutlined />}
                block
                onClick={() => navigate(`/medical-records/create?patient=${patientId}`)}
              >
                Tạo hồ sơ bệnh án
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Main Content */}
        <Col xs={24} lg={16}>
          <Card>
            <Tabs defaultActiveKey="vitals">
              {/* Vital Signs Tab */}
              <TabPane
                tab={
                  <span>
                    <HeartOutlined />
                    Dấu hiệu sinh tồn
                  </span>
                }
                key="vitals"
              >
                <Form form={vitalsForm} layout="vertical" onFinish={handleSaveVitals}>
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="bloodPressure"
                        label="Huyết áp (mmHg)"
                        rules={[{ required: true, message: 'Vui lòng nhập huyết áp' }]}
                      >
                        <Input placeholder="120/80" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="heartRate"
                        label="Nhịp tim (bpm)"
                        rules={[{ required: true, message: 'Vui lòng nhập nhịp tim' }]}
                      >
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="72" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        name="temperature"
                        label="Nhiệt độ (°C)"
                        rules={[{ required: true, message: 'Vui lòng nhập nhiệt độ' }]}
                      >
                        <InputNumber style={{ width: '100%' }} min={0} step={0.1} placeholder="36.5" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={16}>
                    <Col xs={24} md={8}>
                      <Form.Item name="weight" label="Cân nặng (kg)">
                        <InputNumber style={{ width: '100%' }} min={0} step={0.1} placeholder="65" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="height" label="Chiều cao (cm)">
                        <InputNumber style={{ width: '100%' }} min={0} placeholder="170" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item name="oxygenSaturation" label="SpO2 (%)">
                        <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="98" />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Lưu dấu hiệu sinh tồn
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              {/* Consultation Tab */}
              <TabPane
                tab={
                  <span>
                    <FileTextOutlined />
                    Thông tin khám
                  </span>
                }
                key="consultation"
              >
                <Form form={consultationForm} layout="vertical" onFinish={handleSaveConsultation}>
                  <Form.Item
                    name="chiefComplaint"
                    label="Lý do khám"
                    rules={[{ required: true, message: 'Vui lòng nhập lý do khám' }]}
                  >
                    <TextArea rows={3} placeholder="Bệnh nhân than phiền về..." />
                  </Form.Item>

                  <Form.Item name="presentIllness" label="Bệnh sử hiện tại">
                    <TextArea rows={3} placeholder="Triệu chứng xuất hiện từ khi nào..." />
                  </Form.Item>

                  <Form.Item
                    name="physicalExamination"
                    label="Khám lâm sàng"
                    rules={[{ required: true, message: 'Vui lòng nhập kết quả khám' }]}
                  >
                    <TextArea rows={4} placeholder="Kết quả khám lâm sàng..." />
                  </Form.Item>

                  <Form.Item
                    name="diagnosis"
                    label="Chẩn đoán"
                    rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán' }]}
                  >
                    <Input placeholder="Chẩn đoán bệnh" />
                  </Form.Item>

                  <Form.Item name="treatmentPlan" label="Kế hoạch điều trị">
                    <TextArea rows={3} placeholder="Hướng điều trị..." />
                  </Form.Item>

                  <Form.Item name="followUpDate" label="Ngày tái khám">
                    <Input type="date" />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                      Lưu thông tin khám
                    </Button>
                  </Form.Item>
                </Form>
              </TabPane>

              {/* Medical History Tab */}
              <TabPane
                tab={
                  <span>
                    <HistoryOutlined />
                    Lịch sử khám
                  </span>
                }
                key="history"
              >
                <Timeline mode="left">
                  {medicalHistory.map((record, index) => (
                    <Timeline.Item key={index} color="blue">
                      <p style={{ margin: 0, fontWeight: 600 }}>
                        {moment(record.date).format('DD/MM/YYYY')}
                      </p>
                      <p style={{ margin: '4px 0', color: '#8c8c8c' }}>
                        BS: {record.doctor?.fullName}
                      </p>
                      <p style={{ margin: 0 }}>
                        <strong>Chẩn đoán:</strong> {record.diagnosis}
                      </p>
                      {record.treatment && (
                        <p style={{ margin: '4px 0' }}>
                          <strong>Điều trị:</strong> {record.treatment}
                        </p>
                      )}
                    </Timeline.Item>
                  ))}
                </Timeline>
              </TabPane>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ConsultationRoom;
