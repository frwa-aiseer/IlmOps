/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Sparkles, Layers } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  promptTitle: string;
  promptType: 'Google LLM Production' | 'ChatGPT Asset Finalization' | 'Social Copy';
  promptBody: string;
  jobId: string;
  targetAccount: string;
}

export function PromptModal({
  isOpen,
  onClose,
  promptTitle,
  promptType,
  promptBody,
  jobId,
  targetAccount,
}: PromptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(promptBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
          <div className="flex items-center space-x-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">{promptTitle}</h3>
                <span className="rounded bg-slate-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700">
                  {jobId}
                </span>
              </div>
              <p className="text-xs text-slate-500">Target Account: {targetAccount}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Downstream Three-Prompt Model • {promptType}</span>
            <span className="text-[11px] font-medium text-emerald-700">
              Reserved for Model Dispatch
            </span>
          </div>

          <div className="relative rounded-xl border border-slate-200 bg-slate-900 p-4 font-mono text-xs text-slate-200">
            <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed font-mono text-xs text-emerald-300">
              {promptBody}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-3.5">
          <span className="text-[11px] text-slate-400">
            Copy template into execution pipeline or testing sandbox
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-white" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
