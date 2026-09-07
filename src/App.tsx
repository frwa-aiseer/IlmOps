/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { api, ClientApiError } from './api/client.ts';
import type { HealthResponse } from '../shared/types.ts';
import { BRANDING, NavigationTab } from './config/branding.ts';
import { Sidebar } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';

// Views
import { DashboardView } from './components/views/DashboardView.tsx';
import { MyWorkView } from './components/views/MyWorkView.tsx';
import { ResearchInboxView } from './components/views/ResearchInboxView.tsx';
import { ContentJobsView } from './components/views/ContentJobsView.tsx';
import { ProductionView } from './components/views/ProductionView.tsx';
import { TechnicalQCView } from './components/views/TechnicalQCView.tsx';
import { PublishingView } from './components/views/PublishingView.tsx';
import { AnalyticsView } from './components/views/AnalyticsView.tsx';
import { ActivityLogView } from './components/views/ActivityLogView.tsx';
import { SettingsView } from './components/views/SettingsView.tsx';
import { SystemStatusView } from './components/views/SystemStatusView.tsx';
import { LiveDataPreviewView } from './components/views/LiveDataPreviewView.tsx';
import { DemoDataBanner } from './components/common/DemoDataBanner.tsx';

// Modals
import { AddSourceModal } from './components/modals/AddSourceModal.tsx';
import { SourceDetailModal } from './components/modals/SourceDetailModal.tsx';
import { CreateContentVariantModal } from './components/modals/CreateContentVariantModal.tsx';
import { PromptModal } from './components/modals/PromptModal.tsx';

// Domain Types & Mock Data
import {
  ResearchSource,
  ContentJob,
  ReviewDecision,
  ProductionStatus,
} from './types/ilmops.ts';
import { MOCK_RESEARCH_SOURCES, MOCK_CONTENT_JOBS } from './data/mockData.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary Domain State: Sources & Jobs
  const [sources, setSources] = useState<ResearchSource[]>(MOCK_RESEARCH_SOURCES);
  const [contentJobs, setContentJobs] = useState<ContentJob[]>(MOCK_CONTENT_JOBS);

  // Modal States
  const [isAddSourceModalOpen, setIsAddSourceModalOpen] = useState(false);
  const [selectedSourceForDetail, setSelectedSourceForDetail] = useState<ResearchSource | null>(null);
  const [isCreateVariantModalOpen, setIsCreateVariantModalOpen] = useState(false);
  const [variantSourceTarget, setVariantSourceTarget] = useState<ResearchSource | undefined>(undefined);

  // Prompt Modal State (Three-Prompt Model)
  const [promptModalData, setPromptModalData] = useState<{
    isOpen: boolean;
    title: string;
    type: 'Google LLM Production' | 'ChatGPT Asset Finalization' | 'Social Copy';
    body: string;
    jobId: string;
    targetAccount: string;
  }>({
    isOpen: false,
    title: '',
    type: 'Google LLM Production',
    body: '',
    jobId: '',
    targetAccount: '',
  });

  // Live Node.js runtime health state (preserves baseline architecture)
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Global Notification
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const loadHealth = async () => {
    setLoadingHealth(true);
    setFetchError(null);
    try {
      const data = await api.getHealth();
      setHealth(data);
      setLastChecked(new Date());
    } catch (err: unknown) {
      if (err instanceof ClientApiError) {
        setFetchError(`[${err.code}] ${err.message}`);
      } else if (err instanceof Error) {
        setFetchError(err.message);
      } else {
        setFetchError('Failed to fetch server health status');
      }
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  // Handlers for Sources
  const handleAddSource = (newSource: ResearchSource) => {
    setSources((prev) => [newSource, ...prev]);
    showNotification(`Added new research source: "${newSource.title}" (${newSource.id})`);
  };

  const handleReviewDecision = (sourceId: string, decision: ReviewDecision, reviewer: string) => {
    setSources((prev) =>
      prev.map((s) => {
        if (s.id !== sourceId) return s;
        return {
          ...s,
          reviewDecision: decision,
          reviewedBy: reviewer,
          reviewedAt: 'Just now',
        };
      })
    );

    const decisionLabel =
      decision === 'approved' ? 'Approved' : decision === 'held' ? 'Placed on Hold' : 'Rejected';
    showNotification(`Source ${sourceId} marked as ${decisionLabel} by ${reviewer}.`);
  };

  // Handlers for Content Jobs
  const handleCreateContentJob = (newJob: ContentJob) => {
    setContentJobs((prev) => [newJob, ...prev]);
    showNotification(
      `Generated Content Job ${newJob.id} (${newJob.targetAccount} • ${newJob.contentType}) from source ${newJob.sourceId}!`
    );
  };

  const handleAdvanceProductionStage = (jobId: string, nextStage: ProductionStatus) => {
    setContentJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, productionStatus: nextStage, lastUpdated: 'Just now' } : j))
    );
    showNotification(`Job ${jobId} moved to stage "${nextStage}"`);
  };

  const handleOpenPromptModal = (
    title: string,
    type: 'Google LLM Production' | 'ChatGPT Asset Finalization' | 'Social Copy',
    body: string,
    jobId: string,
    targetAccount: string
  ) => {
    setPromptModalData({
      isOpen: true,
      title,
      type,
      body,
      jobId,
      targetAccount,
    });
  };

  const handleOpenCreateVariant = (source?: ResearchSource) => {
    setVariantSourceTarget(source);
    setIsCreateVariantModalOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-slate-50/70 font-sans text-slate-900 antialiased selection:bg-emerald-100 selection:text-emerald-900">
      {/* Left Sidebar Shell */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        health={health}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header (Clean, no infrastructure noise, consistent + Add Source button) */}
        <Header
          activeTab={activeTab}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onSelectTab={setActiveTab}
          onAddSourceClick={() => setIsAddSourceModalOpen(true)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Global Toast Notification */}
        {notification && (
          <div className="mx-4 sm:mx-6 mt-4 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900 shadow-xs animate-fade-in">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-emerald-700 hover:text-emerald-900 ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Dynamic Page Views */}
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8 max-w-7xl w-full mx-auto">
          {/* Tasteful Demo Data Banner on Mock Views (Requirement 13) */}
          {[
            'dashboard',
            'my_work',
            'research_inbox',
            'content_jobs',
            'production_board',
            'qc',
            'publishing',
            'analytics',
          ].includes(activeTab) && (
            <DemoDataBanner
              onNavigateToLivePreview={setActiveTab}
              className="mb-6"
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              sources={sources}
              contentJobs={contentJobs}
              onNavigate={setActiveTab}
              onAddSourceClick={() => setIsAddSourceModalOpen(true)}
              onOpenCreateVariant={handleOpenCreateVariant}
            />
          )}

          {activeTab === 'my_work' && (
            <MyWorkView
              onNavigate={setActiveTab}
              onOpenSourceById={(id) => {
                const s = sources.find((src) => src.id === id);
                if (s) setSelectedSourceForDetail(s);
              }}
            />
          )}

          {activeTab === 'research_inbox' && (
            <ResearchInboxView
              sources={sources}
              contentJobs={contentJobs}
              onOpenSourceDetail={(source) => setSelectedSourceForDetail(source)}
              onOpenCreateVariant={(source) => handleOpenCreateVariant(source)}
              onUpdateDecision={(sourceId, decision) =>
                handleReviewDecision(sourceId, decision, 'Muhammad Moneeb Akhtar')
              }
              onAddSourceClick={() => setIsAddSourceModalOpen(true)}
            />
          )}

          {activeTab === 'content_jobs' && (
            <ContentJobsView
              contentJobs={contentJobs}
              sources={sources}
              onOpenCreateVariant={handleOpenCreateVariant}
              onOpenSourceDetail={setSelectedSourceForDetail}
              onOpenPromptModal={handleOpenPromptModal}
            />
          )}

          {activeTab === 'production_board' && (
            <ProductionView
              contentJobs={contentJobs}
              sources={sources}
              onOpenCreateVariant={() => handleOpenCreateVariant()}
              onOpenPromptModal={handleOpenPromptModal}
              onAdvanceStage={handleAdvanceProductionStage}
            />
          )}

          {activeTab === 'qc' && (
            <TechnicalQCView
              contentJobs={contentJobs}
              onQCApproved={(job) => {
                setContentJobs((prev) =>
                  prev.map((j) =>
                    j.id === job.id
                      ? { ...j, qcStatus: 'Approved', productionStatus: 'Ready to Publish' }
                      : j
                  )
                );
              }}
            />
          )}

          {activeTab === 'publishing' && <PublishingView contentJobs={contentJobs} />}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'activity_log' && <ActivityLogView />}

          {activeTab === 'settings' && <SettingsView />}

          {activeTab === 'status' && (
            <SystemStatusView
              health={health}
              loading={loadingHealth}
              lastChecked={lastChecked}
              fetchError={fetchError}
              onRefresh={loadHealth}
            />
          )}

          {activeTab === 'live_data_preview' && <LiveDataPreviewView />}
        </main>

        {/* App Footer */}
        <footer className="border-t border-slate-200/80 bg-white py-4 px-6 text-xs text-slate-500">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-slate-800">{BRANDING.name}</span>
              <span>•</span>
              <span>{BRANDING.subtitle}</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                v{BRANDING.version}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Internal Content Operations Platform • React 19 + TypeScript + Express Node.js Runtime
            </div>
          </div>
        </footer>
      </div>

      {/* Modal 1: Add Source (+ Add Source) */}
      <AddSourceModal
        isOpen={isAddSourceModalOpen}
        onClose={() => setIsAddSourceModalOpen(false)}
        onAddSource={handleAddSource}
      />

      {/* Modal 2: Source Detail Modal (Review gates, subcategories, technical depth, linked variants) */}
      <SourceDetailModal
        isOpen={!!selectedSourceForDetail}
        source={selectedSourceForDetail}
        contentJobs={contentJobs}
        onClose={() => setSelectedSourceForDetail(null)}
        onUpdateDecision={(sourceId, decision) =>
          handleReviewDecision(sourceId, decision, 'Muhammad Moneeb Akhtar')
        }
        onOpenCreateVariant={(source) => {
          setSelectedSourceForDetail(null);
          handleOpenCreateVariant(source);
        }}
      />

      {/* Modal 3: Create Content Variant Modal (One source -> many content jobs) */}
      <CreateContentVariantModal
        isOpen={isCreateVariantModalOpen}
        source={variantSourceTarget || null}
        allSources={sources}
        onClose={() => {
          setIsCreateVariantModalOpen(false);
          setVariantSourceTarget(undefined);
        }}
        onCreateJob={handleCreateContentJob}
      />

      {/* Modal 4: Three-Prompt Model Modal (Google LLM, ChatGPT, Social Copy) */}
      <PromptModal
        isOpen={promptModalData.isOpen}
        onClose={() => setPromptModalData((prev) => ({ ...prev, isOpen: false }))}
        promptTitle={promptModalData.title}
        promptType={promptModalData.type}
        promptBody={promptModalData.body}
        jobId={promptModalData.jobId}
        targetAccount={promptModalData.targetAccount}
      />
    </div>
  );
}
