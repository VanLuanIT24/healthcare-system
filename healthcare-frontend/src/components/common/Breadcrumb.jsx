// src/components/common/Breadcrumb.jsx
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const routeNameMap = {
  '': 'Trang chủ',
  'services': 'Dịch vụ',
  'doctors': 'Bác sĩ',
  'news': 'Tin tức',
  'about': 'Giới thiệu',
  'contact': 'Liên hệ',
  'booking': 'Đặt lịch',
  'login': 'Đăng nhập',
  'register': 'Đăng ký',
  'faq': 'FAQ',
  'patient': 'Cổng bệnh nhân',
  'dashboard': 'Tổng quan',
  'appointments': 'Lịch hẹn',
  'medical-records': 'Hồ sơ bệnh án',
  'prescriptions': 'Đơn thuốc',
  'lab-results': 'Kết quả xét nghiệm',
  'profile': 'Hồ sơ cá nhân',
  'settings': 'Cài đặt',
};

const Breadcrumb = ({ customItems }) => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter(i => i);

  // Build breadcrumb items from path
  const items = [
    {
      title: (
        <Link to="/" className="flex items-center gap-1">
          <HomeOutlined />
          <span>Trang chủ</span>
        </Link>
      ),
    },
  ];

  pathSnippets.forEach((snippet, index) => {
    const url = `/${pathSnippets.slice(0, index + 1).join('/')}`;
    const isLast = index === pathSnippets.length - 1;
    const name = routeNameMap[snippet] || snippet;

    items.push({
      title: isLast ? (
        <span className="text-gray-900 font-medium">{name}</span>
      ) : (
        <Link to={url}>{name}</Link>
      ),
    });
  });

  return (
    <AntBreadcrumb
      items={customItems || items}
      className="mb-4"
    />
  );
};

export default Breadcrumb;
