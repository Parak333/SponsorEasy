# H1B & E-Verify Company Checker

A web application that checks if companies are E-Verified and sponsor H1B visas using the TinyFish Web Agent API.

## Features

- 🔍 Search for any company by name
- ✅ Check E-Verify enrollment status with location and enrollment date
- 💼 Check H1B sponsorship history with filing counts and salary data
- 📊 View detailed information in expandable cards
- 📝 Search history sidebar with last 10 searches (cached in localStorage)
- 🎨 Beautiful UI with Tailwind CSS and smooth animations
- ⚡ Fast parallel API calls for better performance
- 🛡️ Comprehensive error handling

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript
- **External API**: TinyFish Web Agent API (SSE-based)

## Prerequisites

- Node.js 18+ and npm
- TinyFish API key

## Installation

1. Clone the repository and navigate to the project directory

2. Install root dependencies:
```bash
npm install
```

3. Install server dependencies:
```bash
cd server
npm install
cd ..
```

4. Install client dependencies:
```bash
cd client
npm install
cd ..
```

5. Your `.env` file is already configured with the TinyFish API key

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Backend server on http://localhost:3001
- Frontend dev server on http://localhost:3000

### Run Separately

Backend only:
```bash
cd server
npm run dev
```

Frontend only:
```bash
cd client
npm run dev
```

## Building for Production

Build both frontend and backend:
```bash
npm run build
```

Start the production server:
```bash
cd server
npm start
```

Then serve the built frontend from `client/dist` using your preferred static file server.

## Project Structure

```
h1b-e-verify-checker/
├── .env                    # Environment variables (API key)
├── .gitignore             # Git ignore file
├── package.json           # Root package.json
├── README.md              # This file
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API and storage services
│   │   ├── types/         # TypeScript interfaces
│   │   ├── App.tsx        # Main app component
│   │   ├── main.tsx       # Entry point
│   │   └── index.css      # Tailwind CSS
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── server/                # Express backend
    ├── src/
    │   ├── routes/        # API routes
    │   ├── services/      # TinyFish service
    │   ├── types/         # TypeScript interfaces
    │   └── index.ts       # Server entry point
    ├── package.json
    └── tsconfig.json
```

## How It Works

1. User enters a company name and clicks "Check"
2. Frontend sends POST request to `/api/check-company`
3. Backend makes two parallel calls to TinyFish API:
   - E-Verify search on e-verify.gov
   - H1B search on h1bdata.info
4. Backend parses SSE streams and extracts results
5. Backend combines both results and returns unified response
6. Frontend displays results in card-based layout
7. Results are cached in localStorage for quick access

## API Endpoints

### POST /api/check-company

Request:
```json
{
  "companyName": "Google"
}
```

Response:
```json
{
  "company_name": "Google",
  "is_e_verified": true,
  "city": "Mountain View",
  "state": "CA",
  "enrollment_date": "2023-01-15",
  "e_verify_details": "Active enrollment",
  "sponsors_h1b": true,
  "total_filings": 5000,
  "recent_year": "2024",
  "recent_filings": 1200,
  "avg_salary": "$150,000",
  "h1b_details": "Active sponsor"
}
```

## Error Handling

The application handles various error scenarios:

- **Timeout**: Shows "Search is taking longer than expected, please try again"
- **No Results**: Shows "No records found" with suggestions
- **API Key Not Configured**: Shows setup instructions
- **Network Error**: Shows retry button

## Environment Variables

- `TINYFISH_API_KEY`: Your TinyFish API key (required)
- `PORT`: Server port (default: 3001)

## License

MIT
