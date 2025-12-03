import {
    CalendarOutlined,
    CustomerServiceOutlined,
    DownOutlined,
    EnvironmentOutlined,
    FacebookOutlined,
    HeartFilled,
    HomeOutlined,
    LinkedinOutlined,
    LockOutlined,
    LogoutOutlined,
    MailOutlined,
    PhoneOutlined,
    SettingOutlined,
    TwitterOutlined,
    UserOutlined,
    WalletOutlined,
    YoutubeOutlined
} from "@ant-design/icons";
import {
    Avatar,
    Button,
    Card,
    Col,
    Collapse,
    Divider,
    Dropdown,
    Input,
    Layout,
    Menu,
    Row,
    Space,
    Tag,
    Typography
} from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const { Header, Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const FAQPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchText, setSearchText] = useState("");

  // User menu
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/patient/profile")
    },
    {
      key: "change-password",
      icon: <LockOutlined />,
      label: "Đổi mật khẩu"
    },
    {
      key: "appointments",
      icon: <CalendarOutlined />,
      label: "Lịch khám",
      onClick: () => navigate("/patient/appointments")
    },
    {
      type: "divider"
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: logout
    }
  ];

  // FAQ data organized by category
  const faqData = {
    general: {
      title: "Câu hỏi chung",
      icon: <CustomerServiceOutlined />,
      color: "#1890ff",
      questions: [
        {
          question: "MediCare System là gì?",
          answer: "MediCare System là nền tảng quản lý y tế toàn diện, kết nối bệnh nhân với các cơ sở y tế và bác sĩ chuyên khoa. Hệ thống cung cấp các dịch vụ: đặt lịch khám, quản lý hồ sơ bệnh án điện tử, tư vấn trực tuyến, xét nghiệm, và theo dõi sức khỏe.",
          tags: ["Giới thiệu", "Tổng quan"]
        },
        {
          question: "Ai có thể sử dụng MediCare?",
          answer: "Mọi người từ 16 tuổi trở lên đều có thể đăng ký và sử dụng MediCare. Đối với trẻ em dưới 16 tuổi, phụ huynh có thể tạo tài khoản và quản lý thay. Hệ thống phục vụ cho cả bệnh nhân, bác sĩ, và quản trị viên cơ sở y tế.",
          tags: ["Đối tượng", "Độ tuổi"]
        },
        {
          question: "MediCare có miễn phí không?",
          answer: "Việc đăng ký tài khoản và sử dụng các tính năng cơ bản như quản lý hồ sơ, tra cứu thông tin là hoàn toàn miễn phí. Tuy nhiên, các dịch vụ y tế như khám bệnh, xét nghiệm, tư vấn trực tuyến sẽ có phí theo bảng giá công khai.",
          tags: ["Miễn phí", "Chi phí"]
        },
        {
          question: "Làm thế nào để liên hệ với bộ phận hỗ trợ?",
          answer: "Bạn có thể liên hệ qua: (1) Hotline 1900-xxxx (24/7), (2) Email: support@medicare.vn, (3) Live chat trên website/app (8h-22h), (4) Trực tiếp tại văn phòng MediCare tại 123 Đường ABC, TP.HCM.",
          tags: ["Liên hệ", "Hỗ trợ"]
        },
        {
          question: "MediCare hoạt động ở những khu vực nào?",
          answer: "Hiện tại MediCare đang hoạt động tại các thành phố lớn: TP. Hồ Chí Minh, Hà Nội, Đà Nẵng, Cần Thơ. Chúng tôi đang mở rộng dịch vụ ra các tỉnh thành khác. Dịch vụ tư vấn trực tuyến có thể sử dụng từ mọi nơi.",
          tags: ["Khu vực", "Địa điểm"]
        }
      ]
    },
    account: {
      title: "Tài khoản & Đăng nhập",
      icon: <UserOutlined />,
      color: "#52c41a",
      questions: [
        {
          question: "Làm thế nào để đăng ký tài khoản?",
          answer: "Bước 1: Truy cập website/app MediCare. Bước 2: Nhấn 'Đăng ký'. Bước 3: Điền thông tin: họ tên, số điện thoại, email, mật khẩu. Bước 4: Xác thực OTP qua SMS. Bước 5: Hoàn tất đăng ký và đăng nhập.",
          tags: ["Đăng ký", "Tài khoản mới"]
        },
        {
          question: "Tôi quên mật khẩu, phải làm sao?",
          answer: "Tại trang đăng nhập, nhấn 'Quên mật khẩu'. Nhập số điện thoại hoặc email đã đăng ký. Hệ thống sẽ gửi mã OTP để đặt lại mật khẩu. Nhập mã OTP và tạo mật khẩu mới. Lưu ý: Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.",
          tags: ["Quên mật khẩu", "Đặt lại"]
        },
        {
          question: "Có thể thay đổi số điện thoại đã đăng ký không?",
          answer: "Có thể. Vào 'Hồ sơ cá nhân' > 'Cài đặt tài khoản' > 'Thay đổi số điện thoại'. Nhập số điện thoại mới và xác thực bằng OTP. Lưu ý: Số điện thoại mới không được trùng với tài khoản khác trong hệ thống.",
          tags: ["Số điện thoại", "Cập nhật"]
        },
        {
          question: "Làm thế nào để xóa tài khoản?",
          answer: "Để xóa tài khoản, vui lòng liên hệ bộ phận hỗ trợ qua hotline 1900-xxxx hoặc email support@medicare.vn. Chúng tôi sẽ xử lý yêu cầu trong vòng 24h. Lưu ý: Sau khi xóa, toàn bộ dữ liệu sẽ bị xóa vĩnh viễn và không thể khôi phục.",
          tags: ["Xóa tài khoản", "Hủy"]
        },
        {
          question: "Tài khoản của tôi bị khóa, phải làm sao?",
          answer: "Tài khoản có thể bị khóa do: (1) Đăng nhập sai quá nhiều lần, (2) Vi phạm điều khoản sử dụng, (3) Hoạt động bất thường. Liên hệ ngay với bộ phận hỗ trợ qua hotline hoặc email để được mở khóa. Cần cung cấp CMND/CCCD để xác thực danh tính.",
          tags: ["Khóa tài khoản", "Mở khóa"]
        }
      ]
    },
    appointments: {
      title: "Đặt lịch & Khám bệnh",
      icon: <CalendarOutlined />,
      color: "#fa8c16",
      questions: [
        {
          question: "Làm thế nào để đặt lịch khám?",
          answer: "Bước 1: Đăng nhập tài khoản. Bước 2: Chọn 'Đặt lịch khám'. Bước 3: Chọn chuyên khoa hoặc bác sĩ. Bước 4: Chọn ngày và giờ phù hợp. Bước 5: Điền thông tin và lý do khám. Bước 6: Thanh toán và nhận xác nhận qua SMS/Email.",
          tags: ["Đặt lịch", "Khám bệnh"]
        },
        {
          question: "Có thể đặt lịch khám cho người thân không?",
          answer: "Có thể. Khi đặt lịch, chọn 'Đặt cho người thân'. Điền đầy đủ thông tin của người cần khám: họ tên, ngày sinh, CMND/CCCD, số điện thoại. Bạn sẽ nhận được thông báo về lịch hẹn và có thể quản lý lịch hẹn này trong tài khoản của mình.",
          tags: ["Người thân", "Đại diện"]
        },
        {
          question: "Tôi có thể hủy hoặc đổi lịch hẹn không?",
          answer: "Có thể. Vào 'Lịch hẹn của tôi', chọn lịch cần thay đổi. Chính sách: (1) Hủy trước 24h: hoàn 100% phí. (2) Hủy 12-24h: hoàn 50%. (3) Hủy dưới 12h: không hoàn phí. Đổi lịch miễn phí nếu còn slot trống và thực hiện trước 12h.",
          tags: ["Hủy lịch", "Đổi lịch"]
        },
        {
          question: "Tôi nên đến sớm bao lâu trước giờ hẹn?",
          answer: "Nên đến trước 15-20 phút để: (1) Làm thủ tục đăng ký, (2) Cập nhật thông tin (nếu cần), (3) Thanh toán phần còn lại (nếu chưa thanh toán online), (4) Chờ gọi khám đúng giờ. Đến đúng giờ hoặc muộn có thể phải chờ lâu hơn.",
          tags: ["Giờ hẹn", "Thủ tục"]
        },
        {
          question: "Tôi cần mang theo những gì khi đi khám?",
          answer: "Cần mang theo: (1) CMND/CCCD/Hộ chiếu, (2) Thẻ bảo hiểm y tế (nếu có), (3) Hồ sơ bệnh án cũ (nếu có), (4) Kết quả xét nghiệm/chẩn đoán hình ảnh gần đây (nếu có), (5) Danh sách thuốc đang dùng. Có thể xuất trình mã QR trên app thay vì giấy tờ.",
          tags: ["Chuẩn bị", "Giấy tờ"]
        },
        {
          question: "Có thể khám bệnh mà không cần đặt lịch trước không?",
          answer: "Có thể, nhưng: (1) Thời gian chờ có thể lâu hơn, (2) Không đảm bảo được khám với bác sĩ mong muốn, (3) Có thể phải chờ đến khi có slot trống. Chúng tôi khuyến khích đặt lịch trước để được phục vụ tốt nhất.",
          tags: ["Không đặt lịch", "Khám trực tiếp"]
        }
      ]
    },
    services: {
      title: "Dịch vụ & Giá cả",
      icon: <WalletOutlined />,
      color: "#722ed1",
      questions: [
        {
          question: "Có những dịch vụ nào tại MediCare?",
          answer: "MediCare cung cấp: (1) Khám bệnh: tổng quát, chuyên khoa. (2) Xét nghiệm: máu, nước tiểu, vi sinh, hóa sinh. (3) Chẩn đoán hình ảnh: X-quang, CT, MRI, siêu âm. (4) Tư vấn trực tuyến: video call với bác sĩ. (5) Tiêm chủng. (6) Phẫu thuật. (7) Nhà thuốc.",
          tags: ["Dịch vụ", "Danh mục"]
        },
        {
          question: "Giá khám bệnh là bao nhiêu?",
          answer: "Giá tham khảo: Khám tổng quát: 500.000đ. Khám chuyên khoa: 300.000-500.000đ. Tư vấn online: 200.000đ. Xét nghiệm: từ 100.000đ tùy loại. Giá có thể thay đổi theo bác sĩ và dịch vụ cụ thể. Xem bảng giá chi tiết tại website hoặc liên hệ tổng đài.",
          tags: ["Giá cả", "Chi phí"]
        },
        {
          question: "MediCare có chấp nhận bảo hiểm y tế không?",
          answer: "Có. Chúng tôi chấp nhận: (1) BHYT bắt buộc (thẻ BHYT của Nhà nước), (2) Bảo hiểm tư nhân từ các công ty: Bảo Việt, Prudential, Manulife, AIA, FWD, v.v. Vui lòng xuất trình thẻ bảo hiểm khi đăng ký khám. Một số dịch vụ có thể không được bảo hiểm chi trả.",
          tags: ["Bảo hiểm", "BHYT"]
        },
        {
          question: "Có hỗ trợ trả góp không?",
          answer: "Có. Hỗ trợ trả góp 0% lãi suất cho đơn hàng từ 5 triệu đồng qua thẻ tín dụng của các ngân hàng: Vietcombank, VietinBank, BIDV, Techcombank, MB Bank, VP Bank. Kỳ hạn: 3, 6, hoặc 12 tháng tùy giá trị đơn hàng.",
          tags: ["Trả góp", "Tín dụng"]
        },
        {
          question: "Có chương trình ưu đãi hoặc giảm giá không?",
          answer: "Có. Chúng tôi thường xuyên có các chương trình: (1) Giảm giá cho khách hàng mới, (2) Ưu đãi cho gói khám định kỳ, (3) Khuyến mãi theo mùa (Tết, 30/4, 2/9...), (4) Voucher qua các đối tác. Theo dõi fanpage, email, hoặc app để cập nhật ưu đãi mới nhất.",
          tags: ["Ưu đãi", "Khuyến mãi"]
        }
      ]
    },
    payment: {
      title: "Thanh toán",
      icon: <WalletOutlined />,
      color: "#13c2c2",
      questions: [
        {
          question: "Có những phương thức thanh toán nào?",
          answer: "MediCare hỗ trợ: (1) Thẻ tín dụng/ghi nợ (Visa, MasterCard, JCB), (2) Ví điện tử (MoMo, ZaloPay, VNPay, ShopeePay), (3) Chuyển khoản ngân hàng (Internet/Mobile Banking), (4) Thanh toán tại quầy (tiền mặt, quẹt thẻ, QR). Tất cả không thu phí giao dịch.",
          tags: ["Phương thức", "Thanh toán"]
        },
        {
          question: "Thanh toán online có an toàn không?",
          answer: "Hoàn toàn an toàn. Chúng tôi sử dụng: (1) Mã hóa SSL 256-bit cho mọi giao dịch, (2) Tuân thủ chuẩn PCI DSS quốc tế, (3) Xác thực OTP 2 lớp, (4) Không lưu trữ thông tin thẻ. Được chứng nhận bởi Verisign, McAfee Secure, Norton Secured.",
          tags: ["An toàn", "Bảo mật"]
        },
        {
          question: "Khi nào tôi nhận được hóa đơn?",
          answer: "Hóa đơn điện tử được gửi tự động qua email ngay sau khi thanh toán thành công. Bạn cũng có thể: (1) Tải xuống từ mục 'Lịch sử giao dịch' trên app/website, (2) Yêu cầu in hóa đơn giấy tại quầy, (3) Yêu cầu xuất hóa đơn GTGT (cần cung cấp thông tin công ty).",
          tags: ["Hóa đơn", "Biên lai"]
        },
        {
          question: "Làm thế nào để được hoàn tiền?",
          answer: "Điều kiện hoàn tiền: (1) Hủy lịch trước 24h: hoàn 100%, (2) Hủy 12-24h: hoàn 50%, (3) Dưới 12h: không hoàn. Quy trình: Gửi yêu cầu hủy > Xử lý trong 24h > Nhận xác nhận > Tiền về tài khoản trong 5-7 ngày làm việc.",
          tags: ["Hoàn tiền", "Hủy lịch"]
        },
        {
          question: "Có phí ẩn nào không?",
          answer: "Không có phí ẩn. Giá dịch vụ công khai và minh bạch. Bạn sẽ được thông báo rõ ràng về tất cả chi phí trước khi thanh toán. Nếu phát sinh thêm chi phí (ví dụ: thêm xét nghiệm), bác sĩ sẽ tư vấn và xin phép trước.",
          tags: ["Phí", "Chi phí ẩn"]
        }
      ]
    },
    technical: {
      title: "Kỹ thuật & Bảo mật",
      icon: <SettingOutlined />,
      color: "#eb2f96",
      questions: [
        {
          question: "Dữ liệu của tôi có được bảo mật không?",
          answer: "Tuyệt đối bảo mật. Chúng tôi: (1) Mã hóa AES-256 khi lưu trữ, TLS/SSL khi truyền tải, (2) Tuân thủ HIPAA và ISO 27001, (3) Phân quyền nghiêm ngặt, chỉ nhân viên được ủy quyền mới truy cập, (4) Sao lưu tự động hàng ngày, (5) Không bán hoặc chia sẻ dữ liệu cho bên thứ ba.",
          tags: ["Bảo mật", "Dữ liệu"]
        },
        {
          question: "App có hoạt động trên điện thoại nào?",
          answer: "App MediCare hoạt động trên: (1) Android 6.0 trở lên, (2) iOS 12.0 trở lên. Tải app từ: (1) Google Play Store (Android), (2) App Store (iOS). Bạn cũng có thể sử dụng phiên bản web trên trình duyệt (Chrome, Firefox, Safari, Edge).",
          tags: ["App", "Tương thích"]
        },
        {
          question: "Tôi gặp lỗi khi sử dụng, phải làm sao?",
          answer: "Thử các cách sau: (1) Kiểm tra kết nối internet, (2) Thoát và đăng nhập lại, (3) Xóa cache/cookies, (4) Cập nhật app lên phiên bản mới nhất, (5) Khởi động lại thiết bị. Nếu vẫn lỗi, liên hệ: hotline 1900-xxxx hoặc email support@medicare.vn (kèm ảnh chụp màn hình lỗi).",
          tags: ["Lỗi", "Sự cố"]
        },
        {
          question: "Làm thế nào để cập nhật thông tin cá nhân?",
          answer: "Vào 'Hồ sơ cá nhân' > 'Chỉnh sửa thông tin'. Bạn có thể cập nhật: họ tên, ngày sinh, địa chỉ, email, ảnh đại diện, tiền sử bệnh. Một số thông tin như số CMND, số điện thoại cần liên hệ hỗ trợ để thay đổi (vì lý do bảo mật).",
          tags: ["Cập nhật", "Thông tin"]
        },
        {
          question: "Có thể sử dụng MediCare trên nhiều thiết bị không?",
          answer: "Có thể. Bạn có thể đăng nhập cùng một tài khoản trên nhiều thiết bị (điện thoại, tablet, máy tính). Dữ liệu được đồng bộ tự động. Nếu phát hiện hoạt động bất thường, hệ thống sẽ gửi cảnh báo và có thể yêu cầu xác thực lại.",
          tags: ["Nhiều thiết bị", "Đồng bộ"]
        }
      ]
    }
  };

  // Filter FAQ based on category and search
  const getFilteredQuestions = () => {
    let questions = [];
    
    if (activeCategory === "all") {
      Object.values(faqData).forEach(category => {
        questions = [...questions, ...category.questions];
      });
    } else {
      questions = faqData[activeCategory]?.questions || [];
    }

    if (searchText) {
      questions = questions.filter(q => 
        q.question.toLowerCase().includes(searchText.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchText.toLowerCase()) ||
        q.tags.some(tag => tag.toLowerCase().includes(searchText.toLowerCase()))
      );
    }

    return questions;
  };

  const filteredQuestions = getFilteredQuestions();

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Header */}
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1000,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "0 50px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "#1890ff",
              cursor: "pointer"
            }}
            onClick={() => navigate("/")}
          >
            <HeartFilled /> MediCare
          </div>
        </div>

        <Menu
          mode="horizontal"
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            justifyContent: "center"
          }}
        >
          <Menu.Item key="home" onClick={() => navigate("/")}>
            <HomeOutlined /> Trang chủ
          </Menu.Item>
          <Menu.SubMenu
            key="about"
            title={
              <span>
                Giới thiệu <DownOutlined />
              </span>
            }
          >
            <Menu.Item key="about-us" onClick={() => navigate("/about")}>
              Về chúng tôi
            </Menu.Item>
            <Menu.Item key="doctors" onClick={() => navigate("/doctors")}>
              Đội ngũ bác sĩ
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu
            key="services"
            title={
              <span>
                Dịch vụ <DownOutlined />
              </span>
            }
          >
            <Menu.Item key="services-all" onClick={() => navigate("/services")}>
              Tất cả dịch vụ
            </Menu.Item>
            <Menu.Item key="consultation" onClick={() => navigate("/consultation")}>
              Tư vấn trực tuyến
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="news" onClick={() => navigate("/news")}>
            Tin tức
          </Menu.Item>
          <Menu.Item key="contact" onClick={() => navigate("/contact")}>
            Liên hệ
          </Menu.Item>
        </Menu>

        <Space size="large">
          {user ? (
            <Dropdown menu={{ items: userMenuItems }} trigger={["click"]}>
              <Space style={{ cursor: "pointer" }}>
                <Avatar icon={<UserOutlined />} src={user.avatar} />
                <span>{user.fullName || user.email}</span>
                <DownOutlined />
              </Space>
            </Dropdown>
          ) : (
            <>
              <Button type="link" onClick={() => navigate("/login")}>
                Đăng nhập
              </Button>
              <Button type="primary" onClick={() => navigate("/register")}>
                Đăng ký
              </Button>
            </>
          )}
        </Space>
      </Header>

      {/* Content */}
      <Content style={{ padding: "50px" }}>
        {/* Hero Section */}
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            background: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            borderRadius: 16,
            marginBottom: 60,
            color: "#333"
          }}
        >
          <CustomerServiceOutlined style={{ fontSize: 64, marginBottom: 20, color: "#1890ff" }} />
          <Title level={1} style={{ marginBottom: 16 }}>
            Câu Hỏi Thường Gặp (FAQ)
          </Title>
          <Paragraph style={{ fontSize: 16, marginBottom: 32, maxWidth: 600, margin: "0 auto 32px" }}>
            Tìm câu trả lời nhanh chóng cho các câu hỏi phổ biến về dịch vụ MediCare
          </Paragraph>

          {/* Search Bar */}
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <Search
              placeholder="Tìm kiếm câu hỏi..."
              size="large"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ borderRadius: 50 }}
            />
          </div>
        </div>

        <Row gutter={32}>
          {/* Sidebar Categories */}
          <Col xs={24} md={6}>
            <Card
              style={{
                position: "sticky",
                top: 80
              }}
            >
              <Title level={5} style={{ marginBottom: 16 }}>Danh mục</Title>
              <Space direction="vertical" style={{ width: "100%" }} size="small">
                <Button
                  type={activeCategory === "all" ? "primary" : "default"}
                  block
                  onClick={() => setActiveCategory("all")}
                  style={{ textAlign: "left" }}
                >
                  <CustomerServiceOutlined /> Tất cả câu hỏi
                </Button>
                {Object.keys(faqData).map(key => (
                  <Button
                    key={key}
                    type={activeCategory === key ? "primary" : "default"}
                    block
                    onClick={() => setActiveCategory(key)}
                    style={{ textAlign: "left" }}
                  >
                    {faqData[key].icon} {faqData[key].title}
                  </Button>
                ))}
              </Space>

              <Divider />

              <Card size="small" style={{ background: "#e6f7ff", marginTop: 16 }}>
                <Text strong style={{ fontSize: 14 }}>
                  <CustomerServiceOutlined /> Cần hỗ trợ thêm?
                </Text>
                <br />
                <Text style={{ fontSize: 13 }}>
                  Hotline: <Text strong>1900-xxxx</Text>
                  <br />
                  Email: support@medicare.vn
                </Text>
              </Card>
            </Card>
          </Col>

          {/* Main Content - FAQ List */}
          <Col xs={24} md={18}>
            <Card>
              <Title level={3} style={{ marginBottom: 24 }}>
                {activeCategory === "all" 
                  ? "Tất cả câu hỏi" 
                  : faqData[activeCategory]?.title
                }
                <Tag color="blue" style={{ marginLeft: 12 }}>
                  {filteredQuestions.length} câu hỏi
                </Tag>
              </Title>

              {searchText && (
                <div style={{ marginBottom: 16 }}>
                  <Text type="secondary">
                    Kết quả tìm kiếm cho: <Text strong>"{searchText}"</Text>
                  </Text>
                </div>
              )}

              <Collapse
                accordion
                variant="borderless"
                style={{ background: "#fafafa" }}
              >
                {filteredQuestions.map((faq, index) => (
                  <Collapse.Panel
                    key={index}
                    header={
                      <Space>
                        <CustomerServiceOutlined style={{ color: "#1890ff" }} />
                        <Text strong>{faq.question}</Text>
                      </Space>
                    }
                    extra={
                      <Space size="small">
                        {faq.tags.map((tag, i) => (
                          <Tag key={i} color="blue" style={{ fontSize: 11 }}>
                            {tag}
                          </Tag>
                        ))}
                      </Space>
                    }
                  >
                    <div style={{ paddingLeft: 32 }}>
                      <Paragraph style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 0 }}>
                        {faq.answer}
                      </Paragraph>
                    </div>
                  </Collapse.Panel>
                ))}
              </Collapse>

              {filteredQuestions.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <CustomerServiceOutlined style={{ fontSize: 64, color: "#d9d9d9", marginBottom: 16 }} />
                  <br />
                  <Text type="secondary" style={{ fontSize: 16 }}>
                    Không tìm thấy câu hỏi phù hợp
                  </Text>
                  <br />
                  <Button 
                    type="link" 
                    onClick={() => {
                      setSearchText("");
                      setActiveCategory("all");
                    }}
                  >
                    Xem tất cả câu hỏi
                  </Button>
                </div>
              )}
            </Card>

            {/* Quick Links */}
            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}
                  onClick={() => navigate("/user-guide")}
                >
                  <Title level={5} style={{ color: "white" }}>
                    📘 Hướng dẫn sử dụng
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                    Xem hướng dẫn chi tiết cách sử dụng MediCare
                  </Text>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card
                  hoverable
                  style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", color: "white" }}
                  onClick={() => navigate("/contact")}
                >
                  <Title level={5} style={{ color: "white" }}>
                    💬 Liên hệ hỗ trợ
                  </Title>
                  <Text style={{ color: "rgba(255,255,255,0.9)" }}>
                    Không tìm thấy câu trả lời? Liên hệ với chúng tôi
                  </Text>
                </Card>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* Popular Topics */}
        <Card style={{ marginTop: 60 }}>
          <Title level={3} style={{ textAlign: "center", marginBottom: 40 }}>
            Chủ đề phổ biến
          </Title>
          <Row gutter={[24, 24]}>
            {Object.keys(faqData).map(key => (
              <Col xs={24} sm={12} md={8} key={key}>
                <Card
                  hoverable
                  onClick={() => {
                    setActiveCategory(key);
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  style={{ textAlign: "center", height: "100%" }}
                >
                  <div style={{ fontSize: 48, color: faqData[key].color, marginBottom: 16 }}>
                    {faqData[key].icon}
                  </div>
                  <Title level={5}>{faqData[key].title}</Title>
                  <Text type="secondary">
                    {faqData[key].questions.length} câu hỏi
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Contact CTA */}
        <div
          style={{
            marginTop: 60,
            padding: "60px 40px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: 16,
            textAlign: "center",
            color: "white"
          }}
        >
          <Title level={2} style={{ color: "white", marginBottom: 20 }}>
            Vẫn cần hỗ trợ?
          </Title>
          <Paragraph style={{ fontSize: 16, color: "rgba(255,255,255,0.9)", marginBottom: 30 }}>
            Đội ngũ chăm sóc khách hàng của chúng tôi sẵn sàng hỗ trợ bạn 24/7
          </Paragraph>
          <Space size="large" wrap>
            <Button
              type="primary"
              size="large"
              icon={<PhoneOutlined />}
              style={{ background: "#52c41a", borderColor: "#52c41a", height: 48, fontSize: 16 }}
            >
              Gọi ngay: 1900-xxxx
            </Button>
            <Button
              size="large"
              icon={<MailOutlined />}
              style={{ background: "white", color: "#722ed1", height: 48, fontSize: 16 }}
              onClick={() => navigate("/contact")}
            >
              Gửi email hỗ trợ
            </Button>
          </Space>
        </div>
      </Content>

      {/* Footer */}
      <Footer
        style={{
          background: "linear-gradient(135deg, #0F5B8C 0%, #1890ff 100%)",
          color: "white",
          padding: "60px 50px 30px",
          marginTop: 60
        }}
      >
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "white", marginBottom: 20 }}>
              <HeartFilled style={{ marginRight: 8 }} />
              MediCare System
            </Title>
            <Space direction="vertical" size="middle">
              <div>
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                  123 Đường ABC, Quận XYZ, TP.HCM
                </Text>
              </div>
              <div>
                <PhoneOutlined style={{ marginRight: 8 }} />
                <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                  Hotline: 1900-xxxx
                </Text>
              </div>
              <div>
                <MailOutlined style={{ marginRight: 8 }} />
                <Text style={{ color: "rgba(255,255,255,0.85)" }}>
                  Email: support@medicare.vn
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "white", marginBottom: 20 }}>
              Liên kết nhanh
            </Title>
            <Space direction="vertical" size="small">
              <a onClick={() => navigate("/about")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Giới thiệu</a>
              <a onClick={() => navigate("/services")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Dịch vụ</a>
              <a onClick={() => navigate("/news")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Tin tức</a>
              <a onClick={() => navigate("/careers")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Tuyển dụng</a>
              <a onClick={() => navigate("/contact")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>Liên hệ</a>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "white", marginBottom: 20 }}>
              Chính sách
            </Title>
            <Space direction="vertical" size="small">
              <a onClick={() => navigate("/privacy-policy")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
                Chính sách bảo mật
              </a>
              <a onClick={() => navigate("/terms-of-service")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
                Điều khoản sử dụng
              </a>
              <a onClick={() => navigate("/user-guide")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
                Hướng dẫn sử dụng
              </a>
              <a onClick={() => navigate("/payment-policy")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
                Quy định thanh toán
              </a>
              <a onClick={() => navigate("/faq")} style={{ color: "rgba(255,255,255,0.85)", display: "block", cursor: "pointer" }}>
                Câu hỏi thường gặp
              </a>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: "white", marginBottom: 20 }}>
              Đăng ký nhận tin
            </Title>
            <Paragraph style={{ color: "rgba(255,255,255,0.85)", marginBottom: 16 }}>
              Nhận thông tin khuyến mãi và bài viết sức khỏe mỗi tuần
            </Paragraph>
            <Space.Compact style={{ width: "100%" }}>
              <Input
                placeholder="Email của bạn"
                style={{ borderRadius: "4px 0 0 4px" }}
              />
              <Button
                type="primary"
                style={{
                  background: "#52c41a",
                  borderColor: "#52c41a",
                  borderRadius: "0 4px 4px 0"
                }}
              >
                Đăng ký
              </Button>
            </Space.Compact>

            <div style={{ marginTop: 24 }}>
              <Text style={{ color: "rgba(255,255,255,0.85)", display: "block", marginBottom: 12 }}>
                Theo dõi chúng tôi
              </Text>
              <Space size="middle">
                <FacebookOutlined style={{ fontSize: 24, cursor: "pointer" }} />
                <TwitterOutlined style={{ fontSize: 24, cursor: "pointer" }} />
                <LinkedinOutlined style={{ fontSize: 24, cursor: "pointer" }} />
                <YoutubeOutlined style={{ fontSize: 24, cursor: "pointer" }} />
              </Space>
            </div>
          </Col>
        </Row>

        <Divider style={{ borderColor: "rgba(255,255,255,0.2)", margin: "40px 0 20px" }} />

        <Row justify="space-between" align="middle">
          <Col xs={24} md={12} style={{ textAlign: "center", marginBottom: 10 }}>
            <Text style={{ color: "rgba(255,255,255,0.85)" }}>
              © 2024 MediCare System. All rights reserved.
            </Text>
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "center" }}>
            <Space split={<Divider type="vertical" style={{ borderColor: "rgba(255,255,255,0.3)" }} />}>
              <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                Đối tác: Bệnh viện ABC
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12 }}>
                Công ty XYZ
              </Text>
            </Space>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
};

export default FAQPage;
