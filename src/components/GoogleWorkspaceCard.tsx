/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ShieldCheck,
  Lock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  UserCheck,
  LogOut,
  Info,
} from 'lucide-react';
import type {
  WorkspaceDiagnosticsData,
  SheetDiagnosticResult,
} from '../../shared/contracts/workspaceDiagnostics.ts';
import { fetchWorkspaceDiagnostics } from '../services/workspaceDiagnosticsApi.ts';
import {
  signInWithGoogle,
  signOutGoogle,
  initAuth,
  getCachedAccessToken,
} from '../services/googleAuth.ts';

export function GoogleWorkspaceCard() {
  const [diagnostics, setDiagnostics] = useState<WorkspaceDiagnosticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedSheet, setExpandedSheet] = useState<string | null>(null);

  // Load diagnostics with current token
  const loadDiagnostics = async (token?: string | null) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const activeToken = token !== undefined ? token : getCachedAccessToken();
      const data = await fetchWorkspaceDiagnostics(activeToken);
      setDiagnostics(data);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || 'Failed to load workspace diagnostics.');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUserEmail(user.email);
        loadDiagnostics(token);
      },
      () => {
        setUserEmail(null);
        loadDiagnostics(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    setAuthLoading(true);
    setErrorMessage(null);
    try {
      const result = await signInWithGoogle();
      setUserEmail(result.user.email);
      await loadDiagnostics(result.accessToken);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || 'Sign-in failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    try {
      await signOutGoogle();
      setUserEmail(null);
      await loadDiagnostics(null);
    } catch (err: unknown) {
      const errObj = err as Error;
      setErrorMessage(errObj.message || 'Sign-out failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const getStateBadge = (state?: WorkspaceDiagnosticsData['state']) => {
    switch (state) {
      case 'SCHEMA_VALID':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Schema Valid</span>
          </span>
        );
      case 'WORKBOOK_FOUND':
      case 'CONNECTED':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Workbook Found</span>
          </span>
        );
      case 'SCHEMA_WARNING':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
            <span>Schema Warning</span>
          </span>
        );
      case 'WORKBOOK_PERMISSION_ERROR':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            <span>Workbook Permission Error</span>
          </span>
        );
      case 'CONNECTING':
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
            <span>Connecting</span>
          </span>
        );
      case 'AUTHORIZATION_REQUIRED':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200">
            <Lock className="h-3.5 w-3.5 text-slate-500" />
            <span>Authorization Required</span>
          </span>
        );
    }
  };

  const getValidationBadge = (status: SheetDiagnosticResult['headerValidation']) => {
    switch (status) {
      case 'PASS':
        return (
          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
            PASS
          </span>
        );
      case 'WARNING':
        return (
          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            WARNING
          </span>
        );
      case 'FAIL':
        return (
          <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-800">
            FAIL
          </span>
        );
      case 'NOT_CHECKED':
      default:
        return (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            NOT CHECKED
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 shadow-xs border border-emerald-100">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                Google Workspace Connection
              </h3>
              {getStateBadge(diagnostics?.state)}
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-600">
                P04 READ-ONLY • DIAGNOSTIC ONLY
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strictly read-only schema discovery & metadata verification for ALLIN Operations Hub.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {userEmail ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 rounded-lg bg-emerald-50/80 px-3 py-1.5 text-xs text-emerald-800 border border-emerald-200">
                <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-semibold">{userEmail}</span>
              </div>
              <button
                id="workspace-sign-out-btn"
                onClick={handleSignOut}
                disabled={authLoading}
                className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
                title="Sign out of Google Workspace"
              >
                <LogOut className="h-3.5 w-3.5 text-slate-500" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              id="workspace-sign-in-btn"
              onClick={handleSignIn}
              disabled={authLoading}
              className="inline-flex items-center space-x-2 rounded-lg bg-white border border-slate-300 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400 disabled:opacity-50 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{authLoading ? 'Signing In...' : 'Sign in with Google'}</span>
            </button>
          )}

          <button
            id="workspace-refresh-diagnostics-btn"
            onClick={() => loadDiagnostics()}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Connection Info Banner */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Target Workbook</div>
          <div className="mt-1 text-xs font-bold text-slate-900 truncate">
            {diagnostics?.workbookTitle || 'ALLIN Content Operations Hub'}
          </div>
          <div className="mt-0.5 flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
            <span>ID:</span>
            <span>{diagnostics?.redactedWorkbookId || '...WWvPgk'}</span>
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Access Mode & Scopes</div>
          <div className="mt-1 text-xs font-bold text-slate-900">
            Strictly Read-Only
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500 truncate">
            spreadsheets.readonly • drive.metadata
          </div>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Schema Summary</div>
          <div className="mt-1 flex items-center space-x-2 text-xs font-bold text-slate-900">
            <span>
              {diagnostics?.summary
                ? `${diagnostics.summary.passedSheetsCount} / ${diagnostics.summary.totalRequiredSheets} Sheets Pass`
                : '10 Sheets Configured'}
            </span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">
            {diagnostics?.lastCheckedAt ? `Checked ${new Date(diagnostics.lastCheckedAt).toLocaleTimeString()}` : 'Awaiting check'}
          </div>
        </div>
      </div>

      {/* Friendly Error or Notice */}
      {(errorMessage || diagnostics?.error) && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/90 p-4 text-xs shadow-xs">
          <div className="flex items-start space-x-2.5">
            <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                {diagnostics?.error?.message || errorMessage}
              </p>
              <p className="mt-0.5 text-amber-800">
                {diagnostics?.error?.userActionableMessage ||
                  'Sign in with an authorized Google account that has permission to view the ALLIN Content Operations Hub spreadsheet.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Per-Sheet Checks Table */}
      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Configured Sheets & Header Verification
          </h4>
          <span className="text-[11px] text-slate-500 font-medium">
            Row 3 (Queues) • Row 1 (Jobs & Configs)
          </span>
        </div>

        <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 overflow-hidden bg-white">
          {diagnostics?.sheets?.map((sheet) => {
            const isExpanded = expandedSheet === sheet.sheetName;
            return (
              <div key={sheet.sheetName} className="p-3 text-xs hover:bg-slate-50/50 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-slate-900">{sheet.sheetName}</span>
                    <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                      Row {sheet.expectedHeaderRow}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {sheet.found ? (
                        <span className="text-emerald-700 font-medium">Found in Workbook</span>
                      ) : (
                        <span className="text-slate-400">
                          {diagnostics.signedIn ? 'Not Found' : 'Configured'}
                        </span>
                      )}
                    </span>
                    {sheet.rowCount !== undefined && (
                      <span className="text-[10px] text-slate-400 font-mono" title="Allocated grid capacity is Google Sheets dimension, not populated data rows">
                        (Grid Capacity: {sheet.gridCapacity ?? sheet.rowCount} rows allocated × {sheet.columnCount || 0} cols)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    {getValidationBadge(sheet.headerValidation)}
                    <button
                      onClick={() => setExpandedSheet(isExpanded ? null : sheet.sheetName)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 space-y-1.5">
                    {sheet.description && (
                      <p className="text-slate-500 italic">{sheet.description}</p>
                    )}
                    {sheet.note && (
                      <p className="text-amber-800 bg-amber-50 p-1.5 rounded border border-amber-200 font-medium">
                        {sheet.note}
                      </p>
                    )}
                    {sheet.missingHeaders && sheet.missingHeaders.length > 0 && (
                      <div>
                        <span className="font-semibold text-red-700">Missing Headers: </span>
                        <span className="font-mono text-red-600">
                          {sheet.missingHeaders.join(', ')}
                        </span>
                      </div>
                    )}
                    {sheet.discoveredHeaders && sheet.discoveredHeaders.length > 0 && (
                      <div>
                        <span className="font-semibold text-slate-700">
                          Discovered Headers ({sheet.discoveredHeaders.length}):{' '}
                        </span>
                        <div className="mt-1 flex flex-wrap gap-1 max-h-32 overflow-y-auto p-1 bg-slate-50 rounded border border-slate-100">
                          {sheet.discoveredHeaders.map((h, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Read-Only Safety Guarantee Footnote */}
      <div className="mt-4 flex items-center space-x-2 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-100">
        <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Zero Write Exposure:</strong> The IlmOps Google Workspace adapter contains no methods to write, append, update, clear, or modify cells or files. Live operational source data is excluded from UI screens until explicitly authorized in subsequent phases.
        </span>
      </div>
    </div>
  );
}
