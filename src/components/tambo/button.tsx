'use client';

/**
 * Button Component
 * Registered in src/lib/tambo.ts for AI to dynamically render
 */

import type { ButtonProps } from '../../lib/tambo';

const variantStyles = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-600 text-white hover:bg-gray-700',
  outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ text, variant = 'primary', size = 'md' }: ButtonProps) {
  return (
    <button
      className={`
        inline-flex items-center justify-center
        font-medium rounded-md
        transition-colors duration-200
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
    >
      {text}
    </button>
  );
}