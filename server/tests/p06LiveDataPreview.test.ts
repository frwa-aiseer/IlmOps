/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import assert from 'node:assert/strict';
import {
  livePreviewService,
  projectToCompactSource,
  projectToCompactJob,
  assertNoFixtureProvenance,
} from '../services/livePreviewService.ts';
import {
  sourceRepository,
  contentJobRepository,
  configRepository,
  manualSourceRepository,
  activityLogRepository,
} from '../repositories/index.ts';
import {
  ReadOnlyWorkspaceClient,
  SpreadsheetMetadata,
} from '../integrations/googleWorkspace/workspaceClient.ts';
import { SHEET_NAMES } from '../../shared/contracts/contentOps.ts';
import {
  SOURCE_QUEUE_HEADER_ROW_FIXTURE,
  APP_CONTENT_JOBS_HEADER_ROW_FIXTURE,
  BRAND_PROFILES_HEADER_ROW_FIXTURE,
  CONTENT_TYPES_HEADER_ROW_FIXTURE,
  TEAM_MEMBERS_HEADER_ROW_FIXTURE,
  MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE,
  LISTS_CONFIG_HEADER_ROW_FIXTURE,
  APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE,
} from '../fixtures/testFixtures.ts';

class MockLiveReadOnlyWorkspaceClient extends ReadOnlyWorkspaceClient {
  async fetchSpreadsheetMetadata(
    _accessToken: string,
    _spreadsheetId: string
  ): Promise<SpreadsheetMetadata> {
    return {
      title: 'ALLIN Content Operations Hub — Research, Production & KPI',
      sheets: [
        {
          sheetId: 101,
          title: SHEET_NAMES.AI_CONTENT_QUEUE,
          index: 0,
          gridProperties: { rowCount: 3000, columnCount: 31 },
        },
        {
          sheetId: 102,
          title: SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE,
          index: 1,
          gridProperties: { rowCount: 1600, columnCount: 31 },
        },
        {
          sheetId: 103,
          title: SHEET_NAMES.APP_CONTENT_JOBS,
          index: 2,
          gridProperties: { rowCount: 5000, columnCount: 40 },
        },
        {
          sheetId: 104,
          title: SHEET_NAMES.BRAND_PROFILES,
          index: 3,
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
        {
          sheetId: 105,
          title: SHEET_NAMES.CONTENT_TYPES,
          index: 4,
          gridProperties: { rowCount: 100, columnCount: 8 },
        },
        {
          sheetId: 106,
          title: SHEET_NAMES.TEAM_MEMBERS,
          index: 5,
          gridProperties: { rowCount: 100, columnCount: 8 },
        },
        {
          sheetId: 107,
          title: SHEET_NAMES.MANUAL_SOURCE_ENTRY,
          index: 6,
          gridProperties: { rowCount: 500, columnCount: 31 },
        },
        {
          sheetId: 108,
          title: SHEET_NAMES.LISTS_CONFIG,
          index: 7,
          gridProperties: { rowCount: 100, columnCount: 10 },
        },
        {
          sheetId: 109,
          title: SHEET_NAMES.APP_ACTIVITY_LOG,
          index: 8,
          gridProperties: { rowCount: 5000, columnCount: 8 },
        },
      ],
    };
  }

  async fetchSheetHeaderRow(
    _accessToken: string,
    _spreadsheetId: string,
    sheetTitle: string,
    _rowNumber: number
  ): Promise<string[]> {
    switch (sheetTitle) {
      case SHEET_NAMES.AI_CONTENT_QUEUE:
      case SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE:
        return [...SOURCE_QUEUE_HEADER_ROW_FIXTURE];
      case SHEET_NAMES.APP_CONTENT_JOBS:
        return [...APP_CONTENT_JOBS_HEADER_ROW_FIXTURE];
      case SHEET_NAMES.BRAND_PROFILES:
        return [...BRAND_PROFILES_HEADER_ROW_FIXTURE];
      case SHEET_NAMES.CONTENT_TYPES:
        return [...CONTENT_TYPES_HEADER_ROW_FIXTURE];
      case SHEET_NAMES.TEAM_MEMBERS:
        return [...TEAM_MEMBERS_HEADER_ROW_FIXTURE];
      case SHEET_NAMES.MANUAL_SOURCE_ENTRY:
        return [...MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE];
      case SHEET_NAMES.LISTS_CONFIG:
        return [...LISTS_CONFIG_HEADER_ROW_FIXTURE];
      case SHEET_NAMES.APP_ACTIVITY_LOG:
        return [...APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE];
      default:
        return [];
    }
  }

  async fetchSheetHeaders(
    accessToken: string,
    spreadsheetId: string,
    sheetTitle: string,
    rowNumber: number
  ): Promise<string[]> {
    return this.fetchSheetHeaderRow(accessToken, spreadsheetId, sheetTitle, rowNumber);
  }

  async fetchSheetRowRange(
    _accessToken: string,
    _spreadsheetId: string,
    sheetTitle: string,
    _startRow: number,
    _endRow: number
  ): Promise<string[][]> {
    if (sheetTitle === SHEET_NAMES.AI_CONTENT_QUEUE) {
      return [
        [
          '2026-09-07', '2026-09-06', '1', 'AI & Data Engineering', 'LLM Inference Optimization',
          'KV Cache, Latency', 'ArXiv Paper', 'DeepSeek-V3 Inference Acceleration Report',
          'DeepSeek AI', 'https://arxiv.org/abs/2412.00001', 'deepseek-v3-inference-acceleration',
          'arxiv.org', 'Technical breakdown of multi-head latent attention',
          'Reduces memory footprint by 40%', 'High relevance to production AI engineers',
          'Why standard KV caches fail at scale', 'Architecture Analysis + Infographic',
          'AI Engineers, LLM Practitioners', '5', '5', '5', 'P1', 'Approved',
          'Moneeb Akhtar', '', 'Approved for production', 'Batch_01', 'Staged',
          'Moneeb Akhtar', '2026-09-07', 'Yes',
        ],
      ];
    }

    if (sheetTitle === SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE) {
      return [
        [
          '2026-09-07', '2026-09-05', '2', 'Electrical & Power Systems', 'Substation Earthing',
          'Ground Grid, Touch Potential', 'IEEE Standard', 'IEEE 80 Substation Ground Grid Design',
          'IEEE PES', 'https://standards.ieee.org/standard/80-2013.html', 'ieee-80-ground-grid-safety-standard',
          'standards.ieee.org', 'Comparative safety calculations under fault currents',
          'Conductor sizing optimization', 'Direct value for power utility engineers',
          'Common earthing mistakes in HV substations', 'Technical Guide + Carousel',
          'Substation Engineers, Protection Specialists', '5', '4', '5', 'P1', 'Approved',
          'Farwa Jafar', '', 'Verified calculations', 'Batch_02', 'Staged',
          'Farwa Jafar', '2026-09-07', 'Yes',
        ],
      ];
    }

    if (sheetTitle === SHEET_NAMES.APP_CONTENT_JOBS) {
      // Live APP_Content_Jobs sheet is currently empty (0 populated rows)
      return [];
    }

    if (sheetTitle === SHEET_NAMES.BRAND_PROFILES) {
      return [
        ['BRAND-01', 'PYCODEAI', 'Active', 'Python and AI Engineering', 'Technical deep-dives', 'Engineers', 'Professional', 'GitHub, LinkedIn', 'Moneeb', '2026-09-01'],
      ];
    }

    if (sheetTitle === SHEET_NAMES.CONTENT_TYPES) {
      return [
        ['CT-01', 'Infographic', 'Visual architecture breakdown', 'Active', 'Image', 'LinkedIn', 'Figma', '2026-09-01'],
      ];
    }

    if (sheetTitle === SHEET_NAMES.TEAM_MEMBERS) {
      return [
        ['TM-01', 'Moneeb Akhtar', 'moneeb@pycode.ai', 'Admin', 'Active', 'AI Specialist', '2026-09-01', ''],
      ];
    }

    if (sheetTitle === SHEET_NAMES.MANUAL_SOURCE_ENTRY) {
      return [];
    }

    if (sheetTitle === SHEET_NAMES.APP_ACTIVITY_LOG) {
      return [
        ['LOG-01', '2026-09-07T10:00:00Z', 'READ_AUDIT', 'Moneeb', 'SUCCESS', 'Operations Hub audit performed', '', ''],
      ];
    }

    return [];
  }
}

async function runP06LiveDataPreviewAudit() {
  console.log('================================================================');
  console.log('P06 AUDIT: TRUTHFUL LIVE DATA REPOSITORY & ORIGIN PROOF SUITE');
  console.log('================================================================');

  let passedAssertions = 0;

  // --------------------------------------------------------------------------
  // TEST 1: Strict Rejection of Unauthenticated Requests (No Silent Fallback)
  // --------------------------------------------------------------------------
  console.log('\n[1] Verifying Strict Rejection of Unauthenticated Requests (No Silent Fallback)...');

  // Test getLiveRepositoryHealth without token
  await assert.rejects(
    async () => {
      await livePreviewService.getLiveRepositoryHealth(undefined);
    },
    (err: any) => {
      assert.equal(err.code, 'AUTHORIZATION_REQUIRED');
      assert.equal(err.statusCode, 401);
      assert.ok(err.userActionableMessage.includes('sign in'));
      return true;
    },
    'Health endpoint must reject with AUTHORIZATION_REQUIRED when token is missing'
  );
  passedAssertions++;

  // Test getLiveSources without token
  await assert.rejects(
    async () => {
      await livePreviewService.getLiveSources({ accessToken: undefined });
    },
    (err: any) => {
      assert.equal(err.code, 'AUTHORIZATION_REQUIRED');
      assert.equal(err.statusCode, 401);
      return true;
    },
    'Sources endpoint must reject with AUTHORIZATION_REQUIRED when token is missing'
  );
  passedAssertions++;

  // Test getLiveJobs without token
  await assert.rejects(
    async () => {
      await livePreviewService.getLiveJobs({ accessToken: undefined });
    },
    (err: any) => {
      assert.equal(err.code, 'AUTHORIZATION_REQUIRED');
      assert.equal(err.statusCode, 401);
      return true;
    },
    'Jobs endpoint must reject with AUTHORIZATION_REQUIRED when token is missing'
  );
  passedAssertions++;

  // Test sourceRepository with requireLive: true and no token
  await assert.rejects(
    async () => {
      await sourceRepository.listSources(undefined, { requireLive: true });
    },
    (err: any) => {
      assert.equal(err.code, 'AUTHORIZATION_REQUIRED');
      assert.equal(err.statusCode, 401);
      return true;
    },
    'SourceRepository must reject requireLive without token'
  );
  passedAssertions++;

  // Test contentJobRepository with requireLive: true and no token
  await assert.rejects(
    async () => {
      await contentJobRepository.listJobs({ requireLive: true });
    },
    (err: any) => {
      assert.equal(err.code, 'AUTHORIZATION_REQUIRED');
      assert.equal(err.statusCode, 401);
      return true;
    },
    'ContentJobRepository must reject requireLive without token'
  );
  passedAssertions++;
  console.log('✓ Zero silent fallback verified: all unauthenticated requests strictly throw 401 AUTHORIZATION_REQUIRED.');

  // --------------------------------------------------------------------------
  // TEST 2: Data Consistency Guard (assertNoFixtureProvenance)
  // --------------------------------------------------------------------------
  console.log('\n[2] Verifying Data Consistency Guard Against Mock Contamination...');

  // 2a. Guard must reject fixture source ID 'SRC-AI-01'
  assert.throws(
    () => {
      assertNoFixtureProvenance(
        [{ id: 'SRC-AI-01', urlKey: 'clean-url-key', title: 'Clean title' }],
        []
      );
    },
    (err: any) => {
      assert.equal(err.code, 'LIVE_DATA_CORRUPTED_WITH_FIXTURE');
      assert.equal(err.statusCode, 500);
      return true;
    },
    'assertNoFixtureProvenance must reject SRC-AI-01'
  );
  passedAssertions++;

  // 2b. Guard must reject fixture source key 'example-source-key'
  assert.throws(
    () => {
      assertNoFixtureProvenance(
        [{ id: 'LIVE-001', urlKey: 'example-source-key', title: 'Some Title' }],
        []
      );
    },
    (err: any) => {
      assert.equal(err.code, 'LIVE_DATA_CORRUPTED_WITH_FIXTURE');
      assert.equal(err.statusCode, 500);
      return true;
    },
    'assertNoFixtureProvenance must reject example-source-key'
  );
  passedAssertions++;

  // 2c. Guard must reject fixture job ID 'CNT-0028-01'
  assert.throws(
    () => {
      assertNoFixtureProvenance(
        [],
        [{ id: 'CNT-0028-01', sourceUrlKey: 'valid-key' }]
      );
    },
    (err: any) => {
      assert.equal(err.code, 'LIVE_DATA_CORRUPTED_WITH_FIXTURE');
      assert.equal(err.statusCode, 500);
      return true;
    },
    'assertNoFixtureProvenance must reject CNT-0028-01'
  );
  passedAssertions++;

  // 2d. Guard must pass clean live data
  assert.doesNotThrow(() => {
    assertNoFixtureProvenance(
      [
        {
          id: 'LIVE-SRC-01',
          urlKey: 'deepseek-v3-inference-acceleration',
          title: 'DeepSeek-V3 Inference Acceleration',
        },
      ],
      []
    );
  }, 'assertNoFixtureProvenance must allow clean live data');
  passedAssertions++;
  console.log('✓ Data consistency guard strictly blocks fixture contamination in live stream.');

  // --------------------------------------------------------------------------
  // TEST 3: Authenticated Live Operations Hub Health & Origin Proof
  // --------------------------------------------------------------------------
  console.log('\n[3] Verifying Live Health Report & Data Origin Proof...');

  // Setup Mock Live Workspace Client
  const mockClient = new MockLiveReadOnlyWorkspaceClient();
  (sourceRepository as any).client = mockClient;
  (contentJobRepository as any).client = mockClient;
  (configRepository as any).client = mockClient;
  (manualSourceRepository as any).client = mockClient;
  (activityLogRepository as any).client = mockClient;
  livePreviewService.workspaceAdapter = mockClient;

  const validToken = 'mock_valid_google_workspace_oauth_token';
  const health = await livePreviewService.getLiveRepositoryHealth(validToken);

  assert.ok(health, 'Health report must be returned');
  assert.equal(health.dataOrigin, 'live-google-sheets');
  assert.equal(health.repositoryMode, 'live');
  assert.equal(health.authenticated, true);
  assert.equal(health.workbookIdSuffix, 'WWvPgk');
  assert.ok(health.fetchedAt, 'Must have fetchedAt timestamp');
  assert.ok(health.originProof, 'Must have originProof metadata block');
  assert.equal(health.originProof.dataOrigin, 'live-google-sheets');
  assert.equal(health.originProof.workbookIdSuffix, 'WWvPgk');
  passedAssertions += 8;
  console.log(`✓ Data Origin Proof verified: Origin=${health.dataOrigin}, Mode=${health.repositoryMode}, Suffix=...${health.workbookIdSuffix}`);

  // --------------------------------------------------------------------------
  // TEST 4: Populated Record Counts vs Grid Capacities
  // --------------------------------------------------------------------------
  console.log('\n[4] Verifying Populated Record Counts vs Grid Capacities...');
  assert.equal(health.researchSources.aiCount, 1, 'AI populated count must be 1');
  assert.equal(health.researchSources.electricalCount, 1, 'Electrical populated count must be 1');
  assert.equal(health.researchSources.combinedCount, 2, 'Combined populated count must be 2');
  assert.equal(health.researchSources.uniqueCount, 2, 'Unique count must be 2');
  assert.equal(health.contentJobs.totalCount, 0, 'Content jobs populated count must be 0');

  // Verify explicit grid capacity separation
  assert.equal(health.researchSources.aiGridCapacity, 3000, 'AI grid capacity must be explicitly 3000');
  assert.equal(health.researchSources.electricalGridCapacity, 1600, 'Electrical grid capacity must be explicitly 1600');
  assert.equal(health.contentJobs.gridCapacity, 5000, 'Content jobs grid capacity must be explicitly 5000');

  assert.ok(health.safetyGuarantee.includes('read-only'), 'Must state read-only guarantee');
  assert.ok(health.safetyGuarantee.includes('Zero write'), 'Must state zero write guarantee');
  passedAssertions += 10;
  console.log('✓ Populated counts vs grid capacity separation confirmed.');

  // --------------------------------------------------------------------------
  // TEST 5: Compact Research Source Projection & Secret Redaction
  // --------------------------------------------------------------------------
  console.log('\n[5] Verifying Compact Source Projection & Secret Redaction...');
  const sourcesRes = await livePreviewService.getLiveSources({ accessToken: validToken });
  assert.equal(sourcesRes.originProof.dataOrigin, 'live-google-sheets');
  assert.equal(sourcesRes.items.length, 2);

  const sampleSource = sourcesRes.items[0];
  assert.ok(sampleSource.id);
  assert.ok(sampleSource.title);
  assert.ok(sampleSource.nicheId);
  assert.ok(sampleSource.publisherOrAuthor);
  assert.ok(sampleSource.scores);
  assert.equal(sampleSource.urlStatus, 'Valid');

  // Redaction check
  assert.equal((sampleSource as any).rawValues, undefined, 'rawValues must be omitted');
  assert.equal((sampleSource as any).accessToken, undefined, 'accessToken must never leak');
  passedAssertions += 8;
  console.log('✓ Compact source projection and secret redactions verified.');

  // --------------------------------------------------------------------------
  // TEST 6: Zero Live Content Jobs Handling & Truthful Empty State
  // --------------------------------------------------------------------------
  console.log('\n[6] Verifying Truthful Zero Jobs State (APP_Content_Jobs empty)...');
  const jobsRes = await livePreviewService.getLiveJobs({ accessToken: validToken });
  assert.equal(jobsRes.items.length, 0, 'Must have 0 jobs from empty live sheet');
  assert.equal(jobsRes.actualRecordCount, 0, 'Actual record count must be 0');
  assert.equal(jobsRes.originProof.dataOrigin, 'live-google-sheets');
  assert.equal(jobsRes.originProof.sourceCount, 0);

  // Relational fan-out check for empty jobs
  assert.equal(health.relationalFanOut.hasMultiVariantSource, false);
  assert.equal(health.relationalFanOut.multiVariantExample, null);
  assert.equal(health.relationalFanOut.message, 'No live multi-variant source exists yet.');
  passedAssertions += 7;
  console.log('✓ Truthful empty jobs state verified: "No live multi-variant source exists yet."');

  // --------------------------------------------------------------------------
  // TEST 7: Compact ContentJob Redaction (Contract Invariant)
  // --------------------------------------------------------------------------
  console.log('\n[7] Verifying Compact ContentJob 4-Prompt Redaction Invariant...');
  const sampleJobRecord: any = {
    id: 'CNT-9999-01',
    sourceUrlKey: 'clean-source-key',
    targetAccount: 'PYCODEAI-LINKEDIN',
    platform: 'LinkedIn',
    contentType: 'Infographic',
    productionStatus: 'In Production',
    qcStatus: 'Approved',
    productionPrompt: 'SECRET PROMPT 1',
    finalizationPrompt: 'SECRET PROMPT 2',
    socialCopyPrompt: 'SECRET PROMPT 3',
    finalSocialCopy: 'SECRET SOCIAL COPY 4',
  };

  const compactJob = projectToCompactJob(sampleJobRecord);
  assert.equal((compactJob as any).productionPrompt, undefined);
  assert.equal((compactJob as any).finalizationPrompt, undefined);
  assert.equal((compactJob as any).socialCopyPrompt, undefined);
  assert.equal((compactJob as any).finalSocialCopy, undefined);
  passedAssertions += 4;
  console.log('✓ ContentJob prompt redactions verified (all 4 prompts stripped).');

  // --------------------------------------------------------------------------
  // TEST 8: Niche Filtering Across Live Queues
  // --------------------------------------------------------------------------
  console.log('\n[8] Verifying Live Niche Filtering...');
  const aiOnly = await livePreviewService.getLiveSources({ niche: 'ai_data', accessToken: validToken });
  assert.equal(aiOnly.items.length, 1);
  assert.equal(aiOnly.items[0].nicheId, 'ai_data');

  const eeOnly = await livePreviewService.getLiveSources({ niche: 'electrical_energy', accessToken: validToken });
  assert.equal(eeOnly.items.length, 1);
  assert.equal(eeOnly.items[0].nicheId, 'electrical_energy');
  passedAssertions += 4;
  console.log('✓ Niche filtering across live queues verified.');

  // --------------------------------------------------------------------------
  // TEST 9: Bounded Server-Side Pagination
  // --------------------------------------------------------------------------
  console.log('\n[9] Verifying Bounded Server-Side Pagination...');
  const page1 = await livePreviewService.getLiveSources({ page: 1, pageSize: 1, accessToken: validToken });
  assert.equal(page1.pagination.page, 1);
  assert.equal(page1.pagination.pageSize, 1);
  assert.equal(page1.pagination.totalItems, 2);
  assert.equal(page1.pagination.totalPages, 2);
  assert.equal(page1.items.length, 1);
  passedAssertions += 5;
  console.log('✓ Bounded server-side pagination verified.');

  // --------------------------------------------------------------------------
  // TEST 10: Safe Search across Live Sources
  // --------------------------------------------------------------------------
  console.log('\n[10] Verifying Search across Title, Domain, URL Key...');
  const searchByTitle = await livePreviewService.getLiveSources({ search: 'DeepSeek', accessToken: validToken });
  assert.equal(searchByTitle.items.length, 1);
  assert.equal(searchByTitle.items[0].urlKey, 'deepseek-v3-inference-acceleration');

  const searchByDomain = await livePreviewService.getLiveSources({ search: 'standards.ieee.org', accessToken: validToken });
  assert.equal(searchByDomain.items.length, 1);
  assert.equal(searchByDomain.items[0].sourceDomain, 'standards.ieee.org');
  passedAssertions += 4;
  console.log('✓ Search capabilities across live fields verified.');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('================================================================');
  console.log(
    `SUCCESS: All ${passedAssertions} P06 Truthful Live Data Preview assertions passed!`
  );
  console.log('================================================================\n');
}

runP06LiveDataPreviewAudit().catch((err) => {
  console.error('P06 Live Data Preview Audit Failed:', err);
  process.exit(1);
});
