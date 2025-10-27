'use client';

import React from 'react';

export interface DeviceIconProps {
  className?: string;
  'aria-hidden'?: boolean;
}

// Desktop Icon
export function DesktopIcon({ className = "w-4 h-4", ...props }: DeviceIconProps) {
  return (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 20 20"
      role="img"
      aria-label="Desktop computer"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm1 1v6h12V5H4z" 
        clipRule="evenodd" 
      />
      <path d="M6 15a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1z" />
    </svg>
  );
}

// Tablet Icon
export function TabletIcon({ className = "w-4 h-4", ...props }: DeviceIconProps) {
  return (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 20 20"
      role="img"
      aria-label="Tablet device"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM4 5a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" 
        clipRule="evenodd" 
      />
      <circle cx="10" cy="16" r="1" />
    </svg>
  );
}

// iPhone Icon
export function IPhoneIcon({ className = "w-4 h-4", ...props }: DeviceIconProps) {
  return (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 20 20"
      role="img"
      aria-label="iPhone device"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" 
        clipRule="evenodd" 
      />
      <circle cx="10" cy="16.5" r="0.5" />
      <rect x="9" y="3.5" width="2" height="0.5" rx="0.25" />
    </svg>
  );
}

// Android Icon
export function AndroidIcon({ className = "w-4 h-4", ...props }: DeviceIconProps) {
  return (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 20 20"
      role="img"
      aria-label="Android device"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" 
        clipRule="evenodd" 
      />
      <rect x="8" y="15.5" width="1" height="1" rx="0.5" />
      <rect x="11" y="15.5" width="1" height="1" rx="0.5" />
      <rect x="9.5" y="15.5" width="1" height="1" rx="0.5" />
    </svg>
  );
}

// Portrait Orientation Icon
export function PortraitIcon({ className = "w-4 h-4", ...props }: DeviceIconProps) {
  return (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 20 20"
      role="img"
      aria-label="Portrait orientation"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zM6 4a1 1 0 011-1h6a1 1 0 011 1v12a1 1 0 01-1 1H7a1 1 0 01-1-1V4z" 
        clipRule="evenodd" 
      />
    </svg>
  );
}

// Landscape Orientation Icon
export function LandscapeIcon({ className = "w-4 h-4", ...props }: DeviceIconProps) {
  return (
    <svg 
      className={className} 
      fill="currentColor" 
      viewBox="0 0 20 20"
      role="img"
      aria-label="Landscape orientation"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zM4 5a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" 
        clipRule="evenodd" 
      />
    </svg>
  );
}

// Device Icon Mapper Component
export interface DeviceIconMapperProps extends DeviceIconProps {
  device: 'desktop' | 'tablet' | 'iphone' | 'android';
}

export function DeviceIcon({ device, ...props }: DeviceIconMapperProps) {
  switch (device) {
    case 'desktop':
      return <DesktopIcon {...props} />;
    case 'tablet':
      return <TabletIcon {...props} />;
    case 'iphone':
      return <IPhoneIcon {...props} />;
    case 'android':
      return <AndroidIcon {...props} />;
    default:
      return <DesktopIcon {...props} />;
  }
}