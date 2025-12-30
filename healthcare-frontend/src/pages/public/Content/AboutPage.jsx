// src/pages/public/Content/AboutPage.jsx
import { PageHeader } from '@/components/common';
import {
    GlobalOutlined,
    HeartOutlined,
    SafetyCertificateOutlined,
    StarOutlined,
    TeamOutlined,
    ThunderboltOutlined,
    TrophyOutlined
} from '@ant-design/icons';
import { Avatar, Card, Col, Row, Timeline } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AboutPage = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: <HeartOutlined className="text-2xl" />,
      title: 'Chăm Sóc Tân Tâm',
      description: 'Chúng tôi coi mỗi bệnh nhân như gia đình mình',
      color: '#ff4d4f',
    },
    {
      icon: <SafetyCertificateOutlined className="text-2xl" />,
      title: 'An Toàn & Vô Trùng',
      description: 'Tuân thủ tiêu chuẩn quốc tế cao nhất',
      color: '#52c41a',
    },
    {
      icon: <ThunderboltOutlined className="text-2xl" />,
      title: 'Hiệu Quả & Nhanh Chóng',
      description: 'Quy trình hiệu quả, giảm thời gian chờ đợi',
      color: '#faad14',
    },
    {
      icon: <GlobalOutlined className="text-2xl" />,
      title: 'Công Nghệ Hiện Đại',
      description: 'Thiết bị y tế tân tiến, kỹ thuật tiên tiến',
      color: '#1890ff',
    },
  ];

  const milestones = [
    { year: '2000', title: 'Thành lập', description: 'HealthCare được thành lập với 50 giường bệnh' },
    { year: '2005', title: 'Mở rộng', description: 'Mở rộng lên 200 giường, 15 chuyên khoa' },
    { year: '2010', title: 'ISO Certification', description: 'Đạt chứng nhận ISO 9001:2008' },
    { year: '2015', title: 'JCI Accreditation', description: 'Đạt chứng nhận JCI lần đầu tiên' },
    { year: '2020', title: 'Chuyển đổi số', description: 'Triển khai hệ thống quản lý bệnh viện thông minh' },
    { year: '2024', title: 'Hiện tại', description: '500 giường bệnh, 150+ bác sĩ, 25 chuyên khoa' },
  ];

  const leadership = [
    {
      name: 'GS.TS.BS Trần Văn Hùng',
      position: 'Giám đốc Bệnh viện',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300',
    },
    {
      name: 'PGS.TS.BS Nguyễn Thị Mai',
      position: 'Phó Giám đốc Chuyên môn',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300',
    },
    {
      name: 'ThS. Lê Hoàng Nam',
      position: 'Phó Giám đốc Hành chính',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300',
    },
  ];

  const achievements = [
    { number: '50,000+', label: 'Bệnh nhân chữa khỏi', icon: <HeartOutlined /> },
    { number: '150+', label: 'Bác sĩ chuyên gia', icon: <TeamOutlined /> },
    { number: '25+', label: 'Chuyên khoa', icon: <TrophyOutlined /> },
    { number: '4.9/5', label: 'Đánh giá trung bình', icon: <StarOutlined /> },
  ];

  return (
    <div>
      <PageHeader
        title="Về HealthCare"
        subtitle="Hơn 20 năm đồng hành cùng sức khỏe cộng đồng"
        backgroundImage="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920"
      />

      <div className="container mx-auto px-4 py-12">
        {/* Introduction */}
        <Row gutter={[48, 48]} align="middle" className="mb-16">
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Bệnh viện đa khoa hàng đầu Việt Nam
              </h2>
              <p className="text-gray-600 mb-4 leading-relaxed">
                HealthCare được thành lập năm 2000 với sứ mệnh mang đến dịch vụ chăm sóc 
                sức khỏe chất lượng cao cho người dân Việt Nam. Trải qua hơn 20 năm phát triển, 
                chúng tôi đã trở thành một trong những bệnh viện đa khoa uy tín nhất cả nước.
              </p>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Với đội ngũ hơn 150 bác sĩ chuyên khoa giàu kinh nghiệm, hệ thống trang thiết bị 
                y tế hiện đại nhập khẩu từ châu Âu, Mỹ, Nhật Bản, HealthCare cam kết mang đến 
                cho bệnh nhân trải nghiệm khám chữa bệnh tốt nhất.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <div className="flex items-center gap-2">
                  <SafetyCertificateOutlined className="text-2xl text-blue-500" />
                  <span className="font-medium">JCI Accredited</span>
                </div>
                <div className="flex items-center gap-2">
                  <StarOutlined className="text-2xl text-yellow-500" />
                  <span className="font-medium">ISO 9001:2015</span>
                </div>
              </div>
            </motion.div>
          </Col>
          <Col xs={24} lg={12}>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800"
                alt="HealthCare Hospital"
                className="rounded-2xl shadow-xl w-full"
              />
            </motion.div>
          </Col>
        </Row>

        {/* Vision & Mission */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-8 md:p-12 mb-16">
          <Row gutter={[48, 32]}>
            <Col xs={24} md={12}>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-4">Tầm nhìn</h3>
                <p className="text-blue-100 leading-relaxed">
                  Trở thành bệnh viện đa khoa hàng đầu khu vực Đông Nam Á, 
                  tiên phong trong ứng dụng công nghệ y tế hiện đại, 
                  mang đến dịch vụ chăm sóc sức khỏe đẳng cấp quốc tế.
                </p>
              </div>
            </Col>
            <Col xs={24} md={12}>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-4">Sứ mệnh</h3>
                <p className="text-blue-100 leading-relaxed">
                  Chăm sóc sức khỏe toàn diện cho mọi người với tâm huyết và 
                  chuyên môn cao nhất. Không ngừng nâng cao chất lượng dịch vụ 
                  để xứng đáng với sự tin tưởng của bệnh nhân.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Core Values */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Giá trị cốt lõi</h2>
          </div>
          <Row gutter={[24, 24]}>
            {values.map((value, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="h-full text-center rounded-xl hover:shadow-lg transition-shadow">
                    <div
                      className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: `${value.color}20`, color: value.color }}
                    >
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                    <p className="text-gray-600">{value.description}</p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>

        {/* Timeline */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Chặng đường phát triển</h2>
          </div>
          <Timeline
            mode="alternate"
            items={milestones.map(item => ({
              color: 'blue',
              children: (
                <Card className="rounded-xl">
                  <div className="text-blue-600 font-bold text-lg">{item.year}</div>
                  <div className="font-semibold text-gray-900">{item.title}</div>
                  <div className="text-gray-600 text-sm">{item.description}</div>
                </Card>
              ),
            }))}
          />
        </div>

        {/* Leadership */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900">Ban lãnh đạo</h2>
          </div>
          <Row gutter={[24, 24]} justify="center">
            {leadership.map((person, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center rounded-xl hover:shadow-lg transition-shadow">
                    <Avatar src={person.avatar} size={120} className="mb-4" />
                    <h3 className="text-lg font-bold text-gray-900">{person.name}</h3>
                    <p className="text-blue-600">{person.position}</p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
