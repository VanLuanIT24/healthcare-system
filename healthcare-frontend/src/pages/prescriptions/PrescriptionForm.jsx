// 💊 Prescription Form - Create prescription
import { DeleteOutlined, MedicineBoxOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import medicationAPI from '../../services/api/medicationAPI';
import patientAPI from '../../services/api/patientAPI';
import prescriptionAPI from '../../services/api/prescriptionAPI';
import './Prescription.css';

const { Option } = Select;
const { TextArea } = Input;

const PrescriptionForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [medications, setMedications] = useState([]);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [drugInteractions, setDrugInteractions] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    loadPatients();
    loadMedications();
    if (id) loadPrescription();
  }, [id]);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.searchPatients({ limit: 100 });
      setPatients(response.data.patients || []);
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const loadMedications = async () => {
    try {
      const response = await medicationAPI.getMedications({ limit: 500 });
      setMedications(response.data.medications || []);
    } catch (error) {
      message.error('Không thể tải danh sách thuốc');
    }
  };

  const loadPrescription = async () => {
    try {
      setLoading(true);
      const response = await prescriptionAPI.getPrescriptionById(id);
      const prescription = response.data;
      form.setFieldsValue({
        patient: prescription.patient?._id,
        diagnosis: prescription.diagnosis,
        notes: prescription.notes,
      });
      setSelectedMedications(prescription.medications || []);
    } catch (error) {
      message.error('Không thể tải đơn thuốc');
    } finally {
      setLoading(false);
    }
  };

  const checkDrugInteractions = async (medicationIds) => {
    if (medicationIds.length < 2) {
      setDrugInteractions([]);
      return;
    }
    try {
      const response = await prescriptionAPI.checkDrugInteractions({ medications: medicationIds });
      setDrugInteractions(response.data.interactions || []);
    } catch (error) {
      console.error('Failed to check drug interactions');
    }
  };

  const handleAddMedication = () => {
    setSelectedMedications([
      ...selectedMedications,
      {
        medication: null,
        quantity: 1,
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const handleRemoveMedication = (index) => {
    const newMedications = selectedMedications.filter((_, i) => i !== index);
    setSelectedMedications(newMedications);
    const medicationIds = newMedications
      .map((m) => m.medication)
      .filter((id) => id);
    checkDrugInteractions(medicationIds);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMedications = [...selectedMedications];
    newMedications[index][field] = value;
    setSelectedMedications(newMedications);

    if (field === 'medication') {
      const medicationIds = newMedications
        .map((m) => m.medication)
        .filter((id) => id);
      checkDrugInteractions(medicationIds);
    }
  };

  const handleSubmit = async (values) => {
    if (selectedMedications.length === 0) {
      message.error('Vui lòng thêm ít nhất một loại thuốc');
      return;
    }

    const isValid = selectedMedications.every(
      (med) => med.medication && med.quantity && med.dosage && med.frequency && med.duration
    );
    if (!isValid) {
      message.error('Vui lòng điền đầy đủ thông tin cho tất cả các loại thuốc');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...values,
        medications: selectedMedications,
      };

      if (id) {
        await prescriptionAPI.updatePrescription(id, data);
        message.success('Cập nhật đơn thuốc thành công');
      } else {
        await prescriptionAPI.createPrescription(data);
        message.success('Tạo đơn thuốc thành công');
      }
      navigate('/prescriptions');
    } catch (error) {
      message.error(id ? 'Cập nhật đơn thuốc thất bại' : 'Tạo đơn thuốc thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container prescription-form-container">
      <PageHeader
        title={id ? 'Chỉnh sửa đơn thuốc' : 'Kê đơn thuốc mới'}
        subtitle="Thông tin đơn thuốc"
        onBack={() => navigate('/prescriptions')}
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={16}>
            <Card title="Thông tin bệnh nhân và chẩn đoán" className="mb-24">
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="patient"
                    label="Bệnh nhân"
                    rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
                  >
                    <Select
                      showSearch
                      placeholder="Chọn bệnh nhân"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                      }
                    >
                      {patients.map((patient) => (
                        <Option key={patient._id} value={patient._id}>
                          {patient.fullName} - {patient.patientId}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="diagnosis"
                    label="Chẩn đoán"
                    rules={[{ required: true, message: 'Vui lòng nhập chẩn đoán' }]}
                  >
                    <Input placeholder="Nhập chẩn đoán bệnh" />
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <Space>
                  <MedicineBoxOutlined />
                  Danh sách thuốc
                </Space>
              }
              extra={
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddMedication}>
                  Thêm thuốc
                </Button>
              }
            >
              {selectedMedications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                  Chưa có thuốc nào. Nhấn "Thêm thuốc" để bắt đầu.
                </div>
              ) : (
                <div className="medication-list">
                  {selectedMedications.map((med, index) => (
                    <div key={index} className="medication-form-item">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        className="remove-medication-btn"
                        onClick={() => handleRemoveMedication(index)}
                      />

                      <Row gutter={16}>
                        <Col xs={24}>
                          <label>
                            Tên thuốc <span style={{ color: 'red' }}>*</span>
                          </label>
                          <Select
                            showSearch
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Chọn thuốc"
                            value={med.medication}
                            onChange={(value) => handleMedicationChange(index, 'medication', value)}
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                              option.children.toLowerCase().includes(input.toLowerCase())
                            }
                          >
                            {medications.map((medication) => (
                              <Option key={medication._id} value={medication._id}>
                                {medication.name} - {medication.manufacturer}
                              </Option>
                            ))}
                          </Select>
                        </Col>
                      </Row>

                      <Divider style={{ margin: '12px 0' }} />

                      <Row gutter={16}>
                        <Col xs={24} md={8}>
                          <label>
                            Số lượng <span style={{ color: 'red' }}>*</span>
                          </label>
                          <InputNumber
                            style={{ width: '100%', marginTop: 8 }}
                            min={1}
                            placeholder="Số lượng"
                            value={med.quantity}
                            onChange={(value) => handleMedicationChange(index, 'quantity', value)}
                          />
                        </Col>
                        <Col xs={24} md={8}>
                          <label>
                            Liều dùng <span style={{ color: 'red' }}>*</span>
                          </label>
                          <Input
                            style={{ marginTop: 8 }}
                            placeholder="VD: 1 viên"
                            value={med.dosage}
                            onChange={(e) =>
                              handleMedicationChange(index, 'dosage', e.target.value)
                            }
                          />
                        </Col>
                        <Col xs={24} md={8}>
                          <label>
                            Tần suất <span style={{ color: 'red' }}>*</span>
                          </label>
                          <Select
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="Chọn tần suất"
                            value={med.frequency}
                            onChange={(value) => handleMedicationChange(index, 'frequency', value)}
                          >
                            <Option value="once-daily">1 lần/ngày</Option>
                            <Option value="twice-daily">2 lần/ngày</Option>
                            <Option value="three-times-daily">3 lần/ngày</Option>
                            <Option value="four-times-daily">4 lần/ngày</Option>
                            <Option value="every-4-hours">Mỗi 4 giờ</Option>
                            <Option value="every-6-hours">Mỗi 6 giờ</Option>
                            <Option value="every-8-hours">Mỗi 8 giờ</Option>
                            <Option value="as-needed">Khi cần</Option>
                          </Select>
                        </Col>
                      </Row>

                      <Row gutter={16} style={{ marginTop: 12 }}>
                        <Col xs={24} md={12}>
                          <label>
                            Thời gian dùng <span style={{ color: 'red' }}>*</span>
                          </label>
                          <Input
                            style={{ marginTop: 8 }}
                            placeholder="VD: 7 ngày"
                            value={med.duration}
                            onChange={(e) =>
                              handleMedicationChange(index, 'duration', e.target.value)
                            }
                          />
                        </Col>
                        <Col xs={24} md={12}>
                          <label>Hướng dẫn sử dụng</label>
                          <Input
                            style={{ marginTop: 8 }}
                            placeholder="VD: Uống sau ăn"
                            value={med.instructions}
                            onChange={(e) =>
                              handleMedicationChange(index, 'instructions', e.target.value)
                            }
                          />
                        </Col>
                      </Row>
                    </div>
                  ))}
                </div>
              )}

              {drugInteractions.length > 0 && (
                <Alert
                  message="Cảnh báo tương tác thuốc"
                  description={
                    <ul>
                      {drugInteractions.map((interaction, index) => (
                        <li key={index}>{interaction}</li>
                      ))}
                    </ul>
                  }
                  type="warning"
                  showIcon
                  className="drug-interaction-warning"
                  style={{ marginTop: 16 }}
                />
              )}
            </Card>

            <Card title="Ghi chú thêm" style={{ marginTop: 16 }}>
              <Form.Item name="notes">
                <TextArea
                  rows={4}
                  placeholder="Ghi chú bổ sung cho đơn thuốc..."
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title="Tóm tắt đơn thuốc" className="prescription-summary">
              <div className="summary-item">
                <span className="summary-label">Tổng số loại thuốc:</span>
                <span className="summary-value">{selectedMedications.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Tổng số lượng:</span>
                <span className="summary-value">
                  {selectedMedications.reduce((sum, med) => sum + (med.quantity || 0), 0)}
                </span>
              </div>

              <Divider />

              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  loading={loading}
                  htmlType="submit"
                  block
                  size="large"
                >
                  {id ? 'Cập nhật đơn thuốc' : 'Tạo đơn thuốc'}
                </Button>
                <Button block onClick={() => navigate('/prescriptions')}>
                  Hủy
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default PrescriptionForm;
