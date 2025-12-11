// 🔄 Loading Component
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';
import './Loading.css';

const LoadingScreen = ({ tip = 'Đang tải...', fullScreen = true }) => {
  const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

  if (fullScreen) {
    return (
      <div className="loading-screen">
        <Spin indicator={antIcon} tip={tip} size="large" />
      </div>
    );
  }

  return <Spin indicator={antIcon} tip={tip} />;
};

export default LoadingScreen;
