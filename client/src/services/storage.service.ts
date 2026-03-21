import { SearchHistory, HistoryEntry, UnifiedResponse } from '../types';

const STORAGE_KEY = 'h1b-checker-history';
const MAX_ENTRIES = 10;

export const getSearchHistory = (): SearchHistory => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading search history:', error);
  }
  return { entries: [] };
};

export const addToHistory = (companyName: string, results: UnifiedResponse): void => {
  try {
    const history = getSearchHistory();
    
    const newEntry: HistoryEntry = {
      companyName,
      timestamp: Date.now(),
      results
    };

    // Remove duplicate if exists
    history.entries = history.entries.filter(
      entry => entry.companyName.toLowerCase() !== companyName.toLowerCase()
    );

    // Add new entry at the beginning
    history.entries.unshift(newEntry);

    // Keep only the last MAX_ENTRIES
    if (history.entries.length > MAX_ENTRIES) {
      history.entries = history.entries.slice(0, MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
};
