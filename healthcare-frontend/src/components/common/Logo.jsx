import { Link } from 'react-router-dom';

const Logo = ({ size = 'medium', showText = true, className = '' }) => {
  const sizes = {
    small: { logo: 32, text: 'text-sm' },
    medium: { logo: 48, text: 'text-lg' },
    large: { logo: 64, text: 'text-xl' },
    xlarge: { logo: 80, text: 'text-2xl' }
  };

  const { logo: logoSize, text: textSize } = sizes[size] || sizes.medium;

  return (
    <Link to="/" className={`flex items-center gap-3 no-underline ${className}`}>
      {/* SVG Logo */}
      <div className="relative" style={{ width: logoSize, height: logoSize }}>
        <svg
          width={logoSize}
          height={logoSize}
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg"
        >
          {/* Nền gradient */}
          <circle cx="60" cy="60" r="60" fill="url(#logo-gradient)" />
          
          {/* Tim và chữ thập kết hợp */}
          <path
            d="M60 35C45 25 30 35 30 50C30 65 45 80 60 85C75 80 90 65 90 50C90 35 75 25 60 35Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path
            d="M60 50L67.5 57.5L75 50L70 45H65V40H55V45H50L45 50L52.5 57.5L60 50Z"
            fill="#1890ff"
          />
          <rect x="57" y="35" width="6" height="30" fill="#1890ff" />
          
          {/* Hiệu ứng ánh sáng */}
          <circle cx="45" cy="45" r="5" fill="white" fillOpacity="0.2" />
          <circle cx="75" cy="45" r="5" fill="white" fillOpacity="0.2" />
          
          <defs>
            <linearGradient
              id="logo-gradient"
              x1="0"
              y1="0"
              x2="120"
              y2="120"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#1890ff" />
              <stop offset="1" stopColor="#096dd9" />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Hiệu ứng phát sáng */}
        <div className="absolute inset-0 animate-pulse bg-blue-500 rounded-full blur-xl opacity-20 -z-10" />
      </div>

      {/* Text Logo */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-blue-700 ${textSize}`}>
            HealthCare
          </span>
          <span className="text-xs text-gray-600 font-medium -mt-1">
            Medical Excellence
          </span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
