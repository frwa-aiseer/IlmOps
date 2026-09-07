/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ApiResponse } from '../../shared/types.ts';
import type { WorkspaceDiagnosticsData } from '../../shared/contracts/workspaceDiagnostics.ts';

/**
 * Fetches workspace diagnostics from the internal Node.js server.
 * React NEVER talks to Google APIs directly.
 */
export async function fetchWorkspaceDiagnostics(
  accessToken?: string | null
): Promise<WorkspaceDiagnosticsData> {
  const headers: HeadersInit = {
    Accept: 'application/json',
  };

  if (accessToken && accessToken.trim()) {
    headers['Authorization'] = `Bearer ${accessToken.trim()}`;
  }

  const response = await fetch('/api/integrations/workspace/diagnostics', {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    const errorJson = (await response.json().catch(() => ({}))) as ApiResponse<WorkspaceDiagnosticsData>;
    if (errorJson?.data) {
      return errorJson.data;
    }
    throw new Error(errorJson?.error?.message || `Server responded with HTTP ${response.status}`);
  }

  const result = (await response.json()) as ApiResponse<WorkspaceDiagnosticsData>;
  if (!result.success || !result.data) {
    throw new Error(result.error?.message || 'Failed to retrieve workspace diagnostics.');
  }

  return result.data;
}
