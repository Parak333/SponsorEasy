export interface CompanySearchRequest {
  companyName: string;
}

export interface UnifiedResponse {
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

export interface TinyFishRequest {
  url: string;
  goal: string;
}

export interface TinyFishSSEEvent {
  type: 'STATUS_UPDATE' | 'COMPLETE';
  status: 'RUNNING' | 'COMPLETED' | 'FAILED';
  message?: string;
  resultJson?: string;
}

export interface EVerifyData {
  company_name: string;
  is_e_verified: boolean;
  city?: string;
  state?: string;
  enrollment_date?: string;
  e_verify_details: string;
}

export interface H1BData {
  company_name: string;
  sponsors_h1b: boolean;
  total_filings?: number;
  recent_year?: string;
  recent_filings?: number;
  avg_salary?: string;
  h1b_details: string;
}

export enum ErrorType {
  TIMEOUT = 'TIMEOUT',
  API_KEY_NOT_CONFIGURED = 'API_KEY_NOT_CONFIGURED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  NO_RESULTS = 'NO_RESULTS',
  TINYFISH_FAILED = 'TINYFISH_FAILED'
}

export interface ErrorResponse {
  error: string;
  type: ErrorType;
  message: string;
}
