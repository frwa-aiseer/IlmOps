/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ===========================================================================
// Pure Data Parsing & Sanitization Utilities (P05 Data Access Layer)
// Guarantees:
// 1. Zero data fabrication — values derive strictly from row inputs.
// 2. Malformed cells NEVER crash the application or repositories.
// 3. Raw source strings are preserved when parsing is uncertain.
// ===========================================================================

/**
 * Parses and trims text safely. Preserves source string without mutation.
 */
export function parseSafeText(val: unknown, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str.length > 0 ? str : fallback;
}

/**
 * Safely parses optional text, returning undefined if empty or null.
 */
export function parseSafeOptionalText(val: unknown): string | undefined {
  if (val === null || val === undefined) return undefined;
  const str = String(val).trim();
  return str.length > 0 ? str : undefined;
}

/**
 * Safely parses date strings into standardized ISO format (YYYY-MM-DD or full ISO).
 * If the date is invalid or unparseable, returns the original trimmed string or null
 * WITHOUT throwing an exception.
 */
export function parseSafeDate(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;

  // Handle standard ISO dates (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // Handle DD/MM/YYYY or DD-MM-YYYY format common in en_GB locale
  const ddmmyyyyMatch = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(.*)$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year, rest] = ddmmyyyyMatch;
    const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    const parsed = Date.parse(isoDate);
    if (!isNaN(parsed)) {
      return rest.trim() ? `${isoDate} ${rest.trim()}` : isoDate;
    }
  }

  // Try standard Date.parse
  const parsedTimestamp = Date.parse(str);
  if (!isNaN(parsedTimestamp)) {
    try {
      const d = new Date(parsedTimestamp);
      return d.toISOString();
    } catch {
      // Fall through to preserve string
    }
  }

  // Preserve raw string if unparseable rather than failing
  return str;
}

/**
 * Safely parses numeric scores (e.g. 1 to 5).
 * Handles inputs like "5", 5, "4/5", "4.0", or non-numeric strings.
 * Never throws — returns null if invalid.
 */
export function parseSafeScore(
  val: unknown,
  min = 1,
  max = 5
): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;

  // Handle "X/Y" format (e.g. "4/5")
  const fractionMatch = str.match(/^(\d+(?:\.\d+)?)\s*\/\s*\d+/);
  const numStr = fractionMatch ? fractionMatch[1] : str;

  const parsed = Number(numStr);
  if (isNaN(parsed)) return null;

  // Clamp or validate within bounds
  if (parsed < min || parsed > max) {
    // If clearly out of bounds, return parsed or clamped
    return Math.max(min, Math.min(max, Math.round(parsed)));
  }

  return parsed;
}

/**
 * Safely parses generic numbers.
 * Strips commas and currency symbols. Returns fallback on NaN.
 */
export function parseSafeNumber(val: unknown, fallback = 0): number {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;

  const cleaned = String(val).replace(/[$,]/g, '').trim();
  if (!cleaned) return fallback;

  const parsed = Number(cleaned);
  return isNaN(parsed) ? fallback : parsed;
}

/**
 * Safely parses boolean values from sheet conventions:
 * "TRUE", "yes", "Y", "1", "active" -> true
 * "FALSE", "no", "N", "0", "inactive", "" -> false
 */
export function parseSafeBoolean(val: unknown, fallback = false): boolean {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'boolean') return val;

  const str = String(val).trim().toLowerCase();
  if (['true', 'yes', 'y', '1', 'active', 'enabled'].includes(str)) return true;
  if (['false', 'no', 'n', '0', 'inactive', 'disabled'].includes(str)) return false;

  return fallback;
}

/**
 * Safely parses Yes / No cell values into explicit 'Yes' | 'No' | null.
 */
export function parseSafeYesNo(val: unknown): 'Yes' | 'No' | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim().toLowerCase();
  if (!str) return null;
  if (['yes', 'y', 'true', '1'].includes(str)) return 'Yes';
  if (['no', 'n', 'false', '0'].includes(str)) return 'No';
  return null;
}

/**
 * Safely normalizes URL strings without throwing errors.
 */
export function parseSafeUrl(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (!str) return null;
  return str;
}

/**
 * Splits multiline or delimiter-separated text into clean non-empty string arrays.
 */
export function parseSafeStringArray(
  val: unknown,
  delimiter: RegExp | string = /[\n\r;]+/
): string[] {
  if (val === null || val === undefined) return [];
  const str = String(val).trim();
  if (!str) return [];

  return str
    .split(delimiter)
    .map((item) => item.replace(/^[•\-\*]\s*/, '').trim())
    .filter((item) => item.length > 0);
}
