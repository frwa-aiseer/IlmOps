/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  NicheId,
  PriorityLevel,
  TechnicalDepth,
  ProductionPotential,
  ReviewDecision,
  ProductionStatus,
  QCStatus,
} from './contentOps.ts';

/**
 * Compact, safe projection of ResearchSource for the Live Data Preview.
 * Excludes raw spreadsheet row arrays, internal notes, and unauthorized secrets.
 */
export interface LiveResearchSourceCompact {
  id: string;
  title: string;
  nicheId: NicheId;
  nicheLabel: string;
  sourceType: string;
  publisherOrAuthor: string;
  sourceDomain: string;
  capturedDate: string;
  publishedDate: string;
  priority: PriorityLevel;
  scores: {
    credibility: number | null;
    novelty: number | null;
    contentValue: number | null;
  };
  reviewDecision: ReviewDecision;
  technicalDepth: TechnicalDepth;
  productionPotential: ProductionPotential;
  sourceUrl: string;
  canonicalUrl?: string;
  bestUrl: string | null;
  urlStatus: 'Valid' | 'Needs Verification';
  urlKey: string;
  hasUrlKey: boolean;
  // Safe Detail Preview (Read-Only Drawer)
  details: {
    technicalSummary?: string;
    keyTakeaways?: string[];
    whyItMatters?: string;
    targetAudience?: string;
    contentAngle?: string;
    recommendedFormat?: string;
  };
}

/**
 * Compact, safe projection of ContentJob for the Live Content Job Preview.
 * Strictly excludes:
 * - Production Prompt Snapshot
 * - Finalization Prompt Snapshot
 * - Social Copy Prompt Snapshot
 * - Final Social Copy
 */
export interface LiveContentJobCompact {
  id: string;
  sourceUrlKey: string;
  sourceTitle: string;
  targetAccount: string;
  platform: string;
  contentType: string;
  variantLabel?: string;
  assignedProducer?: string;
  qcReviewer?: string;
  publishingOwner?: string;
  productionStatus: ProductionStatus;
  qcStatus: QCStatus;
  scheduledDate?: string;
  publishedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Live Repository Health and Data Quality Diagnostic Report.
 * Explicitly separates ACTUAL POPULATED RECORD COUNTS from Google Sheets GRID CAPACITY.
 */
export interface LiveDataRepositoryHealth {
  researchSources: {
    aiCount: number;
    electricalCount: number;
    combinedCount: number;
    uniqueCount: number;
    aiGridCapacity: number | null;
    electricalGridCapacity: number | null;
  };
  contentJobs: {
    totalCount: number;
    orphanCount: number;
    gridCapacity: number | null;
  };
  brandProfiles: {
    activeCount: number;
    totalCount: number;
    gridCapacity: number | null;
  };
  contentTypes: {
    activeCount: number;
    totalCount: number;
    gridCapacity: number | null;
  };
  teamMembers: {
    activeCount: number;
    totalCount: number;
    gridCapacity: number | null;
  };
  manualSources: {
    totalCount: number;
    readyToQueueCount: number;
    gridCapacity: number | null;
  };
  activityLogs: {
    totalCount: number;
    gridCapacity: number | null;
  };
  quality: {
    duplicateUrlKeyCount: number;
    duplicateUrlKeys: string[];
    blankUrlKeyCount: number;
    invalidIncompleteSourceCount: number;
    orphanJobCount: number;
    manualReadyToQueueCount: number;
    malformedMappedRecordCount: number;
    status: 'Healthy' | 'Warning' | 'Error';
    issues: string[];
  };
  relationalFanOut: {
    hasMultiVariantSource: boolean;
    multiVariantExample: {
      sourceUrlKey: string;
      sourceTitle: string;
      niche: string;
      jobs: Array<{
        id: string;
        targetAccount: string;
        platform: string;
        contentType: string;
        variantLabel?: string;
        status: string;
      }>;
    } | null;
    message: string;
  };
  mode: 'live_workspace_read_only';
  dataOrigin: 'live-google-sheets';
  repositoryMode: 'live';
  authenticated: true;
  workbookIdSuffix: string;
  fetchedAt: string;
  originProof: LiveDataOriginProof;
  safetyGuarantee: string;
  lastAuditedAt: string;
}

export interface LiveDataOriginProof {
  dataOrigin: 'live-google-sheets';
  repositoryMode: 'live';
  authenticated: true;
  workbookIdSuffix: string;
  fetchedAt: string;
  sourceCount: number;
}

export interface LiveSourceListResponse {
  items: LiveResearchSourceCompact[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
    returnedCount: number;
  };
  actualRecordCount: number;
  mode: 'live_workspace_read_only';
  dataOrigin: 'live-google-sheets';
  repositoryMode: 'live';
  authenticated: true;
  workbookIdSuffix: string;
  fetchedAt: string;
  originProof: LiveDataOriginProof;
}

export interface LiveJobListResponse {
  items: LiveContentJobCompact[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasMore: boolean;
    returnedCount: number;
  };
  actualRecordCount: number;
  mode: 'live_workspace_read_only';
  dataOrigin: 'live-google-sheets';
  repositoryMode: 'live';
  authenticated: true;
  workbookIdSuffix: string;
  fetchedAt: string;
  originProof: LiveDataOriginProof;
}
