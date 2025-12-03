/**
 * EDIT PATIENT MODAL
 * Modal chỉnh sửa thông tin bệnh nhân
 */

import { Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { patientApi } from '../../../services/adminApi';

const { Option } = Select;
const { TextArea } = Input;

const EditPatientModal = ({ visible, patient, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && patient) {
      // Điền dữ liệu vào form
      form.setFieldsValue({
        firstName: patient.personalInfo?.firstName,
        lastName: patient.personalInfo?.lastName,
        email: patient.personalInfo?.email,
        phone: patient.personalInfo?.phone,
        dateOfBirth: patient.personalInfo?.dateOfBirth 
          ? moment(patient.personalInfo.dateOfBirth) 
          : null,
        gender: patient.personalInfo?.gender,
        bloodType: patient.medicalInfo?.bloodType,
        height: patient.medicalInfo?.height,
        weight: patient.medicalInfo?.weight,
        street: patient.personalInfo?.address?.street,
        city: patient.personalInfo?.address?.city,
        province: patient.personalInfo?.address?.province,
        postalCode: patient.personalInfo?.address?.postalCode,
        emergencyContactName: patient.emergencyContact?.name,
        emergencyContactRelationship: patient.emergencyContact?.relationship,
        emergencyContactPhone: patient.emergencyContact?.phone
      });
    }
  }, [visible, patient, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Chuẩn bị dữ liệu update demographics
      const updateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
        gender: values.gender,
        bloodType: values.bloodType,
        height: values.height,
        weight: values.weight,
        address: {
          street: values.street,
          city: values.city,
          province: values.province,
          postalCode: values.postalCode
        },
        emergencyContact: {
          name: values.emergencyContactName,
          relationship: values.emergencyContactRelationship,
          phone: values.emergencyContactPhone
        }
      };

      await patientApi.updateDemographics(patient._id, updateData);
      message.success('Cập nhật thông tin bệnh nhân thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update patient error:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh Sửa Thông Tin Bệnh Nhân"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={900}
      okText="Lưu Thay Đổi"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <h4 style={{ marginTop: 0, marginBottom: 16, fontWeight: 600 }}>Thông Tin Cá Nhân</h4>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Họ"
              name="firstName"
              rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
            >
              <Input placeholder="Nguyễn" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Tên"
              name="lastName"
              rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
            >
              <Input placeholder="Văn A" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input placeholder="example@email.com" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số Điện Thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
            >
              <Input placeholder="0123456789" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Ngày Sinh"
              name="dateOfBirth"
              rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Giới Tính"
              name="gender"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            >
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Nhóm Máu"
              name="bloodType"
            >
              <Select placeholder="Chọn nhóm máu">
                <Option value="A">A</Option>
                <Option value="B">B</Option>
                <Option value="AB">AB</Option>
                <Option value="O">O</Option>
                <Option value="A+">A+</Option>
                <Option value="A-">A-</Option>
                <Option value="B+">B+</Option>
                <Option value="B-">B-</Option>
                <Option value="AB+">AB+</Option>
                <Option value="AB-">AB-</Option>
                <Option value="O+">O+</Option>
                <Option value="O-">O-</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Chiều Cao (cm)"
              name="height"
            >
              <InputNumber 
                style={{ width: '100%' }}
                placeholder="170"
                min={0}
                max={300}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Cân Nặng (kg)"
              name="weight"
            >
              <InputNumber 
                style={{ width: '100%' }}
                placeholder="65"
                min={0}
                max={500}
              />
            </Form.Item>
          </Col>
        </Row>

        <h4 style={{ marginTop: 24, marginBottom: 16, fontWeight: 600 }}>Địa Chỉ</h4>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Số Nhà / Đường"
              name="street"
            >
              <Input placeholder="123 Đường Lê Lợi" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Thành Phố"
              name="city"
            >
              <Input placeholder="Hồ Chí Minh" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Tỉnh/Thành"
              name="province"
            >
              <Input placeholder="TP. Hồ Chí Minh" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Mã Bưu Điện"
              name="postalCode"
            >
              <Input placeholder="700000" />
            </Form.Item>
          </Col>
        </Row>

        <h4 style={{ marginTop: 24, marginBottom: 16, fontWeight: 600 }}>Người Liên Hệ Khẩn Cấp</h4>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Họ Tên"
              name="emergencyContactName"
            >
              <Input placeholder="Nguyễn Văn B" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Mối Quan Hệ"
              name="emergencyContactRelationship"
            >
              <Select placeholder="Chọn mối quan hệ">
                <Option value="Vợ/Chồng">Vợ/Chồng</Option>
                <Option value="Cha/Mẹ">Cha/Mẹ</Option>
                <Option value="Con">Con</Option>
                <Option value="Anh/Chị/Em">Anh/Chị/Em</Option>
                <Option value="Bạn Bè">Bạn Bè</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Số Điện Thoại"
              name="emergencyContactPhone"
            >
              <Input placeholder="0987654321" />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditPatientModal;
