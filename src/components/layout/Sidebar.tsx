/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BRANDING, NavigationTab } from '../../config/branding.ts';
import { IlmOpsLogo } from '../brand/IlmOpsLogo.tsx';
import {
  LayoutDashboard,
  CheckCircle2,
  BookOpen,
  Layers,
  Kanban,
  CheckSquare,
  Send,
  BarChart3,
  Sliders,
  Clock,
  Cpu,
  Database,
  ChevronRight,
} from 'lucide-react';
import type { HealthResponse } from '../../../shared/types.ts';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  health: HealthResponse | null;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  activeTab,
  onSelectTab,
  health,
  isOpenMobile,
  onCloseMobile,
}: SidebarProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard':
        return <LayoutDashboard className="h-4 w-4" />;
      case 'CheckCircle2':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'BookOpen':
        return <BookOpen className="h-4 w-4" />;
      case 'Layers':
        return <Layers className="h-4 w-4" />;
      case 'Kanban':
        return <Kanban className="h-4 w-4" />;
      case 'CheckSquare':
        return <CheckSquare className="h-4 w-4" />;
      case 'Send':
        return <Send className="h-4 w-4" />;
      case 'BarChart3':
        return <BarChart3 className="h-4 w-4" />;
      case 'Sliders':
        return <Sliders className="h-4 w-4" />;
      case 'Clock':
        return <Clock className="h-4 w-4" />;
      case 'Cpu':
        return <Cpu className="h-4 w-4" />;
      case 'Database':
        return <Database className="h-4 w-4" />;
      default:
        return <LayoutDashboard className="h-4 w-4" />;
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800/60 bg-slate-950 text-slate-200 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 px-4">
          <IlmOpsLogo size="md" theme="dark" />
        </div>

        {/* Navigation Core with Structured Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {BRANDING.navigationGroups.map((group) => (
            <div key={group.group}>
              <div className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {group.group}
              </div>

              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const isStatus = item.id === 'status';

                  return (
                    <button
                      key={item.id}
                      id={`nav-item-${item.id}`}
                      onClick={() => {
                        onSelectTab(item.id as NavigationTab);
                        onCloseMobile();
                      }}
                      className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                          : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`${
                            isActive ? 'text-white' : 'text-slate-400 group-hover:text-emerald-400'
                          }`}
                        >
                          {getIcon(item.icon)}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? 'bg-emerald-700/80 text-white'
                              : isStatus
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}

          {/* Workspace Data Status */}
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-medium">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                Workspace Data
              </span>
              <span className="rounded bg-emerald-500/10 px-1.5 py-0.2 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                P05 Read-Only
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-400">
              Bounded range readers active. Zero write exposure across entire platform.
            </p>
          </div>
        </div>

        {/* Bottom User / Quick Info */}
        <div className="border-t border-slate-800/80 bg-slate-900/40 p-3">
          <button
            onClick={() => onSelectTab('status')}
            className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors ${
              activeTab === 'status' ? 'bg-slate-800/80' : 'hover:bg-slate-900'
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                Sys
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">System Diagnostics</div>
                <div className="text-[10px] text-slate-400">
                  {health ? 'Node Runtime 200 OK' : 'Connecting...'}
                </div>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
}
