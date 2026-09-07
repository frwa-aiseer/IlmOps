/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SOURCE_QUEUE_REQUIRED_HEADERS,
  APP_CONTENT_JOBS_REQUIRED_HEADERS,
  APP_USERS_REQUIRED_HEADERS,
  MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS,
  BRAND_PROFILES_REQUIRED_HEADERS,
  CONTENT_TYPES_REQUIRED_HEADERS,
  TEAM_MEMBERS_REQUIRED_HEADERS,
  LISTS_CONFIG_REQUIRED_HEADERS,
  APP_ACTIVITY_LOG_REQUIRED_HEADERS,
  ResearchSource,
  ContentJob,
  AppUser,
} from '../../shared/contracts/contentOps.ts';

// ===========================================================================
// Real Test Fixtures for Spreadsheet Header Rows
// (Zero Google API calls - Pure local test representations)
// ===========================================================================

/**
 * SOURCE QUEUE HEADER ROW FIXTURE (AI_Content_Queue & Electrical_Content_Queue)
 * Expected at Row 3. Includes the required 31 headers plus sample legacy downstream columns.
 */
export const SOURCE_QUEUE_HEADER_ROW_FIXTURE: string[] = [
  ...SOURCE_QUEUE_REQUIRED_HEADERS,
  // Sample legacy operational downstream columns (representing the 63-column legacy layout)
  'Target Account',
  'Platform',
  'Content Type',
  'Assigned Producer',
  'Production Status',
  'Production Prompt',
  'Draft Asset Link',
  'Final Asset Link',
  'QC Reviewer',
  'QC Status',
  'Publish Date',
  'Post URL',
  'Impressions',
  'Engagements',
];

/**
 * MANUAL_SOURCE_ENTRY HEADER ROW FIXTURE
 * Expected at Row 3. Dedicated manual reviewer staging schema.
 */
export const MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE: string[] = [
  ...MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS,
];

/**
 * BRAND_PROFILES HEADER ROW FIXTURE
 * Expected at Row 1.
 */
export const BRAND_PROFILES_HEADER_ROW_FIXTURE: string[] = [
  ...BRAND_PROFILES_REQUIRED_HEADERS,
];

/**
 * CONTENT_TYPES HEADER ROW FIXTURE
 * Expected at Row 1.
 */
export const CONTENT_TYPES_HEADER_ROW_FIXTURE: string[] = [
  ...CONTENT_TYPES_REQUIRED_HEADERS,
];

/**
 * TEAM_MEMBERS HEADER ROW FIXTURE
 * Expected at Row 1.
 */
export const TEAM_MEMBERS_HEADER_ROW_FIXTURE: string[] = [
  ...TEAM_MEMBERS_REQUIRED_HEADERS,
];

/**
 * LISTS_CONFIG HEADER ROW FIXTURE
 * Expected at Row 1.
 */
export const LISTS_CONFIG_HEADER_ROW_FIXTURE: string[] = [
  ...LISTS_CONFIG_REQUIRED_HEADERS,
];

/**
 * APP_ACTIVITY_LOG HEADER ROW FIXTURE
 * Expected at Row 1.
 */
export const APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE: string[] = [
  ...APP_ACTIVITY_LOG_REQUIRED_HEADERS,
];

/**
 * APP_CONTENT_JOBS HEADER ROW FIXTURE
 * Expected at Row 1. All 40 canonical fields in exact column order.
 */
export const APP_CONTENT_JOBS_HEADER_ROW_FIXTURE: string[] = [
  ...APP_CONTENT_JOBS_REQUIRED_HEADERS,
];

/**
 * APP_USERS HEADER ROW FIXTURE
 * Expected at Row 1. All 10 canonical access & role fields.
 */
export const APP_USERS_HEADER_ROW_FIXTURE: string[] = [
  ...APP_USERS_REQUIRED_HEADERS,
];

// ===========================================================================
// Real Test Fixtures for Data Entities & Relationships
// ===========================================================================

/**
 * Canonical Research Source Fixture
 * Demonstrates: URL Key = 'example-source-key'
 */
export const EXAMPLE_RESEARCH_SOURCE_FIXTURE: ResearchSource = {
  id: 'SRC-AI-01',
  urlKey: 'example-source-key',
  title: 'Agentic Context Window Compaction: KV Cache Optimization & Retrieval Routing',
  nicheId: 'ai_data',
  subcategory: 'Agentic AI',
  sourceType: 'ArXiv',
  publisherOrAuthor: 'MIT CSAIL & Stanford HAI',
  sourceDomain: 'arxiv.org',
  sourceUrl: 'https://arxiv.org/abs/2502.demo-kv',
  publishedDate: '2026-09-02',
  capturedDate: '2026-09-04',
  freshnessDays: 2,
  priority: 'P1',
  scores: {
    credibility: 5,
    novelty: 5,
    contentValue: 5,
  },
  technicalDepth: 'Advanced',
  productionPotential: 'High',
  reviewDecision: 'approved',
  reviewedBy: 'Farwa Jafar',
  reviewedAt: '2026-09-04',
  reviewNotes: 'Verified benchmark data. Outstanding cross-brand potential.',
  canonicalUrl: 'https://arxiv.org/abs/2502.demo-kv',
  cleanUrl: 'https://arxiv.org/abs/2502.demo-kv',
  verifiedUrl: 'https://arxiv.org/abs/2502.demo-kv',
  urlStatus: 'Valid',
  details: {
    technicalSummary: 'Demonstrates speculative attention pruning in 128k context windows.',
    keyFindings: [
      'Static truncation causes hallucination.',
      'Dynamic token scoring eliminates 70% of scratchpad tokens.',
    ],
    whyItMatters: 'Enterprise RAG systems bottleneck on inference memory.',
    contentAngle: 'Why long-context models waste 70% of tokens.',
    recommendedFormat: 'Infographic + Carousel Deck',
    targetAudience: 'AI Systems Architects, MLOps Leads',
  },
};

/**
 * Content Job Variant 1: PycodeAI LinkedIn Infographic
 * Linked via: Source URL Key = 'example-source-key'
 */
export const LINKED_JOB_VARIANT_1_FIXTURE: ContentJob = {
  id: 'CNT-0028-01',
  sourceUrlKey: 'example-source-key',
  sourceId: 'SRC-AI-01',
  sourceNiche: 'AI & Data Engineering',
  sourceTitle: 'Agentic Context Window Compaction: KV Cache Optimization & Retrieval Routing',
  sourceType: 'ArXiv',
  sourceFinalUrl: 'https://arxiv.org/abs/2502.demo-kv',
  targetAccount: 'PYCODEAI-LINKEDIN',
  platform: 'LinkedIn',
  contentType: 'Infographic',
  variantLabel: 'PycodeAI Infographic Deck',
  priority: 'P1',
  producer: 'Amara Akhtar',
  qcReviewer: 'Muhammad Moneeb Akhtar',
  publishingOwner: 'Amara Akhtar',
  productionStatus: 'In Production',
  qcStatus: 'Not Started',
  publishingStatus: 'Unscheduled',
  lastUpdated: '2026-09-06T12:00:00Z',
  dueDeadline: '2026-09-07T16:00:00Z',
  wordCount: 380,
  targetLength: 450,
  prompts: {
    googleLLMProductionPrompt: 'Generate clear infographic copy for PycodeAI LinkedIn audience.',
    chatGPTAssetFinalizationPrompt: 'Format D2/Mermaid diagrams and callout pill vectors.',
    socialCopyPrompt: 'Hook: Most multi-agent systems waste 70% of their GPU budget.',
  },
};

/**
 * Content Job Variant 2: Farwa Jafar LinkedIn Carousel
 * Linked via: Source URL Key = 'example-source-key'
 */
export const LINKED_JOB_VARIANT_2_FIXTURE: ContentJob = {
  id: 'CNT-0028-02',
  sourceUrlKey: 'example-source-key',
  sourceId: 'SRC-AI-01',
  sourceNiche: 'AI & Data Engineering',
  sourceTitle: 'Agentic Context Window Compaction: KV Cache Optimization & Retrieval Routing',
  sourceType: 'ArXiv',
  sourceFinalUrl: 'https://arxiv.org/abs/2502.demo-kv',
  targetAccount: 'FARWA-LINKEDIN',
  platform: 'LinkedIn',
  contentType: 'Carousel',
  variantLabel: 'Farwa Practitioner Carousel',
  priority: 'P1',
  producer: 'Amara Akhtar',
  qcReviewer: 'Muhammad Moneeb Akhtar',
  publishingOwner: 'Amara Akhtar',
  productionStatus: 'Draft Ready',
  qcStatus: 'Pending Review',
  publishingStatus: 'Unscheduled',
  lastUpdated: '2026-09-06T14:30:00Z',
  dueDeadline: '2026-09-08T18:00:00Z',
  wordCount: 680,
  targetLength: 750,
  prompts: {
    googleLLMProductionPrompt: 'Draft 8 carousel slides in personal technical voice for Farwa Jafar.',
    chatGPTAssetFinalizationPrompt: 'Polish slide headlines to stay under 7 words.',
    socialCopyPrompt: 'Headline: Context window size is a vanity metric; context efficiency is what counts.',
  },
};

/**
 * Canonical App Users Fixture (Representing the 4 real team members)
 * Strict rule: No invented emails!
 */
export const APP_USERS_FIXTURES: AppUser[] = [
  {
    email: 'eng.moneeb@jadwaa.com',
    fullName: 'Muhammad Moneeb Akhtar',
    primaryRole: 'Admin & Lead Reviewer',
    researchAccess: true,
    productionAccess: true,
    qcAccess: true,
    publishingAnalyticsAccess: true,
    adminAccess: true,
    active: true,
    notes: 'Primary engineering consultant and system administrator.',
  },
  {
    email: null, // No invented email
    fullName: 'Farwa Jafar',
    primaryRole: 'AI Research Lead',
    researchAccess: true,
    productionAccess: true,
    qcAccess: true,
    publishingAnalyticsAccess: true,
    adminAccess: false,
    active: true,
    notes: 'Specialist in Agentic AI, RAG architectures, and evaluation.',
  },
  {
    email: null, // No invented email
    fullName: 'Munir',
    primaryRole: 'Electrical Systems Lead',
    researchAccess: true,
    productionAccess: true,
    qcAccess: true,
    publishingAnalyticsAccess: false,
    adminAccess: false,
    active: true,
    notes: 'Specialist in IEC standards, substation engineering, and tender BOQs.',
  },
  {
    email: null, // No invented email
    fullName: 'Amara Akhtar',
    primaryRole: 'Content Production Lead',
    researchAccess: false,
    productionAccess: true,
    qcAccess: false,
    publishingAnalyticsAccess: true,
    adminAccess: false,
    active: true,
    notes: 'Multi-platform content production and asset formatting.',
  },
];
