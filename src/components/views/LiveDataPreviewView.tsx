/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Search,
  Lock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Layers,
  HelpCircle,
  LogIn,
  ShieldCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import type {
  LiveDataRepositoryHealth,
  LiveResearchSourceCompact,
  LiveContentJobCompact,
} from '../../../shared/contracts/livePreview.ts';
import {
  fetchLiveRepositoryHealth,
  fetchLiveSources,
  fetchLiveJobs,
} from '../../services/livePreviewApi.ts';
import {
  getCachedAccessToken,
  signInWithGoogle,
  initAuth,
} from '../../services/googleAuth.ts';
import { LiveRepositoryHealthCard } from '../LiveRepositoryHealthCard.tsx';
import { SafeSourceDetailModal } from '../modals/SafeSourceDetailModal.tsx';

type PreviewTab = 'sources' | 'jobs' | 'health';
type NicheFilter = 'all' | 'ai_data' | 'electrical_energy';

export function LiveDataPreviewView() {
  const [activeTab, setActiveTab] = useState<PreviewTab>('sources');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Health State
  const [health, setHealth] = useState<LiveDataRepositoryHealth | null>(null);
  const [healthLoading, setHealthLoading] = useState<boolean>(false);

  // Sources State
  const [sources, setSources] = useState<LiveResearchSourceCompact[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState<boolean>(false);
  const [sourceSearch, setSourceSearch] = useState<string>('');
  const [sourceNiche, setSourceNiche] = useState<NicheFilter>('all');
  const [sourcePage, setSourcePage] = useState<number>(1);
  const [sourcePageSize, setSourcePageSize] = useState<number>(20);
  const [sourceTotalItems, setSourceTotalItems] = useState<number>(0);
  const [sourceTotalPages, setSourceTotalPages] = useState<number>(1);
  const [selectedSourceForDetail, setSelectedSourceForDetail] =
    useState<LiveResearchSourceCompact | null>(null);

  // Jobs State
  const [jobs, setJobs] = useState<LiveContentJobCompact[]>([]);
  const [jobsLoading, setJobsLoading] = useState<boolean>(false);
  const [jobSearch, setJobSearch] = useState<string>('');
  const [jobPage, setJobPage] = useState<number>(1);
  const [jobPageSize, setJobPageSize] = useState<number>(20);
  const [jobTotalItems, setJobTotalItems] = useState<number>(0);
  const [jobTotalPages, setJobTotalPages] = useState<number>(1);

  // Error & Live Status State
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorActionable, setErrorActionable] = useState<string | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);

  // Load Health Data
  const loadHealthData = useCallback(async (token: string) => {
    setHealthLoading(true);
    try {
      const data = await fetchLiveRepositoryHealth(token);
      setHealth(data);
      setIsLiveConnected(true);
      setErrorMsg(null);
      setErrorCode(null);
      setErrorStatus(null);
      setErrorActionable(null);
    } catch (err: any) {
      setHealth(null);
      setIsLiveConnected(false);
      setErrorStatus(err?.statusCode || 500);
      setErrorCode(err?.code || 'FETCH_ERROR');
      setErrorMsg(err?.message || 'Failed to load repository health.');
      setErrorActionable(err?.userActionableMessage || null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Load Sources Data
  const loadSourcesData = useCallback(
    async (token: string) => {
      setSourcesLoading(true);
      try {
        const res = await fetchLiveSources({
          niche: sourceNiche,
          search: sourceSearch,
          page: sourcePage,
          pageSize: sourcePageSize,
          token,
        });
        setSources(res.items);
        setSourceTotalItems(res.pagination.totalItems);
        setSourceTotalPages(res.pagination.totalPages);
      } catch (err: any) {
        setSources([]);
        setSourceTotalItems(0);
        setSourceTotalPages(1);
      } finally {
        setSourcesLoading(false);
      }
    },
    [sourceNiche, sourceSearch, sourcePage, sourcePageSize]
  );

  // Load Jobs Data
  const loadJobsData = useCallback(
    async (token: string) => {
      setJobsLoading(true);
      try {
        const res = await fetchLiveJobs({
          search: jobSearch,
          page: jobPage,
          pageSize: jobPageSize,
          token,
        });
        setJobs(res.items);
        setJobTotalItems(res.pagination.totalItems);
        setJobTotalPages(res.pagination.totalPages);
      } catch (err: any) {
        setJobs([]);
        setJobTotalItems(0);
        setJobTotalPages(1);
      } finally {
        setJobsLoading(false);
      }
    },
    [jobSearch, jobPage, jobPageSize]
  );

  // Initialize Auth Listener & Trigger Loads
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUserEmail(user.email);
        if (token) {
          loadHealthData(token);
          loadSourcesData(token);
          loadJobsData(token);
        } else {
          // Firebase signed in, but no Google Workspace token available in this tab session
          setHealth(null);
          setSources([]);
          setJobs([]);
          setIsLiveConnected(false);
          setErrorCode('AUTHORIZATION_REQUIRED');
          setErrorStatus(401);
          setErrorMsg('Google Workspace authorization required to read the live Operations Hub.');
          setErrorActionable(
            'Please click "Sign in with Google for Live Data" to authorize read-only access to the ALLIN Content Operations Hub.'
          );
        }
      },
      () => {
        setUserEmail(null);
        setHealth(null);
        setSources([]);
        setJobs([]);
        setIsLiveConnected(false);
        setErrorCode('AUTHORIZATION_REQUIRED');
        setErrorStatus(401);
        setErrorMsg('Sign-in required to inspect live Operations Hub data.');
        setErrorActionable(
          'Please sign in with your authorized Google account to view live data from the ALLIN Operations Hub.'
        );
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [loadHealthData, loadSourcesData, loadJobsData]);

  // Handle Sign In with Google
  const handleSignIn = async () => {
    setAuthLoading(true);
    setErrorMsg(null);
    setErrorCode(null);
    setErrorStatus(null);
    setErrorActionable(null);
    try {
      const { user, accessToken } = await signInWithGoogle();
      setUserEmail(user.email);
      await Promise.all([
        loadHealthData(accessToken),
        loadSourcesData(accessToken),
        loadJobsData(accessToken),
      ]);
    } catch (err: any) {
      setErrorStatus(err?.statusCode || 500);
      setErrorCode(err?.code || 'AUTH_FAILED');
      setErrorMsg(err?.message || 'Google authentication failed.');
      setErrorActionable(err?.userActionableMessage || null);
      setIsLiveConnected(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRefreshAll = () => {
    const token = getCachedAccessToken();
    if (token) {
      loadHealthData(token);
      loadSourcesData(token);
      loadJobsData(token);
    } else {
      setIsLiveConnected(false);
      setErrorCode('AUTHORIZATION_REQUIRED');
      setErrorStatus(401);
      setErrorMsg('Google Workspace authorization required.');
      setErrorActionable('Please sign in with Google to refresh live data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Truthful Status Badges */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              {isLiveConnected && health ? (
                <span className="inline-flex items-center space-x-1.5 rounded-md bg-emerald-600 px-3 py-1 text-xs font-bold text-white uppercase shadow-2xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>LIVE GOOGLE SHEETS / READ ONLY</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1.5 rounded-md bg-rose-100 border border-rose-200 px-3 py-1 text-xs font-bold text-rose-800 uppercase shadow-2xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  <span>LIVE DATA UNAVAILABLE</span>
                </span>
              )}

              {isLiveConnected && health && (
                <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                  <span>Hub: ...{health.workbookIdSuffix || 'WWvPgk'}</span>
                </span>
              )}
            </div>

            <h2 className="mt-1.5 text-lg font-bold text-slate-900 tracking-tight">
              Direct Live Workbook Reading & Data Quality Verification
            </h2>

            {/* Mandatory Explanatory Text */}
            <p className="mt-1 text-xs font-medium text-slate-600">
              “These records are being read directly from the live ALLIN Content Operations Hub. No changes can be made from this preview.”
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {!userEmail || !isLiveConnected ? (
              <button
                id="sign-in-google-preview-btn"
                onClick={handleSignIn}
                disabled={authLoading}
                className="inline-flex items-center space-x-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <LogIn className={`h-3.5 w-3.5 ${authLoading ? 'animate-spin' : ''}`} />
                <span>Sign in with Google for Live Data</span>
              </button>
            ) : (
              <div className="text-right text-xs">
                <div className="font-semibold text-slate-800">{userEmail}</div>
                <div className="text-[10px] text-emerald-700 font-medium flex items-center justify-end space-x-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-600" />
                  <span>Authenticated Read-Only</span>
                </div>
              </div>
            )}

            <button
              id="refresh-live-preview-all-btn"
              onClick={handleRefreshAll}
              disabled={sourcesLoading || jobsLoading || healthLoading}
              className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-slate-500 ${
                  sourcesLoading || jobsLoading || healthLoading ? 'animate-spin' : ''
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blocking State Banner When Live Data Unavailable (Zero Silent Fallback) */}
      {(!isLiveConnected || errorMsg) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-xs text-amber-950 shadow-xs space-y-3">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-sm text-amber-900 flex items-center space-x-2">
                <span>LIVE DATA UNAVAILABLE</span>
                {errorStatus && (
                  <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-mono font-bold text-amber-800">
                    HTTP {errorStatus} {errorCode ? `• ${errorCode}` : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                {errorMsg ||
                  'The Live Data Preview connects strictly and truthfully to the ALLIN Content Operations Hub spreadsheet (ID: 1X_xbjs3NUsE41foIIBwtu6oHv0q9L97TtZcOFWWvPgk). Silent fallback to mock demo fixtures is completely disabled.'}
              </p>
              {errorActionable && (
                <p className="text-xs font-semibold text-amber-900 pt-1">
                  {errorActionable}
                </p>
              )}
            </div>
          </div>
          <div className="pt-2 pl-8">
            <button
              onClick={handleSignIn}
              disabled={authLoading}
              className="inline-flex items-center space-x-2 rounded-lg bg-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-amber-800 disabled:opacity-50 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Connect Google Account for Live Data</span>
            </button>
          </div>
        </div>
      )}

      {/* Top Level Repository Health Summary (Rendered strictly when live connected) */}
      {isLiveConnected && (
        <LiveRepositoryHealthCard
          health={health}
          loading={healthLoading}
          onRefresh={() => {
            const token = getCachedAccessToken();
            if (token) loadHealthData(token);
          }}
        />
      )}

      {/* Main Diagnostic Tabs (Rendered strictly when live connected) */}
      {isLiveConnected && (
        <div className="space-y-4">
        {/* Tab Headers */}
        <div className="flex border-b border-slate-200">
          <button
            id="tab-live-sources"
            onClick={() => setActiveTab('sources')}
            className={`inline-flex items-center space-x-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
              activeTab === 'sources'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Research Sources (Live)</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {sourceTotalItems}
            </span>
          </button>

          <button
            id="tab-live-jobs"
            onClick={() => setActiveTab('jobs')}
            className={`inline-flex items-center space-x-2 border-b-2 px-5 py-3 text-xs font-bold transition-colors ${
              activeTab === 'jobs'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Content Jobs (Live)</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
              {jobTotalItems}
            </span>
          </button>
        </div>

        {/* TAB 1: RESEARCH SOURCES (LIVE) */}
        {activeTab === 'sources' && (
          <div className="space-y-4">
            {/* Controls: Niche Filters, Search, and Pagination Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              {/* Niche Filters (Requirement 4) */}
              <div className="flex items-center space-x-1.5 text-xs">
                <span className="text-slate-500 font-semibold mr-1 flex items-center">
                  <Filter className="h-3.5 w-3.5 mr-1 text-slate-400" />
                  Niche:
                </span>
                <button
                  id="filter-niche-all"
                  onClick={() => {
                    setSourceNiche('all');
                    setSourcePage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                    sourceNiche === 'all'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  id="filter-niche-ai"
                  onClick={() => {
                    setSourceNiche('ai_data');
                    setSourcePage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                    sourceNiche === 'ai_data'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  AI & Data Engineering
                </button>
                <button
                  id="filter-niche-ee"
                  onClick={() => {
                    setSourceNiche('electrical_energy');
                    setSourcePage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 font-semibold transition-colors ${
                    sourceNiche === 'electrical_energy'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Electrical Design, Estimation & Energy
                </button>
              </div>

              {/* Live Search Input (Requirement 5) */}
              <div className="relative min-w-[260px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="live-source-search-input"
                  type="text"
                  placeholder="Search title, domain, URL key, author..."
                  value={sourceSearch}
                  onChange={(e) => {
                    setSourceSearch(e.target.value);
                    setSourcePage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Bounded Server-Side Pagination (Requirement 6) */}
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span className="font-medium">
                  Page <strong className="text-slate-900">{sourcePage}</strong> of{' '}
                  <strong className="text-slate-900">{sourceTotalPages}</strong> ({sourceTotalItems} records)
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    id="prev-source-page-btn"
                    onClick={() => setSourcePage((p) => Math.max(1, p - 1))}
                    disabled={sourcePage <= 1 || sourcesLoading}
                    className="rounded border border-slate-200 bg-white p-1 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    id="next-source-page-btn"
                    onClick={() => setSourcePage((p) => Math.min(sourceTotalPages, p + 1))}
                    disabled={sourcePage >= sourceTotalPages || sourcesLoading}
                    className="rounded border border-slate-200 bg-white p-1 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Live Sources Table / Compact Records (Requirement 3) */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              {sourcesLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-emerald-600 mb-2" />
                  <span>Loading live records from ALLIN Content Operations Hub...</span>
                </div>
              ) : sources.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No live research sources found matching query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700">
                      <tr>
                        <th className="py-3 px-4">Source Title</th>
                        <th className="py-3 px-3">Niche</th>
                        <th className="py-3 px-3">Type</th>
                        <th className="py-3 px-3">Publisher / Domain</th>
                        <th className="py-3 px-3">Priority</th>
                        <th className="py-3 px-3 text-center">Scores (C/N/V)</th>
                        <th className="py-3 px-3">Review Decision</th>
                        <th className="py-3 px-3">URL Status & Open Source</th>
                        <th className="py-3 px-3">URL Key</th>
                        <th className="py-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {sources.map((source) => (
                        <tr key={source.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Title */}
                          <td className="py-3 px-4 max-w-xs">
                            <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                              {source.title}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Cap: {source.capturedDate || 'N/A'} • Pub: {source.publishedDate || 'N/A'}
                            </div>
                          </td>

                          {/* Niche */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                source.nicheId === 'electrical_energy'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-emerald-100 text-emerald-900'
                              }`}
                            >
                              {source.nicheId === 'electrical_energy' ? 'Electrical' : 'AI & Data'}
                            </span>
                          </td>

                          {/* Source Type */}
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                            {source.sourceType || 'General'}
                          </td>

                          {/* Publisher / Domain */}
                          <td className="py-3 px-3 max-w-[140px] truncate">
                            <div className="text-slate-800 font-medium truncate">
                              {source.publisherOrAuthor || 'Unknown'}
                            </div>
                            {source.sourceDomain && (
                              <div className="text-[10px] text-slate-400 font-mono truncate">
                                {source.sourceDomain}
                              </div>
                            )}
                          </td>

                          {/* Priority */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                              {source.priority || 'P2'}
                            </span>
                          </td>

                          {/* Scores */}
                          <td className="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                            <span className="text-emerald-700 font-semibold">{source.scores.credibility ?? '-'}</span>/
                            <span className="text-blue-700 font-semibold">{source.scores.novelty ?? '-'}</span>/
                            <span className="text-purple-700 font-semibold">{source.scores.contentValue ?? '-'}</span>
                          </td>

                          {/* Human Review Decision */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold capitalize ${
                                source.reviewDecision === 'approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : source.reviewDecision === 'rejected'
                                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                                  : source.reviewDecision === 'hold' || source.reviewDecision === 'held'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {source.reviewDecision}
                            </span>
                          </td>

                          {/* URL Status & Open Source Link (Requirement 7) */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {source.bestUrl ? (
                              <a
                                href={source.bestUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-1 text-emerald-700 hover:text-emerald-900 font-semibold underline decoration-emerald-300"
                              >
                                <ExternalLink className="h-3 w-3" />
                                <span>Open Source</span>
                              </a>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-[10px] text-amber-700 font-medium">
                                <HelpCircle className="h-3 w-3 text-amber-600" />
                                <span>URL needs verification</span>
                              </span>
                            )}
                          </td>

                          {/* URL Key Indicator */}
                          <td className="py-3 px-3 whitespace-nowrap">
                            {source.hasUrlKey ? (
                              <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[100px] block" title={source.urlKey}>
                                {source.urlKey}
                              </span>
                            ) : (
                              <span className="text-[10px] text-rose-600 font-semibold">
                                Missing
                              </span>
                            )}
                          </td>

                          {/* Actions: View Details (Requirement 8) */}
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <button
                              id={`view-source-detail-${source.id}`}
                              onClick={() => setSelectedSourceForDetail(source)}
                              className="inline-flex items-center space-x-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
                            >
                              <Eye className="h-3 w-3 text-slate-500" />
                              <span>View Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CONTENT JOBS (LIVE) (Requirement 9 & 10) */}
        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {/* Search & Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs">
              <div className="relative min-w-[260px] flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  id="live-job-search-input"
                  type="text"
                  placeholder="Search job ID, title, platform, producer..."
                  value={jobSearch}
                  onChange={(e) => {
                    setJobSearch(e.target.value);
                    setJobPage(1);
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <span className="font-medium">
                  Page <strong className="text-slate-900">{jobPage}</strong> of{' '}
                  <strong className="text-slate-900">{jobTotalPages}</strong> ({jobTotalItems} records)
                </span>
                <div className="flex items-center space-x-1">
                  <button
                    id="prev-job-page-btn"
                    onClick={() => setJobPage((p) => Math.max(1, p - 1))}
                    disabled={jobPage <= 1 || jobsLoading}
                    className="rounded border border-slate-200 bg-white p-1 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Previous Page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    id="next-job-page-btn"
                    onClick={() => setJobPage((p) => Math.min(jobTotalPages, p + 1))}
                    disabled={jobPage >= jobTotalPages || jobsLoading}
                    className="rounded border border-slate-200 bg-white p-1 hover:bg-slate-100 disabled:opacity-40"
                    aria-label="Next Page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Jobs Table (Safe Fields Only - Prompts strictly omitted) */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
              {jobsLoading ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  <RefreshCw className="h-5 w-5 animate-spin mx-auto text-emerald-600 mb-2" />
                  <span>Loading live content jobs from APP_Content_Jobs...</span>
                </div>
              ) : jobs.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No live content jobs found matching query.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="border-b border-slate-200 bg-slate-50/80 font-bold text-slate-700">
                      <tr>
                        <th className="py-3 px-4">Job ID</th>
                        <th className="py-3 px-3">Source Title</th>
                        <th className="py-3 px-3">Target Account</th>
                        <th className="py-3 px-3">Platform</th>
                        <th className="py-3 px-3">Content Type</th>
                        <th className="py-3 px-3">Variant Label</th>
                        <th className="py-3 px-3">Assigned Producer</th>
                        <th className="py-3 px-3">QC Reviewer</th>
                        <th className="py-3 px-3">Publishing Owner</th>
                        <th className="py-3 px-3">Job Status</th>
                        <th className="py-3 px-3">QC Status</th>
                        <th className="py-3 px-3">Published Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {jobs.map((job) => (
                        <tr key={job.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {job.id}
                          </td>
                          <td className="py-3 px-3 max-w-xs truncate text-slate-800" title={job.sourceTitle}>
                            {job.sourceTitle}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-900">
                            {job.targetAccount}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600">
                            {job.platform}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-200">
                              {job.contentType}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                            {job.variantLabel || '-'}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                            {job.assignedProducer || 'Unassigned'}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                            {job.qcReviewer || 'Unassigned'}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-700">
                            {job.publishingOwner || 'Unassigned'}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                              {job.productionStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
                                job.qcStatus === 'Approved'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                              }`}
                            >
                              {job.qcStatus}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-slate-500 font-mono text-[10px]">
                            {job.publishedDate || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Safe Source Detail Modal (Requirement 8) */}
      <SafeSourceDetailModal
        isOpen={!!selectedSourceForDetail}
        source={selectedSourceForDetail}
        onClose={() => setSelectedSourceForDetail(null)}
      />
    </div>
  );
}
