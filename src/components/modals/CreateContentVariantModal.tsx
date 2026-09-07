/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Layers, Plus, Sparkles, AlertCircle } from 'lucide-react';
import {
  ResearchSource,
  ContentJob,
  TargetAccount,
  ContentType,
  Platform,
} from '../../types/ilmops.ts';
import {
  TARGET_ACCOUNTS_MAP,
  CONTENT_TYPES,
  TEAM_MEMBERS,
} from '../../config/branding.ts';

interface CreateContentVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: ResearchSource | null;
  allSources?: ResearchSource[];
  onCreateJob: (job: ContentJob) => void;
}

export function CreateContentVariantModal({
  isOpen,
  onClose,
  source,
  allSources = [],
  onCreateJob,
}: CreateContentVariantModalProps) {
  const [selectedSourceId, setSelectedSourceId] = useState<string>(source?.id || '');
  const [targetAccount, setTargetAccount] = useState<TargetAccount>('PYCODEAI-LINKEDIN');
  const [contentType, setContentType] = useState<ContentType>('Infographic');
  const [producer, setProducer] = useState('Amara Akhtar');
  const [qcReviewer, setQcReviewer] = useState('Muhammad Moneeb Akhtar');
  const [publishingOwner, setPublishingOwner] = useState('Amara Akhtar');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const currentSource =
    (source && source.id === selectedSourceId ? source : null) ||
    allSources.find((s) => s.id === selectedSourceId) ||
    source ||
    allSources[0];

  const derivedPlatform: Platform = TARGET_ACCOUNTS_MAP[targetAccount]?.platform || 'LinkedIn';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSource) return;

    const newJobId = `CNT-${Math.floor(1000 + Math.random() * 9000)}-01`;

    const newJob: ContentJob = {
      id: newJobId,
      sourceUrlKey: currentSource.urlKey || currentSource.id,
      sourceId: currentSource.id,
      sourceNiche: currentSource.nicheId === 'ai_data' ? 'AI & Data Engineering' : 'Electrical Design, Estimation & Energy',
      sourceTitle: currentSource.title,
      sourceType: currentSource.sourceType,
      sourceFinalUrl: currentSource.sourceUrl,
      targetAccount,
      platform: derivedPlatform,
      contentType,
      variantLabel: `${targetAccount} - ${contentType}`,
      producer,
      qcReviewer,
      publishingOwner,
      productionStatus: 'Assigned',
      qcStatus: 'Not Started',
      publishingStatus: 'Unscheduled',
      lastUpdated: 'Just now',
      dueDeadline: 'In 3 days',
      wordCount: 0,
      targetLength: 500,
      notes: notes.trim() || `Production job generated from approved source ${currentSource.id}`,
      prompts: {
        googleLLMProductionPrompt: `[GOOGLE LLM PRODUCTION PROMPT]\n\nContext: Source ${currentSource.id} (${currentSource.title}).\nTarget: ${targetAccount} (${derivedPlatform} - ${contentType}).\nObjective: Synthesize source findings into format-specific technical copy.`,
        chatGPTAssetFinalizationPrompt: `[CHATGPT ASSET FINALIZATION PROMPT]\n\nTask: Generate asset specifications, layout diagrams, and typography hierarchy for ${targetAccount}.`,
        socialCopyPrompt: `[SOCIAL COPY PROMPT]\n\nDraft platform-optimized hook, body, and CTA tailored for ${derivedPlatform} distribution.`,
      },
    };

    onCreateJob(newJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Create Content Variant</h3>
              <p className="text-xs text-slate-500">
                Generate a branded content job from an approved research source
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Linked Research Source reference */}
          <div>
            <label className="font-semibold text-slate-800">Referenced Research Source</label>
            {source ? (
              <div className="mt-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-bold text-slate-700">
                    {source.id}
                  </span>
                  <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                    {source.reviewDecision.toUpperCase()}
                  </span>
                </div>
                <div className="mt-1 font-semibold text-slate-900 line-clamp-1">
                  {source.title}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {source.publisherOrAuthor} • {source.subcategory}
                </div>
              </div>
            ) : (
              <select
                value={selectedSourceId}
                onChange={(e) => setSelectedSourceId(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {allSources
                  .filter((s) => s.reviewDecision === 'approved')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.id}] {s.title.slice(0, 60)}...
                    </option>
                  ))}
              </select>
            )}
          </div>

          {/* Target Account & Derived Platform */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-semibold text-slate-800">Target Account</label>
              <select
                value={targetAccount}
                onChange={(e) => setTargetAccount(e.target.value as TargetAccount)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {Object.keys(TARGET_ACCOUNTS_MAP).map((acc) => (
                  <option key={acc} value={acc}>
                    {acc}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800">Derived Platform</label>
              <div className="mt-1.5 flex h-9 items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700">
                <span>{derivedPlatform}</span>
                <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  Auto-derived
                </span>
              </div>
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label className="font-semibold text-slate-800">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            >
              {CONTENT_TYPES.map((ct) => (
                <option key={ct} value={ct}>
                  {ct}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned Producer & QC Reviewer */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-semibold text-slate-800">Assigned Producer</label>
              <select
                value={producer}
                onChange={(e) => setProducer(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name} ({m.avatar})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800">QC Reviewer</label>
              <select
                value={qcReviewer}
                onChange={(e) => setQcReviewer(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
              >
                {TEAM_MEMBERS.map((m) => (
                  <option key={m.name} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Publishing Owner */}
          <div>
            <label className="font-semibold text-slate-800">Publishing Owner</label>
            <select
              value={publishingOwner}
              onChange={(e) => setPublishingOwner(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            >
              {TEAM_MEMBERS.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Production Notes */}
          <div>
            <label className="font-semibold text-slate-800">Production Directives & Angle</label>
            <textarea
              rows={2}
              placeholder="e.g. Highlight the 3-step calculation formula and keep code blocks monospaced..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Content Job</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
