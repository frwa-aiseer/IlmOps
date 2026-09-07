/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, BookOpen, Sparkles } from 'lucide-react';
import { ResearchSource, NicheId, TechnicalDepth, ProductionPotential } from '../../types/ilmops.ts';
import { NICHES_CONFIG } from '../../config/branding.ts';

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (newSource: ResearchSource) => void;
}

export function AddSourceModal({ isOpen, onClose, onAddSource }: AddSourceModalProps) {
  const [title, setTitle] = useState('');
  const [nicheId, setNicheId] = useState<NicheId>('ai_data');
  const [subcategory, setSubcategory] = useState(NICHES_CONFIG[0].subcategories[0]);
  const [sourceType, setSourceType] = useState<ResearchSource['sourceType']>('ArXiv');
  const [publisherOrAuthor, setPublisherOrAuthor] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [technicalDepth, setTechnicalDepth] = useState<TechnicalDepth>('Advanced');
  const [productionPotential, setProductionPotential] = useState<ProductionPotential>('High');
  const [summary, setSummary] = useState('');
  const [keyFindings, setKeyFindings] = useState('');
  const [contentAngle, setContentAngle] = useState('');

  if (!isOpen) return null;

  const currentNicheConfig = NICHES_CONFIG.find((n) => n.id === nicheId) || NICHES_CONFIG[0];

  const handleNicheChange = (newNicheId: NicheId) => {
    setNicheId(newNicheId);
    const nConfig = NICHES_CONFIG.find((n) => n.id === newNicheId);
    if (nConfig && nConfig.subcategories.length > 0) {
      setSubcategory(nConfig.subcategories[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !publisherOrAuthor.trim()) return;

    let derivedDomain = 'source.org';
    try {
      if (sourceUrl.startsWith('http')) {
        derivedDomain = new URL(sourceUrl).hostname;
      }
    } catch {
      derivedDomain = 'source.org';
    }

    const newSourceId = `SRC-${nicheId === 'ai_data' ? 'AI' : 'EE'}-${Math.floor(10 + Math.random() * 90)}`;
    const generatedUrlKey =
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .slice(0, 50) || newSourceId.toLowerCase();

    const newSource: ResearchSource = {
      id: newSourceId,
      urlKey: generatedUrlKey,
      title: title.trim(),
      nicheId,
      subcategory,
      sourceType,
      publisherOrAuthor: publisherOrAuthor.trim(),
      sourceDomain: derivedDomain,
      sourceUrl: sourceUrl.trim() || 'https://source.org',
      canonicalUrl: sourceUrl.trim() || 'https://source.org',
      cleanUrl: sourceUrl.trim() || 'https://source.org',
      verifiedUrl: sourceUrl.trim() || 'https://source.org',
      urlStatus: 'Pending Verification',
      publishedDate: 'Just now',
      capturedDate: 'Today',
      freshnessDays: 0,
      priority: 'P1',
      scores: {
        credibility: 92,
        novelty: 88,
        contentValue: 90,
      },
      technicalDepth,
      productionPotential,
      reviewDecision: 'pending_review',
      details: {
        technicalSummary: summary.trim() || 'Detailed technical research documentation.',
        keyFindings: keyFindings
          ? keyFindings.split('\n').filter((f) => f.trim().length > 0)
          : ['Demonstrated high correlation with industry standards.', 'Key technical insight for content.'],
        whyItMatters: 'Provides architectural reference for practitioners.',
        contentAngle: contentAngle.trim() || 'Deep dive into practical implementation challenges.',
        recommendedFormat: 'Infographic / Walkthrough',
        targetAudience: 'Engineering Practitioners & Technical Leads',
      },
    };

    onAddSource(newSource);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Add Research Source</h3>
              <p className="text-xs text-slate-500">
                Log a new technical paper, standard, or engineering guide for human review
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Niche & Subcategory */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="font-semibold text-slate-800">Industry / Research Niche</label>
              <select
                value={nicheId}
                onChange={(e) => handleNicheChange(e.target.value as NicheId)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              >
                {NICHES_CONFIG.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800">Subcategory</label>
              <select
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              >
                {currentNicheConfig.subcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="font-semibold text-slate-800">Source Title</label>
            <input
              type="text"
              required
              placeholder="e.g. IEEE 1584 Arc Flash Hazard Analysis or vLLM KV Cache Pruning"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Publisher & Source Type */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="font-semibold text-slate-800">Publisher / Author</label>
              <input
                type="text"
                required
                placeholder="e.g. IEEE, Stanford HAI, Schneider"
                value={publisherOrAuthor}
                onChange={(e) => setPublisherOrAuthor(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-800">Source Type</label>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value as ResearchSource['sourceType'])}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="ArXiv">ArXiv</option>
                <option value="Industry Standard">Industry Standard</option>
                <option value="Technical Report">Technical Report</option>
                <option value="Engineering Guide">Engineering Guide</option>
                <option value="Vendor Whitepaper">Vendor Whitepaper</option>
                <option value="Code Repository">Code Repository</option>
                <option value="Conference Paper">Conference Paper</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-800">Source URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Technical Summary */}
          <div>
            <label className="font-semibold text-slate-800">Technical Summary</label>
            <textarea
              rows={2}
              placeholder="Core engineering contribution or benchmark findings..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Key Findings */}
          <div>
            <label className="font-semibold text-slate-800">
              Key Findings (One per line)
            </label>
            <textarea
              rows={2}
              placeholder="Finding 1&#10;Finding 2"
              value={keyFindings}
              onChange={(e) => setKeyFindings(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Content Angle */}
          <div>
            <label className="font-semibold text-slate-800">Editorial Hook / Content Angle</label>
            <input
              type="text"
              placeholder="e.g. Why standard calculations fail in real high-temperature installations"
              value={contentAngle}
              onChange={(e) => setContentAngle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <span className="text-[11px] text-slate-500">
              Starts in <strong className="text-slate-800">Pending Review</strong> stage
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Source</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
