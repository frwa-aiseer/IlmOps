/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { NicheId, PriorityLevel, ReviewDecision, ProductionStatus, QCStatus, PublishingStatus } from '../../shared/contracts/contentOps.ts';

export interface PaginationOptions {
  page?: number;
  pageSize?: number;
  limit?: number;
  offset?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasMore: boolean;
  returnedCount: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
  gridCapacity?: number; // Sheet gridProperties capacity if known
  actualRecordCount: number; // Mapped non-empty row count
}

export interface SourceListOptions extends PaginationOptions {
  nicheId?: NicheId | 'all';
  reviewDecision?: ReviewDecision | 'all';
  priority?: PriorityLevel | 'all';
  sourceType?: string;
  search?: string;
  accessToken?: string;
  requireLive?: boolean;
}

export interface ContentJobFilters extends PaginationOptions {
  sourceUrlKey?: string;
  productionStatus?: ProductionStatus | 'all';
  qcStatus?: QCStatus | 'all';
  publishingStatus?: PublishingStatus | 'all';
  producer?: string;
  platform?: string;
  targetAccount?: string;
  search?: string;
  accessToken?: string;
  requireLive?: boolean;
}

export interface RepositoryContext {
  accessToken?: string;
}
