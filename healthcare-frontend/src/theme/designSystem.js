/**
 * 🎨 HEALTHCARE DESIGN SYSTEM
 * Professional Design Tokens & Guidelines
 * Version: 2.0.0
 */

// ============================================
// 🎨 COLOR PALETTE - Medical Theme
// ============================================

export const colors = {
  // Primary Colors - Medical Blue
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#1890FF', // Main primary
    600: '#1976D2',
    700: '#1565C0',
    800: '#0D47A1',
    900: '#002171',
  },

  // Success Colors - Medical Green
  success: {
    50: '#F0F9F4',
    100: '#D4F0DF',
    200: '#A8E1BF',
    300: '#7DD19F',
    400: '#52C27F',
    500: '#52C41A', // Main success
    600: '#389E0D',
    700: '#237804',
    800: '#135200',
    900: '#092B00',
  },

  // Warning Colors - Medical Orange
  warning: {
    50: '#FFF7E6',
    100: '#FFE7BA',
    200: '#FFD591',
    300: '#FFC069',
    400: '#FFAB40',
    500: '#FA8C16', // Main warning
    600: '#D46B08',
    700: '#AD4E00',
    800: '#873800',
    900: '#612500',
  },

  // Error Colors - Medical Red
  error: {
    50: '#FFF0F0',
    100: '#FFD9D9',
    200: '#FFB3B3',
    300: '#FF8C8C',
    400: '#FF6666',
    500: '#FF4D4F', // Main error
    600: '#D4380D',
    700: '#AD2102',
    800: '#871400',
    900: '#610B00',
  },

  // Info Colors - Cyan
  info: {
    50: '#E6FFFB',
    100: '#B5F5EC',
    200: '#87E8DE',
    300: '#5CDBD3',
    400: '#36CFC9',
    500: '#13C2C2', // Main info
    600: '#08979C',
    700: '#006D75',
    800: '#00474F',
    900: '#002329',
  },

  // Neutral Colors - Gray Scale
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // Background Colors
  background: {
    default: '#F0F2F5',
    paper: '#FFFFFF',
    sidebar: '#001529',
    header: '#FFFFFF',
    hover: '#F5F5F5',
    active: '#E6F7FF',
    disabled: '#F5F5F5',
  },

  // Text Colors
  text: {
    primary: '#262626',
    secondary: '#595959',
    disabled: '#BFBFBF',
    hint: '#8C8C8C',
    inverse: '#FFFFFF',
  },

  // Border Colors
  border: {
    default: '#D9D9D9',
    light: '#F0F0F0',
    dark: '#BFBFBF',
  },

  // Status Colors for Medical Context
  status: {
    critical: '#FF4D4F',
    urgent: '#FA8C16',
    stable: '#52C41A',
    pending: '#1890FF',
    completed: '#13C2C2',
    cancelled: '#8C8C8C',
  },
};

// ============================================
// 📏 TYPOGRAPHY - Professional Medical
// ============================================

export const typography = {
  // Font Families
  fontFamily: {
    primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`,
    mono: `'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Droid Sans Mono', 'Source Code Pro', monospace`,
  },

  // Font Sizes
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },

  // Font Weights
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tight: '-0.05em',
    normal: '0',
    wide: '0.05em',
  },
};

// ============================================
// 📐 SPACING - 8px Grid System
// ============================================

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
};

// ============================================
// 🔲 BORDERS & RADIUS
// ============================================

export const borders = {
  width: {
    none: '0px',
    thin: '1px',
    medium: '2px',
    thick: '4px',
  },
  radius: {
    none: '0px',
    sm: '2px',
    base: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    '2xl': '16px',
    '3xl': '24px',
    full: '9999px',
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },
};

// ============================================
// 🌑 SHADOWS - Professional Depth
// ============================================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  card: '0 2px 8px rgba(0, 0, 0, 0.09)',
  elevated: '0 4px 12px rgba(0, 0, 0, 0.15)',
};

// ============================================
// ⏱️ TRANSITIONS & ANIMATIONS
// ============================================

export const transitions = {
  duration: {
    fastest: '75ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slowest: '700ms',
  },
  easing: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// ============================================
// 📱 BREAKPOINTS - Responsive
// ============================================

export const breakpoints = {
  xs: '480px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1600px',
};

// ============================================
// 🎯 Z-INDEX - Layer Management
// ============================================

export const zIndex = {
  hide: -1,
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  notification: 1080,
  max: 9999,
};

// ============================================
// 📏 COMPONENT SIZES
// ============================================

export const componentSizes = {
  button: {
    sm: { height: '24px', padding: '0 7px', fontSize: '12px' },
    base: { height: '32px', padding: '4px 15px', fontSize: '14px' },
    lg: { height: '40px', padding: '6px 15px', fontSize: '16px' },
  },
  input: {
    sm: { height: '24px', padding: '0 7px', fontSize: '12px' },
    base: { height: '32px', padding: '4px 11px', fontSize: '14px' },
    lg: { height: '40px', padding: '6px 11px', fontSize: '16px' },
  },
  card: {
    padding: {
      sm: '12px',
      base: '16px',
      lg: '24px',
    },
  },
};

// ============================================
// 🎨 THEME CONFIGURATION
// ============================================

export const themeConfig = {
  // Ant Design Token Overrides
  token: {
    colorPrimary: colors.primary[500],
    colorSuccess: colors.success[500],
    colorWarning: colors.warning[500],
    colorError: colors.error[500],
    colorInfo: colors.info[500],
    colorText: colors.text.primary,
    colorTextSecondary: colors.text.secondary,
    colorBorder: colors.border.default,
    borderRadius: 6,
    fontFamily: typography.fontFamily.primary,
    fontSize: 14,
    controlHeight: 32,
    controlHeightLG: 40,
    controlHeightSM: 24,
  },
};

// ============================================
// 🎭 MEDICAL SPECIFIC CONSTANTS
// ============================================

export const medicalConstants = {
  // Patient Status Colors
  patientStatus: {
    admitted: colors.info[500],
    discharged: colors.success[500],
    emergency: colors.error[500],
    outpatient: colors.primary[500],
  },

  // Appointment Status Colors
  appointmentStatus: {
    scheduled: colors.primary[500],
    confirmed: colors.info[500],
    'in-progress': colors.warning[500],
    completed: colors.success[500],
    cancelled: colors.neutral[500],
    'no-show': colors.error[500],
  },

  // Lab Result Status Colors
  labResultStatus: {
    pending: colors.warning[500],
    'in-progress': colors.info[500],
    completed: colors.success[500],
    abnormal: colors.error[500],
    critical: colors.error[700],
  },

  // Priority Levels
  priority: {
    low: colors.neutral[500],
    medium: colors.warning[500],
    high: colors.error[500],
    urgent: colors.error[700],
    emergency: colors.error[900],
  },
};

// ============================================
// 🎨 UTILITY FUNCTIONS
// ============================================

/**
 * Get color by severity level
 */
export const getSeverityColor = (severity) => {
  const map = {
    critical: colors.error[700],
    high: colors.error[500],
    medium: colors.warning[500],
    low: colors.success[500],
    info: colors.info[500],
  };
  return map[severity] || colors.neutral[500];
};

/**
 * Get status color
 */
export const getStatusColor = (status, type = 'appointment') => {
  const statusMaps = {
    appointment: medicalConstants.appointmentStatus,
    patient: medicalConstants.patientStatus,
    lab: medicalConstants.labResultStatus,
  };
  return statusMaps[type]?.[status] || colors.neutral[500];
};

/**
 * Generate rgba color
 */
export const rgba = (hex, alpha) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Generate gradient
 */
export const gradient = (color1, color2, direction = '135deg') => {
  return `linear-gradient(${direction}, ${color1}, ${color2})`;
};

// ============================================
// 📦 DEFAULT EXPORT
// ============================================

const designSystem = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  transitions,
  breakpoints,
  zIndex,
  componentSizes,
  themeConfig,
  medicalConstants,
  // Utility functions
  getSeverityColor,
  getStatusColor,
  rgba,
  gradient,
};

export default designSystem;
