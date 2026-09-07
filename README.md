# IlmOps (Research-to-Publish Operations)

An internal research-to-publishing content operations platform for ALLIN.

**Brand Meaning**: "Ilm" means knowledge; "Ops" means operations. IlmOps orchestrates the flow from discovery to production, technical QC, multi-channel publishing, and KPI review.

This repository contains the clean baseline architecture with modern SaaS product UI/UX, featuring strict client/server separation, centralized branding configuration, typed API response envelopes, centralized server-side error handling, and the Google AI Studio Node.js server runtime.

---

## Architecture Overview

```
                          ┌──────────────────────────┐
                          │   Browser Client (SPA)   │
                          │   React 19 + TypeScript  │
                          │   Tailwind CSS + Vite    │
                          └─────────────┬────────────┘
                                        │ Typed JSON (ApiResponse<T>)
                                        │ HTTP /api/*
                                        ▼
                          ┌──────────────────────────┐
                          │   Node.js Server Runtime │
                          │   Express + Vite MW      │
                          │   (Privileged Boundary)  │
                          └─────────────┬────────────┘
                                        │ (Future Stage 2: Paused)
                                        ▼
                          ┌──────────────────────────┐
                          │   Google Workspace       │
                          │   Sheets / Drive (Stage 2)│
                          └──────────────────────────┘
```

### 1. Client Tier (`/src`)
- **Framework**: React 19, TypeScript, Tailwind CSS, Vite.
- **Role**: Renders the ContentOps user interface and operational dashboard.
- **Security Constraint**: Runs in untrusted client space. Contains **no secrets**, no direct database access credentials, and no external API keys.
- **API Client**: Consumes typed endpoints via `/src/api/client.ts`.

### 2. Server Tier (`/server.ts`)
- **Framework**: Express 4.x running on Node.js in the Google AI Studio container.
- **Role**: Serves the single-page application and handles `/api/*` endpoints.
- **Privileged Boundary**: Environment secrets (`GEMINI_API_KEY`, future OAuth tokens) remain strictly server-side.
- **Centralized Error Handling**: Uniform catch-all middleware transforming exceptions into structured `ApiResponse<null>` payloads.

### 3. Shared Contracts (`/shared/types.ts`)
- Defines shared TypeScript interfaces for requests, responses, and errors, ensuring end-to-end type safety between client and server without code duplication.

---

## API Specification

All `/api/*` endpoints adhere to a standardized JSON response envelope:

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}
```

### Endpoints

#### `GET /api/health`
Returns runtime status, server uptime, memory usage, and service configuration.

**Success Response (HTTP 200)**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "appName": "ALLIN ContentOps",
    "version": "0.1.0",
    "environment": "development",
    "uptimeSeconds": 42,
    "serverRuntime": "Google AI Studio Node.js Server Runtime (Express)",
    "nodeVersion": "v22.x",
    "memory": {
      "heapUsedMB": 38.45,
      "heapTotalMB": 52.12,
      "rssMB": 104.32
    },
    "services": {
      "server": "running",
      "api": "online",
      "storage": "unconnected",
      "sheets": "disconnected (stage 2)",
      "drive": "disconnected (stage 2)"
    },
    "security": {
      "secretsIsolatedServerSide": true,
      "corsRestricted": true
    }
  },
  "meta": {
    "timestamp": "2026-09-06T18:30:00.000Z",
    "requestId": "k9x2m4p1"
  }
}
```

#### `GET /api/test-error?type=bad_request|forbidden|internal`
Demonstration endpoint to verify centralized error handling middleware.

**Error Response (HTTP 400 / 403 / 500)**:
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Sample bad request validation error triggered."
  },
  "meta": {
    "timestamp": "2026-09-06T18:30:00.000Z",
    "requestId": "a7b3c9d1"
  }
}
```

---

## Centralized Error Handling

Errors thrown anywhere in route handlers or middleware are caught by the uniform Express error handler:

1. Custom `AppError(statusCode, code, message, details)` allows specific HTTP status code assignment.
2. Uncaught exceptions default to HTTP `500 INTERNAL_ERROR`.
3. Stack traces and privileged diagnostic logs are output to server stdout/stderr only and omitted from public client payloads.
4. Each error response is tagged with an `X-Request-Id` for correlation.

---

## Security Model

1. **Privileged Logic Stays Server-Side**: All future API integrations (Google Sheets, Drive, Gemini) operate exclusively through server-side routes.
2. **Zero Client Secret Exposure**: Secrets are loaded via `process.env` in `server.ts` and never injected into client bundles or prefixed with `VITE_`.
3. **External Data Access Paused**: As specified for this baseline, no connection to Google Sheets is established, and no external data is created or modified.

---

## Repository Structure

```
├── .env.example              # Template for environment configuration
├── .gitignore                # Standard Git ignore rules
├── index.html                # HTML entry point with synchronized metadata
├── metadata.json             # AI Studio app metadata & capabilities
├── package.json              # Scripts & dependencies
├── README.md                 # Project architecture documentation
├── server.ts                 # Express server runtime & API endpoints
├── shared/
│   └── types.ts              # Shared client/server data contracts
├── src/
│   ├── api/
│   │   └── client.ts         # Typed client API service
│   ├── components/
│   │   ├── ArchitectureCard.tsx
│   │   ├── BaselineChecklist.tsx
│   │   ├── ErrorHandlingDemo.tsx
│   │   └── HealthStatusCard.tsx
│   ├── App.tsx               # Main dashboard UI
│   ├── index.css             # Tailwind CSS imports
│   └── main.tsx              # React DOM mounting
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Vite & Tailwind build configuration
```

---

## Development & Build

### Running Locally

```bash
# Start development server (Node.js runtime + Vite middleware)
npm run dev

# Run TypeScript type check
npm run lint

# Production build (Vite client + esbuild bundled server)
npm run build

# Start production server
npm start
```

---

## GitHub Synchronization

To synchronize this baseline to GitHub:

1. Initialize git (if not already initialized):
   ```bash
   git init
   git add .
   git commit -m "feat: baseline ALLIN ContentOps with client/server separation and typed health endpoint"
   ```
2. Link your remote repository:
   ```bash
   git remote add origin https://github.com/<your-org>/allin-contentops.git
   git branch -M main
   git push -u origin main
   ```
3. All sensitive files (`.env`, `node_modules`, `dist`) are already specified in `.gitignore`.

---

## Next Steps (Stage 2 Roadmap)

- [ ] Google Workspace integration (Google Sheets content repository).
- [ ] Google Drive assets integration.
- [ ] Research pipeline and content operations workflow.
- [ ] Server-side Gemini AI assistance for content summarization & validation.
