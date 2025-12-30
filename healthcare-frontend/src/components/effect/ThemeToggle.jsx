// src/components/ThemeToggle.jsx
import { Button, Tooltip } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useState } from 'react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    // Thêm logic thay đổi theme ở đây
  };

  return (
    <Tooltip title={isDark ? "Chuyển sang sáng" : "Chuyển sang tối"}>
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
          type="text"
          shape="circle"
          icon={isDark ? <BulbFilled /> : <BulbOutlined />}
          onClick={toggleTheme}
          className={`text-xl ${
            isDark 
              ? 'text-yellow-500 hover:text-yellow-600' 
              : 'text-gray-600 hover:text-blue-600'
          }`}
          size="large"
        />
      </motion.div>
    </Tooltip>
  );
};

export default ThemeToggle;