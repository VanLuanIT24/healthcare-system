// 🚀 Dashboard Enhancement Utilities
// Shared utilities and configurations for all dashboards

import designSystem from '../../../theme/designSystem';

const { colors } = designSystem;

// Status color mapping
export const getStatusColor = (status) => {
  const statusUpper = String(status).toUpperCase();
  const statusMap = {
    'SCHEDULED': 'blue',
    'CHECKED_IN': 'orange',
    'IN_PROGRESS': 'purple',
    'COMPLETED': 'green',
    'CANCELLED': 'red',
    'PAID': 'green',
    'PENDING': 'orange',
    'PARTIAL': 'gold',
    'OVERDUE': 'red',
    'ACTIVE': 'green',
    'INACTIVE': 'default',
  };
  return statusMap[statusUpper] || statusMap[status] || 'default';
};

// Status text mapping
export const getStatusText = (status) => {
  const statusUpper = String(status).toUpperCase();
  const textMap = {
    'SCHEDULED': 'Đã lên lịch',
    'CHECKED_IN': 'Đã check-in',
    'IN_PROGRESS': 'Đang khám',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'PAID': 'Đã thanh toán',
    'PENDING': 'Chờ xử lý',
    'PARTIAL': 'Thanh toán một phần',
    'OVERDUE': 'Quá hạn',
    'ACTIVE': 'Đang hoạt động',
    'INACTIVE': 'Không hoạt động',
  };
  return textMap[statusUpper] || textMap[status] || status;
};

// Priority badge
export const getPriorityConfig = (priority) => {
  const priorityMap = {
    'emergency': { status: 'error', text: 'Khẩn cấp', color: colors.error[500] },
    'urgent': { status: 'warning', text: 'Ưu tiên', color: colors.warning[500] },
    'normal': { status: 'default', text: 'Thường', color: colors.text.secondary },
    'low': { status: 'default', text: 'Thấp', color: colors.text.disabled },
  };
  return priorityMap[priority] || priorityMap['normal'];
};

// Format currency
export const formatCurrency = (value) => {
  if (!value) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
};

// Format number with suffix
export const formatNumber = (value) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return value;
};

// Stat card gradient styles
export const getGradientStyle = (type) => {
  const gradients = {
    primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[600]} 100%)`,
    success: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[600]} 100%)`,
    warning: `linear-gradient(135deg, ${colors.warning[500]} 0%, ${colors.warning[600]} 100%)`,
    error: `linear-gradient(135deg, ${colors.error[500]} 0%, ${colors.error[600]} 100%)`,
    info: `linear-gradient(135deg, ${colors.info[500]} 0%, ${colors.info[600]} 100%)`,
  };
  return {
    background: gradients[type] || gradients.primary,
    color: 'white',
  };
};

// Common dashboard header style
export const getDashboardHeaderStyle = (icon, title, subtitle) => ({
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 600,
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 0,
  },
  icon: {
    marginRight: 12,
  },
});

// Chart configurations
export const getColumnChartConfig = (data, xField, yField) => ({
  data,
  xField,
  yField,
  smooth: true,
  animation: {
    appear: {
      animation: 'path-in',
      duration: 1000,
    },
  },
  label: {
    position: 'top',
    style: {
      fill: colors.text.secondary,
      opacity: 0.8,
      fontSize: 12,
    },
    formatter: (datum) => formatNumber(datum[yField]),
  },
  color: [colors.primary[500]],
  columnStyle: {
    radius: [6, 6, 0, 0],
  },
  tooltip: {
    formatter: (datum) => ({
      name: yField,
      value: formatCurrency(datum[yField]),
    }),
  },
});

export const getPieChartConfig = (data, angleField, colorField) => ({
  data,
  angleField,
  colorField,
  radius: 0.8,
  innerRadius: 0.6,
  label: {
    type: 'inner',
    offset: '-30%',
    content: '{percentage}',
    style: {
      fontSize: 14,
      textAlign: 'center',
    },
  },
  statistic: {
    title: {
      content: 'Tổng',
      style: { fontSize: 14 },
    },
    content: {
      style: { fontSize: 24 },
    },
  },
  interactions: [{ type: 'element-active' }],
  color: [
    colors.primary[500],
    colors.success[500],
    colors.warning[500],
    colors.error[500],
    colors.info[500],
  ],
});

// Loading parallel data
export const loadDashboardData = async (apiCalls) => {
  const results = await Promise.allSettled(apiCalls);
  return results.map(result => 
    result.status === 'fulfilled' ? result.value.data : null
  );
};

export default {
  getStatusColor,
  getStatusText,
  getPriorityConfig,
  formatCurrency,
  formatNumber,
  getGradientStyle,
  getDashboardHeaderStyle,
  getColumnChartConfig,
  getPieChartConfig,
  loadDashboardData,
  colors,
};
