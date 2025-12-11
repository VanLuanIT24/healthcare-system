// 📊 Financial Reports - Revenue and expenses
import {
    DollarOutlined,
    DownloadOutlined,
    FallOutlined,
    LineChartOutlined,
    RiseOutlined,
} from '@ant-design/icons';
import { Column, Line, Pie } from '@ant-design/plots';
import {
    Button,
    Card,
    Col,
    DatePicker,
    message,
    Row,
    Select,
    Space,
    Statistic,
    Table,
    Tag,
} from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import reportAPI from '../../services/api/reportAPI';
import './Reports.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FinancialReports = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([moment().subtract(30, 'days'), moment()]);
  const [reportType, setReportType] = useState('revenue-summary');

  useEffect(() => {
    loadReport();
  }, [dateRange, reportType]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await reportAPI.getFinancialReport({
        type: reportType,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      });
      setReportData(response.data);
    } catch (error) {
      message.error('Không thể tải báo cáo tài chính');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      await reportAPI.exportReport({
        type: reportType,
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        format: 'excel',
      });
      message.success('Xuất báo cáo thành công');
    } catch (error) {
      message.error('Xuất báo cáo thất bại');
    }
  };

  const revenueLineConfig = {
    data: reportData?.dailyRevenue || [],
    xField: 'date',
    yField: 'amount',
    point: {
      size: 5,
      shape: 'circle',
    },
    label: {
      style: {
        fill: '#aaa',
      },
    },
    smooth: true,
    color: '#1890ff',
  };

  const categoryPieConfig = {
    data: reportData?.revenueByCategory || [],
    angleField: 'value',
    colorField: 'category',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
  };

  const paymentMethodConfig = {
    data: reportData?.paymentMethods || [],
    xField: 'method',
    yField: 'amount',
    label: {
      position: 'top',
      style: {
        fill: '#262626',
        opacity: 0.6,
      },
    },
    color: '#52c41a',
  };

  const topServicesColumns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'service',
      key: 'service',
    },
    {
      title: 'Số lượng',
      dataIndex: 'count',
      key: 'count',
      sorter: (a, b) => a.count - b.count,
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (amount) => (
        <strong style={{ color: '#1890ff' }}>
          {amount?.toLocaleString('vi-VN')} VND
        </strong>
      ),
      sorter: (a, b) => (a.revenue || 0) - (b.revenue || 0),
    },
    {
      title: '% Tổng doanh thu',
      dataIndex: 'percentage',
      key: 'percentage',
      render: (pct) => <Tag color="blue">{pct}%</Tag>,
    },
  ];

  return (
    <div className="page-container financial-reports-container">
      <PageHeader
        title="Báo cáo tài chính"
        subtitle="Thống kê doanh thu và chi phí"
      />

      <Card className="filter-section">
        <Row gutter={16} align="middle">
          <Col xs={24} md={10}>
            <Space>
              <span>Loại báo cáo:</span>
              <Select
                style={{ width: 250 }}
                value={reportType}
                onChange={setReportType}
              >
                <Option value="revenue-summary">Tổng quan doanh thu</Option>
                <Option value="revenue-by-service">Doanh thu theo dịch vụ</Option>
                <Option value="payment-analysis">Phân tích thanh toán</Option>
                <Option value="insurance-claims">Thanh toán bảo hiểm</Option>
              </Select>
            </Space>
          </Col>
          <Col xs={24} md={10}>
            <Space>
              <span>Thời gian:</span>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
            </Space>
          </Col>
          <Col xs={24} md={4}>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleExport}
              block
            >
              Xuất Excel
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Revenue Summary Card */}
      <div className="revenue-card">
        <h2 style={{ margin: 0, color: 'white' }}>Doanh thu</h2>
        <div className="revenue-amount">
          {(reportData?.totalRevenue || 0).toLocaleString('vi-VN')} VND
        </div>
        <div className="revenue-change">
          {reportData?.revenueGrowth > 0 ? (
            <>
              <RiseOutlined /> +{reportData?.revenueGrowth}% so với kỳ trước
            </>
          ) : (
            <>
              <FallOutlined /> {reportData?.revenueGrowth}% so với kỳ trước
            </>
          )}
        </div>

        <div className="revenue-breakdown">
          <div className="revenue-breakdown-item">
            <div className="revenue-breakdown-label">Doanh thu trung bình/ngày</div>
            <div className="revenue-breakdown-value">
              {(reportData?.avgDailyRevenue || 0).toLocaleString('vi-VN')}
            </div>
          </div>
          <div className="revenue-breakdown-item">
            <div className="revenue-breakdown-label">Số giao dịch</div>
            <div className="revenue-breakdown-value">{reportData?.totalTransactions || 0}</div>
          </div>
          <div className="revenue-breakdown-item">
            <div className="revenue-breakdown-label">Giá trị TB/giao dịch</div>
            <div className="revenue-breakdown-value">
              {(reportData?.avgTransactionValue || 0).toLocaleString('vi-VN')}
            </div>
          </div>
        </div>
      </div>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Thu tiền mặt"
              value={reportData?.cashRevenue || 0}
              prefix={<DollarOutlined />}
              suffix="VND"
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Thu thẻ/CK"
              value={reportData?.cardRevenue || 0}
              prefix={<LineChartOutlined />}
              suffix="VND"
              valueStyle={{ color: '#1890ff', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Công nợ"
              value={reportData?.outstandingDebt || 0}
              suffix="VND"
              valueStyle={{ color: '#ff4d4f', fontSize: '18px' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Hoàn trả"
              value={reportData?.refunds || 0}
              suffix="VND"
              valueStyle={{ color: '#fa8c16', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Biểu đồ doanh thu theo ngày" loading={loading}>
            <Line {...revenueLineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Doanh thu theo danh mục" loading={loading}>
            <Pie {...categoryPieConfig} />
          </Card>
        </Col>
      </Row>

      <Card title="Phương thức thanh toán" style={{ marginTop: 16 }} loading={loading}>
        <Column {...paymentMethodConfig} />
      </Card>

      <Card title="Top 10 dịch vụ doanh thu cao nhất" style={{ marginTop: 16 }} loading={loading}>
        <Table
          columns={topServicesColumns}
          dataSource={reportData?.topServices || []}
          pagination={false}
          rowKey="service"
        />
      </Card>
    </div>
  );
};

export default FinancialReports;
