// src/components/layout/PublicLayout.jsx
import FloatingButtons from '@/components/common/FloatingButtons';
import ScrollToTop from '@/components/common/ScrollToTop';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';

const { Content } = Layout;

const PublicLayout = () => {
  return (
    <Layout className="min-h-screen">
      <ScrollToTop />
      <Header />
      <Content 
        className="mt-[72px]" 
        style={{ 
          minHeight: 'calc(100vh - 72px)',
          background: '#fff' 
        }}
      >
        <Outlet />
      </Content>
      <Footer />
      <FloatingButtons />
    </Layout>
  );
};

export default PublicLayout;
