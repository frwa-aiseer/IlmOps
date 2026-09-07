/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResearchSource, ContentJob } from '../../shared/contracts/contentOps.ts';

export interface SourceJobLinkResult {
  sourceUrlKey: string;
  sourceTitle?: string;
  linkedJobsCount: number;
  linkedJobs: ContentJob[];
}

/**
 * Pure helper to link ResearchSource to one or many ContentJob variants
 * using the exact relational key:
 *
 * ResearchSource.urlKey === ContentJob.sourceUrlKey
 *
 * CRITICAL ARCHITECTURAL RULES:
 * 1. ResearchSource and ContentJob are SEPARATE entities.
 * 2. One ResearchSource can have MANY ContentJobs across different brands/platforms.
 * 3. Never duplicate the entire research source record into every job.
 */
export function findJobsForSource(
  source: Pick<ResearchSource, 'urlKey' | 'title'>,
  allJobs: ContentJob[]
): SourceJobLinkResult {
  const linkedJobs = allJobs.filter((job) => job.sourceUrlKey === source.urlKey);

  return {
    sourceUrlKey: source.urlKey,
    sourceTitle: source.title,
    linkedJobsCount: linkedJobs.length,
    linkedJobs,
  };
}

/**
 * Finds all content jobs matching a specific Source URL Key string.
 */
export function findJobsBySourceUrlKey(
  sourceUrlKey: string,
  allJobs: ContentJob[]
): ContentJob[] {
  if (!sourceUrlKey) return [];
  return allJobs.filter((job) => job.sourceUrlKey === sourceUrlKey);
}

/**
 * Validates whether all jobs referencing a Source URL Key resolve to the source.
 */
export function validateSourceToJobsRelationship(
  sourceUrlKey: string,
  jobs: ContentJob[]
): {
  isValid: boolean;
  matchingJobIds: string[];
  mismatchedJobIds: string[];
} {
  const matchingJobIds: string[] = [];
  const mismatchedJobIds: string[] = [];

  jobs.forEach((job) => {
    if (job.sourceUrlKey === sourceUrlKey) {
      matchingJobIds.push(job.id);
    } else {
      mismatchedJobIds.push(job.id);
    }
  });

  return {
    isValid: mismatchedJobIds.length === 0,
    matchingJobIds,
    mismatchedJobIds,
  };
}
