// 💳 Payment Process Page
import {
    BankOutlined,
    CheckCircleOutlined,
    CreditCardOutlined,
    DollarOutlined,
    MobileOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Input,
    InputNumber,
    Modal,
    Row,
    Select,
    Space,
    Tag,
    Timeline,
    message,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import billingAPI from '../../services/api/billingAPI';
import './Billing.css';

const { Option } = Select;

const PaymentProcess = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState('cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const { billId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    loadBill();
  }, [billId]);

  const loadBill = async () => {
    try {
      const response = await billingAPI.getBillById(billId);
      setBill(response.data);
      const remaining = (response.data.totalAmount || 0) - (response.data.paidAmount || 0);
      setPaymentAmount(remaining);
      form.setFieldsValue({ amount: remaining });
    } catch (error) {
      message.error('Không thể tải thông tin hóa đơn');
    }
  };

  const handlePayment = async (values) => {
    try {
      setLoading(true);
      await billingAPI.processPayment(billId, {
        amount: values.amount,
        method: selectedMethod,
        reference: values.reference,
        notes: values.notes,
      });
      
      message.success('Thanh toán thành công');
      
      Modal.confirm({
        title: 'In biên lai',
        content: 'Bạn có muốn in biên lai thanh toán không?',
        okText: 'In biên lai',
        cancelText: 'Đóng',
        onOk: () => handlePrintReceipt(),
        onCancel: () => navigate('/billing'),
      });
    } catch (error) {
      message.error('Thanh toán thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = async () => {
    try {
      await billingAPI.generateReceipt(billId);
      message.success('In biên lai thành công');
      navigate('/billing');
    } catch (error) {
      message.error('In biên lai thất bại');
    }
  };

  if (!bill) {
    return <Card loading />;
  }

  const remaining = (bill.totalAmount || 0) - (bill.paidAmount || 0);
  const changeAmount = paymentAmount - remaining;

  const paymentMethods = [
    {
      key: 'cash',
      name: 'Tiền mặt',
      icon: <DollarOutlined />,
      description: 'Thanh toán bằng tiền mặt',
    },
    {
      key: 'card',
      name: 'Thẻ ngân hàng',
      icon: <CreditCardOutlined />,
      description: 'Thẻ ATM, Visa, Master',
    },
    {
      key: 'transfer',
      name: 'Chuyển khoản',
      icon: <BankOutlined />,
      description: 'Chuyển khoản ngân hàng',
    },
    {
      key: 'ewallet',
      name: 'Ví điện tử',
      icon: <MobileOutlined />,
      description: 'MoMo, ZaloPay, VNPay',
    },
  ];

  return (
    <div className="page-container payment-container">
      <PageHeader
        title="Thanh toán"
        subtitle={`Hóa đơn ${bill.billNumber}`}
        onBack={() => navigate('/billing')}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={14}>
          {/* Bill Information */}
          <Card title="Thông tin hóa đơn" style={{ marginBottom: 16 }}>
            <Descriptions column={2}>
              <Descriptions.Item label="Mã hóa đơn">
                <strong>{bill.billNumber}</strong>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày tạo">
                {moment(bill.createdAt).format('DD/MM/YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Bệnh nhân" span={2}>
                <strong>{bill.patient?.fullName}</strong>
                <span style={{ color: '#8c8c8c', marginLeft: 8 }}>
                  ({bill.patient?.patientId})
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <strong style={{ color: '#1890ff', fontSize: 16 }}>
                  {bill.totalAmount?.toLocaleString('vi-VN')} VND
                </strong>
              </Descriptions.Item>
              <Descriptions.Item label="Đã thanh toán">
                <span style={{ color: '#52c41a' }}>
                  {bill.paidAmount?.toLocaleString('vi-VN')} VND
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Còn lại" span={2}>
                <strong style={{ color: '#ff4d4f', fontSize: 18 }}>
                  {remaining.toLocaleString('vi-VN')} VND
                </strong>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Payment Method Selection */}
          <Card title="Phương thức thanh toán">
            <div className="payment-method-grid">
              {paymentMethods.map((method) => (
                <div
                  key={method.key}
                  className={`payment-method-card ${
                    selectedMethod === method.key ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedMethod(method.key)}
                >
                  <div className="payment-method-icon">{method.icon}</div>
                  <div className="payment-method-name">{method.name}</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 8 }}>
                    {method.description}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Payment Form */}
          <Card title="Thông tin thanh toán" style={{ marginTop: 16 }}>
            <Form form={form} layout="vertical" onFinish={handlePayment}>
              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="amount"
                    label="Số tiền thanh toán"
                    rules={[
                      { required: true, message: 'Vui lòng nhập số tiền' },
                      {
                        validator: (_, value) => {
                          if (value > 0 && value <= remaining) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            `Số tiền phải từ 1 đến ${remaining.toLocaleString('vi-VN')} VND`
                          );
                        },
                      },
                    ]}
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={0}
                      max={remaining}
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                      addonAfter="VND"
                      onChange={(value) => setPaymentAmount(value || 0)}
                      size="large"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Tiền thừa trả lại">
                    <InputNumber
                      style={{ width: '100%' }}
                      value={changeAmount > 0 ? changeAmount : 0}
                      disabled
                      formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      addonAfter="VND"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {selectedMethod !== 'cash' && (
                <Form.Item
                  name="reference"
                  label="Mã giao dịch / Số tham chiếu"
                  rules={[{ required: true, message: 'Vui lòng nhập mã giao dịch' }]}
                >
                  <Input placeholder="Nhập mã giao dịch" />
                </Form.Item>
              )}

              <Form.Item name="notes" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Ghi chú về thanh toán..." />
              </Form.Item>

              <Space size="large">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  htmlType="submit"
                  loading={loading}
                  size="large"
                >
                  Xác nhận thanh toán
                </Button>
                <Button size="large" onClick={() => navigate('/billing')}>
                  Hủy
                </Button>
              </Space>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          {/* Payment Summary */}
          <Card title="Tổng quan thanh toán" className="payment-summary">
            <div className="payment-amount-display">
              <div className="payment-amount-label">Số tiền cần thanh toán</div>
              <div className="payment-amount-value">
                {remaining.toLocaleString('vi-VN')} VND
              </div>
            </div>

            <Divider />

            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Tổng hóa đơn:</span>
                <strong>{bill.totalAmount?.toLocaleString('vi-VN')} VND</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Đã thanh toán:</span>
                <span style={{ color: '#52c41a' }}>
                  {bill.paidAmount?.toLocaleString('vi-VN')} VND
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Còn lại:</span>
                <strong style={{ color: '#ff4d4f' }}>
                  {remaining.toLocaleString('vi-VN')} VND
                </strong>
              </div>
            </Space>

            <Divider />

            {bill.payments && bill.payments.length > 0 && (
              <div className="payment-history">
                <h4>Lịch sử thanh toán</h4>
                <Timeline>
                  {bill.payments.map((payment, index) => (
                    <Timeline.Item key={index} color="green">
                      <div>
                        <strong>{payment.amount?.toLocaleString('vi-VN')} VND</strong>
                      </div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>
                        {moment(payment.date).format('DD/MM/YYYY HH:mm')}
                      </div>
                      <div style={{ fontSize: 12 }}>
                        <Tag>{payment.method === 'cash' ? 'Tiền mặt' : payment.method}</Tag>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default PaymentProcess;
