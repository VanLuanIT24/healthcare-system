/**
 * EDIT STAFF MODAL
 * Modal chỉnh sửa thông tin nhân viên
 */

import { Col, DatePicker, Form, Input, message, Modal, Row, Select } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { staffApi } from '../../../services/adminApi';

const { Option } = Select;

const EditStaffModal = ({ visible, staff, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && staff) {
      // Điền dữ liệu vào form
      form.setFieldsValue({
        firstName: staff.personalInfo?.firstName,
        lastName: staff.personalInfo?.lastName,
        email: staff.personalInfo?.email,
        phone: staff.personalInfo?.phone,
        dateOfBirth: staff.personalInfo?.dateOfBirth 
          ? moment(staff.personalInfo.dateOfBirth) 
          : null,
        gender: staff.personalInfo?.gender,
        role: staff.role,
        department: staff.professionalInfo?.department,
        specialization: staff.professionalInfo?.specialization,
        licenseNumber: staff.professionalInfo?.licenseNumber,
        position: staff.professionalInfo?.position,
        status: staff.status
      });
    }
  }, [visible, staff, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Chuẩn bị dữ liệu update
      const updateData = {
        personalInfo: {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          phone: values.phone,
          dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD'),
          gender: values.gender
        },
        professionalInfo: {
          department: values.department,
          specialization: values.specialization,
          licenseNumber: values.licenseNumber,
          position: values.position
        },
        role: values.role,
        status: values.status
      };

      await staffApi.update(staff._id, updateData);
      message.success('Cập nhật thông tin nhân viên thành công!');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update staff error:', error);
      message.error(error.response?.data?.message || 'Không thể cập nhật thông tin nhân viên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Chỉnh Sửa Thông Tin Nhân Viên"
      open={visible}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={800}
      okText="Lưu Thay Đổi"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
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
              <Input placeholder="example@healthcare.vn" disabled />
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
          <Col span={12}>
            <Form.Item
              label="Ngày Sinh"
              name="dateOfBirth"
            >
              <DatePicker 
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Giới Tính"
              name="gender"
            >
              <Select placeholder="Chọn giới tính">
                <Option value="Nam">Nam</Option>
                <Option value="Nữ">Nữ</Option>
                <Option value="Khác">Khác</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Vai Trò"
              name="role"
              rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
            >
              <Select placeholder="Chọn vai trò">
                <Option value="DOCTOR">Bác Sĩ</Option>
                <Option value="NURSE">Y Tá</Option>
                <Option value="PHARMACIST">Dược Sĩ</Option>
                <Option value="LAB_TECHNICIAN">Kỹ Thuật Viên XN</Option>
                <Option value="RECEPTIONIST">Lễ Tân</Option>
                <Option value="BILLING_STAFF">Kế Toán</Option>
                <Option value="DEPARTMENT_HEAD">Trưởng Khoa</Option>
                <Option value="HOSPITAL_ADMIN">Quản Trị Viên</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Khoa/Phòng Ban"
              name="department"
            >
              <Select placeholder="Chọn khoa">
                <Option value="Nội Khoa">Nội Khoa</Option>
                <Option value="Ngoại Khoa">Ngoại Khoa</Option>
                <Option value="Sản Phụ Khoa">Sản Phụ Khoa</Option>
                <Option value="Nhi Khoa">Nhi Khoa</Option>
                <Option value="Tim Mạch">Tim Mạch</Option>
                <Option value="Tiêu Hóa">Tiêu Hóa</Option>
                <Option value="Thần Kinh">Thần Kinh</Option>
                <Option value="Xét Nghiệm">Xét Nghiệm</Option>
                <Option value="Dược">Dược</Option>
                <Option value="Hành Chính">Hành Chính</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Chuyên Môn"
              name="specialization"
            >
              <Input placeholder="VD: Tim mạch can thiệp" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Số Chứng Chỉ Hành Nghề"
              name="licenseNumber"
            >
              <Input placeholder="VD: BS-12345" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Chức Vụ"
              name="position"
            >
              <Input placeholder="VD: Trưởng khoa" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Trạng Thái"
              name="status"
              rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="ACTIVE">Hoạt Động</Option>
                <Option value="INACTIVE">Không Hoạt Động</Option>
                <Option value="SUSPENDED">Tạm Ngưng</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default EditStaffModal;
