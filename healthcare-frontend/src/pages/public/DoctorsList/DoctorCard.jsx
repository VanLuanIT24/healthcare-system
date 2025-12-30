import { ClockCircleOutlined, MailOutlined, MessageOutlined, PhoneOutlined, StarOutlined } from '@ant-design/icons';
import { Button, Rate, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const DoctorCard = ({ doctor, index }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/doctors/${doctor.id}`);
  };

  const handleBooking = () => {
    navigate(`/booking?doctorId=${doctor.id}`);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        delay: index * 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      whileHover={{ y: -8, boxShadow: '0 20px 50px rgba(24, 144, 255, 0.2)' }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 h-full flex flex-col transition-shadow duration-300"
    >
      {/* Doctor Image */}
      <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden group">
        {doctor.image ? (
          <img
            src={doctor.image}
            alt={doctor.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-bold text-blue-200 mb-2">
                {doctor.name.charAt(0)}
              </div>
              <p className="text-gray-400">{doctor.specialty}</p>
            </div>
          </div>
        )}

        {/* Experience Badge */}
        <div className="absolute top-4 right-4">
          <Tag
            color="blue"
            className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-500 text-white border-none"
          >
            <ClockCircleOutlined className="mr-1" />
            {doctor.experience}+ năm
          </Tag>
        </div>

        {/* Rating Badge */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
          <div className="flex items-center gap-1">
            <Rate
              disabled
              defaultValue={5}
              count={5}
              style={{ fontSize: 14 }}
              character={<StarOutlined />}
            />
            <span className="text-sm font-semibold text-yellow-500">(5.0)</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Name */}
        <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
          {doctor.name}
        </h3>

        {/* Specialty */}
        <p className="text-sm text-blue-600 font-semibold mb-3">
          {doctor.specialty}
        </p>

        {/* Degree */}
        <p className="text-sm text-gray-600 mb-4">
          {doctor.degree}
        </p>

        {/* Department */}
        <div className="mb-4">
          <Tag color="cyan" className="text-xs">
            {doctor.department}
          </Tag>
        </div>

        {/* Contact Info */}
        <div className="space-y-2 mb-4 text-sm text-gray-600">
          {doctor.phone && (
            <div className="flex items-center gap-2">
              <PhoneOutlined className="text-blue-500" />
              <span className="line-clamp-1">{doctor.phone}</span>
            </div>
          )}
          {doctor.email && (
            <div className="flex items-center gap-2">
              <MailOutlined className="text-blue-500" />
              <span className="line-clamp-1">{doctor.email}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              type="default"
              block
              className="font-semibold border-blue-500 text-blue-500 hover:bg-blue-50 flex-1"
              onClick={handleViewProfile}
            >
              Xem hồ sơ
            </Button>
            <Button
              type="default"
              icon={<MessageOutlined />}
              className="border-blue-500 text-blue-500 hover:bg-blue-50"
              onClick={() => navigate('/patient/messages', { state: { doctorId: doctor.id || doctor._id, doctorName: doctor.name } })}
            >
              Nhắn tin tư vấn
            </Button>
          </div>
          <Button
            type="primary"
            block
            size="large"
            className="h-10 font-semibold bg-blue-500 hover:bg-blue-600"
            onClick={handleBooking}
          >
            Đặt lịch
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default DoctorCard;
