/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ManualSourceEntry,
  SHEET_NAMES,
  MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';
import { WORKBOOK_CONFIG, SHEET_SCHEMA_DEFINITIONS } from '../config/contentOpsWorkbook.ts';
import { readOnlyWorkspaceClient, ReadOnlyWorkspaceClient } from '../integrations/googleWorkspace/workspaceClient.ts';
import { validateSheetHeaders } from '../utils/headerMapping.ts';
import { mapRowToManualSourceEntry } from '../mappers/manualSourceMapper.ts';
import { MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE } from '../fixtures/testFixtures.ts';
import type { PaginatedResult, PaginationOptions } from './types.ts';

export class ManualSourceRepository {
  constructor(
    private client: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient,
    private spreadsheetId: string = WORKBOOK_CONFIG.spreadsheetId
  ) {}

  /**
   * Fetches manual source entries from Manual_Source_Entry (Row 3 header).
   * Strictly read-only; no queue routing or write mutations.
   */
  async fetchManualEntriesFromSheet(
    accessToken?: string,
    startRow = 4,
    endRow = 50
  ): Promise<{ entries: ManualSourceEntry[]; headerCount: number }> {
    const sheetName = SHEET_NAMES.MANUAL_SOURCE_ENTRY;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 3;

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
      headers = MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE;
      rawRows = [];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    const entries: ManualSourceEntry[] = [];
    rawRows.forEach((row) => {
      const mapped = mapRowToManualSourceEntry(row, validation.headerMap);
      if (mapped) entries.push(mapped);
    });

    return { entries, headerCount: headers.length };
  }

  /**
   * Lists manual entries with pagination.
   */
  async listManualEntries(
    options: PaginationOptions & { accessToken?: string } = {}
  ): Promise<PaginatedResult<ManualSourceEntry>> {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));

    let allEntries: ManualSourceEntry[] = [];

    if (options.accessToken) {
      const result = await this.fetchManualEntriesFromSheet(options.accessToken, 4, 50);
      allEntries = result.entries;
    } else {
      // Offline fixture
      allEntries = [
        {
          capturedDate: '2026-09-06',
          publishedDate: '2026-09-05',
          freshnessDays: 1,
          niche: 'AI & Data Engineering',
          category: 'KV Cache Compaction',
          subtopicKeywords: 'Attention Pruning, Speculative Decoding',
          sourceType: 'ArXiv',
          sourceTitle: 'KV-Prune: Dynamic Cache Eviction for Long-Context LLMs',
          publisherAuthor: 'Stanford AI Lab',
          canonicalUrl: 'https://arxiv.org/abs/2502.demo-kv-manual',
          urlKey: 'kv-prune-manual-entry',
          sourceDomain: 'arxiv.org',
          technicalSummary: 'Dynamic KV cache eviction with minimal accuracy loss.',
          keyFindings: 'Reduces memory by 60% with zero perplexity degradation.',
          whyItMatters: 'Enables 128k inference on commodity edge GPUs.',
          contentAngleHook: 'Why your RAG pipeline runs out of VRAM.',
          recommendedFormat: 'Infographic + Technical Deep-Dive',
          targetAudience: 'ML Engineers, RAG Developers',
          credibilityScore: 5,
          noveltyScore: 5,
          contentValueScore: 5,
          priority: 'P1',
          status: 'Review Ready',
          assignedTo: 'Farwa Jafar',
          manualEntryStatus: 'Staged',
          enteredBy: 'Farwa Jafar',
          entryDate: '2026-09-06',
          queueRouting: 'AI_Content_Queue',
          masterMirror: 'Pending Sync',
        },
      ];
    }

    const totalItems = allEntries.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = allEntries.slice(startIndex, startIndex + pageSize);

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
   * Finds a manual entry by URL Key.
   */
  async getManualEntryByUrlKey(
    urlKey: string,
    options: { accessToken?: string } = {}
  ): Promise<ManualSourceEntry | null> {
    const normalized = urlKey ? urlKey.trim().toLowerCase() : '';
    if (!normalized) return null;

    const result = await this.listManualEntries(options);
    return result.items.find((e) => e.urlKey.trim().toLowerCase() === normalized) || null;
  }
}

export const manualSourceRepository = new ManualSourceRepository();
