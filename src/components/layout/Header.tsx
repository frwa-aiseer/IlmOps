/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, Search, User } from 'lucide-react';
import { BRANDING, NavigationTab } from '../../config/branding.ts';
import { AddSourceButton } from '../common/AddSourceButton.tsx';

interface HeaderProps {
  activeTab: NavigationTab;
  onOpenMobileSidebar: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  onAddSourceClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({
  activeTab,
  onOpenMobileSidebar,
  onSelectTab,
  onAddSourceClick,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  // Find current tab label from groups
  let currentLabel = 'Overview';
  for (const group of BRANDING.navigationGroups) {
    const item = group.items.find((i) => i.id === activeTab);
    if (item) {
      currentLabel = item.label;
      break;
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 backdrop-blur-xs sm:px-6">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          id="mobile-sidebar-toggle"
          onClick={onOpenMobileSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-800">IlmOps</span>
            <span>/</span>
            <span className="font-medium text-slate-600">{currentLabel}</span>
          </div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">
            {currentLabel}
          </h1>
        </div>
      </div>

      {/* Center: Quick Global Search across niches */}
      <div className="hidden md:flex max-w-md flex-1 px-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search research topics, sources, content jobs, authors..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Right: Consistent Primary Action (Add Source) & Team Profile */}
      <div className="flex items-center space-x-3">
        {/* Consistent Primary Action across IlmOps */}
        <AddSourceButton
          id="header-add-source-btn"
          onClick={onAddSourceClick}
          variant="header"
        />

        {/* User Pill (Muhammad Moneeb Akhtar - Admin / Reviewer) */}
        <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-xs">
            MA
          </div>
          <div className="hidden xl:block text-left text-xs leading-tight">
            <div className="font-semibold text-slate-800">Muhammad Moneeb A.</div>
            <div className="text-[10px] text-slate-500">Admin / Reviewer</div>
          </div>
        </div>
      </div>
    </header>
  );
}
