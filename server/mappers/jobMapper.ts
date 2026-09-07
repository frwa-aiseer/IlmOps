/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  ContentJob,
  TargetAccount,
  Platform,
  ContentType,
  ProductionStatus,
  QCStatus,
  PublishingStatus,
} from '../../shared/contracts/contentOps.ts';
import { getRowValueByHeader } from '../utils/headerMapping.ts';
import {
  parseSafeText,
  parseSafeOptionalText,
  parseSafeDate,
  parseSafeNumber,
} from '../utils/dataParsing.ts';

/**
 * Maps a raw row from APP_Content_Jobs (Row 1 header row) into a ContentJob entity.
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. Resolves fields dynamically by exact header name using headerMap.
 * 2. Links to ResearchSource via: ContentJob.sourceUrlKey === ResearchSource.urlKey.
 * 3. Does not duplicate entire research records inside ContentJob.
 * 4. Never crashes on malformed fields.
 */
export function mapRowToContentJob(
  row: unknown[],
  headerMap: Map<string, number>
): ContentJob | null {
  const jobId = parseSafeText(getRowValueByHeader(row, headerMap, 'Job ID'));
  const sourceUrlKey = parseSafeText(getRowValueByHeader(row, headerMap, 'Source URL Key'));

  // Detect empty row
  if (!jobId && !sourceUrlKey) {
    return null;
  }

  const rawJobStatus = parseSafeText(getRowValueByHeader(row, headerMap, 'Job Status'));
  let productionStatus: ProductionStatus = 'Backlog';
  if (rawJobStatus.includes('Production')) productionStatus = 'In Production';
  else if (rawJobStatus.includes('Draft')) productionStatus = 'Draft Ready';
  else if (rawJobStatus.includes('Final')) productionStatus = 'Finalizing';
  else if (rawJobStatus.includes('QC')) productionStatus = 'QC Review';
  else if (rawJobStatus.includes('Ready')) productionStatus = 'Ready to Publish';

  const rawQcStatus = parseSafeText(getRowValueByHeader(row, headerMap, 'QC Status'));
  let qcStatus: QCStatus = 'Not Started';
  if (rawQcStatus.includes('Pending')) qcStatus = 'Pending Review';
  else if (rawQcStatus.includes('Changes') || rawQcStatus.includes('Request')) qcStatus = 'Changes Requested';
  else if (rawQcStatus.includes('Approve')) qcStatus = 'Approved';

  const scheduledDate = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Scheduled Date'));
  const publishedDate = parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Published Date'));
  let publishingStatus: PublishingStatus = 'Unscheduled';
  if (publishedDate) publishingStatus = 'Published';
  else if (scheduledDate) publishingStatus = 'Scheduled';

  const targetAccount = (parseSafeText(getRowValueByHeader(row, headerMap, 'Target Account')) || 'PYCODEAI-LINKEDIN') as TargetAccount;
  const platform = (parseSafeText(getRowValueByHeader(row, headerMap, 'Platform')) || 'LinkedIn') as Platform;
  const contentType = (parseSafeText(getRowValueByHeader(row, headerMap, 'Content Type')) || 'Technical Deep-Dive') as ContentType;
  const priority = (parseSafeText(getRowValueByHeader(row, headerMap, 'Priority')) || 'P2') as 'P1' | 'P2' | 'P3';

  const wordCount = parseSafeNumber(getRowValueByHeader(row, headerMap, 'Word Count'), 350);
  const targetLength = parseSafeNumber(getRowValueByHeader(row, headerMap, 'Target Words') || getRowValueByHeader(row, headerMap, 'Target Length'), 400);

  const createdAt = parseSafeDate(getRowValueByHeader(row, headerMap, 'Created At')) || new Date().toISOString();
  const updatedAt = parseSafeDate(getRowValueByHeader(row, headerMap, 'Updated At')) || createdAt;

  return {
    id: jobId || 'UNKNOWN_JOB',
    sourceUrlKey: sourceUrlKey || '',
    sourceNiche: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Source Niche')),
    sourceTitle: parseSafeText(getRowValueByHeader(row, headerMap, 'Source Title')) || 'Untitled Source',
    sourceType: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Source Type')),
    sourceFinalUrl: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Source Final URL')),
    targetAccount,
    platform,
    contentType,
    variantLabel: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Variant Label')),
    priority,
    producer: parseSafeText(getRowValueByHeader(row, headerMap, 'Assigned Producer')) || 'Unassigned',
    qcReviewer: parseSafeText(getRowValueByHeader(row, headerMap, 'QC Reviewer')) || 'Unassigned',
    publishingOwner: parseSafeText(getRowValueByHeader(row, headerMap, 'Publishing Owner')) || 'Unassigned',
    productionStatus,
    qcStatus,
    qcNotes: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'QC Notes')),
    publishingStatus,
    lastUpdated: updatedAt,
    dueDeadline: parseSafeDate(getRowValueByHeader(row, headerMap, 'Scheduled Date')) || updatedAt,
    wordCount,
    targetLength,
    prompts: {
      googleLLMProductionPrompt: parseSafeText(getRowValueByHeader(row, headerMap, 'Production Prompt Snapshot')),
      chatGPTAssetFinalizationPrompt: parseSafeText(getRowValueByHeader(row, headerMap, 'Finalization Prompt Snapshot')),
      socialCopyPrompt: parseSafeText(getRowValueByHeader(row, headerMap, 'Social Copy Prompt Snapshot')),
    },
    draftAssetLink: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Draft Asset Link')),
    finalAssetLink: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Final Asset Link')),
    finalSocialCopy: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Final Social Copy')),
    productionStart: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Production Start')),
    productionComplete: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Production Complete')),
    scheduledDate,
    publishedDate,
    publishedPostUrl: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Published Post URL')),
    metrics: {
      impressions: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Impressions'), 0),
      likes: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Likes / Reactions'), 0),
      comments: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Comments'), 0),
      shares: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Shares / Reposts'), 0),
      saves: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Saves'), 0),
      clicks: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Clicks'), 0),
      followersGained: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Followers Gained'), 0),
      leads: parseSafeNumber(getRowValueByHeader(row, headerMap, 'Leads / Enquiries'), 0),
    },
    createdBy: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Created By')),
    createdAt,
    updatedBy: parseSafeOptionalText(getRowValueByHeader(row, headerMap, 'Updated By')),
    updatedAt,
  };
}
