import React from 'react';
import { ErrorResponse, ErrorType } from '../types';

interface ErrorDisplayProps {
  error: ErrorResponse;
  onRetry?: () => void;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onRetry }) => {
  const getErrorMessage = () => {
    switch (error.type) {
      case ErrorType.TIMEOUT:
        return 'Search is taking longer than expected, please try again';
      case ErrorType.API_KEY_NOT_CONFIGURED:
        return (
          <>
            <p className="mb-2">API key is not configured.</p>
            <p className="text-sm">Please set the TINYFISH_API_KEY environment variable in your .env file.</p>
          </>
        );
      case ErrorType.NETWORK_ERROR:
        return 'Unable to reach external services. Please check your connection and try again.';
      case ErrorType.TINYFISH_FAILED:
        return error.message || 'The automation service encountered an error.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  };

  const showRetry = error.type === ErrorType.NETWORK_ERROR || error.type === ErrorType.TIMEOUT;

  return (
    <div className="w-full max-w-2xl mx-auto bg-red-50 border-2 border-red-500 rounded-lg p-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
          <div className="text-red-800">{getErrorMessage()}</div>
          {showRetry && onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
