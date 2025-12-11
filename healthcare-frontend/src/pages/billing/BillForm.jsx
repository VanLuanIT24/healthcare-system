// 💰 Bill Form - Create new bill
import {
    DeleteOutlined,
    PlusOutlined,
    SaveOutlined
} from '@ant-design/icons';
import {
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
    Space,
    Table
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import billingAPI from '../../services/api/billingAPI';
import patientAPI from '../../services/api/patientAPI';
import './Billing.css';

const { Option } = Select;
const { TextArea } = Input;

const BillForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [billItems, setBillItems] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientId = searchParams.get('patient');

  useEffect(() => {
    loadPatients();
    loadServiceCategories();
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

  const loadServiceCategories = async () => {
    try {
      const response = await billingAPI.getServiceCategories();
      setServiceCategories(response.data.categories || []);
    } catch (error) {
      message.error('Không thể tải danh mục dịch vụ');
    }
  };

  const handleAddItem = () => {
    setBillItems([
      ...billItems,
      {
        id: Date.now(),
        service: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
      },
    ]);
  };

  const handleRemoveItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setBillItems(
      billItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unitPrice;
    const discount = (subtotal * (item.discount || 0)) / 100;
    return subtotal - discount;
  };

  const calculateSubtotal = () => {
    return billItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  };

  const calculateTotalDiscount = () => {
    return billItems.reduce((sum, item) => {
      const subtotal = item.quantity * item.unitPrice;
      return sum + (subtotal * (item.discount || 0)) / 100;
    }, 0);
  };

  const calculateTotal = () => {
    return billItems.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  };

  const handleSubmit = async (values) => {
    if (billItems.length === 0) {
      message.error('Vui lòng thêm ít nhất một dịch vụ');
      return;
    }

    try {
      setLoading(true);
      const data = {
        ...values,
        items: billItems.map((item) => ({
          service: item.service,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          total: calculateItemTotal(item),
        })),
        subtotal: calculateSubtotal(),
        totalDiscount: calculateTotalDiscount(),
        totalAmount: calculateTotal(),
      };

      await billingAPI.createBill(data);
      message.success('Tạo hóa đơn thành công');
      navigate('/billing');
    } catch (error) {
      message.error('Tạo hóa đơn thất bại');
    } finally {
      setLoading(false);
    }
  };

  const itemColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Dịch vụ',
      key: 'service',
      width: 250,
      render: (_, record) => (
        <Select
          style={{ width: '100%' }}
          placeholder="Chọn dịch vụ"
          value={record.service}
          onChange={(value, option) => {
            handleItemChange(record.id, 'service', value);
            handleItemChange(record.id, 'description', option.description);
            handleItemChange(record.id, 'unitPrice', option.price);
          }}
        >
          {serviceCategories.map((category) => (
            <Option
              key={category._id}
              value={category._id}
              description={category.description}
              price={category.price}
            >
              {category.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Mô tả',
      key: 'description',
      render: (_, record) => (
        <Input
          placeholder="Mô tả"
          value={record.description}
          onChange={(e) => handleItemChange(record.id, 'description', e.target.value)}
        />
      ),
    },
    {
      title: 'SL',
      key: 'quantity',
      width: 80,
      render: (_, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleItemChange(record.id, 'quantity', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Đơn giá',
      key: 'unitPrice',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0}
          value={record.unitPrice}
          onChange={(value) => handleItemChange(record.id, 'unitPrice', value)}
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Giảm giá (%)',
      key: 'discount',
      width: 100,
      render: (_, record) => (
        <InputNumber
          min={0}
          max={100}
          value={record.discount}
          onChange={(value) => handleItemChange(record.id, 'discount', value)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Thành tiền',
      key: 'total',
      width: 120,
      render: (_, record) => (
        <strong style={{ color: '#1890ff' }}>
          {calculateItemTotal(record).toLocaleString('vi-VN')}
        </strong>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveItem(record.id)}
        />
      ),
    },
  ];

  return (
    <div className="page-container bill-form-container">
      <PageHeader
        title="Tạo hóa đơn mới"
        subtitle="Lập hóa đơn cho bệnh nhân"
        onBack={() => navigate('/billing')}
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Row gutter={[24, 0]}>
          <Col xs={24} lg={16}>
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
                  <Form.Item name="insuranceProvider" label="Bảo hiểm">
                    <Select placeholder="Chọn loại bảo hiểm">
                      <Option value="none">Không có</Option>
                      <Option value="bhyt">BHYT</Option>
                      <Option value="private">Bảo hiểm tư nhân</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            </Card>

            <Card
              title="Chi tiết dịch vụ"
              extra={
                <Button type="dashed" icon={<PlusOutlined />} onClick={handleAddItem}>
                  Thêm dịch vụ
                </Button>
              }
              className="bill-items-table"
            >
              <Table
                columns={itemColumns}
                dataSource={billItems}
                rowKey="id"
                pagination={false}
                locale={{ emptyText: 'Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để bắt đầu.' }}
              />
            </Card>

            <Card title="Ghi chú" style={{ marginTop: 16 }}>
              <Form.Item name="notes">
                <TextArea rows={3} placeholder="Ghi chú cho hóa đơn..." />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card title="Tổng tiền" className="bill-total-section">
              <div className="bill-total-row">
                <span>Tạm tính:</span>
                <span>{calculateSubtotal().toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="bill-total-row">
                <span>Giảm giá:</span>
                <span style={{ color: '#52c41a' }}>
                  -{calculateTotalDiscount().toLocaleString('vi-VN')} VND
                </span>
              </div>
              <Divider style={{ margin: '12px 0' }} />
              <div className="bill-total-row">
                <span>
                  <strong>Tổng cộng:</strong>
                </span>
                <span>
                  <strong style={{ fontSize: 20 }}>
                    {calculateTotal().toLocaleString('vi-VN')} VND
                  </strong>
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
                  Tạo hóa đơn
                </Button>
                <Button block onClick={() => navigate('/billing')}>
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

export default BillForm;
