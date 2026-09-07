/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Filter,
  Search,
  ExternalLink,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Layers,
  Plus,
  Eye,
  ShieldCheck,
  Clock,
  Sparkles,
  SlidersHorizontal,
} from 'lucide-react';
import { AddSourceButton } from '../common/AddSourceButton.tsx';
import {
  ResearchSource,
  NicheId,
  ReviewDecision,
  ContentJob,
} from '../../types/ilmops.ts';
import { NICHES_CONFIG } from '../../config/branding.ts';

interface ResearchInboxViewProps {
  sources: ResearchSource[];
  contentJobs: ContentJob[];
  onOpenSourceDetail: (source: ResearchSource) => void;
  onOpenCreateVariant: (source: ResearchSource) => void;
  onUpdateDecision: (sourceId: string, decision: ReviewDecision) => void;
  onAddSourceClick: () => void;
}

export function ResearchInboxView({
  sources,
  contentJobs,
  onOpenSourceDetail,
  onOpenCreateVariant,
  onUpdateDecision,
  onAddSourceClick,
}: ResearchInboxViewProps) {
  const [selectedNiche, setSelectedNiche] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedDecision, setSelectedDecision] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Filter sources
  const filteredSources = sources.filter((s) => {
    if (selectedNiche !== 'all' && s.nicheId !== selectedNiche) return false;
    if (selectedSubcategory !== 'all' && s.subcategory !== selectedSubcategory) return false;
    if (selectedDecision !== 'all' && s.reviewDecision !== selectedDecision) return false;
    if (searchFilter) {
      const q = searchFilter.toLowerCase();
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchPub = s.publisherOrAuthor.toLowerCase().includes(q);
      const matchSub = s.subcategory.toLowerCase().includes(q);
      if (!matchTitle && !matchPub && !matchSub) return false;
    }
    return true;
  });

  const currentNicheConfig = NICHES_CONFIG.find((n) => n.id === selectedNiche);

  const getDecisionBadge = (decision: ReviewDecision) => {
    switch (decision) {
      case 'approved':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            <span>Approved</span>
          </span>
        );
      case 'held':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800">
            <PauseCircle className="h-3 w-3 text-amber-600" />
            <span>On Hold</span>
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-800">
            <XCircle className="h-3 w-3 text-red-600" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">
            <Clock className="h-3 w-3 text-slate-500" />
            <span>Pending Review</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Research Inbox</h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
              {filteredSources.length} Sources
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Human review gate for multi-niche research. Verify credibility and editorial value before creating content variants.
          </p>
        </div>

        <AddSourceButton
          id="btn-add-source-inbox"
          onClick={onAddSourceClick}
          variant="default"
        />
      </div>

      {/* Filter Bar (Niche, Subcategory, Decision, Search) */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Niche Filter (Primary Requirement: All Niches, AI & Data, Electrical) */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-700">Niche:</span>
            <div className="flex flex-wrap rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => {
                  setSelectedNiche('all');
                  setSelectedSubcategory('all');
                }}
                className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  selectedNiche === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Niches
              </button>
              {NICHES_CONFIG.map((niche) => (
                <button
                  key={niche.id}
                  onClick={() => {
                    setSelectedNiche(niche.id);
                    setSelectedSubcategory('all');
                  }}
                  className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedNiche === niche.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {niche.label}
                </button>
              ))}
            </div>
          </div>

          {/* Decision Filter */}
          <div className="flex items-center space-x-2 ml-auto">
            <span className="text-xs font-semibold text-slate-700">Status:</span>
            <select
              value={selectedDecision}
              onChange={(e) => setSelectedDecision(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="pending_review">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="held">On Hold</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Secondary Subcategory & Search Filter */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Subcategory:</span>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="all">All Subcategories</option>
              {currentNicheConfig
                ? currentNicheConfig.subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))
                : NICHES_CONFIG.flatMap((n) => n.subcategories).map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
            </select>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search title, author, topic..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Operational Compact Research Cards List */}
      <div className="space-y-3">
        {filteredSources.map((source) => {
          const linkedJobs = contentJobs.filter((j) => j.sourceId === source.id);
          const isApproved = source.reviewDecision === 'approved';

          return (
            <div
              key={source.id}
              className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Row 1: Header tags, ID, Title, Decision */}
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex-1 min-w-[280px]">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-700">
                      {source.id}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                      {source.nicheId === 'ai_data' ? 'AI & Data' : 'Electrical & Energy'}
                    </span>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 border border-emerald-100">
                      {source.subcategory}
                    </span>
                    <span className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 border border-slate-100">
                      {source.sourceType}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Priority: {source.priority}
                    </span>
                  </div>

                  <h3
                    onClick={() => onOpenSourceDetail(source)}
                    className="mt-1.5 text-sm font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                  >
                    {source.title}
                  </h3>

                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span>
                      Publisher: <strong className="text-slate-700 font-semibold">{source.publisherOrAuthor}</strong>
                    </span>
                    <span>•</span>
                    <span>Domain: {source.sourceDomain}</span>
                    <span>•</span>
                    <span>Captured: {source.capturedDate}</span>
                  </div>
                </div>

                {/* Right side: Decision badge & Linked variants count */}
                <div className="flex flex-col items-end space-y-1.5">
                  {getDecisionBadge(source.reviewDecision)}
                  {linkedJobs.length > 0 && (
                    <span className="inline-flex items-center space-x-1 rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-100">
                      <Layers className="h-3 w-3" />
                      <span>{linkedJobs.length} Content Variant{linkedJobs.length > 1 ? 's' : ''}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Operational Scores & Metadata Chips (Credibility, Novelty, Content Value, Technical Depth, Production Potential) */}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <div className="rounded bg-slate-50 px-2 py-1 border border-slate-100">
                    <span className="text-slate-400">Credibility: </span>
                    <strong className="text-slate-800">{source.scores.credibility}%</strong>
                  </div>
                  <div className="rounded bg-slate-50 px-2 py-1 border border-slate-100">
                    <span className="text-slate-400">Novelty: </span>
                    <strong className="text-slate-800">{source.scores.novelty}%</strong>
                  </div>
                  <div className="rounded bg-emerald-50 px-2 py-1 border border-emerald-100">
                    <span className="text-emerald-700">Content Value: </span>
                    <strong className="text-emerald-900">{source.scores.contentValue}%</strong>
                  </div>
                  <div className="rounded bg-slate-50 px-2 py-1 border border-slate-100">
                    <span className="text-slate-400">Depth: </span>
                    <strong className="text-slate-800">{source.technicalDepth}</strong>
                  </div>
                  <div className="rounded bg-slate-50 px-2 py-1 border border-slate-100">
                    <span className="text-slate-400">Potential: </span>
                    <strong className="text-slate-800">{source.productionPotential}</strong>
                  </div>
                </div>

                {/* Actions: Open Source, View Details, Review Actions, and + Create Content Variant (ONLY if approved!) */}
                <div className="flex flex-wrap items-center gap-2">
                  <a
                    href={source.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    <span>Open Source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>

                  <button
                    onClick={() => onOpenSourceDetail(source)}
                    className="inline-flex items-center space-x-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-3 w-3 text-slate-500" />
                    <span>View Details</span>
                  </button>

                  {/* Review Actions when not yet approved or held */}
                  {!isApproved && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onUpdateDecision(source.id, 'approved')}
                        className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-xs"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => onUpdateDecision(source.id, 'held')}
                        className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-100"
                      >
                        Hold
                      </button>
                      <button
                        onClick={() => onUpdateDecision(source.id, 'rejected')}
                        className="rounded-lg border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* ONLY after a source is APPROVED should the interface offer: + Create Content Variant */}
                  {isApproved && (
                    <button
                      onClick={() => onOpenCreateVariant(source)}
                      className="inline-flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>+ Create Content Variant</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredSources.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white py-12 text-center text-slate-400">
            <BookOpen className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2 text-xs font-medium">No research sources match the selected filters.</p>
            <button
              onClick={() => {
                setSelectedNiche('all');
                setSelectedSubcategory('all');
                setSelectedDecision('all');
                setSearchFilter('');
              }}
              className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
