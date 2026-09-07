/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ActivityLog } from '../../shared/contracts/contentOps.ts';
import { getRowValueByHeader } from '../utils/headerMapping.ts';
import { parseSafeText, parseSafeOptionalText } from '../utils/dataParsing.ts';

/**
 * Maps a raw row from APP_Activity_Log (Row 1 header row) into an ActivityLog entity.
 */
export function mapRowToActivityLog(
  row: unknown[],
  headerMap: Map<string, number>
): ActivityLog | null {
  const timestamp = parseSafeText(getRowValueByHeader(row, headerMap, 'Timestamp'));
  const eventType = parseSafeText(getRowValueByHeader(row, headerMap, 'Event Type'));
  const user = parseSafeText(getRowValueByHeader(row, headerMap, 'User'));
  const targetEntity = parseSafeText(getRowValueByHeader(row, headerMap, 'Target Entity'));

  if (!timestamp && !eventType && !user && !targetEntity) {
    return null;
  }

  return {
    timestamp: timestamp || new Date().toISOString(),
    eventType: eventType || 'SYSTEM_EVENT',
    user: user || 'System',
    targetEntity: targetEntity || 'UNKNOWN',
    notes: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Notes')),
  };
}
