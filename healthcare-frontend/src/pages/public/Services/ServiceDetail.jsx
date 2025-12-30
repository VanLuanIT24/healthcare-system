// src/pages/public/Services/ServiceDetail.jsx
import { PageHeader } from '@/components/common';
import {
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    PhoneOutlined,
    SafetyCertificateOutlined,
    TeamOutlined
} from '@ant-design/icons';
import { Avatar, Button, Card, Col, Collapse, List, Rate, Row, Table, Tabs, Tag } from 'antd';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Mock data
const serviceDetail = {
  cardiology: {
    id: 'cardiology',
    name: 'Tim mạch',
    icon: '🫀',
    description: 'Khoa Tim mạch tại HealthCare cung cấp dịch vụ chẩn đoán và điều trị toàn diện các bệnh lý về tim mạch. Với đội ngũ bác sĩ chuyên khoa giàu kinh nghiệm và hệ thống trang thiết bị hiện đại nhất, chúng tôi cam kết mang đến sự chăm sóc tốt nhất cho trái tim của bạn.',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200',
    rating: 4.9,
    reviews: 256,
    procedures: [
      'Khám tim mạch tổng quát',
      'Siêu âm tim',
      'Điện tâm đồ (ECG)',
      'Holter điện tim 24h',
      'Chụp mạch vành CT',
      'Can thiệp tim mạch',
      'Đặt stent mạch vành',
      'Cấy máy tạo nhịp tim',
    ],
    prices: [
      { service: 'Khám tim mạch tổng quát', price: '300.000đ' },
      { service: 'Siêu âm tim', price: '400.000đ' },
      { service: 'Điện tâm đồ', price: '150.000đ' },
      { service: 'Holter 24h', price: '800.000đ' },
      { service: 'CT mạch vành', price: '3.500.000đ' },
    ],
    insurance: ['Bảo Việt', 'PVI', 'Bảo Minh', 'Liberty', 'AIA', 'Prudential'],
    doctors: [
      {
        id: 1,
        name: 'PGS.TS.BS Nguyễn Văn Anh',
        avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
        position: 'Trưởng khoa Tim mạch',
        experience: '20 năm',
        rating: 4.9,
      },
      {
        id: 7,
        name: 'TS.BS Hoàng Minh Tuấn',
        avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
        position: 'Phó khoa Tim mạch',
        experience: '15 năm',
        rating: 4.8,
      },
    ],
    faqs: [
      {
        q: 'Khi nào cần đi khám tim mạch?',
        a: 'Bạn nên đi khám tim mạch khi có các triệu chứng như: đau ngực, khó thở, tim đập nhanh/chậm bất thường, chóng mặt, mệt mỏi kéo dài, hoặc có tiền sử gia đình bệnh tim.',
      },
      {
        q: 'Trước khi khám tim cần chuẩn bị gì?',
        a: 'Bạn nên nhịn ăn 4-6 giờ trước khi làm xét nghiệm máu, mang theo các kết quả xét nghiệm/siêu âm cũ, danh sách thuốc đang dùng, và thẻ bảo hiểm.',
      },
      {
        q: 'Chi phí khám tim mạch có được bảo hiểm chi trả không?',
        a: 'Có, hầu hết các gói bảo hiểm y tế đều chi trả chi phí khám và điều trị tim mạch. Vui lòng liên hệ để được tư vấn chi tiết.',
      },
    ],
  },
};

const ServiceDetail = () => {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Get service data (trong thực tế sẽ gọi API)
  const service = serviceDetail[serviceId] || serviceDetail.cardiology;

  const priceColumns = [
    { title: 'Dịch vụ', dataIndex: 'service', key: 'service' },
    { 
      title: 'Giá', 
      dataIndex: 'price', 
      key: 'price',
      render: (price) => <span className="font-semibold text-blue-600">{price}</span>
    },
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Tổng quan',
      children: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Giới thiệu</h3>
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Các dịch vụ/thủ thuật</h3>
            <Row gutter={[16, 16]}>
              {service.procedures.map((procedure, index) => (
                <Col xs={24} sm={12} key={index}>
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>{procedure}</span>
                  </div>
                </Col>
              ))}
            </Row>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Bảo hiểm được chấp nhận</h3>
            <div className="flex flex-wrap gap-2">
              {service.insurance.map((ins, index) => (
                <Tag key={index} className="px-3 py-1 rounded-full">
                  {ins}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'doctors',
      label: 'Đội ngũ bác sĩ',
      children: (
        <List
          itemLayout="horizontal"
          dataSource={service.doctors}
          renderItem={(doctor) => (
            <List.Item
              actions={[
                <Button onClick={() => navigate(`/doctors/${doctor.id}`)}>
                  Xem hồ sơ
                </Button>,
                <Button type="primary" onClick={() => navigate(`/booking?doctorId=${doctor.id}`)}>
                  Đặt lịch
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={doctor.avatar} size={64} />}
                title={<span className="font-semibold">{doctor.name}</span>}
                description={
                  <div>
                    <p className="text-gray-600">{doctor.position}</p>
                    <p className="text-gray-500">{doctor.experience} kinh nghiệm</p>
                    <Rate disabled defaultValue={doctor.rating} allowHalf className="text-sm" />
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      key: 'prices',
      label: 'Bảng giá',
      children: (
        <div>
          <Table
            dataSource={service.prices}
            columns={priceColumns}
            pagination={false}
            rowKey="service"
          />
          <p className="text-sm text-gray-500 mt-4">
            * Giá trên chưa bao gồm thuốc và các xét nghiệm bổ sung (nếu có).
            Vui lòng liên hệ để được tư vấn chi tiết.
          </p>
        </div>
      ),
    },
    {
      key: 'faq',
      label: 'Câu hỏi thường gặp',
      children: (
        <Collapse 
          accordion 
          expandIconPosition="end"
          items={service.faqs.map((faq, index) => ({
            key: index,
            label: <span className="font-medium">{faq.q}</span>,
            children: <p className="text-gray-600">{faq.a}</p>,
          }))}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={service.name}
        subtitle="Chuyên khoa"
        backgroundImage={service.image}
      />

      <div className="container mx-auto px-4 py-8">
        <Row gutter={[32, 32]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card className="rounded-xl shadow-sm">
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
              />
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div className="sticky top-24 space-y-4">
              {/* Quick Info Card */}
              <Card className="rounded-xl shadow-sm">
                <div className="text-center mb-4">
                  <div className="w-20 h-20 mx-auto mb-3 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl">
                    {service.icon}
                  </div>
                  <h2 className="text-xl font-bold">{service.name}</h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Rate disabled defaultValue={service.rating} allowHalf className="text-sm" />
                    <span className="text-gray-500">({service.reviews} đánh giá)</span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <TeamOutlined className="text-blue-500" />
                    <span>{service.doctors.length} bác sĩ chuyên khoa</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <ClockCircleOutlined className="text-green-500" />
                    <span>Thứ 2 - Chủ nhật: 7:00 - 20:00</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <SafetyCertificateOutlined className="text-orange-500" />
                    <span>{service.insurance.length}+ bảo hiểm liên kết</span>
                  </div>
                </div>

                <Button
                  type="primary"
                  size="large"
                  block
                  icon={<CalendarOutlined />}
                  onClick={() => navigate(`/booking?serviceId=${service.id}`)}
                  className="rounded-lg h-12 font-semibold"
                >
                  Đặt lịch khám ngay
                </Button>
              </Card>

              {/* Contact Card */}
              <Card className="rounded-xl shadow-sm">
                <h3 className="font-semibold mb-3">Cần tư vấn thêm?</h3>
                <p className="text-gray-500 text-sm mb-4">
                  Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn 24/7
                </p>
                <Button
                  size="large"
                  block
                  icon={<PhoneOutlined />}
                  onClick={() => window.location.href = 'tel:1800xxxx'}
                  className="rounded-lg"
                >
                  Gọi 1800-XXXX (Miễn phí)
                </Button>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ServiceDetail;
