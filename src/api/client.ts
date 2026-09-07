/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ApiResponse, HealthResponse } from '../../shared/types.ts';

export class ClientApiError extends Error {
  code: string;
  statusCode: number;
  details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'ClientApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  });

  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    const error = payload.error || {
      code: 'HTTP_ERROR',
      message: `Request failed with status ${response.status}`,
    };
    throw new ClientApiError(response.status, error.code, error.message, error.details);
  }

  return payload.data as T;
}

export const api = {
  getHealth: (): Promise<HealthResponse> => request<HealthResponse>('/api/health'),
  testError: (type: 'bad_request' | 'forbidden' | 'internal'): Promise<void> =>
    request<void>(`/api/test-error?type=${type}`),
};
