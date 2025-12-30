// src/pages/auth/LogoutPage.jsx
import { CheckCircleOutlined, CloseCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Space, Typography } from 'antd';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import authAPI from '../../services/api/authAPI';

const { Title, Paragraph, Text } = Typography;

const LogoutPage = () => {
  const [loading, setLoading] = useState(false);
  const [logoutAll, setLogoutAll] = useState(false);
  const [logoutSuccess, setLogoutSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (logoutSuccess && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(redirectCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (logoutSuccess && redirectCountdown === 0) {
      console.log('🔄 LogoutPage - Redirecting to login...');
      navigate('/login', { replace: true });
    }
  }, [logoutSuccess, redirectCountdown, navigate]);

  const handleLogout = async () => {
    setLoading(true);
    console.log('🚪 LogoutPage - handleLogout called');
    
    try {
      console.log('🚪 LogoutPage - Starting logout process...');
      
      // Step 1: Gọi API logout với accessToken (JWT auth header)
      try {
        console.log('📡 LogoutPage - Calling API logout with accessToken...');
        await authAPI.logout();
        console.log('✅ LogoutPage - API logout successful');
      } catch (err) {
        console.warn('⚠️ LogoutPage - API logout error (will continue anyway):', err.message);
      }
      
      // Step 3: Clear local storage
      console.log('💾 LogoutPage - Clearing localStorage...');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Step 4: Dispatch storage event để AuthContext biết user đã logout
      window.dispatchEvent(new Event('storage'));
      
      // Step 5: Clear auth context
      logout();
      
      // Step 6: Set success state để show thông báo
      console.log('✅ LogoutPage - Setting logout success state...');
      setLogoutSuccess(true);
      setRedirectCountdown(3);
      
    } catch (error) {
      console.error('❌ LogoutPage - Error:', error);
      // Vẫn clear local data
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.dispatchEvent(new Event('storage'));
      logout();
      // Redirect ngay
      navigate('/login', { replace: true });
    } finally {
      setLoading(false);
    }
  };

  if (logoutSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <Card
            style={{
              borderRadius: '20px',
              width: '100%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              border: 'none',
            }}
            styles={{ body: { padding: '60px 30px' } }}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <CheckCircleOutlined style={{ fontSize: '60px', color: '#52c41a' }} />
            </motion.div>

            <Title level={3} style={{ marginTop: '20px' }}>
              ✅ Đăng xuất thành công!
            </Title>

            <Paragraph type="secondary" style={{ fontSize: '14px', marginBottom: '20px' }}>
              {logoutAll
                ? '✅ Bạn đã đăng xuất khỏi tất cả thiết bị'
                : '✅ Bạn đã đăng xuất khỏi phiên làm việc hiện tại'}
            </Paragraph>

            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Text strong style={{ fontSize: '16px' }}>
                🔄 Quay lại trang đăng nhập trong {redirectCountdown}s...
              </Text>
            </motion.div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated background elements */}
      <motion.div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
        animate={{ y: [0, 30, 0], x: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-150px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }}
        animate={{ y: [0, -30, 0], x: [0, -20, 0] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ width: '100%', maxWidth: '500px' }}
      >
        <Card
          style={{
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            border: 'none',
          }}
          styles={{ body: { padding: '50px 40px' } }}
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '30px' }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <LogoutOutlined style={{
                fontSize: '50px',
                color: '#ff4d4f',
                marginBottom: '15px',
              }} />
            </motion.div>
            <Title level={2} style={{ margin: '0 0 10px 0' }}>
              Đăng xuất
            </Title>
            <Paragraph type="secondary">
              Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?
            </Paragraph>
          </motion.div>

          {/* Logout Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            style={{
              background: '#f0f2f5',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '25px',
            }}
          >
            <Paragraph style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
              Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ
            </Paragraph>
          </motion.div>

          {/* Logout Options */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              background: '#fff7f0',
              border: '1px solid #ffb87d',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '25px',
            }}
          >
            <Checkbox
              checked={logoutAll}
              onChange={(e) => setLogoutAll(e.target.checked)}
              style={{ fontSize: '14px' }}
            >
              <span style={{ fontWeight: '500' }}>
                📱 Đăng xuất khỏi tất cả thiết bị
              </span>
            </Checkbox>
            <Paragraph
              type="secondary"
              style={{
                margin: '8px 0 0 28px',
                fontSize: '12px',
              }}
            >
              Lựa chọn này sẽ đăng xuất bạn khỏi tất cả các phiên làm việc khác. Nếu không chọn, bạn vẫn còn đăng nhập trên các thiết bị khác.
            </Paragraph>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <Space style={{ width: '100%', gap: '10px' }}>
              <Button
                block
                size="large"
                onClick={() => navigate(-1)}
                style={{ borderRadius: '10px' }}
                icon={<CloseCircleOutlined />}
              >
                Hủy
              </Button>
              <Button
                block
                size="large"
                type="primary"
                danger
                loading={loading}
                onClick={handleLogout}
                style={{
                  borderRadius: '10px',
                  background: '#ff4d4f',
                  borderColor: '#ff4d4f',
                }}
                icon={<LogoutOutlined />}
              >
                Đăng xuất
              </Button>
            </Space>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Paragraph
              type="secondary"
              style={{
                textAlign: 'center',
                fontSize: '12px',
                marginTop: '20px',
                marginBottom: 0,
              }}
            >
              ℹ️ Nếu bạn không phải là người dùng này, vui lòng đóng tab này
            </Paragraph>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
};

export default LogoutPage;
