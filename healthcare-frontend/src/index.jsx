// src/main.jsx hoặc src/index.jsx
import App from '@/App';
import '@/styles/index.css';
import { App as AntdApp } from 'antd';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './theme/globalStyles.css';

// Note: ConfigProvider is handled in ThemeContext.jsx to avoid duplicate providers
// which can cause issues with Ant Design portals (dropdowns, modals, etc.)

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);


