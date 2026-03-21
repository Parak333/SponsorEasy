import { CompanySearchRequest, UnifiedResponse } from '../types';

const API_BASE_URL = '/api';

export const checkCompany = async (companyName: string): Promise<UnifiedResponse> => {
  const response = await fetch(`${API_BASE_URL}/check-company`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ companyName } as CompanySearchRequest),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
};
