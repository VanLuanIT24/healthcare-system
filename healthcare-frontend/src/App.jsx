// src/App.jsx - Healthcare Management System v2.0
import { AuthProvider } from '@/contexts/AuthContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { App as AntdApp, ConfigProvider } from 'antd'; // AntdApp is needed for static function usage (message, modal, etc.)
import AppRouter from '@/router/AppRouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/index.css';

import { useEffect, useRef, useState } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  // 🔍 DEBUG: Monitor dropdown visibility issues
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 &&
            (node.classList.contains('ant-select-dropdown') ||
              node.classList.contains('ant-picker-dropdown') ||
              node.classList.contains('ant-dropdown'))) {

            console.log('✅ [DEBUG] Portal added to DOM:', node);
            setTimeout(() => {
              const style = window.getComputedStyle(node);
              console.log('📊 [DEBUG] Computed Styles for', node.className, ':', {
                display: style.display,
                visibility: style.visibility,
                opacity: style.opacity,
                zIndex: style.zIndex,
                position: style.position,
                inset: style.inset,
                top: style.top,

                left: style.left,
                width: style.width,
                height: style.height,
                transform: style.transform,
                pointerEvents: style.pointerEvents
              });

              // Check for hidden parents
              let parent = node.parentElement;
              while (parent && parent !== document.documentElement) {
                const ps = window.getComputedStyle(parent);
                if (ps.overflow === 'hidden' || ps.opacity === '0' || ps.visibility === 'hidden' || ps.display === 'none') {
                  console.warn('⚠️ [DEBUG] Potential CLIP/HIDE at parent:', parent.tagName, parent.className, ps);
                }
                parent = parent.parentElement;
              }
            }, 100);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (

    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="healthcare-app">
          <ThemeProvider>
            <AntdApp>
              <AuthProvider>
                <NotificationProvider>
                  <AppRouter />
                </NotificationProvider>
              </AuthProvider>
            </AntdApp>
          </ThemeProvider>
        </div>
      </Router>
    </QueryClientProvider>
  );
}


export default App;
