// src/pages/public/Home/HeroSection.jsx
import { CalendarOutlined, PlayCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { AutoComplete, Button, Input } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchOptions, setSearchOptions] = useState([]);
  const navigate = useNavigate();

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value)}`);
    }
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    if (value) {
      setSearchOptions([
        { value: 'Tim mạch', label: '🫀 Tim mạch' },
        { value: 'Nhi khoa', label: '👶 Nhi khoa' },
        { value: 'Da liễu', label: '🩺 Da liễu' },
        { value: 'Bs. Nguyễn Văn A', label: '👨‍⚕️ Bs. Nguyễn Văn A' },
      ].filter(opt => opt.value.toLowerCase().includes(value.toLowerCase())));
    } else {
      setSearchOptions([]);
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1920')`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-blue-900/70" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl"
          animate={{
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-sm">Phục vụ 24/7 • Khám từ xa</span>
            </motion.div>

            {/* Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Chăm sóc sức khỏe
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                Tận tâm & Chuyên nghiệp
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-xl">
              Đội ngũ bác sĩ hàng đầu, trang thiết bị hiện đại, dịch vụ y tế chất lượng cao. 
              Sức khỏe của bạn là ưu tiên hàng đầu của chúng tôi.
            </p>

            {/* Search Box */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <AutoComplete
                  className="flex-1"
                  options={searchOptions}
                  onSearch={handleSearchChange}
                  onSelect={handleSearch}
                  value={searchValue}
                  onChange={setSearchValue}
                >
                  <Input
                    size="large"
                    placeholder="Tìm bác sĩ, dịch vụ, chuyên khoa..."
                    prefix={<SearchOutlined className="text-gray-400" />}
                    className="rounded-xl h-12"
                    onPressEnter={() => handleSearch(searchValue)}
                  />
                </AutoComplete>
                <Button
                  type="primary"
                  size="large"
                  icon={<SearchOutlined />}
                  className="h-12 px-8 rounded-xl font-semibold"
                  onClick={() => handleSearch(searchValue)}
                >
                  Tìm kiếm
                </Button>
              </div>
              
              {/* Quick Search Tags */}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-gray-300 text-sm">Phổ biến:</span>
                {['Tim mạch', 'Nhi khoa', 'Sản phụ khoa', 'Xét nghiệm'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSearch(tag)}
                    className="text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                type="primary"
                size="large"
                icon={<CalendarOutlined />}
                onClick={() => navigate('/booking')}
                className="h-14 px-8 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl"
                style={{
                  background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                  border: 'none',
                }}
              >
                Đặt lịch khám ngay
              </Button>
              <Button
                size="large"
                icon={<PlayCircleOutlined />}
                className="h-14 px-8 rounded-xl font-semibold text-lg bg-white/10 text-white border-white/30 hover:bg-white/20"
              >
                Xem giới thiệu
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">JCI</div>
                <div className="text-xs text-gray-300">Chứng nhận</div>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">ISO</div>
                <div className="text-xs text-gray-300">9001:2015</div>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-xs text-gray-300">Cấp cứu</div>
              </div>
            </div>
          </motion.div>

          {/* Right - Image/Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block relative"
          >
            <div className="relative">
              {/* Main Image */}
              <img
                src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=600"
                alt="Doctor"
                className="w-full max-w-lg mx-auto rounded-3xl shadow-2xl"
              />
              
              {/* Floating Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -left-10 top-20 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✓</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">15,000+</div>
                    <div className="text-sm text-gray-500">Bệnh nhân tin tưởng</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute -right-5 bottom-20 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">4.9/5</div>
                    <div className="text-sm text-gray-500">Đánh giá cao</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-auto">
          <path
            fill="#ffffff"
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,64C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
