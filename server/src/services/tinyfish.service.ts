import { createParser, ParsedEvent } from 'eventsource-parser';
import { TinyFishRequest, TinyFishSSEEvent, EVerifyData, H1BData, ErrorType } from '../types';

const TINYFISH_API_URL = 'https://agent.tinyfish.ai/v1/automation/run-sse';
const TIMEOUT_MS = 180000; // 180 seconds (3 minutes)

export class TinyFishService {
  private apiKey: string;

  constructor() {
    const apiKey = process.env.TINYFISH_API_KEY;
    const testMode = process.env.TEST_MODE === 'true';
    
    if (!apiKey && !testMode) {
      throw new Error('TINYFISH_API_KEY environment variable is not set');
    }
    this.apiKey = apiKey || '';
  }

  async fetchEVerifyData(companyName: string): Promise<EVerifyData> {
    // Test mode with mock data
    if (process.env.TEST_MODE === 'true') {
      console.log(`[E-Verify] TEST MODE: Returning mock data for: ${companyName}`);
      await this.delay(2000); // Simulate API delay
      return {
        company_name: companyName,
        is_e_verified: true,
        city: 'Seattle',
        state: 'WA',
        enrollment_date: '2020-01-15',
        e_verify_details: 'Active E-Verify participant (TEST DATA)'
      };
    }

    const goal = `Go to the E-Verify employer search. Search for '${companyName}'. If results appear, extract the company name, city, state, and enrollment date. Return JSON: {"company_name": str, "is_e_verified": bool, "city": str, "state": str, "enrollment_date": str, "e_verify_details": str}. If no results found, return is_e_verified as false.`;
    
    const request: TinyFishRequest = {
      url: 'https://www.e-verify.gov/',
      goal
    };

    try {
      console.log(`[E-Verify] Starting search for: ${companyName}`);
      const result = await this.callTinyFishAPI(request);
      console.log(`[E-Verify] Search completed for: ${companyName}`);
      return result as EVerifyData;
    } catch (error) {
      console.error(`[E-Verify] Search failed for: ${companyName}`, error);
      throw error;
    }
  }

  async fetchH1BData(companyName: string): Promise<H1BData> {
    // Test mode with mock data
    if (process.env.TEST_MODE === 'true') {
      console.log(`[H1B] TEST MODE: Returning mock data for: ${companyName}`);
      await this.delay(2000); // Simulate API delay
      return {
        company_name: companyName,
        sponsors_h1b: true,
        total_filings: 5000,
        recent_year: '2024',
        recent_filings: 1200,
        avg_salary: '$150,000',
        h1b_details: 'Active H1B sponsor with high filing volume (TEST DATA)'
      };
    }

    const goal = `Search for '${companyName}' on h1bdata.info. Look at the search results and extract: total number of H1B filings found, the most recent year's filing count, and average salary if shown. Return JSON: {"company_name": str, "sponsors_h1b": bool, "total_filings": number, "recent_year": str, "recent_filings": number, "avg_salary": str, "h1b_details": str}. If no results found, return sponsors_h1b as false.`;
    
    const request: TinyFishRequest = {
      url: 'https://h1bdata.info',
      goal
    };

    try {
      console.log(`[H1B] Starting search for: ${companyName}`);
      const result = await this.callTinyFishAPI(request);
      console.log(`[H1B] Search completed for: ${companyName}`);
      return result as H1BData;
    } catch (error) {
      console.error(`[H1B] Search failed for: ${companyName}`, error);
      throw error;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async callTinyFishAPI(request: TinyFishRequest): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(TINYFISH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error(`TinyFish API returned ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const result = await this.parseSSEStream(response.body);
      clearTimeout(timeoutId);
      return result;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        const timeoutError = new Error('Request timeout');
        (timeoutError as any).type = ErrorType.TIMEOUT;
        throw timeoutError;
      }
      
      throw error;
    }
  }

  private async parseSSEStream(stream: ReadableStream<Uint8Array>): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let result: any = null;

      const parser = createParser((event: ParsedEvent) => {
        if (event.type === 'event') {
          try {
            const data: TinyFishSSEEvent = JSON.parse(event.data);
            
            // Log status updates
            if (data.type === 'STATUS_UPDATE') {
              console.log(`[TinyFish] Status: ${data.status} - ${data.message || ''}`);
            }
            
            if (data.status === 'FAILED') {
              const error = new Error(data.message || 'TinyFish automation failed');
              (error as any).type = ErrorType.TINYFISH_FAILED;
              reject(error);
              return;
            }
            
            if (data.type === 'COMPLETE' && data.status === 'COMPLETED' && data.resultJson) {
              // resultJson is a JSON string inside JSON, so we need to parse it twice
              console.log('[TinyFish] Received COMPLETE event');
              result = JSON.parse(data.resultJson);
            }
          } catch (error) {
            console.error('Error parsing SSE event:', error);
          }
        }
      });

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              if (result) {
                resolve(result);
              } else {
                reject(new Error('Stream ended without COMPLETE event'));
              }
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            parser.feed(chunk);
          }
        } catch (error) {
          reject(error);
        }
      };

      processStream();
    });
  }
}
