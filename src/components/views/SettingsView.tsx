/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BRANDING } from '../../config/branding.ts';
import { Sliders, Shield, Palette, Sparkles, Database, Lock, Check } from 'lucide-react';
import { IlmOpsLogo } from '../brand/IlmOpsLogo.tsx';

export function SettingsView() {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">
              System Preferences
            </span>
            <span className="text-xs text-slate-500">v{BRANDING.version}</span>
          </div>
          <h2 className="mt-1.5 text-lg font-bold text-slate-900">Platform & Brand Settings</h2>
          <p className="text-xs text-slate-500">
            Centralized branding tokens, editorial guidelines, AI engine routing, and external integration gates.
          </p>
        </div>
      </div>

      {/* Brand & Identity Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Palette className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Centralized Brand Identity</h3>
            <p className="text-xs text-slate-500">Managed through `/src/config/branding.ts` for uniform cross-app styling</p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Brand Preview
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <IlmOpsLogo size="lg" theme="light" />
              <p className="mt-3 text-xs text-slate-600 leading-relaxed">
                <strong>Meaning:</strong> {BRANDING.meaning}
              </p>
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Color Token Palette
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center space-x-2.5 rounded-lg border border-slate-200 bg-white p-2">
                <div className="h-6 w-6 rounded-md bg-slate-950 ring-1 ring-slate-800" />
                <div>
                  <div className="font-semibold text-slate-900">Deep Navy</div>
                  <div className="font-mono text-[10px] text-slate-400">#0f172a</div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 rounded-lg border border-slate-200 bg-white p-2">
                <div className="h-6 w-6 rounded-md bg-emerald-600 ring-1 ring-emerald-500" />
                <div>
                  <div className="font-semibold text-slate-900">Emerald Accent</div>
                  <div className="font-mono text-[10px] text-slate-400">#059669</div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 rounded-lg border border-slate-200 bg-white p-2">
                <div className="h-6 w-6 rounded-md bg-amber-500 ring-1 ring-amber-400" />
                <div>
                  <div className="font-semibold text-slate-900">Muted Gold</div>
                  <div className="font-mono text-[10px] text-slate-400">#d97706</div>
                </div>
              </div>

              <div className="flex items-center space-x-2.5 rounded-lg border border-slate-200 bg-white p-2">
                <div className="h-6 w-6 rounded-md bg-slate-100 ring-1 ring-slate-300" />
                <div>
                  <div className="font-semibold text-slate-900">Ivory Canvas</div>
                  <div className="font-mono text-[10px] text-slate-400">#f8fafc</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* External Data Gates & Roadmap Card */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">External Integrations Gate (P05 Active)</h3>
            <p className="text-xs text-slate-500">Status of connected third-party data layers and external storage</p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-3.5">
            <div>
              <div className="font-semibold text-emerald-950">Google Sheets Content Operations Hub</div>
              <div className="text-[11px] text-emerald-800">
                Live workbook schema mapped, bounded readers active, strictly read-only with zero write access.
              </div>
            </div>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Read-Only Active ✓
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-blue-200/80 bg-blue-50/40 p-3.5">
            <div>
              <div className="font-semibold text-blue-950">Google Drive Integration</div>
              <div className="text-[11px] text-blue-800">
                Drive file metadata discovery enabled; file upload and folder mutations disabled.
              </div>
            </div>
            <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
              Metadata Read-Only ✓
            </span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-emerald-200/80 bg-emerald-50/40 p-3.5">
            <div>
              <div className="font-semibold text-emerald-950">Google AI Studio Node.js Runtime</div>
              <div className="text-[11px] text-emerald-800">
                Privileged server-side execution, centralized error handler, and typed API response layer.
              </div>
            </div>
            <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Active & Verified ✓
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
