// src/pages/public/Services/DoctorDetail.jsx
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  PhoneOutlined,
  StarOutlined,
  TrophyOutlined,
  MessageOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Empty, Row, Skeleton, Tabs, Tag, Timeline } from 'antd';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import publicAPI from '../../../services/api/publicAPI';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error('Không có ID bác sĩ');
        }

        const data = await publicAPI.getDoctorDetail(id);

        if (!data) {
          throw new Error('Không nhận được dữ liệu từ server');
        }

        setDoctor(data);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError(err.message || 'Không thể tải thông tin bác sĩ');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDoctor();
    } else {
      setError('Không có ID bác sĩ');
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="h-64 md:h-80 bg-gray-200" />
        <div className="container mx-auto px-4 py-8">
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={16}>
              <Skeleton avatar paragraph={{ rows: 4 }} active />
            </Col>
            <Col xs={24} lg={8}>
              <Skeleton paragraph={{ rows: 8 }} active />
            </Col>
          </Row>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Empty
            description={error || "Không tìm thấy thông tin bác sĩ"}
            style={{ marginTop: 48 }}
          />
          <Button
            type="primary"
            size="large"
            onClick={() => navigate('/doctors')}
            className="mt-6"
          >
            Quay lại danh sách bác sĩ
          </Button>
        </div>
      </div>
    );
  }

  // Experience level badge
  const getExperienceLevel = (years) => {
    if (!years) return 'Mới tốt nghiệp';
    if (years < 5) return 'Mới tốt nghiệp';
    if (years < 10) return 'Có kinh nghiệm';
    if (years < 15) return 'Kinh nghiệm cao';
    return 'Chuyên gia';
  };

  const getExperienceBadgeColor = (years) => {
    if (!years) return 'default';
    if (years < 5) return 'default';
    if (years < 10) return 'success';
    if (years < 15) return 'processing';
    return 'error';
  };

  // Avatar gradient background
  const getAvatarGradient = (name) => {
    const colors = ['from-blue-400 to-blue-600', 'from-green-400 to-green-600', 'from-purple-400 to-purple-600'];
    const index = name?.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const tabItems = [
    {
      key: 'about',
      label: 'Giới thiệu',
      children: (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* About Section */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <BookOutlined className="mr-2 text-blue-600" />
              Về bác sĩ
            </h3>
            <p className="text-gray-600 leading-relaxed">{doctor.about || 'Chưa có thông tin chi tiết'}</p>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="rounded-xl shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{doctor.experience || 0}</div>
                <div className="text-sm text-gray-600">Năm kinh nghiệm</div>
              </div>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">{doctor.completedAppointments || 0}</div>
                <div className="text-sm text-gray-600">Bệnh nhân khám</div>
              </div>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-1">4.8</div>
                <div className="text-sm text-gray-600">Đánh giá trung bình</div>
              </div>
            </Card>
          </motion.div>

          {/* Qualifications */}
          {doctor.qualifications && doctor.qualifications.length > 0 && (
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-3">Chứng chỉ & Bằng cấp</h3>
              <div className="flex flex-wrap gap-2">
                {doctor.qualifications.map((qual, index) => (
                  <Tag key={index} color="blue" className="px-3 py-2 rounded-full text-sm">
                    ✓ {qual}
                  </Tag>
                ))}
              </div>
            </motion.div>
          )}

          {/* Department Info */}
          {doctor.department && (
            <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">Khoa phòng</h3>
              <p className="text-gray-700 font-medium">{doctor.department}</p>
            </motion.div>
          )}
        </motion.div>
      ),
    },
    {
      key: 'qualifications',
      label: 'Bằng cấp & Chứng chỉ',
      children: (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
          {/* Degree */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-xl shadow-sm">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BookOutlined className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Bằng cấp chuyên môn</h4>
                  <p className="text-gray-600">{doctor.degree || 'Bác sĩ Y khoa'}</p>
                  <p className="text-sm text-gray-500 mt-1">Cấp bằng: {dayjs(doctor.joinedDate).format('DD/MM/YYYY')}</p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Qualifications List */}
          {doctor.qualifications && doctor.qualifications.length > 0 && (
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold mb-3">Chứng chỉ chuyên môn</h3>
              <div className="space-y-3">
                {doctor.qualifications.map((qual, index) => (
                  <Card key={index} className="rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <CheckCircleOutlined className="text-green-500 text-xl flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{qual}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* License */}
          {doctor.licenseNumber && (
            <motion.div variants={itemVariants}>
              <Card className="rounded-xl shadow-sm bg-gradient-to-r from-green-50 to-emerald-50">
                <div className="flex items-start gap-3">
                  <CheckCircleOutlined className="text-green-600 text-2xl flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Số giấy phép hành nghề</p>
                    <p className="font-bold text-gray-900 text-lg">{doctor.licenseNumber}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      ),
    },
    {
      key: 'experience',
      label: 'Kinh nghiệm',
      children: (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Experience Summary */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Tổng kinh nghiệm</p>
                <p className="text-4xl font-bold text-blue-600">{doctor.experience || 0}</p>
                <p className="text-sm text-gray-600 mt-1">năm</p>
              </div>
              <TrophyOutlined className="text-5xl text-yellow-500 opacity-20" />
            </div>
          </motion.div>

          {/* Experience Level */}
          <motion.div variants={itemVariants}>
            <Card className="rounded-xl shadow-sm">
              <div className="text-center">
                <Tag color={getExperienceBadgeColor(doctor.experience)} className="px-4 py-2 text-base font-semibold mb-2">
                  {getExperienceLevel(doctor.experience)}
                </Tag>
                <p className="text-gray-600 text-sm mt-2">
                  {getExperienceLevel(doctor.experience)} trong lĩnh vực {doctor.specialty}
                </p>
              </div>
            </Card>
          </motion.div>

          {/* Work Timeline */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-4">Lịch sử công tác</h3>
            <Timeline
              items={[
                {
                  color: 'green',
                  children: (
                    <div>
                      <span className="text-gray-500 text-sm">Từ {dayjs(doctor.joinedDate).format('YYYY')}</span>
                      <div className="font-semibold text-gray-900 mt-1">{doctor.department}</div>
                      <div className="text-sm text-gray-600">Hiện đang công tác</div>
                    </div>
                  ),
                },
              ]}
            />
          </motion.div>

          {/* Key Info */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="rounded-xl shadow-sm">
              <div className="text-center">
                <ClockCircleOutlined className="text-3xl text-blue-600 mb-2" />
                <p className="text-gray-600 text-sm">Khám bệnh từ</p>
                <p className="font-semibold text-gray-900">{dayjs(doctor.joinedDate).format('YYYY')}</p>
              </div>
            </Card>
            <Card className="rounded-xl shadow-sm">
              <div className="text-center">
                <StarOutlined className="text-3xl text-yellow-500 mb-2" />
                <p className="text-gray-600 text-sm">Bệnh nhân</p>
                <p className="font-semibold text-gray-900">{doctor.completedAppointments || 0}+</p>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      ),
    },
    {
      key: 'specialty',
      label: 'Chuyên khoa',
      children: (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
          {/* Specialty Info */}
          <motion.div variants={itemVariants} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2 text-gray-900">{doctor.specialty}</h3>
            <p className="text-gray-600">
              Chuyên gia đầu ngành trong lĩnh vực {doctor.specialty} với kinh nghiệm {doctor.experience} năm.
            </p>
          </motion.div>

          {/* Areas of Expertise */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-3">Lĩnh vực chuyên môn</h3>
            <div className="space-y-2">
              {['Tư vấn chuyên khoa', 'Chẩn đoán lâm sàng', 'Xử trí bệnh cấp tính', 'Quản lý bệnh mạn tính'].map(
                (area, index) => (
                  <Card key={index} className="rounded-xl shadow-sm p-3">
                    <div className="flex items-center gap-3">
                      <CheckCircleOutlined className="text-green-500 text-lg flex-shrink-0" />
                      <span className="text-gray-700">{area}</span>
                    </div>
                  </Card>
                ),
              )}
            </div>
          </motion.div>

          {/* Services */}
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-3">Dịch vụ khám</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                'Khám lâm sàng chi tiết',
                'Tư vấn về sức khỏe',
                'Cấp đơn thuốc',
                'Chỉ định xét nghiệm',
              ].map((service, index) => (
                <Card key={index} className="rounded-xl shadow-sm p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircleOutlined className="text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 text-sm">{service}</span>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ),
    },
  ];

  return (
    <motion.div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" initial="hidden" animate="visible" variants={containerVariants}>
      {/* Header Button */}
      <motion.div variants={itemVariants} className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:text-blue-600"
          >
            Quay lại
          </Button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div
        variants={itemVariants}
        className="h-64 md:h-80 relative bg-gradient-to-br from-blue-500 via-blue-400 to-cyan-400 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full filter blur-3xl" />
        </div>
      </motion.div>

      {/* Content */}
      <div className="container mx-auto px-4">
        <Row gutter={[32, 32]} className="py-8">
          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* Profile Card */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-2xl shadow-xl -mt-24 relative z-10 mb-6 overflow-hidden">
                {/* Gradient border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-transparent to-blue-600/0 pointer-events-none" />

                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                  {/* Avatar */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0"
                  >
                    <div className={`w-40 h-40 rounded-2xl bg-gradient-to-br ${getAvatarGradient(doctor.name)} flex items-center justify-center shadow-lg border-4 border-white`}>
                      <span className="text-5xl font-bold text-white">
                        {doctor.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </motion.div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Tag color="blue" className="px-3 py-1 rounded-full text-sm font-medium">
                        {doctor.specialty}
                      </Tag>
                      <Tag color="green" className="px-3 py-1 rounded-full text-sm font-medium">
                        ✓ Có lịch hẹn
                      </Tag>
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{doctor.name}</h1>
                    <p className="text-gray-600 mb-4">{doctor.degree || 'Bác sĩ chuyên khoa'}</p>

                    {/* Meta Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                      <span className="flex items-center gap-2">
                        <ClockCircleOutlined className="text-blue-600" />
                        {doctor.experience || 0} năm kinh nghiệm
                      </span>
                      <span className="flex items-center gap-2">
                        <EnvironmentOutlined className="text-blue-600" />
                        {doctor.department}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-6">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{doctor.experience || 0}</div>
                        <div className="text-xs text-gray-500">Năm kinh nghiệm</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{doctor.completedAppointments || 0}+</div>
                        <div className="text-xs text-gray-500">Bệnh nhân</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">4.8★</div>
                        <div className="text-xs text-gray-500">Đánh giá</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemVariants}>
              <Card className="rounded-2xl shadow-sm">
                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={tabItems}
                  size="large"
                />
              </Card>
            </motion.div>
          </Col>

          {/* Sidebar */}
          <Col xs={24} lg={8}>
            <motion.div className="space-y-4">
              {/* Booking Card */}
              <motion.div variants={itemVariants}>
                <Card
                  className="rounded-2xl shadow-xl overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                  bordered={false}
                >
                  <div className="text-white">
                    <p className="text-sm opacity-90 mb-1">Phí khám dự kiến</p>
                    <div className="text-4xl font-bold mb-6">200.000đ</div>

                    <div className="space-y-3 mb-6 border-t border-white/20 pt-6">
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircleOutlined className="text-green-300" />
                        <span>Tư vấn chi tiết</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircleOutlined className="text-green-300" />
                        <span>Hỗ trợ bảo hiểm</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <CheckCircleOutlined className="text-green-300" />
                        <span>Đặt lịch linh hoạt</span>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<CalendarOutlined />}
                      onClick={() => navigate(`/booking?doctorId=${id}`)}
                      className="rounded-lg h-12 font-semibold bg-white text-blue-600 hover:bg-gray-50 border-0"
                    >
                      Đặt lịch khám ngay
                    </Button>
                  </div>
                </Card>
              </motion.div>

              {/* Info Card */}
              <motion.div variants={itemVariants}>
                <Card className="rounded-2xl shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Email</p>
                      <p className="text-gray-700 font-medium break-all">{doctor.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
                      <p className="text-gray-700 font-medium">{doctor.phone}</p>
                    </div>
                    {doctor.licenseNumber && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Giấy phép hành nghề</p>
                        <p className="text-gray-700 font-medium">{doctor.licenseNumber}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>

              {/* Support Card */}
              <motion.div variants={itemVariants}>
                <Card className="rounded-2xl shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                  <h3 className="font-semibold text-gray-900 mb-3">Cần tư vấn?</h3>
                  <Button
                    size="large"
                    block
                    icon={<MessageOutlined />}
                    type="primary"
                    className="rounded-lg mb-2 h-12 font-medium bg-blue-600"
                    onClick={() => navigate('/patient/messages', { state: { doctorId: doctor._id || doctor.userId?._id } })}
                  >
                    Nhắn tin tư vấn
                  </Button>
                  <Button
                    size="large"
                    block
                    icon={<PhoneOutlined />}
                    className="rounded-lg mb-2 h-12 font-medium"
                  >
                    Gọi 1900-xxxx
                  </Button>
                  <p className="text-xs text-gray-600 text-center">Miễn phí • 24/7</p>
                </Card>
              </motion.div>

              {/* Tags Card */}
              <motion.div variants={itemVariants}>
                <Card className="rounded-2xl shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-3">Chuyên môn</h3>
                  <div className="flex flex-wrap gap-2">
                    <Tag color="blue" className="rounded-full px-3 py-1">
                      {doctor.specialty}
                    </Tag>
                    {doctor.degree && (
                      <Tag color="cyan" className="rounded-full px-3 py-1">
                        {doctor.degree}
                      </Tag>
                    )}
                  </div>
                </Card>
              </motion.div>
            </motion.div>
          </Col>
        </Row>
      </div>
    </motion.div>
  );
};

export default DoctorDetail;
