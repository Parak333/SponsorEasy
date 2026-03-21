import { Router, Request, Response } from 'express';
import { TinyFishService } from '../services/tinyfish.service';
import { CompanySearchRequest, UnifiedResponse, ErrorType, ErrorResponse } from '../types';

const router = Router();

router.post('/check-company', async (req: Request, res: Response) => {
  try {
    const { companyName }: CompanySearchRequest = req.body;

    if (!companyName || companyName.trim() === '') {
      return res.status(400).json({
        error: 'Bad Request',
        type: ErrorType.NO_RESULTS,
        message: 'Company name is required'
      } as ErrorResponse);
    }

    const tinyfishService = new TinyFishService();

    // Make both API calls in parallel using separate agents
    console.log(`Starting parallel search for: ${companyName}`);
    
    const [eVerifyResult, h1bResult] = await Promise.allSettled([
      tinyfishService.fetchEVerifyData(companyName),
      tinyfishService.fetchH1BData(companyName)
    ]);
    
    // Handle E-Verify result
    let eVerifyData: any;
    if (eVerifyResult.status === 'fulfilled') {
      eVerifyData = eVerifyResult.value;
    } else {
      console.error('E-Verify search failed:', eVerifyResult.reason);
      eVerifyData = {
        company_name: companyName,
        is_e_verified: false,
        e_verify_details: 'Search failed or timed out'
      };
    }
    
    // Handle H1B result
    let h1bData: any;
    if (h1bResult.status === 'fulfilled') {
      h1bData = h1bResult.value;
    } else {
      console.error('H1B search failed:', h1bResult.reason);
      h1bData = {
        company_name: companyName,
        sponsors_h1b: false,
        h1b_details: 'Search failed or timed out'
      };
    }

    const unifiedResponse: UnifiedResponse = {
      company_name: companyName,
      is_e_verified: eVerifyData.is_e_verified,
      city: eVerifyData.city,
      state: eVerifyData.state,
      enrollment_date: eVerifyData.enrollment_date,
      e_verify_details: eVerifyData.e_verify_details,
      sponsors_h1b: h1bData.sponsors_h1b,
      total_filings: h1bData.total_filings,
      recent_year: h1bData.recent_year,
      recent_filings: h1bData.recent_filings,
      avg_salary: h1bData.avg_salary,
      h1b_details: h1bData.h1b_details
    };

    res.json(unifiedResponse);
  } catch (error: any) {
    console.error('Error checking company:', error);

    if (error.message === 'TINYFISH_API_KEY environment variable is not set') {
      return res.status(500).json({
        error: 'Configuration Error',
        type: ErrorType.API_KEY_NOT_CONFIGURED,
        message: 'API key is not configured. Please set TINYFISH_API_KEY environment variable.'
      } as ErrorResponse);
    }

    if (error.type === ErrorType.TIMEOUT) {
      return res.status(504).json({
        error: 'Timeout',
        type: ErrorType.TIMEOUT,
        message: 'Search is taking longer than expected, please try again'
      } as ErrorResponse);
    }

    if (error.type === ErrorType.TINYFISH_FAILED) {
      return res.status(500).json({
        error: 'TinyFish Error',
        type: ErrorType.TINYFISH_FAILED,
        message: error.message
      } as ErrorResponse);
    }

    res.status(503).json({
      error: 'Service Unavailable',
      type: ErrorType.NETWORK_ERROR,
      message: 'Unable to reach external services. Please try again later.'
    } as ErrorResponse);
  }
});

export default router;
