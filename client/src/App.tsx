import React, { useState, useEffect } from 'react';
import { SearchBar } from './components/SearchBar';
import { ResultsDisplay } from './components/ResultsDisplay';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SearchHistory } from './components/SearchHistory';
import { checkCompany } from './services/api.service';
import { getSearchHistory, addToHistory } from './services/storage.service';
import { UnifiedResponse, ErrorResponse, HistoryEntry } from './types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<UnifiedResponse | null>(null);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [lastSearchedCompany, setLastSearchedCompany] = useState<string>('');

  useEffect(() => {
    const savedHistory = getSearchHistory();
    setHistory(savedHistory.entries);
  }, []);

  const handleSearch = async (companyName: string) => {
    setIsLoading(true);
    setError(null);
    setResults(null);
    setLastSearchedCompany(companyName);

    try {
      const data = await checkCompany(companyName);
      setResults(data);
      addToHistory(companyName, data);
      
      const updatedHistory = getSearchHistory();
      setHistory(updatedHistory.entries);
    } catch (err: any) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistory = (entry: HistoryEntry) => {
    setResults(entry.results);
    setError(null);
    setLastSearchedCompany(entry.companyName);
  };

  const handleRetry = () => {
    if (lastSearchedCompany) {
      handleSearch(lastSearchedCompany);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <SearchHistory 
        history={history} 
        onSelectEntry={handleSelectHistory}
        currentCompany={results?.company_name}
      />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-2">H1B & E-Verify Company Checker</h1>
          <p className="text-center text-gray-600 mb-8">
            Check if a company is E-Verified or sponsors H1B visas
          </p>

          <SearchBar onSearch={handleSearch} isLoading={isLoading} />

          {isLoading && (
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Searching...</p>
            </div>
          )}

          {error && <ErrorDisplay error={error} onRetry={handleRetry} />}

          {results && !isLoading && <ResultsDisplay results={results} />}
        </div>
      </div>
    </div>
  );
}

export default App;
