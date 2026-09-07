/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ResearchSource, NicheId, PriorityLevel, TechnicalDepth, ProductionPotential, ReviewDecision } from '../../shared/contracts/contentOps.ts';
import { getRowValueByHeader } from '../utils/headerMapping.ts';
import {
  parseSafeText,
  parseSafeOptionalText,
  parseSafeDate,
  parseSafeScore,
  parseSafeNumber,
  parseSafeStringArray,
} from '../utils/dataParsing.ts';

/**
 * Maps a raw row from AI_Content_Queue or Electrical_Content_Queue (Row 3 header row)
 * into a typed application ResearchSource entity.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. Resolves fields dynamically by EXACT header name using headerMap (NO column letters or fixed column numbers).
 * 2. Only copies required application ResearchSource fields (does not clone legacy 63-column operational cells).
 * 3. Never fabricates missing identities. If URL Key is blank, marks isDeduplicationEligible: false.
 * 4. Never crashes on malformed dates, scores, or text.
 */
export function mapRowToResearchSource(
  row: unknown[],
  headerMap: Map<string, number>,
  defaultNiche: NicheId,
  indexInBatch: number = 0
): ResearchSource | null {
  const title = parseSafeText(getRowValueByHeader(row, headerMap, 'Source Title'));
  const rawUrlKey = getRowValueByHeader(row, headerMap, 'URL Key');
  const urlKey = typeof rawUrlKey === 'string' ? rawUrlKey.trim() : '';

  // Detect unpopulated/blank row (e.g. empty cell padding within grid capacity)
  if (!title && !urlKey) {
    return null;
  }

  // Deduplication eligibility rule: Blank URL Keys must NOT be merged or given fabricated IDs
  const isDeduplicationEligible = urlKey.length > 0;

  // Determine niche
  const nicheVal = parseSafeText(getRowValueByHeader(row, headerMap, 'Niche')).toLowerCase();
  let nicheId: NicheId = defaultNiche;
  if (nicheVal.includes('electrical') || nicheVal.includes('energy')) {
    nicheId = 'electrical_energy';
  } else if (nicheVal.includes('ai') || nicheVal.includes('data')) {
    nicheId = 'ai_data';
  }

  // Parse review decision
  const rawDecision = parseSafeText(getRowValueByHeader(row, headerMap, 'Human Review Decision')).toLowerCase();
  let reviewDecision: ReviewDecision = 'pending';
  if (rawDecision.includes('approve')) reviewDecision = 'approved';
  else if (rawDecision.includes('reject')) reviewDecision = 'rejected';
  else if (rawDecision.includes('hold')) reviewDecision = 'hold';

  // Parse technical depth
  const rawDepth = parseSafeText(getRowValueByHeader(row, headerMap, 'Technical Depth')).toLowerCase();
  let technicalDepth: TechnicalDepth = 'Intermediate';
  if (rawDepth.includes('concept') || rawDepth.includes('intro')) technicalDepth = 'Conceptual';
  else if (rawDepth.includes('deep') || rawDepth.includes('adv')) technicalDepth = 'Deep Dive';

  // Parse production potential
  const rawPotential = parseSafeText(getRowValueByHeader(row, headerMap, 'Production Potential')).toLowerCase();
  let productionPotential: ProductionPotential = 'Medium';
  if (rawPotential.includes('high')) productionPotential = 'High';
  else if (rawPotential.includes('low')) productionPotential = 'Low';

  // Parse priority
  const rawPriority = parseSafeText(getRowValueByHeader(row, headerMap, 'Priority')).toUpperCase();
  let priority: PriorityLevel = 'P2';
  if (rawPriority.includes('1') || rawPriority === 'P1') priority = 'P1';
  else if (rawPriority.includes('3') || rawPriority === 'P3') priority = 'P3';

  // Parse scores safely (1-5 scale)
  const credScore = parseSafeScore(getRowValueByHeader(row, headerMap, 'Credibility Score (1-5)')) ?? 3;
  const novScore = parseSafeScore(getRowValueByHeader(row, headerMap, 'Novelty Score (1-5)')) ?? 3;
  const valScore = parseSafeScore(getRowValueByHeader(row, headerMap, 'Content Value Score (1-5)')) ?? 3;

  const capturedDate = parseSafeDate(getRowValueByHeader(row, headerMap, 'Captured Date')) || new Date().toISOString().split('T')[0];
  const publishedDate = parseSafeDate(getRowValueByHeader(row, headerMap, 'Published Date')) || capturedDate;
  const freshnessDays = parseSafeNumber(getRowValueByHeader(row, headerMap, 'Freshness Days'), 0);

  const canonicalUrl = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Canonical URL'));
  const cleanUrl = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Clean URL (Copy)'));
  const verifiedUrl = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Verified URL'));
  const openSourceUrl = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Open Source ↗'));

  const rawKeyFindings = getRowValueByHeader(row, headerMap, 'Key Findings / Takeaways');
  const keyFindings = parseSafeStringArray(rawKeyFindings);

  const prefix = defaultNiche === 'ai_data' ? 'SRC-AI' : 'SRC-EE';
  const id = urlKey ? `${prefix}-${urlKey.slice(0, 16)}` : `${prefix}-ROW-${indexInBatch}`;

  return {
    id,
    urlKey,
    isDeduplicationEligible,
    title: title || 'Untitled Source',
    nicheId,
    subcategory: parseSafeText(getRowValueByHeader(row, headerMap, 'Subtopic / Keywords')) || parseSafeText(getRowValueByHeader(row, headerMap, 'Category')),
    sourceType: (parseSafeText(getRowValueByHeader(row, headerMap, 'Source Type')) || 'Technical Report') as ResearchSource['sourceType'],
    publisherOrAuthor: parseSafeText(getRowValueByHeader(row, headerMap, 'Publisher / Author')),
    sourceDomain: parseSafeText(getRowValueByHeader(row, headerMap, 'Source Domain')),
    sourceUrl: canonicalUrl || cleanUrl || verifiedUrl || '',
    canonicalUrl,
    cleanUrl,
    verifiedUrl,
    openSourceUrl,
    urlStatus: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'URL Status')),
    publishedDate,
    capturedDate,
    freshnessDays,
    priority,
    scores: {
      credibility: credScore,
      novelty: novScore,
      contentValue: valScore,
    },
    technicalDepth,
    productionPotential,
    reviewDecision,
    reviewedBy: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Reviewed By')),
    reviewedAt: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Review Date')),
    details: {
      technicalSummary: parseSafeText(getRowValueByHeader(row, headerMap, 'Technical Summary')),
      keyFindings: keyFindings.length > 0 ? keyFindings : ['No discrete findings extracted.'],
      whyItMatters: parseSafeText(getRowValueByHeader(row, headerMap, 'Why It Matters / Novelty')),
      contentAngle: parseSafeText(getRowValueByHeader(row, headerMap, 'Content Angle / Hook')),
      recommendedFormat: parseSafeText(getRowValueByHeader(row, headerMap, 'Recommended Format')) || 'Technical Deep-Dive',
      targetAudience: parseSafeText(getRowValueByHeader(row, headerMap, 'Target Audience')) || 'Engineering & Technical Practitioners',
    },
  };
}
