/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ReadOnlyWorkspaceClient,
  readOnlyWorkspaceClient,
} from '../integrations/googleWorkspace/workspaceClient.ts';
import { runWorkspaceDiagnostics } from '../integrations/googleWorkspace/workspaceDiagnostics.ts';
import { translateWorkspaceError } from '../integrations/googleWorkspace/workspaceErrors.ts';
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
console.log('ILMOPS P04 GOOGLE WORKSPACE READ-ONLY AUDIT SUITE');
console.log('Explicit guard tests proving zero write, mutation, or leak vectors');
console.log('===============================================================\n');

// ---------------------------------------------------------------------------
// TEST 1: Read-Only Surface Audit (Requirement 18)
// ---------------------------------------------------------------------------
console.log('1. Read-Only Surface Audit (Requirement 18)');
{
  const forbiddenKeywords = [
    'append',
    'update',
    'write',
    'delete',
    'clear',
    'create',
    'rename',
    'move',
    'share',
    'insert',
    'mutate',
    'drop',
  ];

  // Audit ReadOnlyWorkspaceClient prototype and instance methods
  const prototypeProps = Object.getOwnPropertyNames(ReadOnlyWorkspaceClient.prototype);
  const instanceProps = Object.getOwnPropertyNames(readOnlyWorkspaceClient);
  const allClientProps = [...prototypeProps, ...instanceProps];

  for (const keyword of forbiddenKeywords) {
    const violatingProp = allClientProps.find((prop) =>
      prop.toLowerCase().includes(keyword.toLowerCase())
    );
    assert(
      !violatingProp,
      `ReadOnlyWorkspaceClient exposes NO method or property containing "${keyword}"`,
      violatingProp ? `Found forbidden property: ${violatingProp}` : undefined
    );
  }

  // Verify only allowed read methods exist on ReadOnlyWorkspaceClient
  const clientMethods = prototypeProps.filter((p) => p !== 'constructor');
  assert(
    clientMethods.every((m) => m.startsWith('fetch') || m.startsWith('get')),
    'All ReadOnlyWorkspaceClient methods are read-only getters/fetchers'
  );
  assert(
    clientMethods.includes('fetchSpreadsheetMetadata'),
    'ReadOnlyWorkspaceClient includes fetchSpreadsheetMetadata'
  );
  assert(
    clientMethods.includes('fetchSheetHeaderRow'),
    'ReadOnlyWorkspaceClient includes fetchSheetHeaderRow'
  );
  assert(
    clientMethods.includes('fetchDriveFileMetadata'),
    'ReadOnlyWorkspaceClient includes fetchDriveFileMetadata'
  );
}

// ---------------------------------------------------------------------------
// TEST 2: Friendly Error Translation & Secret Protection (Requirement 11)
// ---------------------------------------------------------------------------
console.log('\n2. Friendly Error Translation & Secret Protection (Requirement 11)');
{
  const err401 = translateWorkspaceError(401);
  assert(
    err401.message === 'Google authorization is required.',
    'HTTP 401 returns friendly message "Google authorization is required."'
  );
  assert(
    err401.code === 'UNAUTHORIZED' && err401.statusCode === 401,
    'HTTP 401 returns code UNAUTHORIZED'
  );

  const err403 = translateWorkspaceError(403);
  assert(
    err403.message === 'Your Google account cannot access the ALLIN Content Operations Hub.',
    'HTTP 403 returns friendly message "Your Google account cannot access the ALLIN Content Operations Hub."'
  );

  const err404 = translateWorkspaceError(404);
  assert(
    err404.message === 'The configured workbook was not found.',
    'HTTP 404 returns friendly message "The configured workbook was not found."'
  );

  const err429 = translateWorkspaceError(429);
  assert(
    err429.code === 'RATE_LIMITED' && err429.message.includes('rate limit'),
    'HTTP 429 returns friendly rate limit error'
  );

  const err500 = translateWorkspaceError(500);
  assert(
    err500.code === 'GOOGLE_SERVER_ERROR' && !JSON.stringify(err500).includes('stack'),
    'HTTP 500 error hides raw internal traces'
  );
}

// ---------------------------------------------------------------------------
// TEST 3: Unauthenticated Diagnostics Request Guard
// ---------------------------------------------------------------------------
console.log('\n3. Unauthenticated Diagnostics Request Guard');
{
  const result = await runWorkspaceDiagnostics(null);
  assert(result.signedIn === false, 'Diagnostics reports signedIn: false when unauthenticated');
  assert(result.workbookReachable === false, 'Diagnostics reports workbookReachable: false when unauthenticated');
  assert(result.state === 'AUTHORIZATION_REQUIRED', 'Diagnostics state is AUTHORIZATION_REQUIRED');
  assert(result.redactedWorkbookId.startsWith('...'), 'Spreadsheet ID is redacted (starts with ...)');
  assert(result.sheets.length === 10, 'All 10 required sheets are present in diagnostic output');
  assert(
    result.sheets.every((s) => s.headerValidation === 'NOT_CHECKED'),
    'All sheets are marked NOT_CHECKED when unauthenticated'
  );
}

// ---------------------------------------------------------------------------
// TEST 4: Mocked Live Connection Diagnostic Execution
// ---------------------------------------------------------------------------
console.log('\n4. Mocked Live Connection Diagnostic Execution');
{
  class MockWorkspaceClient extends ReadOnlyWorkspaceClient {
    async fetchSpreadsheetMetadata() {
      return {
        title: 'ALLIN Content Operations Hub — Research, Production & KPI',
        locale: 'en_GB',
        timeZone: 'Asia/Karachi',
        sheets: [
          { sheetId: 1, title: 'AI_Content_Queue', index: 0, gridProperties: { rowCount: 500, columnCount: 35 } },
          { sheetId: 2, title: 'Electrical_Content_Queue', index: 1, gridProperties: { rowCount: 500, columnCount: 35 } },
          { sheetId: 3, title: 'APP_Content_Jobs', index: 2, gridProperties: { rowCount: 200, columnCount: 45 } },
          { sheetId: 4, title: 'APP_Users', index: 3, gridProperties: { rowCount: 20, columnCount: 15 } },
          { sheetId: 5, title: 'Brand_Profiles', index: 4, gridProperties: { rowCount: 10, columnCount: 10 } },
          { sheetId: 6, title: 'Content_Types', index: 5, gridProperties: { rowCount: 30, columnCount: 10 } },
          { sheetId: 7, title: 'Team_Members', index: 6, gridProperties: { rowCount: 10, columnCount: 10 } },
          { sheetId: 8, title: 'Lists_Config', index: 7, gridProperties: { rowCount: 100, columnCount: 10 } },
          { sheetId: 9, title: 'Manual_Source_Entry', index: 8, gridProperties: { rowCount: 100, columnCount: 35 } },
          { sheetId: 10, title: 'APP_Activity_Log', index: 9, gridProperties: { rowCount: 1000, columnCount: 15 } },
        ],
      };
    }

    async fetchSheetHeaderRow(_token: string, _spreadsheetId: string, sheetTitle: string) {
      if (sheetTitle === 'AI_Content_Queue' || sheetTitle === 'Electrical_Content_Queue') {
        return [...SOURCE_QUEUE_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'Manual_Source_Entry') {
        return [...MANUAL_SOURCE_ENTRY_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'APP_Content_Jobs') {
        return [...APP_CONTENT_JOBS_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'APP_Users') {
        return [...APP_USERS_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'Brand_Profiles') {
        return [...BRAND_PROFILES_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'Content_Types') {
        return [...CONTENT_TYPES_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'Team_Members') {
        return [...TEAM_MEMBERS_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'Lists_Config') {
        return [...LISTS_CONFIG_HEADER_ROW_FIXTURE];
      }
      if (sheetTitle === 'APP_Activity_Log') {
        return [...APP_ACTIVITY_LOG_HEADER_ROW_FIXTURE];
      }
      return [];
    }
  }

  const mockClient = new MockWorkspaceClient();
  const diagResult = await runWorkspaceDiagnostics('mock-token-sample', mockClient);

  assert(diagResult.signedIn === true, 'Signed-in state reported as true');
  assert(diagResult.workbookReachable === true, 'Workbook reachable state reported as true');
  assert(diagResult.workbookTitle === 'ALLIN Content Operations Hub — Research, Production & KPI', 'Workbook title matches');
  assert(diagResult.state === 'SCHEMA_VALID', 'Overall diagnostic state is SCHEMA_VALID');
  assert(diagResult.summary.allSchemasPass === true, 'All required sheet schemas pass');
  assert(diagResult.summary.passedSheetsCount === 10, '10/10 sheets pass');

  // Verify header rows for required sheets
  const aiQueue = diagResult.sheets.find((s) => s.sheetName === 'AI_Content_Queue');
  assert(aiQueue?.expectedHeaderRow === 3, 'AI_Content_Queue expects header row 3');
  assert(aiQueue?.headerValidation === 'PASS', 'AI_Content_Queue validation passes');
  assert(aiQueue?.rowCount === 500, 'AI_Content_Queue bounded row count returned');

  const jobs = diagResult.sheets.find((s) => s.sheetName === 'APP_Content_Jobs');
  assert(jobs?.expectedHeaderRow === 1, 'APP_Content_Jobs expects header row 1');
  assert(jobs?.headerValidation === 'PASS', 'APP_Content_Jobs validation passes');

  const manualEntry = diagResult.sheets.find((s) => s.sheetName === 'Manual_Source_Entry');
  assert(manualEntry?.expectedHeaderRow === 3, 'Manual_Source_Entry expects header row 3');
  assert(manualEntry?.headerValidation === 'PASS', 'Manual_Source_Entry validation passes');

  // Config sheet header discovery
  const teamMembers = diagResult.sheets.find((s) => s.sheetName === 'Team_Members');
  assert(teamMembers?.discoveredHeadersCount === 4, 'Team_Members discovered 4 live headers');
  assert(
    teamMembers?.discoveredHeaders?.includes('Full Name'),
    'Team_Members header contains "Full Name"'
  );

  // Security test: Verify zero cell rows or tokens returned in diagnostic response
  const serialized = JSON.stringify(diagResult);
  assert(!serialized.includes('mock-token-sample'), 'Response contains NO OAuth access token');
  assert(!serialized.includes('ArXiv:2401.0345'), 'Response contains NO live research source rows');
  assert(!serialized.includes('Generate an infographic prompt'), 'Response contains NO prompt snapshots');
}

console.log('\n===============================================================');
console.log(`P04 AUDIT SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED out of ${totalTests} assertions`);
console.log('===============================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
