/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ManualSourceEntry } from '../../shared/contracts/contentOps.ts';
import { getRowValueByHeader } from '../utils/headerMapping.ts';
import {
  parseSafeText,
  parseSafeOptionalText,
  parseSafeDate,
  parseSafeScore,
  parseSafeNumber,
} from '../utils/dataParsing.ts';

/**
 * Maps a raw row from Manual_Source_Entry (Row 3 header row) into a ManualSourceEntry entity.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. Resolves fields dynamically by exact header name using headerMap.
 * 2. Dedicated schema strictly decoupled from ResearchSource queue.
 * 3. Never executes write or routing operations.
 * 4. Never crashes on malformed fields.
 */
export function mapRowToManualSourceEntry(
  row: unknown[],
  headerMap: Map<string, number>
): ManualSourceEntry | null {
  const sourceTitle = parseSafeText(getRowValueByHeader(row, headerMap, 'Source Title'));
  const rawUrlKey = getRowValueByHeader(row, headerMap, 'URL Key');
  const urlKey = typeof rawUrlKey === 'string' ? rawUrlKey.trim() : '';

  // Detect unpopulated row
  if (!sourceTitle && !urlKey) {
    return null;
  }

  return {
    capturedDate: parseSafeDate(getRowValueByHeader(row, headerMap, 'Captured Date')) || undefined,
    publishedDate: parseSafeDate(getRowValueByHeader(row, headerMap, 'Published Date')) || undefined,
    freshnessDays: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Freshness Days'), 0),
    niche: parseSafeText(getRowValueByHeader(row, headerMap, 'Niche')) || 'AI & Data Engineering',
    category: parseSafeText(getRowValueByHeader(row, headerMap, 'Category')) || 'General',
    subtopicKeywords: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Subtopic / Keywords')),
    sourceType: parseSafeText(getRowValueByHeader(row, headerMap, 'Source Type')) || 'Technical Report',
    sourceTitle: sourceTitle || 'Untitled Manual Entry',
    publisherAuthor: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Publisher / Author')),
    canonicalUrl: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Canonical URL')),
    urlKey: urlKey || '',
    sourceDomain: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Source Domain')),
    technicalSummary: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Technical Summary')),
    keyFindings: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Key Findings / Takeaways')),
    whyItMatters: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Why It Matters / Novelty')),
    contentAngleHook: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Content Angle / Hook')),
    recommendedFormat: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Recommended Format')),
    targetAudience: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Target Audience')),
    credibilityScore: parseSafeScore(getRowValueByHeader(row, headerMap, 'Credibility Score (1-5)')) || undefined,
    noveltyScore: parseSafeScore(getRowValueByHeader(row, headerMap, 'Novelty Score (1-5)')) || undefined,
    contentValueScore: parseSafeScore(getRowValueByHeader(row, headerMap, 'Content Value Score (1-5)')) || undefined,
    priority: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Priority')),
    status: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Status')),
    assignedTo: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Assigned To')),
    contentAssetLink: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Content Asset Link / Used In')),
    notes: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Notes')),
    manualEntryStatus: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Manual Entry Status')),
    enteredBy: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Entered By')),
    entryDate: parseSafeDate(getRowValueByHeader(row, headerMap, 'Entry Date')) || undefined,
    queueRouting: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Queue Routing')),
    masterMirror: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Master Mirror')),
  };
}
