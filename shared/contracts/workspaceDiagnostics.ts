/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type HeaderValidationStatus = 'PASS' | 'FAIL' | 'WARNING' | 'NOT_CHECKED';

export interface SheetDiagnosticResult {
  sheetName: string;
  found: boolean;
  expectedHeaderRow: number;
  actualHeaderRow?: number;
  headerValidation: HeaderValidationStatus;
  missingHeaders: string[];
  duplicateHeaders: string[];
  discoveredHeadersCount: number;
  discoveredHeaders?: string[]; // Header names only (no row data)
  rowCount?: number; // Bounded grid dimensions
  columnCount?: number;
  gridCapacity?: number; // Sheet grid capacity (gridProperties.rowCount)
  description?: string;
  note?: string;
}

export interface WorkspaceDiagnosticsData {
  signedIn: boolean;
  userEmail?: string | null;
  workbookReachable: boolean;
  workbookTitle: string;
  redactedWorkbookId: string; // e.g. "...WWvPgk"
  lastCheckedAt: string;
  locale?: string;
  timeZone?: string;
  state:
    | 'NOT_CONNECTED'
    | 'AUTHORIZATION_REQUIRED'
    | 'CONNECTING'
    | 'CONNECTED'
    | 'WORKBOOK_FOUND'
    | 'WORKBOOK_PERMISSION_ERROR'
    | 'SCHEMA_WARNING'
    | 'SCHEMA_VALID';
  sheets: SheetDiagnosticResult[];
  error?: {
    code: string;
    message: string;
    userActionableMessage: string;
  };
  summary: {
    totalRequiredSheets: number;
    foundSheetsCount: number;
    passedSheetsCount: number;
    failedSheetsCount: number;
    warningSheetsCount: number;
    allSchemasPass: boolean;
  };
}
