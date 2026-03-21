import React from 'react';
import { HistoryEntry } from '../types';

interface SearchHistoryProps {
  history: HistoryEntry[];
  onSelectEntry: (entry: HistoryEntry) => void;
  currentCompany?: string;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ history, onSelectEntry, currentCompany }) => {
  if (history.length === 0) {
    return null;
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Recent Searches</h3>
      <div className="space-y-2">
        {history.map((entry, index) => {
          const isActive = entry.companyName === currentCompany;
          return (
            <button
              key={index}
              onClick={() => onSelectEntry(entry)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                isActive ? 'bg-blue-100 border-2 border-blue-500' : 'bg-white hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className="font-medium text-sm truncate mb-1">{entry.companyName}</div>
              <div className="text-xs text-gray-500 mb-2">{formatDate(entry.timestamp)}</div>
              <div className="flex gap-2">
                {entry.results.is_e_verified ? (
                  <span className="text-green-600 text-xs">✓ E-Verify</span>
                ) : (
                  <span className="text-red-600 text-xs">✗ E-Verify</span>
                )}
                {entry.results.sponsors_h1b ? (
                  <span className="text-green-600 text-xs">✓ H1B</span>
                ) : (
                  <span className="text-red-600 text-xs">✗ H1B</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
