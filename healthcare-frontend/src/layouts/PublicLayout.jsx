// 🏥 Public Layout (for landing page, auth pages, etc.)
import { Layout } from 'antd';
import { Outlet, useLocation } from 'react-router-dom';
import './PublicLayout.css';

const { Content } = Layout;

const PublicLayout = () => {
  const location = useLocation();
  
  // Check if current page is landing page or info pages (full width layout)
  const isFullWidthPage = [
    '/home',
    '/about',
    '/services',
    '/contact',
    '/booking'
  ].includes(location.pathname);

  return (
    <Layout className="public-layout">
      <Content className={isFullWidthPage ? "public-content-full" : "public-content"}>
        {isFullWidthPage ? (
          <Outlet />
        ) : (
          <div className="public-container">
            <Outlet />
          </div>
        )}
      </Content>
      {!isFullWidthPage && (
        <div className="public-footer">
          <p>© 2024 Healthcare System. All rights reserved.</p>
        </div>
      )}
    </Layout>
  );
};

export default PublicLayout;
