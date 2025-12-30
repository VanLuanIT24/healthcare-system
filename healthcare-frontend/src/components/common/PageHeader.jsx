// src/components/common/PageHeader.jsx
import { Typography } from 'antd';
import Breadcrumb from './Breadcrumb';

const { Title, Paragraph } = Typography;

const PageHeader = ({ 
  title, 
  subtitle, 
  showBreadcrumb = true,
  extra,
  className = '',
  backgroundImage,
  overlay = true,
  centered = false,
  size = 'default', // 'small', 'default', 'large'
}) => {
  const sizeStyles = {
    small: 'py-8',
    default: 'py-12',
    large: 'py-20',
  };

  // Hero style với background image
  if (backgroundImage) {
    return (
      <div 
        className={`relative ${sizeStyles[size]} ${className}`}
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {overlay && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-800/60" />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {showBreadcrumb && (
            <div className="mb-4">
              <Breadcrumb />
            </div>
          )}
          <div className={centered ? 'text-center' : ''}>
            <Title level={1} className="!text-white !mb-2">
              {title}
            </Title>
            {subtitle && (
              <Paragraph className="!text-gray-200 text-lg max-w-2xl mx-auto">
                {subtitle}
              </Paragraph>
            )}
            {extra && <div className="mt-6">{extra}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Normal style
  return (
    <div className={`bg-gradient-to-r from-blue-600 to-blue-800 ${sizeStyles[size]} ${className}`}>
      <div className="container mx-auto px-4">
        {showBreadcrumb && (
          <div className="mb-4">
            <Breadcrumb />
          </div>
        )}
        <div className={`flex ${centered ? 'flex-col items-center text-center' : 'flex-row justify-between items-start'}`}>
          <div>
            <Title level={1} className="!text-white !mb-2">
              {title}
            </Title>
            {subtitle && (
              <Paragraph className="!text-blue-100 text-lg mb-0 max-w-2xl">
                {subtitle}
              </Paragraph>
            )}
          </div>
          {extra && <div className="mt-4 md:mt-0">{extra}</div>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
