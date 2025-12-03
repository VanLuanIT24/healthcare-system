import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Form,
    Input,
    message,
    Modal,
    Row,
    Space,
    Statistic,
    Table,
    Tag,
    Typography
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pharmacyApi } from '../../../services/adminApi';

const { Title, Text } = Typography;
const { TextArea } = Input;

const PendingPrescriptions = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    dispensedToday: 0,
    lowStockWarnings: 0
  });
  const [dispenseModal, setDispenseModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPendingPrescriptions();
    fetchStats();
  }, []);

  const fetchPendingPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await pharmacyApi.getPending();
      setPrescriptions(response.prescriptions || []);
    } catch (error) {
      console.error('Fetch prescriptions error:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        setPrescriptions(getMockPrescriptions());
      } else {
        message.error('Không thể tải danh sách đơn thuốc');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await pharmacyApi.getStats();
      setStats(response);
    } catch (error) {
      console.error('Fetch stats error:', error);
      if (error.response?.status === 401 || error.response?.status === 404) {
        setStats({ pending: 8, dispensedToday: 15, lowStockWarnings: 3 });
      }
    }
  };

  const getMockPrescriptions = () => [
    {
      _id: '1',
      prescriptionCode: 'RX001',
      patientId: { personalInfo: { firstName: 'Nguyễn', lastName: 'Văn A' } },
      doctorId: { personalInfo: { firstName: 'BS. Trần', lastName: 'Văn B' } },
      medications: [
        { medicationId: { name: 'Paracetamol 500mg', quantity: 100 }, quantity: 20, dosage: '1 viên x 3 lần/ngày' }
      ],
      status: 'PENDING',
      createdAt: '2025-11-27'
    },
    {
      _id: '2',
      prescriptionCode: 'RX002',
      patientId: { personalInfo: { firstName: 'Trần', lastName: 'Thị C' } },
      doctorId: { personalInfo: { firstName: 'BS. Lê', lastName: 'Thị D' } },
      medications: [
        { medicationId: { name: 'Amoxicillin 500mg', quantity: 50 }, quantity: 15, dosage: '1 viên x 2 lần/ngày' }
      ],
      status: 'PENDING',
      createdAt: '2025-11-27'
    }
  ];

  const handleDispense = (prescription) => {
    // Check stock availability
    const lowStock = prescription.medications.filter(med => {
      return med.medicationId.quantity < med.quantity;
    });

    if (lowStock.length > 0) {
      Modal.warning({
        title: 'Cảnh báo tồn kho',
        content: (
          <div>
            <p>Một số thuốc không đủ số lượng trong kho:</p>
            <ul>
              {lowStock.map((med, idx) => (
                <li key={idx}>
                  <Text strong>{med.medicationId.name}</Text>: 
                  Cần <Text type="danger">{med.quantity}</Text>, 
                  Còn <Text type="warning">{med.medicationId.quantity}</Text>
                </li>
              ))}
            </ul>
          </div>
        )
      });
      return;
    }

    setSelectedPrescription(prescription);
    form.setFieldsValue({
      dispensedBy: localStorage.getItem('userName') || 'Dược sĩ'
    });
    setDispenseModal(true);
  };

  const processDispense = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_BASE_URL}/prescriptions/${selectedPrescription._id}/dispense`,
        {
          dispensedBy: values.dispensedBy,
          notes: values.notes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      message.success('Đã cấp thuốc thành công!');
      setDispenseModal(false);
      form.resetFields();
      fetchPendingPrescriptions();
      fetchStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Không thể cấp thuốc');
    }
  };

  const viewDetail = (prescription) => {
    setSelectedPrescription(prescription);
    setDetailModal(true);
  };

  const columns = [
    {
      title: 'Mã đơn',
      dataIndex: 'prescriptionNumber',
      key: 'prescriptionNumber',
      render: (text) => <Text strong style={{ color: '#1890ff' }}>{text}</Text>
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      render: (record) => (
        <div>
          <div>
            <Text strong>
              {record.patientId?.personalInfo?.firstName} {record.patientId?.personalInfo?.lastName}
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.patientId?.phone}
          </Text>
        </div>
      )
    },
    {
      title: 'Bác sĩ kê đơn',
      key: 'doctor',
      render: (record) => (
        <div>
          <div>
            {record.doctorId?.personalInfo?.firstName} {record.doctorId?.personalInfo?.lastName}
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.doctorId?.professionalInfo?.department}
          </Text>
        </div>
      )
    },
    {
      title: 'Số loại thuốc',
      dataIndex: 'medications',
      key: 'medicationCount',
      align: 'center',
      render: (medications) => (
        <Badge count={medications?.length || 0} showZero color="#1890ff" />
      )
    },
    {
      title: 'Ngày kê đơn',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix()
    },
    {
      title: 'Tình trạng kho',
      key: 'stockStatus',
      render: (record) => {
        const lowStock = record.medications.filter(med => 
          med.medicationId.quantity < med.quantity
        );
        
        if (lowStock.length > 0) {
          return (
            <Tag color="error" icon={<ExclamationCircleOutlined />}>
              Thiếu {lowStock.length} thuốc
            </Tag>
          );
        }
        
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Đủ hàng
          </Tag>
        );
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color="warning" icon={<ClockCircleOutlined />}>
          Chờ cấp thuốc
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => viewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleDispense(record)}
          >
            Cấp thuốc
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              Đơn thuốc chờ cấp
            </Title>
          </Col>
          <Col>
            <Button onClick={() => navigate('/admin/pharmacy/dashboard')}>
              Quay lại Kho thuốc
            </Button>
          </Col>
        </Row>

        {/* Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đơn thuốc chờ cấp"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Đã cấp hôm nay"
                value={stats.dispensedToday}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Cảnh báo thiếu hàng"
                value={stats.lowStockWarnings}
                prefix={<ExclamationCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={prescriptions}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1400 }}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} đơn thuốc`
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đơn thuốc ${selectedPrescription?.prescriptionNumber}`}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>,
          <Button
            key="dispense"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => {
              setDetailModal(false);
              handleDispense(selectedPrescription);
            }}
          >
            Cấp thuốc
          </Button>
        ]}
        width={800}
      >
        {selectedPrescription && (
          <>
            <Descriptions bordered column={2} style={{ marginBottom: 16 }}>
              <Descriptions.Item label="Bệnh nhân" span={2}>
                <Text strong>
                  {selectedPrescription.patientId?.personalInfo?.firstName}{' '}
                  {selectedPrescription.patientId?.personalInfo?.lastName}
                </Text>
                <Text type="secondary" style={{ marginLeft: 16 }}>
                  {selectedPrescription.patientId?.phone}
                </Text>
              </Descriptions.Item>
              
              <Descriptions.Item label="Bác sĩ">
                {selectedPrescription.doctorId?.personalInfo?.firstName}{' '}
                {selectedPrescription.doctorId?.personalInfo?.lastName}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày kê đơn">
                {moment(selectedPrescription.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>

              <Descriptions.Item label="Chẩn đoán" span={2}>
                {selectedPrescription.diagnosis || 'Không có'}
              </Descriptions.Item>

              <Descriptions.Item label="Ghi chú" span={2}>
                {selectedPrescription.notes || 'Không có'}
              </Descriptions.Item>
            </Descriptions>

            <Title level={5}>Danh sách thuốc:</Title>
            <Table
              columns={[
                {
                  title: 'Thuốc',
                  dataIndex: ['medicationId', 'name'],
                  key: 'name'
                },
                {
                  title: 'Liều dùng',
                  dataIndex: 'dosage',
                  key: 'dosage'
                },
                {
                  title: 'Tần suất',
                  dataIndex: 'frequency',
                  key: 'frequency'
                },
                {
                  title: 'Số lượng',
                  dataIndex: 'quantity',
                  key: 'quantity',
                  align: 'center'
                },
                {
                  title: 'Tồn kho',
                  key: 'stock',
                  render: (record) => {
                    const inStock = record.medicationId.quantity;
                    const needed = record.quantity;
                    const isEnough = inStock >= needed;
                    
                    return (
                      <Tag color={isEnough ? 'success' : 'error'}>
                        {inStock} / {needed}
                      </Tag>
                    );
                  }
                },
                {
                  title: 'Hướng dẫn',
                  dataIndex: 'instructions',
                  key: 'instructions'
                }
              ]}
              dataSource={selectedPrescription.medications}
              pagination={false}
              rowKey={(record, index) => index}
              size="small"
            />
          </>
        )}
      </Modal>

      {/* Dispense Modal */}
      <Modal
        title="Xác nhận cấp thuốc"
        open={dispenseModal}
        onCancel={() => {
          setDispenseModal(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={processDispense}
        >
          <Form.Item label="Đơn thuốc">
            <Input value={selectedPrescription?.prescriptionNumber} disabled />
          </Form.Item>

          <Form.Item label="Bệnh nhân">
            <Input
              value={
                selectedPrescription
                  ? `${selectedPrescription.patientId?.personalInfo?.firstName} ${selectedPrescription.patientId?.personalInfo?.lastName}`
                  : ''
              }
              disabled
            />
          </Form.Item>

          <Form.Item
            name="dispensedBy"
            label="Người cấp thuốc"
            rules={[{ required: true, message: 'Vui lòng nhập tên người cấp thuốc' }]}
          >
            <Input placeholder="Tên dược sĩ" />
          </Form.Item>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Ghi chú về việc cấp thuốc..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setDispenseModal(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" icon={<CheckCircleOutlined />}>
                Xác nhận cấp thuốc
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PendingPrescriptions;
