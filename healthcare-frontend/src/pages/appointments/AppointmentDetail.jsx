// 📅 Appointment Detail Page - Placeholder
import { CalendarOutlined } from '@ant-design/icons';
import { Card } from 'antd';

const AppointmentDetail = () => {
  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <CalendarOutlined style={{ marginRight: 12, color: '#1890FF' }} />
            Chi tiết lịch hẹn
          </h1>
          <p className="dashboard-subtitle">
            Thông tin chi tiết cuộc hẹn
          </p>
        </div>
      </div>

      <Card variant="borderless">
        <p>Trang đang được phát triển...</p>
      </Card>
    </div>
  );
};

export default AppointmentDetail;
