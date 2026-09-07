/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Send,
  Calendar,
  ExternalLink,
  CheckCircle2,
  Clock,
  Share2,
  Globe,
  Radio,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { ContentJob } from '../../types/ilmops.ts';

interface PublishingViewProps {
  contentJobs: ContentJob[];
}

export function PublishingView({ contentJobs }: PublishingViewProps) {
  const [jobs, setJobs] = useState<ContentJob[]>(contentJobs);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const channels = [
    {
      account: 'PYCODEAI-LINKEDIN',
      platform: 'LinkedIn',
      audience: 'Technical AI & Data Architects',
      cadence: 'Daily 9:00 AM',
    },
    {
      account: 'FARWA-LINKEDIN',
      platform: 'LinkedIn',
      audience: 'AI Practitioners & Data Engineers',
      cadence: '3x / week',
    },
    {
      account: 'MUNEEB-LINKEDIN',
      platform: 'LinkedIn',
      audience: 'Electrical Consultants, MEP & Energy Engineers',
      cadence: 'Tues & Thurs 6:00 PM',
    },
    {
      account: 'PYCODEAI-X',
      platform: 'X (Twitter)',
      audience: 'Global Dev Community & Tech Twitter',
      cadence: '2x daily threads',
    },
    {
      account: 'PYCODEAI-INSTAGRAM',
      platform: 'Instagram',
      audience: 'Visual Infographics & Code Snippets',
      cadence: '4x / week',
    },
  ];

  const handleSimulatePublish = (id: string) => {
    setJobs((prev) =>
      prev.map((job) =>
        job.id === id
          ? { ...job, publishingStatus: 'Published', productionStatus: 'Ready to Publish' }
          : job
      )
    );
    setToastMessage(`Job ${id} dispatched! Content variant staged and published to destination account.`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="flex items-center space-x-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 shadow-xs animate-fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Distribution Matrix
            </span>
            <span className="text-xs text-slate-500">Multi-Account Output Channels</span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">Publishing & Channel Dispatch</h1>
          <p className="text-xs text-slate-500">
            Publish approved, QC-verified content variants across targeted brand accounts (LinkedIn, X, Instagram, Facebook).
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <span>Publishing Owner:</span>
          <strong className="text-slate-800">Amara Akhtar</strong>
        </div>
      </div>

      {/* Channel Account Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {channels.map((ch) => (
          <div key={ch.account} className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                {ch.platform}
              </span>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-2 text-xs font-bold text-slate-900 line-clamp-1">{ch.account}</div>
            <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{ch.audience}</div>
            <div className="mt-2 border-t border-slate-100 pt-1.5 text-[10px] text-slate-400">
              Cadence: {ch.cadence}
            </div>
          </div>
        ))}
      </div>

      {/* Scheduled Publishing Queue */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-3">
          Staged & Scheduled Releases ({jobs.length})
        </h2>

        <div className="mt-4 divide-y divide-slate-100">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs hover:bg-slate-50/60 p-2 rounded-lg transition-colors"
            >
              <div className="min-w-[260px]">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                    {job.id}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-800">
                    {job.targetAccount}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {job.platform} • {job.contentType}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-slate-900 line-clamp-1">
                  {job.sourceTitle}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Source: <strong className="text-slate-700">{job.sourceId}</strong> • Producer: {job.producer}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    job.publishingStatus === 'Published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : job.publishingStatus === 'Scheduled'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {job.publishingStatus}
                </span>

                <span className="text-[11px] font-semibold text-slate-600">{job.dueDeadline}</span>

                {job.publishingStatus !== 'Published' && (
                  <button
                    onClick={() => handleSimulatePublish(job.id)}
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700"
                  >
                    <Send className="h-3 w-3" />
                    <span>Dispatch</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
