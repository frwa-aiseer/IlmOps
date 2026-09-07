/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ===========================================================================
// Core Domain Primitive Types
// ===========================================================================

export const SHEET_NAMES = {
  DASHBOARD: 'Dashboard',
  AI_CONTENT_QUEUE: 'AI_Content_Queue',
  ELECTRICAL_CONTENT_QUEUE: 'Electrical_Content_Queue',
  BRAND_PROFILES: 'Brand_Profiles',
  CONTENT_TYPES: 'Content_Types',
  TEAM_MEMBERS: 'Team_Members',
  LISTS_CONFIG: 'Lists_Config',
  MANUAL_SOURCE_ENTRY: 'Manual_Source_Entry',
  APP_CONTENT_JOBS: 'APP_Content_Jobs',
  APP_USERS: 'APP_Users',
  APP_ACTIVITY_LOG: 'APP_Activity_Log',
} as const;

export type SheetName = typeof SHEET_NAMES[keyof typeof SHEET_NAMES];

export type NicheId = 'ai_data' | 'electrical_energy';

export type PriorityLevel = 'P1' | 'P2' | 'P3';

export type ReviewDecision = 'pending_review' | 'approved' | 'held' | 'rejected' | 'pending' | 'hold';

export type TechnicalDepth = 'Fundamental' | 'Intermediate' | 'Advanced' | 'Expert' | 'Conceptual' | 'Deep Dive';

export type ProductionPotential = 'High' | 'Medium' | 'Low';

export type TargetAccount =
  | 'PYCODEAI-LINKEDIN'
  | 'PYCODEAI-X'
  | 'PYCODEAI-FACEBOOK'
  | 'PYCODEAI-INSTAGRAM'
  | 'FARWA-LINKEDIN'
  | 'FARWA-X'
  | 'MUNEEB-LINKEDIN'
  | 'MUNEEB-X'
  | 'MUNEEB-INSTAGRAM';

export type Platform = 'LinkedIn' | 'X' | 'Facebook' | 'Instagram';

export type ContentType =
  | 'Infographic'
  | 'Carousel'
  | 'Presentation / PDF Deck'
  | 'LinkedIn Post'
  | 'X Thread'
  | 'Short Video'
  | 'Technical Blog'
  | 'Explainer Diagram'
  | 'Calculation Walkthrough'
  | 'Engineering Checklist'
  | 'Comparison Chart'
  | 'Case Study Breakdown'
  | 'Quiz'
  | 'Newsletter';

export type ProductionStatus =
  | 'Assigned'
  | 'In Production'
  | 'Draft Ready'
  | 'Finalizing'
  | 'QC Review'
  | 'Ready to Publish'
  | 'Backlog';

export type QCStatus = 'Not Started' | 'Pending Review' | 'Changes Requested' | 'Approved';

export type PublishingStatus = 'Unscheduled' | 'Scheduled' | 'Staged' | 'Published';

export interface ThreePromptSet {
  googleLLMProductionPrompt: string;
  chatGPTAssetFinalizationPrompt: string;
  socialCopyPrompt: string;
}

// ===========================================================================
// 1. ResearchSource Entity Contract
// ===========================================================================
// Clean typed entity derived from the required source headers in AI_Content_Queue
// and Electrical_Content_Queue (which use Row 3 as header row).
// Links to ContentJob via: ResearchSource.urlKey === ContentJob.sourceUrlKey.
export interface ResearchSource {
  id: string; // e.g. 'SRC-AI-01'
  urlKey: string; // Primary URL Key linking to ContentJob.sourceUrlKey
  title: string;
  nicheId: NicheId;
  subcategory: string;
  sourceType:
    | 'ArXiv'
    | 'Industry Standard'
    | 'Technical Report'
    | 'Engineering Guide'
    | 'Vendor Whitepaper'
    | 'Code Repository'
    | 'Conference Paper';
  publisherOrAuthor: string;
  sourceDomain: string;
  sourceUrl: string;
  publishedDate: string;
  capturedDate: string;
  freshnessDays?: number;
  priority: 'P1' | 'P2' | 'P3';
  scores: {
    credibility: number; // 1-5 in Google Sheet (mapped to display 0-100 or 1-5)
    novelty: number;
    contentValue: number;
  };
  technicalDepth: TechnicalDepth;
  productionPotential: ProductionPotential;
  reviewDecision: ReviewDecision;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  canonicalUrl?: string;
  cleanUrl?: string;
  verifiedUrl?: string;
  urlStatus?: string;
  openSourceUrl?: string;
  isDeduplicationEligible?: boolean;

  // Progressive Disclosure Details
  details: {
    technicalSummary: string;
    keyFindings: string[];
    whyItMatters: string;
    contentAngle: string;
    recommendedFormat: string;
    targetAudience: string;
    aiSuggestions?: string;
  };
}

// ===========================================================================
// 2. ContentJob Entity Contract
// ===========================================================================
// Real operational entity for multi-account / multi-platform production variants.
// Corresponds to APP_Content_Jobs (Row 1 header row).
// Multiple ContentJobs reference the same ResearchSource through: sourceUrlKey.
export interface ContentJob {
  id: string; // Job ID (e.g. 'CNT-0028-01')
  sourceUrlKey: string; // Mandatory link to ResearchSource.urlKey
  sourceId?: string; // Logical source ID (e.g. 'SRC-AI-01')
  sourceNiche?: string;
  sourceTitle: string;
  sourceType?: string;
  sourceFinalUrl?: string;
  targetAccount: TargetAccount;
  platform: Platform;
  contentType: ContentType;
  variantLabel?: string;
  priority: 'P1' | 'P2' | 'P3';
  producer: string; // Assigned Producer
  qcReviewer: string; // QC Reviewer
  publishingOwner: string; // Publishing Owner
  productionStatus: ProductionStatus; // Job Status
  qcStatus: QCStatus;
  qcNotes?: string;
  publishingStatus: PublishingStatus;
  lastUpdated: string;
  dueDeadline: string;
  wordCount: number;
  targetLength: number;
  notes?: string;
  prompts: ThreePromptSet;

  // Downstream Asset & Publication Lifecycle Fields
  draftAssetLink?: string;
  finalAssetLink?: string;
  finalSocialCopy?: string;
  productionStart?: string;
  productionComplete?: string;
  scheduledDate?: string;
  publishedDate?: string;
  publishedPostUrl?: string;

  // Analytics & Engagement Metrics
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  followersGained?: number;
  leads?: number;
  metrics?: {
    impressions?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    clicks?: number;
    followersGained?: number;
    leads?: number;
  };

  // Audit Fields
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

// ===========================================================================
// 3. AppUser Entity Contract
// ===========================================================================
// Corresponds to APP_Users (Row 1 header row).
// Note: Google Account emails must only be populated when real sheet data contains one.
export interface AppUser {
  email: string | null; // Email / Google Account (null if not in sheet)
  fullName: string;
  primaryRole: string;
  researchAccess: boolean;
  productionAccess: boolean;
  qcAccess: boolean;
  publishingAnalyticsAccess: boolean;
  adminAccess: boolean;
  active: boolean;
  notes?: string;
}

export interface ManualSourceEntry {
  capturedDate?: string;
  publishedDate?: string;
  freshnessDays?: number;
  niche: string;
  category: string;
  subtopicKeywords?: string;
  sourceType: string;
  sourceTitle: string;
  publisherAuthor?: string;
  canonicalUrl?: string;
  urlKey: string;
  sourceDomain?: string;
  technicalSummary?: string;
  keyFindings?: string;
  whyItMatters?: string;
  contentAngleHook?: string;
  recommendedFormat?: string;
  targetAudience?: string;
  credibilityScore?: number;
  noveltyScore?: number;
  contentValueScore?: number;
  priority?: string;
  status?: string;
  assignedTo?: string;
  contentAssetLink?: string;
  notes?: string;
  manualEntryStatus?: string;
  enteredBy?: string;
  entryDate?: string;
  queueRouting?: string;
  masterMirror?: string;
}

// ===========================================================================
// 4. Configuration Entity Contracts
// ===========================================================================
// Contracts for Brand_Profiles, Content_Types, Team_Members, Lists_Config.
// Mapped to exact live headers in the workbook.

export interface BrandProfile {
  id: string; // Account ID (e.g. 'PYCODEAI-LINKEDIN', 'FARWA-LINKEDIN')
  displayName: string;
  brandPersona: string;
  platform: Platform | string;
  niche: string;
  primaryColors?: string;
  secondaryColors?: string;
  typographyFonts?: string;
  visualStyle?: string;
  voiceTone?: string;
  audience?: string;
  brandingSignature?: string;
  brandAssetLink?: string;
  platformRules?: string;
  seoGeoHashtags?: string;
  finalizationRules?: string;
  active: boolean;
  // Backward compatibility alias properties
  accountName?: string;
  primaryOwner?: string;
  guidelines?: string;
  brandColors?: string[];
  notes?: string;
}

export interface ContentTypeConfig {
  contentType: string; // Content Type (e.g. 'Infographic', 'Carousel')
  googleLlmInstructions?: string; // Google LLM / NotebookLM Production Instructions
  chatGptFinalizationFocus?: string; // ChatGPT Finalization Focus
  preferredStructure?: string; // Preferred Structure
  typicalLength?: string; // Typical Length
  active: boolean;
  // Backward compatibility alias properties
  id?: string;
  name?: string;
  defaultPlatform?: Platform;
  targetLengthWords?: number;
  notes?: string;
}

export interface TeamMember {
  fullName: string;
  roles: string; // Role(s)
  active: boolean;
  notes?: string;
  // Backward compatibility alias properties
  name?: string;
  role?: string;
  avatar?: string;
  email?: string; // Always null unless explicitly present in sheet (No invented emails)
  focusArea?: string;
}

export interface ListsConfig {
  reviewDecision: string[];
  technicalDepth: string[];
  productionPotential: string[];
  productionStatus: string[];
  technicalQcStatus: string[];
  publishingStatus: string[];
  priorityOverride: string[];
  yesNo: string[];
}

// Backward-compatible individual list item contract
export interface ListConfig {
  listCategory: string;
  itemValue: string;
  displayLabel?: string;
  sortOrder?: number;
  active?: boolean;
}

export interface ActivityLog {
  timestamp: string;
  eventType: string;
  user: string;
  targetEntity: string;
  notes?: string;
}

// ===========================================================================
// 5. Schema & Header Validation Contracts
// ===========================================================================

export type SheetAccessMode = 'CONFIG_ONLY' | 'NO_EXTERNAL_ACCESS';

export interface SheetSchemaDefinition {
  sheetName: string;
  expectedHeaderRow: number; // 1-indexed row number in the spreadsheet
  entityType: string;
  accessMode: SheetAccessMode;
  requiredHeaders: readonly string[];
  description: string;
}

export interface WorkbookSchemaManifest {
  workbookTitle: string;
  spreadsheetId: string;
  locale: string;
  timezone: string;
  sheets: Record<string, SheetSchemaDefinition>;
}

export interface HeaderValidationResult {
  isValid: boolean;
  sheetName: string;
  headerRowIndex: number;
  totalColumns: number;
  headerMap: Map<string, number>;
  missingHeaders: string[];
  duplicateHeaders: string[];
  error?: string;
}

// ===========================================================================
// 6. Canonical Required Header Constants (Exact string matching)
// ===========================================================================

export const SOURCE_QUEUE_REQUIRED_HEADERS = [
  'Captured Date',
  'Published Date',
  'Freshness Days',
  'Niche',
  'Category',
  'Subtopic / Keywords',
  'Source Type',
  'Source Title',
  'Publisher / Author',
  'Canonical URL',
  'URL Key',
  'Source Domain',
  'Technical Summary',
  'Key Findings / Takeaways',
  'Why It Matters / Novelty',
  'Content Angle / Hook',
  'Recommended Format',
  'Target Audience',
  'Credibility Score (1-5)',
  'Novelty Score (1-5)',
  'Content Value Score (1-5)',
  'Priority',
  'Clean URL (Copy)',
  'Verified URL',
  'Open Source ↗',
  'URL Status',
  'Human Review Decision',
  'Technical Depth',
  'Production Potential',
  'Reviewed By',
  'Review Date',
] as const;

export const APP_CONTENT_JOBS_REQUIRED_HEADERS = [
  'Job ID',
  'Source URL Key',
  'Source Niche',
  'Source Title',
  'Source Type',
  'Source Final URL',
  'Target Account',
  'Platform',
  'Content Type',
  'Variant Label',
  'Priority',
  'Assigned Producer',
  'QC Reviewer',
  'Publishing Owner',
  'Job Status',
  'Production Prompt Snapshot',
  'Draft Asset Link',
  'Finalization Prompt Snapshot',
  'Final Asset Link',
  'Social Copy Prompt Snapshot',
  'Final Social Copy',
  'QC Status',
  'QC Notes',
  'Production Start',
  'Production Complete',
  'Scheduled Date',
  'Published Date',
  'Published Post URL',
  'Impressions',
  'Likes / Reactions',
  'Comments',
  'Shares / Reposts',
  'Saves',
  'Clicks',
  'Followers Gained',
  'Leads / Enquiries',
  'Created By',
  'Created At',
  'Updated By',
  'Updated At',
] as const;

export const APP_USERS_REQUIRED_HEADERS = [
  'Email / Google Account',
  'Full Name',
  'Primary Role',
  'Research Access',
  'Production Access',
  'QC Access',
  'Publishing / Analytics Access',
  'Admin Access',
  'Active',
  'Notes',
] as const;

export const MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS = [
  'Captured Date',
  'Published Date',
  'Freshness Days',
  'Niche',
  'Category',
  'Subtopic / Keywords',
  'Source Type',
  'Source Title',
  'Publisher / Author',
  'Canonical URL',
  'URL Key',
  'Source Domain',
  'Technical Summary',
  'Key Findings / Takeaways',
  'Why It Matters / Novelty',
  'Content Angle / Hook',
  'Recommended Format',
  'Target Audience',
  'Credibility Score (1-5)',
  'Novelty Score (1-5)',
  'Content Value Score (1-5)',
  'Priority',
  'Status',
  'Assigned To',
  'Content Asset Link / Used In',
  'Notes',
  'Manual Entry Status',
  'Entered By',
  'Entry Date',
  'Queue Routing',
  'Master Mirror',
] as const;

export const BRAND_PROFILES_REQUIRED_HEADERS = [
  'Account ID',
  'Display Name',
  'Brand / Persona',
  'Platform',
  'Niche',
  'Primary Colors',
  'Secondary Colors',
  'Typography / Fonts',
  'Visual Style',
  'Voice / Tone',
  'Audience',
  'Branding Signature',
  'Brand Asset Link',
  'Platform Rules',
  'SEO / GEO / Hashtag Guidance',
  'Finalization / Editing Rules',
  'Active',
] as const;

export const CONTENT_TYPES_REQUIRED_HEADERS = [
  'Content Type',
  'Google LLM / NotebookLM Production Instructions',
  'ChatGPT Finalization Focus',
  'Preferred Structure',
  'Typical Length',
  'Active',
] as const;

export const TEAM_MEMBERS_REQUIRED_HEADERS = [
  'Full Name',
  'Role(s)',
  'Active',
  'Notes',
] as const;

export const LISTS_CONFIG_REQUIRED_HEADERS = [
  'Review Decision',
  'Technical Depth',
  'Production Potential',
  'Production Status',
  'Technical QC Status',
  'Publishing Status',
  'Priority Override',
  'Yes / No',
] as const;

export const APP_ACTIVITY_LOG_REQUIRED_HEADERS = [
  'Timestamp',
  'Event Type',
  'User',
  'Target Entity',
  'Notes',
] as const;

