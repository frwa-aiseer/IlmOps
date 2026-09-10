/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  sourceRepository,
  contentJobRepository,
  configRepository,
  manualSourceRepository,
  activityLogRepository,
} from '../repositories/index.ts';
import {
  readOnlyWorkspaceClient,
  ReadOnlyWorkspaceClient,
} from '../integrations/googleWorkspace/workspaceClient.ts';
import { WORKBOOK_CONFIG } from '../config/contentOpsWorkbook.ts';
import { SHEET_NAMES, ResearchSource, ContentJob } from '../../shared/contracts/contentOps.ts';
import type {
  LiveDataRepositoryHealth,
  LiveResearchSourceCompact,
  LiveContentJobCompact,
  LiveSourceListResponse,
  LiveJobListResponse,
  LiveDataOriginProof,
} from '../../shared/contracts/livePreview.ts';

/**
 * Server-side Data Consistency Guard:
 * Strictly prevents any response from claiming live while containing fixture/mock provenance.
 */
export function assertNoFixtureProvenance(sources: Array<{ id?: string; urlKey?: string; title?: string }>, jobs: Array<{ id?: string; sourceUrlKey?: string }>) {
  const fixtureKeySignatures = [
    'example-source-key',
    'electrical-substation-iec-61850',
    'agentic context window compaction',
  ];

  for (const s of sources) {
    const key = (s.urlKey || '').toLowerCase();
    const title = (s.title || '').toLowerCase();
    const id = (s.id || '').toUpperCase();
    if (
      id === 'SRC-AI-01' ||
      id === 'SRC-EE-01' ||
      fixtureKeySignatures.some((sig) => key.includes(sig) || title.includes(sig))
    ) {
      const err: any = new Error(
        'Data consistency guard violation: Fixture source record detected in live stream.'
      );
      err.code = 'LIVE_DATA_CORRUPTED_WITH_FIXTURE';
      err.statusCode = 500;
      err.userActionableMessage = 'Internal integrity guard prevented serving mock fixture data in live mode.';
      throw err;
    }
  }

  for (const j of jobs) {
    const key = (j.sourceUrlKey || '').toLowerCase();
    const id = (j.id || '').toUpperCase();
    if (
      id === 'CNT-0028-01' ||
      id === 'CNT-0028-02' ||
      id.startsWith('JOB-AI-') ||
      key === 'example-source-key'
    ) {
      const err: any = new Error(
        'Data consistency guard violation: Fixture content job detected in live stream.'
      );
      err.code = 'LIVE_DATA_CORRUPTED_WITH_FIXTURE';
      err.statusCode = 500;
      err.userActionableMessage = 'Internal integrity guard prevented serving mock fixture data in live mode.';
      throw err;
    }
  }
}

/**
 * Resolves the best available URL without fabricating data.
 */
function resolveBestUrl(
  sourceUrl?: string,
  canonicalUrl?: string
): { bestUrl: string | null; urlStatus: 'Valid' | 'Needs Verification' } {
  const isHttpUrl = (u?: string) =>
    Boolean(u && (u.trim().startsWith('http://') || u.trim().startsWith('https://')));

  if (isHttpUrl(canonicalUrl)) {
    return { bestUrl: canonicalUrl!.trim(), urlStatus: 'Valid' };
  }
  if (isHttpUrl(sourceUrl)) {
    return { bestUrl: sourceUrl!.trim(), urlStatus: 'Valid' };
  }
  return { bestUrl: null, urlStatus: 'Needs Verification' };
}

/**
 * Projects a raw ResearchSource into a safe, compact LiveResearchSourceCompact.
 * Strips raw spreadsheet rows, prompt snapshots, and confidential internal fields.
 */
export function projectToCompactSource(source: ResearchSource): LiveResearchSourceCompact {
  const { bestUrl, urlStatus } = resolveBestUrl(source.sourceUrl, source.canonicalUrl);
  const nicheLabel =
    source.nicheId === 'electrical_energy'
      ? 'Electrical Design, Estimation & Energy'
      : 'AI & Data Engineering';

  const hasUrlKey = Boolean(source.urlKey && source.urlKey.trim().length > 0);

  return {
    id: source.id,
    title: source.title,
    nicheId: source.nicheId,
    nicheLabel,
    sourceType: source.sourceType,
    publisherOrAuthor: source.publisherOrAuthor,
    sourceDomain: source.sourceDomain,
    capturedDate: source.capturedDate,
    publishedDate: source.publishedDate,
    priority: source.priority,
    scores: {
      credibility: source.scores?.credibility ?? null,
      novelty: source.scores?.novelty ?? null,
      contentValue: source.scores?.contentValue ?? null,
    },
    reviewDecision: source.reviewDecision,
    technicalDepth: source.technicalDepth,
    productionPotential: source.productionPotential,
    sourceUrl: source.sourceUrl,
    canonicalUrl: source.canonicalUrl,
    bestUrl,
    urlStatus,
    urlKey: source.urlKey,
    hasUrlKey,
    details: {
      technicalSummary: source.details?.technicalSummary,
      keyTakeaways: source.details?.keyFindings,
      whyItMatters: source.details?.whyItMatters,
      targetAudience: source.details?.targetAudience,
      contentAngle: source.details?.contentAngle,
      recommendedFormat: source.details?.recommendedFormat,
    },
  };
}

/**
 * Projects a ContentJob into a safe, compact LiveContentJobCompact.
 * Strictly redacts all 4 prompt/social copy snapshots.
 */
export function projectToCompactJob(job: ContentJob): LiveContentJobCompact {
  return {
    id: job.id,
    sourceUrlKey: job.sourceUrlKey,
    sourceTitle: job.sourceTitle,
    targetAccount: job.targetAccount,
    platform: job.platform,
    contentType: job.contentType,
    variantLabel: job.variantLabel,
    assignedProducer: job.producer,
    qcReviewer: job.qcReviewer,
    publishingOwner: job.publishingOwner,
    productionStatus: job.productionStatus,
    qcStatus: job.qcStatus,
    scheduledDate: job.scheduledDate,
    publishedDate: job.publishedDate,
    createdAt: job.lastUpdated,
    updatedAt: job.lastUpdated,
  };
}

export class LivePreviewService {
  public workspaceAdapter: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient;

  /**
   * Computes actual populated record counts and repository health.
   * Explicitly separates actual mapped record counts from Google Sheets grid capacities.
   */
  async getLiveRepositoryHealth(accessToken?: string): Promise<LiveDataRepositoryHealth> {
    if (!accessToken) {
      const err: any = new Error('Google Workspace authorization required.');
      err.code = 'AUTHORIZATION_REQUIRED';
      err.statusCode = 401;
      err.userActionableMessage =
        'Please sign in with your authorized Google account to inspect the live Operations Hub.';
      throw err;
    }

    // 1. Fetch grid capacities from Google Sheets metadata
    const gridCapacities: Record<string, number | null> = {};
    try {
      const meta = await this.workspaceAdapter.fetchSpreadsheetMetadata(
        accessToken,
        WORKBOOK_CONFIG.spreadsheetId
      );
      meta.sheets.forEach((sheet) => {
        if (sheet.title && sheet.gridProperties?.rowCount !== undefined) {
          gridCapacities[sheet.title] = sheet.gridProperties.rowCount;
        }
      });
    } catch {
      // Tolerant failure: metadata not reachable or rate-limited
    }

    // 2. Fetch actual populated records via P05 repositories with strict requireLive
    const [
      aiSourcesResult,
      electricalSourcesResult,
      combinedSourcesResult,
      jobsResult,
      config,
      manualEntriesResult,
      activityLogsResult,
    ] = await Promise.all([
      sourceRepository.listSources(SHEET_NAMES.AI_CONTENT_QUEUE, {
        accessToken,
        requireLive: true,
        pageSize: 100,
      }),
      sourceRepository.listSources(SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE, {
        accessToken,
        requireLive: true,
        pageSize: 100,
      }),
      sourceRepository.listSources({ accessToken, requireLive: true, pageSize: 100 }),
      contentJobRepository.listJobs({ accessToken, requireLive: true, pageSize: 100 }),
      configRepository.getAllConfig({ accessToken }),
      manualSourceRepository.listManualEntries({ accessToken, pageSize: 100 }),
      activityLogRepository.listActivityLogs({ accessToken, pageSize: 100 }),
    ]);

    const allSources = combinedSourcesResult.items;
    const allJobs = jobsResult.items;

    // Server-side Data Consistency Guard: reject any response contaminated by mock fixtures
    assertNoFixtureProvenance(allSources, allJobs);

    // Actual Populated Counts
    const aiCount = aiSourcesResult.actualRecordCount;
    const electricalCount = electricalSourcesResult.actualRecordCount;
    const combinedCount = aiCount + electricalCount;
    const uniqueCount = allSources.length; // deduplicated count from listSources()

    // 3. Relational Key Join: check for orphan ContentJobs
    const sourceUrlKeySet = new Set(
      allSources.map((s) => s.urlKey.trim().toLowerCase()).filter(Boolean)
    );
    const orphanJobs = allJobs.filter((job) => {
      const key = job.sourceUrlKey.trim().toLowerCase();
      return !key || !sourceUrlKeySet.has(key);
    });

    // 4. Quality Diagnostics
    // Duplicate URL Keys within and across queues
    const urlKeyFrequency = new Map<string, number>();
    allSources.forEach((s) => {
      const key = s.urlKey.trim().toLowerCase();
      if (key) {
        urlKeyFrequency.set(key, (urlKeyFrequency.get(key) || 0) + 1);
      }
    });

    const duplicateUrlKeys: string[] = [];
    urlKeyFrequency.forEach((count, key) => {
      if (count > 1) {
        duplicateUrlKeys.push(key);
      }
    });

    // Blank URL keys
    const blankUrlKeyCount = allSources.filter((s) => !s.urlKey || !s.urlKey.trim()).length;

    // Incomplete / invalid sources (missing title or missing URL)
    const invalidIncompleteSourceCount = allSources.filter(
      (s) => !s.title || (!s.sourceUrl && !s.canonicalUrl)
    ).length;

    // Manual sources ready to queue
    const manualReadyToQueueCount = manualEntriesResult.items.filter(
      (m) =>
        m.status?.toLowerCase().includes('ready') ||
        m.manualEntryStatus?.toLowerCase().includes('ready')
    ).length;

    // Issues list and overall quality state
    const issues: string[] = [];
    if (duplicateUrlKeys.length > 0) {
      issues.push(
        `Found ${duplicateUrlKeys.length} duplicate URL Key(s) in research queue: ${duplicateUrlKeys.join(', ')}`
      );
    }
    if (blankUrlKeyCount > 0) {
      issues.push(`Found ${blankUrlKeyCount} source record(s) with blank URL Keys.`);
    }
    if (orphanJobs.length > 0) {
      issues.push(`Found ${orphanJobs.length} orphan ContentJob(s) with no matching research source.`);
    }
    if (invalidIncompleteSourceCount > 0) {
      issues.push(
        `Found ${invalidIncompleteSourceCount} research source(s) with incomplete title or URL.`
      );
    }

    let qualityStatus: 'Healthy' | 'Warning' | 'Error' = 'Healthy';
    if (orphanJobs.length > 5) {
      qualityStatus = 'Error';
    } else if (issues.length > 0) {
      qualityStatus = 'Warning';
    }

    // 5. One Source -> Many Jobs Fan-Out Verification
    // Group jobs by sourceUrlKey
    const jobsBySourceKey = new Map<string, ContentJob[]>();
    allJobs.forEach((job) => {
      const key = job.sourceUrlKey.trim().toLowerCase();
      if (key) {
        if (!jobsBySourceKey.has(key)) {
          jobsBySourceKey.set(key, []);
        }
        jobsBySourceKey.get(key)!.push(job);
      }
    });

    let multiVariantExample: LiveDataRepositoryHealth['relationalFanOut']['multiVariantExample'] = null;
    let hasMultiVariantSource = false;
    let fanOutMessage = 'No live multi-variant source exists yet.';

    for (const [key, jobs] of jobsBySourceKey.entries()) {
      if (jobs.length >= 2) {
        const matchingSource = allSources.find((s) => s.urlKey.trim().toLowerCase() === key);
        hasMultiVariantSource = true;
        fanOutMessage = `Live multi-variant source verified. 1 Source fans out to ${jobs.length} ContentJobs.`;
        multiVariantExample = {
          sourceUrlKey: matchingSource?.urlKey || key,
          sourceTitle: matchingSource?.title || jobs[0].sourceTitle || 'Untitled Source',
          niche:
            matchingSource?.nicheId === 'electrical_energy'
              ? 'Electrical Design, Estimation & Energy'
              : 'AI & Data Engineering',
          jobs: jobs.map((j) => ({
            id: j.id,
            targetAccount: j.targetAccount,
            platform: j.platform,
            contentType: j.contentType,
            variantLabel: j.variantLabel,
            status: j.productionStatus,
          })),
        };
        break; // Stop at first real relationship example
      }
    }

    const workbookIdSuffix = WORKBOOK_CONFIG.spreadsheetId.slice(-6);
    const fetchedAt = new Date().toISOString();
    const originProof: LiveDataOriginProof = {
      dataOrigin: 'live-google-sheets',
      repositoryMode: 'live',
      authenticated: true,
      workbookIdSuffix,
      fetchedAt,
      sourceCount: combinedCount,
    };

    return {
      researchSources: {
        aiCount,
        electricalCount,
        combinedCount,
        uniqueCount,
        aiGridCapacity: gridCapacities[SHEET_NAMES.AI_CONTENT_QUEUE] ?? null,
        electricalGridCapacity: gridCapacities[SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE] ?? null,
      },
      contentJobs: {
        totalCount: jobsResult.actualRecordCount,
        orphanCount: orphanJobs.length,
        gridCapacity: gridCapacities[SHEET_NAMES.APP_CONTENT_JOBS] ?? null,
      },
      brandProfiles: {
        activeCount: config.brandProfiles.filter((b) => b.active !== false).length,
        totalCount: config.brandProfiles.length,
        gridCapacity: gridCapacities[SHEET_NAMES.BRAND_PROFILES] ?? null,
      },
      contentTypes: {
        activeCount: config.contentTypes.filter((c) => c.active !== false).length,
        totalCount: config.contentTypes.length,
        gridCapacity: gridCapacities[SHEET_NAMES.CONTENT_TYPES] ?? null,
      },
      teamMembers: {
        activeCount: config.teamMembers.filter((t) => t.active !== false).length,
        totalCount: config.teamMembers.length,
        gridCapacity: gridCapacities[SHEET_NAMES.TEAM_MEMBERS] ?? null,
      },
      manualSources: {
        totalCount: manualEntriesResult.actualRecordCount,
        readyToQueueCount: manualReadyToQueueCount,
        gridCapacity: gridCapacities[SHEET_NAMES.MANUAL_SOURCE_ENTRY] ?? null,
      },
      activityLogs: {
        totalCount: activityLogsResult.actualRecordCount,
        gridCapacity: gridCapacities[SHEET_NAMES.APP_ACTIVITY_LOG] ?? null,
      },
      quality: {
        duplicateUrlKeyCount: duplicateUrlKeys.length,
        duplicateUrlKeys,
        blankUrlKeyCount,
        invalidIncompleteSourceCount,
        orphanJobCount: orphanJobs.length,
        manualReadyToQueueCount,
        malformedMappedRecordCount: 0,
        status: qualityStatus,
        issues,
      },
      relationalFanOut: {
        hasMultiVariantSource,
        multiVariantExample,
        message: fanOutMessage,
      },
      mode: 'live_workspace_read_only',
      dataOrigin: 'live-google-sheets',
      repositoryMode: 'live',
      authenticated: true,
      workbookIdSuffix,
      fetchedAt,
      originProof,
      safetyGuarantee:
        'Strictly read-only. Zero write operations. Prompt snapshots, raw rows, and tokens redacted.',
      lastAuditedAt: fetchedAt,
    };
  }

  /**
   * Retrieves paginated live research sources with niche filtering and search.
   */
  async getLiveSources(options: {
    niche?: string;
    search?: string;
    page?: number;
    pageSize?: number;
    queue?: string;
    accessToken?: string;
  }): Promise<LiveSourceListResponse> {
    if (!options.accessToken) {
      const err: any = new Error('Google Workspace authorization required.');
      err.code = 'AUTHORIZATION_REQUIRED';
      err.statusCode = 401;
      err.userActionableMessage =
        'Please sign in with your authorized Google account to view live research sources.';
      throw err;
    }

    const nicheId =
      options.niche === 'ai_data' || options.niche === 'electrical_energy'
        ? options.niche
        : undefined;

    const result = await sourceRepository.listSources(options.queue, {
      nicheId,
      search: options.search,
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      accessToken: options.accessToken,
      requireLive: true,
    });

    // Server-side Data Consistency Guard
    assertNoFixtureProvenance(result.items, []);

    const workbookIdSuffix = WORKBOOK_CONFIG.spreadsheetId.slice(-6);
    const fetchedAt = new Date().toISOString();
    const originProof: LiveDataOriginProof = {
      dataOrigin: 'live-google-sheets',
      repositoryMode: 'live',
      authenticated: true,
      workbookIdSuffix,
      fetchedAt,
      sourceCount: result.actualRecordCount,
    };

    return {
      items: result.items.map(projectToCompactSource),
      pagination: result.pagination,
      actualRecordCount: result.actualRecordCount,
      mode: 'live_workspace_read_only',
      dataOrigin: 'live-google-sheets',
      repositoryMode: 'live',
      authenticated: true,
      workbookIdSuffix,
      fetchedAt,
      originProof,
    };
  }

  /**
   * Retrieves paginated live ContentJobs with search and safe projection.
   */
  async getLiveJobs(options: {
    search?: string;
    page?: number;
    pageSize?: number;
    accessToken?: string;
  }): Promise<LiveJobListResponse> {
    if (!options.accessToken) {
      const err: any = new Error('Google Workspace authorization required.');
      err.code = 'AUTHORIZATION_REQUIRED';
      err.statusCode = 401;
      err.userActionableMessage =
        'Please sign in with your authorized Google account to view live content jobs.';
      throw err;
    }

    const result = await contentJobRepository.listJobs({
      search: options.search,
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      accessToken: options.accessToken,
      requireLive: true,
    });

    // Server-side Data Consistency Guard
    assertNoFixtureProvenance([], result.items);

    const workbookIdSuffix = WORKBOOK_CONFIG.spreadsheetId.slice(-6);
    const fetchedAt = new Date().toISOString();
    const originProof: LiveDataOriginProof = {
      dataOrigin: 'live-google-sheets',
      repositoryMode: 'live',
      authenticated: true,
      workbookIdSuffix,
      fetchedAt,
      sourceCount: result.actualRecordCount,
    };

    return {
      items: result.items.map(projectToCompactJob),
      pagination: result.pagination,
      actualRecordCount: result.actualRecordCount,
      mode: 'live_workspace_read_only',
      dataOrigin: 'live-google-sheets',
      repositoryMode: 'live',
      authenticated: true,
      workbookIdSuffix,
      fetchedAt,
      originProof,
    };
  }
}

export const livePreviewService = new LivePreviewService();
