/**
 * Format utility functions
 */

import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT } from '@/constants/index';

/**
 * Format date to Vietnamese locale
 */
export const formatDate = (date, format = DATE_FORMAT) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d)) return '';

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const replacements = {
    'dd': day,
    'MM': month,
    'yyyy': year,
    'HH': hours,
    'mm': minutes,
    'ss': seconds,
  };

  return format.replace(/dd|MM|yyyy|HH|mm|ss/g, match => replacements[match]);
};

/**
 * Format datetime
 */
export const formatDateTime = (date) => formatDate(date, DATETIME_FORMAT);

/**
 * Format time only
 */
export const formatTime = (date) => formatDate(date, TIME_FORMAT);

/**
 * Format currency in VND
 */
export const formatCurrency = (amount, currency = 'VND') => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0 ' + currency;
  
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format large numbers with separators
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number' || isNaN(num)) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Format percentage
 */
export const formatPercent = (value, decimals = 2) => {
  if (typeof value !== 'number' || isNaN(value)) return '0%';
  return (value * 100).toFixed(decimals) + '%';
};

/**
 * Format phone number
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }
  if (digits.length === 11) {
    return digits.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  }
  return phone;
};

/**
 * Format status text with color
 */
export const formatStatusText = (status) => {
  const statusMap = {
    'SCHEDULED': 'Đã lên lịch',
    'CHECKED_IN': 'Đã check-in',
    'IN_PROGRESS': 'Đang xử lý',
    'COMPLETED': 'Hoàn thành',
    'CANCELLED': 'Đã hủy',
    'NO_SHOW': 'Vắng mặt',
    'APPROVED': 'Đã duyệt',
    'PENDING': 'Chờ xử lý',
    'PAID': 'Đã thanh toán',
    'UNPAID': 'Chưa thanh toán',
    'OVERDUE': 'Quá hạn',
    'AVAILABLE': 'Sẵn sàng',
    'OCCUPIED': 'Đã sử dụng',
    'RESERVED': 'Đã đặt',
    'ACTIVE': 'Hoạt động',
    'INACTIVE': 'Không hoạt động',
    'ENABLED': 'Kích hoạt',
    'DISABLED': 'Vô hiệu hóa',
  };
  return statusMap[status] || status;
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Convert date string to Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date) ? null : date;
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const formatTimeAgo = (date) => {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now - d) / 1000);

  const intervals = {
    'năm': 31536000,
    'tháng': 2592000,
    'tuần': 604800,
    'ngày': 86400,
    'giờ': 3600,
    'phút': 60,
    'giây': 1,
  };

  for (const [key, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return interval === 1 ? `1 ${key} trước` : `${interval} ${key} trước`;
    }
  }
  return 'Vừa xong';
};

/**
 * Calculate age from date of birth
 */
export const formatAge = (dateOfBirth) => {
  if (!dateOfBirth) return '';
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return `${age} tuổi`;
};
