'use client';

import React from 'react';
import { DeviceIcon } from './DeviceIcons';

export type DeviceType = 'desktop' | 'tablet' | 'iphone' | 'android';

export interface DeviceConfig {
  name: string;
  dimensions: {
    portrait: { width: number; height: number };
    landscape: { width: number; height: number };
  };
  supportsOrientation: boolean;
  frameStyle?: string;
}

export const DEVICE_CONFIGS: Record<DeviceType, DeviceConfig> = {
  desktop: {
    name: 'Desktop',
    dimensions: {
      portrait: { width: 1200, height: 800 },
      landscape: { width: 1200, height: 800 }
    },
    supportsOrientation: false
  },
  tablet: {
    name: 'Tablet',
    dimensions: {
      portrait: { width: 768, height: 1024 },
      landscape: { width: 1024, height: 768 }
    },
    supportsOrientation: true
  },
  iphone: {
    name: 'iPhone',
    dimensions: {
      portrait: { width: 375, height: 812 },
      landscape: { width: 812, height: 375 }
    },
    supportsOrientation: true,
    frameStyle: 'iphone'
  },
  android: {
    name: 'Android',
    dimensions: {
      portrait: { width: 360, height: 740 },
      landscape: { width: 740, height: 360 }
    },
    supportsOrientation: true,
    frameStyle: 'android'
  }
};

export interface DeviceTypeSelectorProps {
  selectedDevice: DeviceType;
  onDeviceChange: (device: DeviceType) => void;
  className?: string;
}

export function DeviceTypeSelector({ 
  selectedDevice, 
  onDeviceChange, 
  className = "" 
}: DeviceTypeSelectorProps) {
  return (
    <div 
      className={`flex gap-1 md:gap-2 ${className}`}
      role="group"
      aria-label="Device type selector"
    >
      {Object.entries(DEVICE_CONFIGS).map(([key, config]) => {
        const deviceType = key as DeviceType;
        const isSelected = selectedDevice === deviceType;
        
        return (
          <button
            key={key}
            onClick={() => onDeviceChange(deviceType)}
            className={`
              p-2 rounded transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
              ${isSelected
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:shadow-sm border border-gray-200'
              }
            `}
            title={`${config.name} View`}
            aria-label={`Switch to ${config.name} preview`}
            aria-pressed={isSelected}
            type="button"
          >
            <DeviceIcon 
              device={deviceType} 
              className="w-4 h-4" 
              aria-hidden={true}
            />
          </button>
        );
      })}
    </div>
  );
}