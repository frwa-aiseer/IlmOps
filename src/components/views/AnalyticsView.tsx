/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Share2,
  Bookmark,
  MousePointerClick,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MOCK_ANALYTICS_DEMO } from '../../data/mockData.ts';

export function AnalyticsView() {
  return (
    <div className="space-y-6">
      {/* Explicit DEMO Warning Banner (Strict compliance with Section 17) */}
      <div className="flex items-center space-x-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 shadow-xs">
        <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
        <div>
          <strong className="font-bold uppercase tracking-wider text-amber-900">
            {MOCK_ANALYTICS_DEMO.notice}
          </strong>
          <span className="ml-1 text-amber-800">
            Metrics below are mock data for visual demonstration only. External platform APIs (LinkedIn, X, Meta) and Google Sheets persistence are not connected.
          </span>
        </div>
      </div>

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
              SIMULATED DATA (DEMO)
            </span>
            <span className="text-xs text-slate-500">Demonstration Performance Dashboard</span>
          </div>
          <div className="mt-1 flex items-center space-x-2">
            <h1 className="text-lg font-bold text-slate-900">Content Performance & Review</h1>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">DEMO ONLY</span>
          </div>
          <p className="text-xs text-slate-500">
            Planned operational metrics schema for multi-account content variants across technical brands.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Reporting Scope:</span>
          <span className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700">
            Simulated 30-Day Window
          </span>
        </div>
      </div>

      {/* Metric Cards Grid (Impressions, Engagements, Shares, Saves, Clicks) */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Impressions</span>
            <Eye className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {MOCK_ANALYTICS_DEMO.totalImpressions}
          </div>
          <span className="mt-1 inline-block text-[10px] font-semibold text-slate-400">
            Simulated total
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Engagements</span>
            <TrendingUp className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {MOCK_ANALYTICS_DEMO.totalEngagements}
          </div>
          <span className="mt-1 inline-block text-[10px] font-semibold text-slate-400">
            Likes / Reactions
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Shares / Reposts</span>
            <Share2 className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {MOCK_ANALYTICS_DEMO.totalShares}
          </div>
          <span className="mt-1 inline-block text-[10px] font-semibold text-slate-400">
            Across accounts
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Saves / Bookmarks</span>
            <Bookmark className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {MOCK_ANALYTICS_DEMO.totalSaves}
          </div>
          <span className="mt-1 inline-block text-[10px] font-semibold text-slate-400">
            High-intent signal
          </span>
        </div>

        <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Clicks</span>
            <MousePointerClick className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="mt-2 text-xl font-black text-slate-900">
            {MOCK_ANALYTICS_DEMO.totalClicks}
          </div>
          <span className="mt-1 inline-block text-[10px] font-semibold text-slate-400">
            Resource visits
          </span>
        </div>
      </div>

      {/* Breakdown: Channel Share & Top Performing Content Pieces */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Channel Distribution */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Platform Distribution (Demo)
            </h2>
            <span className="text-[10px] text-slate-400">Estimated Share</span>
          </div>

          <div className="mt-4 space-y-3.5">
            {MOCK_ANALYTICS_DEMO.channelBreakdown.map((item) => (
              <div key={item.platform} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{item.platform}</span>
                  <span className="font-mono text-slate-600">{item.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.share}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Top Performing Mock Content Variants */}
        <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Demonstration Content Variants Matrix
            </h2>
            <span className="text-[10px] text-slate-400">Sample Top Performers</span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {MOCK_ANALYTICS_DEMO.topContentPieces.map((piece) => (
              <div key={piece.jobId} className="py-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {piece.jobId}
                    </span>
                    <span className="font-semibold text-slate-800">{piece.account}</span>
                    <span className="text-[10px] text-slate-400">({piece.format})</span>
                  </div>
                  <div className="mt-0.5 font-semibold text-slate-900">{piece.title}</div>
                </div>

                <div className="flex items-center space-x-3 text-[11px]">
                  <div className="text-right">
                    <span className="text-slate-400">Impressions: </span>
                    <strong className="text-slate-900">{piece.impressions}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Engagements: </span>
                    <strong className="text-slate-900">{piece.engagements}</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Saves: </span>
                    <strong className="text-emerald-700">{piece.saves}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
