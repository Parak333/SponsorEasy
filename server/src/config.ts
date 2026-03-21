export const config = {
  TINYFISH_API_URL: 'https://agent.tinyfish.ai/v1/automation/run-sse',
  TIMEOUT_MS: 180000, // 180 seconds
  TEST_MODE: process.env.TEST_MODE === 'true', // Enable test mode with mock data
};
