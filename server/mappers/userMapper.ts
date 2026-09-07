/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { AppUser } from '../../shared/contracts/contentOps.ts';
import { getRowValueByHeader } from '../utils/headerMapping.ts';
import { parseSafeText, parseSafeOptionalText, parseSafeBoolean } from '../utils/dataParsing.ts';

/**
 * Maps a raw row from APP_Users (Row 1 header row) into an AppUser entity.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. Strict Identity Protection: Never invent or fabricate email addresses.
 *    If 'Email / Google Account' is blank or absent, sets email: null.
 * 2. Resolves fields dynamically by exact header name using headerMap.
 * 3. Boolean flags safely parse Yes/No/True/1/Active values.
 */
export function mapRowToAppUser(
  row: unknown[],
  headerMap: Map<string, number>
): AppUser | null {
  const fullName = parseSafeText(getRowValueByHeader(row, headerMap, 'Full Name'));
  const rawEmail = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Email / Google Account'));

  // Detect unpopulated row
  if (!fullName && !rawEmail) {
    return null;
  }

  // Strict: Validate real email format or retain null. NEVER invent synthetic emails.
  const email = rawEmail && rawEmail.includes('@') ? rawEmail : null;

  return {
    email,
    fullName: fullName || 'Unnamed Operator',
    primaryRole: parseSafeText(getRowValueByHeader(row, headerMap, 'Primary Role')) || 'Team Member',
    researchAccess: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Research Access')),
    productionAccess: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Production Access')),
    qcAccess: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'QC Access')),
    publishingAnalyticsAccess: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Publishing / Analytics Access')),
    adminAccess: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Admin Access')),
    active: parseSafeBoolean(getRowValueByHeader(row, headerMap, 'Active'), true),
    notes: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Notes')),
  };
}
