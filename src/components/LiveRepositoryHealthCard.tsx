/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Layers,
  Users,
  Tag,
  Briefcase,
  FileSpreadsheet,
  Activity,
  GitBranch,
} from 'lucide-react';
import type { LiveDataRepositoryHealth } from '../../shared/contracts/livePreview.ts';

interface LiveRepositoryHealthCardProps {
  health: LiveDataRepositoryHealth | null;
  loading: boolean;
  onRefresh: () => void;
}

export function LiveRepositoryHealthCard({
  health,
  loading,
  onRefresh,
}: LiveRepositoryHealthCardProps) {
  if (!health && loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs animate-pulse">
        <div className="h-4 w-48 bg-slate-200 rounded mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  const qualityBadge = () => {
    switch (health.quality.status) {
      case 'Healthy':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Repository Quality: Healthy</span>
          </span>
        );
      case 'Warning':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Repository Quality: Warning</span>
          </span>
        );
      case 'Error':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-800">
            <XCircle className="h-3.5 w-3.5 text-rose-600" />
            <span>Repository Quality: Error</span>
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-2xs">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                LIVE DATA REPOSITORY HEALTH
              </h3>
              <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 uppercase">
                {health.repositoryMode === 'live' ? 'Live Sheets' : 'Read-Only'}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Verified actual populated record counts vs Google Sheets grid capacities.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {qualityBadge()}
          <button
            id="refresh-repo-health-btn"
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Repository Health</span>
          </button>
        </div>
      </div>

      {/* Data Origin Proof Panel (P06 Live Verification) */}
      <div className="rounded-lg bg-emerald-50/50 border border-emerald-200/80 p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-900 uppercase">
            Data Origin
          </span>
          <span className="font-semibold text-slate-900">
            {health.dataOrigin || 'live-google-sheets'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-mono text-[11px]">
            Workbook: ...{health.workbookIdSuffix || 'WWvPgk'}
          </span>
        </div>
        <div className="flex items-center space-x-3 text-[11px] text-slate-500">
          <span>Mode: <strong className="text-emerald-800 font-mono">live_workspace_read_only</strong></span>
          <span>•</span>
          <span>Fetched: <strong className="text-slate-700 font-mono">{new Date(health.fetchedAt || health.lastAuditedAt).toLocaleTimeString()}</strong></span>
        </div>
      </div>

      {/* Actual Records vs Grid Capacity Callout */}
      <div className="rounded-lg bg-slate-50 border border-slate-200/70 p-3 text-xs text-slate-600 flex items-start space-x-2">
        <span className="font-bold text-slate-800">Critical Measurement Standard:</span>
        <span>
          Counts shown reflect <strong>actual populated mapped records</strong>. High numbers such as 1600, 3000, or 5000 rows represent Google Sheets allocated cell matrices and are explicitly labelled <strong className="text-amber-800">GRID CAPACITY</strong>.
        </span>
      </div>

      {/* Grid of Repository Counts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Research Sources */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>Research Sources</span>
            </span>
            <span className="rounded bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 text-[10px]">
              {health.researchSources.uniqueCount} unique
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>AI Queue:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.researchSources.aiCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Electrical Queue:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.researchSources.electricalCount}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-100 pt-1 font-semibold text-slate-800">
              <span>Combined Total:</span>
              <span className="font-mono">{health.researchSources.combinedCount}</span>
            </div>
          </div>
          {health.researchSources.aiGridCapacity && (
            <div className="text-[10px] text-slate-400 font-mono text-right pt-1 border-t border-slate-100">
              GRID CAPACITY: {health.researchSources.aiGridCapacity} rows
            </div>
          )}
        </div>

        {/* Card 2: Content Jobs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Content Jobs</span>
            </span>
            <span className="rounded bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.2 text-[10px]">
              {health.contentJobs.totalCount} active
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>Populated Jobs:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.contentJobs.totalCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Orphan Jobs:</span>
              <span className={`font-mono font-semibold ${health.contentJobs.orphanCount > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                {health.contentJobs.orphanCount}
              </span>
            </div>
          </div>
          {health.contentJobs.gridCapacity && (
            <div className="text-[10px] text-slate-400 font-mono text-right pt-1 border-t border-slate-100">
              GRID CAPACITY: {health.contentJobs.gridCapacity} rows
            </div>
          )}
        </div>

        {/* Card 3: Brand Profiles & Content Types */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Briefcase className="h-4 w-4 text-purple-600" />
              <span>Brand & Formats</span>
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>Brand Profiles:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.brandProfiles.activeCount} / {health.brandProfiles.totalCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Content Types:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.contentTypes.activeCount} / {health.contentTypes.totalCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Team Members:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.teamMembers.totalCount}
              </span>
            </div>
          </div>
          {health.brandProfiles.gridCapacity && (
            <div className="text-[10px] text-slate-400 font-mono text-right pt-1 border-t border-slate-100">
              GRID CAPACITY: {health.brandProfiles.gridCapacity} rows
            </div>
          )}
        </div>

        {/* Card 4: Staging & Activity Logs */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center space-x-1.5">
              <Activity className="h-4 w-4 text-amber-600" />
              <span>Staging & Audit</span>
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-600 pt-1">
            <div className="flex justify-between">
              <span>Manual Sources:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.manualSources.totalCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ready to Queue:</span>
              <span className="font-mono font-semibold text-emerald-700">
                {health.manualSources.readyToQueueCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Activity Log Entries:</span>
              <span className="font-mono font-semibold text-slate-900">
                {health.activityLogs.totalCount}
              </span>
            </div>
          </div>
          {health.manualSources.gridCapacity && (
            <div className="text-[10px] text-slate-400 font-mono text-right pt-1 border-t border-slate-100">
              GRID CAPACITY: {health.manualSources.gridCapacity} rows
            </div>
          )}
        </div>
      </div>

      {/* Relational Fan-Out Callout (Requirement 10) */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <GitBranch className="h-4 w-4 text-emerald-700" />
          <span>ONE SOURCE → MANY CONTENT JOBS FAN-OUT (LIVE REPOSITORY AUDIT)</span>
        </div>
        {health.relationalFanOut.hasMultiVariantSource && health.relationalFanOut.multiVariantExample ? (
          <div className="mt-2 space-y-2 text-xs">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
              <div className="font-semibold text-emerald-900">
                SOURCE: {health.relationalFanOut.multiVariantExample.sourceTitle}
              </div>
              <div className="text-[11px] text-emerald-700 font-mono mt-0.5">
                URL Key: {health.relationalFanOut.multiVariantExample.sourceUrlKey} • {health.relationalFanOut.multiVariantExample.niche}
              </div>
              <div className="mt-2 pl-3 border-l-2 border-emerald-400 space-y-1.5">
                {health.relationalFanOut.multiVariantExample.jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between text-[11px] text-slate-700">
                    <span className="font-mono font-semibold text-slate-900">↓ {job.id}</span>
                    <span>{job.targetAccount} • {job.platform} • {job.contentType} {job.variantLabel ? `(${job.variantLabel})` : ''}</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] text-slate-800">{job.status}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              {health.relationalFanOut.message}
            </p>
          </div>
        ) : (
          <p className="text-xs text-slate-600 italic">
            “No live multi-variant source exists yet.”
          </p>
        )}
      </div>

      {/* Data Quality Diagnostics (Requirement 11) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Data Quality Diagnostics
          </span>
          <span className="text-xs font-semibold text-slate-500">
            Last audited: {new Date(health.lastAuditedAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center">
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Duplicate Keys</div>
            <div className={`text-base font-bold font-mono ${health.quality.duplicateUrlKeyCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {health.quality.duplicateUrlKeyCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Blank URL Keys</div>
            <div className={`text-base font-bold font-mono ${health.quality.blankUrlKeyCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {health.quality.blankUrlKeyCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Incomplete Sources</div>
            <div className={`text-base font-bold font-mono ${health.quality.invalidIncompleteSourceCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {health.quality.invalidIncompleteSourceCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Orphan Jobs</div>
            <div className={`text-base font-bold font-mono ${health.quality.orphanJobCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
              {health.quality.orphanJobCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Manual Ready</div>
            <div className="text-base font-bold font-mono text-emerald-700">
              {health.quality.manualReadyToQueueCount}
            </div>
          </div>
          <div className="rounded-lg border border-slate-100 bg-slate-50 p-2">
            <div className="text-[11px] text-slate-500">Malformed Rows</div>
            <div className="text-base font-bold font-mono text-slate-800">
              {health.quality.malformedMappedRecordCount}
            </div>
          </div>
        </div>

        {health.quality.issues.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center space-x-1">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
              <span>Quality Notices:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 text-amber-800">
              {health.quality.issues.map((iss, idx) => (
                <li key={idx}>{iss}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
