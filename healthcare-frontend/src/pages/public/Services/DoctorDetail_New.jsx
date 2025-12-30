// src/pages/public/Services/DoctorDetail.jsx
import publicAPI from '@/services/api/publicAPI';
import {
    BookOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    EnvironmentOutlined,
    PhoneOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    Row,
    Skeleton,
    Tabs,
    Tag
} from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const DoctorDetail = () => {
  const { id: doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const fetchDoctorDetail = async () => {
      try {
        console.log('📋 Fetching doctor detail for ID:', doctorId);
        setLoading(true);
        const response = await publicAPI.getDoctorDetail(doctorId);
        console.log('✅ Doctor detail response:', response);
        setDoctor(response);
      } catch (error) {
        console.error('❌ Error fetching doctor detail:', error);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorDetail();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <Skeleton active paragraph={{ rows: 10 }} avatar={{ size: 200 }} />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <Empty
            description="Không tìm thấy thông tin bác sĩ"
            style={{ marginTop: 50, marginBottom: 50 }}
          >
            <Button type="primary" onClick={() => navigate('/doctors')}>
              Quay lại danh sách bác sĩ
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  const tabItems = [
    {
      key: 'about',
      label: 'Giới thiệu',
      children: (
        <div className="space-y-8">
          {/* Experience */}
          <div>
            <h3 className="text-lg font-semibold mb-3">
              <ClockCircleOutlined className="mr-2" />
              Kinh nghiệm
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Bác sĩ có {doctor.experience}+ năm kinh nghiệm trong lĩnh vực {doctor.specialty}.
            </p>
          </div>

          {/* Qualifications */}
          {doctor.qualifications && doctor.qualifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">
                <BookOutlined className="mr-2" />
                Bằng cấp & Chứng chỉ
              </h3>
              <div className="space-y-2">
                {doctor.qualifications.map((qual, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-green-500" />
                    <span>{qual}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* License */}
          {doctor.licenseNumber && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Số giấy phép hành nghề:</span> {doctor.licenseNumber}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'schedule',
      label: 'Lịch khám',
      children: (
        <div className="text-center py-12 text-gray-500">
          <CalendarOutlined className="text-4xl mb-4" />
          <p>Tính năng đặt lịch sẽ sớm có sẵn</p>
          <Button type="primary" className="mt-4" onClick={() => navigate('/booking')}>
            Đặt lịch khám
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Cover Background */}
      <div className="h-64 md:h-80 bg-gradient-to-r from-blue-600 to-blue-800 relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-pattern" />
        </div>
      </div>

      <div className="container mx-auto px-4">
        <Row gutter={[32, 32]}>
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* Doctor Profile Card - overlapping */}
            <Card className="rounded-2xl shadow-xl -mt-24 relative z-10 mb-6">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Avatar */}
                <div className="flex-shrink-0 text-center">
                  <Avatar
                    size={140}
                    className="border-4 border-blue-500 shadow-lg"
                    style={{
                      backgroundColor: '#1890ff',
                      fontSize: '56px',
                      lineHeight: '140px',
                    }}
                  >
                    {doctor.name.charAt(0)}
                  </Avatar>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Tag color="blue" className="text-sm font-semibold">
                      {doctor.specialty}
                    </Tag>
                    <Tag color="green">Đang hoạt động</Tag>
                  </div>

                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {doctor.name}
                  </h1>

                  <p className="text-lg text-blue-600 font-semibold mb-4">{doctor.degree}</p>

                  <div className="flex flex-wrap gap-6 text-gray-600 mb-6">
                    <span className="flex items-center gap-2">
                      <ClockCircleOutlined className="text-blue-500" />
                      {doctor.experience}+ năm kinh nghiệm
                    </span>
                    <span className="flex items-center gap-2">
                      <EnvironmentOutlined className="text-blue-500" />
                      {doctor.department}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">5.0</div>
                      <div className="text-xs text-gray-500">Đánh giá</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {doctor.completedAppointments || 0}+
                      </div>
                      <div className="text-xs text-gray-500">Lượt khám</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">100%</div>
                      <div className="text-xs text-gray-500">Hài lòng</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Tabs */}
            <Card className="rounded-2xl shadow-sm border-gray-100">
              <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
            </Card>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <div className="sticky top-24 space-y-4 -mt-24 pt-24 lg:pt-0 lg:-mt-24">
              {/* Booking Card */}
              <Card className="rounded-2xl shadow-xl relative z-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <div className="text-center mb-4">
                  <div className="text-sm text-blue-100">Phí khám</div>
                  <div className="text-3xl font-bold text-white">Liên hệ</div>
                </div>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-blue-100" />
                    <span>Tư vấn chi tiết</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-blue-100" />
                    <span>Hỗ trợ bảo hiểm</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircleOutlined className="text-blue-100" />
                    <span>Lịch khám linh hoạt</span>
                  </div>
                </div>

                <Button
                  size="large"
                  block
                  icon={<CalendarOutlined />}
                  className="rounded-lg h-12 font-semibold bg-white text-blue-600 hover:bg-blue-50 border-0"
                  onClick={() => navigate('/booking')}
                >
                  Đặt lịch khám
                </Button>
              </Card>

              {/* Contact Card */}
              <Card className="rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-4">📞 Liên hệ</h3>
                {doctor.phone && (
                  <div className="mb-3 flex items-center gap-2">
                    <PhoneOutlined className="text-blue-500" />
                    <a href={`tel:${doctor.phone}`} className="text-blue-600 hover:underline">
                      {doctor.phone}
                    </a>
                  </div>
                )}
                {doctor.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">✉️</span>
                    <a href={`mailto:${doctor.email}`} className="text-blue-600 hover:underline break-all">
                      {doctor.email}
                    </a>
                  </div>
                )}
              </Card>

              {/* Department Card */}
              <Card className="rounded-2xl shadow-sm">
                <h3 className="font-semibold mb-3">🏢 Phòng ban</h3>
                <Tag color="blue" className="text-sm">
                  {doctor.department}
                </Tag>
              </Card>

              {/* License */}
              {doctor.licenseNumber && (
                <Card className="rounded-2xl shadow-sm">
                  <h3 className="font-semibold mb-2 text-sm">Chứng chỉ hành nghề</h3>
                  <p className="text-xs text-gray-500 break-all">{doctor.licenseNumber}</p>
                </Card>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DoctorDetail;
