// src/pages/admin/consultations/CreateConsultation.jsx - Tạo phiên tư vấn mới
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeftOutlined, PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Space,
  Spin,
  message,
} from 'antd';
import CustomSelect from '@/components/common/CustomSelect/CustomSelect';

import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AdminLayout from '@/components/layout/admin/AdminLayout';
import clinicalAPI from '@/services/api/clinicalAPI';
import patientAPI from '@/services/api/patientAPI';
import { doctorAPI } from '@/services/api/doctorAPI';

const CreateConsultation = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);

  // Load patients on component mount
  const loadPatients = async (search = '') => {
    try {
      setLoadingPatients(true);
      const res = await patientAPI.searchPatients(search, { limit: 50 });
      const data = res.data?.data || [];
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoadingPatients(false);
    }
  };

  // Load doctors on component mount
  const loadDoctors = async (search = '') => {
    try {
      setLoadingDoctors(true);
      const res = await doctorAPI.getDoctors({
        search,
        limit: 50,
      });
      const data = res.data?.data || [];
      setDoctors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Validate required fields
      if (!values.patientId) {
        message.error('Vui lòng chọn khách hàng');
        setLoading(false);
        return;
      }

      if (!values.doctorId) {
        message.error('Vui lòng chọn nhân viên hỗ trợ');
        setLoading(false);
        return;
      }

      const consultationData = {
        diagnosis: values.diagnosis || '',
        symptoms: values.symptoms ? values.symptoms.split('\n').filter(s => s.trim()) : [],
        physicalExam: values.physicalExam ? JSON.parse(values.physicalExam) : {},
        notes: values.notes || '',
        consultationType: values.consultationType || 'GENERAL',
        priority: values.priority || 'NORMAL',
        status: values.status || 'PENDING',
      };

      console.log('Creating consultation for patient:', values.patientId);
      console.log('Consultation data:', consultationData);

      // Call API to create consultation
      const res = await clinicalAPI.createConsultation(values.patientId, consultationData);

      if (res.data?.success || res.status === 201) {
        message.success('Tạo yêu cầu tư vấn thành công!');
        navigate('/admin/consultations');
      } else {
        message.error('Lỗi tạo yêu cầu tư vấn');
      }
    } catch (error) {
      console.error('Error creating consultation:', error);
      message.error(error?.response?.data?.message || 'Lỗi tạo yêu cầu tư vấn');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
              ➕ Tạo yêu cầu tư vấn mới
            </h1>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/admin/consultations')}
            >
              Quay lại
            </Button>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card style={{ borderRadius: '8px' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              autoComplete="off"
            >
              {/* Bệnh nhân và Bác sĩ */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Khách hàng"
                    name="patientId"
                    rules={[
                      { required: true, message: 'Vui lòng chọn khách hàng' },
                    ]}
                  >
                    <CustomSelect
                      showSearch
                      placeholder="Tìm khách hàng"
                      onSearch={loadPatients}
                      loading={loadingPatients}
                      options={patients.map((p) => {
                        const info = p.personalInfo || {};
                        const userId = p.userId?._id || p._id;
                        return {
                          label: `${info.firstName || ''} ${info.lastName || ''} - ${info.phone || ''}`,
                          value: userId
                        };
                      })}
                    />

                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Nhân viên hỗ trợ"
                    name="doctorId"
                    rules={[
                      { required: true, message: 'Vui lòng chọn nhân viên hỗ trợ' },
                    ]}
                  >
                    <CustomSelect
                      showSearch
                      placeholder="Tìm nhân viên hỗ trợ"
                      onSearch={loadDoctors}
                      loading={loadingDoctors}
                      options={doctors.map((d) => {
                        const info = d.personalInfo || {};
                        const userId = d.userId?._id || d._id;
                        return {
                          label: `${info.firstName || ''} ${info.lastName || ''} - ${d.specialty || 'N/A'}`,
                          value: userId
                        };
                      })}
                    />

                  </Form.Item>
                </Col>
              </Row>

              <Divider>Thông tin yêu cầu tư vấn</Divider>

              {/* Loại tư vấn */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Loại yêu cầu"
                    name="consultationType"
                    initialValue="GENERAL"
                  >
                    <CustomSelect
                      options={[
                        { label: 'Tư vấn thông thường', value: 'GENERAL' },
                        { label: 'Tư vấn khẩn cấp', value: 'EMERGENCY' },
                        { label: 'Tư vấn theo yêu cầu', value: 'FOLLOW_UP' },
                        { label: 'Tư vấn chuyên biệt', value: 'SPECIALIST' },
                      ]}
                    />

                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Ưu tiên"
                    name="priority"
                    initialValue="NORMAL"
                  >
                    <CustomSelect
                      options={[
                        { label: '⚪ Bình thường', value: 'NORMAL' },
                        { label: '🟡 Trung bình', value: 'MEDIUM' },
                        { label: '🔴 Cao', value: 'HIGH' },
                        { label: '🔥 Khẩn cấp', value: 'URGENT' },
                      ]}
                    />

                  </Form.Item>
                </Col>
              </Row>

              {/* Trạng thái và Ngày tư vấn */}
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Trạng thái"
                    name="status"
                    initialValue="PENDING"
                  >
                    <CustomSelect
                      options={[
                        { label: '⏳ Chờ xử lý', value: 'PENDING' },
                        { label: '🔵 Đang khám', value: 'IN_PROGRESS' },
                        { label: '✅ Hoàn thành', value: 'COMPLETED' },
                      ]}
                    />

                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Ngày tư vấn"
                    name="consultationDate"
                    initialValue={dayjs()}
                  >
                    <DatePicker format="DD/MM/YYYY HH:mm" showTime style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider>Chi tiết tư vấn</Divider>

              {/* Chẩn đoán */}
              <Form.Item
                label="Nội dung yêu cầu tư vấn"
                name="diagnosis"
              >
                <Input.TextArea
                  placeholder="Mô tả nội dung yêu cầu tư vấn của khách hàng..."
                  rows={3}
                />
              </Form.Item>

              {/* Triệu chứng */}
              <Form.Item
                label="Chi tiết bổ sung (mỗi dòng một chi tiết)"
                name="symptoms"
              >
                <Input.TextArea
                  placeholder="VD: Chi tiết 1&#10;Chi tiết 2&#10;Chi tiết 3"
                  rows={3}
                />
              </Form.Item>

              {/* Ghi chú */}
              <Form.Item
                label="Ghi chú từ nhân viên"
                name="notes"
              >
                <Input.TextArea
                  placeholder="Ghi chú xử lý yêu cầu tư vấn..."
                  rows={3}
                />
              </Form.Item>

              {/* Buttons */}
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    size="large"
                    icon={<PlusOutlined />}
                  >
                    Tạo yêu cầu tư vấn
                  </Button>
                  <Button
                    onClick={() => form.resetFields()}
                    size="large"
                  >
                    Xóa form
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  );
};

export default CreateConsultation;
