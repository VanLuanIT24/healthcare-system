// 📊 Stat Card Component
import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { Card, Statistic } from 'antd';
import './StatCard.css';

const StatCard = ({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendValue,
  loading = false,
  valueStyle = {},
  onClick,
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? (
      <ArrowUpOutlined style={{ color: '#52c41a' }} />
    ) : (
      <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
    );
  };

  const getTrendColor = () => {
    if (!trend) return '#8c8c8c';
    return trend === 'up' ? '#52c41a' : '#ff4d4f';
  };

  return (
    <Card
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      loading={loading}
      onClick={onClick}
      hoverable={!!onClick}
    >
      <Statistic
        title={title}
        value={value}
        prefix={prefix}
        suffix={suffix}
        valueStyle={valueStyle}
      />
      {trend && trendValue && (
        <div className="stat-footer">
          <span style={{ color: getTrendColor() }}>
            {getTrendIcon()} {trendValue}
          </span>
          <span style={{ marginLeft: 8, color: '#8c8c8c' }}>so với kỳ trước</span>
        </div>
      )}
    </Card>
  );
};

export default StatCard;
