// src/pages/doctor/Prescriptions.jsx - Quản lý đơn thuốc
import { useAuth } from '@/contexts/AuthContext';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  LoadingOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Empty,
  Modal,
  Space,
  Spin,
  Table,
  Tag,
  Form,
  Input,
  InputNumber,
  Select,
  DatePicker,
  Row,
  Col,
  Divider,
  message,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import DoctorLayout from '@/components/layout/doctor/DoctorLayout';
import prescriptionAPI from '@/services/api/prescriptionAPI';
import patientAPI from '@/services/api/patientAPI';
import medicationAPI from '@/services/api/medicationAPI';
import appointmentAPI from '@/services/api/appointmentAPI';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const Prescriptions = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [form] = Form.useForm();

  const [patients, setPatients] = useState([]);
  const [activePatients, setActivePatients] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingActivePatients, setLoadingActivePatients] = useState(false);

  // Load prescriptions from API
  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await prescriptionAPI.getPrescriptions({
        doctorId: user?._id,
        limit: 100
      });
      const data = res.data?.data || res.data?.items || res.data || [];
      setPrescriptions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      message.error('Lỗi tải danh sách đơn thuốc');
    } finally {
      setLoading(false);
    }
  };

  // Load patients for search
  const loadPatients = async (search = '') => {
    try {
      setLoadingPatients(true);
      const res = await patientAPI.searchPatients(search, { limit: 20 });
      const data = res.data?.data || res.data?.items || res.data || [];
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Load patients currently IN_PROGRESS
  const loadActivePatients = async () => {
    try {
      setLoadingActivePatients(true);
      const res = await appointmentAPI.getDoctorAppointments(user?._id, {
        status: 'IN_PROGRESS',
        limit: 50
      });
      const items = res.data?.data?.items || res.data?.items || res.data?.data || [];
      // Extract unique patients from appointments
      const activePats = items.map(apt => apt.patientId).filter(Boolean);
      setActivePatients(activePats);
    } catch (error) {
      console.error('Error loading active patients:', error);
      console.error('Error stack:', error.stack);
    } finally {
      setLoadingActivePatients(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      loadPrescriptions();
      loadPatients();
      loadActivePatients().catch(err => console.error('Silent catch for loadActivePatients:', err));
    }
  }, [user?._id]);

  // Handle incoming state from Appointments page
  useEffect(() => {
    if (location.state?.patientId) {
      const { patientId, patientName } = location.state;

      // We need to ensure patients are loaded or at least the specific patient is in the list
      // for the Select component to show the name correctly.
      // Since loadPatients is called on mount, we might need a small delay or a specialized call.

      setIsEditMode(false);
      setSelectedPrescription(null);
      form.setFieldsValue({
        patientId: patientId,
      });
      // Ensure the patient name is visible by adding them to the list temporary if not there
      if (patientName) {
        setPatients(prev => {
          if (prev.find(p => p.userId?._id === patientId || p.userId === patientId)) return prev;
          return [...prev, {
            _id: `temp-${patientId}`,
            userId: { _id: patientId, personalInfo: { firstName: patientName, lastName: '' } }
          }];
        });
      }
      setIsModalVisible(true);

      // Clear state to avoid re-opening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, form]);

  const handleCreateNew = () => {
    setIsEditMode(false);
    setSelectedPrescription(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setIsEditMode(true);
    setSelectedPrescription(record);

    // Fix: patientId might be a populated object, need to pass ID to Form
    const editData = {
      ...record,
      patientId: record.patientId?._id || record.patientId,
    };

    form.setFieldsValue(editData);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xóa đơn thuốc',
      content: 'Bạn chắc chắn muốn xóa đơn thuốc này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      async onOk() {
        try {
          await prescriptionAPI.cancelPrescription(id, 'Bác sĩ xóa đơn thuốc');
          message.success('Đã hủy đơn thuốc');
          loadPrescriptions();
        } catch (error) {
          message.error('Lỗi khi xóa đơn thuốc');
        }
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const prescriptionData = {
        ...values,
        // Format medicines if it's a string from TextArea (legacy UI support)
        // In a real app we'd use a dynamic form for medicines
        issueDate: dayjs(),
      };

      if (isEditMode) {
        await prescriptionAPI.updatePrescription(selectedPrescription._id, prescriptionData);
        message.success('Cập nhật đơn thuốc thành công');
      } else {
        await prescriptionAPI.createPrescription(prescriptionData);
        message.success('Kê đơn thuốc thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      loadPrescriptions();
    } catch (error) {
      console.error('Error saving prescription:', error);
      message.error(error.response?.data?.message || 'Lỗi khi lưu đơn thuốc');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên bệnh nhân',
      key: 'patientName',
      render: (_, record) => {
        const patient = record.patientId;
        if (patient && typeof patient === 'object') {
          const info = patient.personalInfo || {};
          if (info.firstName) return `${info.firstName} ${info.lastName}`;
        }
        return record.patientName || (typeof patient === 'string' ? patient : 'N/A');
      },
      width: 150,
    },
    {
      title: 'Số lượng thuốc',
      dataIndex: 'medicines',
      key: 'medicineCount',
      render: (medicines) => (
        <Tag color="blue">{medicines?.length || 0} loại</Tag>
      ),
      width: 120,
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      render: (notes) => notes || '-',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          ACTIVE: { color: 'green', label: 'Đang hoạt động' },
          COMPLETED: { color: 'blue', label: 'Hoàn thành' },
          CANCELLED: { color: 'red', label: 'Đã hủy' },
          DISPENSED: { color: 'purple', label: 'Đã phát thuốc' },
          EXPIRED: { color: 'orange', label: 'Hết hạn' },
          DRAFT: { color: 'default', label: 'Nháp' },
        };
        const config = statusMap[status?.toUpperCase()] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'issueDate',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
      width: 140,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleEdit(record)}
          >
            Chi tiết
          </Button>
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <DoctorLayout>
      <div
        style={{
          padding: '24px',
          maxWidth: '1200px',
          margin: '0 auto',
          backgroundColor: '#f5f5f5',
          minHeight: '100vh',
        }}
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              marginBottom: '24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              padding: '24px',
              borderRadius: '12px',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>
                💊 Quản lý đơn thuốc
              </h1>
              <p style={{ margin: '8px 0 0 0', opacity: 0.9 }}>
                Tổng {prescriptions.length} đơn thuốc
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={handleCreateNew}
              style={{
                backgroundColor: 'white',
                color: '#667eea',
                border: 'none',
                fontWeight: 600,
              }}
            >
              Kê đơn mới
            </Button>
          </div>
        </motion.div>

        {/* Prescriptions Table */}
        <Card style={{ borderRadius: '8px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
              />
              <div style={{ marginTop: '16px', color: '#1890ff' }}>
                Đang tải đơn thuốc...
              </div>
            </div>
          ) : prescriptions.length === 0 ? (
            <Empty
              description="Chưa có đơn thuốc"
              style={{ padding: '40px' }}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={prescriptions.map((p) => ({
                ...p,
                key: p._id,
              }))}
              pagination={{ pageSize: 10 }}
              scroll={{ x: 1000 }}
            />
          )}
        </Card>

        {/* Modal: Create/Edit Prescription */}
        <Modal
          title={
            isEditMode
              ? '✏️ Chỉnh sửa đơn thuốc'
              : '➕ Kê đơn thuốc mới'
          }
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          width={700}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Hủy
            </Button>,
            <Button
              key="submit"
              type="primary"
              onClick={() => form.submit()}
            >
              {isEditMode ? 'Cập nhật' : 'Kê đơn'}
            </Button>,
          ]}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            {/* Patient Info */}
            <Form.Item
              label="Bệnh nhân"
              name="patientId"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn bệnh nhân',
                },
              ]}
            >
              <Select
                showSearch
                placeholder="Tìm bệnh nhân theo tên hoặc số điện thoại"
                filterOption={false}
                onSearch={loadPatients}
                loading={loadingPatients || loadingActivePatients}
                notFoundContent={loadingPatients ? <Spin size="small" /> : 'Không tìm thấy bệnh nhân'}
              >
                {activePatients.length > 0 && (
                  <Select.OptGroup label="Bệnh nhân đang khám">
                    {activePatients.map((p) => {
                      const u = p?.userId || p;
                      const info = u?.personalInfo || p?.personalInfo || {};
                      const userId = u?._id || p?._id;
                      if (!userId) return null;
                      return (
                        <Select.Option key={`active-${userId}`} value={userId}>
                          {info.firstName || 'Bệnh nhân'} {info.lastName || ''} - {info.phone || 'Không có SĐT'} (Đang khám)
                        </Select.Option>
                      );
                    })}
                  </Select.OptGroup>
                )}

                <Select.OptGroup label="Tất cả bệnh nhân">
                  {patients.map((p) => {
                    const u = p.userId || {};
                    const info = u.personalInfo || p.personalInfo || {};
                    const userId = u._id || p.userId || p._id;

                    return (
                      <Select.Option key={p._id} value={userId}>
                        {info.firstName || 'Unknown'} {info.lastName || ''} - {info.phone || 'No phone'}
                      </Select.Option>
                    );
                  })}
                </Select.OptGroup>
              </Select>
            </Form.Item>

            <Divider>Thông tin thuốc</Divider>

            {/* Medicines */}
            <Form.Item
              label="Danh sách thuốc"
              name="medicines"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng thêm thuốc',
                },
              ]}
            >
              <Input.TextArea
                placeholder="Ví dụ: Paracetamol 500mg, 3 lần/ngày, 5 ngày&#10;Vitamin C 1000mg, 1 lần/ngày, 10 ngày"
                rows={4}
              />
            </Form.Item>

            <Form.Item
              label="Ghi chú"
              name="notes"
            >
              <Input.TextArea
                placeholder="Ghi chú thêm (ví dụ: uống sau ăn, tránh thực phẩm nào...)"
                rows={3}
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái"
              name="status"
              initialValue="active"
            >
              <Select
                options={[
                  { label: '✅ Đang sử dụng', value: 'active' },
                  { label: '✓ Hoàn thành', value: 'completed' },
                  { label: '✕ Hủy', value: 'cancelled' },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </DoctorLayout>
  );
};

export default Prescriptions;
