/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Layers, Shield, Terminal, ArrowRight, Lock, Database } from 'lucide-react';

export function ArchitectureCard() {
  return (
    <div id="architecture-card" className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs">
      <div className="flex items-center space-x-3 border-b border-zinc-100 pb-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
          <Layers className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Baseline Architecture & Security Boundary</h2>
          <p className="text-xs text-zinc-500">Strict client/server separation enforced for research-to-publishing content ops</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Client Layer */}
        <div className="relative rounded-lg border border-zinc-200/80 bg-zinc-50/50 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Client Tier</span>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[11px] font-medium text-blue-800">Browser SPA</span>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-900">React 19 + TypeScript + Vite</h3>
          <p className="mt-2 text-xs leading-relaxed text-zinc-600">
            Presents the ContentOps interface. Strictly unprivileged: no direct database credentials, API keys, or secret tokens are bundled or exposed.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-zinc-600">
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <span>Typed API Client wrapper (`/src/api/client.ts`)</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600"></span>
              <span>Typed schemas from `/shared/types.ts`</span>
            </li>
          </ul>
        </div>

        {/* Server Layer */}
        <div className="relative rounded-lg border-2 border-zinc-800 bg-zinc-900 p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">Server Tier</span>
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-medium text-emerald-400">Privileged Runtime</span>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-white">Google AI Studio Node.js Server</h3>
          <p className="mt-2 text-xs leading-relaxed text-zinc-300">
            Express application with central error handling, security headers, and request tracking. Holds environment secrets securely.
          </p>
          <ul className="mt-4 space-y-2 text-xs text-zinc-300">
            <li className="flex items-center space-x-2">
              <Lock className="h-3.5 w-3.5 text-emerald-400" />
              <span>Server-side secrets (GEMINI_API_KEY, credentials)</span>
            </li>
            <li className="flex items-center space-x-2">
              <Terminal className="h-3.5 w-3.5 text-blue-400" />
              <span>Standardized `/api/*` endpoints</span>
            </li>
            <li className="flex items-center space-x-2">
              <Shield className="h-3.5 w-3.5 text-amber-400" />
              <span>Centralized error catcher & request correlation</span>
            </li>
          </ul>
        </div>

        {/* External Integrations / Read-Only Data Tier (P05) */}
        <div className="relative rounded-lg border border-emerald-200 bg-emerald-50/40 p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">External Integrations</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">P05 Read-Only Active</span>
          </div>
          <h3 className="mt-3 text-sm font-semibold text-zinc-900">Google Workspace Data Adapter</h3>
          <p className="mt-2 text-xs leading-relaxed text-zinc-600">
            Strictly read-only Sheets & Drive metadata integration. Exact header matching, bounded ranges, zero write mutations.
          </p>
          <div className="mt-4 rounded-md border border-emerald-200 bg-white p-3 text-xs text-emerald-900">
            <strong>Security Guarantee:</strong> Only read-only scopes used. Zero write endpoints exist in the application codebase.
          </div>
        </div>
      </div>
    </div>
  );
}
