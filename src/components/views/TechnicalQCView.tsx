/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckSquare,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
  FileCheck,
} from 'lucide-react';
import { ContentJob } from '../../types/ilmops.ts';

interface TechnicalQCViewProps {
  contentJobs: ContentJob[];
  onQCApproved?: (job: ContentJob) => void;
}

interface AuditCriterion {
  id: string;
  label: string;
  desc: string;
}

const QC_CRITERIA: AuditCriterion[] = [
  { id: 'math_code', label: 'Technical Math & Code Accuracy', desc: 'Formulas, Python snippets, IEC/IEEE standards citations verified.' },
  { id: 'citation_integrity', label: 'Source Attribution & DOI Integrity', desc: 'Direct citation of published papers, standards tables, or vendor specs.' },
  { id: 'brand_voice', label: 'Account Voice & Editorial Compliance', desc: 'Respects tone, target audience technical depth, and formatting guidelines.' },
  { id: 'visual_diagram', label: 'Visual Diagrams & Typography Hierarchy', desc: 'Legible diagrams, clean labels, proper color contrast, and correct aspect ratio.' },
  { id: 'originality', label: 'Originality & Hallucination Check', desc: 'Zero unverified claims, 95%+ human refinement score, no generic filler.' },
];

export function TechnicalQCView({ contentJobs, onQCApproved }: TechnicalQCViewProps) {
  const qcEligibleJobs = contentJobs.filter(
    (j) => j.productionStatus === 'Draft Ready' || j.productionStatus === 'Finalizing' || j.productionStatus === 'QC Review' || j.qcStatus === 'Approved'
  );

  const [selectedJobId, setSelectedJobId] = useState<string>(qcEligibleJobs[0]?.id || 'CNT-0028-02');
  const [passedChecks, setPassedChecks] = useState<Record<string, Record<string, boolean>>>({
    'CNT-0028-02': {
      math_code: true,
      citation_integrity: true,
      brand_voice: true,
      visual_diagram: true,
      originality: false,
    },
    'CNT-0029-01': {
      math_code: true,
      citation_integrity: true,
      brand_voice: true,
      visual_diagram: true,
      originality: true,
    },
    'CNT-0030-01': {
      math_code: true,
      citation_integrity: true,
      brand_voice: true,
      visual_diagram: true,
      originality: true,
    },
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const selectedJob = qcEligibleJobs.find((j) => j.id === selectedJobId) || qcEligibleJobs[0];
  const currentJobChecks = passedChecks[selectedJobId] || {
    math_code: true,
    citation_integrity: true,
    brand_voice: true,
    visual_diagram: false,
    originality: false,
  };

  const handleToggleCriterion = (criterionId: string) => {
    setPassedChecks((prev) => ({
      ...prev,
      [selectedJobId]: {
        ...currentJobChecks,
        [criterionId]: !currentJobChecks[criterionId],
      },
    }));
  };

  const handleApproveQC = () => {
    if (!selectedJob) return;
    setToastMessage(`Job "${selectedJob.id}" signed off by QC Reviewer (Muhammad Moneeb Akhtar) and moved to Ready to Publish!`);
    if (onQCApproved) {
      onQCApproved({ ...selectedJob, qcStatus: 'Approved', productionStatus: 'Ready to Publish' });
    }
    setTimeout(() => setToastMessage(null), 4500);
  };

  const checksPassedCount = Object.values(currentJobChecks).filter(Boolean).length;
  const isAllChecksPassed = checksPassedCount === QC_CRITERIA.length;

  return (
    <div className="space-y-6">
      {/* Toast alert */}
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
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
              Quality Gate
            </span>
            <span className="text-xs text-slate-500">
              Assigned Reviewer: <strong>Muhammad Moneeb Akhtar</strong>
            </span>
          </div>
          <h1 className="mt-1 text-lg font-bold text-slate-900">Technical Quality Control (QC)</h1>
          <p className="text-xs text-slate-500">
            Pre-publishing audit gate: verifying calculation math, code accuracy, citation fidelity, and brand voice.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Passing Threshold:</span>
          <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200">
            5/5 Verification Checks
          </span>
        </div>
      </div>

      {/* 2-Column Split: Items List & Detailed Audit Sheet */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Items */}
        <div className="space-y-3 lg:col-span-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
            Jobs Awaiting Technical QC ({qcEligibleJobs.length})
          </div>

          {qcEligibleJobs.map((job) => {
            const isSelected = job.id === selectedJob?.id;
            const jobChecks = passedChecks[job.id] || {};
            const count = Object.values(jobChecks).filter(Boolean).length;

            return (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-white shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">{job.id}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      job.qcStatus === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {job.qcStatus}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center space-x-1.5">
                  <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                    {job.targetAccount}
                  </span>
                  <span className="text-[10px] text-slate-400">{job.contentType}</span>
                </div>

                <h4 className="mt-1 text-xs font-semibold text-slate-800 line-clamp-2 leading-snug">
                  {job.sourceTitle}
                </h4>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                  <span>Producer: {job.producer}</span>
                  <span className="font-semibold text-slate-700">{count}/5 Checks</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Active Audit Sheet */}
        {selectedJob && (
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {selectedJob.id}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-semibold text-slate-700">
                      Target Account: {selectedJob.targetAccount} ({selectedJob.platform})
                    </span>
                  </div>
                  <h3 className="mt-1 text-base font-bold text-slate-900">
                    {selectedJob.sourceTitle}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Format: {selectedJob.contentType} • Assigned Producer: {selectedJob.producer} • Source ID: {selectedJob.sourceId}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900">
                    {checksPassedCount}/5
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Audit Checks Passed
                  </div>
                </div>
              </div>

              {/* Interactive Audit Checklist */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Verification Criteria
                </h4>

                <div className="space-y-3">
                  {QC_CRITERIA.map((crit) => {
                    const isPassed = !!currentJobChecks[crit.id];

                    return (
                      <div
                        key={crit.id}
                        onClick={() => handleToggleCriterion(crit.id)}
                        className={`flex items-start justify-between rounded-xl border p-3.5 cursor-pointer transition-all ${
                          isPassed
                            ? 'border-emerald-200 bg-emerald-50/40 text-emerald-950'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                              isPassed
                                ? 'border-emerald-600 bg-emerald-600 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isPassed && <CheckCircle2 className="h-3 w-3" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{crit.label}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{crit.desc}</div>
                          </div>
                        </div>

                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-semibold shrink-0 ${
                            isPassed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {isPassed ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action sign-off footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                <div className="text-xs text-slate-500">
                  Reviewed by: <strong className="text-slate-800">{selectedJob.qcReviewer}</strong>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleApproveQC}
                    disabled={!isAllChecksPassed}
                    className={`inline-flex items-center space-x-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-xs transition-all ${
                      isAllChecksPassed
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <CheckSquare className="h-4 w-4" />
                    <span>Sign Off & Approve for Publishing</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
