import express, { Request, Response, NextFunction } from 'express';
import { config } from './utils/config.ts';
import { logger } from './utils/logger.ts';
import briefingsRouter from './routes/briefings.ts';
import brandProfilesRouter from './routes/brand-profiles.ts';
import copyRouter from './routes/copy.ts';
import contentRouter from './routes/content.ts';
import carouselRouter from './routes/carousel.ts';
import staticPostRouter from './routes/static-post.ts';
import designBriefRouter from './routes/design-brief.ts';
import funwheelRouter from './routes/funwheel.ts';
import salesPageRouter from './routes/sales-page.ts';
import { errorHandler } from './middleware/error-handler.ts';

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

// Brand profiles routes (Story 1.4)
app.use('/brand-profiles', brandProfilesRouter);

// Copy generation routes (Story 1.5)
app.use('/copy', copyRouter);

// Content generation routes (Story 2.1)
app.use('/content', contentRouter);

// Carousel generation routes (Story 2.2)
app.use('/carousel', carouselRouter);

// Static post generation routes (Story 2.3)
app.use('/static-post', staticPostRouter);

// Design brief generation routes (Story 2.4)
app.use('/design-brief', designBriefRouter);

// FunWheel routes (Story 3.2+)
app.use('/funwheel', funwheelRouter);

// Sales page routes (Story 4.1+)
app.use('/sales-page', salesPageRouter);

app.post('/content/generate-package', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/funwheel/generate', (req: Request, res: Response) => {
  res.status(501).json({ error: 'Not implemented' });
});

app.post('/leads', (req: Request, res: Response) => {
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
