'use client';

/**
 * Text Component
 * Registered in src/lib/tambo.ts for AI to dynamically render
 */

import type { TextComponentProps } from '../../lib/tambo';

const variantStyles = {
  body: 'text-base text-gray-700',
  heading: 'text-xl font-semibold text-gray-900',
  caption: 'text-sm text-gray-500',
};

export function TextComponent({ content, variant = 'body' }: TextComponentProps) {
  const Component = variant === 'heading' ? 'h2' : 'p';
  
  return (
    <Component className={variantStyles[variant]}>
      {content}
    </Component>
  );
}