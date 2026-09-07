/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HealthResponse } from '../../shared/types.ts';
import { Activity, Server, Cpu, Clock, HardDrive, ShieldCheck } from 'lucide-react';

interface HealthStatusCardProps {
  health: HealthResponse | null;
  loading: boolean;
  lastChecked: Date | null;
}

export function HealthStatusCard({ health, loading, lastChecked }: HealthStatusCardProps) {
  if (loading && !health) {
    return (
      <div id="health-card-loading" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span className="text-sm font-medium text-zinc-600">Querying server runtime health...</span>
        </div>
      </div>
    );
  }

  if (!health) {
    return (
      <div id="health-card-error" className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        <p className="text-sm font-medium">Unable to connect to Node.js server runtime endpoint.</p>
      </div>
    );
  }

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  return (
    <div id="health-status-card" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-100 pb-5">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-semibold text-zinc-900">Node.js Server Runtime Status</h2>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                {health.status.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-zinc-500">Endpoint: /api/health • HTTP 200 OK</p>
          </div>
        </div>

        {lastChecked && (
          <div className="text-right text-xs text-zinc-500">
            <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
          <div className="flex items-center space-x-2 text-zinc-600">
            <Server className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500">Runtime Engine</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-zinc-900">{health.serverRuntime}</div>
          <div className="mt-1 text-xs text-zinc-500">Node {health.nodeVersion}</div>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
          <div className="flex items-center space-x-2 text-zinc-600">
            <Clock className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500">Server Uptime</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-zinc-900">{formatUptime(health.uptimeSeconds)}</div>
          <div className="mt-1 text-xs text-zinc-500">Environment: {health.environment}</div>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
          <div className="flex items-center space-x-2 text-zinc-600">
            <Cpu className="h-4 w-4 text-zinc-500" />
            <span className="text-xs font-medium text-zinc-500">Heap Memory</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-zinc-900">
            {health.memory.heapUsedMB} MB / {health.memory.heapTotalMB} MB
          </div>
          <div className="mt-1 text-xs text-zinc-500">RSS: {health.memory.rssMB} MB</div>
        </div>

        <div className="rounded-lg border border-zinc-100 bg-zinc-50/70 p-4">
          <div className="flex items-center space-x-2 text-zinc-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-medium text-zinc-500">Security Boundary</span>
          </div>
          <div className="mt-2 text-sm font-semibold text-zinc-900">Secrets Isolated</div>
          <div className="mt-1 text-xs text-emerald-700 font-medium">Server-side logic only</div>
        </div>
      </div>
    </div>
  );
}
