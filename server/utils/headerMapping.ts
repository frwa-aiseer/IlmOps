/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HeaderValidationResult } from '../../shared/contracts/contentOps.ts';

/**
 * Builds a Map of exact header name to column index (0-indexed).
 * Detects and tracks any duplicate header names.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. Exact string matching is required (case, spacing, punctuation preserved).
 * 2. Positions (A, B, column 31, 63) are never hard-coded in business logic.
 * 3. Never silently substitute or fuzzy-match an unexpected header.
 */
export function buildHeaderIndexMap(headers: string[]): {
  headerMap: Map<string, number>;
  duplicateHeaders: string[];
} {
  const headerMap = new Map<string, number>();
  const duplicateHeaders: string[] = [];

  headers.forEach((header, index) => {
    // Retain clean header string without accidental outer whitespace
    const normalized = typeof header === 'string' ? header.trim() : '';
    if (!normalized) return;

    if (headerMap.has(normalized)) {
      duplicateHeaders.push(normalized);
    } else {
      headerMap.set(normalized, index);
    }
  });

  return { headerMap, duplicateHeaders };
}

/**
 * Validates a sheet's headers against its required schema contract.
 * Returns an explicit, human-readable error when any required header is missing
 * or duplicates are detected.
 */
export function validateSheetHeaders(
  sheetName: string,
  rawHeaders: string[],
  requiredHeaders: readonly string[],
  headerRowIndex: number = 1
): HeaderValidationResult {
  const { headerMap, duplicateHeaders } = buildHeaderIndexMap(rawHeaders);
  const missingHeaders: string[] = [];

  for (const required of requiredHeaders) {
    if (!headerMap.has(required)) {
      missingHeaders.push(required);
    }
  }

  const isValid = missingHeaders.length === 0 && duplicateHeaders.length === 0;
  let error: string | undefined;

  if (missingHeaders.length > 0) {
    error = `Missing required header:\n"${missingHeaders[0]}"\n\nSheet:\n${sheetName}`;
  } else if (duplicateHeaders.length > 0) {
    error = `Duplicate header detected:\n"${duplicateHeaders[0]}"\n\nSheet:\n${sheetName}`;
  }

  return {
    isValid,
    sheetName,
    headerRowIndex,
    totalColumns: rawHeaders.length,
    headerMap,
    missingHeaders,
    duplicateHeaders,
    error,
  };
}

/**
 * Pure helper to safely extract a cell value by exact header name from a raw row array.
 * Never relies on hardcoded column letters or column numbers.
 */
export function getRowValueByHeader(
  row: unknown[],
  headerMap: Map<string, number>,
  headerName: string
): string | undefined {
  const index = headerMap.get(headerName);
  if (index === undefined || index < 0 || index >= row.length) {
    return undefined;
  }
  const val = row[index];
  if (val === null || val === undefined) {
    return undefined;
  }
  const str = String(val).trim();
  return str.length > 0 ? str : undefined;
}

/**
 * Safely extracts a boolean value from cell data (supports 'TRUE', '1', true, 'YES', etc.)
 */
export function getRowBooleanByHeader(
  row: unknown[],
  headerMap: Map<string, number>,
  headerName: string
): boolean {
  const val = getRowValueByHeader(row, headerMap, headerName);
  if (!val) return false;
  const lower = val.toLowerCase();
  return lower === 'true' || lower === 'yes' || lower === '1' || lower === 'checked';
}

/**
 * Safely extracts a number value from cell data.
 */
export function getRowNumberByHeader(
  row: unknown[],
  headerMap: Map<string, number>,
  headerName: string,
  defaultValue: number = 0
): number {
  const val = getRowValueByHeader(row, headerMap, headerName);
  if (!val) return defaultValue;
  const parsed = Number(val.replace(/[^0-9.-]+/g, ''));
  return isNaN(parsed) ? defaultValue : parsed;
}
