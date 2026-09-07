/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Database, AlertCircle, ArrowRight } from 'lucide-react';
import type { NavigationTab } from '../../config/branding.ts';

interface DemoDataBannerProps {
  onNavigateToLivePreview?: (tab: NavigationTab) => void;
  className?: string;
}

export function DemoDataBanner({ onNavigateToLivePreview, className = '' }: DemoDataBannerProps) {
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 px-4 py-3 text-xs text-amber-950 shadow-2xs ${className}`}
    >
      <div className="flex items-center space-x-2.5">
        <span className="inline-flex items-center space-x-1 rounded-md bg-amber-200/90 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-900 uppercase">
          <AlertCircle className="h-3.5 w-3.5 mr-0.5 text-amber-800" />
          DEMO DATA
        </span>
        <span className="font-medium text-amber-900">
          Live operational cutover follows user authorization.
        </span>
        <span className="hidden sm:inline text-amber-700/90">
          These records are local mock simulations to prevent accidental operational mutation.
        </span>
      </div>

      {onNavigateToLivePreview && (
        <button
          onClick={() => onNavigateToLivePreview('live_data_preview')}
          className="inline-flex items-center space-x-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-2xs hover:bg-amber-100/50 transition-colors"
        >
          <Database className="h-3.5 w-3.5 text-amber-700" />
          <span>Inspect Real Records in Live Preview</span>
          <ArrowRight className="h-3 w-3 text-amber-700" />
        </button>
      )}
    </div>
  );
}
