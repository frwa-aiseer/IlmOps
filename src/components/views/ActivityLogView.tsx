/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, User, CheckCircle2, Layers, BookOpen, ShieldCheck } from 'lucide-react';
import { MOCK_ACTIVITY_LOG } from '../../data/mockData.ts';

export function ActivityLogView() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'research':
        return <BookOpen className="h-4 w-4 text-emerald-600" />;
      case 'production':
        return <Layers className="h-4 w-4 text-indigo-600" />;
      case 'qc':
        return <ShieldCheck className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Activity Log</h1>
          <p className="mt-1 text-xs text-slate-500">
            Audit trail of human review actions, content variant generation, QC sign-offs, and publishing events.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
          Chronological Event History
        </h2>

        <div className="mt-4 space-y-4">
          {MOCK_ACTIVITY_LOG.map((act) => (
            <div
              key={act.id}
              className="flex items-start space-x-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3.5 text-xs hover:bg-slate-50 transition-colors"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white shadow-2xs border border-slate-200">
                {getActivityIcon(act.type)}
              </div>

              <div className="flex-1">
                <div className="text-slate-800">
                  <strong className="text-slate-900 font-semibold">{act.user}</strong>{' '}
                  <span className="text-slate-600">{act.action}</span>{' '}
                  <span className="font-semibold text-slate-900">{act.target}</span>
                </div>
                <div className="mt-1 flex items-center space-x-2 text-[10px] text-slate-400">
                  <span>{act.timeAgo}</span>
                  <span>•</span>
                  <span className="font-mono">{act.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
