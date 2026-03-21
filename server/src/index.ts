import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import companyRoutes from './routes/company.routes';

// Load .env from project root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', companyRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`TEST_MODE: ${process.env.TEST_MODE}`);
  console.log(`TINYFISH_API_KEY: ${process.env.TINYFISH_API_KEY ? 'Set' : 'Not set'}`);
  
  if (!process.env.TINYFISH_API_KEY && process.env.TEST_MODE !== 'true') {
    console.warn('⚠️  WARNING: TINYFISH_API_KEY environment variable is not set');
  }
});
