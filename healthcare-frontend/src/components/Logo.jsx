import React from 'react';

const Logo = ({ size = 'medium', showText = true }) => {
  // Size variants
  const sizes = {
    small: { width: 24, height: 24, fontSize: 12 },
    medium: { width: 48, height: 48, fontSize: 16 },
    large: { width: 80, height: 80, fontSize: 24 }
  };

  const sizeConfig = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <svg
        width={sizeConfig.width}
        height={sizeConfig.height}
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Background circle for logo */}
        <defs>
          <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1e3a8a', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0e7490', stopOpacity: 1 }} />
          </linearGradient>
          <linearGradient id="stripeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#06b6d4', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#00d9ff', stopOpacity: 1 }} />
          </linearGradient>
        </defs>

        {/* Left bar (tall) */}
        <rect x="20" y="35" width="12" height="45" fill="url(#barGradient)" rx="2" />

        {/* Middle bar */}
        <rect x="40" y="25" width="12" height="55" fill="url(#barGradient)" rx="2" />

        {/* Right bar (short) */}
        <rect x="60" y="40" width="12" height="40" fill="url(#barGradient)" rx="2" />

        {/* Diagonal stripe (cutting through bars) */}
        <g>
          <polygon
            points="15,45 75,15 80,20 20,50"
            fill="url(#stripeGradient)"
            opacity="0.95"
          />
        </g>
      </svg>

      {showText && (
        <div>
          <div
            style={{
              fontSize: sizeConfig.fontSize,
              fontWeight: '800',
              color: '#06b6d4',
              lineHeight: '1',
              letterSpacing: '0.5px'
            }}
          >
            Healthcare
          </div>
          <div
            style={{
              fontSize: Math.max(10, sizeConfig.fontSize - 4),
              fontWeight: '700',
              color: '#0e7490',
              lineHeight: '1',
              letterSpacing: '0.3px'
            }}
          >
            System
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
