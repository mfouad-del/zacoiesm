import express from 'express';
import cors from 'cors';
import routes from './routes';
import { config } from './config/env';

const app = express();

app.use(
  cors({
    origin: config.corsOrigins && config.corsOrigins.length > 0 ? config.corsOrigins : true,
    credentials: true
  })
);
app.use(express.json());

// API Routes
app.use('/api/v1', routes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
