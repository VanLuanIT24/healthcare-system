// 📄 Page Header Component
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import './PageHeader.css';

const PageHeader = ({
  title,
  subtitle,
  onBack,
  backPath,
  extra,
  showBack = false,
  children,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="custom-page-header">
      <div className="header-content">
        <div className="header-left">
          {showBack && (
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={handleBack}
              className="back-button"
            >
              Quay lại
            </Button>
          )}
          <div className="header-titles">
            <h1 className="header-title">{title}</h1>
            {subtitle && <p className="header-subtitle">{subtitle}</p>}
          </div>
        </div>
        {extra && <div className="header-extra">{extra}</div>}
      </div>
      {children && <div className="header-children">{children}</div>}
    </div>
  );
};

export default PageHeader;
