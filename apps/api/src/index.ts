import express, { Request, Response, NextFunction } from 'express';
import { config } from "./utils/config.js"
import { logger } from "./utils/logger.js"
import clientsRouter from "./routes/clients.js"
import briefingsRouter from "./routes/briefings.js"
import brandProfilesRouter from "./routes/brand-profiles.js"
import copyRouter from "./routes/copy.js"
import contentRouter from "./routes/content.js"
import carouselRouter from "./routes/carousel.js"
import staticPostRouter from "./routes/static-post.js"
import designBriefRouter from "./routes/design-brief.js"
import funwheelRouter from "./routes/funwheel.js"
import salesPageRouter from "./routes/sales-page.js"
import projectsRouter from "./routes/projects.js"
import deliverablesRouter from "./routes/deliverables.js"
import { errorHandler } from "./middleware/error-handler.js"
import { validateApiKey } from "./middleware/auth.js"

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

// Middleware to validate API key only for non-POST requests
const validateApiKeyExceptPost = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST') {
    return next(); // Skip validation for POST (public form submission)
  }
  return validateApiKey(req, res, next);
};

// Protected routes (require API key)
// Clients routes (Story 1.3)
app.use('/clients', validateApiKey, clientsRouter);

// Briefings routes (Story 1.3)
// POST /briefings is public (form submission) for story 1.2.5
// GET/PATCH/DELETE require API key
app.use('/briefings', validateApiKeyExceptPost, briefingsRouter);

// Brand profiles routes (Story 1.4)
app.use('/brand-profiles', validateApiKey, brandProfilesRouter);

// Copy generation routes (Story 1.5)
app.use('/copy', validateApiKey, copyRouter);

// Content generation routes (Story 2.1)
app.use('/content', validateApiKey, contentRouter);

// Carousel generation routes (Story 2.2)
app.use('/carousel', validateApiKey, carouselRouter);

// Static post generation routes (Story 2.3)
app.use('/static-post', validateApiKey, staticPostRouter);

// Design brief generation routes (Story 2.4)
app.use('/design-brief', validateApiKey, designBriefRouter);

// FunWheel routes (Story 3.2+)
app.use('/funwheel', validateApiKey, funwheelRouter);

// Sales page routes (Story 4.1+)
app.use('/sales-page', validateApiKey, salesPageRouter);

// Project pipeline routes (Story 4.3)
app.use('/projects', validateApiKey, projectsRouter);

// Deliverable approval routes (Story 4.4)
app.use('/deliverables', validateApiKey, deliverablesRouter);

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
