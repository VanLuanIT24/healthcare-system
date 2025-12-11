// 💊 Dispensing Queue - Pharmacy prescription queue
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    EyeOutlined,
    MedicineBoxOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Avatar,
    Badge,
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    List,
    message,
    Modal,
    Row,
    Space,
    Statistic,
    Tag
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';
import prescriptionAPI from '../../services/api/prescriptionAPI';
import './Pharmacy.css';

const DispensingQueue = () => {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [detailModal, setDetailModal] = useState(false);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    loadQueue();
    loadStats();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(() => {
      loadQueue();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadQueue = async () => {
    try {
      setLoading(true);
      const response = await prescriptionAPI.getDispensingQueue();
      setQueue(response.data.queue || []);
    } catch (error) {
      message.error('Không thể tải hàng đợi xuất thuốc');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await prescriptionAPI.getDispensingStats();
      setStats(response.data || {});
    } catch (error) {
      console.error('Failed to load stats');
    }
  };

  const handleViewDetail = (prescription) => {
    setSelectedPrescription(prescription);
    setDetailModal(true);
  };

  const handleDispense = async (prescriptionId) => {
    try {
      await prescriptionAPI.dispenseMedication(prescriptionId);
      message.success('Đã xuất thuốc thành công');
      setDetailModal(false);
      loadQueue();
      loadStats();
    } catch (error) {
      message.error('Xuất thuốc thất bại');
    }
  };

  const handleConfirmDispense = (prescription) => {
    Modal.confirm({
      title: 'Xác nhận xuất thuốc',
      content: `Xác nhận đã chuẩn bị và xuất thuốc cho bệnh nhân ${prescription.patient?.fullName}?`,
      okText: 'Xác nhận',
      cancelText: 'Hủy',
      onOk: () => handleDispense(prescription._id),
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      emergency: 'red',
      urgent: 'orange',
      normal: 'default',
    };
    return colors[priority] || 'default';
  };

  return (
    <div className="page-container dispensing-queue-container">
      <PageHeader
        title="Hàng đợi xuất thuốc"
        subtitle="Quản lý đơn thuốc chờ xuất"
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Chờ xuất thuốc"
              value={stats.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Khẩn cấp"
              value={stats.emergency || 0}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đã xuất hôm nay"
              value={stats.dispensedToday || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Thời gian chờ TB"
              value={stats.avgWaitTime || 0}
              suffix="phút"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card>
        <List
          loading={loading}
          dataSource={queue}
          locale={{ emptyText: 'Không có đơn thuốc chờ xuất' }}
          renderItem={(item, index) => (
            <div
              className={`dispensing-queue-item ${
                item.priority === 'emergency'
                  ? 'emergency'
                  : item.priority === 'urgent'
                  ? 'priority'
                  : ''
              }`}
            >
              <div className="queue-header">
                <div className="queue-patient-info">
                  <Badge count={index + 1} style={{ backgroundColor: '#1890ff' }} />
                  <Avatar
                    src={item.patient?.profilePicture}
                    icon={<UserOutlined />}
                    size="large"
                  />
                  <div>
                    <h3 style={{ margin: 0 }}>{item.patient?.fullName}</h3>
                    <div className="queue-prescription-info">
                      <span>{item.prescriptionNumber}</span>
                      <Divider type="vertical" />
                      <span>{moment(item.createdAt).format('DD/MM/YYYY HH:mm')}</span>
                      <Divider type="vertical" />
                      <span>Thời gian chờ: {item.waitTime || 0} phút</span>
                    </div>
                  </div>
                </div>
                <Space>
                  <Tag color={getPriorityColor(item.priority)}>
                    {item.priority === 'emergency'
                      ? 'Khẩn cấp'
                      : item.priority === 'urgent'
                      ? 'Ưu tiên'
                      : 'Thường'}
                  </Tag>
                  <Tag color="blue">{item.medications?.length || 0} loại thuốc</Tag>
                </Space>
              </div>

              <div className="medication-dispense-list">
                {item.medications?.slice(0, 3).map((med, medIndex) => (
                  <div key={medIndex} className="medication-dispense-item">
                    <MedicineBoxOutlined style={{ color: '#1890ff' }} />
                    <span className="medication-dispense-name">
                      {med.medication?.name || med.name}
                    </span>
                    <span className="medication-dispense-quantity">
                      x{med.quantity}
                    </span>
                    <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                      {med.dosage} - {med.frequency}
                    </span>
                  </div>
                ))}
                {item.medications?.length > 3 && (
                  <div style={{ textAlign: 'center', color: '#8c8c8c', fontSize: 12 }}>
                    và {item.medications.length - 3} loại thuốc khác...
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <Space>
                  <Button
                    icon={<EyeOutlined />}
                    onClick={() => handleViewDetail(item)}
                  >
                    Chi tiết
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleConfirmDispense(item)}
                  >
                    Đã xuất thuốc
                  </Button>
                </Space>
              </div>
            </div>
          )}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đơn thuốc - ${selectedPrescription?.prescriptionNumber}`}
        open={detailModal}
        onCancel={() => setDetailModal(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setDetailModal(false)}>
            Đóng
          </Button>,
          <Button
            key="dispense"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleConfirmDispense(selectedPrescription)}
          >
            Đã xuất thuốc
          </Button>,
        ]}
      >
        {selectedPrescription && (
          <>
            <Descriptions column={2}>
              <Descriptions.Item label="Bệnh nhân" span={2}>
                <Space>
                  <Avatar src={selectedPrescription.patient?.profilePicture} icon={<UserOutlined />} />
                  <strong>{selectedPrescription.patient?.fullName}</strong>
                  <span style={{ color: '#8c8c8c' }}>
                    ({selectedPrescription.patient?.patientId})
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Bác sĩ kê đơn">
                {selectedPrescription.doctor?.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày kê đơn">
                {moment(selectedPrescription.createdAt).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Chẩn đoán" span={2}>
                {selectedPrescription.diagnosis}
              </Descriptions.Item>
            </Descriptions>

            <Divider>Danh sách thuốc</Divider>

            <div className="medication-list">
              {selectedPrescription.medications?.map((med, index) => (
                <div key={index} className="medication-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 16 }}>
                        {index + 1}. {med.medication?.name || med.name}
                      </strong>
                    </div>
                    <Tag color="blue">x{med.quantity}</Tag>
                  </div>
                  <div className="medication-details">
                    <div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>Liều dùng</div>
                      <div>{med.dosage}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>Tần suất</div>
                      <div>{med.frequency}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>Thời gian</div>
                      <div>{med.duration}</div>
                    </div>
                  </div>
                  {med.instructions && (
                    <div style={{ marginTop: 8, fontSize: 13, color: '#595959' }}>
                      <strong>Hướng dẫn:</strong> {med.instructions}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedPrescription.notes && (
              <>
                <Divider>Ghi chú</Divider>
                <div style={{ padding: 12, background: '#fafafa', borderRadius: 4 }}>
                  {selectedPrescription.notes}
                </div>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default DispensingQueue;
