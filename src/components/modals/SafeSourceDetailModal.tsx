/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  X,
  Lock,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Building2,
  Tag,
  Star,
  Sparkles,
  CheckCircle2,
  FileText,
  Target,
  Layers,
  HelpCircle,
} from 'lucide-react';
import type { LiveResearchSourceCompact } from '../../../shared/contracts/livePreview.ts';

interface SafeSourceDetailModalProps {
  isOpen: boolean;
  source: LiveResearchSourceCompact | null;
  onClose: () => void;
}

export function SafeSourceDetailModal({
  isOpen,
  source,
  onClose,
}: SafeSourceDetailModalProps) {
  if (!isOpen || !source) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center space-x-1 rounded-md bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-900 uppercase">
              <Lock className="h-3 w-3 mr-1 text-emerald-800" />
              READ-ONLY LIVE RECORD
            </span>
            <span className="text-xs text-slate-500 font-mono">ID: {source.id}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 text-xs text-slate-700">
          {/* Title & Niche */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-slate-800">
                {source.nicheLabel}
              </span>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-blue-800 border border-blue-200">
                {source.sourceType}
              </span>
              <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-semibold text-amber-800 border border-amber-200">
                Priority: {source.priority}
              </span>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 font-semibold text-purple-800 border border-purple-200">
                Depth: {source.technicalDepth}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-semibold text-emerald-800 border border-emerald-200">
                Production Potential: {source.productionPotential}
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900 leading-snug">
              {source.title}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-4 text-slate-500">
              <span className="flex items-center space-x-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>{source.publisherOrAuthor}</span>
                {source.sourceDomain && (
                  <span className="text-slate-400 font-mono">({source.sourceDomain})</span>
                )}
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Published: {source.publishedDate || 'N/A'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>Captured: {source.capturedDate || 'N/A'}</span>
              </span>
            </div>
          </div>

          {/* URL Status & Open Source Link */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Source URL & Canonical Key
              </div>
              <div className="mt-0.5 font-mono text-[11px] text-slate-800 truncate max-w-lg">
                Key: {source.urlKey || '<No URL Key assigned>'}
              </div>
            </div>
            <div>
              {source.bestUrl ? (
                <a
                  href={source.bestUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-semibold text-emerald-900 hover:bg-emerald-100 transition-colors shadow-2xs"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Open Source</span>
                </a>
              ) : (
                <span className="inline-flex items-center space-x-1 rounded-md bg-amber-100 px-2.5 py-1 font-semibold text-amber-900">
                  <HelpCircle className="h-3.5 w-3.5 text-amber-700" />
                  <span>URL needs verification</span>
                </span>
              )}
            </div>
          </div>

          {/* Quality & Score Matrix */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="text-slate-500 font-semibold text-[11px]">Credibility Score</div>
              <div className="mt-1 text-lg font-bold font-mono text-emerald-700">
                {source.scores.credibility !== null ? `${source.scores.credibility}/5` : 'N/A'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="text-slate-500 font-semibold text-[11px]">Novelty Score</div>
              <div className="mt-1 text-lg font-bold font-mono text-blue-700">
                {source.scores.novelty !== null ? `${source.scores.novelty}/5` : 'N/A'}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
              <div className="text-slate-500 font-semibold text-[11px]">Content Value Score</div>
              <div className="mt-1 text-lg font-bold font-mono text-purple-700">
                {source.scores.contentValue !== null ? `${source.scores.contentValue}/5` : 'N/A'}
              </div>
            </div>
          </div>

          {/* Safe Technical Summary */}
          {source.details.technicalSummary && (
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <FileText className="h-4 w-4 text-emerald-600" />
                <span>Technical Summary</span>
              </div>
              <div className="rounded-xl border border-slate-200/90 bg-slate-50/70 p-3.5 leading-relaxed text-slate-700">
                {source.details.technicalSummary}
              </div>
            </div>
          )}

          {/* Key Findings / Takeaways */}
          {source.details.keyTakeaways && source.details.keyTakeaways.length > 0 && (
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Key Findings / Takeaways</span>
              </div>
              <ul className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-1.5 list-disc list-inside text-slate-700">
                {source.details.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="leading-normal">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Why It Matters / Novelty */}
          {source.details.whyItMatters && (
            <div className="space-y-1.5">
              <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Why It Matters / Novelty</span>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3.5 leading-relaxed text-slate-700">
                {source.details.whyItMatters}
              </div>
            </div>
          )}

          {/* Editorial Hook, Target Audience, Recommended Format */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {source.details.contentAngle && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Content Angle / Hook
                </div>
                <div className="text-slate-800 leading-normal">{source.details.contentAngle}</div>
              </div>
            )}
            {source.details.targetAudience && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">Target Audience</div>
                <div className="text-slate-800 leading-normal">
                  {source.details.targetAudience}
                </div>
              </div>
            )}
            {source.details.recommendedFormat && (
              <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase">
                  Recommended Format
                </div>
                <div className="text-slate-800 leading-normal">
                  {source.details.recommendedFormat}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50 px-6 py-3.5 rounded-b-2xl">
          <div className="flex items-center space-x-2 text-[11px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>
              Direct read from ALLIN Content Operations Hub. Review and write actions remain gated until P07 authorization.
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
