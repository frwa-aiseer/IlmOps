/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { translateWorkspaceError, FriendlyWorkspaceError } from './workspaceErrors.ts';

export interface GridProperties {
  rowCount?: number;
  columnCount?: number;
}

export interface SheetPropertyMetadata {
  sheetId: number;
  title: string;
  index: number;
  gridProperties?: GridProperties;
}

export interface SpreadsheetMetadata {
  title: string;
  locale?: string;
  timeZone?: string;
  sheets: SheetPropertyMetadata[];
}

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

/**
 * Pure Read-Only Client for Google Workspace (Sheets & Drive).
 *
 * STRICT READ-ONLY COMPLIANCE:
 * - Surfaces NO write, append, update, delete, clear, create, rename, or share methods.
 * - Restricts requests to reading spreadsheet metadata and specific single-row header slices.
 * - Never returns or retains full cell tables.
 */
export class ReadOnlyWorkspaceClient {
  private readonly baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
  private readonly driveUrl = 'https://www.googleapis.com/drive/v3/files';

  /**
   * Fetch spreadsheet metadata, including title, locale, timeZone, and sheets properties (grid bounds).
   * Does NOT fetch cell values or data rows.
   */
  async fetchSpreadsheetMetadata(
    accessToken: string,
    spreadsheetId: string
  ): Promise<SpreadsheetMetadata> {
    const fields = 'properties.title,properties.locale,properties.timeZone,sheets.properties(sheetId,title,index,gridProperties(rowCount,columnCount))';
    const url = `${this.baseUrl}/${encodeURIComponent(spreadsheetId)}?fields=${encodeURIComponent(fields)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw translateWorkspaceError(response.status);
    }

    const json = (await response.json()) as {
      properties?: { title?: string; locale?: string; timeZone?: string };
      sheets?: Array<{ properties?: SheetPropertyMetadata }>;
    };

    return {
      title: json.properties?.title || '',
      locale: json.properties?.locale,
      timeZone: json.properties?.timeZone,
      sheets: (json.sheets || []).map((s) => s.properties as SheetPropertyMetadata).filter(Boolean),
    };
  }

  /**
   * Fetch ONLY a single header row for a specific sheet.
   * e.g. 'AI_Content_Queue!3:3' or 'APP_Content_Jobs!1:1'.
   * Never fetches data rows.
   */
  async fetchSheetHeaderRow(
    accessToken: string,
    spreadsheetId: string,
    sheetTitle: string,
    rowNumber: number
  ): Promise<string[]> {
    const range = `'${sheetTitle}'!${rowNumber}:${rowNumber}`;
    const url = `${this.baseUrl}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?majorDimension=ROWS`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw translateWorkspaceError(response.status);
    }

    const json = (await response.json()) as {
      values?: string[][];
    };

    const firstRow = json.values && json.values.length > 0 ? json.values[0] : [];
    return firstRow.map((v) => (v === null || v === undefined ? '' : String(v).trim()));
  }

  /**
   * Alias for fetchSheetHeaderRow for repository standard consistency.
   */
  async fetchSheetHeaders(
    accessToken: string,
    spreadsheetId: string,
    sheetTitle: string,
    rowNumber: number
  ): Promise<string[]> {
    return this.fetchSheetHeaderRow(accessToken, spreadsheetId, sheetTitle, rowNumber);
  }

  /**
   * Fetch a bounded range of rows from a specific sheet by 1-indexed row numbers.
   * e.g. 'AI_Content_Queue'!4:103.
   * Strictly row-oriented range notation ('Sheet'!startRow:endRow).
   * NEVER uses or requires column letters.
   */
  async fetchSheetRowRange(
    accessToken: string,
    spreadsheetId: string,
    sheetTitle: string,
    startRow: number,
    endRow: number
  ): Promise<string[][]> {
    const range = `'${sheetTitle}'!${startRow}:${endRow}`;
    const url = `${this.baseUrl}/${encodeURIComponent(spreadsheetId)}/values/${encodeURIComponent(range)}?majorDimension=ROWS`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw translateWorkspaceError(response.status);
    }

    const json = (await response.json()) as {
      values?: Array<Array<string | number | boolean | null>>;
    };

    const rows = json.values || [];
    return rows.map((row) =>
      row.map((cell) => (cell === null || cell === undefined ? '' : String(cell).trim()))
    );
  }

  /**
   * Fetch drive file metadata for read-only validation if required.

   */
  async fetchDriveFileMetadata(
    accessToken: string,
    fileId: string
  ): Promise<DriveFileMetadata> {
    const fields = 'id,name,mimeType,modifiedTime';
    const url = `${this.driveUrl}/${encodeURIComponent(fileId)}?fields=${encodeURIComponent(fields)}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw translateWorkspaceError(response.status);
    }

    return (await response.json()) as DriveFileMetadata;
  }
}

// Export singleton instance
export const readOnlyWorkspaceClient = new ReadOnlyWorkspaceClient();
