/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { WORKBOOK_CONFIG, SHEET_SCHEMA_DEFINITIONS } from '../../config/contentOpsWorkbook.ts';
import { validateSheetHeaders } from '../../utils/headerMapping.ts';
import { readOnlyWorkspaceClient, ReadOnlyWorkspaceClient } from './workspaceClient.ts';
import { translateWorkspaceError, FriendlyWorkspaceError } from './workspaceErrors.ts';
import type {
  WorkspaceDiagnosticsData,
  SheetDiagnosticResult,
  HeaderValidationStatus,
} from '../../../shared/contracts/workspaceDiagnostics.ts';

// In-memory registry for dynamically discovered config sheet headers
const DISCOVERED_CONFIG_HEADERS: Record<string, string[]> = {};

/**
 * Executes a strictly read-only diagnostics audit of the Google Workspace connection
 * against the ALLIN Content Operations Hub.
 *
 * SAFETY GUARANTEES:
 * - Never returns OAuth tokens, refresh tokens, or auth credentials.
 * - Never returns cell contents or full worksheet rows (only header names & grid dimensions).
 * - Redacts the spreadsheet ID (showing only the last 6 characters).
 * - No write, update, or append calls are made.
 */
export async function runWorkspaceDiagnostics(
  accessToken?: string | null,
  client: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient
): Promise<WorkspaceDiagnosticsData> {
  const lastCheckedAt = new Date().toISOString();
  const redactedWorkbookId = `...${WORKBOOK_CONFIG.spreadsheetId.slice(-6)}`;

  const requiredSheetOrder = [
    'AI_Content_Queue',
    'Electrical_Content_Queue',
    'APP_Content_Jobs',
    'APP_Users',
    'Brand_Profiles',
    'Content_Types',
    'Team_Members',
    'Lists_Config',
    'Manual_Source_Entry',
    'APP_Activity_Log',
  ];

  // 1. Check if Google Authorization exists
  if (!accessToken || !accessToken.trim()) {
    const defaultSheets: SheetDiagnosticResult[] = requiredSheetOrder.map((name) => {
      const def = SHEET_SCHEMA_DEFINITIONS[name as keyof typeof SHEET_SCHEMA_DEFINITIONS];
      return {
        sheetName: name,
        found: false,
        expectedHeaderRow: def?.expectedHeaderRow || 1,
        headerValidation: 'NOT_CHECKED' as HeaderValidationStatus,
        missingHeaders: [],
        duplicateHeaders: [],
        discoveredHeadersCount: 0,
        description: def?.description,
      };
    });

    return {
      signedIn: false,
      userEmail: null,
      workbookReachable: false,
      workbookTitle: WORKBOOK_CONFIG.title,
      redactedWorkbookId,
      lastCheckedAt,
      state: 'AUTHORIZATION_REQUIRED',
      error: {
        code: 'UNAUTHORIZED',
        message: 'Google authorization is required.',
        userActionableMessage: 'Please sign in with your authorized Google account to inspect the Operations Hub.',
      },
      sheets: defaultSheets,
      summary: {
        totalRequiredSheets: requiredSheetOrder.length,
        foundSheetsCount: 0,
        passedSheetsCount: 0,
        failedSheetsCount: 0,
        warningSheetsCount: 0,
        allSchemasPass: false,
      },
    };
  }

  // 2. Attempt to reach the workbook metadata
  try {
    const metadata = await client.fetchSpreadsheetMetadata(accessToken, WORKBOOK_CONFIG.spreadsheetId);

    const remoteSheetsMap = new Map(
      metadata.sheets.map((s) => [s.title, s])
    );

    const sheetResults: SheetDiagnosticResult[] = [];

    // 3. For each required sheet, inspect presence and header row
    for (const sheetName of requiredSheetOrder) {
      const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName as keyof typeof SHEET_SCHEMA_DEFINITIONS];
      const expectedHeaderRow = schemaDef ? schemaDef.expectedHeaderRow : 1;
      const remoteSheet = remoteSheetsMap.get(sheetName);

      if (!remoteSheet) {
        sheetResults.push({
          sheetName,
          found: false,
          expectedHeaderRow,
          headerValidation: 'FAIL',
          missingHeaders: [...(schemaDef?.requiredHeaders || [])],
          duplicateHeaders: [],
          discoveredHeadersCount: 0,
          description: schemaDef?.description,
          note: `Required sheet "${sheetName}" was not found in the workbook.`,
        });
        continue;
      }

      // Sheet found - read ONLY the single header row
      let headerRow: string[] = [];
      let fetchHeaderError: string | null = null;

      try {
        headerRow = await client.fetchSheetHeaderRow(
          accessToken,
          WORKBOOK_CONFIG.spreadsheetId,
          sheetName,
          expectedHeaderRow
        );
      } catch (err: unknown) {
        const friendly = err as FriendlyWorkspaceError;
        fetchHeaderError = friendly?.message || 'Failed to read header row';
      }

      const gridProps = remoteSheet.gridProperties || {};

      if (fetchHeaderError) {
        sheetResults.push({
          sheetName,
          found: true,
          expectedHeaderRow,
          actualHeaderRow: expectedHeaderRow,
          headerValidation: 'FAIL',
          missingHeaders: [...(schemaDef?.requiredHeaders || [])],
          duplicateHeaders: [],
          discoveredHeadersCount: 0,
          rowCount: gridProps.rowCount,
          columnCount: gridProps.columnCount,
          description: schemaDef?.description,
          note: fetchHeaderError,
        });
        continue;
      }

      // Discover and record config sheet headers dynamically (Brand_Profiles, Content_Types, Team_Members, Lists_Config)
      if (['Brand_Profiles', 'Content_Types', 'Team_Members', 'Lists_Config'].includes(sheetName)) {
        if (headerRow.length > 0) {
          DISCOVERED_CONFIG_HEADERS[sheetName] = headerRow.filter(Boolean);
        }
      }

      // Validate headers against schema manifest if required headers are defined
      const requiredHeaders = schemaDef?.requiredHeaders || [];
      let validationStatus: HeaderValidationStatus = 'PASS';
      let missing: string[] = [];
      let duplicates: string[] = [];

      if (requiredHeaders.length > 0) {
        const validation = validateSheetHeaders(sheetName, headerRow, requiredHeaders, expectedHeaderRow);
        if (!validation.isValid) {
          validationStatus = 'FAIL';
          missing = validation.missingHeaders;
          duplicates = validation.duplicateHeaders;
        } else {
          validationStatus = 'PASS';
        }
      } else {
        // Sheet has no pre-declared required headers (config/discovery sheet)
        validationStatus = headerRow.length > 0 ? 'PASS' : 'WARNING';
      }

      sheetResults.push({
        sheetName,
        found: true,
        expectedHeaderRow,
        actualHeaderRow: expectedHeaderRow,
        headerValidation: validationStatus,
        missingHeaders: missing,
        duplicateHeaders: duplicates,
        discoveredHeadersCount: headerRow.filter(Boolean).length,
        discoveredHeaders: headerRow.filter(Boolean),
        rowCount: gridProps.rowCount,
        columnCount: gridProps.columnCount,
        gridCapacity: gridProps.rowCount,
        description: schemaDef?.description,
      });
    }

    const passedCount = sheetResults.filter((s) => s.headerValidation === 'PASS').length;
    const failedCount = sheetResults.filter((s) => s.headerValidation === 'FAIL' || !s.found).length;
    const warningCount = sheetResults.filter((s) => s.headerValidation === 'WARNING').length;
    const allValid = failedCount === 0;

    let overallState: WorkspaceDiagnosticsData['state'] = 'SCHEMA_VALID';
    if (!allValid) {
      overallState = 'SCHEMA_WARNING';
    }

    return {
      signedIn: true,
      workbookReachable: true,
      workbookTitle: metadata.title || WORKBOOK_CONFIG.title,
      redactedWorkbookId,
      lastCheckedAt,
      locale: metadata.locale || WORKBOOK_CONFIG.locale,
      timeZone: metadata.timeZone || WORKBOOK_CONFIG.timezone,
      state: overallState,
      sheets: sheetResults,
      summary: {
        totalRequiredSheets: requiredSheetOrder.length,
        foundSheetsCount: sheetResults.filter((s) => s.found).length,
        passedSheetsCount: passedCount,
        failedSheetsCount: failedCount,
        warningSheetsCount: warningCount,
        allSchemasPass: allValid,
      },
    };
  } catch (error: unknown) {
    const friendly = error as FriendlyWorkspaceError;
    const status = friendly?.statusCode || 500;
    const safeError = friendly?.code
      ? friendly
      : translateWorkspaceError(status);

    let state: WorkspaceDiagnosticsData['state'] = 'NOT_CONNECTED';
    if (status === 401) state = 'AUTHORIZATION_REQUIRED';
    else if (status === 403) state = 'WORKBOOK_PERMISSION_ERROR';
    else if (status === 404) state = 'NOT_CONNECTED';

    return {
      signedIn: status !== 401,
      userEmail: null,
      workbookReachable: false,
      workbookTitle: WORKBOOK_CONFIG.title,
      redactedWorkbookId,
      lastCheckedAt,
      state,
      error: {
        code: safeError.code,
        message: safeError.message,
        userActionableMessage: safeError.userActionableMessage,
      },
      sheets: requiredSheetOrder.map((name) => {
        const def = SHEET_SCHEMA_DEFINITIONS[name as keyof typeof SHEET_SCHEMA_DEFINITIONS];
        return {
          sheetName: name,
          found: false,
          expectedHeaderRow: def?.expectedHeaderRow || 1,
          headerValidation: 'NOT_CHECKED' as HeaderValidationStatus,
          missingHeaders: [],
          duplicateHeaders: [],
          discoveredHeadersCount: 0,
          description: def?.description,
        };
      }),
      summary: {
        totalRequiredSheets: requiredSheetOrder.length,
        foundSheetsCount: 0,
        passedSheetsCount: 0,
        failedSheetsCount: requiredSheetOrder.length,
        warningSheetsCount: 0,
        allSchemasPass: false,
      },
    };
  }
}
