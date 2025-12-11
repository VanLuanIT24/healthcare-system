// 📊 Enhanced Clinical Reports với Charts & Analytics
import {
    BarChartOutlined,
    CalendarOutlined,
    DollarOutlined,
    DownloadOutlined,
    FallOutlined,
    FileTextOutlined,
    LineChartOutlined,
    MedicineBoxOutlined,
    RiseOutlined,
    TeamOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Empty,
    message,
    Row,
    Select,
    Space,
    Spin,
    Statistic,
    Table,
    Tabs,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import reportAPI from '../../services/api/reportAPI';
import designSystem from '../../theme/designSystem';
import './Reports.css';

const { RangePicker } = DatePicker;
const { TabPane } = Tabs;
const { Option } = Select;
const { colors } = designSystem;

const ClinicalReportsEnhanced = () => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [activeTab, setActiveTab] = useState('clinical');
  const [clinicalData, setClinicalData] = useState(null);
  const [financialData, setFinancialData] = useState(null);
  const [pharmacyData, setPharmacyData] = useState(null);
  const [hrData, setHRData] = useState(null);

  const CHART_COLORS = [
    colors.primary[500],
    colors.success[500],
    colors.warning[500],
    colors.error[500],
    colors.info[500],
    colors.secondary[500],
  ];

  useEffect(() => {
    loadReportData();
  }, [dateRange, activeTab]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      };

      switch (activeTab) {
        case 'clinical':
          await loadClinicalReport(params);
          break;
        case 'financial':
          await loadFinancialReport(params);
          break;
        case 'pharmacy':
          await loadPharmacyReport(params);
          break;
        case 'hr':
          await loadHRReport(params);
          break;
        default:
          break;
      }
    } catch (error) {
      message.error('Không thể tải báo cáo');
      console.error('Load report error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClinicalReport = async (params) => {
    try {
      const response = await reportAPI.getClinicalReport(params);
      setClinicalData(response.data?.data || response.data);
    } catch (error) {
      console.error('Load clinical report error:', error);
    }
  };

  const loadFinancialReport = async (params) => {
    try {
      const response = await reportAPI.getFinancialReport(params);
      setFinancialData(response.data?.data || response.data);
    } catch (error) {
      console.error('Load financial report error:', error);
    }
  };

  const loadPharmacyReport = async (params) => {
    try {
      const response = await reportAPI.getPharmacyReport(params);
      setPharmacyData(response.data?.data || response.data);
    } catch (error) {
      console.error('Load pharmacy report error:', error);
    }
  };

  const loadHRReport = async (params) => {
    try {
      const response = await reportAPI.getHRReport(params);
      setHRData(response.data?.data || response.data);
    } catch (error) {
      console.error('Load HR report error:', error);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await reportAPI.exportReportToPDF(activeTab, {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTab}-report-${moment().format('YYYY-MM-DD')}.pdf`;
      link.click();
      message.success('Đã xuất báo cáo PDF');
    } catch (error) {
      message.error('Xuất PDF thất bại');
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await reportAPI.exportReportToExcel(activeTab, {
        startDate: dateRange[0].format('YYYY-MM-DD'),
        endDate: dateRange[1].format('YYYY-MM-DD'),
      });
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${activeTab}-report-${moment().format('YYYY-MM-DD')}.xlsx`;
      link.click();
      message.success('Đã xuất báo cáo Excel');
    } catch (error) {
      message.error('Xuất Excel thất bại');
    }
  };

  // Clinical Report Tab
  const renderClinicalReport = () => {
    if (!clinicalData) return <Empty description="Không có dữ liệu" />;

    const appointmentChartData = [
      { name: 'Hoàn thành', value: clinicalData.appointmentStats?.completed || 0, color: colors.success[500] },
      { name: 'Đã hủy', value: clinicalData.appointmentStats?.cancelled || 0, color: colors.error[500] },
      { name: 'Chờ khám', value: clinicalData.appointmentStats?.pending || 0, color: colors.warning[500] },
    ];

    const doctorColumns = [
      {
        title: 'Bác sĩ',
        key: 'doctor',
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{record.doctor?.fullName}</div>
            <div style={{ fontSize: 12, color: colors.text.secondary }}>
              {record.doctor?.email}
            </div>
          </div>
        ),
      },
      {
        title: 'Số ca khám',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
        render: (count) => <Tag color="blue">{count}</Tag>,
      },
      {
        title: 'Hoàn thành',
        dataIndex: 'completed',
        key: 'completed',
        render: (completed) => <Tag color="green">{completed}</Tag>,
      },
      {
        title: 'Tỷ lệ hoàn thành',
        key: 'rate',
        render: (_, record) => {
          const rate = record.count > 0 ? ((record.completed / record.count) * 100).toFixed(1) : 0;
          return (
            <Tag color={rate >= 80 ? 'green' : rate >= 60 ? 'orange' : 'red'}>
              {rate}%
            </Tag>
          );
        },
      },
    ];

    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng cuộc hẹn</span>}
                value={clinicalData.appointmentStats?.total || 0}
                prefix={<CalendarOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Hoàn thành</span>}
                value={clinicalData.appointmentStats?.completed || 0}
                prefix={<RiseOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.info[500]}, ${colors.info[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Bệnh nhân mới</span>}
                value={clinicalData.newPatients || 0}
                prefix={<TeamOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.secondary[500]}, ${colors.secondary[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng bệnh nhân</span>}
                value={clinicalData.totalPatients || 0}
                prefix={<TeamOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
            <Card title="Phân bổ cuộc hẹn" variant="borderless">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {appointmentChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Hiệu suất bác sĩ" variant="borderless">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clinicalData.topDoctors?.slice(0, 5) || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="doctor.fullName" angle={-15} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill={colors.primary[500]} name="Tổng ca" />
                  <Bar dataKey="completed" fill={colors.success[500]} name="Hoàn thành" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>

        <Card title="Top 10 bác sĩ theo số ca khám" variant="borderless">
          <Table
            columns={doctorColumns}
            dataSource={clinicalData.topDoctors || []}
            rowKey={(record) => record.doctor?._id}
            pagination={false}
          />
        </Card>
      </div>
    );
  };

  // Financial Report Tab
  const renderFinancialReport = () => {
    if (!financialData) return <Empty description="Không có dữ liệu" />;

    const paymentMethodData = Object.entries(financialData.paymentMethods || {}).map(([method, amount]) => ({
      name: method === 'CASH' ? 'Tiền mặt' : method === 'CARD' ? 'Thẻ' : method === 'TRANSFER' ? 'Chuyển khoản' : method,
      value: amount,
    }));

    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng doanh thu</span>}
                value={financialData.summary?.totalRevenue || 0}
                precision={0}
                prefix={<DollarOutlined style={{ color: 'white' }} />}
                suffix="đ"
                valueStyle={{ color: 'white', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã thanh toán</span>}
                value={financialData.summary?.paidAmount || 0}
                precision={0}
                prefix={<RiseOutlined style={{ color: 'white' }} />}
                suffix="đ"
                valueStyle={{ color: 'white', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Chưa thanh toán</span>}
                value={financialData.summary?.unpaidAmount || 0}
                precision={0}
                prefix={<FallOutlined style={{ color: 'white' }} />}
                suffix="đ"
                valueStyle={{ color: 'white', fontSize: 20 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.info[500]}, ${colors.info[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Số hóa đơn</span>}
                value={financialData.summary?.totalBills || 0}
                prefix={<FileTextOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} md={16}>
            <Card title="Biểu đồ doanh thu theo ngày" variant="borderless">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={financialData.revenueChart || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                  <Legend />
                  <Line type="monotone" dataKey="amount" stroke={colors.success[500]} strokeWidth={2} name="Doanh thu" />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title="Phương thức thanh toán" variant="borderless">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value.toLocaleString()} đ`} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // Pharmacy Report Tab
  const renderPharmacyReport = () => {
    if (!pharmacyData) return <Empty description="Không có dữ liệu" />;

    const medicationColumns = [
      {
        title: 'Thuốc',
        dataIndex: 'name',
        key: 'name',
        render: (name) => <strong>{name}</strong>,
      },
      {
        title: 'Số lần kê đơn',
        dataIndex: 'count',
        key: 'count',
        sorter: (a, b) => a.count - b.count,
        render: (count) => <Tag color="blue">{count}</Tag>,
      },
      {
        title: 'Tổng số lượng',
        dataIndex: 'totalQuantity',
        key: 'totalQuantity',
        sorter: (a, b) => a.totalQuantity - b.totalQuantity,
        render: (qty) => <Tag color="green">{qty}</Tag>,
      },
    ];

    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={8}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng đơn thuốc</span>}
                value={pharmacyData.summary?.totalPrescriptions || 0}
                prefix={<MedicineBoxOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Đã cấp phát</span>}
                value={pharmacyData.summary?.dispensedPrescriptions || 0}
                prefix={<RiseOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={8}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Chờ cấp phát</span>}
                value={pharmacyData.summary?.pendingPrescriptions || 0}
                prefix={<FallOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Top 10 thuốc được kê nhiều nhất" variant="borderless">
              <Table
                columns={medicationColumns}
                dataSource={pharmacyData.topMedications || []}
                rowKey="name"
                pagination={false}
                size="small"
              />
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Biểu đồ thuốc sử dụng nhiều nhất" variant="borderless">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={pharmacyData.topMedications?.slice(0, 8) || []} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="count" fill={colors.primary[500]} name="Số lần kê đơn" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // HR Report Tab
  const renderHRReport = () => {
    if (!hrData) return <Empty description="Không có dữ liệu" />;

    const staffActivityColumns = [
      {
        title: 'Nhân viên',
        key: 'user',
        render: (_, record) => (
          <div>
            <div style={{ fontWeight: 600 }}>{record.user?.fullName}</div>
            <div style={{ fontSize: 12, color: colors.text.secondary }}>
              {record.user?.role}
            </div>
          </div>
        ),
      },
      {
        title: 'Số hoạt động',
        dataIndex: 'activities',
        key: 'activities',
        sorter: (a, b) => a.activities - b.activities,
        render: (activities) => <Tag color="blue">{activities}</Tag>,
      },
    ];

    return (
      <div>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng nhân viên</span>}
                value={hrData.summary?.totalStaff || 0}
                prefix={<TeamOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.info[500]}, ${colors.info[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Bác sĩ</span>}
                value={hrData.summary?.doctors || 0}
                prefix={<TeamOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Điều dưỡng</span>}
                value={hrData.summary?.nurses || 0}
                prefix={<TeamOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.warning[500]}, ${colors.warning[600]})`, color: 'white' }}>
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Nhân viên mới</span>}
                value={hrData.summary?.newStaff || 0}
                prefix={<RiseOutlined style={{ color: 'white' }} />}
                valueStyle={{ color: 'white' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Top 10 nhân viên hoạt động nhiều nhất" variant="borderless">
          <Table
            columns={staffActivityColumns}
            dataSource={hrData.mostActiveStaff || []}
            rowKey={(record) => record.user?._id}
            pagination={false}
          />
        </Card>
      </div>
    );
  };

  return (
    <div className="page-container fadeIn">
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <LineChartOutlined style={{ marginRight: 12, color: colors.primary[500] }} />
            Báo cáo & Thống kê
          </h1>
          <p className="dashboard-subtitle">Phân tích dữ liệu và hiệu suất hoạt động</p>
        </div>
        <Space>
          <RangePicker
            value={dateRange}
            onChange={(dates) => setDateRange(dates)}
            format="DD/MM/YYYY"
            style={{ width: 280 }}
          />
          <Button icon={<DownloadOutlined />} onClick={handleExportPDF}>
            PDF
          </Button>
          <Button icon={<DownloadOutlined />} onClick={handleExportExcel} type="primary">
            Excel
          </Button>
        </Space>
      </div>

      <Card variant="borderless">
        <Spin spinning={loading}>
          <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
            <TabPane
              tab={
                <span>
                  <BarChartOutlined />
                  Lâm sàng
                </span>
              }
              key="clinical"
            >
              {renderClinicalReport()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <DollarOutlined />
                  Tài chính
                </span>
              }
              key="financial"
            >
              {renderFinancialReport()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <MedicineBoxOutlined />
                  Dược
                </span>
              }
              key="pharmacy"
            >
              {renderPharmacyReport()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  <TeamOutlined />
                  Nhân sự
                </span>
              }
              key="hr"
            >
              {renderHRReport()}
            </TabPane>
          </Tabs>
        </Spin>
      </Card>
    </div>
  );
};

export default ClinicalReportsEnhanced;
