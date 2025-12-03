import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  TimePicker,
  Select,
  Button,
  message,
  Spin,
  Alert,
  Row,
  Col,
  Card,
  Tag,
  Empty,
} from "antd";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  MailOutlined,
  FileTextOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import axios from "axios";
import dayjs from "dayjs";

const BookingAppointmentModal = ({ visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [step, setStep] = useState(1); // Step 1: Choose doctor, Step 2: Choose date/time

  // Use relative URL /api for Vite proxy
  const API_URL = import.meta.env.VITE_API_URL || "/api";
  const token = localStorage.getItem("accessToken");

  // Log for debugging
  useEffect(() => {
    console.log("📋 BookingAppointmentModal - API_URL:", API_URL);
  }, []);

  // Fetch doctors when modal opens
  useEffect(() => {
    if (visible) {
      fetchDoctors();
      setStep(1);
      form.resetFields();
    }
  }, [visible]);

  // Update form when doctor is selected
  useEffect(() => {
    if (selectedDoctor) {
      form.setFieldsValue({ doctorId: selectedDoctor._id });
    }
  }, [selectedDoctor, form]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      const response = await axios.get(`${API_URL}/users/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setDoctors(response.data.data || []);
        if (!response.data.data || response.data.data.length === 0) {
          message.info("Hiện tại không có bác sĩ khả dụng");
        }
      }
    } catch (error) {
      console.error("Lỗi tải danh sách bác sĩ:", error);
      message.error(
        error.response?.data?.message || "Không thể tải danh sách bác sĩ"
      );
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchAvailableSlots = async (doctorId, date) => {
    try {
      setLoadingSlots(true);

      // Convert dayjs object to YYYY-MM-DD string
      const dateStr = dayjs.isDayjs(date)
        ? date.format("YYYY-MM-DD")
        : new Date(date).toISOString().split("T")[0];

      console.log("🔍 Fetching slots for doctor:", doctorId, "date:", dateStr);

      const response = await axios.get(
        `${API_URL}/patient-portal/appointments/available-slots/${doctorId}`,
        {
          params: {
            appointmentDate: dateStr,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setAvailableSlots(response.data.data || []);
        if (!response.data.data || response.data.data.length === 0) {
          message.info("Ngày này không có khung giờ khả dụng");
        }
      }
    } catch (error) {
      console.error("Lỗi tải khung giờ khả dụng:", error);
      message.warning(
        error.response?.data?.message || "Không thể tải khung giờ khả dụng"
      );
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleDoctorSelect = (doctorId) => {
    const doctor = doctors.find((d) => d._id === doctorId);
    setSelectedDoctor(doctor);
    // Set the doctorId in the form
    form.setFieldsValue({ doctorId: doctorId });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (selectedDoctor && date) {
      fetchAvailableSlots(selectedDoctor._id, date);
    }
  };

  const handleTimeSelect = (timeSlot) => {
    form.setFieldValue("appointmentTime", timeSlot.time);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);

      // Convert dayjs date to YYYY-MM-DD string
      let appointmentDate = values.appointmentDate;
      if (dayjs.isDayjs(appointmentDate)) {
        appointmentDate = appointmentDate.format("YYYY-MM-DD");
      } else if (appointmentDate instanceof Date) {
        appointmentDate = appointmentDate.toISOString().split("T")[0];
      }

      const appointmentData = {
        doctorId: values.doctorId,
        appointmentDate: appointmentDate,
        appointmentTime: values.appointmentTime,
        reason: values.reason,
        type: values.appointmentType || "Consultation",
        notes: values.notes,
      };

      console.log("📤 Submitting appointment data:", appointmentData);

      const response = await axios.post(
        `${API_URL}/patient-portal/appointments`,
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        message.success("✅ Đặt lịch hẹn thành công!");
        form.resetFields();
        setSelectedDoctor(null);
        setSelectedDate(null);
        setAvailableSlots([]);
        setStep(1);
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(
          response.data.message || "Không thể đặt lịch hẹn. Vui lòng thử lại."
        );
      }
    } catch (error) {
      console.error(
        "❌ Lỗi đặt lịch hẹn:",
        error.response?.data || error.message
      );
      const errorMsg =
        error.response?.data?.message || "Không thể đặt lịch hẹn";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getDoctorDisplayName = (doctor) => {
    if (doctor.personalInfo) {
      return `${doctor.personalInfo.firstName || ""} ${
        doctor.personalInfo.lastName || ""
      }`.trim();
    }
    return doctor.name || "Unknown";
  };

  const getDoctorSpecialization = (doctor) => {
    return (
      doctor.professionalInfo?.specialization ||
      doctor.specialization ||
      doctor.department ||
      "Tổng quát"
    );
  };

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CalendarOutlined />
          <span>Đặt Lịch Hẹn Với Bác Sĩ</span>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      styles={{
        body: { maxHeight: "600px", overflowY: "auto" },
      }}
    >
      <Spin spinning={loadingDoctors || loading} tip="Đang xử lý...">
        {step === 1 ? (
          <div>
            <Alert
              message="Bước 1: Chọn Bác Sĩ"
              type="info"
              showIcon
              style={{ marginBottom: "20px" }}
            />

            {loadingDoctors ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Spin tip="Đang tải danh sách bác sĩ..." />
              </div>
            ) : doctors.length === 0 ? (
              <Empty description="Không có bác sĩ khả dụng" />
            ) : (
              <Row gutter={[16, 16]} style={{ marginBottom: "20px" }}>
                {doctors.map((doctor) => (
                  <Col key={doctor._id} xs={24} sm={12}>
                    <Card
                      hoverable
                      onClick={() => {
                        handleDoctorSelect(doctor._id);
                        setStep(2);
                      }}
                      style={{
                        cursor: "pointer",
                        border:
                          selectedDoctor?._id === doctor._id
                            ? "2px solid #1890ff"
                            : "1px solid #d9d9d9",
                        borderRadius: "8px",
                      }}
                    >
                      <div style={{ marginBottom: "12px" }}>
                        <div
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            marginBottom: "8px",
                          }}
                        >
                          <UserOutlined /> {getDoctorDisplayName(doctor)}
                        </div>
                        <div style={{ color: "#666", fontSize: "13px" }}>
                          <TeamOutlined /> Chuyên khoa:{" "}
                          {getDoctorSpecialization(doctor)}
                        </div>
                      </div>

                      {doctor.email && (
                        <div style={{ color: "#999", fontSize: "12px" }}>
                          <MailOutlined /> {doctor.email}
                        </div>
                      )}
                      {doctor.phone && (
                        <div style={{ color: "#999", fontSize: "12px" }}>
                          <PhoneOutlined /> {doctor.phone}
                        </div>
                      )}

                      <Tag
                        color="blue"
                        style={{ marginTop: "10px" }}
                        onClick={() => handleDoctorSelect(doctor._id)}
                      >
                        Chọn
                      </Tag>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            <div style={{ textAlign: "right" }}>
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </div>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{
              appointmentType: "Consultation",
            }}
          >
            <Alert
              message="Bước 2: Chọn Thời Gian & Nhập Thông Tin"
              type="info"
              showIcon
              style={{ marginBottom: "20px" }}
            />

            {/* Hidden doctorId field */}
            <Form.Item
              name="doctorId"
              initialValue={selectedDoctor?._id}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn bác sĩ",
                },
              ]}
              hidden
            >
              <Input />
            </Form.Item>

            {/* Doctor Info */}
            {selectedDoctor && (
              <Card
                style={{ marginBottom: "20px", backgroundColor: "#f5f5f5" }}
              >
                <div>
                  <strong>Bác Sĩ Đã Chọn:</strong>{" "}
                  {getDoctorDisplayName(selectedDoctor)}
                </div>
                {selectedDoctor.specialization && (
                  <div>
                    <strong>Chuyên Khoa:</strong>{" "}
                    {getDoctorSpecialization(selectedDoctor)}
                  </div>
                )}
              </Card>
            )}

            {/* Date Selection */}
            <Form.Item
              label={
                <span>
                  <CalendarOutlined /> Ngày Hẹn
                </span>
              }
              name="appointmentDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày hẹn",
                },
              ]}
            >
              <DatePicker
                placeholder="Chọn ngày"
                disabledDate={(current) => {
                  // Disable past dates and Sundays
                  return (
                    current &&
                    (current < dayjs().startOf("day") || current.day() === 0)
                  );
                }}
                onChange={handleDateChange}
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* Time Slots */}
            {selectedDate && (
              <Form.Item
                label={
                  <span>
                    <ClockCircleOutlined /> Khung Giờ Khả Dụng
                  </span>
                }
                required
              >
                <Spin spinning={loadingSlots}>
                  {availableSlots.length > 0 ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "10px",
                      }}
                    >
                      {availableSlots.map((slot, idx) => (
                        <Button
                          key={idx}
                          onClick={() => handleTimeSelect(slot)}
                          type={
                            form.getFieldValue("appointmentTime") === slot.time
                              ? "primary"
                              : "default"
                          }
                          style={{ minWidth: "100px" }}
                        >
                          {slot.time || slot}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <Empty
                      description="Không có khung giờ khả dụng"
                      style={{ marginTop: "20px" }}
                    />
                  )}
                </Spin>
              </Form.Item>
            )}

            <Form.Item
              label="Thời Gian"
              name="appointmentTime"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn thời gian",
                },
              ]}
              hidden
            >
              <Input />
            </Form.Item>

            {/* Appointment Type */}
            <Form.Item
              label="Loại Hẹn"
              name="appointmentType"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn loại hẹn",
                },
              ]}
            >
              <Select
                placeholder="Chọn loại hẹn"
                options={[
                  { label: "Tư Vấn", value: "Consultation" },
                  { label: "Tái Khám", value: "Follow-up" },
                  { label: "Khám Thường Quy", value: "Routine" },
                ]}
              />
            </Form.Item>

            {/* Reason */}
            <Form.Item
              label={
                <span>
                  <FileTextOutlined /> Lý Do Khám
                </span>
              }
              name="reason"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập lý do khám",
                },
                {
                  max: 500,
                  message: "Lý do khám không được vượt quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea
                rows={3}
                placeholder="Mô tả lý do khám..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            {/* Additional Notes */}
            <Form.Item
              label="Ghi Chú Thêm"
              name="notes"
              rules={[
                {
                  max: 500,
                  message: "Ghi chú không được vượt quá 500 ký tự",
                },
              ]}
            >
              <Input.TextArea
                rows={2}
                placeholder="Ghi chú thêm (tùy chọn)..."
                maxLength={500}
                showCount
              />
            </Form.Item>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "flex-end",
              }}
            >
              <Button onClick={() => setStep(1)}>Quay Lại</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!form.getFieldValue("appointmentTime")}
              >
                Đặt Lịch Hẹn
              </Button>
            </div>
          </Form>
        )}
      </Spin>
    </Modal>
  );
};

export default BookingAppointmentModal;
