// 🔬 Enhanced Laboratory Management với Full Workflow
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExperimentOutlined,
    EyeOutlined,
    FileTextOutlined,
    PlusOutlined,
    SearchOutlined,
    SyncOutlined
} from '@ant-design/icons';
import {
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Drawer,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Statistic,
    Steps,
    Table,
    Tag
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import laboratoryAPI from '../../services/api/laboratoryAPI';
import patientAPI from '../../services/api/patientAPI';
import designSystem from '../../theme/designSystem';
import './Laboratory.css';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Step } = Steps;
const { colors } = designSystem;

const LabOrderListEnhanced = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
  });
  const [stats, setStats] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [patients, setPatients] = useState([]);
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();
  const navigate = useNavigate();

  const testTypes = [
    { value: 'BLOOD_TEST', label: 'Xét nghiệm máu', icon: '🩸' },
    { value: 'URINE_TEST', label: 'Xét nghiệm nước tiểu', icon: '💧' },
    { value: 'XRAY', label: 'Chụp X-quang', icon: '📷' },
    { value: 'CT_SCAN', label: 'Chụp CT', icon: '🔬' },
    { value: 'MRI', label: 'Chụp MRI', icon: '🧲' },
    { value: 'ULTRASOUND', label: 'Siêu âm', icon: '📡' },
    { value: 'ECG', label: 'Điện tâm đồ', icon: '💓' },
    { value: 'OTHER', label: 'Khác', icon: '🧪' },
  ];

  useEffect(() => {
    loadOrders();
    loadStats();
    loadPatients();
  }, [pagination.current, pagination.pageSize, filters]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        ...filters,
      };
      const response = await laboratoryAPI.getLabOrders(params);
      setOrders(response.data?.orders || response.data?.data || []);
      setPagination({
        ...pagination,
        total: response.data?.total || response.data?.pagination?.total || 0,
      });
    } catch (error) {
      message.error('Không thể tải danh sách xét nghiệm');
      console.error('Load orders error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await laboratoryAPI.getLabStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load lab stats');
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientAPI.searchPatients({ limit: 100, status: 'ACTIVE' });
      setPatients(response.data?.patients || []);
    } catch (error) {
      console.error('Failed to load patients');
    }
  };

  const handleCreateOrder = async (values) => {
    try {
      await laboratoryAPI.orderLabTest(values.patientId, {
        tests: values.tests.map((test) => ({
          testType: test.testType,
          testName: testTypes.find((t) => t.value === test.testType)?.label,
          priority: values.priority || 'ROUTINE',
        })),
        clinicalNotes: values.clinicalNotes,
      });
      message.success('Tạo phiếu xét nghiệm thành công');
      setCreateModalVisible(false);
      form.resetFields();
      loadOrders();
      loadStats();
    } catch (error) {
      message.error(error.response?.data?.message || 'Tạo phiếu xét nghiệm thất bại');
    }
  };

  const handleCollectSample = async (orderId, testId) => {
    try {
      await laboratoryAPI.markSampleCollected(orderId, testId);
      message.success('Đã xác nhận lấy mẫu');
      loadOrders();
    } catch (error) {
      message.error('Xác nhận lấy mẫu thất bại');
    }
  };

  const handleStartTest = async (orderId, testId) => {
    try {
      await laboratoryAPI.markTestInProgress(orderId, testId);
      message.success('Đã bắt đầu xét nghiệm');
      loadOrders();
    } catch (error) {
      message.error('Thao tác thất bại');
    }
  };

  const handleRecordResult = async (values) => {
    try {
      await laboratoryAPI.recordLabResult(selectedOrder._id, {
        testId: values.testId,
        result: values.result,
        unit: values.unit,
        referenceRange: values.referenceRange,
        notes: values.notes,
      });
      message.success('Đã ghi nhận kết quả');
      setResultModalVisible(false);
      resultForm.resetFields();
      loadOrders();
    } catch (error) {
      message.error('Ghi nhận kết quả thất bại');
    }
  };

  const handleApproveResult = (orderId, testId) => {
    Modal.confirm({
      title: 'Phê duyệt kết quả',
      content: 'Xác nhận phê duyệt kết quả xét nghiệm này?',
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await laboratoryAPI.approveLabResult(orderId, testId);
          message.success('Đã phê duyệt kết quả');
          loadOrders();
        } catch (error) {
          message.error('Phê duyệt thất bại');
        }
      },
    });
  };

  const handleCancelOrder = (orderId) => {
    Modal.confirm({
      title: 'Hủy phiếu xét nghiệm',
      content: 'Bạn có chắc chắn muốn hủy phiếu xét nghiệm này?',
      okText: 'Hủy phiếu',
      okType: 'danger',
      cancelText: 'Đóng',
      onOk: async () => {
        try {
          await laboratoryAPI.cancelLabOrder(orderId);
          message.success('Đã hủy phiếu xét nghiệm');
          loadOrders();
        } catch (error) {
          message.error('Hủy phiếu thất bại');
        }
      },
    });
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await laboratoryAPI.getLabOrder(orderId);
      setSelectedOrder(response.data);
      setDrawerVisible(true);
    } catch (error) {
      message.error('Không thể tải thông tin phiếu xét nghiệm');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: 'orange',
      SAMPLE_COLLECTED: 'blue',
      IN_PROGRESS: 'purple',
      COMPLETED: 'green',
      CANCELLED: 'red',
    };
    return colors[status] || 'default';
  };

  const getStatusText = (status) => {
    const texts = {
      PENDING: 'Chờ lấy mẫu',
      SAMPLE_COLLECTED: 'Đã lấy mẫu',
      IN_PROGRESS: 'Đang xét nghiệm',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
    };
    return texts[status] || status;
  };

  const getTestStatusStep = (status) => {
    const steps = {
      PENDING: 0,
      SAMPLE_COLLECTED: 1,
      IN_PROGRESS: 2,
      COMPLETED: 3,
    };
    return steps[status] || 0;
  };

  const columns = [
    {
      title: 'Mã phiếu',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 130,
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: 'Bệnh nhân',
      key: 'patient',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.patient?.fullName}</div>
          <div style={{ fontSize: 12, color: colors.text.secondary }}>
            {record.patient?.patientId}
          </div>
        </div>
      ),
    },
    {
      title: 'Xét nghiệm',
      dataIndex: 'tests',
      key: 'tests',
      width: 250,
      render: (tests) => (
        <div>
          {tests?.slice(0, 2).map((test, index) => (
            <div key={index} style={{ marginBottom: 4 }}>
              <Tag>{test.testName}</Tag>
            </div>
          ))}
          {tests?.length > 2 && (
            <Tag color="blue">+{tests.length - 2} xét nghiệm khác</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Bác sĩ chỉ định',
      dataIndex: ['orderedBy', 'fullName'],
      key: 'orderedBy',
      width: 150,
    },
    {
      title: 'Ngày chỉ định',
      dataIndex: 'orderDate',
      key: 'orderDate',
      width: 120,
      render: (date) => moment(date).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.orderDate).unix() - moment(b.orderDate).unix(),
    },
    {
      title: 'Mức ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      width: 120,
      render: (priority) => {
        const priorityConfig = {
          URGENT: { color: 'red', text: 'Khẩn cấp' },
          STAT: { color: 'orange', text: 'Ưu tiên' },
          ROUTINE: { color: 'default', text: 'Thường' },
        };
        const config = priorityConfig[priority] || priorityConfig.ROUTINE;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => (
        <Badge status={status === 'COMPLETED' ? 'success' : 'processing'} text={getStatusText(status)} />
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record._id)}
          >
            Chi tiết
          </Button>
          {record.status !== 'CANCELLED' && record.status !== 'COMPLETED' && (
            <Button
              type="link"
              size="small"
              danger
              onClick={() => handleCancelOrder(record._id)}
            >
              Hủy
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container fadeIn">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <ExperimentOutlined style={{ marginRight: 12, color: colors.primary[500] }} />
            Quản lý xét nghiệm
          </h1>
          <p className="dashboard-subtitle">Phiếu chỉ định và kết quả xét nghiệm</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)} size="large">
          Tạo phiếu xét nghiệm
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} className="staggered-cards">
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Chờ lấy mẫu</span>}
              value={stats.pending || 0}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.info[500]}, ${colors.info[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đang xét nghiệm</span>}
              value={stats.inProgress || 0}
              prefix={<SyncOutlined spin style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Hoàn thành hôm nay</span>}
              value={stats.completedToday || 0}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
            <Statistic
              title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng phiếu</span>}
              value={stats.totalOrders || 0}
              prefix={<FileTextOutlined style={{ color: 'white' }} />}
              valueStyle={{ color: 'white' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card variant="borderless" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={10}>
            <Search
              placeholder="Tìm theo mã phiếu, tên bệnh nhân..."
              allowClear
              enterButton
              onSearch={(value) => {
                setFilters({ ...filters, search: value });
                setPagination({ ...pagination, current: 1 });
              }}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Trạng thái"
              allowClear
              onChange={(value) => setFilters({ ...filters, status: value || '' })}
            >
              <Option value="PENDING">Chờ lấy mẫu</Option>
              <Option value="SAMPLE_COLLECTED">Đã lấy mẫu</Option>
              <Option value="IN_PROGRESS">Đang xét nghiệm</Option>
              <Option value="COMPLETED">Hoàn thành</Option>
            </Select>
          </Col>
          <Col xs={12} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Mức ưu tiên"
              allowClear
              onChange={(value) => setFilters({ ...filters, priority: value || '' })}
            >
              <Option value="URGENT">Khẩn cấp</Option>
              <Option value="STAT">Ưu tiên</Option>
              <Option value="ROUTINE">Thường</Option>
            </Select>
          </Col>
          <Col xs={24} md={4}>
            <Button onClick={loadOrders} loading={loading} block>
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Orders Table */}
      <Card variant="borderless">
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          rowKey="_id"
          scroll={{ x: 1300 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng số ${total} phiếu xét nghiệm`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>

      {/* Create Order Modal */}
      <Modal
        title="Tạo phiếu xét nghiệm"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleCreateOrder}>
          <Form.Item
            label="Bệnh nhân"
            name="patientId"
            rules={[{ required: true, message: 'Vui lòng chọn bệnh nhân' }]}
          >
            <Select
              showSearch
              placeholder="Chọn bệnh nhân"
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {patients.map((patient) => (
                <Option key={patient._id} value={patient._id}>
                  {patient.fullName} - {patient.patientId}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Mức ưu tiên" name="priority" initialValue="ROUTINE">
            <Select>
              <Option value="URGENT">Khẩn cấp</Option>
              <Option value="STAT">Ưu tiên</Option>
              <Option value="ROUTINE">Thường</Option>
            </Select>
          </Form.Item>

          <Form.List
            name="tests"
            rules={[
              {
                validator: async (_, tests) => {
                  if (!tests || tests.length < 1) {
                    return Promise.reject(new Error('Vui lòng chọn ít nhất 1 xét nghiệm'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map((field, index) => (
                  <Form.Item
                    label={index === 0 ? 'Xét nghiệm' : ''}
                    required={false}
                    key={field.key}
                  >
                    <Space style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'testType']}
                        rules={[{ required: true, message: 'Chọn loại xét nghiệm' }]}
                        noStyle
                      >
                        <Select placeholder="Chọn xét nghiệm" style={{ width: 250 }}>
                          {testTypes.map((test) => (
                            <Option key={test.value} value={test.value}>
                              {test.icon} {test.label}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Button danger onClick={() => remove(field.name)}>
                        Xóa
                      </Button>
                    </Space>
                  </Form.Item>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Thêm xét nghiệm
                  </Button>
                  <Form.ErrorList errors={errors} />
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item label="Ghi chú lâm sàng" name="clinicalNotes">
            <TextArea rows={3} placeholder="Ghi chú cho kỹ thuật viên..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Tạo phiếu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Order Details Drawer */}
      <Drawer
        title="Chi tiết phiếu xét nghiệm"
        placement="right"
        width={700}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedOrder && (
          <div>
            <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Mã phiếu">
                <Tag color="blue">{selectedOrder.orderId}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Bệnh nhân">
                {selectedOrder.patient?.fullName} ({selectedOrder.patient?.patientId})
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ chỉ định">
                {selectedOrder.orderedBy?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày chỉ định">
                {moment(selectedOrder.orderDate).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Mức ưu tiên">
                <Tag color={selectedOrder.priority === 'URGENT' ? 'red' : 'default'}>
                  {selectedOrder.priority === 'URGENT' ? 'Khẩn cấp' : selectedOrder.priority === 'STAT' ? 'Ưu tiên' : 'Thường'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                <Badge
                  status={selectedOrder.status === 'COMPLETED' ? 'success' : 'processing'}
                  text={getStatusText(selectedOrder.status)}
                />
              </Descriptions.Item>
            </Descriptions>

            <Divider>Danh sách xét nghiệm</Divider>

            {selectedOrder.tests?.map((test, index) => (
              <Card
                key={index}
                size="small"
                style={{ marginBottom: 16 }}
                title={
                  <Space>
                    <span>{test.testName}</span>
                    <Tag color={getStatusColor(test.status)}>{getStatusText(test.status)}</Tag>
                  </Space>
                }
              >
                <Steps current={getTestStatusStep(test.status)} size="small">
                  <Step title="Chờ lấy mẫu" icon={<ClockCircleOutlined />} />
                  <Step title="Đã lấy mẫu" icon={<CheckCircleOutlined />} />
                  <Step title="Đang xét nghiệm" icon={<SyncOutlined />} />
                  <Step title="Hoàn thành" icon={<CheckCircleOutlined />} />
                </Steps>

                {test.result && (
                  <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                    <strong>Kết quả:</strong> {test.result} {test.unit}
                    {test.referenceRange && (
                      <div style={{ fontSize: 12, color: colors.text.secondary, marginTop: 4 }}>
                        Giá trị tham chiếu: {test.referenceRange}
                      </div>
                    )}
                    {test.notes && (
                      <div style={{ marginTop: 8, fontSize: 12 }}>
                        <strong>Ghi chú:</strong> {test.notes}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: 16 }}>
                  <Space>
                    {test.status === 'PENDING' && (
                      <Button
                        size="small"
                        onClick={() => handleCollectSample(selectedOrder._id, test._id)}
                      >
                        Xác nhận lấy mẫu
                      </Button>
                    )}
                    {test.status === 'SAMPLE_COLLECTED' && (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleStartTest(selectedOrder._id, test._id)}
                      >
                        Bắt đầu xét nghiệm
                      </Button>
                    )}
                    {test.status === 'IN_PROGRESS' && !test.result && (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          setResultModalVisible(true);
                          resultForm.setFieldsValue({ testId: test._id });
                        }}
                      >
                        Ghi nhận kết quả
                      </Button>
                    )}
                    {test.result && test.status !== 'APPROVED' && (
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => handleApproveResult(selectedOrder._id, test._id)}
                      >
                        Phê duyệt kết quả
                      </Button>
                    )}
                  </Space>
                </div>
              </Card>
            ))}

            {selectedOrder.clinicalNotes && (
              <>
                <Divider>Ghi chú lâm sàng</Divider>
                <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  {selectedOrder.clinicalNotes}
                </div>
              </>
            )}
          </div>
        )}
      </Drawer>

      {/* Record Result Modal */}
      <Modal
        title="Ghi nhận kết quả xét nghiệm"
        open={resultModalVisible}
        onCancel={() => {
          setResultModalVisible(false);
          resultForm.resetFields();
        }}
        footer={null}
      >
        <Form form={resultForm} layout="vertical" onFinish={handleRecordResult}>
          <Form.Item name="testId" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            label="Kết quả"
            name="result"
            rules={[{ required: true, message: 'Vui lòng nhập kết quả' }]}
          >
            <Input placeholder="Nhập kết quả xét nghiệm" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Đơn vị" name="unit">
                <Input placeholder="mg/dL, mmol/L..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá trị tham chiếu" name="referenceRange">
                <Input placeholder="0-100" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Ghi chú" name="notes">
            <TextArea rows={3} placeholder="Ghi chú về kết quả..." />
          </Form.Item>

          <Form.Item>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setResultModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Ghi nhận
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LabOrderListEnhanced;
