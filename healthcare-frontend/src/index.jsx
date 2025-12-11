// 🏥 Healthcare System - Main Application Entry
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import './styles/index.css';
import designSystem from './theme/designSystem';
import './theme/globalStyles.css';

// 🎨 Apply Professional Design System Theme
const { themeConfig, colors } = designSystem;

// Enhanced theme configuration with professional medical design
const theme = {
  ...themeConfig,
  token: {
    ...themeConfig.token,
    // Professional medical colors
    colorPrimary: colors.primary[500],
    colorSuccess: colors.success[500],
    colorWarning: colors.warning[500],
    colorError: colors.error[500],
    colorInfo: colors.info[500],
    colorBgContainer: colors.background.paper,
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorBorder: colors.border.default,
    // Enhanced spacing and sizing
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,
    fontSize: 14,
    fontSizeLG: 16,
    fontSizeSM: 12,
    // Control heights
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
    // Shadows
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
    boxShadowSecondary: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  components: {
    Layout: {
      headerBg: colors.background.header,
      headerColor: colors.text.primary,
      headerHeight: 64,
      headerPadding: '0 24px',
      siderBg: colors.background.sidebar,
      bodyBg: colors.background.default,
    },
    Menu: {
      darkItemBg: colors.background.sidebar,
      darkItemSelectedBg: colors.primary[600],
      darkItemHoverBg: colors.primary[700],
      darkItemColor: '#fff',
      darkItemSelectedColor: '#fff',
    },
    Card: {
      borderRadius: 6,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.09)',
      headerBg: colors.background.paper,
      headerFontSize: 16,
      headerFontWeight: 600,
    },
    Button: {
      borderRadius: 6,
      controlHeight: 32,
      controlHeightLG: 40,
      controlHeightSM: 24,
      fontWeight: 500,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: colors.text.primary,
      headerBorderRadius: 6,
      rowHoverBg: colors.background.hover,
    },
    Modal: {
      borderRadius: 6,
      headerBg: colors.background.paper,
    },
  },
};

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ConfigProvider theme={theme} locale={viVN}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
