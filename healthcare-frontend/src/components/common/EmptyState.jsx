// src/components/common/EmptyState.jsx
import {
    CalendarOutlined,
    FileTextOutlined,
    InboxOutlined,
    SearchOutlined
} from '@ant-design/icons';
import { Button, Empty } from 'antd';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ 
  type = 'default', 
  title, 
  description, 
  actionText, 
  actionLink,
  onAction 
}) => {
  const navigate = useNavigate();

  const configs = {
    default: {
      icon: <InboxOutlined className="text-6xl text-gray-300" />,
      title: 'Không có dữ liệu',
      description: 'Chưa có dữ liệu để hiển thị',
    },
    search: {
      icon: <SearchOutlined className="text-6xl text-gray-300" />,
      title: 'Không tìm thấy kết quả',
      description: 'Thử tìm kiếm với từ khóa khác',
    },
    appointment: {
      icon: <CalendarOutlined className="text-6xl text-gray-300" />,
      title: 'Chưa có lịch hẹn',
      description: 'Bạn chưa có lịch hẹn nào. Hãy đặt lịch khám ngay!',
      actionText: 'Đặt lịch ngay',
      actionLink: '/booking',
    },
    record: {
      icon: <FileTextOutlined className="text-6xl text-gray-300" />,
      title: 'Chưa có hồ sơ',
      description: 'Hồ sơ bệnh án của bạn sẽ xuất hiện ở đây sau khi khám',
    },
  };

  const config = configs[type] || configs.default;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionText = actionText || config.actionText;
  const finalActionLink = actionLink || config.actionLink;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (finalActionLink) {
      navigate(finalActionLink);
    }
  };

  return (
    <div className="py-12 text-center">
      <Empty
        image={config.icon}
        imageStyle={{ height: 80 }}
        description={
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {finalTitle}
            </h3>
            <p className="text-gray-500">{finalDescription}</p>
          </div>
        }
      >
        {finalActionText && (
          <Button type="primary" onClick={handleAction}>
            {finalActionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
