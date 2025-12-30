// src/pages/public/Content/FAQPage.jsx
import {
    CheckCircleOutlined,
    MailOutlined,
    PhoneOutlined,
    QuestionCircleOutlined,
    SearchOutlined,
    ThunderboltOutlined
} from '@ant-design/icons';
import { Button, Card, Divider, Empty, Input, Tag } from 'antd';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const faqCategories = [
  { key: 'all', name: 'Tất cả', icon: '📋', color: '#1890ff' },
  { key: 'general', name: 'Câu hỏi chung', icon: '❓', color: '#f59e0b' },
  { key: 'booking', name: 'Đặt lịch khám', icon: '📅', color: '#3b82f6' },
  { key: 'payment', name: 'Thanh toán', icon: '💳', color: '#22c55e' },
  { key: 'insurance', name: 'Bảo hiểm', icon: '🏥', color: '#ec4899' },
  { key: 'services', name: 'Dịch vụ', icon: '⚕️', color: '#a855f7' },
  { key: 'technology', name: 'Công nghệ', icon: '🔬', color: '#06b6d4' },
];

const faqData = [
  // Câu hỏi chung
  { id: 1, category: 'general', question: 'Giờ làm việc của bệnh viện?', answer: 'Bệnh viện hoạt động từ 7:00 - 20:00 tất cả các ngày. Khoa Cấp cứu mở cửa 24/7 để phục vụ bệnh nhân. Các phòng khám chuyên khoa làm việc theo lịch cụ thể, bạn có thể kiểm tra trên website hoặc gọi hotline.', helpful: 245, updated: '2024-12-20' },
  { id: 2, category: 'general', question: 'Liên hệ bệnh viện?', answer: 'Hotline: 1800-XXXX | Email: info@healthcare.vn | Địa chỉ: 123 Nguyễn Văn Linh, Q.1, TP.HCM | Chat trực tuyến: www.healthcare.vn/chat | Facebook: Healthcare Việt Nam', helpful: 189, updated: '2024-12-15' },
  { id: 3, category: 'general', question: 'Bệnh viện có quốc tích?', answer: 'Đây là bệnh viện đa quốc tịch với đội ngũ bác sĩ, y tá từ 15 quốc gia. Chúng tôi phục vụ bệnh nhân quốc tế với hỗ trợ dịch thuật 12 ngôn ngữ.', helpful: 167, updated: '2024-12-18' },
  { id: 4, category: 'general', question: 'Bệnh viện có chiếu quân không?', answer: 'Healthcare được công nhân bộ Y tế 3 lần liên tiếp. Cơ sở vật chất được kiểm định quốc tế JCI. Kỹ thuật tiên tiến cạnh tranh khu vực.', helpful: 198, updated: '2024-12-19' },

  // Đặt lịch khám
  { id: 5, category: 'booking', question: 'Đặt lịch khám online?', answer: 'Bước 1: Vào website healthcare.vn → Bước 2: Chọn chuyên khoa và bác sĩ → Bước 3: Chọn ngày giờ phù hợp → Bước 4: Điền thông tin liên lạc → Bước 5: Xác nhận và thanh toán. Lịch sẽ được cấp ngay.', helpful: 567, updated: '2024-12-18' },
  { id: 6, category: 'booking', question: 'Hủy/đổi lịch hẹn?', answer: 'Có thể hủy hoặc đổi lịch tối thiểu 24 giờ trước giờ khám qua: 1. Website: Vào My Appointments > Chọn lịch > Hủy/Đổi 2. Hotline: 1800-XXXX 3. Ứng dụng di động. Nếu hủy dưới 24h sẽ bị tính phí 10%.', helpful: 312, updated: '2024-12-10' },
  { id: 7, category: 'booking', question: 'Giấy tờ cần mang?', answer: '✓ CMND/CCCD/Hộ chiếu ✓ Thẻ BHYT (nếu có) ✓ Kết quả xét nghiệm cũ (nếu có) ✓ Danh sách thuốc đang uống ✓ Hôn nhân chứng (nếu có thay đổi tên) ✓ Kết quả chụp ảnh X-quang, CT, MRI cũ (nếu có)', helpful: 421, updated: '2024-12-19' },
  { id: 8, category: 'booking', question: 'Tư vấn online trước khám?', answer: 'Có. Bạn có thể đặt cuộc tư vấn video với bác sĩ trước khi đến khám. Chi phí: 150.000đ/30 phút. Video call được thực hiện qua ứng dụng riêng hoặc Zoom. Sau tư vấn sẽ nhận được hóa đơn điện tử và hướng dẫn khám chi tiết.', helpful: 289, updated: '2024-12-17' },
  { id: 9, category: 'booking', question: 'Có thể đặt lịch cho người khác?', answer: 'Có, bạn có thể đặt lịch cho cha mẹ, con em hoặc bất kỳ ai. Cần cung cấp CMND của người cần khám và người đặt lịch. Trong trường hợp bệnh nhân là trẻ em, người đại diện phải có mặt tại bệnh viện.', helpful: 243, updated: '2024-12-20' },

  // Thanh toán
  { id: 10, category: 'payment', question: 'Hình thức thanh toán?', answer: 'Bệnh viện chấp nhận: 💵 Tiền mặt 🏦 Thẻ ngân hàng (Visa/Mastercard/JCB) 💳 Chuyển khoản ngân hàng 📱 Momo, ZaloPay, VNPay 💰 Ví điện tử 🏢 Hóa đơn công ty (phải có đơn vị ký thỏa thuận).', helpful: 198, updated: '2024-12-17' },
  { id: 11, category: 'payment', question: 'Giá khám công khai?', answer: 'Có, bảng giá khám chi tiết được công khai trên website, ứng dụng, quầy lễ tân và tất cả phòng khám. Không có chi phí phát sinh bất ngờ. Nếu cần xét nghiệm thêm, bác sĩ sẽ tư vấn trước và báo giá.', helpful: 276, updated: '2024-12-16' },
  { id: 12, category: 'payment', question: 'Có hóa đơn?', answer: 'Có. Hóa đơn điện tử được gửi email ngay sau khi thanh toán. Hóa đơn giấy có thể nhận tại quầy lễ tân hoặc in lại qua email. Công ty nhân viên vui lòng liên hệ để yêu cầu xuất hóa đơn công ty.', helpful: 267, updated: '2024-12-18' },
  { id: 13, category: 'payment', question: 'Có chương trình khuyến mãi?', answer: 'Có nhiều chương trình: 🎁 Khám tổng quát: Giảm 20% 👨‍👩‍👧‍👦 Gia đình: Giảm 15% cho thành viên thứ 2+ 🎓 Sinh viên: Giảm 30% 👵 Người cao tuổi: Giảm 25% 💑 Đăng ký gói: Giảm 10-30% tuỳ gói.', helpful: 412, updated: '2024-12-20' },

  // Bảo hiểm
  { id: 14, category: 'insurance', question: 'Công ty bảo hiểm liên kết?', answer: 'Bệnh viện hợp tác với 35+ công ty bảo hiểm: Bảo Việt, PVI, Bảo Minh, Liberty, AIA, Prudential, Manulife, Generali, Vietcare, Axa, Shinhan, Samsung, Hyundai, Toyota, Honda, Kia, Techcombank, VietinBank, VPBank, Tư nhân...', helpful: 334, updated: '2024-12-14' },
  { id: 15, category: 'insurance', question: 'Quy trình sử dụng BHYT?', answer: '1️⃣ Xuất trình thẻ BHYT và CMND tại quầy lễ tân 2️⃣ Tiếp tân check thông tin 3️⃣ Khám bệnh 4️⃣ Phần BHYT chi trả được trừ trực tiếp 5️⃣ Bệnh nhân chi trả phần còn lại. Nếu quý khách không có thẻ, vẫn có thể khám bình thường và thanh toán 100% sau đó hoàn trả.', helpful: 289, updated: '2024-12-19' },
  { id: 16, category: 'insurance', question: 'Chi phí khám không BHYT?', answer: 'Tất cả khám bệnh đều được chi trả từ BHYT nếu khám theo nội dung bảo hiểm. Chi phí ngoài danh mục BHYT (VD: vắc-xin tiêu chuẩn, dịch vụ VIP) bệnh nhân tự chi trả. Bác sĩ sẽ thông báo trước.', helpful: 256, updated: '2024-12-16' },

  // Dịch vụ
  { id: 17, category: 'services', question: 'Bệnh viện có bao nhiêu chuyên khoa?', answer: 'Bệnh viện có 25 chuyên khoa: 🫀 Tim mạch | 👶 Nhi khoa | 🤰 Sản phụ khoa | 🧠 Thần kinh | 🦵 Chấn thương chỉnh hình | 🩸 Hematology | 👁 Mắt | 🦷 Nha khoa | 👂 Tai Mũi Họng | 🫧 Tiêu hóa | 🫁 Hô hấp | Và nhiều chuyên khoa khác...', helpful: 456, updated: '2024-12-18' },
  { id: 18, category: 'services', question: 'Khám tại nhà?', answer: 'Có. Dịch vụ khám tại nhà (home service) được cung cấp cho bệnh nhân vô hiệu lực hoặc bận rộn. Liên hệ hotline để tư vấn và đặt lịch. Chi phí khám có thêm phí giao thông (100-200k) tuỳ khoảng cách. Thời gian phục vụ: 7:00 - 18:00.', helpful: 178, updated: '2024-12-19' },
  { id: 19, category: 'services', question: 'Dịch vụ telemedicine?', answer: 'Có tư vấn qua video call với bác sĩ. Tiện lợi, an toàn, nhanh chóng. Chi phí rẻ 30% so với khám trực tiếp. Được phát hành đơn thuốc điện tử có thể nhận tại nhà qua dịch vụ giao hàng. Phù hợp với tình trạng không cấp bách hoặc tái khám.', helpful: 523, updated: '2024-12-20' },
  { id: 20, category: 'services', question: 'Gói khám sức khoẻ định kỳ?', answer: 'Có 6 gói khám tổng quát từ 1.5 - 8 triệu: 🥉 Gói Cơ bản | 🥈 Gói Tiêu chuẩn | 🥇 Gói Cao cấp | 💎 Gói VIP | 👨‍👩‍👦 Gói Gia đình | 👔 Gói Doanh nhân. Mỗi gói có nội dung khác nhau phù hợp độ tuổi và nhu cầu.', helpful: 387, updated: '2024-12-17' },

  // Công nghệ
  { id: 21, category: 'technology', question: 'Bệnh viện sử dụng công nghệ gì?', answer: '🔬 Máy CT Siemens 128 dãy hiện đại 🎯 MRI 3.0 Tesla cao từ | 🦴 X-quang kỹ thuật số | 💉 Hệ thống EHR điện tử toàn bộ | 🤖 AI hỗ trợ chẩn đoán | 🛏️ Giường bệnh thông minh IoT | 📊 Hệ thống quản lý bệnh nhân hiện đại | 🔐 Bảo mật dữ liệu chuẩn quốc tế.', helpful: 401, updated: '2024-12-20' },
  { id: 22, category: 'technology', question: 'Có ứng dụng di động?', answer: 'Có ứng dụng Healthcare Mobile cho iOS và Android. Tính năng: 📱 Đặt lịch khám | 📋 Xem kết quả xét nghiệm | 💬 Chat với bác sĩ | 📞 Gọi hotline | 🏥 Kiểm tra giơi thiệu | 🔔 Nhận thông báo | 👤 Quản lý hồ sơ sức khoẻ. Tải miễn phí trên App Store/Google Play.', helpful: 512, updated: '2024-12-19' },
  { id: 23, category: 'technology', question: 'Dữ liệu cá nhân có bảo mật?', answer: 'Có. Tất cả dữ liệu bệnh nhân được mã hóa end-to-end và lưu trữ an toàn theo chuẩn HIPAA quốc tế. Chỉ nhân viên y tế có quyền truy cập. Bệnh viện không chia sẻ thông tin với bên thứ 3 mà không có sự đồng ý của bệnh nhân. Kiểm tra bảo mật định kỳ hàng quý.', helpful: 445, updated: '2024-12-18' },
  { id: 24, category: 'technology', question: 'Có thể xem kết quả xét nghiệm online?', answer: 'Có. Kết quả xét nghiệm được cập nhật online trong vòng 24-48h. Xem qua: 1️⃣ Website healthcare.vn 2️⃣ Ứng dụng Healthcare Mobile 3️⃣ Email tự động 4️⃣ SMS nhắc nhở. Bác sĩ sẽ liên hệ nếu kết quả cần theo dõi hoặc can thiệp.', helpful: 478, updated: '2024-12-20' },
  { id: 25, category: 'technology', question: 'Có thể thanh toán online?', answer: 'Có thanh toán trước khi khám qua website/ứng dụng. Hỗ trợ: 💳 Thẻ ngân hàng | 📱 Momo/ZaloPay/VNPay | 💰 Chuyển khoản ngân hàng | 🔐 Thanh toán được bảo mật 256-bit SSL. Nếu hủy lịch, tiền được hoàn lại trong 3-5 ngày làm việc.', helpful: 356, updated: '2024-12-19' },
];

const FAQPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredFAQs = faqData.filter(faq => {
    const matchSearch = faq.question.toLowerCase().includes(searchText.toLowerCase()) ||
                       faq.answer.toLowerCase().includes(searchText.toLowerCase());
    const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const categoryColors = {
    general: { bg: '#fef3c7', border: '#f59e0b', text: '#d97706', light: '#fffbeb' },
    booking: { bg: '#dbeafe', border: '#3b82f6', text: '#1d4ed8', light: '#eff6ff' },
    payment: { bg: '#dcfce7', border: '#22c55e', text: '#15803d', light: '#f0fdf4' },
    insurance: { bg: '#fce7f3', border: '#ec4899', text: '#be185d', light: '#fdf2f8' },
    services: { bg: '#e9d5ff', border: '#a855f7', text: '#7e22ce', light: '#faf5ff' },
    technology: { bg: '#cffafe', border: '#06b6d4', text: '#0e7490', light: '#ecf9fd' },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
      {/* Animated Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 py-16 mb-12"
      >
        <div className="absolute inset-0 opacity-10">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-white rounded-full"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -bottom-20 -left-20 w-60 h-60 bg-white rounded-full"
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="container mx-auto px-4 relative z-10"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <QuestionCircleOutlined className="text-5xl text-white" />
              </motion.div>
            </div>
            <h1 className="text-5xl font-bold text-white mb-2">Câu Hỏi Thường Gặp</h1>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">Tìm câu trả lời cho những thắc mắc của bạn về dịch vụ y tế của chúng tôi</p>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-10"
        >
          <Card className="border-0 shadow-xl rounded-2xl bg-white hover:shadow-2xl transition-shadow">
            <div className="relative">
              <Input
                placeholder="🔍 Tìm kiếm câu hỏi..."
                prefix={<SearchOutlined className="text-blue-500 text-lg" />}
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
                size="large"
                allowClear
                className="text-lg"
              />
              {searchText && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-gray-500 mt-3 flex items-center"
                >
                  <CheckCircleOutlined className="text-green-500 mr-2" />
                  Tìm thấy <span className="font-bold text-blue-600 mx-1">{filteredFAQs.length}</span> câu hỏi
                </motion.div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-12 flex flex-wrap gap-3"
        >
          {faqCategories.map((cat, idx) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type={selectedCategory === cat.key ? 'primary' : 'default'}
                onClick={() => setSelectedCategory(cat.key)}
                size="large"
                className={`rounded-full font-semibold transition-all ${
                  selectedCategory === cat.key
                    ? 'shadow-lg'
                    : 'hover:shadow-md'
                }`}
                style={
                  selectedCategory === cat.key
                    ? { background: cat.color, borderColor: cat.color }
                    : {}
                }
              >
                {cat.icon} {cat.name}
              </Button>
            </motion.div>
          ))}
        </motion.div>

        {/* FAQ List */}
        {filteredFAQs.length > 0 ? (
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredFAQs.map((faq, idx) => {
              const cat = faqCategories.find(c => c.key === faq.category);
              const colors = categoryColors[faq.category] || categoryColors['general'];

              return (
                <motion.div
                  key={faq.id}
                  variants={itemVariants}
                  layout
                  className="group"
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                    className="cursor-pointer"
                  >
                    <Card
                      className="border-0 rounded-xl hover:shadow-lg transition-all overflow-hidden"
                      style={{
                        borderLeft: `5px solid ${colors.border}`,
                        backgroundColor: expandedId === faq.id ? colors.light : 'white',
                      }}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <motion.h3
                            initial={false}
                            className="text-lg font-bold text-gray-900 flex items-start gap-3"
                          >
                            <motion.div
                              animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                              className="flex-shrink-0 mt-1"
                            >
                              <QuestionCircleOutlined
                                className="text-xl"
                                style={{ color: colors.border }}
                              />
                            </motion.div>
                            <span className="group-hover:text-blue-600 transition-colors">
                              {faq.question}
                            </span>
                          </motion.h3>

                          <motion.div
                            initial={false}
                            animate={{
                              opacity: expandedId === faq.id ? 1 : 0,
                              height: expandedId === faq.id ? 'auto' : 0,
                              marginTop: expandedId === faq.id ? 16 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                              {faq.answer}
                            </p>
                            <Divider className="my-3" />
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.15 }}
                              >
                                Cập nhật: {faq.updated}
                              </motion.span>
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-1"
                              >
                                <ThunderboltOutlined style={{ color: '#faad14' }} />
                                {faq.helpful} người thấy hữu ích
                              </motion.span>
                            </div>
                          </motion.div>
                        </div>
                        <motion.div
                          animate={{ rotate: expandedId === faq.id ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="flex-shrink-0"
                        >
                          <Tag
                            style={{
                              background: colors.bg,
                              color: colors.text,
                              border: `2px solid ${colors.border}`,
                              whiteSpace: 'nowrap',
                            }}
                            className="font-semibold"
                          >
                            {cat?.icon} {cat?.name}
                          </Tag>
                        </motion.div>
                      </div>
                    </Card>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="border-0 rounded-2xl shadow-lg p-12 text-center bg-gradient-to-b from-gray-50 to-white">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Empty
                  description={
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-gray-500 text-lg">😔 Không tìm thấy câu hỏi</p>
                      <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm từ khóa khác hoặc liên hệ với chúng tôi</p>
                    </motion.div>
                  }
                />
              </motion.div>
            </Card>
          </motion.div>
        )}

        {/* Help Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-16 relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-3xl"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="relative z-10 rounded-3xl p-8 md:p-12 text-white"
          >
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mb-4"
                >
                  <h3 className="text-3xl font-bold mb-2">Vẫn còn câu hỏi?</h3>
                </motion.div>
                <p className="text-blue-100 text-lg">Đội hỗ trợ khách hàng 24/7 luôn sẵn sàng giúp bạn</p>
              </motion.div>
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="primary"
                    size="large"
                    icon={<PhoneOutlined />}
                    className="w-full sm:w-auto bg-white text-blue-600 border-0 font-semibold shadow-lg hover:shadow-xl"
                    onClick={() => window.open('tel:1800XXXX')}
                  >
                    1800-XXXX
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="large"
                    icon={<MailOutlined />}
                    className="w-full sm:w-auto bg-blue-700 border-0 text-white font-semibold shadow-lg hover:shadow-xl"
                    onClick={() => navigate('/contact')}
                  >
                    Liên hệ
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: '📚', label: `${faqData.length} Câu hỏi`, color: 'blue' },
            { icon: '🏥', label: '25 Chuyên khoa', color: 'green' },
            { icon: '👨‍⚕️', label: '500+ Bác sĩ', color: 'purple' },
            { icon: '⭐', label: '4.9/5 Đánh giá', color: 'yellow' },
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1 + idx * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`bg-${stat.color}-50 border border-${stat.color}-200 rounded-xl p-4 text-center`}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <p className="font-semibold text-gray-800">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
