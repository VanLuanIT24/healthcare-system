import {
    CheckCircleOutlined,
    DollarOutlined,
    DownloadOutlined,
    PrinterOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    Descriptions,
    message,
    Row,
    Space,
    Table,
    Tag,
    Timeline,
    Typography
} from 'antd';
import axios from 'axios';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const { Title, Text } = Typography;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [bill, setBill] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);

  useEffect(() => {
    fetchBillDetail();
    fetchPaymentHistory();
  }, [id]);

  const fetchBillDetail = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/billing/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBill(response.data);
    } catch (error) {
      message.error('Không thể tải thông tin hóa đơn');
      console.error('Fetch bill detail error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/billing/${id}/payments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPaymentHistory(response.data.payments || []);
    } catch (error) {
      console.error('Fetch payment history error:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_BASE_URL}/billing/${id}/pdf`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `bill_${bill?.billNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      message.success('Đã tải xuống hóa đơn');
    } catch (error) {
      message.error('Không thể tải xuống hóa đơn');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'warning',
      PARTIAL: 'processing',
      PAID: 'success',
      OVERDUE: 'error',
      VOIDED: 'default'
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ thanh toán',
      PARTIAL: 'Thanh toán một phần',
      PAID: 'Đã thanh toán',
      OVERDUE: 'Quá hạn',
      VOIDED: 'Đã hủy'
    };
    return texts[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      CASH: 'Tiền mặt',
      BANK_TRANSFER: 'Chuyển khoản',
      CREDIT_CARD: 'Thẻ tín dụng',
      DEBIT_CARD: 'Thẻ ghi nợ',
      MOMO: 'Momo',
      VNPAY: 'VNPay'
    };
    return methods[method] || method;
  };

  // Service items table
  const serviceColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Dịch vụ',
      dataIndex: ['serviceId', 'name'],
      key: 'service'
    },
    {
      title: 'Danh mục',
      dataIndex: ['serviceId', 'category'],
      key: 'category',
      render: (cat) => <Tag>{cat}</Tag>
    },
    {
      title: 'Đơn giá',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      align: 'right',
      render: (record) => formatCurrency(record.price * record.quantity)
    }
  ];

  // Medication items table
  const medicationColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Thuốc',
      dataIndex: ['medicationId', 'name'],
      key: 'medication'
    },
    {
      title: 'Quy cách',
      dataIndex: ['medicationId', 'dosage'],
      key: 'dosage'
    },
    {
      title: 'Đơn giá',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      align: 'right',
      render: (price) => formatCurrency(price)
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center'
    },
    {
      title: 'Thành tiền',
      key: 'subtotal',
      align: 'right',
      render: (record) => formatCurrency(record.unitPrice * record.quantity)
    }
  ];

  // Payment history timeline
  const paymentTimelineItems = paymentHistory.map(payment => ({
    color: 'green',
    children: (
      <div>
        <Text strong>{formatCurrency(payment.amount)}</Text>
        <div>
          <Text type="secondary">
            {getPaymentMethodText(payment.paymentMethod)} - 
            {moment(payment.paymentDate).format('DD/MM/YYYY HH:mm')}
          </Text>
        </div>
        {payment.referenceNumber && (
          <div>
            <Text type="secondary">Mã GD: {payment.referenceNumber}</Text>
          </div>
        )}
        {payment.notes && (
          <div>
            <Text type="secondary">{payment.notes}</Text>
          </div>
        )}
      </div>
    )
  }));

  if (!bill) {
    return (
      <div style={{ padding: '24px' }}>
        <Card loading={loading}>
          <Title level={4}>Đang tải...</Title>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }} className="bill-detail-print">
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Chi tiết hóa đơn
            </Title>
            <Text type="secondary">Mã HĐ: {bill.billNumber}</Text>
          </Col>
          <Col>
            <Space className="no-print">
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                In hóa đơn
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadPDF}
              >
                Tải PDF
              </Button>
              {bill.status !== 'PAID' && bill.status !== 'VOIDED' && (
                <Button
                  type="primary"
                  icon={<DollarOutlined />}
                  onClick={() => navigate(`/admin/billing/list`)}
                >
                  Thanh toán
                </Button>
              )}
            </Space>
          </Col>
        </Row>

        {/* Header Info */}
        <Card style={{ marginBottom: 16, background: '#fafafa' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Trạng thái">
                  <Tag color={getStatusColor(bill.status)} style={{ fontSize: 14 }}>
                    {getStatusText(bill.status)}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {moment(bill.createdAt).format('DD/MM/YYYY HH:mm')}
                </Descriptions.Item>
                <Descriptions.Item label="Hạn thanh toán">
                  {bill.dueDate ? moment(bill.dueDate).format('DD/MM/YYYY') : 'Không giới hạn'}
                </Descriptions.Item>
              </Descriptions>
            </Col>
            <Col xs={24} md={12}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Bệnh nhân">
                  <Text strong>
                    {bill.patientId?.personalInfo?.firstName} {bill.patientId?.personalInfo?.lastName}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {bill.patientId?.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {bill.patientId?.address?.street}, {bill.patientId?.address?.city}
                </Descriptions.Item>
              </Descriptions>
            </Col>
          </Row>
        </Card>

        {/* Services */}
        {bill.services?.length > 0 && (
          <Card title="Dịch vụ khám" style={{ marginBottom: 16 }}>
            <Table
              columns={serviceColumns}
              dataSource={bill.services}
              pagination={false}
              rowKey={(record, index) => index}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                      <Text strong>Tổng dịch vụ:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>
                        {formatCurrency(
                          bill.services.reduce((sum, s) => sum + s.price * s.quantity, 0)
                        )}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        )}

        {/* Medications */}
        {bill.medications?.length > 0 && (
          <Card title="Thuốc" style={{ marginBottom: 16 }}>
            <Table
              columns={medicationColumns}
              dataSource={bill.medications}
              pagination={false}
              rowKey={(record, index) => index}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={5} align="right">
                      <Text strong>Tổng thuốc:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <Text strong>
                        {formatCurrency(
                          bill.medications.reduce((sum, m) => sum + m.unitPrice * m.quantity, 0)
                        )}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
            />
          </Card>
        )}

        {/* Payment Summary */}
        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="Lịch sử thanh toán" style={{ marginBottom: 16 }}>
              {paymentHistory.length > 0 ? (
                <Timeline items={paymentTimelineItems} />
              ) : (
                <Text type="secondary">Chưa có thanh toán</Text>
              )}
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Tổng kết thanh toán">
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Tổng tiền">
                  <Text strong>{formatCurrency(bill.subtotal)}</Text>
                </Descriptions.Item>
                
                {bill.discount > 0 && (
                  <Descriptions.Item label={`Giảm giá (${bill.discount}%)`}>
                    <Text type="danger">
                      - {formatCurrency((bill.subtotal * bill.discount) / 100)}
                    </Text>
                  </Descriptions.Item>
                )}

                {bill.insuranceCoverage > 0 && (
                  <Descriptions.Item label={`Bảo hiểm (${bill.insuranceCoverage}%)`}>
                    <Text type="success">
                      - {formatCurrency((bill.subtotal * bill.insuranceCoverage) / 100)}
                    </Text>
                  </Descriptions.Item>
                )}

                <Descriptions.Item label="Thành tiền">
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {formatCurrency(bill.finalAmount)}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Đã thanh toán">
                  <Text strong style={{ color: '#52c41a' }}>
                    {formatCurrency(bill.paidAmount)}
                  </Text>
                </Descriptions.Item>

                <Descriptions.Item label="Còn nợ">
                  <Text strong style={{ color: bill.finalAmount - bill.paidAmount > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {formatCurrency(bill.finalAmount - bill.paidAmount)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {bill.status === 'PAID' && (
                <div style={{ marginTop: 16, textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />
                  <div>
                    <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                      Đã thanh toán đầy đủ
                    </Text>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {bill.notes && (
          <Card title="Ghi chú" style={{ marginTop: 16 }}>
            <Text>{bill.notes}</Text>
          </Card>
        )}
      </Card>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .bill-detail-print {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BillDetail;
