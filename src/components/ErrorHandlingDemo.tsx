/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { api, ClientApiError } from '../api/client.ts';
import { AlertCircle, CheckCircle2, RefreshCw, Send, Bug } from 'lucide-react';

export function ErrorHandlingDemo() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    statusCode?: number;
    code?: string;
    message: string;
    timestamp: string;
  } | null>(null);

  const handleTest = async (type: 'bad_request' | 'forbidden' | 'internal') => {
    setLoading(true);
    setResult(null);

    try {
      await api.testError(type);
      setResult({
        type: 'success',
        message: 'Endpoint completed without throwing an error.',
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: unknown) {
      if (err instanceof ClientApiError) {
        setResult({
          type: 'error',
          statusCode: err.statusCode,
          code: err.code,
          message: err.message,
          timestamp: new Date().toLocaleTimeString(),
        });
      } else if (err instanceof Error) {
        setResult({
          type: 'error',
          statusCode: 500,
          code: 'UNHANDLED_CLIENT_EXCEPTION',
          message: err.message,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const testUnknownRoute = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/non-existent-endpoint');
      const json = await res.json();
      setResult({
        type: 'error',
        statusCode: res.status,
        code: json.error?.code || 'NOT_FOUND',
        message: json.error?.message || 'Route not found',
        timestamp: new Date().toLocaleTimeString(),
      });
    } catch (err: unknown) {
      setResult({
        type: 'error',
        statusCode: 0,
        code: 'NETWORK_ERROR',
        message: (err as Error).message,
        timestamp: new Date().toLocaleTimeString(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="error-handling-demo" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex items-center space-x-3 border-b border-zinc-100 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-700">
          <Bug className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Centralized Error Handling Verification</h2>
          <p className="text-xs text-zinc-500">
            Interactive test panel validating server-side catches and standardized typed JSON errors
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          id="btn-test-bad-request"
          onClick={() => handleTest('bad_request')}
          disabled={loading}
          className="inline-flex items-center space-x-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 focus:outline-hidden disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5 text-zinc-500" />
          <span>Trigger 400 Bad Request</span>
        </button>

        <button
          id="btn-test-forbidden"
          onClick={() => handleTest('forbidden')}
          disabled={loading}
          className="inline-flex items-center space-x-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 focus:outline-hidden disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5 text-zinc-500" />
          <span>Trigger 403 Forbidden</span>
        </button>

        <button
          id="btn-test-500"
          onClick={() => handleTest('internal')}
          disabled={loading}
          className="inline-flex items-center space-x-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 focus:outline-hidden disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5 text-zinc-500" />
          <span>Trigger 500 Internal Error</span>
        </button>

        <button
          id="btn-test-404"
          onClick={testUnknownRoute}
          disabled={loading}
          className="inline-flex items-center space-x-2 rounded-lg border border-zinc-300 bg-white px-3.5 py-2 text-xs font-medium text-zinc-700 shadow-xs hover:bg-zinc-50 focus:outline-hidden disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5 text-zinc-500" />
          <span>Test Unmapped 404 Route</span>
        </button>
      </div>

      {loading && (
        <div className="mt-4 flex items-center space-x-2 text-xs text-zinc-500">
          <RefreshCw className="h-3.5 w-3.5 animate-spin text-purple-600" />
          <span>Dispatching test request to server middleware...</span>
        </div>
      )}

      {result && (
        <div
          id="error-test-result"
          className={`mt-4 rounded-lg border p-4 text-xs ${
            result.type === 'error'
              ? 'border-red-200 bg-red-50/70 text-red-900'
              : 'border-emerald-200 bg-emerald-50 text-emerald-900'
          }`}
        >
          <div className="flex items-center justify-between font-semibold">
            <div className="flex items-center space-x-2">
              {result.type === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              )}
              <span>
                Standardized Error Response (HTTP {result.statusCode}) - Code: {result.code}
              </span>
            </div>
            <span className="text-[11px] opacity-75">{result.timestamp}</span>
          </div>
          <p className="mt-2 font-mono text-[11px]">{result.message}</p>
        </div>
      )}
    </div>
  );
}
