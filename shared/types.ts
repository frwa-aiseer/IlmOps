/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  timestamp: string;
  requestId?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface SystemMemoryInfo {
  heapUsedMB: number;
  heapTotalMB: number;
  rssMB: number;
}

export interface HealthResponse {
  status: 'healthy' | 'degraded' | 'error';
  appName: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  serverRuntime: string;
  nodeVersion: string;
  memory: SystemMemoryInfo;
  services: {
    server: string;
    api: string;
    storage: string;
    sheets: string;
    drive: string;
    dataAccessLayer?: string;
  };
  security: {
    secretsIsolatedServerSide: boolean;
    corsRestricted: boolean;
  };
}
