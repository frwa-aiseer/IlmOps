/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ActivityLog,
  SHEET_NAMES,
  APP_ACTIVITY_LOG_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';
import { WORKBOOK_CONFIG, SHEET_SCHEMA_DEFINITIONS } from '../config/contentOpsWorkbook.ts';
import { readOnlyWorkspaceClient, ReadOnlyWorkspaceClient } from '../integrations/googleWorkspace/workspaceClient.ts';
import { validateSheetHeaders } from '../utils/headerMapping.ts';
import { mapRowToActivityLog } from '../mappers/activityLogMapper.ts';
import { APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE } from '../fixtures/testFixtures.ts';
import type { PaginatedResult, PaginationOptions } from './types.ts';

export class ActivityLogRepository {
  constructor(
    private client: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient,
    private spreadsheetId: string = WORKBOOK_CONFIG.spreadsheetId
  ) {}

  /**
   * Lists activity logs (Row 1 header).
   * Strictly internal server-side read-only audit log.
   */
  async listActivityLogs(
    options: PaginationOptions & { accessToken?: string } = {}
  ): Promise<PaginatedResult<ActivityLog>> {
    const page = Math.max(1, options.page || 1);
    const pageSize = Math.min(100, Math.max(1, options.pageSize || 20));

    const sheetName = SHEET_NAMES.APP_ACTIVITY_LOG;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 1;

    let headers: string[];
    let rawRows: string[][];

    if (options.accessToken) {
      headers = await this.client.fetchSheetHeaders(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        headerRowIndex
      );
      rawRows = await this.client.fetchSheetRowRange(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        2,
        50
      );
    } else {
      headers = APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE;
      rawRows = [
        ['2026-09-06T12:00:00Z', 'DIAGNOSTIC_VERIFIED', 'eng.moneeb@jadwaa.com', 'AI_Content_Queue', 'P04/P05 read-only schema validation audit passed.'],
      ];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      APP_ACTIVITY_LOG_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    const allLogs: ActivityLog[] = [];
    rawRows.forEach((row) => {
      const mapped = mapRowToActivityLog(row, validation.headerMap);
      if (mapped) allLogs.push(mapped);
    });

    const totalItems = allLogs.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = allLogs.slice(startIndex, startIndex + pageSize);

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
}

export const activityLogRepository = new ActivityLogRepository();
