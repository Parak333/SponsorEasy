import React, { useState } from 'react';

interface ResultCardProps {
  title: string;
  isPositive: boolean;
  details: React.ReactNode;
}

export const ResultCard: React.FC<ResultCardProps> = ({ title, isPositive, details }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const bgColor = isPositive ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500';
  const iconColor = isPositive ? 'text-green-600' : 'text-red-600';

  return (
    <div className={`${bgColor} border-2 rounded-lg p-6 shadow-md animate-fade-in`}>
      <div className="flex items-center gap-3 mb-4">
        {isPositive ? (
          <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className={`w-8 h-8 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>

      {details && (
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isExpanded ? '▼ Hide Details' : '▶ Show Details'}
          </button>
          {isExpanded && (
            <div className="mt-3 text-sm text-gray-700 space-y-1">
              {details}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
