/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Kanban,
  Clock,
  Send,
  Plus,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { ContentJob, ProductionStatus, ResearchSource } from '../../types/ilmops.ts';

interface ProductionViewProps {
  contentJobs: ContentJob[];
  sources: ResearchSource[];
  onOpenCreateVariant: () => void;
  onOpenPromptModal: (
    title: string,
    type: 'Google LLM Production' | 'ChatGPT Asset Finalization' | 'Social Copy',
    body: string,
    jobId: string,
    targetAccount: string
  ) => void;
  onAdvanceStage: (jobId: string, nextStage: ProductionStatus) => void;
}

const STAGES: { id: ProductionStatus; title: string; color: string }[] = [
  { id: 'Assigned', title: 'Assigned', color: 'border-slate-300' },
  { id: 'In Production', title: 'In Production', color: 'border-blue-400' },
  { id: 'Draft Ready', title: 'Draft Ready', color: 'border-indigo-400' },
  { id: 'Finalizing', title: 'Finalizing', color: 'border-purple-400' },
  { id: 'QC Review', title: 'QC Review', color: 'border-amber-400' },
  { id: 'Ready to Publish', title: 'Ready to Publish', color: 'border-emerald-400' },
];

export function ProductionView({
  contentJobs,
  sources,
  onOpenCreateVariant,
  onOpenPromptModal,
  onAdvanceStage,
}: ProductionViewProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const filteredJobs = contentJobs.filter((j) => {
    if (selectedAccount !== 'all' && j.targetAccount !== selectedAccount) return false;
    return true;
  });

  const getNextStage = (current: ProductionStatus): ProductionStatus | null => {
    switch (current) {
      case 'Assigned':
        return 'In Production';
      case 'In Production':
        return 'Draft Ready';
      case 'Draft Ready':
        return 'Finalizing';
      case 'Finalizing':
        return 'QC Review';
      case 'QC Review':
        return 'Ready to Publish';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Production Board</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {filteredJobs.length} Active Jobs
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Kanban drafting and asset finalization workflow. Advance content jobs from Assigned through QC Review to Ready to Publish.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Filter Account:</span>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="all">All Target Accounts</option>
              <option value="PYCODEAI-LINKEDIN">PYCODEAI-LINKEDIN</option>
              <option value="FARWA-LINKEDIN">FARWA-LINKEDIN</option>
              <option value="MUNEEB-LINKEDIN">MUNEEB-LINKEDIN</option>
              <option value="PYCODEAI-X">PYCODEAI-X</option>
            </select>
          </div>

          <button
            onClick={onOpenCreateVariant}
            className="inline-flex items-center space-x-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ Create Variant</span>
          </button>
        </div>
      </div>

      {/* Kanban Board Columns (6 Stages) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageJobs = filteredJobs.filter((j) => j.productionStatus === stage.id);

          return (
            <div
              key={stage.id}
              className="flex flex-col rounded-xl border border-slate-200/90 bg-slate-100/60 p-3 min-w-[210px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-800">{stage.title}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-700 shadow-2xs">
                  {stageJobs.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="mt-3 flex-1 space-y-2.5">
                {stageJobs.map((job) => {
                  const nextStage = getNextStage(job.productionStatus);

                  return (
                    <div
                      key={job.id}
                      className="rounded-lg border border-slate-200 bg-white p-3 shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      {/* Top IDs & Account */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-indigo-900 bg-indigo-50 px-1.5 py-0.5 rounded">
                          {job.id}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {job.platform}
                        </span>
                      </div>

                      <div className="mt-1 font-semibold text-slate-900 text-xs line-clamp-1">
                        {job.targetAccount}
                      </div>

                      <div className="mt-0.5 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-700">
                        {job.contentType}
                      </div>

                      {/* Source Title reference */}
                      <div className="mt-1.5 text-[11px] text-slate-600 line-clamp-2 leading-snug">
                        {job.sourceTitle}
                      </div>

                      {/* Producer & Due date */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2">
                        <span className="font-medium text-slate-600">{job.producer}</span>
                        <span className="text-amber-700 font-semibold">{job.dueDeadline}</span>
                      </div>

                      {/* Downstream Three-Prompt Model links */}
                      <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[9px]">
                        <span className="text-slate-400">Prompts:</span>
                        <div className="flex items-center space-x-1">
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
                            className="text-emerald-700 font-semibold hover:underline"
                            title="Google LLM Production Prompt"
                          >
                            LLM
                          </button>
                          <span className="text-slate-300">|</span>
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
                            className="text-indigo-700 font-semibold hover:underline"
                            title="ChatGPT Asset Finalization Prompt"
                          >
                            Assets
                          </button>
                          <span className="text-slate-300">|</span>
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
                            className="text-slate-700 font-semibold hover:underline"
                            title="Social Copy Prompt"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      {/* Advance Stage button */}
                      {nextStage && (
                        <button
                          onClick={() => onAdvanceStage(job.id, nextStage)}
                          className="mt-2.5 flex w-full items-center justify-center space-x-1 rounded bg-slate-50 py-1 text-[10px] font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors border border-slate-200/70"
                        >
                          <span>Move to {nextStage}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  );
                })}

                {stageJobs.length === 0 && (
                  <div className="py-8 text-center text-[11px] text-slate-400 italic">
                    No jobs in {stage.title}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
