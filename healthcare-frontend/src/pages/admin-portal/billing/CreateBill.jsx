import {
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    InputNumber,
    message,
    Row,
    Select,
    Space,
    Table,
    Tag,
    Typography
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CreateBill = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientIdParam = searchParams.get('patientId');

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [services, setServices] = useState([]);
  const [medications, setMedications] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedMedications, setSelectedMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);

  useEffect(() => {
    fetchPatients();
    fetchServices();
    fetchMedications();
  }, []);

  useEffect(() => {
    if (patientIdParam) {
      setSelectedPatient(patientIdParam);
      fetchPatientPrescriptions(patientIdParam);
    }
  }, [patientIdParam]);

  useEffect(() => {
    calculateTotal();
  }, [selectedServices, selectedMedications, form]);

  const fetchPatients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/users?role=PATIENT`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPatients(response.data.users || []);
    } catch (error) {
      console.error('Fetch patients error:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        setPatients(getMockPatients());
      }
    }
  };

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/services`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setServices(response.data.services || []);
    } catch (error) {
      console.error('Fetch services error:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        setServices(getMockServices());
      }
    }
  };

  const fetchMedications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/medications`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMedications(response.data.medications || []);
    } catch (error) {
      console.error('Fetch medications error:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        setMedications(getMockMedications());
      }
    }
  };

  const getMockPatients = () => [
    { _id: '1', personalInfo: { firstName: 'Nguyễn', lastName: 'Văn A' }, medicalRecordNumber: 'MRN001' },
    { _id: '2', personalInfo: { firstName: 'Trần', lastName: 'Thị B' }, medicalRecordNumber: 'MRN002' }
  ];

  const getMockServices = () => [
    { _id: '1', name: 'Khám tổng quát', price: 200000, category: 'Consultation' },
    { _id: '2', name: 'Xét nghiệm máu', price: 150000, category: 'Laboratory' }
  ];

  const getMockMedications = () => [
    { _id: '1', name: 'Paracetamol 500mg', unitPrice: 5000, unit: 'Viên' },
    { _id: '2', name: 'Amoxicillin 500mg', unitPrice: 8000, unit: 'Viên' }
  ];

  const fetchPatientPrescriptions = async (patientId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/prescriptions?patientId=${patientId}&status=PENDING`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPrescriptions(response.data.prescriptions || []);
      
      // Auto-add medications from pending prescriptions
      if (response.data.prescriptions?.length > 0) {
        const autoMeds = response.data.prescriptions[0].medications.map(med => ({
          medicationId: med.medicationId._id,
          name: med.medicationId.name,
          quantity: med.quantity,
          unitPrice: med.medicationId.unitPrice,
          subtotal: med.quantity * med.medicationId.unitPrice
        }));
        setSelectedMedications(autoMeds);
      }
    } catch (error) {
      console.error('Fetch prescriptions error:', error);
    }
  };

  const handlePatientChange = (patientId) => {
    setSelectedPatient(patientId);
    fetchPatientPrescriptions(patientId);
    
    const patient = patients.find(p => p._id === patientId);
    if (patient) {
      form.setFieldsValue({
        patientName: `${patient.personalInfo?.firstName} ${patient.personalInfo?.lastName}`,
        patientPhone: patient.phone
      });
    }
  };

  const addService = () => {
    const serviceId = form.getFieldValue('serviceId');
    const service = services.find(s => s._id === serviceId);
    
    if (!service) {
      message.warning('Vui lòng chọn dịch vụ');
      return;
    }

    if (selectedServices.find(s => s.serviceId === serviceId)) {
      message.warning('Dịch vụ đã được thêm');
      return;
    }

    setSelectedServices([
      ...selectedServices,
      {
        serviceId: service._id,
        name: service.name,
        category: service.category,
        price: service.price,
        quantity: 1,
        subtotal: service.price
      }
    ]);

    form.setFieldsValue({ serviceId: null });
  };

  const addMedication = () => {
    const medicationId = form.getFieldValue('medicationId');
    const quantity = form.getFieldValue('medicationQuantity') || 1;
    const medication = medications.find(m => m._id === medicationId);
    
    if (!medication) {
      message.warning('Vui lòng chọn thuốc');
      return;
    }

    if (medication.quantity < quantity) {
      message.error('Số lượng thuốc không đủ trong kho');
      return;
    }

    setSelectedMedications([
      ...selectedMedications,
      {
        medicationId: medication._id,
        name: medication.name,
        quantity: quantity,
        unitPrice: medication.unitPrice,
        subtotal: quantity * medication.unitPrice
      }
    ]);

    form.setFieldsValue({ 
      medicationId: null,
      medicationQuantity: 1
    });
  };

  const removeService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const removeMedication = (index) => {
    setSelectedMedications(selectedMedications.filter((_, i) => i !== index));
  };

  const updateServiceQuantity = (index, quantity) => {
    const newServices = [...selectedServices];
    newServices[index].quantity = quantity;
    newServices[index].subtotal = quantity * newServices[index].price;
    setSelectedServices(newServices);
  };

  const calculateTotal = () => {
    const servicesTotal = selectedServices.reduce((sum, s) => sum + s.subtotal, 0);
    const medicationsTotal = selectedMedications.reduce((sum, m) => sum + m.subtotal, 0);
    const subtotal = servicesTotal + medicationsTotal;

    // Get discount and insurance from form
    const discount = form.getFieldValue('discount') || 0;
    const insuranceCoverage = form.getFieldValue('insuranceCoverage') || 0;

    const discountAmount = (subtotal * discount) / 100;
    const insuranceAmount = (subtotal * insuranceCoverage) / 100;
    const finalAmount = subtotal - discountAmount - insuranceAmount;

    form.setFieldsValue({
      subtotal: subtotal,
      discountAmount: discountAmount,
      insuranceAmount: insuranceAmount,
      finalAmount: finalAmount > 0 ? finalAmount : 0
    });
  };

  const handleSubmit = async (values) => {
    if (!selectedPatient) {
      message.error('Vui lòng chọn bệnh nhân');
      return;
    }

    if (selectedServices.length === 0 && selectedMedications.length === 0) {
      message.error('Vui lòng thêm ít nhất một dịch vụ hoặc thuốc');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const billData = {
        patientId: selectedPatient,
        services: selectedServices.map(s => ({
          serviceId: s.serviceId,
          quantity: s.quantity,
          price: s.price
        })),
        medications: selectedMedications.map(m => ({
          medicationId: m.medicationId,
          quantity: m.quantity,
          unitPrice: m.unitPrice
        })),
        subtotal: values.subtotal,
        discount: values.discount || 0,
        insuranceCoverage: values.insuranceCoverage || 0,
        finalAmount: values.finalAmount,
        notes: values.notes,
        dueDate: values.dueDate?.format('YYYY-MM-DD')
      };

      const response = await axios.post(
        `${API_BASE_URL}/billing`,
        billData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Đã tạo hóa đơn thành công!');
      navigate(`/admin/billing/${response.data._id}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể tạo hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  const serviceColumns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (cat) => <Tag>{cat}</Tag>
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty, record, index) => (
        <InputNumber
          min={1}
          value={qty}
          onChange={(value) => updateServiceQuantity(index, value)}
        />
      )
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record, index) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeService(index)}
        />
      )
    }
  ];

  const medicationColumns = [
    {
      title: 'Thuốc',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity'
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Thành tiền',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record, index) => (
        <Button
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => removeMedication(index)}
        />
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>Tạo hóa đơn mới</Title>
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={calculateTotal}
        >
          {/* Patient Selection */}
          <Card title="Thông tin bệnh nhân" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Chọn bệnh nhân"
                  rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
                >
                  <Select
                    showSearch
                    placeholder="Tìm bệnh nhân theo tên hoặc SĐT"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                    onChange={handlePatientChange}
                    value={selectedPatient}
                  >
                    {patients.map(patient => (
                      <Option key={patient._id} value={patient._id}>
                        {patient.personalInfo?.firstName} {patient.personalInfo?.lastName} - {patient.phone}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="patientPhone" label="Số điện thoại">
                  <Input disabled />
                </Form.Item>
              </Col>
            </Row>

            {prescriptions.length > 0 && (
              <Tag color="blue">
                Có {prescriptions.length} đơn thuốc chưa thanh toán
              </Tag>
            )}
          </Card>

          {/* Services */}
          <Card title="Dịch vụ khám" style={{ marginBottom: 16 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={18}>
                <Form.Item name="serviceId" label="Chọn dịch vụ">
                  <Select
                    showSearch
                    placeholder="Tìm dịch vụ"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {services.map(service => (
                      <Option key={service._id} value={service._id}>
                        {service.name} - {formatCurrency(service.price)}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label=" ">
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addService}
                    block
                  >
                    Thêm dịch vụ
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            <Table
              columns={serviceColumns}
              dataSource={selectedServices}
              pagination={false}
              rowKey={(record, index) => index}
            />
          </Card>

          {/* Medications */}
          <Card title="Thuốc" style={{ marginBottom: 16 }}>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col xs={24} md={12}>
                <Form.Item name="medicationId" label="Chọn thuốc">
                  <Select
                    showSearch
                    placeholder="Tìm thuốc"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {medications.map(med => (
                      <Option key={med._id} value={med._id}>
                        {med.name} - {formatCurrency(med.unitPrice)} (Còn: {med.quantity})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item name="medicationQuantity" label="Số lượng" initialValue={1}>
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} md={6}>
                <Form.Item label=" ">
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={addMedication}
                    block
                  >
                    Thêm thuốc
                  </Button>
                </Form.Item>
              </Col>
            </Row>

            <Table
              columns={medicationColumns}
              dataSource={selectedMedications}
              pagination={false}
              rowKey={(record, index) => index}
            />
          </Card>

          {/* Payment Details */}
          <Card title="Chi tiết thanh toán" style={{ marginBottom: 16 }}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="subtotal" label="Tổng tiền">
                  <InputNumber
                    style={{ width: '100%' }}
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>

                <Form.Item name="discount" label="Giảm giá (%)" initialValue={0}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    addonAfter="%"
                  />
                </Form.Item>

                <Form.Item name="discountAmount" label="Số tiền giảm">
                  <InputNumber
                    style={{ width: '100%' }}
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="insuranceCoverage" label="Bảo hiểm chi trả (%)" initialValue={0}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: '100%' }}
                    addonAfter="%"
                  />
                </Form.Item>

                <Form.Item name="insuranceAmount" label="Số tiền BH chi trả">
                  <InputNumber
                    style={{ width: '100%' }}
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>

                <Form.Item name="finalAmount" label="Thành tiền">
                  <InputNumber
                    style={{ width: '100%' }}
                    disabled
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    addonAfter="VNĐ"
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="dueDate" label="Hạn thanh toán">
                  <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="notes" label="Ghi chú">
                  <TextArea rows={3} placeholder="Ghi chú thêm về hóa đơn..." />
                </Form.Item>
              </Col>
            </Row>
          </Card>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
                size="large"
              >
                Tạo hóa đơn
              </Button>
              <Button size="large" onClick={() => navigate('/admin/billing/list')}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateBill;
