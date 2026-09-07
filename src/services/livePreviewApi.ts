/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ApiResponse } from '../../shared/types.ts';
import type {
  LiveDataRepositoryHealth,
  LiveSourceListResponse,
  LiveJobListResponse,
} from '../../shared/contracts/livePreview.ts';
import { getCachedAccessToken } from './googleAuth.ts';

export class LivePreviewApiError extends Error {
  code: string;
  statusCode: number;
  userActionableMessage?: string;

  constructor(statusCode: number, code: string, message: string, userActionableMessage?: string) {
    super(message);
    this.name = 'LivePreviewApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.userActionableMessage = userActionableMessage;
  }
}

async function fetchWithAuth<T>(url: string, explicitToken?: string | null): Promise<T> {
  const token = explicitToken !== undefined ? explicitToken : getCachedAccessToken();
  
  if (!token) {
    throw new LivePreviewApiError(
      401,
      'AUTHORIZATION_REQUIRED',
      'Google Workspace authorization token required.',
      'Please sign in with your authorized Google account to inspect the live ALLIN Operations Hub.'
    );
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, { method: 'GET', headers });
  const payload: ApiResponse<T> = await response.json();

  if (!response.ok || !payload.success) {
    const code =
      payload.error?.code ||
      (response.status === 401 ? 'AUTHORIZATION_REQUIRED' : 'LIVE_WORKSPACE_UNAVAILABLE');
    const msg = payload.error?.message || `Request failed with HTTP status ${response.status}`;
    const actionable = (payload.error as any)?.userActionableMessage;
    throw new LivePreviewApiError(response.status, code, msg, actionable);
  }

  return payload.data as T;
}

export async function fetchLiveRepositoryHealth(
  token?: string | null
): Promise<LiveDataRepositoryHealth> {
  return fetchWithAuth<LiveDataRepositoryHealth>('/api/live-preview/health', token);
}

export async function fetchLiveSources(params: {
  niche?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  queue?: string;
  token?: string | null;
}): Promise<LiveSourceListResponse> {
  const q = new URLSearchParams();
  if (params.niche && params.niche !== 'all') q.set('niche', params.niche);
  if (params.search && params.search.trim()) q.set('search', params.search.trim());
  if (params.queue && params.queue !== 'all') q.set('queue', params.queue);
  if (params.page) q.set('page', params.page.toString());
  if (params.pageSize) q.set('pageSize', params.pageSize.toString());

  const url = `/api/live-preview/sources${q.toString() ? `?${q.toString()}` : ''}`;
  return fetchWithAuth<LiveSourceListResponse>(url, params.token);
}

export async function fetchLiveJobs(params: {
  search?: string;
  page?: number;
  pageSize?: number;
  token?: string | null;
}): Promise<LiveJobListResponse> {
  const q = new URLSearchParams();
  if (params.search && params.search.trim()) q.set('search', params.search.trim());
  if (params.page) q.set('page', params.page.toString());
  if (params.pageSize) q.set('pageSize', params.pageSize.toString());

  const url = `/api/live-preview/jobs${q.toString() ? `?${q.toString()}` : ''}`;
  return fetchWithAuth<LiveJobListResponse>(url, params.token);
}
