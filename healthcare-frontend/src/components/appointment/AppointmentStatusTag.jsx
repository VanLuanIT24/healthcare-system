// src/components/appointment/AppointmentStatusTag.jsx
import { CheckCircleOutlined, ClockCircleOutlined, CloseCircleOutlined, PhoneOutlined, WarningOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

const AppointmentStatusTag = ({ status, size = 'default' }) => {
  const statusConfig = {
    PENDING: { 
      label: 'Chờ xác nhận', 
      color: 'warning', 
      icon: <ClockCircleOutlined />,
      bgColor: '#fff7e6'
    },
    CONFIRMED: { 
      label: 'Đã xác nhận', 
      color: 'processing', 
      icon: <CheckCircleOutlined />,
      bgColor: '#e6f7ff'
    },
    CHECKED_IN: { 
      label: 'Đã check-in', 
      color: 'cyan', 
      icon: <PhoneOutlined />,
      bgColor: '#e6fffb'
    },
    IN_PROGRESS: { 
      label: 'Đang khám', 
      color: 'processing', 
      icon: <ClockCircleOutlined />,
      bgColor: '#f0f5ff'
    },
    COMPLETED: { 
      label: 'Hoàn thành', 
      color: 'success', 
      icon: <CheckCircleOutlined />,
      bgColor: '#f6ffed'
    },
    CANCELLED: { 
      label: 'Đã hủy', 
      color: 'error', 
      icon: <CloseCircleOutlined />,
      bgColor: '#fff1f0'
    },
    NO_SHOW: { 
      label: 'Vắng mặt', 
      color: 'orange', 
      icon: <WarningOutlined />,
      bgColor: '#fff7e6'
    },
    CANCEL_REQUESTED: { 
      label: 'Yêu cầu hủy', 
      color: 'volcano', 
      icon: <WarningOutlined />,
      bgColor: '#fff1f0'
    },
    RESCHEDULED: { 
      label: 'Đã đổi lịch', 
      color: 'blue', 
      icon: <ClockCircleOutlined />,
      bgColor: '#e6f7ff'
    }
  };

  const config = statusConfig[status] || statusConfig.PENDING;

  return (
    <Tag 
      color={config.color} 
      style={{
        padding: size === 'large' ? '8px 16px' : '4px 12px',
        fontSize: size === 'large' ? '14px' : '12px',
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      {config.icon}
      {config.label}
    </Tag>
  );
};

export default AppointmentStatusTag;
