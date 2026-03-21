# Design Document

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│  React Frontend │────────▶│ Express Backend │────────▶│  TinyFish API   │
│   (TypeScript)  │◀────────│   (TypeScript)  │◀────────│   (SSE Stream)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                            │
        │                            │
        ▼                            ▼
┌─────────────────┐         ┌─────────────────┐
│  localStorage   │         │  Environment    │
│ (Search History)│         │   Variables     │
└─────────────────┘         └─────────────────┘
```

## Frontend Components

### Component Structure
```
App.tsx
├── SearchBar.tsx          # Company name input + search button
├── ResultsDisplay.tsx     # Container for result cards
│   ├── ResultCard.tsx     # E-Verify or H1B status card
│   └── ExpandableDetails.tsx  # Collapsible detail section
├── SearchHistory.tsx      # Sidebar with recent searches
│   └── HistoryEntry.tsx   # Individual history item
└── ErrorDisplay.tsx       # Error messages with retry
```

### Data Flow
1. User enters company name → SearchBar
2. SearchBar calls API service → Backend
3. Backend returns Unified_Response → ResultsDisplay
4. ResultsDisplay saves to localStorage → SearchHistory
5. User clicks HistoryEntry → Display cached results

## Backend Architecture

### API Endpoints
```
POST /api/check-company
Request:  { companyName: string }
Response: UnifiedResponse (see Data Models)
```

### Service Layer
```
server/src/services/
└── tinyfish.service.ts
    ├── fetchEVerifyData()
    ├── fetchH1BData()
    ├── parseSSEStream()
    └── handleTimeout()
```

### SSE Stream Processing
```typescript
1. Make POST to TinyFish API
2. Read response as stream
3. Parse SSE events line by line
4. Look for event: COMPLETE with status: COMPLETED
5. Extract and parse resultJson (double-encoded JSON)
6. Handle timeout after 120 seconds
7. Handle FAILED status
```

## Data Models

### TypeScript Interfaces

```typescript
// Frontend & Backend
interface CompanySearchRequest {
  companyName: string;
}

interface UnifiedResponse {
  company_name: string;
  is_e_verified: boolean;
  city?: string;
  state?: string;
  enrollment_date?: string;
  e_verify_details: string;
  sponsors_h1b: boolean;
  total_filings?: number;
  recent_year?: string;
  recent_filings?: number;
  avg_salary?: string;
  h1b_details: string;
}

// Frontend Only
interface HistoryEntry {
  companyName: string;
  timestamp: number;
  results: UnifiedResponse;
}

interface SearchHistory {
  entries: HistoryEntry[];
}

// Backend Only
interface TinyFishRequest {
  url: string;
  goal: string;
}

interface TinyFishSSEEvent {
  type: 'STATUS_UPDATE' | 'COMPLETE';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  message?: string;
  resultJson?: string;
}

interface EVerifyData {
  company_name: string;
  is_e_verified: boolean;
  city?: string;
  state?: string;
  enrollment_date?: string;
  e_verify_details: string;
}

interface H1BData {
  company_name: string;
  sponsors_h1b: boolean;
  total_filings?: number;
  recent_year?: string;
  recent_filings?: number;
  avg_salary?: string;
  h1b_details: string;
}
```

## Error Handling Strategy

### Error Types
```typescript
enum ErrorType {
  TIMEOUT = 'TIMEOUT',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NO_RESULTS = 'NO_RESULTS',
  TINYFISH_FAILED = 'TINYFISH_FAILED'
}

interface ErrorResponse {
  error: string;
  type: ErrorType;
  message: string;
}
```

### Error Flow
1. Backend catches errors → Returns ErrorResponse with type
2. Frontend receives error → ErrorDisplay component
3. ErrorDisplay shows appropriate message based on type
4. User can retry (network errors) or see instructions (config errors)

## localStorage Schema

```typescript
// Key: 'h1b-checker-history'
{
  "entries": [
    {
      "companyName": "Google",
      "timestamp": 1710979200000,
      "results": { /* UnifiedResponse */ }
    }
    // ... up to 10 entries
  ]
}
```

## Styling Approach

### Tailwind CSS Classes
- Cards: `rounded-lg shadow-md p-6`
- Green (positive): `bg-green-50 border-green-500`
- Red (negative): `bg-red-50 border-red-500`
- Animation: `animate-fade-in` (custom animation)
- Icons: Use SVG checkmark and X icons

### Responsive Design
- Desktop: Sidebar visible, cards side-by-side
- Mobile: Sidebar collapsible, cards stacked

## Implementation Notes

### TinyFish API Integration
- Use `fetch` with streaming response
- Parse SSE manually or use `eventsource-parser` library
- Implement AbortController for timeout
- Make both API calls in parallel for performance

### Security
- API key from environment variable only
- Validate all user inputs
- Sanitize company names before API calls
- No sensitive data in localStorage

### Performance
- Parallel API calls (E-Verify + H1B)
- Cache results in localStorage
- Debounce search input
- Lazy load history entries
