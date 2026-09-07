/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Table, CheckCircle2, ShieldCheck, FileSpreadsheet, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import {
  SOURCE_QUEUE_REQUIRED_HEADERS,
  APP_CONTENT_JOBS_REQUIRED_HEADERS,
  APP_USERS_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';

export function WorkbookContractsCard() {
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);

  const sheetsInfo = [
    {
      name: 'AI_Content_Queue',
      headerRow: 3,
      entity: 'ResearchSource',
      mode: 'CONFIG_ONLY',
      count: SOURCE_QUEUE_REQUIRED_HEADERS.length,
      headers: SOURCE_QUEUE_REQUIRED_HEADERS,
      note: 'Legacy operational queue: human review & scoring',
    },
    {
      name: 'Electrical_Content_Queue',
      headerRow: 3,
      entity: 'ResearchSource',
      mode: 'CONFIG_ONLY',
      count: SOURCE_QUEUE_REQUIRED_HEADERS.length,
      headers: SOURCE_QUEUE_REQUIRED_HEADERS,
      note: 'Electrical Design, Estimation & Energy research queue',
    },
    {
      name: 'APP_Content_Jobs',
      headerRow: 1,
      entity: 'ContentJob',
      mode: 'CONFIG_ONLY',
      count: APP_CONTENT_JOBS_REQUIRED_HEADERS.length,
      headers: APP_CONTENT_JOBS_REQUIRED_HEADERS,
      note: 'Normalized multi-variant production jobs. References source via Source URL Key.',
    },
    {
      name: 'APP_Users',
      headerRow: 1,
      entity: 'AppUser',
      mode: 'CONFIG_ONLY',
      count: APP_USERS_REQUIRED_HEADERS.length,
      headers: APP_USERS_REQUIRED_HEADERS,
      note: 'Team permissions matrix (zero invented Google account emails)',
    },
  ];

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-bold text-slate-900">
                Live Workbook Schema Manifest & Contracts
              </h3>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                P05 DATA ACCESS READY
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-800">
                STRICTLY READ-ONLY
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Target: ALLIN Content Operations Hub — Research, Production & KPI (Spreadsheet ID: 1X_xbjs3NUsE41foIIBwtu6oHv0q9L97TtZcOFWWvPgk)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
          <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded">en_GB</span>
          <span className="font-mono text-[11px] bg-slate-100 px-2 py-1 rounded">Asia/Karachi</span>
        </div>
      </div>

      {/* Architectural Safety Badges */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Exact Header-Name Resolution</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Column letters (A, B, C) are strictly forbidden. Readers map runtime column indexes via exact header names.
          </p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>1 Source → Many Jobs Relational Key</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            <code className="text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">ResearchSource.urlKey</code> matches <code className="text-[10px] bg-white px-1 py-0.5 rounded border border-slate-200">ContentJob.sourceUrlKey</code>.
          </p>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="flex items-center space-x-2 text-slate-900 font-semibold text-xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Zero Write Exposure</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Read-only integration active when signed in. No write, append, or delete methods exist in the entire codebase.
          </p>
        </div>
      </div>

      {/* Sheet Schema Definitions */}
      <div className="mt-5 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Configured Sheets & Header Row Contracts
        </h4>

        <div className="space-y-2">
          {sheetsInfo.map((s) => {
            const isExpanded = expandedSheet === s.name;
            return (
              <div
                key={s.name}
                className="rounded-lg border border-slate-200 bg-white p-3 text-xs transition-colors hover:border-slate-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Table className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900">{s.name}</span>
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                          Row {s.headerRow} Header
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600">
                          {s.entity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{s.note}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-medium text-slate-600">
                      {s.count} Required Headers
                    </span>
                    <button
                      onClick={() => setExpandedSheet(isExpanded ? null : s.name)}
                      className="inline-flex items-center space-x-1 rounded p-1 text-slate-500 hover:bg-slate-100"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-semibold text-slate-700 mb-1.5">
                      Required Headers Contract ({s.count} fields):
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-1 bg-slate-50 rounded-md border border-slate-100">
                      {s.headers.map((h, i) => (
                        <span
                          key={i}
                          className="font-mono text-[10px] bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
