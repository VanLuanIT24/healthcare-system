// src/pages/admin/appointments/ExportAppointments.jsx
import AdminLayout from '@/components/layout/admin/AdminLayout';
import appointmentAPI from '@/services/api/appointmentAPI';
import { DownloadOutlined, FileExcelOutlined, FileOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Divider, Form, Modal, Row, Select, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';

const ExportAppointments = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs()
  ]);
  const [status, setStatus] = useState('');

  const statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Chờ xác nhận', value: 'PENDING' },
    { label: 'Đã xác nhận', value: 'CONFIRMED' },
    { label: 'Hoàn thành', value: 'COMPLETED' },
    { label: 'Đã hủy', value: 'CANCELLED' },
    { label: 'Vắng mặt', value: 'NO_SHOW' }
  ];

  const handleExportPDF = async () => {
    try {
      setLoading(true);

      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        message.warning('Vui lòng chọn khoảng thời gian');
        return;
      }

      const params = {
        dateFrom: dateRange[0].format('YYYY-MM-DD'),
        dateTo: dateRange[1].format('YYYY-MM-DD'),
        status: status || undefined
      };

      const response = await appointmentAPI.exportAppointmentsPDF(params);

      // Create blob and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments_${dayjs().format('YYYY-MM-DD')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      message.success('Xuất PDF thành công');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      message.error(error?.response?.data?.message || 'Lỗi xuất PDF');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);

      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        message.warning('Vui lòng chọn khoảng thời gian');
        return;
      }

      const params = {
        dateFrom: dateRange[0].format('YYYY-MM-DD'),
        dateTo: dateRange[1].format('YYYY-MM-DD'),
        status: status || undefined
      };

      const response = await appointmentAPI.exportAppointmentsExcel(params);

      // Create blob and download
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `appointments_${dayjs().format('YYYY-MM-DD')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      message.success('Xuất Excel thành công');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      message.error(error?.response?.data?.message || 'Lỗi xuất Excel');
    } finally {
      setLoading(false);
    }
  };

  const handlePreviewExport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Vui lòng chọn khoảng thời gian');
      return;
    }

    try {
      setLoading(true);
      const response = await appointmentAPI.getAppointments({
        dateFrom: dateRange[0].format('YYYY-MM-DD'),
        dateTo: dateRange[1].format('YYYY-MM-DD'),
        status: status || undefined,
        limit: 5
      });

      const data = Array.isArray(response.data) ? response.data : response.data?.data || [];

      Modal.info({
        title: 'Xem trước dữ liệu xuất',
        width: 800,
        content: (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #d9d9d9', padding: '8px' }}>Thời gian</th>
                  <th style={{ border: '1px solid #d9d9d9', padding: '8px' }}>Bệnh nhân</th>
                  <th style={{ border: '1px solid #d9d9d9', padding: '8px' }}>Bác sĩ</th>
                  <th style={{ border: '1px solid #d9d9d9', padding: '8px' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {data.map((apt, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #d9d9d9', padding: '8px' }}>
                      {dayjs(apt.appointmentDate).format('DD/MM/YYYY HH:mm')}
                    </td>
                    <td style={{ border: '1px solid #d9d9d9', padding: '8px' }}>
                      {apt.patientId?.fullName}
                    </td>
                    <td style={{ border: '1px solid #d9d9d9', padding: '8px' }}>
                      {apt.doctorId?.fullName}
                    </td>
                    <td style={{ border: '1px solid #d9d9d9', padding: '8px' }}>
                      {apt.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      });
    } catch (error) {
      message.error('Lỗi xem trước dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          <DownloadOutlined style={{ marginRight: '8px' }} />
          Xuất dữ liệu lịch hẹn
        </h1>

        <Card>
          <Form
            form={form}
            layout="vertical"
          >
            <Form.Item
              label="Khoảng thời gian"
              name="dateRange"
              rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian' }]}
            >
              <DatePicker.RangePicker
                style={{ width: '100%' }}
                format="DD/MM/YYYY"
                value={dateRange}
                onChange={(dates) => {
                  if (dates) setDateRange(dates);
                }}
              />
            </Form.Item>

            <Form.Item
              label="Trạng thái (tùy chọn)"
              name="status"
            >
              <Select
                placeholder="Chọn trạng thái (xuất tất cả nếu không chọn)"
                allowClear
                value={status}
                onChange={setStatus}
                options={statusOptions}
              />
            </Form.Item>

            <Divider />

            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={handleExportExcel}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Xuất Excel
                </Button>
              </Col>

              <Col xs={24} sm={8}>
                <Button
                  type="primary"
                  icon={<FileOutlined />}
                  onClick={handleExportPDF}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Xuất PDF
                </Button>
              </Col>

              <Col xs={24} sm={8}>
                <Button
                  onClick={handlePreviewExport}
                  loading={loading}
                  style={{ width: '100%' }}
                >
                  Xem trước
                </Button>
              </Col>
            </Row>
          </Form>

          <Divider />

          <div style={{
            backgroundColor: '#f0f5ff',
            borderLeft: '4px solid #1890ff',
            padding: '12px',
            borderRadius: '4px'
          }}>
            <strong>💡 Gợi ý:</strong>
            <ul style={{ marginTop: '8px', marginBottom: 0 }}>
              <li>Chọn khoảng thời gian để giới hạn dữ liệu xuất</li>
              <li>Bạn có thể lọc theo trạng thái để xuất những lịch cụ thể</li>
              <li>Excel phù hợp để sử dụng làm báo cáo hoặc phân tích</li>
              <li>PDF phù hợp để in hoặc chia sẻ chính thức</li>
            </ul>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ExportAppointments;
