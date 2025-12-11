import { LoadingOutlined } from '@ant-design/icons';
import { Button, Result, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import authAPI from '../../services/api/authAPI';

const EmailVerificationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        console.log('🔐 Verifying email with token:', token);
        
        if (!token) {
          setVerificationStatus('error');
          setMessage('Token xác thực không hợp lệ');
          return;
        }

        const response = await authAPI.verifyEmail(token);
        
        if (response.success) {
          setVerificationStatus('success');
          setMessage('Email của bạn đã được xác thực thành công!');
          
          // Tự động redirect sau 3 giây
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setVerificationStatus('error');
          setMessage(response.error || 'Xác thực email thất bại');
        }
      } catch (error) {
        console.error('❌ Email verification error:', error);
        setVerificationStatus('error');
        setMessage(error.response?.data?.error || error.message || 'Đã xảy ra lỗi khi xác thực email');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const renderContent = () => {
    switch (verificationStatus) {
      case 'verifying':
        return (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            <h2 style={{ marginTop: '20px', color: '#1890ff' }}>
              Đang xác thực email...
            </h2>
            <p>Vui lòng đợi trong giây lát</p>
          </div>
        );

      case 'success':
        return (
          <Result
            status="success"
            title="Xác thực Email Thành Công!"
            subTitle={message}
            extra={[
              <Button type="primary" key="login" onClick={() => navigate('/login')}>
                Đăng nhập ngay
              </Button>,
              <Button key="home" onClick={() => navigate('/home')}>
                Về trang chủ
              </Button>
            ]}
          />
        );

      case 'error':
        return (
          <Result
            status="error"
            title="Xác thực Email Thất Bại"
            subTitle={message}
            extra={[
              <Button type="primary" key="resend" onClick={() => navigate('/resend-verification')}>
                Gửi lại email xác thực
              </Button>,
              <Button key="support" onClick={() => navigate('/contact')}>
                Liên hệ hỗ trợ
              </Button>,
              <Button key="home" onClick={() => navigate('/home')}>
                Về trang chủ
              </Button>
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f2f5'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '600px',
        padding: '20px'
      }}>
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailVerificationPage;