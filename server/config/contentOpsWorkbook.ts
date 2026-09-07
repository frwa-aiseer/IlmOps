/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  WorkbookSchemaManifest,
  SheetSchemaDefinition,
  SOURCE_QUEUE_REQUIRED_HEADERS,
  APP_CONTENT_JOBS_REQUIRED_HEADERS,
  APP_USERS_REQUIRED_HEADERS,
  MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS,
  BRAND_PROFILES_REQUIRED_HEADERS,
  CONTENT_TYPES_REQUIRED_HEADERS,
  TEAM_MEMBERS_REQUIRED_HEADERS,
  LISTS_CONFIG_REQUIRED_HEADERS,
  APP_ACTIVITY_LOG_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';

// ===========================================================================
// Centralized Server-Side Workbook Configuration Module
// ALLIN Content Operations Hub — Research, Production & KPI
// ===========================================================================

export const WORKBOOK_CONFIG = {
  title: 'ALLIN Content Operations Hub — Research, Production & KPI',
  spreadsheetId: '1X_xbjs3NUsE41foIIBwtu6oHv0q9L97TtZcOFWWvPgk',
  url: 'https://docs.google.com/spreadsheets/d/1X_xbjs3NUsE41foIIBwtu6oHv0q9L97TtZcOFWWvPgk/edit',
  locale: 'en_GB',
  timezone: 'Asia/Karachi',
} as const;

// Stored exactly once in centralized typed configuration
export const SHEET_NAMES = {
  DASHBOARD: 'Dashboard',
  AI_CONTENT_QUEUE: 'AI_Content_Queue',
  ELECTRICAL_CONTENT_QUEUE: 'Electrical_Content_Queue',
  BRAND_PROFILES: 'Brand_Profiles',
  CONTENT_TYPES: 'Content_Types',
  TEAM_MEMBERS: 'Team_Members',
  LISTS_CONFIG: 'Lists_Config',
  MANUAL_SOURCE_ENTRY: 'Manual_Source_Entry',
  APP_CONTENT_JOBS: 'APP_Content_Jobs',
  APP_USERS: 'APP_Users',
  APP_ACTIVITY_LOG: 'APP_Activity_Log',
} as const;

export type SheetName = (typeof SHEET_NAMES)[keyof typeof SHEET_NAMES];

// ===========================================================================
// Typed Schema Manifest
// ===========================================================================
// Declares expected header row, required fields, target entities, and access
// mode for this initial preparation phase (NO external Google API access).

export const SHEET_SCHEMA_DEFINITIONS: Record<SheetName, SheetSchemaDefinition> = {
  [SHEET_NAMES.DASHBOARD]: {
    sheetName: SHEET_NAMES.DASHBOARD,
    expectedHeaderRow: 1,
    entityType: 'DashboardMetrics',
    accessMode: 'NO_EXTERNAL_ACCESS',
    requiredHeaders: [],
    description: 'Aggregated KPI rollups and executive summaries for content ops.',
  },
  [SHEET_NAMES.AI_CONTENT_QUEUE]: {
    sheetName: SHEET_NAMES.AI_CONTENT_QUEUE,
    expectedHeaderRow: 3, // Legacy operational queue uses Row 3 as header row
    entityType: 'ResearchSource',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: SOURCE_QUEUE_REQUIRED_HEADERS,
    description: 'AI & Data Engineering research queue; evaluated by human reviewers.',
  },
  [SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE]: {
    sheetName: SHEET_NAMES.ELECTRICAL_CONTENT_QUEUE,
    expectedHeaderRow: 3, // Legacy operational queue uses Row 3 as header row
    entityType: 'ResearchSource',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: SOURCE_QUEUE_REQUIRED_HEADERS,
    description: 'Electrical Design, Estimation & Energy research queue; evaluated by human reviewers.',
  },
  [SHEET_NAMES.APP_CONTENT_JOBS]: {
    sheetName: SHEET_NAMES.APP_CONTENT_JOBS,
    expectedHeaderRow: 1, // Normalized operational table uses Row 1
    entityType: 'ContentJob',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: APP_CONTENT_JOBS_REQUIRED_HEADERS,
    description: 'Multi-variant production jobs. References ResearchSource via Source URL Key.',
  },
  [SHEET_NAMES.APP_USERS]: {
    sheetName: SHEET_NAMES.APP_USERS,
    expectedHeaderRow: 1,
    entityType: 'AppUser',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: APP_USERS_REQUIRED_HEADERS,
    description: 'System operators and role-based permissions matrix.',
  },
  [SHEET_NAMES.BRAND_PROFILES]: {
    sheetName: SHEET_NAMES.BRAND_PROFILES,
    expectedHeaderRow: 1,
    entityType: 'BrandProfile',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: BRAND_PROFILES_REQUIRED_HEADERS,
    description: 'Supported brand identities (PycodeAI, Farwa Jafar, Muneeb Akhtar).',
  },
  [SHEET_NAMES.CONTENT_TYPES]: {
    sheetName: SHEET_NAMES.CONTENT_TYPES,
    expectedHeaderRow: 1,
    entityType: 'ContentTypeConfig',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: CONTENT_TYPES_REQUIRED_HEADERS,
    description: 'Supported technical content formats and publishing targets.',
  },
  [SHEET_NAMES.TEAM_MEMBERS]: {
    sheetName: SHEET_NAMES.TEAM_MEMBERS,
    expectedHeaderRow: 1,
    entityType: 'TeamMember',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: TEAM_MEMBERS_REQUIRED_HEADERS,
    description: 'Team member metadata, specialties, and avatar mappings.',
  },
  [SHEET_NAMES.LISTS_CONFIG]: {
    sheetName: SHEET_NAMES.LISTS_CONFIG,
    expectedHeaderRow: 1,
    entityType: 'ListsConfig',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: LISTS_CONFIG_REQUIRED_HEADERS,
    description: 'Dynamic dropdown validation values and taxonomy definitions.',
  },
  [SHEET_NAMES.MANUAL_SOURCE_ENTRY]: {
    sheetName: SHEET_NAMES.MANUAL_SOURCE_ENTRY,
    expectedHeaderRow: 3, // Manual reviewer staging queue uses Row 3 as header row
    entityType: 'ManualSourceEntry',
    accessMode: 'CONFIG_ONLY',
    requiredHeaders: MANUAL_SOURCE_ENTRY_REQUIRED_HEADERS,
    description: 'Manual reviewer staging sheet before queue ingestion.',
  },
  [SHEET_NAMES.APP_ACTIVITY_LOG]: {
    sheetName: SHEET_NAMES.APP_ACTIVITY_LOG,
    expectedHeaderRow: 1,
    entityType: 'ActivityLog',
    accessMode: 'NO_EXTERNAL_ACCESS',
    requiredHeaders: APP_ACTIVITY_LOG_REQUIRED_HEADERS,
    description: 'Immutable audit log recording human reviews, approvals, and QC sign-offs.',
  },
};

export const WORKBOOK_SCHEMA_MANIFEST: WorkbookSchemaManifest = {
  workbookTitle: WORKBOOK_CONFIG.title,
  spreadsheetId: WORKBOOK_CONFIG.spreadsheetId,
  locale: WORKBOOK_CONFIG.locale,
  timezone: WORKBOOK_CONFIG.timezone,
  sheets: SHEET_SCHEMA_DEFINITIONS,
};
