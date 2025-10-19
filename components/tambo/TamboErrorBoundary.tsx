'use client';

/**
 * Error Boundary for Tambo Components
 * 
 * Catches errors from Tambo components and provides fallback UI
 * This prevents the entire application from crashing if Tambo fails
 */

import { Component, ReactNode } from 'react';

interface TamboErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface TamboErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class TamboErrorBoundary extends Component<
  TamboErrorBoundaryProps,
  TamboErrorBoundaryState
> {
  constructor(props: TamboErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): TamboErrorBoundaryState {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Tambo component error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="tambo-error-container">
          <div className="tambo-error-content">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              AI Interface Error
            </h3>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'Something went wrong with the AI interface'}
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
