'use client';

import React from 'react';
import { PortraitIcon, LandscapeIcon } from './DeviceIcons';

export type Orientation = 'portrait' | 'landscape';

export interface OrientationToggleProps {
  orientation: Orientation;
  onOrientationChange: (orientation: Orientation) => void;
  disabled?: boolean;
  className?: string;
}

export function OrientationToggle({ 
  orientation, 
  onOrientationChange, 
  disabled = false,
  className = "" 
}: OrientationToggleProps) {
  // Don't render if disabled (device doesn't support orientation)
  if (disabled) {
    return null;
  }

  const handlePortraitClick = () => {
    if (!disabled && orientation !== 'portrait') {
      onOrientationChange('portrait');
    }
  };

  const handleLandscapeClick = () => {
    if (!disabled && orientation !== 'landscape') {
      onOrientationChange('landscape');
    }
  };

  return (
    <div 
      className={`flex gap-0 border border-gray-200 rounded overflow-hidden ${className}`}
      role="group"
      aria-label="Device orientation selector"
    >
      <button
        onClick={handlePortraitClick}
        disabled={disabled}
        className={`
          p-2 transition-all duration-200 ease-in-out
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
          disabled:opacity-50 disabled:cursor-not-allowed
          ${orientation === 'portrait'
            ? 'bg-blue-600 text-white shadow-inner'
            : 'bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Portrait orientation"
        aria-label="Switch to portrait orientation"
        aria-pressed={orientation === 'portrait'}
        type="button"
      >
        <PortraitIcon 
          className="w-4 h-4" 
          aria-hidden={true}
        />
      </button>
      
      <button
        onClick={handleLandscapeClick}
        disabled={disabled}
        className={`
          p-2 transition-all duration-200 ease-in-out border-l border-gray-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset
          disabled:opacity-50 disabled:cursor-not-allowed
          ${orientation === 'landscape'
            ? 'bg-blue-600 text-white shadow-inner'
            : 'bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
        title="Landscape orientation"
        aria-label="Switch to landscape orientation"
        aria-pressed={orientation === 'landscape'}
        type="button"
      >
        <LandscapeIcon 
          className="w-4 h-4" 
          aria-hidden={true}
        />
      </button>
    </div>
  );
}