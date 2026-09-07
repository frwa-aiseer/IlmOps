/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ResearchSource,
  SHEET_NAMES,
  SOURCE_QUEUE_REQUIRED_HEADERS,
  NicheId,
} from '../../shared/contracts/contentOps.ts';
import { WORKBOOK_CONFIG, SHEET_SCHEMA_DEFINITIONS } from '../config/contentOpsWorkbook.ts';
import { readOnlyWorkspaceClient, ReadOnlyWorkspaceClient } from '../integrations/googleWorkspace/workspaceClient.ts';
import { validateSheetHeaders } from '../utils/headerMapping.ts';
import { mapRowToResearchSource } from '../mappers/sourceMapper.ts';
import { EXAMPLE_RESEARCH_SOURCE_FIXTURE, SOURCE_QUEUE_HEADER_ROW_FIXTURE } from '../fixtures/testFixtures.ts';
import type { PaginatedResult, SourceListOptions } from './types.ts';

/**
 * Deduplicates research sources using URL Key as the primary identity.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. Safe normalization: Trims surrounding whitespace from URL Key before comparing.
 * 2. Unrelated blank URL Key rows are NEVER merged together.
 * 3. Blank URL Key rows are flagged with isDeduplicationEligible: false.
 * 4. Preserves origin niche and metadata.
 */
export function deduplicateSources(sources: ResearchSource[]): ResearchSource[] {
  const seenKeys = new Set<string>();
  const deduplicated: ResearchSource[] = [];

  for (const src of sources) {
    const rawKey = src.urlKey ? src.urlKey.trim() : '';

    if (!rawKey) {
      // Incomplete/blank URL Key: not eligible for deduplication; preserve row without merging!
      deduplicated.push({
        ...src,
        isDeduplicationEligible: false,
      });
      continue;
    }

    const normalizedKey = rawKey.toLowerCase();
    if (!seenKeys.has(normalizedKey)) {
      seenKeys.add(normalizedKey);
      deduplicated.push({
        ...src,
        urlKey: rawKey,
        isDeduplicationEligible: true,
      });
    }
  }

  return deduplicated;
}

export class SourceRepository {
  constructor(
    private client: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient,
    private spreadsheetId: string = WORKBOOK_CONFIG.spreadsheetId
  ) {}

  /**
   * Reads and maps rows from a given content queue sheet.
   */
  async fetchSourcesFromSheet(
    sheetName: string,
    defaultNiche: NicheId,
    accessToken?: string,
    startRow = 4,
    endRow = 100
  ): Promise<{ sources: ResearchSource[]; headerCount: number }> {
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
      // Offline / Test Fixture fallback
      headers = SOURCE_QUEUE_HEADER_ROW_FIXTURE;
      rawRows = [];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      SOURCE_QUEUE_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    const sources: ResearchSource[] = [];
    rawRows.forEach((row, idx) => {
      const mapped = mapRowToResearchSource(row, validation.headerMap, defaultNiche, idx);
      if (mapped) {
        sources.push(mapped);
      }
    });

    return { sources, headerCount: headers.length };
  }

  /**
   * Reads AI and/or Electrical queues into a deduplicated collection.
   * Supports specific queue target or combined queues, bounded chunking, pagination, and multi-field filtering.
   */
  async listSources(
    queueOrOptions?: string | SourceListOptions,
    maybeOptions: SourceListOptions = {}
  ): Promise<PaginatedResult<ResearchSource>> {
    let queue: string | undefined = undefined;
    let options: SourceListOptions = {};

    if (typeof queueOrOptions === 'string') {
      queue = queueOrOptions;
      options = maybeOptions || {};
    } else if (typeof queueOrOptions === 'object' && queueOrOptions !== null) {
      options = queueOrOptions;
    } else if (maybeOptions) {
      options = maybeOptions;
    }

    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));

    if (options.requireLive && !options.accessToken) {
      const err: any = new Error('Live Workspace access requires a valid Google authorization token.');
      err.code = 'AUTHORIZATION_REQUIRED';
      err.statusCode = 401;
      err.userActionableMessage = 'Please sign in with your authorized Google account to inspect the Operations Hub.';
      throw err;
    }

    let allSources: ResearchSource[] = [];

    if (options.accessToken) {
      if (queue === SHEET_NAMES.AI_CONTENT_QUEUE || queue === 'AI_Content_Queue') {
        const aiResult = await this.fetchSourcesFromSheet(
          SHEET_NAMES.AI_CONTENT_QUEUE,
          'ai_data',
          options.accessToken,
          4,
          103
        );
        allSources = aiResult.sources;
      } else if (queue === SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE || queue === 'Electrical_Content_Queue') {
        const elResult = await this.fetchSourcesFromSheet(
          SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE,
          'electrical_energy',
          options.accessToken,
          4,
          103
        );
        allSources = elResult.sources;
      } else {
        // Fetch bounded rows from both queues in parallel (Row 4 to 103)
        const [aiResult, electricalResult] = await Promise.all([
          this.fetchSourcesFromSheet(
            SHEET_NAMES.AI_CONTENT_QUEUE,
            'ai_data',
            options.accessToken,
            4,
            103
          ),
          this.fetchSourcesFromSheet(
            SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE,
            'electrical_energy',
            options.accessToken,
            4,
            103
          ),
        ]);
        allSources = deduplicateSources([...aiResult.sources, ...electricalResult.sources]);
      }
    } else {
      if (options.requireLive) {
        const err: any = new Error('Live Workspace access requires a valid Google authorization token.');
        err.code = 'AUTHORIZATION_REQUIRED';
        err.statusCode = 401;
        throw err;
      }
      // Fixture representation strictly for offline/mock demo mode and automated unit tests
      allSources = deduplicateSources([
        EXAMPLE_RESEARCH_SOURCE_FIXTURE,
        {
          ...EXAMPLE_RESEARCH_SOURCE_FIXTURE,
          id: 'SRC-EE-01',
          urlKey: 'electrical-substation-iec-61850',
          title: 'IEC 61850 Substation Bus Automation & Goose Messaging Validation',
          nicheId: 'electrical_energy',
          subcategory: 'Power Systems',
          sourceType: 'Industry Standard',
          publisherOrAuthor: 'IEEE Power & Energy Society',
          sourceDomain: 'ieee.org',
          sourceUrl: 'https://standards.ieee.org/ieee-61850',
          canonicalUrl: 'https://standards.ieee.org/ieee-61850',
          scores: { credibility: 5, novelty: 4, contentValue: 5 },
          technicalDepth: 'Deep Dive',
          productionPotential: 'High',
          reviewDecision: 'approved',
          details: {
            ...EXAMPLE_RESEARCH_SOURCE_FIXTURE.details,
            technicalSummary: 'Substation automation telemetry architectures.',
          },
        },
      ]);
    }

    // Apply filtering
    let filtered = allSources;
    if (options.nicheId && options.nicheId !== 'all') {
      filtered = filtered.filter((s) => s.nicheId === options.nicheId);
    }
    if (options.reviewDecision && options.reviewDecision !== 'all') {
      filtered = filtered.filter((s) => s.reviewDecision === options.reviewDecision);
    }
    if (options.priority && options.priority !== 'all') {
      filtered = filtered.filter((s) => s.priority === options.priority);
    }
    if (options.sourceType) {
      filtered = filtered.filter((s) => s.sourceType === options.sourceType);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.urlKey.toLowerCase().includes(q) ||
          s.publisherOrAuthor.toLowerCase().includes(q) ||
          (s.sourceDomain && s.sourceDomain.toLowerCase().includes(q))
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
   * Finds a research source by exact URL Key across specific queue or all queues.
   */
  async getSourceByUrlKey(
    queueOrUrlKey: string,
    urlKeyOrOptions?: string | { accessToken?: string },
    maybeOptions: { accessToken?: string } = {}
  ): Promise<ResearchSource | null> {
    let targetKey = '';
    let options: { accessToken?: string } = {};

    if (typeof urlKeyOrOptions === 'string') {
      // 3-arg signature: (queue, urlKey, options)
      targetKey = urlKeyOrOptions;
      options = maybeOptions;
    } else {
      // 2-arg signature: (urlKey, options)
      targetKey = queueOrUrlKey;
      options = urlKeyOrOptions || {};
    }

    const normalized = targetKey ? targetKey.trim().toLowerCase() : '';
    if (!normalized) return null;

    const result = await this.listSources({
      accessToken: options.accessToken,
      pageSize: 100,
    });

    return result.items.find((s) => s.urlKey.trim().toLowerCase() === normalized) || null;
  }
}

export const sourceRepository = new SourceRepository();
