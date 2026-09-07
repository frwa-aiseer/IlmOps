/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle2, PauseCircle, GitBranch, ShieldCheck } from 'lucide-react';

export function BaselineChecklist() {
  const items = [
    {
      title: 'Client / Server Separation',
      desc: 'React 19 client decoupled from privileged Express server runtime.',
      status: 'complete',
    },
    {
      title: 'Typed API Contracts',
      desc: 'Standardized `ApiResponse<T>` with data, error, and request metadata.',
      status: 'complete',
    },
    {
      title: 'Centralized Error Handling',
      desc: 'Uniform catch-all middleware with typed error payloads and HTTP status codes.',
      status: 'complete',
    },
    {
      title: 'Server-Side Security Boundary',
      desc: 'Secrets and privileged logic quarantined strictly to the Node.js runtime.',
      status: 'complete',
    },
    {
      title: 'GitHub Synchronization Readiness',
      desc: 'Standard repository layout, comprehensive README.md, and sanitized .gitignore.',
      status: 'complete',
    },
    {
      title: 'Google Workspace Read-Only Adapter (P04/P05)',
      desc: 'Strictly read-only Sheets metadata and bounded range readers active. Zero write exposure.',
      status: 'complete',
    },
  ];

  return (
    <div id="baseline-checklist-card" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex items-center space-x-3 border-b border-zinc-100 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
          <GitBranch className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Baseline Architecture Checklist</h2>
          <p className="text-xs text-zinc-500">Core operational deliverables for IlmOps foundation</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 rounded-lg border p-3.5 ${
              item.status === 'complete'
                ? 'border-zinc-200/80 bg-zinc-50/50'
                : 'border-dashed border-amber-200 bg-amber-50/40'
            }`}
          >
            {item.status === 'complete' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            ) : (
              <PauseCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            )}
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-zinc-900">{item.title}</span>
                {item.status === 'complete' ? (
                  <span className="rounded bg-emerald-100 px-1.5 py-0.2 text-[10px] font-medium text-emerald-800">
                    Ready
                  </span>
                ) : (
                  <span className="rounded bg-amber-100 px-1.5 py-0.2 text-[10px] font-medium text-amber-800">
                    Stage 2
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-600">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
