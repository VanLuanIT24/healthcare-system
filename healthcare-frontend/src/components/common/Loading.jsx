// src/components/common/Loading.jsx
import { LoadingOutlined } from '@ant-design/icons';
import { Spin } from 'antd';

// Full page loading
export const PageLoading = ({ tip = 'Đang tải...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
    <div className="w-16 h-16 mb-4 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center animate-pulse">
      <span className="text-white text-2xl font-bold">H</span>
    </div>
    <Spin 
      indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
      tip={tip}
    />
  </div>
);

// Component loading
export const ComponentLoading = ({ size = 'default', tip }) => (
  <div className="flex items-center justify-center py-8">
    <Spin 
      size={size} 
      tip={tip}
      indicator={<LoadingOutlined spin />}
    />
  </div>
);

// Skeleton loading
export const CardSkeleton = ({ count = 1 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
        <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
      </div>
    ))}
  </div>
);

// Button loading
export const ButtonLoading = () => (
  <LoadingOutlined spin className="mr-2" />
);

export default PageLoading;
