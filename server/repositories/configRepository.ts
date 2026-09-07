/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  BrandProfile,
  ContentTypeConfig,
  TeamMember,
  ListsConfig,
  SHEET_NAMES,
  BRAND_PROFILES_REQUIRED_HEADERS,
  CONTENT_TYPES_REQUIRED_HEADERS,
  TEAM_MEMBERS_REQUIRED_HEADERS,
  LISTS_CONFIG_REQUIRED_HEADERS,
} from '../../shared/contracts/contentOps.ts';
import { WORKBOOK_CONFIG, SHEET_SCHEMA_DEFINITIONS } from '../config/contentOpsWorkbook.ts';
import { readOnlyWorkspaceClient, ReadOnlyWorkspaceClient } from '../integrations/googleWorkspace/workspaceClient.ts';
import { validateSheetHeaders } from '../utils/headerMapping.ts';
import {
  mapRowToBrandProfile,
  mapRowToContentTypeConfig,
  mapRowToTeamMember,
  mapRowsToListsConfig,
} from '../mappers/configMapper.ts';
import {
  BRAND_PROFILES_HEADER_ROW_FIXTURE,
  CONTENT_TYPES_HEADER_ROW_FIXTURE,
  TEAM_MEMBERS_HEADER_ROW_FIXTURE,
  LISTS_CONFIG_HEADER_ROW_FIXTURE,
} from '../fixtures/testFixtures.ts';

export class ConfigRepository {
  constructor(
    private client: ReadOnlyWorkspaceClient = readOnlyWorkspaceClient,
    private spreadsheetId: string = WORKBOOK_CONFIG.spreadsheetId
  ) {}

  async getBrandProfiles(options: { accessToken?: string } = {}): Promise<BrandProfile[]> {
    const sheetName = SHEET_NAMES.BRAND_PROFILES;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 1;

    let headers: string[];
    let rawRows: string[][];

    if (options.accessToken) {
      headers = await this.client.fetchSheetHeaders(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        headerRowIndex
      );
      rawRows = await this.client.fetchSheetRowRange(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        2,
        30
      );
    } else {
      headers = BRAND_PROFILES_HEADER_ROW_FIXTURE;
      rawRows = [
        ['PYCODEAI-LINKEDIN', 'PycodeAI LinkedIn', 'PycodeAI', 'LinkedIn', 'AI & Data Engineering', '#0284c7', '#0f172a', 'Inter / Fira Code', 'Technical Diagrams', 'Authoritative Engineering', 'AI Engineers & Architects', '— PycodeAI Engineering', '', 'Max 1 link in comments', '#AI #DataEngineering #MLOps', 'Rigorous code benchmarks only', 'TRUE'],
        ['FARWA-LINKEDIN', 'Farwa Jafar LinkedIn', 'Farwa Jafar', 'LinkedIn', 'AI Research & RAG', '#7c3aed', '#1e1b4b', 'Plus Jakarta Sans', 'Carousel Decks', 'Practitioner Insight', 'AI Practitioners & Researchers', '— Farwa Jafar', '', 'Slide decks 8-10 slides', '#GenerativeAI #RAG #Agents', 'First-person technical tone', 'TRUE'],
        ['MUNEEB-LINKEDIN', 'Muhammad Moneeb Akhtar LinkedIn', 'Moneeb Akhtar', 'LinkedIn', 'Electrical & Power Systems', '#d97706', '#1c1917', 'Public Sans', 'Engineering Schematics', 'Consultant Precision', 'Substation & Power Engineers', '— M. Moneeb Akhtar, PE', '', 'Focus on IEC & IEEE standards', '#ElectricalEngineering #PowerGrid #Substation', 'Reference exact standards clauses', 'TRUE'],
      ];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      BRAND_PROFILES_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    const profiles: BrandProfile[] = [];
    rawRows.forEach((row) => {
      const mapped = mapRowToBrandProfile(row, validation.headerMap);
      if (mapped) profiles.push(mapped);
    });

    return profiles;
  }

  async getContentTypes(options: { accessToken?: string } = {}): Promise<ContentTypeConfig[]> {
    const sheetName = SHEET_NAMES.CONTENT_TYPES;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 1;

    let headers: string[];
    let rawRows: string[][];

    if (options.accessToken) {
      headers = await this.client.fetchSheetHeaders(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        headerRowIndex
      );
      rawRows = await this.client.fetchSheetRowRange(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        2,
        30
      );
    } else {
      headers = CONTENT_TYPES_HEADER_ROW_FIXTURE;
      rawRows = [
        ['Infographic', 'Synthesize key findings into high-density diagram callouts and metric comparisons.', 'Format D2 / Mermaid layout blocks and bullet summary cards.', 'Headline + Problem Statement + Architecture Flow + Takeaways', '350 - 450 words', 'TRUE'],
        ['Carousel', 'Draft 8-10 progressive slides unpacking the core technical breakthrough.', 'Keep slide headlines under 7 words; ensure 1 idea per slide.', 'Hook Slide + Context + Core Mechanism (4 slides) + Benchmarks + Conclusion', '600 - 800 words', 'TRUE'],
        ['Technical Deep-Dive', 'Provide end-to-end technical analysis citing equations, standards, and code implementations.', 'Verify benchmark numbers, citation links, and architectural tradeoffs.', 'Executive Summary + Problem Breakdown + Architecture + Implementation + Takeaways', '1,000 - 1,500 words', 'TRUE'],
      ];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      CONTENT_TYPES_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    const types: ContentTypeConfig[] = [];
    rawRows.forEach((row) => {
      const mapped = mapRowToContentTypeConfig(row, validation.headerMap);
      if (mapped) types.push(mapped);
    });

    return types;
  }

  async getTeamMembers(options: { accessToken?: string } = {}): Promise<TeamMember[]> {
    const sheetName = SHEET_NAMES.TEAM_MEMBERS;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 1;

    let headers: string[];
    let rawRows: string[][];

    if (options.accessToken) {
      headers = await this.client.fetchSheetHeaders(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        headerRowIndex
      );
      rawRows = await this.client.fetchSheetRowRange(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        2,
        30
      );
    } else {
      headers = TEAM_MEMBERS_HEADER_ROW_FIXTURE;
      rawRows = [
        ['Muhammad Moneeb Akhtar', 'Admin & Lead Reviewer', 'TRUE', 'Lead engineering consultant.'],
        ['Farwa Jafar', 'AI Research Lead', 'TRUE', 'Agentic AI and RAG specialist.'],
        ['Munir', 'Electrical Systems Lead', 'TRUE', 'IEC standards and power engineering.'],
        ['Amara Akhtar', 'Content Production Lead', 'TRUE', 'Asset formatting and publishing lead.'],
      ];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      TEAM_MEMBERS_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    const members: TeamMember[] = [];
    rawRows.forEach((row) => {
      const mapped = mapRowToTeamMember(row, validation.headerMap);
      if (mapped) members.push(mapped);
    });

    return members;
  }

  async getListsConfig(options: { accessToken?: string } = {}): Promise<ListsConfig> {
    const sheetName = SHEET_NAMES.LISTS_CONFIG;
    const schemaDef = SHEET_SCHEMA_DEFINITIONS[sheetName];
    const headerRowIndex = schemaDef?.expectedHeaderRow ?? 1;

    let headers: string[];
    let rawRows: string[][];

    if (options.accessToken) {
      headers = await this.client.fetchSheetHeaders(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        headerRowIndex
      );
      rawRows = await this.client.fetchSheetRowRange(
        options.accessToken,
        this.spreadsheetId,
        sheetName,
        2,
        30
      );
    } else {
      headers = LISTS_CONFIG_HEADER_ROW_FIXTURE;
      rawRows = [
        ['approved', 'Conceptual', 'High', 'Backlog', 'Not Started', 'Unscheduled', 'P1', 'Yes'],
        ['rejected', 'Intermediate', 'Medium', 'In Production', 'Pending Review', 'Scheduled', 'P2', 'No'],
        ['hold', 'Deep Dive', 'Low', 'Draft Ready', 'Changes Requested', 'Staged', 'P3', ''],
        ['', '', '', 'Finalizing', 'Approved', 'Published', '', ''],
        ['', '', '', 'QC Review', '', '', '', ''],
        ['', '', '', 'Ready to Publish', '', '', '', ''],
      ];
    }

    const validation = validateSheetHeaders(
      sheetName,
      headers,
      LISTS_CONFIG_REQUIRED_HEADERS,
      headerRowIndex
    );

    if (!validation.isValid) {
      throw new Error(`Sheet schema mismatch for ${sheetName}: ${validation.error}`);
    }

    return mapRowsToListsConfig(rawRows, validation.headerMap);
  }

  async getAllConfig(options: { accessToken?: string } = {}): Promise<{
    brandProfiles: BrandProfile[];
    contentTypes: ContentTypeConfig[];
    teamMembers: TeamMember[];
    listsConfig: ListsConfig;
  }> {
    const [brandProfiles, contentTypes, teamMembers, listsConfig] = await Promise.all([
      this.getBrandProfiles(options),
      this.getContentTypes(options),
      this.getTeamMembers(options),
      this.getListsConfig(options),
    ]);

    return { brandProfiles, contentTypes, teamMembers, listsConfig };
  }
}

export const configRepository = new ConfigRepository();
