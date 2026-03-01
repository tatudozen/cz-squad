import express, { Request, Response, NextFunction } from 'express';
import { config } from './utils/config'
import { logger } from './utils/logger'
import clientsRouter from './routes/clients'
import briefingsRouter from './routes/briefings'
import brandProfilesRouter from './routes/brand-profiles'
import copyRouter from './routes/copy'
import contentRouter from './routes/content'
import carouselRouter from './routes/carousel'
import staticPostRouter from './routes/static-post'
import designBriefRouter from './routes/design-brief'
import funwheelRouter from './routes/funwheel'
import salesPageRouter from './routes/sales-page'
import projectsRouter from './routes/projects'
import deliverablesRouter from './routes/deliverables'
import { errorHandler } from './middleware/error-handler'

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

// Clients routes (Story 1.3)
app.use('/clients', clientsRouter);

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

// Project pipeline routes (Story 4.3)
app.use('/projects', projectsRouter);

// Deliverable approval routes (Story 4.4)
app.use('/deliverables', deliverablesRouter);

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
