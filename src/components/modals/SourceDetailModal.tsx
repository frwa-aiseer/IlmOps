/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Layers,
  Plus,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ShieldCheck,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { ResearchSource, ContentJob, ReviewDecision } from '../../types/ilmops.ts';

interface SourceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: ResearchSource | null;
  contentJobs: ContentJob[];
  onUpdateDecision: (sourceId: string, decision: ReviewDecision) => void;
  onOpenCreateVariant: (source: ResearchSource) => void;
  onSelectContentJob?: (job: ContentJob) => void;
}

export function SourceDetailModal({
  isOpen,
  onClose,
  source,
  contentJobs,
  onUpdateDecision,
  onOpenCreateVariant,
  onSelectContentJob,
}: SourceDetailModalProps) {
  const [showAiSuggestions, setShowAiSuggestions] = useState(false);

  if (!isOpen || !source) return null;

  const linkedJobs = contentJobs.filter((job) => job.sourceId === source.id);
  const isApproved = source.reviewDecision === 'approved';

  const getDecisionBadge = (decision: ReviewDecision) => {
    switch (decision) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Approved Source</span>
          </span>
        );
      case 'held':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <PauseCircle className="h-3.5 w-3.5 text-amber-600" />
            <span>On Hold</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
            <XCircle className="h-3.5 w-3.5 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            <Clock className="h-3.5 w-3.5 text-slate-500" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-mono text-xs font-bold">
              {source.id}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-800">
                  {source.nicheId === 'ai_data' ? 'AI & Data Engineering' : 'Electrical & Energy'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-medium text-slate-600">{source.subcategory}</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 line-clamp-1">
                {source.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {getDecisionBadge(source.reviewDecision)}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* SECTION 1: SOURCE METADATA */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                1. Source Metadata
              </span>
              <a
                href={source.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 hover:underline"
              >
                <span>Open Original Source</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <span className="text-slate-400 font-medium">Publisher / Author</span>
                <div className="mt-0.5 font-semibold text-slate-900">{source.publisherOrAuthor}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Domain & Type</span>
                <div className="mt-0.5 font-semibold text-slate-900">
                  {source.sourceDomain} ({source.sourceType})
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Published Date</span>
                <div className="mt-0.5 font-semibold text-slate-900">{source.publishedDate}</div>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Captured Date</span>
                <div className="mt-0.5 font-semibold text-slate-900">{source.capturedDate}</div>
              </div>
            </div>
          </div>

          {/* SECTION 2: RESEARCH ANALYSIS */}
          <div className="space-y-4 rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              2. Technical Research Synthesis
            </span>

            <div>
              <h4 className="font-semibold text-slate-800">Technical Summary</h4>
              <p className="mt-1 text-slate-700 leading-relaxed font-sans text-xs">
                {source.details.technicalSummary}
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-800">Key Findings & Takeaways</h4>
              <ul className="mt-1.5 space-y-1.5 pl-4 list-disc text-slate-700">
                {source.details.keyFindings.map((finding, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {finding}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <div>
                <h4 className="font-semibold text-slate-800">Why It Matters / Novelty</h4>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {source.details.whyItMatters}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800">Content Angle / Editorial Hook</h4>
                <p className="mt-1 text-slate-600 leading-relaxed">
                  {source.details.contentAngle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-400 font-medium">Recommended Format:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {source.details.recommendedFormat}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Target Audience:</span>{' '}
                <span className="font-semibold text-slate-800">
                  {source.details.targetAudience}
                </span>
              </div>
            </div>
          </div>

          {/* SECTION 3: QUALITY METRICS */}
          <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              3. Quality & Evaluation Scores
            </span>

            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                <span className="text-[10px] text-slate-500 font-medium">Credibility</span>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {source.scores.credibility}%
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                <span className="text-[10px] text-slate-500 font-medium">Novelty</span>
                <div className="mt-1 text-lg font-bold text-slate-900">
                  {source.scores.novelty}%
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                <span className="text-[10px] text-slate-500 font-medium">Content Value</span>
                <div className="mt-1 text-lg font-bold text-emerald-700">
                  {source.scores.contentValue}%
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                <span className="text-[10px] text-slate-500 font-medium">Technical Depth</span>
                <div className="mt-1 text-xs font-bold text-indigo-700">
                  {source.technicalDepth}
                </div>
              </div>

              <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-center">
                <span className="text-[10px] text-slate-500 font-medium">Production Potential</span>
                <div className="mt-1 text-xs font-bold text-emerald-700">
                  {source.productionPotential}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: HUMAN REVIEW DECISION GATE */}
          <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  4. Human Source Review Gate
                </span>
                <p className="text-slate-600 mt-0.5">
                  Decide whether this source meets rigorous technical standards before opening variant production.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onUpdateDecision(source.id, 'approved')}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    source.reviewDecision === 'approved'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Approve</span>
                </button>

                <button
                  onClick={() => onUpdateDecision(source.id, 'held')}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    source.reviewDecision === 'held'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  <PauseCircle className="h-3.5 w-3.5" />
                  <span>Hold</span>
                </button>

                <button
                  onClick={() => onUpdateDecision(source.id, 'rejected')}
                  className={`inline-flex items-center space-x-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    source.reviewDecision === 'rejected'
                      ? 'bg-red-600 text-white shadow-xs'
                      : 'bg-white text-red-700 border border-red-300 hover:bg-red-50'
                  }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 5: CONTENT VARIANTS (ONE SOURCE -> MULTIPLE CONTENT JOBS) */}
          <div className="rounded-xl border border-indigo-200/80 bg-indigo-50/20 p-5 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900">
                    5. Content Variants ({linkedJobs.length})
                  </span>
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-800">
                    One Source → Multiple Branded Outputs
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5 text-[11px]">
                  Content jobs derived from this specific research reference across different accounts.
                </p>
              </div>

              {isApproved ? (
                <button
                  id="btn-create-content-variant"
                  onClick={() => onOpenCreateVariant(source)}
                  className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>+ Create Content Variant</span>
                </button>
              ) : (
                <span className="text-[11px] font-semibold text-slate-400 italic">
                  (Approve source first to create content variants)
                </span>
              )}
            </div>

            <div className="mt-4 space-y-2.5">
              {linkedJobs.length > 0 ? (
                linkedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-indigo-100 bg-white p-3.5 shadow-xs hover:border-indigo-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-indigo-900">{job.id}</span>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                          {job.targetAccount}
                        </span>
                        <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">
                          {job.platform} • {job.contentType}
                        </span>
                      </div>
                      <div className="mt-1 text-slate-600 text-[11px]">
                        Producer: <strong className="text-slate-800 font-semibold">{job.producer}</strong> •{' '}
                        QC Reviewer: {job.qcReviewer}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
                        {job.productionStatus}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">{job.dueDeadline}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400">
                  <Layers className="mx-auto h-8 w-8 text-indigo-200" />
                  <p className="mt-1.5 font-medium">No content variants created from this source yet.</p>
                  {isApproved && (
                    <button
                      onClick={() => onOpenCreateVariant(source)}
                      className="mt-2 text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      Click here to create the first content variant →
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* SECTION 6: COLLAPSIBLE OPTIONAL AI SUGGESTIONS */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <button
              onClick={() => setShowAiSuggestions(!showAiSuggestions)}
              className="flex w-full items-center justify-between text-left text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <div className="flex items-center space-x-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                <span>AI Suggestions & Scratchpad Notes (Optional / Collapsed)</span>
              </div>
              {showAiSuggestions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>

            {showAiSuggestions && (
              <div className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600 leading-relaxed font-mono bg-white p-3 rounded-lg border">
                {source.details.aiSuggestions || 'No preliminary AI notes stored for this source.'}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <span className="text-[11px] text-slate-400">
            Source ID: {source.id} • {source.reviewDecision}
          </span>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
