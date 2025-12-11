// 📊 Advanced Financial Reports Page
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    BankOutlined,
    DollarOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import { Column, Pie } from '@ant-design/plots';
import { Button, Card, Col, DatePicker, message, Row, Select, Space, Spin, Statistic, Table } from 'antd';
import moment from 'moment';
import { useState } from 'react';
import reportExtendedAPI from '../../services/api/reportExtendedAPI';
import designSystem from '../../theme/designSystem';

const { RangePicker } = DatePicker;
const { colors } = designSystem;

const FinancialReportsPage = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState([moment().startOf('month'), moment().endOf('month')]);
  const [reportType, setReportType] = useState('summary');

  const loadReport = async () => {
    try {
      setLoading(true);
      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
        reportType,
      };

      const response = await reportExtendedAPI.getFinancialReport(params);
      setReportData(response.data?.data || response.data);
    } catch (error) {
      message.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      message.loading('Đang xuất PDF...', 0);
      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      };
      const response = await reportExtendedAPI.exportFinancialReportPDF(params);
      const filename = reportExtendedAPI.generateReportFilename('financial', 'pdf');
      reportExtendedAPI.downloadReport(response.data, filename);
      message.success('Đã xuất báo cáo PDF');
    } catch (error) {
      message.error('Không thể xuất PDF');
    } finally {
      message.destroy();
    }
  };

  const handleExportExcel = async () => {
    try {
      message.loading('Đang xuất Excel...', 0);
      const params = {
        startDate: dateRange[0].toISOString(),
        endDate: dateRange[1].toISOString(),
      };
      const response = await reportExtendedAPI.exportFinancialReportExcel(params);
      const filename = reportExtendedAPI.generateReportFilename('financial', 'xlsx');
      reportExtendedAPI.downloadReport(response.data, filename);
      message.success('Đã xuất báo cáo Excel');
    } catch (error) {
      message.error('Không thể xuất Excel');
    } finally {
      message.destroy();
    }
  };

  const revenueColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Doanh thu',
      dataIndex: 'revenue',
      key: 'revenue',
      render: (amount) => amount?.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Chi phí',
      dataIndex: 'expense',
      key: 'expense',
      render: (amount) => amount?.toLocaleString('vi-VN') + ' ₫',
    },
    {
      title: 'Lợi nhuận',
      dataIndex: 'profit',
      key: 'profit',
      render: (amount) => (
        <span style={{ color: amount >= 0 ? colors.success[600] : colors.error[600] }}>
          {amount >= 0 ? '+' : ''}{amount?.toLocaleString('vi-VN')} ₫
        </span>
      ),
    },
  ];

  return (
    <div className="page-container fadeIn">
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: 24 }}>
        <div>
          <h1 className="dashboard-title">
            <DollarOutlined style={{ marginRight: 12, color: colors.success[500] }} />
            Báo cáo tài chính
          </h1>
          <p className="dashboard-subtitle">
            Thống kê doanh thu và chi phí của bệnh viện
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card variant="borderless" style={{ marginBottom: 24 }}>
        <Space size="middle" wrap>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            style={{ width: 280 }}
          />
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 200 }}
          >
            <Select.Option value="summary">Tổng quan</Select.Option>
            <Select.Option value="detailed">Chi tiết</Select.Option>
            <Select.Option value="byDepartment">Theo phòng ban</Select.Option>
            <Select.Option value="byPaymentMethod">Theo phương thức thanh toán</Select.Option>
          </Select>
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={loadReport}
            loading={loading}
          >
            Tải báo cáo
          </Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={handleExportPDF}
          >
            Xuất PDF
          </Button>
          <Button
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
          >
            Xuất Excel
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {reportData && (
          <>
            {/* Summary Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8}>
                <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.success[500]}, ${colors.success[600]})`, color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng doanh thu</span>}
                    value={reportData.totalRevenue || 0}
                    prefix={<DollarOutlined style={{ color: 'white' }} />}
                    suffix="₫"
                    valueStyle={{ color: 'white' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.error[500]}, ${colors.error[600]})`, color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Tổng chi phí</span>}
                    value={reportData.totalExpense || 0}
                    prefix={<BankOutlined style={{ color: 'white' }} />}
                    suffix="₫"
                    valueStyle={{ color: 'white' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card variant="borderless" style={{ background: `linear-gradient(135deg, ${colors.primary[500]}, ${colors.primary[600]})`, color: 'white' }}>
                  <Statistic
                    title={<span style={{ color: 'rgba(255,255,255,0.9)' }}>Lợi nhuận ròng</span>}
                    value={reportData.netProfit || 0}
                    prefix={(reportData.netProfit || 0) >= 0 ? <ArrowUpOutlined style={{ color: 'white' }} /> : <ArrowDownOutlined style={{ color: 'white' }} />}
                    suffix="₫"
                    valueStyle={{ color: 'white' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Revenue Chart */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} lg={16}>
                <Card title="Biểu đồ doanh thu" variant="borderless">
                  {reportData.revenueChart && (
                    <Column
                      data={reportData.revenueChart}
                      xField="date"
                      yField="amount"
                      color={colors.primary[500]}
                      columnStyle={{ radius: [6, 6, 0, 0] }}
                    />
                  )}
                </Card>
              </Col>
              <Col xs={24} lg={8}>
                <Card title="Phân bổ doanh thu" variant="borderless">
                  {reportData.revenueDistribution && (
                    <Pie
                      data={reportData.revenueDistribution}
                      angleField="value"
                      colorField="type"
                      radius={0.8}
                      innerRadius={0.6}
                    />
                  )}
                </Card>
              </Col>
            </Row>

            {/* Detailed Table */}
            <Card title="Chi tiết doanh thu" variant="borderless">
              <Table
                columns={revenueColumns}
                dataSource={reportData.details || []}
                rowKey="date"
                pagination={{ pageSize: 10 }}
              />
            </Card>
          </>
        )}
      </Spin>
    </div>
  );
};

export default FinancialReportsPage;
