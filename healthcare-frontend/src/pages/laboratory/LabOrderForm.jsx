// 🧪 Lab Order Form - Create lab test order
import { ExperimentOutlined, SaveOutlined } from '@ant-design/icons';
import {
    Alert,
    Button,
    Card,
    Checkbox,
    Col,
    Divider,
    Form,
    Input,
    message,
    Row,
    Select,
    Space,
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import laboratoryAPI from '../../services/api/laboratoryAPI';
import patientAPI from '../../services/api/patientAPI';
import './Laboratory.css';

const { Option } = Select;
const { TextArea } = Input;

const LabOrderForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [availableTests, setAvailableTests] = useState([]);
  const [selectedTests, setSelectedTests] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('patient');

  useEffect(() => {
    loadPatients();
    loadAvailableTests();
    if (patientId) {
      form.setFieldsValue({ patient: patientId });
    }
  }, [patientId]);

  const loadPatients = async () => {
    try {
      const response = await patientAPI.searchPatients({ limit: 100 });
      setPatients(response.data.patients || []);
    } catch (error) {
      message.error('Không thể tải danh sách bệnh nhân');
    }
  };

  const loadAvailableTests = async () => {
    try {
      const response = await laboratoryAPI.getAvailableTests();
      setAvailableTests(response.data.tests || []);
    } catch (error) {
      message.error('Không thể tải danh sách xét nghiệm');
    }
  };

  const handleTestToggle = (test) => {
    const exists = selectedTests.find((t) => t._id === test._id);
    if (exists) {
      setSelectedTests(selectedTests.filter((t) => t._id !== test._id));
    } else {
      setSelectedTests([...selectedTests, test]);
    }
  };

  const handleSubmit = async (values) => {
    if (selectedTests.length === 0) {
      message.error('Vui lòng chọn ít nhất một xét nghiệm');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...values,
        tests: selectedTests.map((t) => t._id),
      };
      await laboratoryAPI.createLabOrder(data);
      message.success('Tạo phiếu xét nghiệm thành công');
      navigate('/lab/orders');
    } catch (error) {
      message.error('Tạo phiếu xét nghiệm thất bại');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    return selectedTests.reduce((sum, test) => sum + (test.price || 0), 0);
  };

  return (
    <div className="page-container lab-order-form-container">
      <PageHeader
        title="Tạo phiếu xét nghiệm"
        subtitle="Chỉ định xét nghiệm cho bệnh nhân"
        onBack={() => navigate('/lab/orders')}
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[24, 0]}>
          <Col xs={24} md={16}>
            <Card title="Thông tin bệnh nhân" style={{ marginBottom: 16 }}>
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
                    name="priority"
                    label="Độ ưu tiên"
                    rules={[{ required: true, message: 'Vui lòng chọn độ ưu tiên' }]}
                  >
                    <Select placeholder="Chọn độ ưu tiên">
                      <Option value="normal">Thường</Option>
                      <Option value="urgent">Ưu tiên</Option>
                      <Option value="emergency">Khẩn cấp</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title={
                <Space>
                  <ExperimentOutlined />
                  Chọn xét nghiệm
                </Space>
              }
            >
              {selectedTests.length > 0 && (
                <Alert
                  message={`Đã chọn ${selectedTests.length} xét nghiệm`}
                  type="info"
                  showIcon
                  style={{ marginBottom: 16 }}
                />
              )}

              <div className="test-selection-grid">
                {availableTests.map((test) => (
                  <div
                    key={test._id}
                    className={`test-card ${
                      selectedTests.find((t) => t._id === test._id) ? 'selected' : ''
                    }`}
                    onClick={() => handleTestToggle(test)}
                  >
                    <Checkbox
                      checked={!!selectedTests.find((t) => t._id === test._id)}
                      style={{ marginBottom: 8 }}
                    />
                    <div className="test-card-name">{test.name}</div>
                    <div className="test-card-description">{test.description}</div>
                    <div className="test-card-price">
                      {test.price?.toLocaleString('vi-VN')} VND
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Thông tin mẫu" style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="specimenType"
                    label="Loại mẫu"
                    rules={[{ required: true, message: 'Vui lòng chọn loại mẫu' }]}
                  >
                    <Select placeholder="Chọn loại mẫu">
                      <Option value="blood">Máu</Option>
                      <Option value="urine">Nước tiểu</Option>
                      <Option value="stool">Phân</Option>
                      <Option value="sputum">Đờm</Option>
                      <Option value="tissue">Mô</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="specimenSource" label="Nguồn mẫu">
                    <Input placeholder="VD: Tĩnh mạch cánh tay trái" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="clinicalInfo" label="Thông tin lâm sàng">
                <TextArea rows={3} placeholder="Thông tin lâm sàng liên quan..." />
              </Form.Item>

              <Form.Item name="notes" label="Ghi chú">
                <TextArea rows={3} placeholder="Ghi chú bổ sung cho phòng xét nghiệm..." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card title="Tóm tắt phiếu XN" className="lab-order-summary">
              <div className="summary-item">
                <span className="summary-label">Số lượng xét nghiệm:</span>
                <span className="summary-value">{selectedTests.length}</span>
              </div>

              <Divider />

              <div className="selected-tests-list">
                {selectedTests.map((test, index) => (
                  <div key={test._id} className="selected-test-item">
                    <span className="test-number">{index + 1}.</span>
                    <span className="test-name">{test.name}</span>
                    <span className="test-price">
                      {test.price?.toLocaleString('vi-VN')} VND
                    </span>
                  </div>
                ))}
              </div>

              {selectedTests.length === 0 && (
                <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '20px 0' }}>
                  Chưa chọn xét nghiệm nào
                </div>
              )}

              <Divider />

              <div className="summary-total">
                <span className="summary-label">Tổng chi phí:</span>
                <span className="summary-value" style={{ color: '#1890ff', fontSize: 20 }}>
                  {calculateTotalPrice().toLocaleString('vi-VN')} VND
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
                  Tạo phiếu xét nghiệm
                </Button>
                <Button block onClick={() => navigate('/lab/orders')}>
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

export default LabOrderForm;
