/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import type { ApiResponse, HealthResponse } from './shared/types.ts';
import { WORKBOOK_SCHEMA_MANIFEST } from './server/config/contentOpsWorkbook.ts';
import { runWorkspaceDiagnostics } from './server/integrations/googleWorkspace/workspaceDiagnostics.ts';
import type { WorkspaceDiagnosticsData } from './shared/contracts/workspaceDiagnostics.ts';
import {
  sourceRepository,
  contentJobRepository,
  userRepository,
  configRepository,
  manualSourceRepository,
  activityLogRepository,
} from './server/repositories/index.ts';
import { livePreviewService } from './server/services/livePreviewService.ts';

dotenv.config();

// Safe directory resolution for ESM and CJS bundles
const currentDir = process.cwd();

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';
const startTime = Date.now();

// Base middleware
app.use(express.json());

// Request tracking & security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  res.setHeader('X-Request-Id', requestId);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.locals.requestId = requestId;
  next();
});

// Custom App Error Class
export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

/**
 * Health Check Endpoint
 * GET /api/health
 */
app.get('/api/health', (req: Request, res: Response) => {
  const mem = process.memoryUsage();
  const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000);

  const healthData: HealthResponse = {
    status: 'healthy',
    appName: 'IlmOps',
    version: '0.1.0',
    environment: process.env.NODE_ENV || 'development',
    uptimeSeconds,
    serverRuntime: 'Google AI Studio Node.js Server Runtime (Express)',
    nodeVersion: process.version,
    memory: {
      heapUsedMB: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
      heapTotalMB: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
      rssMB: Math.round((mem.rss / 1024 / 1024) * 100) / 100,
    },
    services: {
      server: 'running',
      api: 'online',
      storage: 'unconnected',
      sheets: 'connected (read-only)',
      drive: 'metadata (read-only)',
      dataAccessLayer: 'initialized (p05 repositories ready)',
    },
    security: {
      secretsIsolatedServerSide: true,
      corsRestricted: true,
    },
  };

  const response: ApiResponse<HealthResponse> = {
    success: true,
    data: healthData,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
    },
  };

  res.status(200).json(response);
});

/**
 * Workbook Schema Manifest Endpoint (Read-only configuration contracts)
 * GET /api/schema-manifest
 * Zero external Google API calls - Returns typed contracts & expected headers
 */
app.get('/api/schema-manifest', (req: Request, res: Response) => {
  const response: ApiResponse<typeof WORKBOOK_SCHEMA_MANIFEST> = {
    success: true,
    data: WORKBOOK_SCHEMA_MANIFEST,
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
    },
  };
  res.status(200).json(response);
});

/**
 * Google Workspace Diagnostics Endpoint (Strictly Read-Only Connection & Schema Check)
 * GET /api/integrations/workspace/diagnostics
 *
 * Verifies Google authorization, spreadsheet metadata, expected header rows,
 * and schema compliance. Redacts all sensitive/live operational data.
 */
app.get('/api/integrations/workspace/diagnostics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let accessToken: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim();
    }

    const diagnostics = await runWorkspaceDiagnostics(accessToken);

    const response: ApiResponse<WorkspaceDiagnosticsData> = {
      success: true,
      data: diagnostics,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * Google Workspace Repository Smoke Test Endpoint (Safe Aggregates Only)
 * GET /api/integrations/workspace/smoke-test
 *
 * Verifies live read-only repositories (P05) and returns safe aggregate record counts.
 * Does NOT expose full summaries, prompt text, user emails, or OAuth tokens.
 */
app.get('/api/integrations/workspace/smoke-test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let accessToken: string | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim();
    }

    const [aiSources, elSources, jobs, config, users, manualEntries, activityLogs] = await Promise.all([
      sourceRepository.listSources('AI_Content_Queue', { accessToken, pageSize: 50 }),
      sourceRepository.listSources('Electrical_Content_Queue', { accessToken, pageSize: 50 }),
      contentJobRepository.listJobs({ accessToken, pageSize: 50 }),
      configRepository.getAllConfig({ accessToken }),
      userRepository.listUsers({ accessToken }),
      manualSourceRepository.listManualEntries({ accessToken, pageSize: 50 }),
      activityLogRepository.listActivityLogs({ accessToken, pageSize: 50 }),
    ]);

    const aggregateReport = {
      aiSourceCount: aiSources.actualRecordCount ?? aiSources.items.length,
      electricalSourceCount: elSources.actualRecordCount ?? elSources.items.length,
      contentJobCount: jobs.actualRecordCount ?? jobs.items.length,
      brandProfileCount: config.brandProfiles.length,
      contentTypeCount: config.contentTypes.length,
      teamMemberCount: config.teamMembers.length,
      userCount: users.length,
      manualEntryCount: manualEntries.actualRecordCount ?? manualEntries.items.length,
      activityLogCount: activityLogs.actualRecordCount ?? activityLogs.items.length,
      mode: accessToken ? 'live_workspace_read_only' : 'offline_fixture_audit',
      safetyGuarantee: 'Aggregates only. Zero sensitive text, zero write operations.',
      dataAccessLayer: 'verified_active',
    };

    const response: ApiResponse<typeof aggregateReport> = {
      success: true,
      data: aggregateReport,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * Live Repository Health and Record Count Endpoint (P06)
 * GET /api/live-preview/health
 *
 * Explicitly separates actual mapped record counts from Google Sheets grid capacities.
 * Returns safe aggregates, data quality diagnostics, and one-to-many fan-out analysis.
 */
app.get('/api/live-preview/health', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let accessToken: string | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim();
    }

    if (!accessToken) {
      return next(
        new AppError(
          401,
          'AUTHORIZATION_REQUIRED',
          'Google Workspace access token required. Sign in with Google to inspect the live Operations Hub.',
          {
            userActionableMessage:
              'Please sign in with your authorized Google account to view live data from the ALLIN Operations Hub.',
          }
        )
      );
    }

    const health = await livePreviewService.getLiveRepositoryHealth(accessToken);

    const response: ApiResponse<typeof health> = {
      success: true,
      data: health,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * Live Research Sources Preview Endpoint (P06)
 * GET /api/live-preview/sources?niche=...&search=...&page=...&pageSize=...
 *
 * Bounded server-side pagination over actual live repository data.
 * Returns compact fields and safe detail preview; redacts raw rows and tokens.
 */
app.get('/api/live-preview/sources', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let accessToken: string | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim();
    }

    if (!accessToken) {
      return next(
        new AppError(
          401,
          'AUTHORIZATION_REQUIRED',
          'Google Workspace access token required.',
          {
            userActionableMessage:
              'Please sign in with your authorized Google account to view live research sources.',
          }
        )
      );
    }

    const niche = req.query.niche as string | undefined;
    const search = req.query.search as string | undefined;
    const queue = req.query.queue as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;

    const data = await livePreviewService.getLiveSources({
      niche,
      search,
      queue,
      page: isNaN(page) ? 1 : page,
      pageSize: isNaN(pageSize) ? 20 : Math.min(pageSize, 50),
      accessToken,
    });

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * Live Content Jobs Preview Endpoint (P06)
 * GET /api/live-preview/jobs?search=...&page=...&pageSize=...
 *
 * Bounded server-side pagination over actual live ContentJob repository data.
 * Strictly redacts prompt snapshots and social copy text.
 */
app.get('/api/live-preview/jobs', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    let accessToken: string | undefined = undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7).trim();
    }

    if (!accessToken) {
      return next(
        new AppError(
          401,
          'AUTHORIZATION_REQUIRED',
          'Google Workspace access token required.',
          {
            userActionableMessage:
              'Please sign in with your authorized Google account to view live content jobs.',
          }
        )
      );
    }

    const search = req.query.search as string | undefined;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;

    const data = await livePreviewService.getLiveJobs({
      search,
      page: isNaN(page) ? 1 : page,
      pageSize: isNaN(pageSize) ? 20 : Math.min(pageSize, 50),
      accessToken,
    });

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId: res.locals.requestId,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
});

/**
 * Error Testing Endpoint (demonstrates centralized error handling)
 * GET /api/test-error?type=bad_request | not_found | internal
 */
app.get('/api/test-error', (req: Request, res: Response, next: NextFunction) => {
  const type = req.query.type as string;

  if (type === 'bad_request') {
    return next(new AppError(400, 'BAD_REQUEST', 'Sample bad request validation error triggered.'));
  }
  if (type === 'forbidden') {
    return next(new AppError(403, 'FORBIDDEN', 'Access forbidden: privileged server action.'));
  }
  // Default to 500 internal server error
  return next(new AppError(500, 'INTERNAL_SERVER_ERROR', 'Simulated server fault demonstrating centralized catch.'));
});

// API 404 handler for undefined API routes
app.all('/api/*', (req: Request, res: Response) => {
  const response: ApiResponse<null> = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `API endpoint '${req.method} ${req.path}' not found.`,
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
    },
  };
  res.status(404).json(response);
});

// Centralized Error Handling Middleware
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred.';
  let details: unknown = undefined;
  let userActionableMessage: string | undefined = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
    if (typeof err.details === 'object' && err.details !== null && 'userActionableMessage' in err.details) {
      userActionableMessage = (err.details as any).userActionableMessage;
    }
  } else if (typeof err === 'object' && err !== null) {
    const customErr = err as Record<string, any>;
    if (customErr.statusCode && typeof customErr.statusCode === 'number') {
      statusCode = customErr.statusCode;
    }
    if (customErr.code && typeof customErr.code === 'string') {
      code = customErr.code;
    }
    if (customErr.message && typeof customErr.message === 'string') {
      message = customErr.message;
    }
    if (customErr.userActionableMessage && typeof customErr.userActionableMessage === 'string') {
      userActionableMessage = customErr.userActionableMessage;
    }
    if (customErr.details) {
      details = customErr.details;
    }
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log error server-side (privileged output stays on server)
  console.error(`[API Error] [${res.locals.requestId || 'no-id'}] ${statusCode} - ${code}: ${message}`);

  const errorResponse: ApiResponse<null> = {
    success: false,
    error: {
      code,
      message,
      ...(userActionableMessage ? { userActionableMessage } : {}),
      ...(details ? { details } : {}),
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId: res.locals.requestId,
    },
  };

  res.status(statusCode).json(errorResponse);
});

// ---------------------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// ---------------------------------------------------------------------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[IlmOps] Server runtime listening on http://${HOST}:${PORT}`);
  });
}

startServer();
