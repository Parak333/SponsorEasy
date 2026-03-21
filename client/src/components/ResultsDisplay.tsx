import React from 'react';
import { UnifiedResponse } from '../types';
import { ResultCard } from './ResultCard';

interface ResultsDisplayProps {
  results: UnifiedResponse;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ results }) => {
  const eVerifyDetails = results.is_e_verified && (
    <>
      {results.city && results.state && <p><strong>Location:</strong> {results.city}, {results.state}</p>}
      {results.enrollment_date && <p><strong>Enrollment Date:</strong> {results.enrollment_date}</p>}
      {results.e_verify_details && <p><strong>Details:</strong> {results.e_verify_details}</p>}
    </>
  );

  const h1bDetails = results.sponsors_h1b && (
    <>
      {results.total_filings !== undefined && <p><strong>Total Filings:</strong> {results.total_filings}</p>}
      {results.recent_year && results.recent_filings !== undefined && (
        <p><strong>{results.recent_year} Filings:</strong> {results.recent_filings}</p>
      )}
      {results.avg_salary && <p><strong>Average Salary:</strong> {results.avg_salary}</p>}
      {results.h1b_details && <p><strong>Details:</strong> {results.h1b_details}</p>}
    </>
  );

  const noResults = !results.is_e_verified && !results.sponsors_h1b;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">{results.company_name}</h2>
      
      {noResults && (
        <div className="bg-yellow-50 border-2 border-yellow-500 rounded-lg p-6 mb-6 text-center">
          <p className="text-lg font-semibold mb-2">No records found</p>
          <p className="text-sm text-gray-600">
            Please check the company name spelling or try alternative company names
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <ResultCard
          title={results.is_e_verified ? 'E-Verified ✓' : 'Not E-Verified'}
          isPositive={results.is_e_verified}
          details={eVerifyDetails}
        />
        <ResultCard
          title={results.sponsors_h1b ? 'Sponsors H1B ✓' : 'No H1B Sponsorship'}
          isPositive={results.sponsors_h1b}
          details={h1bDetails}
        />
      </div>
    </div>
  );
};
