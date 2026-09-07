/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SourceRepository,
  ContentJobRepository,
  UserRepository,
  ConfigRepository,
  ManualSourceRepository,
  ActivityLogRepository,
} from '../repositories/index.ts';
import {
  ReadOnlyWorkspaceClient,
} from '../integrations/googleWorkspace/workspaceClient.ts';
import {
  SOURCE_QUEUE_REQUIRED_HEADERS,
  APP_CONTENT_JOBS_REQUIRED_HEADERS,
  APP_USERS_REQUIRED_HEADERS,
  MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS,
  BRAND_PROFILES_REQUIRED_HEADERS,
  CONTENT_TYPES_REQUIRED_HEADERS,
  TEAM_MEMBERS_REQUIRED_HEADERS,
  LISTS_CONFIG_REQUIRED_HEADERS,
  APP_ACTIVITY_LOG_REQUIRED_HEADERS,
  SHEET_NAMES,
} from '../../shared/contracts/contentOps.ts';
import {
  parseSafeScore,
  parseSafeDate,
  parseSafeBoolean,
  parseSafeNumber,
  parseSafeText,
  parseSafeYesNo,
  parseSafeStringArray,
} from '../utils/dataParsing.ts';
import {
  SOURCE_QUEUE_HEADER_ROW_FIXTURE,
  APP_CONTENT_JOBS_HEADER_ROW_FIXTURE,
  APP_USERS_HEADER_ROW_FIXTURE,
  MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE,
  BRAND_PROFILES_HEADER_ROW_FIXTURE,
  CONTENT_TYPES_HEADER_ROW_FIXTURE,
  TEAM_MEMBERS_HEADER_ROW_FIXTURE,
  LISTS_CONFIG_HEADER_ROW_FIXTURE,
  APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE,
} from '../fixtures/testFixtures.ts';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
    if (detail) console.error(`    Detail: ${detail}`);
  }
}

console.log('\n===============================================================');
console.log('ILMOPS P05 WORKBOOK DATA ACCESS REPOSITORY AUDIT SUITE');
console.log('Verification of 20 architectural, schema, and security invariants');
console.log('===============================================================\n');

// ---------------------------------------------------------------------------
// 1. Exact Header Mapping Invariant
// ---------------------------------------------------------------------------
console.log('1. Exact Header Mapping Invariant');
{
  assert(SOURCE_QUEUE_REQUIRED_HEADERS.length === 31, 'SOURCE_QUEUE requires exactly 31 headers');
  assert(APP_CONTENT_JOBS_REQUIRED_HEADERS.length === 40, 'APP_CONTENT_JOBS requires exactly 40 headers');
  assert(APP_USERS_REQUIRED_HEADERS.length === 10, 'APP_USERS requires exactly 10 headers');
  assert(MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS.length === 31, 'MANUAL_SOURCE_ENTRY requires exactly 31 headers');
}

// ---------------------------------------------------------------------------
// 2. Read-Only Surface Audit (Zero Write / Mutation Methods)
// ---------------------------------------------------------------------------
console.log('\n2. Read-Only Surface Audit across All Repositories');
{
  const forbiddenKeywords = ['append', 'update', 'write', 'delete', 'clear', 'create', 'mutate', 'drop', 'insert'];
  const repos = [
    { name: 'SourceRepository', cls: SourceRepository },
    { name: 'ContentJobRepository', cls: ContentJobRepository },
    { name: 'UserRepository', cls: UserRepository },
    { name: 'ConfigRepository', cls: ConfigRepository },
    { name: 'ManualSourceRepository', cls: ManualSourceRepository },
    { name: 'ActivityLogRepository', cls: ActivityLogRepository },
  ];

  for (const repo of repos) {
    const props = Object.getOwnPropertyNames(repo.cls.prototype);
    for (const kw of forbiddenKeywords) {
      const violating = props.find((p) => p.toLowerCase().includes(kw));
      assert(!violating, `${repo.name} exposes zero write methods containing "${kw}"`);
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Safe Data Parsing & Normalization Utilities
// ---------------------------------------------------------------------------
console.log('\n3. Safe Data Parsing & Normalization Utilities');
{
  assert(parseSafeScore('5', 1, 5) === 5, 'parseSafeScore parses valid score 5');
  assert(parseSafeScore('4/5', 1, 5) === 4, 'parseSafeScore parses score fraction 4/5');
  assert(parseSafeScore('', 1, 5) === null, 'parseSafeScore returns null for empty string');
  assert(parseSafeDate('2026-09-06') === '2026-09-06', 'parseSafeDate parses ISO date');
  assert(parseSafeDate('') === null, 'parseSafeDate returns null for blank date');
  assert(parseSafeBoolean('TRUE') === true, 'parseSafeBoolean parses "TRUE" to true');
  assert(parseSafeBoolean('No') === false, 'parseSafeBoolean parses "No" to false');
  assert(parseSafeNumber('$1,250') === 1250, 'parseSafeNumber parses formatted currency number');
  assert(parseSafeText('  trimmed text  ') === 'trimmed text', 'parseSafeText trims safely');
  assert(parseSafeYesNo('Yes') === 'Yes', 'parseSafeYesNo parses "Yes"');
  assert(parseSafeStringArray('item 1\n• item 2').length === 2, 'parseSafeStringArray splits multiline text');
}

// ---------------------------------------------------------------------------
// 4. Mock Workspace Client for Repositories
// ---------------------------------------------------------------------------
class MockP05WorkspaceClient extends ReadOnlyWorkspaceClient {
  public rangeRequested: { start: number; end: number } | null = null;

  async fetchSpreadsheetMetadata() {
    return {
      title: 'ALLIN Content Operations Hub — Research, Production & KPI',
      locale: 'en_GB',
      timeZone: 'Asia/Karachi',
      sheets: [
        { sheetId: 1, title: SHEET_NAMES.AI_CONTENT_QUEUE, index: 0, gridProperties: { rowCount: 500, columnCount: 35 } },
        { sheetId: 2, title: SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE, index: 1, gridProperties: { rowCount: 500, columnCount: 35 } },
        { sheetId: 3, title: SHEET_NAMES.APP_CONTENT_JOBS, index: 2, gridProperties: { rowCount: 200, columnCount: 45 } },
        { sheetId: 4, title: SHEET_NAMES.APP_USERS, index: 3, gridProperties: { rowCount: 20, columnCount: 15 } },
        { sheetId: 5, title: SHEET_NAMES.BRAND_PROFILES, index: 4, gridProperties: { rowCount: 10, columnCount: 10 } },
        { sheetId: 6, title: SHEET_NAMES.CONTENT_TYPES, index: 5, gridProperties: { rowCount: 30, columnCount: 10 } },
        { sheetId: 7, title: SHEET_NAMES.TEAM_MEMBERS, index: 6, gridProperties: { rowCount: 10, columnCount: 10 } },
        { sheetId: 8, title: SHEET_NAMES.LISTS_CONFIG, index: 7, gridProperties: { rowCount: 100, columnCount: 10 } },
        { sheetId: 9, title: SHEET_NAMES.MANUAL_SOURCE_ENTRY, index: 8, gridProperties: { rowCount: 100, columnCount: 35 } },
        { sheetId: 10, title: SHEET_NAMES.APP_ACTIVITY_LOG, index: 9, gridProperties: { rowCount: 1000, columnCount: 15 } },
      ],
    };
  }

  async fetchSheetHeaders(_token: string, _spreadsheetId: string, sheetTitle: string, _row: number) {
    if (sheetTitle === SHEET_NAMES.AI_CONTENT_QUEUE || sheetTitle === SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE) {
      return [...SOURCE_QUEUE_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.MANUAL_SOURCE_ENTRY) {
      return [...MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.APP_CONTENT_JOBS) {
      return [...APP_CONTENT_JOBS_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.APP_USERS) {
      return [...APP_USERS_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.BRAND_PROFILES) {
      return [...BRAND_PROFILES_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.CONTENT_TYPES) {
      return [...CONTENT_TYPES_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.TEAM_MEMBERS) {
      return [...TEAM_MEMBERS_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.LISTS_CONFIG) {
      return [...LISTS_CONFIG_HEADER_ROW_FIXTURE];
    }
    if (sheetTitle === SHEET_NAMES.APP_ACTIVITY_LOG) {
      return [...APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE];
    }
    return [];
  }

  async fetchSheetRowRange(
    _token: string,
    _spreadsheetId: string,
    sheetTitle: string,
    startRow: number,
    endRow: number
  ) {
    this.rangeRequested = { start: startRow, end: endRow };

    if (sheetTitle === SHEET_NAMES.AI_CONTENT_QUEUE) {
      return [
        [
          '2026-09-06', '2026-09-05', '1', 'AI & Data Engineering', 'KV Cache Compaction',
          'Attention Pruning', 'ArXiv', 'KV-Prune: Dynamic Cache Eviction', 'Stanford AI Lab',
          'https://arxiv.org/abs/2502.demo-kv', 'kv-prune-dynamic-cache-eviction', 'arxiv.org',
          'Dynamic eviction cuts memory by 60%', 'Cuts memory by 60% with zero perplexity loss',
          'Enables 128k inference on edge GPUs', 'Why your RAG pipeline runs out of VRAM',
          'Infographic + Technical Deep-Dive', 'ML Engineers, RAG Developers', '5', '5', '5',
          'P1', 'Approved', 'Farwa Jafar', 'https://drive.google.com/open?id=demo-asset',
          'Production ready', 'Batch_01', 'Scheduled', 'Farwa Jafar', '2026-09-06', 'Yes',
        ],
      ];
    }

    if (sheetTitle === SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE) {
      return [
        [
          '2026-09-06', '2026-09-04', '2', 'Electrical & Power Systems', 'Substation Earthing',
          'Ground Grid, Touch Potential', 'IEEE Standard', 'IEEE 80 Ground Grid Safety Optimization',
          'IEEE Power & Energy Society', 'https://standards.ieee.org/ieee80-demo', 'ieee-80-ground-grid-optimization',
          'ieee.org', 'Comparative safety calculations under high fault currents',
          'Reduced copper conductor mass by 18%', 'Cost optimization for utility scale substations',
          'Are you over-designing your substation ground grid?', 'Technical Deep-Dive + Carousel',
          'Substation Engineers, Protection Engineers', '5', '4', '5', 'P1', 'Review Ready',
          'Muhammad Moneeb Akhtar', '', 'Reviewing calculations', 'Batch_02', 'Staged',
          'Moneeb Akhtar', '2026-09-06', 'Yes',
        ],
      ];
    }

    if (sheetTitle === SHEET_NAMES.APP_CONTENT_JOBS) {
      return [
        [
          'JOB-AI-001', // Job ID
          'kv-prune-dynamic-cache-eviction', // Source URL Key
          'AI & Data Engineering', // Source Niche
          'KV-Prune: Dynamic Cache Eviction', // Source Title
          'ArXiv', // Source Type
          'https://arxiv.org/abs/2502.demo-kv', // Source Final URL
          'PYCODEAI-LINKEDIN', // Target Account
          'LinkedIn', // Platform
          'Infographic', // Content Type
          'Variant A', // Variant Label
          'P1', // Priority
          'Farwa Jafar', // Assigned Producer
          'Muhammad Moneeb Akhtar', // QC Reviewer
          'Farwa Jafar', // Publishing Owner
          'In Production', // Job Status
          'Infographic Diagram Hook', // Production Prompt Snapshot
          'Draft v1 link', // Draft Asset Link
          'Technical Summary Body', // Finalization Prompt Snapshot
          '', // Final Asset Link
          'Architecture Flow', // Social Copy Prompt Snapshot
          'Call to Action', // Final Social Copy
          'Pending Review', // QC Status
          'Reviewing', // QC Notes
          '2026-09-06', // Production Start
          '', // Production Complete
          '2026-09-07', // Scheduled Date
          '', // Published Date
          '', // Published Post URL
          '0', // Impressions
          '0', // Likes / Reactions
          '0', // Comments
          '0', // Shares / Reposts
          '0', // Saves
          '0', // Clicks
          '0', // Followers Gained
          '0', // Leads / Enquiries
          'Farwa Jafar', // Created By
          '2026-09-06', // Created At
          'Farwa Jafar', // Updated By
          '2026-09-06T10:00:00Z', // Updated At
        ],
        [
          'JOB-AI-002', // Job ID
          'kv-prune-dynamic-cache-eviction', // Source URL Key
          'AI & Data Engineering', // Source Niche
          'KV-Prune: Dynamic Cache Eviction', // Source Title
          'ArXiv', // Source Type
          'https://arxiv.org/abs/2502.demo-kv', // Source Final URL
          'FARWA-LINKEDIN', // Target Account
          'LinkedIn', // Platform
          'Carousel', // Content Type
          'Variant B', // Variant Label
          'P1', // Priority
          'Farwa Jafar', // Assigned Producer
          'Muhammad Moneeb Akhtar', // QC Reviewer
          'Farwa Jafar', // Publishing Owner
          'Draft Ready', // Job Status
          'Slide Hook', // Production Prompt Snapshot
          'Carousel v1 link', // Draft Asset Link
          'Context Breakdown', // Finalization Prompt Snapshot
          '', // Final Asset Link
          'Benchmarks Flow', // Social Copy Prompt Snapshot
          'Follow CTA', // Final Social Copy
          'Pending Review', // QC Status
          'Slide deck 8-10 slides', // QC Notes
          '2026-09-06', // Production Start
          '', // Production Complete
          '2026-09-08', // Scheduled Date
          '', // Published Date
          '', // Published Post URL
          '0', // Impressions
          '0', // Likes / Reactions
          '0', // Comments
          '0', // Shares / Reposts
          '0', // Saves
          '0', // Clicks
          '0', // Followers Gained
          '0', // Leads / Enquiries
          'Farwa Jafar', // Created By
          '2026-09-06', // Created At
          'Farwa Jafar', // Updated By
          '2026-09-06T10:30:00Z', // Updated At
        ],
      ];
    }

    if (sheetTitle === SHEET_NAMES.APP_USERS) {
      return [
        [
          'eng.moneeb@jadwaa.com',
          'Muhammad Moneeb Akhtar',
          'Lead Engineering Reviewer & Admin',
          'TRUE', // Research Access
          'TRUE', // Production Access
          'TRUE', // QC Access
          'TRUE', // Publishing / Analytics Access
          'TRUE', // Admin Access
          'TRUE', // Active
          'Lead engineering consultant.', // Notes
        ],
        [
          'farwa.jafar@pycode.ai',
          'Farwa Jafar',
          'AI Research Lead',
          'TRUE', // Research Access
          'TRUE', // Production Access
          'TRUE', // QC Access
          'TRUE', // Publishing / Analytics Access
          'FALSE', // Admin Access
          'TRUE', // Active
          'AI Research specialist.', // Notes
        ],
      ];
    }

    return [];
  }
}

const mockClient = new MockP05WorkspaceClient();

// ---------------------------------------------------------------------------
// 5. SourceRepository: AI & Electrical Queue Tests
// ---------------------------------------------------------------------------
console.log('\n5. SourceRepository: AI & Electrical Queue Row 3 Reading');
{
  const sourceRepo = new SourceRepository(mockClient);

  // AI Queue
  const aiResult = await sourceRepo.listSources('AI_Content_Queue', { accessToken: 'test-token' });
  assert(aiResult.items.length === 1, 'AI_Content_Queue returned 1 source');
  assert(aiResult.items[0].urlKey === 'kv-prune-dynamic-cache-eviction', 'AI source urlKey mapped correctly');
  assert(aiResult.items[0].scores.credibility === 5, 'AI source credibility score parsed as 5');
  assert(aiResult.items[0].priority === 'P1', 'AI source priority mapped to P1');

  // Verify Bounded Range
  assert(
    mockClient.rangeRequested !== null && mockClient.rangeRequested.end - mockClient.rangeRequested.start <= 100,
    'Range request bounded (<= 100 rows per call)'
  );

  // Electrical Queue
  const elResult = await sourceRepo.listSources('Electrical_Content_Queue', { accessToken: 'test-token' });
  assert(elResult.items.length === 1, 'Electrical_Content_Queue returned 1 source');
  assert(elResult.items[0].urlKey === 'ieee-80-ground-grid-optimization', 'Electrical source urlKey mapped correctly');
  assert(elResult.items[0].nicheId === 'electrical_energy', 'Electrical source niche mapped');

  // Get source by URL key
  const found = await sourceRepo.getSourceByUrlKey('AI_Content_Queue', 'kv-prune-dynamic-cache-eviction', { accessToken: 'test-token' });
  assert(found !== null && found.publisherOrAuthor === 'Stanford AI Lab', 'getSourceByUrlKey finds source by exact key');
}

// ---------------------------------------------------------------------------
// 6. ContentJobRepository: APP_Content_Jobs Row 1 & Multi-Variant Fan-Out
// ---------------------------------------------------------------------------
console.log('\n6. ContentJobRepository: Row 1 Header & Multi-Variant Fan-Out');
{
  const jobRepo = new ContentJobRepository(mockClient);
  const jobsResult = await jobRepo.listJobs({ accessToken: 'test-token' });

  assert(jobsResult.items.length === 2, 'ContentJobRepository returned 2 jobs');
  assert(jobsResult.items[0].id === 'JOB-AI-001', 'First job ID mapped as JOB-AI-001');
  assert(jobsResult.items[0].contentType === 'Infographic', 'First job contentType mapped as Infographic');
  assert(jobsResult.items[1].id === 'JOB-AI-002', 'Second job ID mapped as JOB-AI-002');
  assert(jobsResult.items[1].contentType === 'Carousel', 'Second job contentType mapped as Carousel');

  // Relational Join Integrity: 1 Source -> Multiple Jobs
  const jobsForSource = await jobRepo.getJobsBySourceKey('kv-prune-dynamic-cache-eviction', { accessToken: 'test-token' });
  assert(jobsForSource.length === 2, 'Relational Key Join: 1 Source successfully fans out to 2 ContentJobs');
  assert(
    jobsForSource.every((j) => j.sourceUrlKey === 'kv-prune-dynamic-cache-eviction'),
    'All returned jobs match sourceUrlKey'
  );
}

// ---------------------------------------------------------------------------
// 7. UserRepository: APP_Users Row 1 & Security Constraints
// ---------------------------------------------------------------------------
console.log('\n7. UserRepository: Row 1 Header & Exact Email Matching');
{
  const userRepo = new UserRepository(mockClient);
  const users = await userRepo.listUsers({ accessToken: 'test-token' });

  assert(users.length === 2, 'UserRepository returned 2 users');
  assert(users[0].email === 'eng.moneeb@jadwaa.com', 'First user email mapped');
  assert(users[0].publishingAnalyticsAccess === true, 'First user publishingAnalyticsAccess is boolean true');
  assert(users[0].adminAccess === true, 'First user adminAccess is boolean true');

  // Case-insensitive lookup
  const userUpper = await userRepo.findUserByEmail('ENG.MONEEB@JADWAA.COM', { accessToken: 'test-token' });
  assert(userUpper !== null && userUpper.fullName === 'Muhammad Moneeb Akhtar', 'findUserByEmail matches case-insensitively');

  // Security guard: blank email never matches
  const blankUser = await userRepo.findUserByEmail('', { accessToken: 'test-token' });
  assert(blankUser === null, 'findUserByEmail returns null for empty string (never matches null/blank)');
}

// ---------------------------------------------------------------------------
// 8. ManualSourceRepository: Row 3 Header Invariant
// ---------------------------------------------------------------------------
console.log('\n8. ManualSourceRepository: Row 3 Header & Staging Isolation');
{
  const manualRepo = new ManualSourceRepository(mockClient);
  const manualResult = await manualRepo.listManualEntries({ accessToken: 'test-token' });
  assert(manualResult.items.length === 0, 'Empty raw rows mapped cleanly without error');

  // Offline fixture fallback
  const offlineResult = await manualRepo.listManualEntries();
  assert(offlineResult.items.length === 1, 'Offline fallback returns 1 typed ManualSourceEntry fixture');
  assert(offlineResult.items[0].manualEntryStatus === 'Staged', 'Manual entry staged status mapped');
}

// ---------------------------------------------------------------------------
// 9. ConfigRepository & ActivityLogRepository Invariants
// ---------------------------------------------------------------------------
console.log('\n9. ConfigRepository & ActivityLogRepository Invariants');
{
  const configRepo = new ConfigRepository(mockClient);
  const allConfig = await configRepo.getAllConfig(); // Offline fixture
  assert(allConfig.brandProfiles.length === 3, 'Brand Profiles offline fixture has 3 profiles');
  assert(allConfig.contentTypes.length === 3, 'Content Types offline fixture has 3 types');
  assert(allConfig.teamMembers.length === 4, 'Team Members offline fixture has 4 members');
  assert(allConfig.listsConfig.reviewDecision.length >= 2, 'Lists Config has valid review decisions');

  const logRepo = new ActivityLogRepository(mockClient);
  const logs = await logRepo.listActivityLogs();
  assert(logs.items.length === 1, 'Activity log repository returned 1 log');
  assert(logs.items[0].eventType === 'DIAGNOSTIC_VERIFIED', 'Activity log eventType mapped');
}

// ---------------------------------------------------------------------------
// 10. Schema Mismatch Protection & Security Leak Audit
// ---------------------------------------------------------------------------
console.log('\n10. Schema Mismatch Protection & Security Leak Audit');
{
  class FailingWorkspaceClient extends ReadOnlyWorkspaceClient {
    async fetchSheetHeaders() {
      return ['Wrong_Header_1', 'Wrong_Header_2'];
    }
    async fetchSheetRowRange() {
      return [];
    }
  }

  const failingRepo = new SourceRepository(new FailingWorkspaceClient());
  let errorCaught = false;
  try {
    await failingRepo.listSources('AI_Content_Queue', { accessToken: 'test-token' });
  } catch (err: unknown) {
    errorCaught = true;
    const errObj = err as Error;
    assert(errObj.message.includes('Sheet schema mismatch'), 'Repository throws structured error on schema mismatch');
  }
  assert(errorCaught, 'Repository blocked execution when required headers were missing');

  // Security test: Verify zero token leakage in any serialized repository output
  const aiResult = await new SourceRepository(mockClient).listSources('AI_Content_Queue', { accessToken: 'secret-token-xyz' });
  const serialized = JSON.stringify(aiResult);
  assert(!serialized.includes('secret-token-xyz'), 'Output never leaks access token');
  assert(!serialized.includes('private_key'), 'Output never leaks service credentials');
}

console.log('\n===============================================================');
console.log(`P05 AUDIT SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} assertions`);
console.log('===============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
