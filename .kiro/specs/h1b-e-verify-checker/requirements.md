# Requirements Document

## Introduction

The H1B & E-Verify Company Checker is a web application that enables users to search for companies and retrieve real-time information about their E-Verify enrollment status and H1B visa sponsorship history. The system integrates with the TinyFish Web Agent API to scrape live data from official sources (e-verify.gov and h1bdata.info) and presents the results in a user-friendly interface.

## Glossary

- **Frontend**: The React-based user interface that accepts company name input and displays results
- **Backend**: The Node.js Express server that orchestrates API calls and data aggregation
- **TinyFish_API**: The external web automation service that scrapes data from target websites
- **E-Verify_Service**: The government website (e-verify.gov) that maintains company E-Verify enrollment data
- **H1B_Service**: The public database (h1bdata.info) that tracks H1B visa sponsorship information
- **Search_Request**: A user-initiated query containing a company name
- **Unified_Response**: The combined JSON result containing both E-Verify and H1B data
- **SSE_Stream**: Server-Sent Events stream returned by TinyFish API in the format `event: <TYPE>\ndata: <JSON>`
- **Result_Event**: An SSE event with type "COMPLETE" and status "COMPLETED" containing the scraped data in the resultJson field
- **STATUS_UPDATE**: An SSE event type indicating progress (e.g., "RUNNING", "Navigating...")
- **eventsource-parser**: A library for parsing Server-Sent Events streams
- **Search_History**: A collection of up to 10 previous company searches stored in browser localStorage
- **History_Entry**: A single search record containing company name, timestamp, and cached results

## Requirements

### Requirement 1: Company Search Interface

**User Story:** As a job seeker, I want to enter a company name in a search box, so that I can quickly check their visa sponsorship status.

#### Acceptance Criteria

1. THE Frontend SHALL display a search input field that accepts company names
2. THE Frontend SHALL display a "Check" button that triggers the search
3. WHEN the user clicks the "Check" button, THE Frontend SHALL send a POST request to /api/check-company with the company name
4. WHILE a search is in progress, THE Frontend SHALL display a loading indicator
5. THE Frontend SHALL prevent empty searches by disabling the "Check" button when the input field is empty

### Requirement 2: Backend API Endpoint

**User Story:** As the Frontend, I want a reliable API endpoint, so that I can retrieve company verification data.

#### Acceptance Criteria

1. THE Backend SHALL expose a POST endpoint at /api/check-company
2. WHEN a Search_Request is received, THE Backend SHALL validate that the company name is present
3. IF the company name is missing or empty, THEN THE Backend SHALL return a 400 status code with an error message
4. THE Backend SHALL accept JSON payloads with a "companyName" field
5. THE Backend SHALL return a Unified_Response in JSON format

### Requirement 3: E-Verify Data Retrieval

**User Story:** As the Backend, I want to retrieve E-Verify enrollment status, so that I can inform users about company verification status.

#### Acceptance Criteria

1. WHEN processing a Search_Request, THE Backend SHALL make a POST request to https://agent.tinyfish.ai/v1/automation/run-sse
2. THE Backend SHALL include the X-API-Key header with the value from TINYFISH_API_KEY environment variable
3. THE Backend SHALL send a request body containing url "https://www.e-verify.gov/" and goal: "Go to the E-Verify employer search. Search for '<COMPANY_NAME>'. If results appear, extract the company name, city, state, and enrollment date. Return JSON: {\"company_name\": str, \"is_e_verified\": bool, \"city\": str, \"state\": str, \"enrollment_date\": str, \"e_verify_details\": str}. If no results found, return is_e_verified as false."
4. THE Backend SHALL parse the SSE_Stream returned by TinyFish_API
5. THE Backend SHALL extract the resultJson field from the Result_Event
6. THE Backend SHALL parse the resultJson to extract: company_name, is_e_verified, city, state, enrollment_date, and e_verify_details
7. IF the TinyFish_API request fails, THEN THE Backend SHALL return an error indicating E-Verify data is unavailable

### Requirement 4: H1B Sponsorship Data Retrieval

**User Story:** As the Backend, I want to retrieve H1B sponsorship information, so that I can inform users about visa sponsorship history.

#### Acceptance Criteria

1. WHEN processing a Search_Request, THE Backend SHALL make a POST request to https://agent.tinyfish.ai/v1/automation/run-sse
2. THE Backend SHALL include the X-API-Key header with the value from TINYFISH_API_KEY environment variable
3. THE Backend SHALL send a request body containing url "https://h1bdata.info" and goal: "Search for '<COMPANY_NAME>' on h1bdata.info. Look at the search results and extract: total number of H1B filings found, the most recent year's filing count, and average salary if shown. Return JSON: {\"company_name\": str, \"sponsors_h1b\": bool, \"total_filings\": number, \"recent_year\": str, \"recent_filings\": number, \"avg_salary\": str, \"h1b_details\": str}. If no results found, return sponsors_h1b as false."
4. THE Backend SHALL parse the SSE_Stream returned by TinyFish_API
5. THE Backend SHALL extract the resultJson field from the Result_Event
6. THE Backend SHALL parse the resultJson to extract: company_name, sponsors_h1b, total_filings, recent_year, recent_filings, avg_salary, and h1b_details
7. IF the TinyFish_API request fails, THEN THE Backend SHALL return an error indicating H1B data is unavailable

### Requirement 5: SSE Stream Parser

**User Story:** As the Backend, I want to parse Server-Sent Events streams, so that I can extract the final results from TinyFish API responses.

#### Acceptance Criteria

1. THE Backend SHALL use streaming fetch or the eventsource-parser library to read the SSE_Stream
2. THE Backend SHALL process incoming SSE events in the format: `event: <TYPE>\ndata: <JSON>`
3. THE Backend SHALL identify events where the data contains type "COMPLETE" and status "COMPLETED"
4. WHEN a Result_Event is identified, THE Backend SHALL extract the resultJson field
5. THE Backend SHALL parse the resultJson field as JSON (it is a JSON string nested inside JSON)
6. THE Backend SHALL implement a 120-second timeout for each TinyFish_API call
7. IF the timeout is reached, THEN THE Backend SHALL throw a timeout error
8. IF an event has status "FAILED", THEN THE Backend SHALL throw a descriptive error with the failure message
9. IF the SSE_Stream terminates without a Result_Event, THEN THE Backend SHALL return an error indicating incomplete data

### Requirement 6: Response Aggregation

**User Story:** As the Backend, I want to combine E-Verify and H1B data, so that I can provide a single unified response to the Frontend.

#### Acceptance Criteria

1. WHEN both E-Verify and H1B data are retrieved, THE Backend SHALL combine them into a Unified_Response
2. THE Unified_Response SHALL include all fields from both data sources
3. THE Unified_Response SHALL include the company_name field
4. THE Unified_Response SHALL include E-Verify fields: is_e_verified, city, state, enrollment_date, and e_verify_details
5. THE Unified_Response SHALL include H1B fields: sponsors_h1b, total_filings, recent_year, recent_filings, avg_salary, and h1b_details
6. THE Backend SHALL return the Unified_Response with a 200 status code

### Requirement 7: Results Display

**User Story:** As a job seeker, I want to see clear visual indicators of verification status, so that I can quickly understand the results.

#### Acceptance Criteria

1. WHEN the Frontend receives a Unified_Response, THE Frontend SHALL display the results in a card-based layout
2. THE Frontend SHALL display two separate cards: one for E-Verify status and one for H1B sponsorship status
3. WHEN is_e_verified is true, THE Frontend SHALL display the E-Verify card with a green background and a checkmark icon
4. WHEN is_e_verified is false, THE Frontend SHALL display the E-Verify card with a red/orange background and an X icon
5. WHEN sponsors_h1b is true, THE Frontend SHALL display the H1B card with a green background and a checkmark icon
6. WHEN sponsors_h1b is false, THE Frontend SHALL display the H1B card with a red/orange background and an X icon
7. THE Frontend SHALL display the company name prominently at the top of the results section
8. WHEN is_e_verified is true, THE Frontend SHALL show detailed E-Verify information (city, state, enrollment_date, e_verify_details) in an expandable section within the card
9. WHEN sponsors_h1b is true, THE Frontend SHALL show detailed H1B information (total_filings, recent_year, recent_filings, avg_salary, h1b_details) in an expandable section within the card
10. THE expandable sections SHALL be collapsed by default and expand when the user clicks on them
11. WHEN results load, THE Frontend SHALL apply a subtle fade-in or slide-in animation to the result cards
12. THE Frontend SHALL use Tailwind CSS classes to implement the card styling, backgrounds, and animations

### Requirement 8: Error Handling

**User Story:** As a user, I want to see helpful error messages when something goes wrong, so that I understand what happened.

#### Acceptance Criteria

1. IF the Backend returns an error response, THEN THE Frontend SHALL display the error message to the user
2. IF the TinyFish_API is unreachable, THEN THE Backend SHALL return a 503 status code with a descriptive error message
3. IF the TINYFISH_API_KEY environment variable is not set, THEN THE Backend SHALL return a 500 status code with error type "API_KEY_NOT_CONFIGURED"
4. WHEN a network error occurs, THE Frontend SHALL display a user-friendly error message
5. THE Frontend SHALL clear previous results when displaying an error
6. WHEN a TinyFish_API call times out after 120 seconds, THE Backend SHALL return an error with type "TIMEOUT"
7. WHEN the Frontend receives a "TIMEOUT" error, THE Frontend SHALL display the message "Search is taking longer than expected, please try again"
8. WHEN both E-Verify and H1B searches return no results (is_e_verified is false AND sponsors_h1b is false), THE Frontend SHALL display "No records found" with suggestions to check the company name spelling or try alternative company names
9. WHEN the Frontend receives an "API_KEY_NOT_CONFIGURED" error, THE Frontend SHALL display setup instructions directing the user to configure the TINYFISH_API_KEY environment variable
10. WHEN a network error occurs, THE Frontend SHALL display a "Retry" button that allows the user to retry the search
11. THE Frontend SHALL display error messages in a visually distinct error card or banner
12. ERROR messages SHALL use appropriate colors (red/orange) to indicate failure states

### Requirement 9: Environment Configuration

**User Story:** As a system administrator, I want to configure the TinyFish API key via environment variables, so that I can secure API credentials.

#### Acceptance Criteria

1. THE Backend SHALL read the TINYFISH_API_KEY from environment variables
2. WHEN the Backend starts, THE Backend SHALL validate that TINYFISH_API_KEY is present
3. IF TINYFISH_API_KEY is missing, THEN THE Backend SHALL log a warning message
4. THE Backend SHALL use the TINYFISH_API_KEY value in the X-API-Key header for all TinyFish_API requests

### Requirement 10: TypeScript Type Safety

**User Story:** As a developer, I want strong type definitions for all data structures, so that I can catch errors at compile time.

#### Acceptance Criteria

1. THE Frontend SHALL define TypeScript interfaces for Search_Request and Unified_Response
2. THE Backend SHALL define TypeScript interfaces for TinyFish_API request and response structures
3. THE Backend SHALL define TypeScript interfaces for E-Verify and H1B data structures
4. THE Frontend SHALL use typed API client functions for all Backend requests
5. THE Backend SHALL use typed functions for SSE_Stream parsing
6. THE Frontend SHALL define TypeScript interfaces for Search_History and History_Entry

### Requirement 11: Search History Sidebar

**User Story:** As a user, I want to see my recent company searches, so that I can quickly access previously checked companies without making new API calls.

#### Acceptance Criteria

1. THE Frontend SHALL display a sidebar showing the Search_History
2. THE Search_History SHALL contain up to 10 most recent History_Entry items
3. WHEN a new search completes successfully, THE Frontend SHALL add a History_Entry to Search_History
4. EACH History_Entry SHALL include: company name, date/time checked, and the complete Unified_Response
5. THE Frontend SHALL store the Search_History in browser localStorage
6. THE Frontend SHALL load the Search_History from localStorage when the application starts
7. WHEN Search_History exceeds 10 entries, THE Frontend SHALL remove the oldest entry
8. EACH History_Entry in the sidebar SHALL display: company name, formatted date checked, and quick status icons for E-Verify and H1B
9. THE quick status icons SHALL be a green checkmark for positive results and a red X for negative results
10. WHEN a user clicks on a History_Entry, THE Frontend SHALL display the cached Unified_Response without making new API calls
11. THE Frontend SHALL visually indicate which History_Entry is currently displayed
12. THE sidebar SHALL be responsive and collapse on mobile devices
