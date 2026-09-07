/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Filter,
  User,
  ExternalLink,
} from 'lucide-react';
import { MyWorkTask, ResearchSource, ContentJob } from '../../types/ilmops.ts';
import { MOCK_MY_WORK_TASKS } from '../../data/mockData.ts';
import { TEAM_MEMBERS, NavigationTab } from '../../config/branding.ts';

interface MyWorkViewProps {
  onNavigate: (tab: NavigationTab) => void;
  onOpenSourceById?: (sourceId: string) => void;
}

export function MyWorkView({ onNavigate, onOpenSourceById }: MyWorkViewProps) {
  const [tasks, setTasks] = useState<MyWorkTask[]>(MOCK_MY_WORK_TASKS);
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    if (assigneeFilter !== 'all' && t.assignee !== assigneeFilter) return false;
    return true;
  });

  const handleToggleStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus =
          t.status === 'Completed'
            ? 'Pending'
            : t.status === 'Pending'
            ? 'In Progress'
            : 'Completed';
        return { ...t, status: nextStatus };
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">My Work Today</h1>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              {filteredTasks.filter((t) => t.status !== 'Completed').length} Active Tasks
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Role-based operational tasks across source review, variant production, asset finalization, and technical QC.
          </p>
        </div>

        {/* Assignee Filter */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500 font-medium">Filter Member:</span>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-hidden"
          >
            <option value="all">All Team Members</option>
            {TEAM_MEMBERS.map((m) => (
              <option key={m.name} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Team Duty Allocation Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TEAM_MEMBERS.map((member) => {
          const memberTasks = tasks.filter((t) => t.assignee === member.name);
          const completedCount = memberTasks.filter((t) => t.status === 'Completed').length;

          return (
            <div
              key={member.name}
              onClick={() => setAssigneeFilter(member.name)}
              className={`rounded-xl border p-3.5 transition-all cursor-pointer ${
                assigneeFilter === member.name
                  ? 'border-emerald-500 bg-emerald-50/30 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 line-clamp-1">
                      {member.name}
                    </div>
                    <div className="text-[10px] text-slate-500 line-clamp-1">{member.role}</div>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between text-[11px] border-t border-slate-100 pt-2">
                <span className="text-slate-500">{member.focusArea.split('•')[0]}</span>
                <span className="font-semibold text-slate-700">
                  {completedCount}/{memberTasks.length} Done
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Operational Task List */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Daily Operational Checklist
          </span>
          <span className="text-[11px] text-slate-400">Click circle to update progress status</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4 text-xs hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => handleToggleStatus(task.id)}
                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border transition-colors ${
                    task.status === 'Completed'
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : task.status === 'In Progress'
                      ? 'border-amber-500 bg-amber-50 text-amber-600'
                      : 'border-slate-300 bg-white text-transparent hover:border-slate-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>

                <div>
                  <div
                    className={`font-semibold text-sm text-slate-900 ${
                      task.status === 'Completed' ? 'line-through text-slate-400' : ''
                    }`}
                  >
                    {task.taskTitle}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>
                      Assignee: <strong className="text-slate-700">{task.assignee}</strong>
                    </span>
                    <span>•</span>
                    <span className="font-mono font-bold text-indigo-700">
                      Target: {task.targetItem}
                    </span>
                    <span>•</span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-medium text-slate-700">
                      {task.roleCategory}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    task.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : task.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {task.status}
                </span>

                <span className="text-[11px] font-semibold text-amber-700">{task.due}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
