/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ContentJob,
  SHEET_NAMES,
  APP_CONTENT_JOBS_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';
import { WORKBOOK_CONFIG, SHEET_SCHEMA_DEFINITIONS } from '../config/contentOpsWorkbook.ts';
import { readOnlyWorkspaceClient, ReadOnlyWorkspaceClient } from '../integrations/googleWorkspace/workspaceClient.ts';
import { validateSheetHeaders } from '../utils/headerMapping.ts';
import { mapRowToContentJob } from '../mappers/jobMapper.ts';
import {
  LINKED_JOB_VARIANT_1_FIXTURE,
  LINKED_JOB_VARIANT_2_FIXTURE,
  APP_CONTENT_JOBS_HEADER_ROW_FIXTURE,
} from '../fixtures/testFixtures.ts';
import type { PaginatedResult, ContentJobFilters } from './types.ts';

export class ContentJobRepository {
  constructor(
    private client: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient,
    private spreadsheetId: string = WORKBOOK_CONFIG.spreadsheetId
  ) {}

  /**
   * Fetches raw rows and maps to ContentJob entities.
   */
  async fetchJobsFromSheet(
    accessToken?: string,
    startRow = 2,
    endRow = 100
  ): Promise<{ jobs: ContentJob[]; headerCount: number }> {
    const sheetName = SHEET_NAMES.APP_CONTENT_JOBS;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 1;

    let headers: string[];
    let rawRows: string[][];

    if (accessToken) {
      headers = await this.client.fetchSheetHeaders(
        accessToken,
        this.spreadsheetId,
        sheetName,
        headerRowIndex
      );
      rawRows = await this.client.fetchSheetRowRange(
        accessToken,
        this.spreadsheetId,
        sheetName,
        startRow,
        endRow
      );
    } else {
      // Offline / Test Fixtures
      headers = APP_CONTENT_JOBS_HEADER_ROW_FIXTURE;
      rawRows = [];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      APP_CONTENT_JOBS_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    const jobs: ContentJob[] = [];
    rawRows.forEach((row) => {
      const mapped = mapRowToContentJob(row, validation.headerMap);
      if (mapped) {
        jobs.push(mapped);
      }
    });

    return { jobs, headerCount: headers.length };
  }

  /**
   * Lists jobs with support for filtering and pagination.
   */
  async listJobs(filters: ContentJobFilters = {}): Promise<PaginatedResult<ContentJob>> {
    const page = Math.max(1, filters.page || 1);
    const pageSize = Math.min(100, Math.max(1, filters.pageSize || 20));

    if (filters.requireLive && !filters.accessToken) {
      const err: any = new Error('Live Workspace access requires a valid Google authorization token.');
      err.code = 'AUTHORIZATION_REQUIRED';
      err.statusCode = 401;
      err.userActionableMessage = 'Please sign in with your authorized Google account to inspect the Operations Hub.';
      throw err;
    }

    let allJobs: ContentJob[] = [];

    if (filters.accessToken) {
      const result = await this.fetchJobsFromSheet(filters.accessToken, 2, 100);
      allJobs = result.jobs;
    } else {
      if (filters.requireLive) {
        const err: any = new Error('Live Workspace access requires a valid Google authorization token.');
        err.code = 'AUTHORIZATION_REQUIRED';
        err.statusCode = 401;
        throw err;
      }
      // Test fixtures strictly for offline demo and unit test assertions
      allJobs = [LINKED_JOB_VARIANT_1_FIXTURE, LINKED_JOB_VARIANT_2_FIXTURE];
    }

    let filtered = allJobs;

    if (filters.sourceUrlKey) {
      const targetKey = filters.sourceUrlKey.trim().toLowerCase();
      filtered = filtered.filter((j) => j.sourceUrlKey.trim().toLowerCase() === targetKey);
    }
    if (filters.productionStatus && filters.productionStatus !== 'all') {
      filtered = filtered.filter((j) => j.productionStatus === filters.productionStatus);
    }
    if (filters.qcStatus && filters.qcStatus !== 'all') {
      filtered = filtered.filter((j) => j.qcStatus === filters.qcStatus);
    }
    if (filters.publishingStatus && filters.publishingStatus !== 'all') {
      filtered = filtered.filter((j) => j.publishingStatus === filters.publishingStatus);
    }
    if (filters.producer) {
      filtered = filtered.filter((j) => j.producer.toLowerCase().includes(filters.producer!.toLowerCase()));
    }
    if (filters.platform) {
      filtered = filtered.filter((j) => j.platform.toLowerCase() === filters.platform!.toLowerCase());
    }
    if (filters.targetAccount) {
      filtered = filtered.filter((j) => j.targetAccount === filters.targetAccount);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (j) =>
          j.id.toLowerCase().includes(q) ||
          j.sourceTitle.toLowerCase().includes(q) ||
          j.sourceUrlKey.toLowerCase().includes(q)
      );
    }

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filtered.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasMore: page < totalPages,
        returnedCount: paginatedItems.length,
      },
      actualRecordCount: totalItems,
    };
  }

  /**
   * Finds a single job by Job ID.
   */
  async findJobById(jobId: string, options: { accessToken?: string } = {}): Promise<ContentJob | null> {
    const trimmedId = jobId.trim().toLowerCase();
    const result = await this.listJobs({ accessToken: options.accessToken, pageSize: 100 });
    return result.items.find((j) => j.id.trim().toLowerCase() === trimmedId) || null;
  }

  /**
   * Finds all jobs linked to a specific research source via Source URL Key.
   * Proves: ONE ResearchSource -> MULTIPLE ContentJobs.
   */
  async findJobsBySourceUrlKey(
    sourceUrlKey: string,
    options: { accessToken?: string } = {}
  ): Promise<ContentJob[]> {
    const trimmedKey = sourceUrlKey.trim().toLowerCase();
    const result = await this.listJobs({
      sourceUrlKey: trimmedKey,
      accessToken: options.accessToken,
      pageSize: 100,
    });
    return result.items;
  }

  /**
   * Alias for findJobsBySourceUrlKey
   */
  async getJobsBySourceKey(
    sourceUrlKey: string,
    options: { accessToken?: string } = {}
  ): Promise<ContentJob[]> {
    return this.findJobsBySourceUrlKey(sourceUrlKey, options);
  }

  /**
   * Counts the number of content jobs linked to a given source URL key.
   */
  async countJobsBySourceUrlKey(
    sourceUrlKey: string,
    options: { accessToken?: string } = {}
  ): Promise<number> {
    const jobs = await this.findJobsBySourceUrlKey(sourceUrlKey, options);
    return jobs.length;
  }
}

export const contentJobRepository = new ContentJobRepository();
