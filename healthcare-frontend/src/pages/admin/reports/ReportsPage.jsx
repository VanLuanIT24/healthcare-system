// src/pages/admin/reports/ReportsPage.jsx - Báo cáo & Thống kê
import AdminLayout from '@/components/layout/admin/AdminLayout';
import reportAPI from '@/services/api/reportAPI';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Empty,
  message,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tabs,
  Tag,
} from 'antd';
import {
  DollarOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1', '#13c2c2'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('clinical');
  const [dateRange, setDateRange] = useState([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [loading, setLoading] = useState(false);
  const [clinicalData, setClinicalData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);
  const [hrData, setHRData] = useState(null);

  // Fetch reports dựa trên tab hiện tại
  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };

      const [clinical, financial, pharmacy, hr] = await Promise.all([
        reportAPI.getClinicalReport(params).catch(err => {
          console.error('Clinical report error:', err);
          return { data: { data: null } };
        }),
        reportAPI.getFinancialReport(params).catch(err => {
          console.error('Financial report error:', err);
          return { data: { data: null } };
        }),
        reportAPI.getPharmacyReport(params).catch(err => {
          console.error('Pharmacy report error:', err);
          return { data: { data: null } };
        }),
        reportAPI.getHRReport(params).catch(err => {
          console.error('HR report error:', err);
          return { data: { data: null } };
        }),
      ]);

      setClinicalData(clinical?.data?.data || null);
      setFinancialData(financial?.data?.data || null);
      setPharmacyData(pharmacy?.data?.data || null);
      setHRData(hr?.data?.data || null);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  // ===== BÁOO CÁO LÂM SÀNG =====
  const ClinicalReportTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={clinicalData?.appointmentStats?.total || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hoàn thành"
              value={clinicalData?.appointmentStats?.completed || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đang chờ"
              value={clinicalData?.appointmentStats?.pending || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bệnh nhân mới"
              value={clinicalData?.newPatients || 0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top 10 Bác sĩ theo số lịch hẹn">
        {clinicalData?.topDoctors && clinicalData.topDoctors.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={clinicalData.topDoctors}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="doctor.personalInfo.firstName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Tổng lịch hẹn" fill="#1890ff" />
              <Bar dataKey="completed" name="Hoàn thành" fill="#52c41a" />
            </BarChart>
          </ResponsiveContainer>
        ) : clinicalData ? (
          <Empty description="Chưa có dữ liệu" />
        ) : (
          <Empty description="Không thể tải dữ liệu" />
        )}
      </Card>
    </div>
  );

  // ===== BÁOO CÁO TÀI CHÍNH =====
  const FinancialReportTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={financialData?.summary?.totalRevenue || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={financialData?.summary?.paidAmount || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Chưa thanh toán"
              value={financialData?.summary?.unpaidAmount || 0}
              prefix={<DollarOutlined />}
              formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hóa đơn"
              value={financialData?.summary?.totalBills || 0}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Doanh thu theo ngày">
        {financialData?.revenueChart && financialData.revenueChart.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={financialData.revenueChart}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
              />
              <Legend />
              <Line type="monotone" dataKey="amount" stroke="#52c41a" />
            </LineChart>
          </ResponsiveContainer>
        ) : financialData ? (
          <Empty description="Chưa có dữ liệu" />
        ) : (
          <Empty description="Không thể tải dữ liệu" />
        )}
      </Card>

      <Card title="Doanh thu theo phương thức thanh toán">
        {financialData?.paymentMethods &&
        Object.keys(financialData.paymentMethods).length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={Object.entries(financialData.paymentMethods).map(
                  ([method, amount]) => ({
                    name: method,
                    value: amount,
                  })
                )}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) =>
                  `${name}: ${value.toLocaleString('vi-VN')}đ`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {Object.keys(financialData.paymentMethods).map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value.toLocaleString('vi-VN')}đ`}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : financialData ? (
          <Empty description="Chưa có dữ liệu" />
        ) : (
          <Empty description="Không thể tải dữ liệu" />
        )}
      </Card>
    </div>
  );

  // ===== BÁOO CÁO DƯỢC =====
  const PharmacyReportTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Tổng đơn thuốc"
              value={pharmacyData?.summary?.totalPrescriptions || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Đã phát hành"
              value={pharmacyData?.summary?.dispensedPrescriptions || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card>
            <Statistic
              title="Chờ xử lý"
              value={pharmacyData?.summary?.pendingPrescriptions || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Top 10 Thuốc được sử dụng nhiều nhất">
        {pharmacyData?.topMedications &&
        pharmacyData.topMedications.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={pharmacyData.topMedications}
              layout="vertical"
              margin={{ left: 200 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={200} />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" name="Số lần sử dụng" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        ) : pharmacyData ? (
          <Empty description="Chưa có dữ liệu" />
        ) : (
          <Empty description="Không thể tải dữ liệu" />
        )}
      </Card>
    </div>
  );

  // ===== BÁOO CÁO NHÂN SỰ =====
  const HRReportTab = () => (
    <div className="space-y-6">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng nhân sự"
              value={hrData?.summary?.totalStaff || 0}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bác sĩ"
              value={hrData?.summary?.doctors || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Y tá"
              value={hrData?.summary?.nurses || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Admin"
              value={hrData?.summary?.admins || 0}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Nhân viên hoạt động nhất">
        {hrData?.mostActiveStaff && hrData.mostActiveStaff.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hrData.mostActiveStaff}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="user.personalInfo.firstName" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="activities" name="Số hoạt động" fill="#722ed1" />
            </BarChart>
          </ResponsiveContainer>
        ) : hrData ? (
          <Empty description="Chưa có dữ liệu" />
        ) : (
          <Empty description="Không thể tải dữ liệu" />
        )}
      </Card>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold mb-4">Báo cáo & Thống kê</h1>

          {/* Filter */}
          <Card>
            <Space size="large" wrap>
              <DatePicker.RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
                format="YYYY-MM-DD"
                presets={[
                  { label: '7 ngày qua', value: [dayjs().subtract(7, 'd'), dayjs()] },
                  { label: '30 ngày qua', value: [dayjs().subtract(30, 'd'), dayjs()] },
                  { label: '3 tháng qua', value: [dayjs().subtract(3, 'M'), dayjs()] },
                  { label: '6 tháng qua', value: [dayjs().subtract(6, 'M'), dayjs()] },
                  { label: '1 năm qua', value: [dayjs().subtract(1, 'y'), dayjs()] },
                ]}
              />
              <Button type="primary" onClick={fetchReports} loading={loading}>
                Cập nhật
              </Button>
            </Space>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'clinical',
                label: '📋 Báo cáo Lâm sàng',
                children: loading ? <Spin /> : <ClinicalReportTab />,
              },
              {
                key: 'financial',
                label: '💰 Báo cáo Tài chính',
                children: loading ? <Spin /> : <FinancialReportTab />,
              },
              {
                key: 'pharmacy',
                label: '💊 Báo cáo Dược',
                children: loading ? <Spin /> : <PharmacyReportTab />,
              },
              {
                key: 'hr',
                label: '👥 Báo cáo Nhân sự',
                children: loading ? <Spin /> : <HRReportTab />,
              },
            ]}
          />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;

