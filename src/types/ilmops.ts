/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NicheId = 'ai_data' | 'electrical_energy';

export interface NicheConfig {
  id: NicheId;
  label: string;
  description: string;
  subcategories: string[];
}

export type ReviewDecision = 'pending_review' | 'approved' | 'held' | 'rejected';

export type TechnicalDepth = 'Fundamental' | 'Intermediate' | 'Advanced' | 'Expert';

export type ProductionPotential = 'High' | 'Medium' | 'Low';

export interface ResearchSource {
  id: string;
  urlKey: string; // Linking key to ContentJob.sourceUrlKey
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
    credibility: number; // 0-100 (or 1-5 from sheet)
    novelty: number;     // 0-100 (or 1-5 from sheet)
    contentValue: number; // 0-100 (or 1-5 from sheet)
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
  openSourceUrl?: string;
  urlStatus?: string;

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
  | 'Ready to Publish';

export type QCStatus = 'Not Started' | 'Pending Review' | 'Changes Requested' | 'Approved';

export type PublishingStatus = 'Unscheduled' | 'Scheduled' | 'Staged' | 'Published';

export interface ThreePromptSet {
  googleLLMProductionPrompt: string;
  chatGPTAssetFinalizationPrompt: string;
  socialCopyPrompt: string;
}

export interface ContentJob {
  id: string; // e.g. CNT-0028-01 (Job ID)
  sourceUrlKey: string; // Canonical link to ResearchSource.urlKey
  sourceId: string;
  sourceNiche?: string;
  sourceTitle: string;
  sourceType?: string;
  sourceFinalUrl?: string;
  targetAccount: TargetAccount;
  platform: Platform;
  contentType: ContentType;
  variantLabel?: string;
  producer: string;
  qcReviewer: string;
  publishingOwner: string;
  productionStatus: ProductionStatus;
  qcStatus: QCStatus;
  qcNotes?: string;
  publishingStatus: PublishingStatus;
  lastUpdated: string;
  dueDeadline: string;
  wordCount: number;
  targetLength: number;
  notes?: string;
  prompts: ThreePromptSet;

  // Real APP_Content_Jobs integration fields
  draftAssetLink?: string;
  finalAssetLink?: string;
  finalSocialCopy?: string;
  productionStart?: string;
  productionComplete?: string;
  scheduledDate?: string;
  publishedDate?: string;
  publishedPostUrl?: string;
  impressions?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  followersGained?: number;
  leads?: number;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export type {
  AppUser,
  BrandProfile,
  ContentTypeConfig,
  ListConfig,
  SheetAccessMode,
  SheetSchemaDefinition,
  WorkbookSchemaManifest,
  HeaderValidationResult,
} from '../../shared/contracts/contentOps.ts';

export interface TeamMember {
  name: string;
  role: string;
  avatar: string;
  email: string;
  focusArea: string;
}

export interface MyWorkTask {
  id: string;
  assignee: string;
  taskTitle: string;
  roleCategory: 'Research Review' | 'Production' | 'Asset Finalization' | 'Technical QC' | 'Publishing';
  priority: 'P1' | 'P2' | 'P3';
  targetItem: string;
  due: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}
