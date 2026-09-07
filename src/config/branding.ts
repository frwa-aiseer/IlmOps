/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { NicheConfig, TargetAccount, Platform, ContentType } from '../types/ilmops.ts';

export const BRANDING = {
  name: 'IlmOps',
  subtitle: 'Research-to-Publish Operations',
  tagline: 'Internal research-to-publishing content operations platform',
  version: '0.3.0',
  meaning: 'Ilm (Knowledge) + Ops (Operations) — Turning high-value multi-niche research into targeted, peer-reviewed content variants across technical brands.',
  organization: 'ALLIN',

  colors: {
    navyDark: '#0f172a',      // Primary deep charcoal / navy
    navyMedium: '#1e293b',    // Secondary surface / sidebar
    navyLight: '#334155',     // Muted borders and text
    emerald: '#059669',       // Brand accent green
    emeraldLight: '#ecfdf5',  // Emerald subtle background
    emeraldBorder: '#a7f3d0', // Emerald borders
    emeraldDark: '#047857',   // Hover state
    gold: '#d97706',          // Sand / Muted warm gold supporting accent
    goldLight: '#fffbeb',     // Subtle gold pill bg
    goldBorder: '#fde68a',    // Gold highlight border
    canvas: '#f8fafc',        // Modern off-white / ivory canvas
    surface: '#ffffff',       // Card white
    borderSubtle: '#e2e8f0',  // Divider borders
  },

  navigationGroups: [
    {
      group: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', badge: null },
        { id: 'my_work', label: 'My Work Today', icon: 'CheckCircle2', badge: '5' },
      ],
    },
    {
      group: 'Research',
      items: [
        { id: 'research_inbox', label: 'Research Inbox', icon: 'BookOpen', badge: '12' },
      ],
    },
    {
      group: 'Content',
      items: [
        { id: 'content_jobs', label: 'Content Jobs', icon: 'Layers', badge: '8' },
        { id: 'production_board', label: 'Production Board', icon: 'Kanban', badge: '6' },
      ],
    },
    {
      group: 'Quality',
      items: [
        { id: 'qc', label: 'Technical QC', icon: 'CheckSquare', badge: '3' },
      ],
    },
    {
      group: 'Publishing',
      items: [
        { id: 'publishing', label: 'Publishing', icon: 'Send', badge: '4' },
        { id: 'analytics', label: 'Analytics', icon: 'BarChart3', badge: 'Demo' },
      ],
    },
    {
      group: 'Admin & Diagnostics',
      items: [
        { id: 'live_data_preview', label: 'Live Data Preview', icon: 'Database', badge: 'Real' },
        { id: 'status', label: 'System Status', icon: 'Cpu', badge: 'Live' },
        { id: 'activity_log', label: 'Activity Log', icon: 'Clock', badge: null },
        { id: 'settings', label: 'Settings', icon: 'Sliders', badge: null },
      ],
    },
  ] as const,
};

export type NavigationTab =
  | 'dashboard'
  | 'my_work'
  | 'research_inbox'
  | 'content_jobs'
  | 'production_board'
  | 'qc'
  | 'publishing'
  | 'analytics'
  | 'settings'
  | 'activity_log'
  | 'status'
  | 'live_data_preview';

export const NICHES_CONFIG: NicheConfig[] = [
  {
    id: 'ai_data',
    label: 'AI & Data Engineering',
    description: 'Autonomous systems, reasoning models, data engineering, and enterprise AI architecture.',
    subcategories: [
      'RAG',
      'AI Agents',
      'Agentic AI',
      'LLM Engineering',
      'Data Engineering',
      'AI Architecture',
      'MLOps / LLMOps',
      'Vector Systems',
      'AI Security',
      'Model Evaluation',
    ],
  },
  {
    id: 'electrical_energy',
    label: 'Electrical Design, Estimation & Energy',
    description: 'High-voltage/low-voltage engineering, power systems, cable sizing, estimation, and renewable storage.',
    subcategories: [
      'Electrical Design',
      'Power Systems',
      'Protection & Coordination',
      'Cable Engineering',
      'Electrical Estimation',
      'BOQ / MTO / QTO',
      'Tendering & Cost Engineering',
      'Testing & Commissioning',
      'Energy Efficiency',
      'Solar PV',
      'Battery Energy Storage',
      'Standards & Codes',
    ],
  },
];

export const TARGET_ACCOUNTS_MAP: Record<TargetAccount, { platform: Platform; owner: string }> = {
  'PYCODEAI-LINKEDIN': { platform: 'LinkedIn', owner: 'Amara Akhtar' },
  'PYCODEAI-X': { platform: 'X', owner: 'Amara Akhtar' },
  'PYCODEAI-FACEBOOK': { platform: 'Facebook', owner: 'Amara Akhtar' },
  'PYCODEAI-INSTAGRAM': { platform: 'Instagram', owner: 'Amara Akhtar' },
  'FARWA-LINKEDIN': { platform: 'LinkedIn', owner: 'Farwa Jafar' },
  'FARWA-X': { platform: 'X', owner: 'Farwa Jafar' },
  'MUNEEB-LINKEDIN': { platform: 'LinkedIn', owner: 'Muhammad Moneeb Akhtar' },
  'MUNEEB-X': { platform: 'X', owner: 'Muhammad Moneeb Akhtar' },
  'MUNEEB-INSTAGRAM': { platform: 'Instagram', owner: 'Muhammad Moneeb Akhtar' },
};

export const CONTENT_TYPES: ContentType[] = [
  'Infographic',
  'Carousel',
  'Presentation / PDF Deck',
  'LinkedIn Post',
  'X Thread',
  'Short Video',
  'Technical Blog',
  'Explainer Diagram',
  'Calculation Walkthrough',
  'Engineering Checklist',
  'Comparison Chart',
  'Case Study Breakdown',
  'Quiz',
  'Newsletter',
];

export const TEAM_MEMBERS = [
  {
    name: 'Muhammad Moneeb Akhtar',
    role: 'Admin / Reviewer / Publishing Oversight',
    avatar: 'MA',
    email: 'eng.moneeb@jadwaa.com',
    focusArea: 'Architecture, Technical QC & Strategic Oversight',
  },
  {
    name: 'Farwa Jafar',
    role: 'Research Specialist',
    avatar: 'FJ',
    email: null,
    focusArea: 'AI & Data Engineering Research Inflow',
  },
  {
    name: 'Munir',
    role: 'Research Specialist',
    avatar: 'MN',
    email: null,
    focusArea: 'Electrical Design, Estimation & Energy',
  },
  {
    name: 'Amara Akhtar',
    role: 'Production / Publishing / Analytics',
    avatar: 'AA',
    email: null,
    focusArea: 'Visual Asset Production & Multi-Channel Distribution',
  },
];
