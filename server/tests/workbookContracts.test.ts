/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  SHEET_NAMES,
  SHEET_SCHEMA_DEFINITIONS,
  WORKBOOK_CONFIG,
  WORKBOOK_SCHEMA_MANIFEST,
} from '../config/contentOpsWorkbook.ts';
import {
  SOURCE_QUEUE_REQUIRED_HEADERS,
  APP_CONTENT_JOBS_REQUIRED_HEADERS,
  APP_USERS_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';
import {
  buildHeaderIndexMap,
  validateSheetHeaders,
  getRowValueByHeader,
  getRowBooleanByHeader,
  getRowNumberByHeader,
} from '../utils/headerMapping.ts';
import {
  findJobsForSource,
  findJobsBySourceUrlKey,
  validateSourceToJobsRelationship,
} from '../utils/sourceJobLinker.ts';
import {
  SOURCE_QUEUE_HEADER_ROW_FIXTURE,
  APP_CONTENT_JOBS_HEADER_ROW_FIXTURE,
  APP_USERS_HEADER_ROW_FIXTURE,
  EXAMPLE_RESEARCH_SOURCE_FIXTURE,
  LINKED_JOB_VARIANT_1_FIXTURE,
  LINKED_JOB_VARIANT_2_FIXTURE,
  APP_USERS_FIXTURES,
} from '../fixtures/testFixtures.ts';

// Simple, zero-dependency test runner with clear diagnostics
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

function assertEqual<T>(actual: T, expected: T, testName: string) {
  const match = JSON.stringify(actual) === JSON.stringify(expected);
  assert(match, testName, `Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(actual)}`);
}

console.log('\n===============================================================');
console.log('ILMOPS WORKBOOK CONTRACT & SCHEMA VERIFICATION SUITE');
console.log('Zero external Google API calls — Pure local contract evaluation');
console.log('===============================================================\n');

// ---------------------------------------------------------------------------
// TEST 1: Centralized Workbook Configuration & Sheet Names
// ---------------------------------------------------------------------------
console.log('1. Centralized Workbook Configuration');
{
  assert(
    WORKBOOK_CONFIG.title === 'ALLIN Content Operations Hub — Research, Production & KPI',
    'Workbook title matches exact specification'
  );
  assert(
    WORKBOOK_CONFIG.spreadsheetId === '1X_xbjs3NUsE41foIIBwtu6oHv0q9L97TtZcOFWWvPgk',
    'Workbook spreadsheet ID matches exact specification'
  );
  assert(
    WORKBOOK_CONFIG.locale === 'en_GB' && WORKBOOK_CONFIG.timezone === 'Asia/Karachi',
    'Locale (en_GB) and Timezone (Asia/Karachi) match specification'
  );

  const declaredSheetNames = Object.values(SHEET_NAMES);
  assert(
    declaredSheetNames.length === 11,
    'All 11 required sheets are defined exactly once in centralized configuration'
  );
  assert(
    declaredSheetNames.includes('AI_Content_Queue') &&
      declaredSheetNames.includes('Electrical_Content_Queue') &&
      declaredSheetNames.includes('APP_Content_Jobs') &&
      declaredSheetNames.includes('APP_Users') &&
      declaredSheetNames.includes('Brand_Profiles') &&
      declaredSheetNames.includes('Content_Types') &&
      declaredSheetNames.includes('Team_Members') &&
      declaredSheetNames.includes('Lists_Config') &&
      declaredSheetNames.includes('Dashboard') &&
      declaredSheetNames.includes('Manual_Source_Entry') &&
      declaredSheetNames.includes('APP_Activity_Log'),
    'Every required sheet name is stored in SHEET_NAMES'
  );
  assert(
    WORKBOOK_SCHEMA_MANIFEST.sheets[SHEET_NAMES.AI_CONTENT_QUEUE].accessMode === 'CONFIG_ONLY',
    'AI_Content_Queue access mode set to CONFIG_ONLY (no external access)'
  );
}

// ---------------------------------------------------------------------------
// TEST 2: Different Header Row Numbers (Row 3 for Queues vs Row 1 for Jobs & Users)
// ---------------------------------------------------------------------------
console.log('\n2. Header Row Numbers & Architecture Separation');
{
  const aiQueueDef = SHEET_SCHEMA_DEFINITIONS[SHEET_NAMES.AI_CONTENT_QUEUE];
  const eeQueueDef = SHEET_SCHEMA_DEFINITIONS[SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE];
  const jobsDef = SHEET_SCHEMA_DEFINITIONS[SHEET_NAMES.APP_CONTENT_JOBS];
  const usersDef = SHEET_SCHEMA_DEFINITIONS[SHEET_NAMES.APP_USERS];

  assertEqual(aiQueueDef.expectedHeaderRow, 3, 'AI_Content_Queue uses Row 3 as header row');
  assertEqual(eeQueueDef.expectedHeaderRow, 3, 'Electrical_Content_Queue uses Row 3 as header row');
  assertEqual(jobsDef.expectedHeaderRow, 1, 'APP_Content_Jobs uses Row 1 as header row');
  assertEqual(usersDef.expectedHeaderRow, 1, 'APP_Users uses Row 1 as header row');

  assert(
    aiQueueDef.entityType === 'ResearchSource' && jobsDef.entityType === 'ContentJob',
    'ResearchSource and ContentJob have distinct entity types in schema manifest'
  );
}

// ---------------------------------------------------------------------------
// TEST 3: Valid Header Map Generation
// ---------------------------------------------------------------------------
console.log('\n3. Valid Header Map Generation');
{
  // Test Source Queue valid header map
  const sourceValidation = validateSheetHeaders(
    SHEET_NAMES.AI_CONTENT_QUEUE,
    SOURCE_QUEUE_HEADER_ROW_FIXTURE,
    SOURCE_QUEUE_REQUIRED_HEADERS,
    3
  );
  assert(sourceValidation.isValid, 'Source Queue headers validate successfully against 31 required headers');
  assertEqual(sourceValidation.missingHeaders.length, 0, 'No missing headers in valid Source Queue fixture');
  assert(sourceValidation.headerMap.has('URL Key'), 'Header map correctly resolves "URL Key"');
  assert(sourceValidation.headerMap.has('Canonical URL'), 'Header map correctly resolves "Canonical URL"');
  assert(sourceValidation.headerMap.has('Human Review Decision'), 'Header map correctly resolves "Human Review Decision"');

  // Test APP_Content_Jobs valid header map
  const jobsValidation = validateSheetHeaders(
    SHEET_NAMES.APP_CONTENT_JOBS,
    APP_CONTENT_JOBS_HEADER_ROW_FIXTURE,
    APP_CONTENT_JOBS_REQUIRED_HEADERS,
    1
  );
  assert(jobsValidation.isValid, 'APP_Content_Jobs headers validate successfully against 40 canonical headers');
  assertEqual(jobsValidation.missingHeaders.length, 0, 'No missing headers in APP_Content_Jobs fixture');
  assert(jobsValidation.headerMap.has('Source URL Key'), 'Header map correctly resolves "Source URL Key"');
  assert(jobsValidation.headerMap.has('Job ID'), 'Header map correctly resolves "Job ID"');
  assert(jobsValidation.headerMap.has('Production Prompt Snapshot'), 'Header map correctly resolves "Production Prompt Snapshot"');

  // Test APP_Users valid header map
  const usersValidation = validateSheetHeaders(
    SHEET_NAMES.APP_USERS,
    APP_USERS_HEADER_ROW_FIXTURE,
    APP_USERS_REQUIRED_HEADERS,
    1
  );
  assert(usersValidation.isValid, 'APP_Users headers validate successfully against 10 canonical headers');
  assertEqual(usersValidation.missingHeaders.length, 0, 'No missing headers in APP_Users fixture');
  assert(usersValidation.headerMap.has('Email / Google Account'), 'Header map correctly resolves "Email / Google Account"');
  assert(usersValidation.headerMap.has('Admin Access'), 'Header map correctly resolves "Admin Access"');
}

// ---------------------------------------------------------------------------
// TEST 4: Missing Required Header Detection with Explicit Error
// ---------------------------------------------------------------------------
console.log('\n4. Missing Required Header Detection');
{
  // Simulate header row missing "Source URL Key" in APP_Content_Jobs
  const corruptedJobsHeaders = APP_CONTENT_JOBS_HEADER_ROW_FIXTURE.filter(
    (h) => h !== 'Source URL Key'
  );

  const missingResult = validateSheetHeaders(
    SHEET_NAMES.APP_CONTENT_JOBS,
    corruptedJobsHeaders,
    APP_CONTENT_JOBS_REQUIRED_HEADERS,
    1
  );

  assert(!missingResult.isValid, 'Validation fails when required header is missing');
  assert(
    missingResult.missingHeaders.includes('Source URL Key'),
    'Identifies "Source URL Key" as missing header'
  );
  assert(
    missingResult.error?.includes('Missing required header:') === true &&
      missingResult.error?.includes('"Source URL Key"') === true &&
      missingResult.error?.includes('Sheet:\nAPP_Content_Jobs') === true,
    'Returns explicit, human-readable error stating missing header and sheet name'
  );

  // Simulate header row missing "URL Key" in AI_Content_Queue
  const corruptedQueueHeaders = SOURCE_QUEUE_HEADER_ROW_FIXTURE.filter(
    (h) => h !== 'URL Key'
  );
  const queueMissingResult = validateSheetHeaders(
    SHEET_NAMES.AI_CONTENT_QUEUE,
    corruptedQueueHeaders,
    SOURCE_QUEUE_REQUIRED_HEADERS,
    3
  );
  assert(!queueMissingResult.isValid, 'Validation fails when "URL Key" is missing from Source Queue');
  assert(
    queueMissingResult.missingHeaders.includes('URL Key'),
    'Identifies "URL Key" as missing in AI_Content_Queue'
  );
}

// ---------------------------------------------------------------------------
// TEST 5: Duplicate Header Detection
// ---------------------------------------------------------------------------
console.log('\n5. Duplicate Header Detection');
{
  const duplicateHeaders = [...APP_USERS_HEADER_ROW_FIXTURE, 'Full Name']; // Duplicated 'Full Name'
  const dupResult = validateSheetHeaders(
    SHEET_NAMES.APP_USERS,
    duplicateHeaders,
    APP_USERS_REQUIRED_HEADERS,
    1
  );

  assert(!dupResult.isValid, 'Validation fails when duplicate header exists');
  assertEqual(dupResult.duplicateHeaders, ['Full Name'], 'Identifies duplicated "Full Name"');
  assert(
    dupResult.error?.includes('Duplicate header detected:\n"Full Name"') === true,
    'Returns clear error identifying duplicate header'
  );
}

// ---------------------------------------------------------------------------
// TEST 6: Exact Header-Name Resolution (No letter or column index dependencies)
// ---------------------------------------------------------------------------
console.log('\n6. Exact Header-Name Resolution');
{
  const rawRow = new Array(APP_CONTENT_JOBS_HEADER_ROW_FIXTURE.length).fill('');
  const { headerMap } = buildHeaderIndexMap(APP_CONTENT_JOBS_HEADER_ROW_FIXTURE);

  // Populate sample values at whatever column indexes they naturally landed
  const jobIdCol = headerMap.get('Job ID')!;
  const sourceUrlKeyCol = headerMap.get('Source URL Key')!;
  const impressionsCol = headerMap.get('Impressions')!;

  rawRow[jobIdCol] = 'CNT-0028-01';
  rawRow[sourceUrlKeyCol] = 'example-source-key';
  rawRow[impressionsCol] = '14,200';

  const extractedJobId = getRowValueByHeader(rawRow, headerMap, 'Job ID');
  const extractedSourceUrlKey = getRowValueByHeader(rawRow, headerMap, 'Source URL Key');
  const extractedImpressions = getRowNumberByHeader(rawRow, headerMap, 'Impressions');

  assertEqual(extractedJobId, 'CNT-0028-01', 'Safely extracted Job ID by exact header name');
  assertEqual(extractedSourceUrlKey, 'example-source-key', 'Safely extracted Source URL Key by exact header name');
  assertEqual(extractedImpressions, 14200, 'Safely parsed number Impressions by exact header name');

  // Verify non-existent header returns undefined without error
  const nonExistent = getRowValueByHeader(rawRow, headerMap, 'Non Existent Header');
  assertEqual(nonExistent, undefined, 'Accessing non-existent header returns undefined safely');
}

// ---------------------------------------------------------------------------
// TEST 7: One Source → Many Jobs Validation (Requirement 12)
// ---------------------------------------------------------------------------
console.log('\n7. One Source → Many Jobs Validation (Requirement 12)');
{
  const testJobs = [LINKED_JOB_VARIANT_1_FIXTURE, LINKED_JOB_VARIANT_2_FIXTURE];

  // 1. Verify link by exact sourceUrlKey
  const linkResult = findJobsForSource(EXAMPLE_RESEARCH_SOURCE_FIXTURE, testJobs);

  assertEqual(linkResult.sourceUrlKey, 'example-source-key', 'Matches source URL Key "example-source-key"');
  assertEqual(linkResult.linkedJobsCount, 2, 'One research source successfully linked to 2 content job variants');

  const variant1 = linkResult.linkedJobs.find((j) => j.id === 'CNT-0028-01');
  const variant2 = linkResult.linkedJobs.find((j) => j.id === 'CNT-0028-02');

  assert(variant1 !== undefined, 'Found CNT-0028-01 linked to source');
  assertEqual(variant1?.targetAccount, 'PYCODEAI-LINKEDIN', 'Variant 1 targets PYCODEAI-LINKEDIN');
  assertEqual(variant1?.contentType, 'Infographic', 'Variant 1 content type is Infographic');

  assert(variant2 !== undefined, 'Found CNT-0028-02 linked to source');
  assertEqual(variant2?.targetAccount, 'FARWA-LINKEDIN', 'Variant 2 targets FARWA-LINKEDIN');
  assertEqual(variant2?.contentType, 'Carousel', 'Variant 2 content type is Carousel');

  // 2. Validate relationship verification helper
  const relCheck = validateSourceToJobsRelationship('example-source-key', testJobs);
  assert(relCheck.isValid, 'Source-to-jobs relationship is 100% valid');
  assertEqual(relCheck.matchingJobIds, ['CNT-0028-01', 'CNT-0028-02'], 'All job variants reference the same Source URL Key');

  // 3. Test isolation when a job has a different key
  const unrelatedJob = {
    ...LINKED_JOB_VARIANT_1_FIXTURE,
    id: 'CNT-9999-01',
    sourceUrlKey: 'different-source-key',
  };
  const filtered = findJobsBySourceUrlKey('example-source-key', [...testJobs, unrelatedJob]);
  assertEqual(filtered.length, 2, 'Correctly excludes jobs with different source URL keys');
}

// ---------------------------------------------------------------------------
// TEST 8: App User Emails Guard (No invented Google account emails)
// ---------------------------------------------------------------------------
console.log('\n8. App User Integrity (No Invented Google Account Emails)');
{
  const moneebUser = APP_USERS_FIXTURES.find((u) => u.fullName === 'Muhammad Moneeb Akhtar');
  const farwaUser = APP_USERS_FIXTURES.find((u) => u.fullName === 'Farwa Jafar');
  const munirUser = APP_USERS_FIXTURES.find((u) => u.fullName === 'Munir');
  const amaraUser = APP_USERS_FIXTURES.find((u) => u.fullName === 'Amara Akhtar');

  assert(moneebUser !== undefined, 'Moneeb exists in AppUser fixture');
  assertEqual(moneebUser?.email, 'eng.moneeb@jadwaa.com', 'Moneeb retains real email');

  assert(farwaUser !== undefined, 'Farwa exists in AppUser fixture');
  assertEqual(farwaUser?.email, null, 'Farwa has null email (no invented email)');

  assert(munirUser !== undefined, 'Munir exists in AppUser fixture');
  assertEqual(munirUser?.email, null, 'Munir has null email (no invented email)');

  assert(amaraUser !== undefined, 'Amara exists in AppUser fixture');
  assertEqual(amaraUser?.email, null, 'Amara has null email (no invented email)');
}

console.log('\n===============================================================');
console.log(`TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} total assertions`);
console.log('===============================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
