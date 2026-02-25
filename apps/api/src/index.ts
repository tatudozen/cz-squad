import express, { Request, Response, NextFunction } from 'express';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import briefingsRouter from './routes/briefings.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

// Middleware
app.use(express.json());
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = crypto.randomUUID();
  logger.info(`${req.method} ${req.path}`, { requestId: req.id });
  next();
});

// Initialize Supabase
// const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
// TODO: Wire supabase to routes in Story 1.2

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
  });
});

// Metrics endpoint
app.get('/metrics', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// Briefings routes (Story 1.3)
app.use('/briefings', briefingsRouter);

// TODO: Implement briefing approval endpoint in Story 1.4
app.post('/briefings/:id/approve', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.get('/brand-profiles/:clientId', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/content/generate-package', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/funwheel/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/leads', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/sales-page/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

// Global error handler (Story 1.3)
app.use(errorHandler);

// Start server
const PORT = config.apiPort;
const HOST = config.apiHost;

app.listen(PORT, () => {
  logger.info(`CopyZen API listening at http://${HOST}:${PORT}`, { version: '0.1.0' });
});

export default app;

// Extend Express Request type
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      id: string;
    }
  }
}
