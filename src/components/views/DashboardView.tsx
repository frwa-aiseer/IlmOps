/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  Layers,
  Kanban,
  CheckSquare,
  Send,
  ArrowRight,
  Sparkles,
  Plus,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { NavigationTab } from '../../config/branding.ts';
import { AddSourceButton } from '../common/AddSourceButton.tsx';
import {
  ResearchSource,
  ContentJob,
  MyWorkTask,
} from '../../types/ilmops.ts';
import { MOCK_MY_WORK_TASKS, MOCK_ACTIVITY_LOG } from '../../data/mockData.ts';

interface DashboardViewProps {
  sources: ResearchSource[];
  contentJobs: ContentJob[];
  onNavigate: (tab: NavigationTab) => void;
  onAddSourceClick: () => void;
  onOpenCreateVariant: (source?: ResearchSource) => void;
}

export function DashboardView({
  sources,
  contentJobs,
  onNavigate,
  onAddSourceClick,
  onOpenCreateVariant,
}: DashboardViewProps) {
  const pendingSources = sources.filter((s) => s.reviewDecision === 'pending_review');
  const approvedSources = sources.filter((s) => s.reviewDecision === 'approved');
  const activeJobs = contentJobs.filter((j) => j.productionStatus !== 'Ready to Publish');
  const qcReviewJobs = contentJobs.filter(
    (j) => j.productionStatus === 'QC Review' || j.qcStatus === 'Pending Review'
  );
  const readyOrPublishedJobs = contentJobs.filter(
    (j) => j.productionStatus === 'Ready to Publish' || j.publishingStatus === 'Scheduled'
  );

  return (
    <div className="space-y-6">
      {/* COMPACTED HERO BANNER (Height reduced ~30% with high operational utility) */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-5 text-white shadow-xl">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
                Internal Content Operations
              </span>
              <span className="text-xs text-slate-400">• Multi-Niche Pipeline</span>
            </div>
            <h1 className="mt-1 text-lg font-bold tracking-tight sm:text-xl text-white">
              IlmOps Pipeline Matrix
            </h1>
            <p className="text-xs text-slate-300 line-clamp-1">
              AI & Data Engineering • Electrical Design, Estimation & Energy
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('research_inbox')}
              className="inline-flex items-center space-x-1.5 rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              <span>Review Sources ({pendingSources.length})</span>
            </button>
            <AddSourceButton
              id="btn-add-source-hero"
              onClick={onAddSourceClick}
              variant="hero"
            />
          </div>
        </div>

        {/* 5-STAGE PIPELINE METRIC BAR (Research -> Approved -> Production -> QC -> Published) */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-5 border-t border-slate-800 pt-3.5">
          <div
            onClick={() => onNavigate('research_inbox')}
            className="rounded-lg bg-slate-800/60 p-2.5 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700/60"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              1. Research
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-white">{sources.length}</span>
              <span className="text-[10px] text-amber-400 font-semibold">{pendingSources.length} Pending</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('research_inbox')}
            className="rounded-lg bg-slate-800/60 p-2.5 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700/60"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              2. Approved
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-emerald-400">{approvedSources.length}</span>
              <span className="text-[10px] text-emerald-300 font-medium">Ready for Jobs</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('content_jobs')}
            className="rounded-lg bg-slate-800/60 p-2.5 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700/60"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              3. Production
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-indigo-400">{activeJobs.length}</span>
              <span className="text-[10px] text-slate-400 font-medium">Variants</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('qc')}
            className="rounded-lg bg-slate-800/60 p-2.5 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700/60"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              4. QC Review
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-amber-400">{qcReviewJobs.length}</span>
              <span className="text-[10px] text-amber-300 font-medium">Audits Active</span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('publishing')}
            className="rounded-lg bg-slate-800/60 p-2.5 cursor-pointer hover:bg-slate-800 transition-colors border border-slate-700/60 col-span-2 sm:col-span-1"
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              5. Published
            </div>
            <div className="mt-0.5 flex items-baseline justify-between">
              <span className="text-lg font-bold text-purple-300">
                {readyOrPublishedJobs.length}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Staged & Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN OPERATIONAL SECTION */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT 2 COLS: MY WORK TODAY & ACTIVE CONTENT JOBS */}
        <div className="space-y-6 lg:col-span-2">
          {/* MY WORK TODAY (Explicitly required by Section 11) */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  My Work Today
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {MOCK_MY_WORK_TASKS.length} Operational Tasks
              </span>
            </div>

            <div className="mt-3 space-y-2">
              {MOCK_MY_WORK_TASKS.map((task) => (
                <div
                  key={task.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50/70 p-2.5 text-xs hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        task.status === 'Completed'
                          ? 'bg-emerald-500'
                          : task.status === 'In Progress'
                          ? 'bg-amber-500'
                          : 'bg-slate-300'
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{task.taskTitle}</div>
                      <div className="text-[11px] text-slate-500">
                        Assignee: <strong className="text-slate-700">{task.assignee}</strong> • Target: {task.targetItem}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="rounded bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {task.roleCategory}
                    </span>
                    <span className="text-[11px] font-semibold text-amber-700">{task.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ACTIVE CONTENT JOBS TABLE */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Active Content Jobs (Variants in Flight)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Demonstrating multiple variant outputs from approved sources
                </p>
              </div>

              <button
                onClick={() => onNavigate('content_jobs')}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:underline"
              >
                <span>View All Jobs</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {contentJobs.slice(0, 4).map((job) => (
                <div
                  key={job.id}
                  className="py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-[200px]">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-[11px] font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {job.id}
                      </span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {job.targetAccount}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {job.platform}
                      </span>
                    </div>
                    <div className="mt-1 font-semibold text-slate-800 line-clamp-1">
                      {job.sourceTitle}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {job.productionStatus}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {job.producer}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COL: RECENT OPERATIONAL ACTIVITY & NICHE BREAKDOWN */}
        <div className="space-y-6">
          {/* Niche Breakdown Card */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
              Active Industry Niches
            </h2>
            <div className="mt-3 space-y-3">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>AI & Data Engineering</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] text-indigo-800">
                    {sources.filter((s) => s.nicheId === 'ai_data').length} Sources
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  RAG, Agentic AI, KV cache optimization, MLOps, vector systems.
                </p>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                  <span>Electrical Design, Estimation & Energy</span>
                  <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800">
                    {sources.filter((s) => s.nicheId === 'electrical_energy').length} Sources
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  IEC cable derating, substation BOQ estimation, BESS arc flash hazards.
                </p>
              </div>
            </div>
          </div>

          {/* Operational Activity Log */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2.5">
              Recent Ops Activity
            </h2>

            <div className="mt-3 space-y-3">
              {MOCK_ACTIVITY_LOG.map((act) => (
                <div key={act.id} className="text-xs space-y-0.5">
                  <div className="text-slate-700">
                    <strong className="text-slate-900 font-semibold">{act.user}</strong>{' '}
                    {act.action} <span className="font-semibold text-slate-800">{act.target}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">{act.timeAgo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
