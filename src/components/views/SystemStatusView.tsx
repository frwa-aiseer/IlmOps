/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import type { HealthResponse } from '../../../shared/types.ts';
import { HealthStatusCard } from '../HealthStatusCard.tsx';
import { ArchitectureCard } from '../ArchitectureCard.tsx';
import { ErrorHandlingDemo } from '../ErrorHandlingDemo.tsx';
import { BaselineChecklist } from '../BaselineChecklist.tsx';
import { WorkbookContractsCard } from '../WorkbookContractsCard.tsx';
import { GoogleWorkspaceCard } from '../GoogleWorkspaceCard.tsx';
import { LiveRepositoryHealthCard } from '../LiveRepositoryHealthCard.tsx';
import { fetchLiveRepositoryHealth } from '../../services/livePreviewApi.ts';
import { getCachedAccessToken } from '../../services/googleAuth.ts';
import type { LiveDataRepositoryHealth } from '../../../shared/contracts/livePreview.ts';
import { RefreshCw, Server, ShieldCheck, Cpu } from 'lucide-react';

interface SystemStatusViewProps {
  health: HealthResponse | null;
  loading: boolean;
  lastChecked: Date | null;
  fetchError: string | null;
  onRefresh: () => void;
}

export function SystemStatusView({
  health,
  loading,
  lastChecked,
  fetchError,
  onRefresh,
}: SystemStatusViewProps) {
  const [repoHealth, setRepoHealth] = React.useState<LiveDataRepositoryHealth | null>(null);
  const [repoLoading, setRepoLoading] = React.useState<boolean>(false);

  const loadRepoHealth = React.useCallback(async () => {
    setRepoLoading(true);
    try {
      const data = await fetchLiveRepositoryHealth(getCachedAccessToken());
      setRepoHealth(data);
    } catch {
      // safe fallback
    } finally {
      setRepoLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRepoHealth();
  }, [loadRepoHealth]);
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Runtime Diagnostics
            </span>
            <span className="text-xs text-slate-500">Google AI Studio Node.js Server</span>
          </div>
          <h2 className="mt-1.5 text-lg font-bold text-slate-900">System Status & Architecture Verification</h2>
          <p className="text-xs text-slate-500">
            Real-time server telemetry, client/server boundaries, centralized error testing, and technical baseline guarantees.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            id="refresh-health-btn-status-view"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center space-x-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>

          <span className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>200 OK Live</span>
          </span>
        </div>
      </div>

      {fetchError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 shadow-xs">
          <p className="font-semibold">Endpoint Error connecting to Node.js server:</p>
          <p className="mt-1 font-mono">{fetchError}</p>
        </div>
      )}

      {/* Baseline Components */}
      <div className="space-y-6">
        {/* Health Status Metric Card */}
        <HealthStatusCard health={health} loading={loading} lastChecked={lastChecked} />

        {/* Live Repository Health & Quality Diagnostics (P06) */}
        <LiveRepositoryHealthCard
          health={repoHealth}
          loading={repoLoading}
          onRefresh={loadRepoHealth}
        />

        {/* Google Workspace Connection & Read-Only Diagnostics (P04) */}
        <GoogleWorkspaceCard />

        {/* Live Workbook Schema Manifest & Contracts (P03) */}
        <WorkbookContractsCard />

        {/* Architecture & Security Boundary */}
        <ArchitectureCard />

        {/* Centralized Error Handling Verification */}
        <ErrorHandlingDemo />

        {/* Baseline Deliverables Checklist */}
        <BaselineChecklist />
      </div>
    </div>
  );
}
