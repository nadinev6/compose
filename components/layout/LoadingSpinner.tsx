/**
 * Loading Spinner Component
 * Displays loading state with optional message
 */

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center">
      <div className={`${sizeClasses[size]} border-gray-200 border-t-blue-600 rounded-full animate-spin`}></div>
      {message && (
        <p className="mt-4 text-gray-600">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
