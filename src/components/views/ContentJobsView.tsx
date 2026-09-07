/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  Eye,
  Copy,
  Sparkles,
  ExternalLink,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ContentJob, ResearchSource } from '../../types/ilmops.ts';

interface ContentJobsViewProps {
  contentJobs: ContentJob[];
  sources: ResearchSource[];
  onOpenCreateVariant: (source?: ResearchSource) => void;
  onOpenSourceDetail: (source: ResearchSource) => void;
  onOpenPromptModal: (
    title: string,
    type: 'Google LLM Production' | 'ChatGPT Asset Finalization' | 'Social Copy',
    body: string,
    jobId: string,
    targetAccount: string
  ) => void;
}

export function ContentJobsView({
  contentJobs,
  sources,
  onOpenCreateVariant,
  onOpenSourceDetail,
  onOpenPromptModal,
}: ContentJobsViewProps) {
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredJobs = contentJobs.filter((job) => {
    if (accountFilter !== 'all' && job.targetAccount !== accountFilter) return false;
    if (platformFilter !== 'all' && job.platform !== platformFilter) return false;
    if (statusFilter !== 'all' && job.productionStatus !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchId = job.id.toLowerCase().includes(q);
      const matchTitle = job.sourceTitle.toLowerCase().includes(q);
      const matchAccount = job.targetAccount.toLowerCase().includes(q);
      const matchType = job.contentType.toLowerCase().includes(q);
      if (!matchId && !matchTitle && !matchAccount && !matchType) return false;
    }
    return true;
  });

  const getStatusBadge = (status: ContentJob['productionStatus']) => {
    switch (status) {
      case 'Assigned':
        return 'bg-slate-100 text-slate-700';
      case 'In Production':
        return 'bg-blue-100 text-blue-800';
      case 'Draft Ready':
        return 'bg-indigo-100 text-indigo-800';
      case 'Finalizing':
        return 'bg-purple-100 text-purple-800';
      case 'QC Review':
        return 'bg-amber-100 text-amber-800';
      case 'Ready to Publish':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Content Jobs</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {filteredJobs.length} Jobs
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Branded content variants derived from approved research sources. One source produces multiple format outputs across target accounts.
          </p>
        </div>

        <button
          onClick={() => onOpenCreateVariant()}
          className="inline-flex items-center space-x-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>+ Create Content Variant</span>
        </button>
      </div>

      {/* Architecture Demonstration Banner */}
      <div className="rounded-xl border border-indigo-200 bg-indigo-50/50 p-3.5 text-xs text-indigo-950">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
              ★
            </span>
            <span className="font-bold">Architecture Verification: One Research Source → Multiple Branded Outputs</span>
          </div>
          <span className="rounded bg-indigo-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-900">
            SRC-AI-01 Linked
          </span>
        </div>
        <p className="mt-1 text-slate-600 text-[11px]">
          Notice <strong className="text-indigo-900">CNT-0028-01</strong> (PycodeAI Infographic) and{' '}
          <strong className="text-indigo-900">CNT-0028-02</strong> (Farwa LinkedIn Carousel) both link to the exact same research source (<strong className="text-slate-800">SRC-AI-01</strong>).
        </p>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Account:</span>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Accounts</option>
              <option value="PYCODEAI-LINKEDIN">PYCODEAI-LINKEDIN</option>
              <option value="FARWA-LINKEDIN">FARWA-LINKEDIN</option>
              <option value="MUNEEB-LINKEDIN">MUNEEB-LINKEDIN</option>
              <option value="PYCODEAI-X">PYCODEAI-X</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Platforms</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="X">X (Twitter)</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Stage:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-indigo-500 focus:outline-hidden"
            >
              <option value="all">All Production Stages</option>
              <option value="Assigned">Assigned</option>
              <option value="In Production">In Production</option>
              <option value="Draft Ready">Draft Ready</option>
              <option value="Finalizing">Finalizing</option>
              <option value="QC Review">QC Review</option>
              <option value="Ready to Publish">Ready to Publish</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search job ID, account, source..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Content Jobs List */}
      <div className="space-y-3">
        {filteredJobs.map((job) => {
          const matchedSource = sources.find((s) => s.id === job.sourceId);

          return (
            <div
              key={job.id}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Top Row: Job ID, Account, Platform, Content Type, Status Badge */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    {job.id}
                  </span>
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
                    {job.targetAccount}
                  </span>
                  <span className="rounded bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                    {job.platform}
                  </span>
                  <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-100">
                    {job.contentType}
                  </span>
                  <span className="text-[10px] text-slate-400">Updated: {job.lastUpdated}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-semibold text-slate-400">QC: {job.qcStatus}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadge(
                      job.productionStatus
                    )}`}
                  >
                    {job.productionStatus}
                  </span>
                </div>
              </div>

              {/* Middle Row: Referenced Source Title & Roles */}
              <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-[280px]">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <span>Referenced Research Source:</span>
                    {matchedSource ? (
                      <button
                        onClick={() => onOpenSourceDetail(matchedSource)}
                        className="font-mono font-bold text-emerald-700 hover:underline inline-flex items-center space-x-1"
                      >
                        <span>{job.sourceId}</span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="font-mono font-bold text-slate-700">{job.sourceId}</span>
                    )}
                  </div>
                  <h3 className="mt-0.5 text-sm font-semibold text-slate-800 line-clamp-1">
                    {job.sourceTitle}
                  </h3>
                  {job.notes && (
                    <p className="mt-1 text-xs text-slate-500 italic line-clamp-1">
                      Directive: {job.notes}
                    </p>
                  )}
                </div>

                <div className="text-right text-xs text-slate-500">
                  <div>
                    Producer: <strong className="text-slate-800">{job.producer}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    QC Reviewer: {job.qcReviewer} • Owner: {job.publishingOwner}
                  </div>
                  <div className="mt-0.5 text-[11px] font-semibold text-amber-700">
                    Deadline: {job.dueDeadline}
                  </div>
                </div>
              </div>

              {/* Bottom Row: THREE-PROMPT MODEL PLACEHOLDERS (Compact view/copy) */}
              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Downstream Prompts:
                  </span>

                  {/* Prompt 1: Google LLM Production Prompt */}
                  <div className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-1 text-[11px]">
                    <span className="font-medium text-slate-700">Google LLM Production</span>
                    <button
                      onClick={() =>
                        onOpenPromptModal(
                          'Google LLM Production Prompt',
                          'Google LLM Production',
                          job.prompts.googleLLMProductionPrompt,
                          job.id,
                          job.targetAccount
                        )
                      }
                      className="ml-1 text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      [View]
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(job.prompts.googleLLMProductionPrompt);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                    >
                      [Copy]
                    </button>
                  </div>

                  {/* Prompt 2: ChatGPT Asset Finalization Prompt */}
                  <div className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-1 text-[11px]">
                    <span className="font-medium text-slate-700">ChatGPT Asset Finalization</span>
                    <button
                      onClick={() =>
                        onOpenPromptModal(
                          'ChatGPT Asset Finalization Prompt',
                          'ChatGPT Asset Finalization',
                          job.prompts.chatGPTAssetFinalizationPrompt,
                          job.id,
                          job.targetAccount
                        )
                      }
                      className="ml-1 text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      [View]
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(job.prompts.chatGPTAssetFinalizationPrompt);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                    >
                      [Copy]
                    </button>
                  </div>

                  {/* Prompt 3: Social Copy Prompt */}
                  <div className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-slate-50/70 px-2 py-1 text-[11px]">
                    <span className="font-medium text-slate-700">Social Copy Prompt</span>
                    <button
                      onClick={() =>
                        onOpenPromptModal(
                          'Social Copy Prompt',
                          'Social Copy',
                          job.prompts.socialCopyPrompt,
                          job.id,
                          job.targetAccount
                        )
                      }
                      className="ml-1 text-[10px] font-bold text-emerald-700 hover:underline"
                    >
                      [View]
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(job.prompts.socialCopyPrompt);
                      }}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800"
                    >
                      [Copy]
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400">
                  Target Length: {job.targetLength} words
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
